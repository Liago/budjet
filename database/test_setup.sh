#!/bin/bash

echo "🧪 Test di Configurazione Database Export"
echo "========================================"

DB_PATH="/Users/andreazampierolo/Projects/Bud-Jet/database/finance-tracker-db.sqlite"
SCRIPT_PATH="/Users/andreazampierolo/Projects/Bud-Jet/database/export_script.sql"

# Test 1: Verifica esistenza database
echo "📋 Test 1: Verifica esistenza database..."
if [ -f "$DB_PATH" ]; then
    echo "  ✅ Database trovato"
    FILE_SIZE=$(ls -lh "$DB_PATH" | awk '{print $5}')
    echo "  📦 Dimensione: $FILE_SIZE"
else
    echo "  ❌ Database non trovato in $DB_PATH"
    exit 1
fi

# Test 2: Verifica sqlite3
echo "📋 Test 2: Verifica sqlite3..."
if command -v sqlite3 &> /dev/null; then
    SQLITE_VERSION=$(sqlite3 --version | cut -d' ' -f1)
    echo "  ✅ sqlite3 trovato (versione: $SQLITE_VERSION)"
else
    echo "  ❌ sqlite3 non installato"
    echo "  💡 Installa con: brew install sqlite (macOS) o apt-get install sqlite3 (Ubuntu)"
    exit 1
fi

# Test 3: Verifica struttura database
echo "📋 Test 3: Verifica struttura database..."
TABLES=$(sqlite3 "$DB_PATH" ".tables" 2>/dev/null)
if [[ $TABLES == *"Transaction"* ]]; then
    echo "  ✅ Tabella Transaction trovata"
else
    echo "  ❌ Tabella Transaction non trovata"
    echo "  📋 Tabelle disponibili: $TABLES"
fi

if [[ $TABLES == *"Category"* ]]; then
    echo "  ✅ Tabella Category trovata"
else
    echo "  ⚠️  Tabella Category non trovata"
fi

# Test 4: Conta transazioni
echo "📋 Test 4: Conta transazioni..."
TRANSACTION_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM Transaction WHERE userId = '4e386ff4-924f-477d-9126-f55bbe0cde81';" 2>/dev/null)
if [ "$TRANSACTION_COUNT" -gt 0 ]; then
    echo "  ✅ Trovate $TRANSACTION_COUNT transazioni per l'utente"
else
    echo "  ⚠️  Nessuna transazione trovata per l'utente specificato"
    TOTAL_TRANSACTIONS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM Transaction;" 2>/dev/null)
    echo "  📊 Transazioni totali nel database: $TOTAL_TRANSACTIONS"
fi

# Test 5: Verifica script SQL
echo "📋 Test 5: Verifica script SQL..."
if [ -f "$SCRIPT_PATH" ]; then
    echo "  ✅ Script SQL trovato"
    LINES=$(wc -l < "$SCRIPT_PATH")
    echo "  📄 Righe nello script: $LINES"
else
    echo "  ❌ Script SQL non trovato in $SCRIPT_PATH"
fi

# Test 6: Test query di esempio
echo "📋 Test 6: Test query di esempio..."
SAMPLE_DATA=$(sqlite3 "$DB_PATH" "SELECT DATE(t.date) as Date, COALESCE(c.name, 'Uncategorized') as Category, CAST(t.amount as REAL) as Amount FROM Transaction t LEFT JOIN Category c ON t.categoryId = c.id WHERE t.userId = '4e386ff4-924f-477d-9126-f55bbe0cde81' ORDER BY t.date DESC LIMIT 3;" 2>/dev/null)

if [ -n "$SAMPLE_DATA" ]; then
    echo "  ✅ Query di test completata"
    echo "  📊 Esempio dati:"
    echo "$SAMPLE_DATA" | head -3 | while read line; do
        echo "     $line"
    done
else
    echo "  ⚠️  Query di test non ha restituito dati"
fi

# Test 7: Verifica permessi di scrittura
echo "📋 Test 7: Verifica permessi di scrittura..."
OUTPUT_DIR="/Users/andreazampierolo/Desktop"
if [ -w "$OUTPUT_DIR" ]; then
    echo "  ✅ Permessi di scrittura OK su Desktop"
else
    echo "  ❌ Impossibile scrivere su Desktop"
fi

echo ""
echo "🎯 RIEPILOGO TEST:"
echo "=================="
echo "Database: $([[ -f "$DB_PATH" ]] && echo "✅ OK" || echo "❌ ERRORE")"
echo "SQLite3:  $(command -v sqlite3 &> /dev/null && echo "✅ OK" || echo "❌ ERRORE")"
echo "Tabelle:  $([[ $TABLES == *"Transaction"* ]] && echo "✅ OK" || echo "❌ ERRORE")"
echo "Dati:     $([ "$TRANSACTION_COUNT" -gt 0 ] && echo "✅ OK ($TRANSACTION_COUNT transazioni)" || echo "⚠️  ATTENZIONE")"
echo "Script:   $([[ -f "$SCRIPT_PATH" ]] && echo "✅ OK" || echo "❌ ERRORE")"
echo "Output:   $([[ -w "$OUTPUT_DIR" ]] && echo "✅ OK" || echo "❌ ERRORE")"
echo ""

if [ -f "$DB_PATH" ] && command -v sqlite3 &> /dev/null && [[ $TABLES == *"Transaction"* ]] && [ "$TRANSACTION_COUNT" -gt 0 ]; then
    echo "🎉 Tutto pronto per l'esportazione!"
    echo "Esegui: ./database/export_data.sh"
else
    echo "⚠️  Alcuni problemi rilevati. Controlla i test sopra."
fi