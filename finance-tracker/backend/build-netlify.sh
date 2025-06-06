#!/bin/bash

# Build script for Netlify
echo "Starting Netlify build..."

# Install all dependencies (including dev)
echo "Installing dependencies..."
npm ci --production=false

# DUAL DATABASE STRATEGY: Switch to PostgreSQL for production
echo "Configuring PostgreSQL for production build..."

# Backup original schema
cp prisma/schema.prisma prisma/schema.sqlite.backup

# Replace provider in schema for production build
sed -i 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma

echo "Schema updated for PostgreSQL production"

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

echo "Build completed successfully with PostgreSQL!"
echo "Note: Original SQLite schema backed up as schema.sqlite.backup"
