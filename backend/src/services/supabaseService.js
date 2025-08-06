// backend/src/services/supabaseService.js

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with the SERVICE KEY for admin-level access
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Fetches the schema of the public tables in the database.
 * Formats the schema into a compact string for the AI prompt.
 * @returns {Promise<string|null>} A string representing the database schema or null if an error occurs.
 * Example output: "profiles(id, name, role); students(id, name, roll_number);"
 */
async function getDatabaseSchema() {
  console.log("Fetching database schema...");

  // Use an RPC call to a PostgreSQL function for more robust schema fetching.
  // In your Supabase SQL Editor, create this function:
  /*
    CREATE OR REPLACE FUNCTION get_schema_details()
    RETURNS TABLE(table_name TEXT, schema_info TEXT) AS $$
    BEGIN
      RETURN QUERY
      SELECT
        t.table_name::TEXT,
        string_agg(c.column_name || ' (' || c.data_type || ')', ', ' ORDER BY c.ordinal_position)::TEXT AS schema_info
      FROM
        information_schema.tables t
      JOIN
        information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
      WHERE
        t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
      GROUP BY
        t.table_name;
    END;
    $$ LANGUAGE plpgsql;
  */
  const { data, error } = await supabase.rpc('get_schema_details');

  if (error) {
    console.error('Error fetching database schema:', error.message);
    return null;
  }

  if (!data || data.length === 0) {
    console.log("No tables found in the public schema.");
    return "";
  }
  
  // Format the schema string for the AI prompt
  const schemaString = data
    .map(table => `${table.table_name}(${table.schema_info})`)
    .join('; ');

  console.log("Schema fetched successfully.");
  return schemaString;
}