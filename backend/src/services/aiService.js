// backend/src/services/aiService.js

const axios = require('axios');

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Sends a command to the AI model to convert natural language into a structured JSON command.
 * Can handle simple commands or commands with a data payload for ingestion.
 * @param {string} command - The natural language command from the user.
 * @param {string} schema - The database schema string.
 * @param {Array<Object>|null} dataPayload - Optional JSON data from a file upload.
 * @returns {Promise<Object|null>} A JSON object with the AI's structured command or null on error.
 */
async function processCommand(command, schema, dataPayload = null) {
  if (!openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in the environment variables.');
  }

  let systemPrompt;
  if (dataPayload) {
    // Advanced prompt for data ingestion
    const dataSample = JSON.stringify(dataPayload.slice(0, 3)); // Provide a sample of the data
    systemPrompt = `You are a data ingestion specialist. Your ONLY output must be a single, minified, stringified JSON object. Do not add any other text, explanations, or markdown formatting.

The user has provided a command: "${command}"
And a file with the following data structure (sample of first 3 rows): ${dataSample}

The available database schema is: ${schema}

Your task is to generate a single, efficient, multi-value PostgreSQL INSERT statement to add this data to the most appropriate table based on the schema and the user's intent. Map the JSON keys to the correct database columns. The entire output must be a single line of stringified JSON in the format:
{"action": "confirm_write", "payload": "INSERT INTO your_table (col1, col2) VALUES ('val1', 'val2'), ('val3', 'val4'), ...;"}

If you cannot determine the correct table or mapping, return:
{"action": "error", "payload": "Could not automatically map the uploaded data to a table. Please provide more specific instructions."}`;
  } else {
    // Standard prompt for queries and UI actions
    systemPrompt = `You are a secure and efficient SQL and UI assistant. Your ONLY output must be a single, minified, stringified JSON object. Do not add any other text or markdown formatting.
The database schema is: ${schema}
Based on the user's command, generate a JSON object with one of the following actions: "run_select", "confirm_write", "open_ui", or "error".
Ensure the SQL is valid for PostgreSQL. The entire output must be a single line of stringified JSON.`;
  }
  
  const userMessageContent = dataPayload 
    ? `Command: "${command}"\nFull Data: ${JSON.stringify(dataPayload)}`
    : command;

  try {
    const response = await axios.post(
      openRouterUrl,
      {
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessageContent },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = response.data.choices[0].message.content;
    return JSON.parse(result);
  } catch (error) {
    console.error('Error processing command with AI service:', error.response ? error.response.data : error.message);
    return { action: 'error', payload: 'An error occurred while communicating with the AI service.' };
  }
}

module.exports = { processCommand };