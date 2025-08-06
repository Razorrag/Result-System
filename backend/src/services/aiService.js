// backend/src/services/aiService.js

const axios = require('axios');

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Sends a command to the AI model to convert natural language into a structured JSON command.
 * @param {string} command - The natural language command from the user.
 * @param {string} schema - The database schema string.
 * @returns {Promise<Object|null>} A JSON object with the AI's structured command or null on error.
 */
async function processCommand(command, schema) {
  if (!openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in the environment variables.');
  }

  const systemPrompt = `You are a secure and efficient SQL and UI assistant for a custom admin panel. Your ONLY output must be a single, minified, stringified JSON object. Do not add any other text, explanations, or markdown formatting.

The database schema is: ${schema}

Based on the user's command, you must determine the correct action and generate a JSON object with one of the following structures:
1. For viewing data: {"action": "run_select", "payload": "SELECT * FROM profiles WHERE role = 'admin';"}
2. For changing data (insert, update, delete): {"action": "confirm_write", "payload": "INSERT INTO students (name) VALUES ('John');"}
3. For UI actions (like opening an editor or table view): {"action": "open_ui", "payload": "sql_editor"} or {"action": "open_ui", "payload": "table_viewer:profiles"}
4. If you cannot determine the action or it is unsafe (like DROP TABLE): {"action": "error", "payload": "I cannot perform that action."}
5. If the user asks for their own identity or session details: {"action": "error", "payload": "I am an AI assistant and do not have access to your identity or session information."}

Ensure the SQL is valid for PostgreSQL. The entire output must be a single line of stringified JSON.`;

  try {
    const response = await axios.post(
      openRouterUrl,
      {
        model: 'deepseek/deepseek-chat', // Using the specified free model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: command },
        ],
        stream: false,
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = response.data.choices[0].message.content;
    // The AI is instructed to return a stringified JSON, so we parse it.
    return JSON.parse(result);
  } catch (error) {
    console.error('Error processing command with AI service:', error.response ? error.response.data : error.message);
    return { action: 'error', payload: 'An error occurred while communicating with the AI service.' };
  }
}

module.exports = { processCommand };