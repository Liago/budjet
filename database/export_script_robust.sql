-- Esportazione transazioni dal database Finance Tracker
-- Versione migliorata con gestione date multiple

.headers on
.mode csv
.output "/Users/andreazampierolo/Desktop/expense_export.csv"

-- Query principale per esportare transazioni - versione robusta
SELECT 
    CASE 
        -- Prova diversi possibili nomi e formati del campo date
        WHEN t.date IS NOT NULL THEN DATE(t.date)
        WHEN t.created_at IS NOT NULL THEN DATE(t.created_at)
        WHEN t.createdAt IS NOT NULL THEN DATE(t.createdAt)
        WHEN t.timestamp IS NOT NULL THEN DATE(t.timestamp)
        WHEN t.transaction_date IS NOT NULL THEN DATE(t.transaction_date)
        ELSE 'No Date'
    END as Date,
    COALESCE(c.name, 'Uncategorized') as Category,
    CAST(t.amount as REAL) as Amount
FROM "Transaction" t
LEFT JOIN "Category" c ON t.categoryId = c.id
WHERE t.userId = '4e386ff4-924f-477d-9126-f55bbe0cde81'
ORDER BY 
    CASE 
        WHEN t.date IS NOT NULL THEN t.date
        WHEN t.created_at IS NOT NULL THEN t.created_at
        WHEN t.createdAt IS NOT NULL THEN t.createdAt
        WHEN t.timestamp IS NOT NULL THEN t.timestamp
        WHEN t.transaction_date IS NOT NULL THEN t.transaction_date
        ELSE '1900-01-01'
    END DESC;

.output stdout
.mode table

-- Statistiche del database
.print "\n📊 STATISTICHE DATABASE:"
.print "========================"
SELECT 
    COUNT(*) as "Totale Transazioni",
    SUM(CAST(amount as REAL)) as "Importo Totale (€)",
    CASE 
        WHEN MIN(t.date) IS NOT NULL THEN MIN(DATE(t.date))
        WHEN MIN(t.created_at) IS NOT NULL THEN MIN(DATE(t.created_at))
        WHEN MIN(t.createdAt) IS NOT NULL THEN MIN(DATE(t.createdAt))
        WHEN MIN(t.timestamp) IS NOT NULL THEN MIN(DATE(t.timestamp))
        ELSE 'N/A'
    END as "Prima Transazione",
    CASE 
        WHEN MAX(t.date) IS NOT NULL THEN MAX(DATE(t.date))
        WHEN MAX(t.created_at) IS NOT NULL THEN MAX(DATE(t.created_at))
        WHEN MAX(t.createdAt) IS NOT NULL THEN MAX(DATE(t.createdAt))
        WHEN MAX(t.timestamp) IS NOT NULL THEN MAX(DATE(t.timestamp))
        ELSE 'N/A'
    END as "Ultima Transazione",
    COUNT(DISTINCT categoryId) as "Categorie Uniche"
FROM "Transaction" t
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

.print "\n✅ Esportazione completata!"
.print "📁 File CSV salvato in: /Users/andreazampierolo/Desktop/expense_export.csv"

.exit