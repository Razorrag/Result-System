// File: src/app/api/command/route.js

import { NextResponse } from 'next/server';
import { getDatabaseSchema, executeQuery } from '@/lib/services/supabaseService';
import { processCommand } from '@/lib/services/aiService';

// This is a special Next.js setting to prevent caching of API responses.
export const dynamic = 'force-dynamic';

async function handleAiCommand(payload) {
    const schema = await getDatabaseSchema();
    if (!schema) {
        throw new Error("Could not retrieve database schema.");
    }
    const aiResponse = await processCommand(payload.command, schema, payload.data);
    
    // The AI service can return different actions. We handle them here.
    switch (aiResponse.action) {
        case 'run_select': {
            const { data, error } = await executeQuery(aiResponse.payload);
            if (error || (data && data.error)) {
                throw new Error(error?.message || data.error);
            }
            return { status: 'query_result', query: aiResponse.payload, data: data };
        }
        case 'confirm_write': {
            return { status: 'write_confirmation', query: aiResponse.payload };
        }
        case 'open_ui': {
            return { status: 'ui_action', view: aiResponse.payload };
        }
        case 'error': {
             throw new Error(aiResponse.payload);
        }
        default:
            throw new Error('Invalid AI response action.');
    }
}

async function handleManualQuery(payload) {
    const { data, error } = await executeQuery(payload.query);
    if (error || (data && data.error)) {
        throw new Error(error?.message || data.error);
    }
    // The result from our RPC function is already the data array we need.
    return { status: 'query_result', query: payload.query, data: data };
}

async function handleConfirmedWrite(payload) {
    const { data, error } = await executeQuery(payload.query);
     if (error || (data && data.error)) {
        throw new Error(error?.message || data.error);
    }
    return { status: 'query_success', message: 'Write operation successful.' };
}


export async function POST(request) {
  try {
    const { action, payload } = await request.json();
    let result;

    switch (action) {
      case 'user-command':
        result = await handleAiCommand(payload);
        break;

      case 'manual-sql-execute':
        result = await handleManualQuery(payload);
        break;

      case 'execute-confirmed-write':
        result = await handleConfirmedWrite(payload);
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    return NextResponse.json(result);

  } catch (e) {
    console.error("API Error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}