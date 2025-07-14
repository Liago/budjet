#!/bin/bash

echo "🚀 Avvio esportazione database Finance Tracker..."
echo "================================================"

DB_PATH="/Users/andreazampierolo/Projects/Bud-Jet/database/finance-tracker-db.sqlite"
OUTPUT_PATH="/Users/andreazampierolo/Desktop/expense_export.csv"
SCRIPT_PATH="/Users/andreazampierolo/Projects/Bud-Jet/database/export_script.sql"

# Verifica esistenza database
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database non trovato: $DB_PATH"
    exit 1
fi

# Verifica esistenza sqlite3
if ! command -v sqlite3 &> /dev/null; then
    echo "❌ sqlite3 non trovato. Installalo con:"
    echo "   macOS: brew install sqlite"
    echo "   Ubuntu: sudo apt-get install sqlite3"
    exit 1
fi

echo "📁 Database: $DB_PATH"
echo "📄 Output: $OUTPUT_PATH"
echo "📜 Script: $SCRIPT_PATH"
echo ""

# Esegui lo script SQL
echo "⚙️  Esecuzione query di esportazione..."
sqlite3 "$DB_PATH" < "$SCRIPT_PATH"

# Controlla se il file è stato creato
if [ -f "$OUTPUT_PATH" ]; then
    echo ""
    echo "🎉 Esportazione completata con successo!"
    echo "📄 File CSV creato: $OUTPUT_PATH"
    
    # Conta le righe (escludendo l'header)
    TOTAL_ROWS=$(($(wc -l < "$OUTPUT_PATH") - 1))
    echo "📊 Transazioni esportate: $TOTAL_ROWS"
    
    # Calcola la dimensione del file
    FILE_SIZE=$(ls -lh "$OUTPUT_PATH" | awk '{print $5}')
    echo "📦 Dimensione file: $FILE_SIZE"
    
    echo ""
    echo "👀 Anteprima primi 5 record:"
    echo "=============================="
    head -6 "$OUTPUT_PATH"
    
    echo ""
    echo "🔍 Ultime 3 transazioni:"
    echo "========================"
    tail -3 "$OUTPUT_PATH"
    
else
    echo "❌ Errore: file CSV non creato"
    echo "Controlla i permessi e la validità del database"
    exit 1
fi

echo ""
echo "✅ Processo completato!"
echo "Il file CSV è pronto per l'uso nel formato richiesto:"
echo "   Date, Category, Amount"