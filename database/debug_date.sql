-- Debug script per verificare le date
.mode table
.headers on

.print "🔍 STRUTTURA TABELLA Transaction:"
.print "=================================="
.schema "Transaction"

.print "\n📊 PRIMI 5 RECORD COMPLETI:"
.print "============================="
SELECT * FROM "Transaction" LIMIT 5;

.print "\n📋 INFO COLONNE:"
.print "================="
PRAGMA table_info("Transaction");

.print "\n🔍 ANALISI CAMPO DATE:"
.print "====================="
SELECT 
    CASE 
        WHEN date IS NULL THEN 'NULL'
        WHEN date = '' THEN 'EMPTY'
        ELSE SUBSTR(CAST(date as TEXT), 1, 50)
    END as date_value,
    typeof(date) as date_type,
    COUNT(*) as count
FROM "Transaction" 
GROUP BY date, typeof(date) 
ORDER BY count DESC
LIMIT 10;

.print "\n📅 SAMPLE DATES:"
.print "==============="
SELECT 
    date as original_date,
    DATE(date) as formatted_date,
    DATETIME(date) as datetime_formatted,
    typeof(date) as type
FROM "Transaction" 
WHERE date IS NOT NULL 
LIMIT 10;

.exit