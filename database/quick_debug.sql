-- Debug rapido per vedere le colonne
.mode table
.headers on

.print "📋 COLONNE NELLA TABELLA Transaction:"
.print "====================================="
PRAGMA table_info("Transaction");

.print "\n📊 PRIMI 3 RECORD COMPLETI:"
.print "============================"
SELECT * FROM "Transaction" LIMIT 3;

.exit