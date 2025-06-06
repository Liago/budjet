#!/bin/bash

# Script di controllo pre-migrazione per verificare tutto sia pronto

echo "🔍 CONTROLLO PRE-MIGRAZIONE"
echo "==========================="
echo ""

# Flag per tracciare errori
HAS_ERRORS=false

# Test 1: File SQLite database
echo "📁 Test 1: Database SQLite locale..."
SQLITE_DB="/Users/andreazampierolo/Projects/Bud-Jet/database/finance-tracker-db.sqlite"
if [ -f "$SQLITE_DB" ]; then
    SIZE=$(du -h "$SQLITE_DB" | cut -f1)
    MODIFIED=$(stat -f "%Sm" "$SQLITE_DB")
    echo "✅ Database SQLite trovato"
    echo "   📊 Dimensione: $SIZE"
    echo "   🕒 Ultima modifica: $MODIFIED"
else
    echo "❌ Database SQLite NON trovato: $SQLITE_DB"
    HAS_ERRORS=true
fi

# Test 2: Schema backup
echo ""
echo "💾 Test 2: Backup schema..."
if [ -f "prisma/schema.sqlite.backup" ]; then
    echo "✅ Backup schema SQLite presente"
else
    echo "⚠️  Backup schema SQLite mancante (sarà creato automaticamente)"
fi

# Test 3: Script necessari
echo ""
echo "📜 Test 3: Script di migrazione..."
REQUIRED_FILES=(
    "export-sqlite-data.ts"
    "import-postgresql-data.ts"
    "migrate-data.sh"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file presente"
    else
        echo "❌ $file MANCANTE"
        HAS_ERRORS=true
    fi
done

# Test 4: Connessione internet
echo ""
echo "🌐 Test 4: Connessione internet..."
if ping -c 1 google.com &> /dev/null; then
    echo "✅ Connessione internet OK"
else
    echo "❌ Connessione internet NON disponibile"
    echo "   💡 Richiesta per connessione a Supabase"
    HAS_ERRORS=true
fi

# Test 5: Node modules
echo ""
echo "📦 Test 5: Dependencies..."
if [ -d "node_modules" ] && [ -f "node_modules/@prisma/client/package.json" ]; then
    echo "✅ Node modules installati"
else
    echo "❌ Node modules mancanti"
    echo "   🔧 Esegui: npm install"
    HAS_ERRORS=true
fi

# Test 6: Schema attuale
echo ""
echo "⚙️  Test 6: Schema Prisma..."
if grep -q 'provider.*=' prisma/schema.prisma; then
    CURRENT_PROVIDER=$(grep 'provider.*=' prisma/schema.prisma | head -1 | sed 's/.*provider.*=.*"\([^"]*\)".*/\1/')
    echo "✅ Schema trovato, provider: $CURRENT_PROVIDER"
    
    if [ "$CURRENT_PROVIDER" = "sqlite" ]; then
        echo "   💡 Schema configurato per SQLite (ideale per migrazione)"
    elif [ "$CURRENT_PROVIDER" = "postgresql" ]; then
        echo "   💡 Schema configurato per PostgreSQL (sarà cambiato automaticamente)"
    fi
else
    echo "❌ Provider non trovato nel schema"
    HAS_ERRORS=true
fi

# Test 7: Permessi script
echo ""
echo "🔐 Test 7: Permessi script..."
if [ -x "migrate-data.sh" ]; then
    echo "✅ migrate-data.sh è eseguibile"
else
    echo "⚠️  migrate-data.sh non è eseguibile"
    echo "   🔧 Eseguendo: chmod +x migrate-data.sh"
    chmod +x migrate-data.sh
    if [ -x "migrate-data.sh" ]; then
        echo "✅ Permessi corretti"
    else
        echo "❌ Errore nell'impostare i permessi"
        HAS_ERRORS=true
    fi
fi

# Test 8: Test rapido connessione SQLite (se disponibile)
echo ""
echo "🧪 Test 8: Test connessione SQLite..."
if [ -f "quick-test.ts" ]; then
    echo "   🔄 Eseguendo test di connessione..."
    if npx ts-node quick-test.ts &> /dev/null; then
        echo "✅ Connessione SQLite funzionante"
    else
        echo "⚠️  Problema connessione SQLite"
        echo "   💡 Potrebbe essere necessario rigenerare client Prisma"
    fi
else
    echo "⚠️  Script di test non disponibile"
fi

# Risultato finale
echo ""
echo "🏁 RISULTATO CONTROLLO"
echo "======================"

if [ "$HAS_ERRORS" = true ]; then
    echo "❌ CONTROLLO FALLITO"
    echo ""
    echo "Risolvi gli errori sopra elencati prima di procedere con la migrazione."
    echo ""
    echo "💡 SUGGERIMENTI:"
    echo "  - Verifica che il database SQLite esista e contenga dati"
    echo "  - Installa le dependencies: npm install"
    echo "  - Assicurati di avere connessione internet per Supabase"
    echo "  - Controlla che tutti i file di script siano presenti"
    echo ""
    exit 1
else
    echo "✅ CONTROLLO SUPERATO"
    echo ""
    echo "🎉 Tutto è pronto per la migrazione!"
    echo ""
    echo "🚀 Prossimi passi:"
    echo "  1. Verifica i dati nel database SQLite"
    echo "  2. Fai un backup dei dati se necessario"
    echo "  3. Esegui la migrazione: ./migrate-data.sh"
    echo ""
    echo "⚠️  ATTENZIONE:"
    echo "  - La migrazione sovrascriverà tutti i dati esistenti su Supabase"
    echo "  - Assicurati di voler procedere prima di continuare"
    echo "  - Il processo potrebbe richiedere alcuni minuti"
    echo ""
    exit 0
fi