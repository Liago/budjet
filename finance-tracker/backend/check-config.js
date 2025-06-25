#!/usr/bin/env node

/**
 * 🔧 CHECK CONFIGURATION - Script per verificare la configurazione del backend
 * 
 * Verifica che tutte le variabili d'ambiente e dipendenze siano configurate correttamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 BACKEND CONFIGURATION CHECK');
console.log('================================');

// 1. Check environment files
console.log('\n1️⃣ Environment Files:');
const envFiles = ['.env', '.env.development', '.env.production'];
envFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// 2. Load and check environment variables
console.log('\n2️⃣ Environment Variables:');
require('dotenv').config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'NODE_ENV'
];

const optionalEnvVars = [
  'PORT',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'DATABASE_PROVIDER'
];

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`   ${value ? '✅' : '❌'} ${varName}: ${value ? `${value.substring(0, 20)}...` : 'NOT SET'}`);
});

console.log('\n   Optional Variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`   ${value ? '✅' : '⚠️'} ${varName}: ${value ? `${value.substring(0, 20)}...` : 'NOT SET'}`);
});

// 3. Check database file (if SQLite)
console.log('\n3️⃣ Database Check:');
const dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.startsWith('file:')) {
  const dbPath = dbUrl.replace('file:', '');
  const dbExists = fs.existsSync(dbPath);
  console.log(`   ${dbExists ? '✅' : '❌'} Database file: ${dbPath}`);
  
  if (dbExists) {
    const stats = fs.statSync(dbPath);
    console.log(`   📊 Size: ${Math.round(stats.size / 1024)}KB`);
    console.log(`   📅 Modified: ${stats.mtime.toISOString()}`);
  }
} else {
  console.log(`   📡 External database: ${dbUrl ? 'Configured' : 'NOT CONFIGURED'}`);
}

// 4. Check key files
console.log('\n4️⃣ Key Files:');
const keyFiles = [
  'src/main.ts',
  'src/app.module.ts',
  'src/prisma/prisma.service.ts',
  'src/auth/auth.module.ts',
  'prisma/schema.prisma',
  'package.json'
];

keyFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// 5. Check package.json scripts
console.log('\n5️⃣ Available Scripts:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const scripts = packageJson.scripts || {};
  Object.keys(scripts).forEach(script => {
    console.log(`   📜 ${script}: ${scripts[script]}`);
  });
} catch (error) {
  console.log('   ❌ Could not read package.json');
}

// 6. Check node_modules
console.log('\n6️⃣ Dependencies:');
const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
console.log(`   ${nodeModulesExists ? '✅' : '❌'} node_modules installed`);

if (nodeModulesExists) {
  const criticalDeps = ['@nestjs/core', '@prisma/client', 'passport-jwt'];
  criticalDeps.forEach(dep => {
    const depExists = fs.existsSync(path.join(__dirname, 'node_modules', dep));
    console.log(`   ${depExists ? '✅' : '❌'} ${dep}`);
  });
}

console.log('\n================================');
console.log('🏁 Configuration check completed');

// 7. Recommendations
console.log('\n💡 Recommendations:');
if (!process.env.DATABASE_URL) {
  console.log('   ⚠️ Set DATABASE_URL in .env file');
}
if (!process.env.JWT_SECRET) {
  console.log('   ⚠️ Set JWT_SECRET in .env file');
}
if (!nodeModulesExists) {
  console.log('   📦 Run: npm install');
}

console.log('\n🚀 To start the server: npm run start:dev');
