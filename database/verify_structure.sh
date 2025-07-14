#!/bin/bash

echo "🔍 Verifica struttura database Finance Tracker..."
echo "================================================"

DB_PATH="/Users/andreazampierolo/Projects/Bud-Jet/database/finance-tracker-db.sqlite"

if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database non trovato: $DB_PATH"
    exit 1
fi

echo "📋 TABELLE NEL DATABASE:"
echo "========================"
sqlite3 "$DB_PATH" ".tables"

echo ""
echo "📊 STRUTTURA TABELLA Transaction:"
echo "=================================="
sqlite3 "$DB_PATH" ".schema \"Transaction\""

echo ""
echo "📊 STRUTTURA TABELLA Category:"
echo "=============================="
sqlite3 "$DB_PATH" ".schema \"Category\""

echo ""
echo "📈 CONTEGGIO RECORD:"
echo "==================="
echo "Transazioni:"
sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM \"Transaction\";"
echo "Categorie:"
sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM \"Category\";"

echo ""
echo "✅ Verifica completata!"