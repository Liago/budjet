#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script avanzato per esportare transazioni da database SQLite a CSV
 * Utilizza comandi SQLite direttamente per estrarre i dati
 */

const DB_PATH = '/Users/andreazampierolo/Projects/Bud-Jet/database/finance-tracker-db.sqlite';
const OUTPUT_PATH = '/Users/andreazampierolo/Desktop/expense_export.csv';

// Query SQL per estrarre i dati delle transazioni
const EXPORT_QUERY = `
SELECT 
    DATE(t.date) as Date,
    COALESCE(c.name, 'Uncategorized') as Category,
    CAST(t.amount as REAL) as Amount,
    t.description,
    t.type
FROM Transaction t
LEFT JOIN Category c ON t.categoryId = c.id
WHERE t.userId = '4e386ff4-924f-477d-9126-f55bbe0cde81'
ORDER BY t.date DESC;
`;

// Query per ottenere statistiche
const STATS_QUERY = `
SELECT 
    COUNT(*) as total_transactions,
    SUM(CAST(amount as REAL)) as total_amount,
    MIN(DATE(date)) as first_date,
    MAX(DATE(date)) as last_date,
    COUNT(DISTINCT categoryId) as unique_categories
FROM Transaction 
WHERE userId = '4e386ff4-924f-477d-9126-f55bbe0cde81';
`;

// Query per ottenere le categorie
const CATEGORIES_QUERY = `
SELECT name, COUNT(*) as count 
FROM Transaction t
LEFT JOIN Category c ON t.categoryId = c.id
WHERE t.userId = '4e386ff4-924f-477d-9126-f55bbe0cde81'
GROUP BY c.name
ORDER BY count DESC;
`;

function createSQLiteScript() {
    console.log('📝 Creazione script SQLite per estrazione dati...');
    
    const sqlScript = `
-- Esportazione transazioni dal database Finance Tracker
-- Generato il ${new Date().toISOString()}

.headers on
.mode csv
.output "${OUTPUT_PATH}"

-- Query principale per esportare transazioni in formato CSV
${EXPORT_QUERY}

.output stdout
.mode table

-- Statistiche del database
.print "\\n📊 STATISTICHE DATABASE:"
.print "========================"
${STATS_QUERY}

.print "\\n🏷️  CATEGORIE PIÙ UTILIZZATE:"
.print "==============================="
${CATEGORIES_QUERY}

.print "\\n✅ Esportazione completata!"
.print "📁 File CSV salvato in: ${OUTPUT_PATH}"

.exit
`;

    const scriptPath = path.join(path.dirname(DB_PATH), 'export_script.sql');
    fs.writeFileSync(scriptPath, sqlScript, 'utf8');
    
    console.log(`✅ Script SQL creato: ${scriptPath}`);
    return scriptPath;
}

function generateBatchScript() {
    console.log('📝 Creazione script batch per esecuzione...');
    
    const batchScript = `#!/bin/bash

echo "🚀 Avvio esportazione database Finance Tracker..."
echo "================================================"

# Verifica esistenza database
if [ ! -f "${DB_PATH}" ]; then
    echo "❌ Database non trovato: ${DB_PATH}"
    exit 1
fi

# Verifica esistenza sqlite3
if ! command -v sqlite3 &> /dev/null; then
    echo "❌ sqlite3 non trovato. Installalo con:"
    echo "   macOS: brew install sqlite"
    echo "   Ubuntu: sudo apt-get install sqlite3"
    exit 1
fi

echo "📁 Database: ${DB_PATH}"
echo "📄 Output: ${OUTPUT_PATH}"
echo ""

# Esegui lo script SQL
sqlite3 "${DB_PATH}" < "${path.join(path.dirname(DB_PATH), 'export_script.sql')}"

# Controlla se il file è stato creato
if [ -f "${OUTPUT_PATH}" ]; then
    echo ""
    echo "🎉 Esportazione completata con successo!"
    echo "📄 File CSV creato: ${OUTPUT_PATH}"
    echo "📊 Righe esportate: $(wc -l < '${OUTPUT_PATH}')"
    echo ""
    echo "👀 Anteprima primi 5 record:"
    head -6 "${OUTPUT_PATH}"
else
    echo "❌ Errore: file CSV non creato"
    exit 1
fi
`;

    const batchPath = path.join(path.dirname(DB_PATH), 'export_data.sh');
    fs.writeFileSync(batchPath, batchScript, 'utf8');
    
    // Rendi eseguibile lo script
    try {
        fs.chmodSync(batchPath, '755');
        console.log(`✅ Script batch creato: ${batchPath}`);
    } catch (error) {
        console.log(`⚠️  Script batch creato: ${batchPath} (potrebbero essere necessari permessi di esecuzione)`);
    }
    
    return batchPath;
}

function extractDataFromBinary() {
    console.log('🔍 Tentativo di estrazione dati direttamente dal file binario...');
    
    try {
        const buffer = fs.readFileSync(DB_PATH);
        const textData = buffer.toString('ascii');
        
        // Cerca pattern di data e importi
        const datePattern = /\d{4}-\d{2}-\d{2}/g;
        const dates = textData.match(datePattern) || [];
        
        // Cerca importi (pattern di numeri decimali)
        const amountPattern = /\d+\.\d{2}/g;
        const amounts = textData.match(amountPattern) || [];
        
        // Cerca nomi comuni di categorie
        const categoryKeywords = ['Grocery', 'Restaurant', 'Car', 'Home', 'Technology', 'Health', 'Shopping'];
        const foundCategories = categoryKeywords.filter(cat => 
            textData.toLowerCase().includes(cat.toLowerCase())
        );
        
        console.log(`📅 Date trovate: ${dates.length}`);
        console.log(`💰 Importi trovati: ${amounts.length}`);
        console.log(`🏷️  Categorie trovate: ${foundCategories.join(', ')}`);
        
        if (dates.length > 0 && amounts.length > 0) {
            // Crea CSV di esempio con i dati trovati
            const csvData = [
                'Date,Category,Amount'
            ];
            
            const maxEntries = Math.min(dates.length, amounts.length, 10);
            for (let i = 0; i < maxEntries; i++) {
                const date = dates[i] || '2025-06-16';
                const amount = amounts[i] || '0.00';
                const category = foundCategories[i % foundCategories.length] || 'Uncategorized';
                csvData.push(`"${date}","${category}",${amount}`);
            }
            
            const csvContent = csvData.join('\\n');
            const samplePath = '/Users/andreazampierolo/Desktop/sample_export.csv';
            fs.writeFileSync(samplePath, csvContent, 'utf8');
            
            console.log(`✅ CSV di esempio creato: ${samplePath}`);
            console.log(`📊 Record campione: ${maxEntries}`);
        }
        
    } catch (error) {
        console.error('❌ Errore nell\'estrazione dati:', error.message);
    }
}

function showInstructions() {
    console.log('\\n📖 ISTRUZIONI PER L\'ESPORTAZIONE:');
    console.log('==================================');
    console.log('');
    console.log('1. 🚀 METODO AUTOMATICO (Raccomandato):');
    console.log('   chmod +x export_data.sh');
    console.log('   ./export_data.sh');
    console.log('');
    console.log('2. 🔧 METODO MANUALE:');
    console.log('   sqlite3 database/finance-tracker-db.sqlite < export_script.sql');
    console.log('');
    console.log('3. 📋 ESPLORAZIONE MANUALE DEL DATABASE:');
    console.log('   sqlite3 database/finance-tracker-db.sqlite');
    console.log('   .tables                    # Mostra tutte le tabelle');
    console.log('   .schema Transaction        # Mostra struttura tabella Transaction');
    console.log('   SELECT COUNT(*) FROM Transaction; # Conta le transazioni');
    console.log('');
    console.log('4. 🎯 QUERY PERSONALIZZATE:');
    console.log('   -- Transazioni per categoria');
    console.log('   SELECT c.name, COUNT(*), SUM(t.amount)');
    console.log('   FROM Transaction t JOIN Category c ON t.categoryId = c.id');
    console.log('   GROUP BY c.name ORDER BY SUM(t.amount) DESC;');
    console.log('');
    console.log('5. 📊 FORMATI DI ESPORTAZIONE ALTERNATIVI:');
    console.log('   .mode json    # Output in formato JSON');
    console.log('   .mode tabs    # Output separato da tab');
    console.log('   .mode html    # Output in formato HTML');
}

async function main() {
    console.log('🎯 Finance Tracker Database Exporter');
    console.log('=====================================\\n');
    
    // Verifica esistenza database
    if (!fs.existsSync(DB_PATH)) {
        console.error(`❌ Database non trovato: ${DB_PATH}`);
        return;
    }
    
    const stats = fs.statSync(DB_PATH);
    console.log(`📁 Database trovato: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`📅 Ultima modifica: ${stats.mtime.toLocaleString()}\\n`);
    
    // Crea script per esportazione
    const sqlScript = createSQLiteScript();
    const batchScript = generateBatchScript();
    
    // Prova estrazione dati diretta
    extractDataFromBinary();
    
    // Mostra istruzioni
    showInstructions();
    
    console.log('\\n🎉 Setup completato!');
    console.log('Per eseguire l\'esportazione, usa uno dei metodi sopra indicati.');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };
