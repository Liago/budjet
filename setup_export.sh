#!/bin/bash

# 🚀 Script di Setup Automatico per Esportazione Database
# ======================================================

echo "🎯 Finance Tracker Database Exporter - Setup Automatico"
echo "========================================================"
echo ""

# Rendi eseguibili tutti gli script
echo "🔧 Configurazione permessi file..."
chmod +x "/Users/andreazampierolo/Projects/Bud-Jet/database/export_data.sh"
chmod +x "/Users/andreazampierolo/Projects/Bud-Jet/database/test_setup.sh"

echo "✅ Permessi configurati"
echo ""

# Esegui test di configurazione
echo "🧪 Esecuzione test di configurazione..."
echo "======================================"
./database/test_setup.sh

echo ""
echo "🎉 Setup completato!"
echo ""
echo "📋 PROSSIMI PASSI:"
echo "=================="
echo "1. Se tutti i test sono passati, esegui:"
echo "   ./database/export_data.sh"
echo ""
echo "2. Il file CSV verrà salvato in:"
echo "   /Users/andreazampierolo/Desktop/expense_export.csv"
echo ""
echo "3. Il formato del CSV sarà:"
echo "   Date,Category,Amount"
echo "   \"2025-06-16\",\"Grocery\",45.50"
echo "   \"2025-06-15\",\"Restaurant\",28.75"
echo ""
echo "🎯 Tutto pronto per l'esportazione!"