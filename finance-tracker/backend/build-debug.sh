#!/bin/bash

# Build script semplificato per debug CORS
echo "🔧 Starting simplified Netlify build for CORS debugging..."

# Install all dependencies (including dev)
echo "Installing dependencies..."
npm ci --production=false

echo "✅ Build completed - using simplified function for CORS testing"
echo "📋 The function will now work without NestJS complexity"
echo "🚀 Deploy this version to test CORS, then switch back to full NestJS version"
