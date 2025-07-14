#!/bin/bash

# 🧪 COMPLETE FRONTEND-BACKEND TEST SCRIPT
# Esegue test completi per verificare l'integrazione

echo "🧪 COMPLETE FRONTEND-BACKEND INTEGRATION TEST"
echo "=============================================="

# Verifica che il backend sia in esecuzione
echo ""
echo "1️⃣ Checking Backend Status..."
response=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3000/api/debug/health)
if [ "$response" = "200" ]; then
    echo "✅ Backend is running on port 3000"
else
    echo "❌ Backend is not running. Start with: npm run start:dev"
    exit 1
fi

# Test Backend API compatibility
echo ""
echo "2️⃣ Testing Backend API compatibility..."
node test-frontend-compatibility.js

# Verifica che il frontend sia configurato correttamente
echo ""
echo "3️⃣ Checking Frontend Configuration..."
cd /Users/andreazampierolo/Projects/Bud-Jet/finance-tracker/frontend/web

# Verifica file di configurazione
if [ -f ".env.development" ]; then
    echo "✅ .env.development found"
    grep "VITE_API_URL" .env.development || echo "⚠️ VITE_API_URL not found in .env.development"
else
    echo "❌ .env.development not found"
fi

# Verifica che node_modules sia installato
if [ -d "node_modules" ]; then
    echo "✅ node_modules installed"
else
    echo "❌ node_modules not found. Run: npm install"
    exit 1
fi

echo ""
echo "🎯 NEXT STEPS:"
echo "=============="
echo "1. 🚀 Start Frontend:"
echo "   cd /Users/andreazampierolo/Projects/Bud-Jet/finance-tracker/frontend/web"
echo "   npm run start:dev"
echo ""
echo "2. 🧪 Test Connection:"
echo "   http://localhost:5173/test-connection"
echo ""
echo "3. 🔐 Test Login:"
echo "   http://localhost:5173/login"
echo "   Email: test@example.com"
echo "   Password: password123"
echo ""
echo "4. 📊 Test Dashboard:"
echo "   http://localhost:5173/dashboard"
echo ""
echo "✅ Backend and Frontend should now be fully compatible!"
