#!/bin/bash

echo "🚀 BUILD E DEPLOY CON FIX JWT"

echo "🔧 Step 1: Cleaning..."
rm -rf dist/
rm -rf node_modules/.cache

echo "🔧 Step 2: Building with Netlify config..."
npm run build:netlify

echo "🔧 Step 3: Finding Netlify URL..."
node find-netlify-url.js

echo "✅ Build completed! Ready for deploy."

echo ""
echo "📋 Manual deploy command:"
echo "npm run deploy:netlify"
echo ""
echo "📋 Manual test command (try dopo deploy):"
echo "curl -X POST https://bud-jet.netlify.app/.netlify/functions/main/auth/test-login \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\":\"debug@test.com\",\"password\":\"YourPassword123!\"}'"