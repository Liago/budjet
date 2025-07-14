-- Esportazione transazioni - versione semplificata
-- Solo con colonne che esistono sicuramente

.headers on
.mode csv
.output "/Users/andreazampierolo/Desktop/expense_export_simple.csv"

-- Query semplificata - solo con colonne base
SELECT 
    COALESCE(DATE(t.date), DATE(t.createdAt), DATE(t.created_at), 'No Date') as Date,
    COALESCE(c.name, 'Uncategorized') as Category,
    CAST(t.amount as REAL) as Amount
FROM "Transaction" t
LEFT JOIN "Category" c ON t.categoryId = c.id
WHERE t.userId = '4e386ff4-924f-477d-9126-f55bbe0cde81'
ORDER BY t.id DESC;

.output stdout
.mode table

.print "\n✅ Esportazione semplificata completata!"
.print "📁 File CSV salvato in: /Users/andreazampierolo/Desktop/expense_export_simple.csv"

.exit