#!/bin/bash

echo "🔧 FIXING AUTHENTICATION ISSUES..."
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the backend directory."
    exit 1
fi

# Step 1: Load environment variables
echo "1️⃣ Loading environment variables..."
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "❌ .env.production not found"
    exit 1
fi

# Step 2: Check critical environment variables
echo ""
echo "2️⃣ Checking critical environment variables..."

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set"
    exit 1
else
    echo "✅ DATABASE_URL is configured"
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET is not set"
    exit 1
else
    echo "✅ JWT_SECRET is configured"
fi

# Step 3: Install dependencies
echo ""
echo "3️⃣ Installing dependencies..."
npm install

# Step 4: Generate Prisma client with PostgreSQL
echo ""
echo "4️⃣ Generating Prisma client for PostgreSQL..."
npx prisma generate

# Step 5: Push database schema (non-destructive)
echo ""
echo "5️⃣ Syncing database schema..."
npx prisma db push --accept-data-loss

# Step 6: Build for Netlify
echo ""
echo "6️⃣ Building for Netlify..."
npm run build:netlify

# Step 7: Test basic functionality
echo ""
echo "7️⃣ Running basic auth test..."
node test-auth-fix.js

echo ""
echo "🎉 FIX DEPLOYMENT COMPLETED!"
echo "=================================="
echo ""
echo "📝 NEXT STEPS:"
echo "1. Configure these environment variables on Netlify:"
echo "   - JWT_SECRET=\"bud-jet-super-secure-jwt-secret-key-production-2025-minimum-32-chars\""
echo "   - JWT_EXPIRES_IN=\"7d\""
echo "   - CORS_ORIGIN=\"https://bud-jet.netlify.app\""
echo ""
echo "2. Push changes to Git to trigger Netlify deploy:"
echo "   git add ."
echo "   git commit -m \"🔧 Fix authentication issues - add JWT_SECRET and PostgreSQL schema\""
echo "   git push origin main"
echo ""
echo "3. Monitor Netlify Functions logs during deployment"
echo "4. Test endpoints after deploy completes"
