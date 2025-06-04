#!/bin/bash

# Build script for Netlify
echo "Starting Netlify build..."

# Install all dependencies (including dev)
echo "Installing dependencies..."
npm ci --production=false

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the application
echo "Building NestJS application..."
NODE_ENV=development npm run build

# Copy necessary files for runtime
echo "Copying runtime files..."
cp -r prisma dist/ 2>/dev/null || true
cp package*.json dist/ 2>/dev/null || true

echo "Build completed successfully!"
