#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script semplificato per esportare database SQLite senza dipendenze esterne
 * Questo è un fallback che prova a leggere direttamente il file binario
 */

const DB_PATH = '/Users/andreazampierolo/Projects/Bud-Jet/database/finance-tracker-db.sqlite';
const OUTPUT_PATH = '/Users/andreazampierolo/Desktop/expense_export.csv';

function createSampleCSV() {
  console.log('🚀 Creazione CSV di esempio...');
  
  const sampleData = [
    { Date: '2025-06-15', Category: 'Alimentari', Amount: 45.50 },
    { Date: '2025-06-14', Category: 'Trasporti', Amount: 15.00 },
    { Date: '2025-06-13', Category: 'Intrattenimento', Amount: 25.75 },
    { Date: '2025-06-12', Category: 'Alimentari', Amount: 32.20 },
    { Date: '2025-06-11', Category: 'Carburante', Amount: 60.00 }
  ];

  const csvContent = [
    'Date,Category,Amount',
    ...sampleData.map(row => `"${row.Date}","${row.Category}",${row.Amount.toFixed(2)}`)
  ].join('\n');

  fs.writeFileSync(OUTPUT_PATH, csvContent, 'utf8');
  console.log(`✅ CSV di esempio creato: ${OUTPUT_PATH}`);
  console.log(`📊 Righe esportate: ${sampleData.length}`);
}

function analyzeDatabaseFile() {
  console.log('🔍 Analisi file database...');
  
  try {
    if (!fs.existsSync(DB_PATH)) {
      throw new Error(`Database non trovato: ${DB_PATH}`);
    }

    const stats = fs.statSync(DB_PATH);
    console.log(`📁 Dimensione database: ${stats.size} bytes`);
    console.log(`📅 Ultima modifica: ${stats.mtime.toISOString()}`);

    // Leggi i primi 1000 bytes del database per cercare indizi
    const buffer = fs.readFileSync(DB_PATH, { start: 0, end: 1000 });
    const header = buffer.toString('ascii', 0, 100);
    
    console.log('📋 Header del database:');
    console.log(header.replace(/[^\x20-\x7E]/g, '.'));

    // Cerca pattern comuni di testo nel database
    const content = buffer.toString('ascii').replace(/[^\x20-\x7E]/g, ' ');
    const words = content.match(/\b[a-zA-Z]{3,}\b/g) || [];
    const uniqueWords = [...new Set(words)].filter(word => word.length > 3);
    
    console.log('\n🔤 Parole chiave trovate nel database:');
    console.log(uniqueWords.slice(0, 20).join(', '));

    // Cerca possibili nomi di tabelle/colonne
    const tableKeywords = ['table', 'column', 'index', 'transaction', 'expense', 'category', 'amount', 'date'];
    const foundKeywords = uniqueWords.filter(word => 
      tableKeywords.some(keyword => word.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    if (foundKeywords.length > 0) {
      console.log('\n🎯 Possibili termini rilevanti trovati:');
      console.log(foundKeywords.join(', '));
    }

  } catch (error) {
    console.error('❌ Errore durante l\'analisi:', error.message);
  }
}

function showInstructions() {
  console.log('\n📖 ISTRUZIONI PER L\'ESPORTAZIONE MANUALE:');
  console.log('');
  console.log('Per esportare correttamente il database SQLite:');
  console.log('');
  console.log('1. Installa sqlite3 (se non presente):');
  console.log('   npm install sqlite3');
  console.log('');
  console.log('2. Esegui lo script TypeScript completo:');
  console.log('   npx ts-node export-db.ts');
  console.log('');
  console.log('3. Oppure usa sqlite3 direttamente da terminale:');
  console.log('   sqlite3 database/finance-tracker-db.sqlite');
  console.log('   .headers on');
  console.log('   .mode csv');
  console.log('   .output expense_export.csv');
  console.log('   SELECT date as Date, category as Category, amount as Amount FROM transactions;');
  console.log('   .exit');
  console.log('');
  console.log('4. Controlla le tabelle disponibili:');
  console.log('   sqlite3 database/finance-tracker-db.sqlite ".tables"');
  console.log('');
  console.log('5. Visualizza la struttura di una tabella:');
  console.log('   sqlite3 database/finance-tracker-db.sqlite ".schema table_name"');
}

async function main() {
  console.log('🎯 Script di Esportazione Database Finance Tracker');
  console.log('================================================\n');

  // Analizza il file database
  analyzeDatabaseFile();

  // Crea un CSV di esempio
  createSampleCSV();

  // Mostra istruzioni
  showInstructions();

  console.log('\n✨ Per un\'esportazione completa, usa lo script TypeScript principale!');
}

if (require.main === module) {
  main().catch(console.error);
}