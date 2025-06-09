#!/bin/bash

# Build script ultra-semplificato con directory dist vuota
echo "🔧 Ultra-simple build - no dependencies, no compilation"

# Crea directory dist vuota per soddisfare Netlify (anche se non la usiamo)
mkdir -p dist
echo "📄 Functions-only deployment" > dist/README.txt

echo "✅ Build completed - JavaScript function ready"
echo "📋 Using pure JavaScript function with zero dependencies"
echo "🚀 Created empty dist directory to satisfy Netlify"
