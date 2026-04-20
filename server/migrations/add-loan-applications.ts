import { pool } from "../db.js";

export async function addLoanApplications() {
  const client = await pool.connect();
  try {
    // loan_application_status enum
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE loan_application_status AS ENUM ('pending', 'activated', 'rejected');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // loan_applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS loan_applications (
        id              VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         VARCHAR NOT NULL REFERENCES users(id),
        loan_type       TEXT NOT NULL,
        amount          REAL NOT NULL,
        duration        INTEGER NOT NULL,
        currency        TEXT NOT NULL DEFAULT 'CHF',
        purpose         TEXT,
        monthly_payment REAL,
        status          loan_application_status NOT NULL DEFAULT 'pending',
        admin_note      TEXT,
        activated_at    TIMESTAMP,
        loan_id         VARCHAR,
        created_at      TIMESTAMP DEFAULT NOW()
      );
    `);

    // loan_steps extra columns (safe on re-run)
    await client.query(`
      ALTER TABLE loan_steps
        ADD COLUMN IF NOT EXISTS additional_info_enabled  BOOLEAN   DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS additional_info_message  TEXT,
        ADD COLUMN IF NOT EXISTS client_response          TEXT,
        ADD COLUMN IF NOT EXISTS client_responded_at      TIMESTAMP;
    `);

    console.log("Migration loan_applications + loan_steps columns : OK");
  } catch (err) {
    console.error("Migration loan_applications error:", err);
  } finally {
    client.release();
  }
}
