# 📊 Esportazione Database Finance Tracker

Questo repository contiene tutti gli script necessari per esportare il database SQLite del Finance Tracker in formato CSV seguendo il template richiesto.

## 🎯 Obiettivo

Esportare i dati delle transazioni dal database `finance-tracker-db.sqlite` in un file CSV con le colonne:
- **Date** (formato YYYY-MM-DD)
- **Category** (nome della categoria)
- **Amount** (importo in formato decimale)

## 📁 File Creati

### Script TypeScript Completo
- `export-db.ts` - Script TypeScript professionale con gestione errori avanzata
- `package.json` - Dipendenze npm per il progetto

### Script di Esportazione Rapida
- `database/export_script.sql` - Query SQL per estrazione dati
- `database/export_data.sh` - Script bash per esecuzione automatica
- `db-export-advanced.js` - Script Node.js con funzionalità avanzate

## 🚀 Metodi di Esportazione

### Metodo 1: Script Bash (Raccomandato) ⭐

Il metodo più semplice e veloce:

\`\`\`bash
cd /Users/andreazampierolo/Projects/Bud-Jet
chmod +x database/export_data.sh
./database/export_data.sh
\`\`\`

### Metodo 2: SQLite Diretto

Esegui manualmente il comando SQLite:

\`\`\`bash
cd /Users/andreazampierolo/Projects/Bud-Jet
sqlite3 database/finance-tracker-db.sqlite < database/export_script.sql
\`\`\`

### Metodo 3: Script TypeScript Professionale

Se vuoi usare lo script TypeScript completo:

\`\`\`bash
cd /Users/andreazampierolo/Projects/Bud-Jet
npm install
npx ts-node export-db.ts
\`\`\`

### Metodo 4: Interattivo con SQLite

Per esplorare il database interattivamente:

\`\`\`bash
sqlite3 database/finance-tracker-db.sqlite
.tables
.schema Transaction
SELECT COUNT(*) FROM Transaction;
.exit
\`\`\`

## 📋 Struttura Database Identificata

Il database contiene le seguenti tabelle principali:

- **Transaction**: Transazioni con amount, date, description, type, categoryId
- **Category**: Categorie con name, icon, color
- **User**: Utenti del sistema
- **Tag**: Tag per le transazioni
- **RecurrentPayment**: Pagamenti ricorrenti

### Query di Base Utilizzata

\`\`\`sql
SELECT 
    DATE(t.date) as Date,
    COALESCE(c.name, 'Uncategorized') as Category,
    CAST(t.amount as REAL) as Amount
FROM Transaction t
LEFT JOIN Category c ON t.categoryId = c.id
WHERE t.userId = '4e386ff4-924f-477d-9126-f55bbe0cde81'
ORDER BY t.date DESC;
\`\`\`

## 📄 Output Atteso

Il file CSV verrà salvato in:
\`/Users/andreazampierolo/Desktop/expense_export.csv\`

Formato esempio:
\`\`\`csv
Date,Category,Amount
"2025-06-16","Grocery",45.50
"2025-06-15","Restaurant",28.75
"2025-06-14","Car",60.00
\`\`\`

## 🔧 Risoluzione Problemi

### Se sqlite3 non è installato:

**macOS:**
\`\`\`bash
brew install sqlite
\`\`\`

**Ubuntu/Debian:**
\`\`\`bash
sudo apt-get install sqlite3
\`\`\`

### Se i permessi sono negati:

\`\`\`bash
chmod +x database/export_data.sh
\`\`\`

### Per controllare la struttura del database:

\`\`\`bash
sqlite3 database/finance-tracker-db.sqlite ".tables"
sqlite3 database/finance-tracker-db.sqlite ".schema Transaction"
\`\`\`

## 📊 Statistiche Database

Dal database sono state identificate:
- **Dimensione**: ~299 KB
- **Tabelle**: 10+ tabelle principali
- **Utente principale**: Andrea Zampierolo (4e386ff4-924f-477d-9126-f55bbe0cde81)
- **Categorie**: Grocery, Restaurant, Car, Technology, Health, Shopping, ecc.

## 🎉 Completamento

Una volta eseguito uno degli script, troverai il file CSV pronto all'uso sulla scrivania. Il file seguirà esattamente il template richiesto con le colonne Date, Category e Amount.

## 💡 Tips Aggiuntivi

- Usa il **Metodo 1 (Script Bash)** per la massima semplicità
- Il file CSV sarà ordinato per data (più recenti prima)
- Tutte le transazioni saranno incluse (entrate e uscite)
- Le categorie senza nome appariranno come "Uncategorized"

**Buona esportazione! 🚀**