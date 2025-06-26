#!/usr/bin/env node

/**
 * 🔧 INSTALLA DIPENDENZE E FIX ANDREA
 * Script che installa dipendenze necessarie e poi fixa l'utente
 */

const { exec } = require('child_process');
const fs = require('fs');

console.log('📦 SETUP DIPENDENZE + FIX ANDREA');
console.log('=================================');

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 ${description}...`);
    console.log(`💻 ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ ${description} fallito:`, error.message);
        reject(error);
        return;
      }
      
      if (stderr && !stderr.includes('npm WARN')) {
        console.log(`⚠️ Warning: ${stderr}`);
      }
      
      console.log(`✅ ${description} completato`);
      if (stdout.trim()) {
        console.log(`📄 ${stdout.trim()}`);
      }
      
      resolve();
    });
  });
}

async function checkAndInstallDependencies() {
  console.log('\n📦 STEP 1: Verifica dipendenze');
  console.log('===============================');
  
  // Verifica package.json
  if (!fs.existsSync('package.json')) {
    console.error('❌ package.json non trovato');
    process.exit(1);
  }
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  console.log('🔍 Dipendenze attuali trovate:');
  console.log(`   - bcryptjs: ${allDeps.bcryptjs ? '✅' : '❌'}`);
  console.log(`   - pg: ${allDeps.pg ? '✅' : '❌'}`);
  console.log(`   - nanoid: ${allDeps.nanoid ? '✅' : '❌'}`);
  console.log(`   - dotenv: ${allDeps.dotenv ? '✅' : '❌'}`);
  
  const missingDeps = [];
  
  if (!allDeps.pg) missingDeps.push('pg');
  if (!allDeps.nanoid) missingDeps.push('nanoid');
  if (!allDeps.dotenv) missingDeps.push('dotenv');
  
  if (missingDeps.length > 0) {
    console.log(`\n📥 Installando dipendenze mancanti: ${missingDeps.join(', ')}`);
    await runCommand(`npm install ${missingDeps.join(' ')}`, 'Installazione dipendenze');
  } else {
    console.log('✅ Tutte le dipendenze sono presenti');
  }
}

async function runAndreaFix() {
  console.log('\n👤 STEP 2: Esecuzione fix Andrea');
  console.log('==================================');
  
  // Verifica che il file esista
  if (!fs.existsSync('fix-andrea-production-only.js')) {
    console.error('❌ File fix-andrea-production-only.js non trovato');
    process.exit(1);
  }
  
  await runCommand('node fix-andrea-production-only.js', 'Fix utente Andrea');
}

async function main() {
  try {
    console.log('🚀 Iniziando setup completo...\n');
    
    await checkAndInstallDependencies();
    await runAndreaFix();
    
    console.log('\n🎯 SETUP COMPLETATO!');
    console.log('====================');
    console.log('✅ Dipendenze installate');
    console.log('✅ Utente Andrea processato');
    console.log('✅ Test API eseguito');
    console.log('\n📝 Per verificare nuovamente:');
    console.log('   node complete-auth-test.js');
    
  } catch (error) {
    console.error('\n💥 ERRORE:', error.message);
    process.exit(1);
  }
}

main();
