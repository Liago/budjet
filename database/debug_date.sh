#!/bin/bash

DB_PATH="/Users/andreazampierolo/Projects/Bud-Jet/database/finance-tracker-db.sqlite"
SCRIPT_PATH="/Users/andreazampierolo/Projects/Bud-Jet/database/debug_date.sql"

echo "🔍 Debug del database Finance Tracker..."
echo "========================================"

if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database non trovato: $DB_PATH"
    exit 1
fi

echo "📁 Database: $DB_PATH"
echo "📜 Script debug: $SCRIPT_PATH"
echo ""

# Esegui lo script di debug
sqlite3 "$DB_PATH" < "$SCRIPT_PATH"

echo ""
echo "✅ Debug completato!"