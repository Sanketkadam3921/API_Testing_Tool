#!/usr/bin/env node

/**
 * Fix Database - Create Missing Tables
 * This script creates the missing database tables that are required by the application
 */

import pool from "./src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

async function fixDatabase(options = {}) {
  const { closePool = true } = options;
  try {
    console.log("🔧 Fixing database schema...\n");

    // Create users table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "password" TEXT NOT NULL,
                "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "users_pkey" PRIMARY KEY ("id")
            );
        `);
    console.log("✅ Created/verified users table");

    // Create unique index on email
    await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
        `);
    console.log("✅ Created/verified users email index");

    // Create tests table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS "tests" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "method" TEXT NOT NULL,
                "url" TEXT NOT NULL,
                "headers" JSONB NOT NULL DEFAULT '[]',
                "body" TEXT DEFAULT '',
                "user_id" TEXT NOT NULL,
                "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
            );
        `);
    console.log("✅ Created/verified tests table");

    // Create monitors table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS "monitors" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "description" TEXT,
                "request_id" TEXT NOT NULL,
                "user_id" TEXT NOT NULL,
                "interval_min" INTEGER NOT NULL DEFAULT 5,
                "threshold_ms" INTEGER NOT NULL DEFAULT 500,
                "is_active" BOOLEAN NOT NULL DEFAULT true,
                "last_run" TIMESTAMP(3),
                "next_run" TIMESTAMP(3),
                "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "monitors_pkey" PRIMARY KEY ("id")
            );
        `);
    console.log("✅ Created/verified monitors table");

    // Add consecutive_failures column if it doesn't exist
    await pool.query(`
            ALTER TABLE monitors 
            ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS last_email_sent TIMESTAMP,
            ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;
        `);
    console.log(
      "✅ Added consecutive_failures and email notification columns to monitors"
    );

    // Create alerts table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS "alerts" (
                "id" TEXT NOT NULL,
                "monitor_id" TEXT NOT NULL,
                "message" TEXT NOT NULL,
                "severity" TEXT NOT NULL DEFAULT 'warning',
                "is_read" BOOLEAN NOT NULL DEFAULT false,
                "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
            );
        `);
    console.log("✅ Created/verified alerts table");

    // Create metrics table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS "metrics" (
                "id" TEXT NOT NULL,
                "monitor_id" TEXT NOT NULL,
                "response_time" INTEGER NOT NULL,
                "status_code" INTEGER NOT NULL,
                "success" BOOLEAN NOT NULL,
                "error_message" TEXT,
                "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
            );
        `);
    console.log("✅ Created/verified metrics table");

    // Create collections table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS "collections" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "description" TEXT,
                "user_id" TEXT NOT NULL,
                "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
            );
        `);
    console.log("✅ Created/verified collections table");

    // Create folders table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS "folders" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "description" TEXT,
                "collection_id" TEXT NOT NULL,
                "parent_id" TEXT,
                "order" INTEGER NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
            );
        `);
    console.log("✅ Created/verified folders table");

    // Create requests table
    await pool.query(`
            CREATE TABLE IF NOT EXISTS "requests" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "method" TEXT NOT NULL DEFAULT 'GET',
                "url" TEXT NOT NULL,
                "headers" JSONB NOT NULL DEFAULT '[]',
                "body" TEXT DEFAULT '',
                "params" JSONB NOT NULL DEFAULT '[]',
                "description" TEXT,
                "collection_id" TEXT,
                "folder_id" TEXT,
                "order" INTEGER NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
            );
        `);
    console.log("✅ Created/verified requests table");

    // Fix existing data - create default user if collections exist with invalid user_id
    console.log("\n🔧 Fixing existing data...");
    // Check if collections table has any rows with invalid user_id
    try {
      const collectionsCheck = await pool.query(
        "SELECT DISTINCT user_id FROM collections WHERE user_id NOT IN (SELECT id FROM users)"
      );
    if (collectionsCheck.rows.length > 0) {
      const defaultUserId = "default-user-id";
      const defaultUserEmail = "default@apitesting.local";
      const defaultUserName = "Default User";
      // Check if default user exists
      const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [
        defaultUserId,
      ]);
      if (userCheck.rows.length === 0) {
        // Create default user with a dummy password hash
        const bcrypt = await import("bcrypt");
        const hashedPassword = await bcrypt.default.hash(
          "default-password-not-for-production",
          10
        );
        await pool.query(
          `
                    INSERT INTO users (id, name, email, password, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, NOW(), NOW())
                    ON CONFLICT (id) DO NOTHING
                `,
          [defaultUserId, defaultUserName, defaultUserEmail, hashedPassword]
        );
        console.log("✅ Created default user");
      }
      // Update collections to use default user
      await pool.query(
        "UPDATE collections SET user_id = $1 WHERE user_id NOT IN (SELECT id FROM users)",
        [defaultUserId]
      );
      console.log("✅ Updated collections to use default user");
    } catch (error) {
      // If collections table doesn't exist or query fails, skip this step
      if (error.code === '42P01') {
        console.log("ℹ️  Collections table doesn't exist yet, skipping data fix");
      } else {
        throw error;
      }
    }

    // Add foreign keys if they don't exist
    console.log("\n🔗 Adding foreign key constraints...");

    // Collections -> Users
    await pool.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'collections_user_id_fkey'
                ) THEN
                    ALTER TABLE "collections" 
                    ADD CONSTRAINT "collections_user_id_fkey" 
                    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
    console.log("✅ Added collections -> users foreign key");

    // Tests -> Users
    await pool.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'tests_user_id_fkey'
                ) THEN
                    ALTER TABLE "tests" 
                    ADD CONSTRAINT "tests_user_id_fkey" 
                    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
    console.log("✅ Added tests -> users foreign key");

    // Monitors -> Requests
    await pool.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'monitors_request_id_fkey'
                ) THEN
                    ALTER TABLE "monitors" 
                    ADD CONSTRAINT "monitors_request_id_fkey" 
                    FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
    console.log("✅ Added monitors -> requests foreign key");

    // Monitors -> Users
    await pool.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'monitors_user_id_fkey'
                ) THEN
                    ALTER TABLE "monitors" 
                    ADD CONSTRAINT "monitors_user_id_fkey" 
                    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
    console.log("✅ Added monitors -> users foreign key");

    // Alerts -> Monitors
    await pool.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'alerts_monitor_id_fkey'
                ) THEN
                    ALTER TABLE "alerts" 
                    ADD CONSTRAINT "alerts_monitor_id_fkey" 
                    FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
    console.log("✅ Added alerts -> monitors foreign key");

    // Metrics -> Monitors
    await pool.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'metrics_monitor_id_fkey'
                ) THEN
                    ALTER TABLE "metrics" 
                    ADD CONSTRAINT "metrics_monitor_id_fkey" 
                    FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
    console.log("✅ Added metrics -> monitors foreign key");

    // Folders -> Collections
    await pool.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'folders_collection_id_fkey'
                ) THEN
                    ALTER TABLE "folders" 
                    ADD CONSTRAINT "folders_collection_id_fkey" 
                    FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
    console.log("✅ Added folders -> collections foreign key");

    // Folders -> Folders (self-reference for parent_id)
    await pool.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'folders_parent_id_fkey'
                ) THEN
                    ALTER TABLE "folders" 
                    ADD CONSTRAINT "folders_parent_id_fkey" 
                    FOREIGN KEY ("parent_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
    console.log("✅ Added folders -> folders foreign key");

    // Requests -> Collections
    await pool.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'requests_collection_id_fkey'
                ) THEN
                    ALTER TABLE "requests" 
                    ADD CONSTRAINT "requests_collection_id_fkey" 
                    FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
    console.log("✅ Added requests -> collections foreign key");

    // Requests -> Folders
    await pool.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'requests_folder_id_fkey'
                ) THEN
                    ALTER TABLE "requests" 
                    ADD CONSTRAINT "requests_folder_id_fkey" 
                    FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
    console.log("✅ Added requests -> folders foreign key");

    // Create indexes
    console.log("\n📊 Creating indexes...");

    await pool.query(`
            CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
        `);
    await pool.query(`
            CREATE INDEX IF NOT EXISTS "monitors_user_id_idx" ON "monitors"("user_id");
        `);
    await pool.query(`
            CREATE INDEX IF NOT EXISTS "monitors_is_active_next_run_idx" ON "monitors"("is_active", "next_run");
        `);
    await pool.query(`
            CREATE INDEX IF NOT EXISTS "monitors_request_id_idx" ON "monitors"("request_id");
        `);
    await pool.query(`
            CREATE INDEX IF NOT EXISTS "alerts_monitor_id_idx" ON "alerts"("monitor_id");
        `);
    await pool.query(`
            CREATE INDEX IF NOT EXISTS "alerts_monitor_id_is_read_idx" ON "alerts"("monitor_id", "is_read");
        `);
    await pool.query(`
            CREATE INDEX IF NOT EXISTS "alerts_created_at_idx" ON "alerts"("created_at");
        `);
    await pool.query(`
            CREATE INDEX IF NOT EXISTS "metrics_monitor_id_idx" ON "metrics"("monitor_id");
        `);
    await pool.query(`
            CREATE INDEX IF NOT EXISTS "metrics_monitor_id_created_at_idx" ON "metrics"("monitor_id", "created_at");
        `);
    await pool.query(`
            CREATE INDEX IF NOT EXISTS "metrics_created_at_idx" ON "metrics"("created_at");
        `);
    await pool.query(`
            CREATE INDEX IF NOT EXISTS "collections_user_id_idx" ON "collections"("user_id");
        `);
    await pool.query(`
            CREATE INDEX IF NOT EXISTS "folders_collection_id_idx" ON "folders"("collection_id");
        `);
    await pool.query(`
            CREATE INDEX IF NOT EXISTS "folders_parent_id_idx" ON "folders"("parent_id");
        `);
    await pool.query(`
            CREATE INDEX IF NOT EXISTS "requests_collection_id_idx" ON "requests"("collection_id");
        `);
    await pool.query(`
            CREATE INDEX IF NOT EXISTS "requests_folder_id_idx" ON "requests"("folder_id");
        `);
    console.log("✅ Created all indexes");

    console.log("\n🎉 Database schema fixed successfully!");
    console.log("\n📋 Summary:");
    console.log(
      "   - Created missing tables: users, tests, monitors, alerts, metrics, collections, folders, requests"
    );
    console.log("   - Added foreign key constraints");
    console.log("   - Created necessary indexes");
    console.log("\n✨ Your backend should now work correctly!");
  } catch (error) {
    console.error("❌ Error fixing database:", error.message);
    console.error(error);
    if (closePool) {
      await pool.end();
    }
    throw error; // Re-throw so the caller can handle it
  } finally {
    if (closePool) {
      await pool.end();
    }
  }
}

// Run the fix if called directly (not imported)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('fix-database.js')) {
  fixDatabase({ closePool: true })
    .then(() => {
      console.log("\n✅ Database setup complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Database setup failed:", error);
      process.exit(1);
    });
}

export default fixDatabase;
