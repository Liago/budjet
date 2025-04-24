// recreate-migrations.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load production environment
process.env.NODE_ENV = 'production';
const envFile = '.env.production';

if (fs.existsSync(path.join(__dirname, envFile))) {
  console.log(`Loading environment from ${envFile}`);
  dotenv.config({ path: path.join(__dirname, envFile) });
} else {
  console.log('Using default .env file');
  dotenv.config();
}

try {
  console.log('🔄 Verificando l\'URL del database...');
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('postgres')) {
    console.error('❌ DATABASE_URL non impostato o non punta a PostgreSQL');
    console.error('Assicurati di avere un file .env o .env.production con DATABASE_URL configurato per PostgreSQL');
    process.exit(1);
  }
  
  console.log('🗑️ Eliminazione directory migrations esistente...');
  try {
    execSync('rm -rf prisma/migrations', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Nessuna directory migrations da eliminare');
  }
  
  console.log('🔄 Rigenerazione delle migrazioni per PostgreSQL...');
  execSync('npx prisma migrate dev --name init --create-only', { stdio: 'inherit' });
  
  console.log('✅ Migrazioni ricreate con successo!');
  console.log('');
  console.log('📋 Prossimi passi:');
  console.log('1. Commit e push delle modifiche:');
  console.log('   git add .');
  console.log('   git commit -m "Migrate to PostgreSQL"');
  console.log('   git push');
  console.log('2. Attendere il deploy su Heroku');
  console.log('3. Esegui le migrazioni su Heroku:');
  console.log('   heroku run npx prisma migrate deploy --app budjet-backend');
  console.log('4. Importa i dati (opzionale):');
  console.log('   node migrate-data.js');
  console.log('   heroku run node import-pg-data.js --app budjet-backend');
} catch (error) {
  console.error('❌ Errore durante la rigenerazione delle migrazioni:', error.message);
  process.exit(1);
}
