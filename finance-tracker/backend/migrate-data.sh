#!/bin/bash

# Script master per migrazione completa SQLite → PostgreSQL

echo "🚀 MIGRAZIONE DATI SQLITE → SUPABASE POSTGRESQL"
echo "================================================"
echo ""

# Funzione per chiedere conferma
confirm() {
    read -p "$1 (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# Funzione per configurare schema per SQLite
setup_sqlite_schema() {
    echo "🔧 Configurando schema per SQLite..."
    
    # Backup schema attuale se non esiste già
    if [ ! -f "prisma/schema.postgresql.backup" ]; then
        cp prisma/schema.prisma prisma/schema.postgresql.backup
    fi
    
    # Ripristina schema SQLite se esiste backup
    if [ -f "prisma/schema.sqlite.backup" ]; then
        cp prisma/schema.sqlite.backup prisma/schema.prisma
        echo "✅ Schema SQLite ripristinato da backup"
    else
        # Modifica manualmente
        sed -i '' 's/provider = "postgresql"/provider = "sqlite"/g' prisma/schema.prisma
        echo "✅ Schema modificato per SQLite"
    fi
    
    # Backup e configura .env per SQLite
    if [ ! -f ".env.backup" ]; then
        cp .env .env.backup
    fi
    
    # Assicura che .env sia configurato per SQLite
    cat > .env << EOF
# Database
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:/Users/andreazampierolo/Projects/Bud-Jet/database/finance-tracker-db.sqlite"

# JWT
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="1d"

# Server
PORT=3000
NODE_ENV=development

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=andrea.zampierolo@gmail.com
SMTP_PASS=vrni vtmq ogkf nshc
SMTP_FROM=andrea.zampierolo@gmail.com
EOF
    
    # Rigenera client Prisma per SQLite
    echo "🔄 Rigenerando client Prisma per SQLite..."
    npx prisma generate
    echo "✅ Client Prisma SQLite generato"
}

# Funzione per configurare schema per PostgreSQL
setup_postgresql_schema() {
    echo "🔧 Configurando schema per PostgreSQL..."
    
    # Ripristina schema PostgreSQL
    if [ -f "prisma/schema.postgresql.backup" ]; then
        cp prisma/schema.postgresql.backup prisma/schema.prisma
        echo "✅ Schema PostgreSQL ripristinato da backup"
    else
        # Modifica manualmente
        sed -i '' 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma
        echo "✅ Schema modificato per PostgreSQL"
    fi
    
    # Configura .env per PostgreSQL temporaneamente
    cat > .env << EOF
# Database
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://postgres.cmwfwxrqbpjamqzuhpxy:ua4dpMvaXKdwYjjU@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# JWT
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="1d"

# Server
PORT=3000
NODE_ENV=production

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=andrea.zampierolo@gmail.com
SMTP_PASS=vrni vtmq ogkf nshc
SMTP_FROM=andrea.zampierolo@gmail.com
EOF
    
    # Rigenera client Prisma per PostgreSQL
    echo "🔄 Rigenerando client Prisma per PostgreSQL..."
    npx prisma generate
    echo "✅ Client Prisma PostgreSQL generato"
}

# Funzione per ripristinare configurazione originale
restore_original_config() {
    echo "🔄 Ripristinando configurazione originale..."
    
    # Ripristina .env originale
    if [ -f ".env.backup" ]; then
        cp .env.backup .env
        rm .env.backup
        echo "✅ .env originale ripristinato"
    fi
    
    # Ripristina schema SQLite per development
    if [ -f "prisma/schema.sqlite.backup" ]; then
        cp prisma/schema.sqlite.backup prisma/schema.prisma
        echo "✅ Schema SQLite ripristinato"
    fi
    
    # Rigenera client finale
    npx prisma generate
    echo "✅ Client Prisma finale rigenerato"
}

# Verifica prerequisiti
echo "🔍 Verificando prerequisiti..."

# Verifica database SQLite
SQLITE_DB="/Users/andreazampierolo/Projects/Bud-Jet/database/finance-tracker-db.sqlite"
if [ ! -f "$SQLITE_DB" ]; then
    echo "❌ Database SQLite non trovato: $SQLITE_DB"
    exit 1
fi

# Verifica connessione internet
if ! ping -c 1 google.com &> /dev/null; then
    echo "❌ Connessione internet richiesta per Supabase"
    exit 1
fi

echo "✅ Prerequisiti OK"
echo ""

# Mostra piano
echo "📋 PIANO MIGRAZIONE:"
echo "1. 🔧 Configura schema e ambiente per SQLite"
echo "2. 📤 Esporta dati da SQLite locale"
echo "3. 🔧 Configura schema e ambiente per PostgreSQL"
echo "4. 📥 Importa dati in Supabase PostgreSQL"
echo "5. 🔍 Verifica migrazione completata"
echo "6. 🔄 Ripristina configurazione locale SQLite"
echo ""

if ! confirm "Procedere con la migrazione?"; then
    echo "❌ Migrazione annullata"
    exit 0
fi

echo ""
echo "🚀 Iniziando migrazione..."

# Step 0: Setup schema per SQLite
echo ""
echo "====== STEP 0: SETUP AMBIENTE SQLITE ======"
setup_sqlite_schema

# Step 1: Export
echo ""
echo "====== STEP 1: EXPORT SQLITE ======"
if ! npx ts-node export-sqlite-data.ts; then
    echo "❌ Errore durante export SQLite"
    echo "🔄 Ripristinando configurazione originale..."
    restore_original_config
    exit 1
fi

# Verifica file export
if [ ! -f "sqlite-export.json" ]; then
    echo "❌ File export non creato"
    restore_original_config
    exit 1
fi

echo "✅ Export completato"

# Step 1.5: Setup schema per PostgreSQL
echo ""
echo "====== STEP 1.5: SETUP AMBIENTE POSTGRESQL ======"
setup_postgresql_schema

# Step 2: Import  
echo ""
echo "====== STEP 2: IMPORT POSTGRESQL ======"
echo "⚠️  Questo sovrascriverà tutti i dati esistenti su Supabase"

if confirm "Continuare con l'import?"; then
    if ! npx ts-node import-postgresql-data.ts; then
        echo "❌ Errore durante import PostgreSQL"
        restore_original_config
        exit 1
    fi
    echo "✅ Import completato"
else
    echo "❌ Import annullato"
    restore_original_config
    exit 1
fi

# Step 3: Verify
echo ""
echo "====== STEP 3: VERIFICA MIGRAZIONE ======"
if ! npx ts-node verify-migration.ts; then
    echo "❌ Verifica fallita"
    echo "🔧 Controlla i log e riprova l'importazione se necessario"
    restore_original_config
    exit 1
fi

echo "✅ Verifica completata"

# Step 4: Restore local config
echo ""
echo "====== STEP 4: RIPRISTINO CONFIG LOCALE ======"
restore_original_config

# Cleanup
echo ""
echo "🧹 Pulizia file temporanei..."
if confirm "Rimuovere file sqlite-export.json?"; then
    rm -f sqlite-export.json
    echo "✅ File export rimosso"
fi

# Cleanup backup files
if [ -f "prisma/schema.postgresql.backup" ]; then
    rm -f prisma/schema.postgresql.backup
    echo "✅ File backup temporanei rimossi"
fi

echo ""
echo "🎉 MIGRAZIONE COMPLETATA CON SUCCESSO!"
echo "=================================="
echo ""
echo "📊 Stato finale:"
echo "   🏠 Locale: SQLite (per development)"
echo "   ☁️  Produzione: PostgreSQL Supabase"
echo "   📱 Frontend: https://bud-jet.netlify.app"
echo "   🔗 Backend API: https://bud-jet-be.netlify.app/.netlify/functions/api"
echo "   🗄️  Database: https://app.supabase.com/project/cmwfwxrqbpjamqzuhpxy"
echo ""
echo "🚀 La tua app full-stack è ora completamente operativa!"