// check-env.js
// Script per verificare che tutte le variabili d'ambiente siano configurate

const requiredEnvVars = [
  'DATABASE_URL',
  'NODE_ENV',
  'JWT_SECRET'
];

const optionalEnvVars = [
  'JWT_EXPIRES_IN',
  'NETLIFY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS'
];

console.log('🔍 Verificando variabili d\'ambiente...\n');

// Verifica variabili obbligatorie
let missingRequired = [];
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    missingRequired.push(varName);
    console.log(`❌ ${varName}: NON CONFIGURATA`);
  } else {
    // Mostra solo i primi caratteri per sicurezza
    const displayValue = varName === 'DATABASE_URL' ? 
      value.substring(0, 30) + '...' : 
      varName.includes('SECRET') ? 
        '*'.repeat(value.length) : 
        value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

console.log('\n📋 Variabili opzionali:');

// Verifica variabili opzionali
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: non configurata (opzionale)`);
  } else {
    console.log(`✅ ${varName}: ${value}`);
  }
});

console.log('\n📊 Riepilogo:');

if (missingRequired.length > 0) {
  console.log(`❌ Mancano ${missingRequired.length} variabili obbligatorie:`);
  missingRequired.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n🔧 Per configurarle su Netlify:');
  console.log('   1. Vai su Netlify Dashboard');
  console.log('   2. Site Settings → Environment Variables');
  console.log('   3. Aggiungi le variabili mancanti');
  process.exit(1);
} else {
  console.log('✅ Tutte le variabili obbligatorie sono configurate!');
  console.log('\n🚀 Il backend dovrebbe funzionare correttamente.');
}

// Test specifico per DATABASE_URL
if (process.env.DATABASE_URL) {
  console.log('\n🔍 Analisi DATABASE_URL:');
  const dbUrl = process.env.DATABASE_URL;
  
  if (dbUrl.startsWith('postgresql://')) {
    console.log('✅ Provider: PostgreSQL (corretto per produzione)');
  } else if (dbUrl.startsWith('file:')) {
    console.log('⚠️  Provider: SQLite (solo per sviluppo)');
  } else {
    console.log('❓ Provider: sconosciuto');
  }
  
  if (dbUrl.includes('supabase.com')) {
    console.log('✅ Host: Supabase (configurazione corretta)');
  } else if (dbUrl.includes('localhost')) {
    console.log('⚠️  Host: localhost (solo per sviluppo)');
  } else {
    console.log('❓ Host: altro provider');
  }
}

console.log('\n🎯 Per testare la connessione al database:');
console.log('   npm run test:netlify');
