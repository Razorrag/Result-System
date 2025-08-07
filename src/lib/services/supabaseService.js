// file: src/lib/services/supabaseService.js

// Using 'import' is more modern than 'require' in Next.js projects.
import { createClient } from '@supabase/supabase-js';

// These keys are now read from your project's .env.local file
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // This is kept secret and only available on the server
);

async function getDatabaseSchema() {
  console.log("Fetching database schema...");
  const { data, error } = await supabase.rpc('get_schema_details');

  if (error) {
    console.error('Error fetching database schema:', error.message);
    return null;
  }
  if (!data || data.length === 0) {
    console.log("No tables found in the public schema.");
    return "";
  }
  const schemaString = data
    .map(table => `${table.table_name}(${table.schema_info})`)
    .join('; ');

  console.log("Schema fetched successfully.");
  return schemaString;
}

async function executeQuery(sqlQuery) {
  console.log(`Executing query: ${sqlQuery}`);
  
  // The RPC function remains the same.
  const { data, error } = await supabase.rpc('execute_dynamic_sql', { query: sqlQuery });

  // Improved error handling
  if (error) {
    console.error('Supabase RPC error:', error);
    throw new Error(error.message);
  }

  // Our RPC function returns the data directly inside the 'data' property
  return { data: data, error: null };
}

// Use ES module exports
export { supabase, getDatabaseSchema, executeQuery };