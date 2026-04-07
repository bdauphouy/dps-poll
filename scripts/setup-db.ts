import { config } from "dotenv";
import { createClient } from "@libsql/client";

config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function setupDatabase() {
  console.log("Creating tables in Turso...");

  // Create page_views table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS page_views (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      poll_id text,
      ip_address text,
      country text,
      city text,
      user_agent text,
      created_at integer NOT NULL
    )
  `);
  console.log("✓ Created page_views table");

  // Add poll_id column if it doesn't exist (migration)
  try {
    await client.execute(`ALTER TABLE page_views ADD COLUMN poll_id text`);
    console.log("✓ Added poll_id column to page_views table");
  } catch {
    // Column already exists
  }

  // Create polls table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS polls (
      id text PRIMARY KEY NOT NULL,
      title text NOT NULL,
      description text,
      status text DEFAULT 'draft' NOT NULL,
      created_at integer NOT NULL
    )
  `);
  console.log("✓ Created polls table");

  // Add status column if it doesn't exist (migration)
  try {
    await client.execute(`ALTER TABLE polls ADD COLUMN status text DEFAULT 'draft' NOT NULL`);
    console.log("✓ Added status column to polls table");
  } catch {
    // Column already exists
  }

  // Add logo_url column if it doesn't exist (migration)
  try {
    await client.execute(`ALTER TABLE polls ADD COLUMN logo_url text`);
    console.log("✓ Added logo_url column to polls table");
  } catch {
    // Column already exists
  }

  // Remove is_active column if it exists (migration)
  // SQLite doesn't support DROP COLUMN easily, so we skip this

  // Create poll_questions table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS poll_questions (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      poll_id text NOT NULL,
      type text NOT NULL,
      question text NOT NULL,
      options text,
      required integer DEFAULT 1 NOT NULL,
      order_index integer NOT NULL,
      FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
    )
  `);
  console.log("✓ Created poll_questions table");

  // Create poll_responses table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS poll_responses (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      poll_id text NOT NULL,
      answers text NOT NULL,
      ip_address text,
      country text,
      city text,
      created_at integer NOT NULL,
      FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
    )
  `);
  console.log("✓ Created poll_responses table");

  // Create admin_emails table (whitelist for OTP authentication)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS admin_emails (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      email text NOT NULL UNIQUE,
      created_at integer NOT NULL
    )
  `);
  console.log("✓ Created admin_emails table");

  // Create otp_codes table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      email text NOT NULL,
      code text NOT NULL,
      expires_at integer NOT NULL,
      used integer DEFAULT 0 NOT NULL,
      created_at integer NOT NULL
    )
  `);
  console.log("✓ Created otp_codes table");

  console.log("Database setup complete!");
  console.log("");
  console.log("To add an admin email, run:");
  console.log("  turso db shell <your-db-name>");
  console.log("  INSERT INTO admin_emails (email, created_at) VALUES ('your@email.com', strftime('%s', 'now') * 1000);");
}

setupDatabase().catch(console.error);
