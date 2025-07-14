-- Esportazione transazioni dal database Finance Tracker
-- CORRETTA - con gestione timestamp in millisecondi

.headers on
.mode csv
.output "/Users/andreazampierolo/Desktop/expense_export.csv"

-- Query corretta per timestamp in millisecondi
SELECT 
    date(t.date/1000, 'unixepoch') as Date,
    COALESCE(c.name, 'Uncategorized') as Category,
    CAST(t.amount as REAL) as Amount
FROM "Transaction" t
LEFT JOIN "Category" c ON t.categoryId = c.id
WHERE t.userId = '4e386ff4-924f-477d-9126-f55bbe0cde81'
ORDER BY t.date DESC;

.output stdout
.mode table

-- Statistiche del database
.print "\n📊 STATISTICHE DATABASE:"
.print "========================"
SELECT 
    COUNT(*) as "Totale Transazioni",
    SUM(CAST(amount as REAL)) as "Importo Totale (€)",
    date(MIN(date)/1000, 'unixepoch') as "Prima Transazione",
    date(MAX(date)/1000, 'unixepoch') as "Ultima Transazione",
    COUNT(DISTINCT categoryId) as "Categorie Uniche"
FROM "Transaction" 
WHERE userId = '4e386ff4-924f-477d-9126-f55bbe0cde81';

.print "\n🏷️  CATEGORIE PIÙ UTILIZZATE:"
.print "==============================="
SELECT 
    COALESCE(c.name, 'Uncategorized') as "Categoria",
    COUNT(*) as "Transazioni", 
    SUM(CAST(t.amount as REAL)) as "Totale (€)"
FROM "Transaction" t
LEFT JOIN "Category" c ON t.categoryId = c.id
WHERE t.userId = '4e386ff4-924f-477d-9126-f55bbe0cde81'
GROUP BY c.name
ORDER BY COUNT(*) DESC
LIMIT 10;

.print "\n📅 ESEMPIO DATE CONVERTITE:"
.print "==========================="
SELECT 
    t.date as "Timestamp Originale",
    date(t.date/1000, 'unixepoch') as "Data Convertita",
    datetime(t.date/1000, 'unixepoch') as "Data e Ora",
    t.description as "Descrizione"
FROM "Transaction" t
WHERE t.userId = '4e386ff4-924f-477d-9126-f55bbe0cde81'
ORDER BY t.date DESC
LIMIT 5;

.print "\n✅ Esportazione completata!"
.print "📁 File CSV salvato in: /Users/andreazampierolo/Desktop/expense_export.csv"

.exit