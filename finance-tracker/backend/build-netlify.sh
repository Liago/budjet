#!/bin/bash

# Build script for Netlify with robust PostgreSQL switching
echo "Starting Netlify build with dual database strategy..."

# Install all dependencies (including dev)
echo "Installing dependencies..."
npm ci --production=false

# DUAL DATABASE STRATEGY: Switch to PostgreSQL for production
echo "=== SWITCHING TO POSTGRESQL FOR PRODUCTION ==="

# Show current schema
echo "Current schema provider:"
grep 'provider.*=' prisma/schema.prisma

# Backup original schema
cp prisma/schema.prisma prisma/schema.sqlite.backup
echo "✅ Backup created: prisma/schema.sqlite.backup"

# Replace provider in schema for production build using multiple approaches
echo "Switching provider from sqlite to postgresql..."

# Method 1: sed replacement
sed -i 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma

# Method 2: additional sed for variations
sed -i "s/provider = 'sqlite'/provider = 'postgresql'/g" prisma/schema.prisma

# Method 3: node script fallback
node -e "
const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
schema = schema.replace(/provider\s*=\s*[\"']sqlite[\"']/g, 'provider = \"postgresql\"');
fs.writeFileSync('prisma/schema.prisma', schema);
console.log('✅ Node script replacement completed');
"

# Verify the change worked
echo "Updated schema provider:"
grep 'provider.*=' prisma/schema.prisma

# Check if replacement was successful
if grep -q 'provider = "postgresql"' prisma/schema.prisma; then
    echo "✅ Successfully switched to PostgreSQL"
else
    echo "❌ Failed to switch to PostgreSQL, trying manual replacement..."
    # Manual replacement as fallback
    cat > prisma/schema.temp << 'EOF'
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
  engineType = "binary"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
EOF
    # Append the rest of the schema (excluding the first datasource block)
    sed -n '/^enum TransactionType/,$p' prisma/schema.sqlite.backup >> prisma/schema.temp
    mv prisma/schema.temp prisma/schema.prisma
    echo "✅ Manual replacement completed"
fi

echo "Final schema check:"
head -20 prisma/schema.prisma

# Generate Prisma client with PostgreSQL
echo "Generating Prisma client for PostgreSQL..."
npx prisma generate

# Build the application
echo "Building NestJS application..."
NODE_ENV=production npm run build

# Copy necessary files for runtime
echo "Copying runtime files..."
cp -r prisma dist/ 2>/dev/null || true
cp package*.json dist/ 2>/dev/null || true

echo "✅ Build completed successfully with PostgreSQL!"
echo "📋 Schema backup available at: prisma/schema.sqlite.backup"
