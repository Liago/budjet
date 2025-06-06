#!/bin/bash

# Script per riparare e testare la configurazione SQLite

echo "🔧 RIPARAZIONE E TEST CONFIGURAZIONE SQLITE"
echo "============================================"
echo ""

# Step 1: Verifica file database SQLite
echo "📁 Step 1: Verifica database SQLite..."
SQLITE_DB="/Users/andreazampierolo/Projects/Bud-Jet/database/finance-tracker-db.sqlite"
if [ -f "$SQLITE_DB" ]; then
    echo "✅ Database SQLite trovato: $SQLITE_DB"
    echo "   📊 Dimensione: $(du -h "$SQLITE_DB" | cut -f1)"
    echo "   🕒 Ultima modifica: $(stat -f "%Sm" "$SQLITE_DB")"
else
    echo "❌ Database SQLite NON trovato: $SQLITE_DB"
    exit 1
fi

# Step 2: Assicura schema corretto per SQLite
echo ""
echo "⚙️  Step 2: Configurazione schema SQLite..."
if [ -f "prisma/schema.sqlite.backup" ]; then
    echo "📋 Ripristinando schema SQLite da backup..."
    cp prisma/schema.sqlite.backup prisma/schema.prisma
    echo "✅ Schema SQLite ripristinato"
else
    echo "⚠️  Backup non trovato, usando modifica manuale..."
    sed -i '' 's/provider = "postgresql"/provider = "sqlite"/g' prisma/schema.prisma
    echo "✅ Schema modificato per SQLite"
fi

# Verifica che la modifica sia avvenuta
if grep -q 'provider = "sqlite"' prisma/schema.prisma; then
    echo "✅ Schema correttamente configurato per SQLite"
else
    echo "❌ Errore: Schema non configurato per SQLite"
    exit 1
fi

# Step 3: Rigenera client Prisma
echo ""
echo "🔄 Step 3: Rigenerazione client Prisma..."
if npx prisma generate; then
    echo "✅ Client Prisma rigenerato per SQLite"
else
    echo "❌ Errore nella rigenerazione del client Prisma"
    exit 1
fi

# Step 4: Test connessione
echo ""
echo "🧪 Step 4: Test connessione database..."
if npx ts-node quick-test.ts; then
    echo ""
    echo "🎉 TUTTO FUNZIONA CORRETTAMENTE!"
    echo "================================"
    echo ""
    echo "✅ Database SQLite: OK"
    echo "✅ Schema Prisma: OK" 
    echo "✅ Client Prisma: OK"
    echo "✅ Connessione: OK"
    echo ""
    echo "🚀 Ora puoi eseguire la migrazione:"
    echo "   ./migrate-data.sh"
    echo ""
else
    echo ""
    echo "❌ PROBLEMA RILEVATO"
    echo "==================="
    echo ""
    echo "Il test di connessione è fallito."
    echo "Controlla i dettagli dell'errore sopra."
    echo ""
    exit 1
fi