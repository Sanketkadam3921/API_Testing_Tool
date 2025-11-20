#!/bin/bash

# Run the monitor failure tracking migration
# Usage: ./run-migration.sh

echo "🔄 Running database migration for email notifications..."

if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Please run:"
    echo "   export DATABASE_URL='postgresql://user:password@localhost:5432/apitesting'"
    exit 1
fi

psql $DATABASE_URL -f database/migrations/005_add_monitor_failure_tracking.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "Email notifications are now fully configured!"
else
    echo "❌ Migration failed. Please check your DATABASE_URL and try again."
    exit 1
fi





