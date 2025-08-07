// backend/src/services/supabaseService.js

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
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

/**
 * Executes a raw SQL query against the database.
 * Uses a dedicated, generic RPC function for safety and clarity.
 * @param {string} sqlQuery - The SQL query to execute.
 * @returns {Promise<{data: any, error: any}>} The result of the query.
 */
async function executeQuery(sqlQuery) {
  console.log(`Executing query: ${sqlQuery}`);

  // Create this RPC function in your Supabase SQL Editor for security.
  // It allows executing dynamic queries safely from the trusted backend.
  /*
    CREATE OR REPLACE FUNCTION execute_dynamic_sql(query TEXT)
    RETURNS JSONB AS $$
    DECLARE
        result JSONB;
    BEGIN
        EXECUTE 'SELECT jsonb_agg(t) FROM (' || query || ') t' INTO result;
        RETURN result;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error executing query: %', SQLERRM;
        RETURN jsonb_build_object('error', SQLERRM);
    END;
    $$ LANGUAGE plpgsql;
  */
  return await supabase.rpc('execute_dynamic_sql', { query: sqlQuery });
}

module.exports = { supabase, getDatabaseSchema, executeQuery };