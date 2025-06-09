#!/bin/bash

# Test script specifico per debug CORS su auth/login
echo "🧪 Testing CORS for auth/login endpoint..."

BACKEND_URL="https://budjet-backend.netlify.app"
FRONTEND_ORIGIN="https://bud-jet.netlify.app"

echo ""
echo "📍 Test 1: OPTIONS preflight per auth/login"
curl -X OPTIONS \
  "$BACKEND_URL/.netlify/functions/api/auth/login" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v

echo ""
echo "================================================"
echo ""

echo "📍 Test 2: POST effettivo a auth/login"
curl -X POST \
  "$BACKEND_URL/.netlify/functions/api/auth/login" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -v

echo ""
echo "================================================"
echo ""

echo "📍 Test 3: GET di controllo su health (funzionante)"
curl -X GET \
  "$BACKEND_URL/.netlify/functions/api/health" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -v

echo ""
echo "✅ Test completati. Controlla i log di Netlify per vedere cosa viene ricevuto dalla function."
