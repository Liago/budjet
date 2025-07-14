#!/bin/bash

# Script di diagnosi rapida per identificare il problema 500 registrazione
echo "🔍 Diagnosi Rapida Problema 500 Registrazione"
echo "============================================="

cd /Users/andreazampierolo/Projects/Bud-Jet/finance-tracker/backend

# 1. Test connessione diretta database
echo "1. 🔗 Testing database connection..."

cat > test-db-connection.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres.cmwfwxrqbpjamqzuhpxy:ua4dpMvaXKdwYjjU@aws-0-eu-central-1.pooler.supabase.com:6543/postgres'
      }
    }
  });
  
  try {
    console.log('🔗 Connecting to Supabase...');
    await prisma.$connect();
    console.log('✅ Database connection: SUCCESS');
    
    // Test User table
    console.log('📋 Testing User table...');
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible: ${userCount} users found`);
    
    // Test User table structure
    console.log('🔍 Checking User table structure...');
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 User table columns:');
    tableInfo.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Test constraints
    console.log('\n🔒 Checking constraints...');
    const constraints = await prisma.$queryRaw`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'User';
    `;
    
    console.log('🔒 User table constraints:');
    constraints.forEach(constraint => {
      console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_type}`);
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('   Code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

main();
EOF

node test-db-connection.js
rm test-db-connection.js

echo ""
echo "2. 🧪 Testing registration API directly..."

# Test API registrazione con curl
curl -X POST https://bud-jet-be.netlify.app/.netlify/functions/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: https://bud-jet.netlify.app" \
  -d '{
    "email": "test-curl@example.com",
    "password": "testpassword123", 
    "firstName": "Test",
    "lastName": "Curl"
  }' \
  -v -w "\n\nHTTP Status: %{http_code}\nTime: %{time_total}s\n" 2>&1

echo ""
echo "3. 🔍 Checking current schema provider..."
grep -r "provider.*=" prisma/schema.prisma || echo "Schema file not found or no provider line"

echo ""
echo "4. 📦 Checking if Prisma client is generated..."
if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ Prisma client exists"
    node -e "const { PrismaClient } = require('@prisma/client'); console.log('✅ Prisma client can be imported');" 2>/dev/null || echo "❌ Prisma client import failed"
else
    echo "❌ Prisma client not found"
fi

echo ""
echo "🎯 Diagnosis completed. Check the output above for any errors."
echo "   If you see database errors, run the reset script."
echo "   If you see schema errors, regenerate Prisma client."