import { config } from "dotenv";
import { createClient } from "@libsql/client";

config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function addAdminEmail(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    await client.execute({
      sql: "INSERT INTO admin_emails (email, created_at) VALUES (?, ?)",
      args: [normalizedEmail, Date.now()],
    });
    console.log(`✓ Added admin email: ${normalizedEmail}`);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
      console.log(`Email ${normalizedEmail} is already whitelisted`);
    } else {
      throw error;
    }
  }
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx tsx scripts/add-admin-email.ts <email>");
  process.exit(1);
}

addAdminEmail(email).catch(console.error);
