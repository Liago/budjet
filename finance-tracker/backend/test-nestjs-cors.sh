#!/bin/bash

# Test completo per verificare che la function NestJS funzioni con CORS
echo "🧪 Testing NestJS function with CORS..."

BACKEND_URL="https://bud-jet-be.netlify.app"
FRONTEND_ORIGIN="https://bud-jet.netlify.app"

echo "🎯 Testing NestJS backend URL: $BACKEND_URL"
echo ""

echo "📍 Test 1: Health check (dovrebbe funzionare)"
curl -X GET \
  "$BACKEND_URL/.netlify/functions/api/health" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -s | jq '.'

echo ""
echo "================================================"
echo ""

echo "📍 Test 2: OPTIONS preflight per auth/login"
curl -X OPTIONS \
  "$BACKEND_URL/.netlify/functions/api/auth/login" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -I

echo ""
echo "================================================"
echo ""

echo "📍 Test 3: POST auth/login (dovrebbe funzionare senza CORS errors)"
curl -X POST \
  "$BACKEND_URL/.netlify/functions/api/auth/login" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -s | jq '.'

echo ""
echo "================================================"
echo ""

echo "📍 Test 4: Base endpoint (dovrebbe mostrare info NestJS)"
curl -X GET \
  "$BACKEND_URL/.netlify/functions/api" \
  -H "Origin: $FRONTEND_ORIGIN" \
  -s | jq '.'

echo ""
echo "✅ Test NestJS completati."
echo ""
echo "🔍 Se tutti i test sopra mostrano JSON responses senza errori CORS,"
echo "   allora la function NestJS funziona correttamente!"
echo ""
echo "🎯 Prossimo passo: testa il login dal tuo frontend"
