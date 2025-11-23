import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function migrate() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  // First, connect to postgres database to create our database
  const postgresConnectionString = connectionString.replace(
    /\/[^/]+$/,
    "/postgres"
  );

  console.log("Checking if database exists...");
  const adminPool = new Pool({ connectionString: postgresConnectionString });

  try {
    // Check if database exists, create if not
    const dbCheckResult = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'poker_planning'"
    );

    if (dbCheckResult.rows.length === 0) {
      console.log("Creating database poker_planning...");
      await adminPool.query("CREATE DATABASE poker_planning");
      console.log("✅ Database created successfully!");
    } else {
      console.log("Database poker_planning already exists.");
    }
  } catch (error) {
    console.error("Error checking/creating database:", error);
  } finally {
    await adminPool.end();
  }

  // Now connect to the actual database and run migrations
  console.log("Connecting to poker_planning database...");
  const pool = new Pool({ connectionString });

  try {
    // Read the schema file
    const schemaPath = join(process.cwd(), "db", "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");

    console.log("Running database migration...");

    // Execute the schema
    await pool.query(schema);

    console.log("✅ Migration completed successfully!");

    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("\nCreated tables:");
    result.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    // Verify functions were created
    const functionsResult = await pool.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      ORDER BY routine_name
    `);

    console.log("\nCreated functions:");
    functionsResult.rows.forEach((row) => {
      console.log(`  - ${row.routine_name}`);
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log("\nDatabase connection closed");
  }
}

migrate();
