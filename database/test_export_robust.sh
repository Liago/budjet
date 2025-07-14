#!/bin/bash

echo "🚀 Test esportazione ROBUSTA - Finance Tracker..."
echo "================================================="

DB_PATH="/Users/andreazampierolo/Projects/Bud-Jet/database/finance-tracker-db.sqlite"
OUTPUT_PATH="/Users/andreazampierolo/Desktop/expense_export_test.csv"
SCRIPT_PATH="/Users/andreazampierolo/Projects/Bud-Jet/database/export_script_robust.sql"

# Verifica esistenza database
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database non trovato: $DB_PATH"
    exit 1
fi

echo "📁 Database: $DB_PATH"
echo "📄 Output: $OUTPUT_PATH"
echo "📜 Script: $SCRIPT_PATH (versione robusta)"
echo ""

# Esegui lo script SQL robusto
echo "⚙️  Esecuzione query di esportazione robusta..."

# Prima modifichiamo il path di output nello script
sed "s|/Users/andreazampierolo/Desktop/expense_export.csv|$OUTPUT_PATH|g" "$SCRIPT_PATH" > "/tmp/export_temp.sql"

sqlite3 "$DB_PATH" < "/tmp/export_temp.sql"

# Cleanup
rm -f "/tmp/export_temp.sql"

# Controlla se il file è stato creato
if [ -f "$OUTPUT_PATH" ]; then
    echo ""
    echo "🎉 Esportazione ROBUSTA completata!"
    echo "📄 File CSV creato: $OUTPUT_PATH"
    
    # Conta le righe (escludendo l'header)
    TOTAL_ROWS=$(($(wc -l < "$OUTPUT_PATH") - 1))
    echo "📊 Transazioni esportate: $TOTAL_ROWS"
    
    echo ""
    echo "👀 Anteprima primi 10 record:"
    echo "============================="
    head -11 "$OUTPUT_PATH"
    
else
    echo "❌ Errore: file CSV non creato"
    exit 1
fi

echo ""
echo "✅ Test completato!"