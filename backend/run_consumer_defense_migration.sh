#!/bin/bash
psql "$DATABASE_URL" < migrations/add_consumer_defense_tables.sql
echo "Migration complete!"
