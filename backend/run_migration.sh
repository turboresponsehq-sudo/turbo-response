#!/bin/bash
# Run migration to add amount and deadline columns

echo "Running migration: add_amount_deadline.sql"
psql $DATABASE_URL < migrations/add_amount_deadline.sql
echo "Migration complete!"
