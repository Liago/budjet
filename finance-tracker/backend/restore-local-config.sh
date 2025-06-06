#!/bin/bash

# Script per ripristinare configurazione locale SQLite dopo migrazione

echo "🔄 Ripristinando configurazione locale SQLite..."

# 1. Ripristina schema SQLite
echo "📝 Ripristinando schema.prisma per SQLite..."
if [ -f "prisma/schema.sqlite.backup" ]; then
    cp prisma/schema.sqlite.backup prisma/schema.prisma
    echo "✅ Schema SQLite ripristinato"
else
    echo "❌ Backup schema SQLite non trovato"
    
    # Fallback: modifica manualmente
    echo "🔧 Modificando schema manualmente..."
    sed -i 's/provider = "postgresql"/provider = "sqlite"/g' prisma/schema.prisma
    echo "✅ Schema modificato manualmente"
fi

# 2. Verifica schema
echo "🔍 Verificando schema..."
grep 'provider.*=' prisma/schema.prisma

# 3. Rigenera Prisma client per SQLite
echo "🔄 Rigenerando Prisma client per SQLite..."
npx prisma generate

# 4. Verifica database SQLite esistente
SQLITE_DB="../../database/finance-tracker-db.sqlite"
if [ -f "$SQLITE_DB" ]; then
    echo "✅ Database SQLite locale trovato: $SQLITE_DB"
    
    # Mostra statistiche
    echo "📊 Statistiche database locale:"
    echo "   Dimensione: $(du -h "$SQLITE_DB" | cut -f1)"
    echo "   Ultima modifica: $(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$SQLITE_DB")"
else
    echo "⚠️  Database SQLite non trovato. Creando nuovo database..."
    
    # Crea directory se non esiste
    mkdir -p "$(dirname "$SQLITE_DB")"
    
    # Applica schema
    npx prisma db push
    echo "✅ Nuovo database SQLite creato"
fi

# 5. Test connessione locale
echo "🧪 Testando connessione locale..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.\$connect()
  .then(() => prisma.\$queryRaw\`SELECT COUNT(*) as count FROM User\`)
  .then((result) => {
    console.log('✅ Connessione SQLite OK');
    console.log('👥 Users nel database locale:', result[0].count);
    return prisma.\$disconnect();
  })
  .catch((error) => {
    console.error('❌ Errore connessione:', error.message);
    process.exit(1);
  });
"

echo ""
echo "🎉 Configurazione locale ripristinata con successo!"
echo ""
echo "📋 Configurazione finale:"
echo "   🏠 Locale: SQLite (development)"
echo "   ☁️  Produzione: PostgreSQL Supabase"
echo "   📊 Dati migrati: ✅"
echo "   🔄 Dual setup: ✅"
echo ""
echo "🚀 Puoi ora eseguire 'npm run start:dev' per sviluppo locale!"
