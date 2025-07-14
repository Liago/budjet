import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

interface ExpenseRecord {
  Date: string;
  Category: string;
  Amount: number;
}

class DatabaseExporter {
  private dbPath: string;
  private outputPath: string;

  constructor(dbPath: string, outputPath: string) {
    this.dbPath = dbPath;
    this.outputPath = outputPath;
  }

  /**
   * Connette al database SQLite e recupera la struttura delle tabelle
   */
  private async getTableStructure(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          reject(`Errore connessione database: ${err.message}`);
          return;
        }
      });

      db.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        [],
        (err, rows: any[]) => {
          if (err) {
            reject(`Errore lettura tabelle: ${err.message}`);
            return;
          }
          
          const tableNames = rows.map(row => row.name);
          console.log('Tabelle trovate:', tableNames);
          
          db.close();
          resolve(tableNames);
        }
      );
    });
  }

  /**
   * Recupera i dati delle spese dal database
   */
  private async getExpenseData(): Promise<ExpenseRecord[]> {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          reject(`Errore connessione database: ${err.message}`);
          return;
        }
      });

      // Prima proviamo con nomi di tabelle comuni per app di finanza
      const possibleQueries = [
        // Query per tabella 'transactions' o 'expenses'
        `SELECT 
          date as Date,
          category as Category,
          amount as Amount
         FROM transactions 
         ORDER BY date DESC`,
        
        `SELECT 
          date as Date,
          category as Category,
          amount as Amount
         FROM expenses 
         ORDER BY date DESC`,
         
        // Query alternative con nomi di colonne diversi
        `SELECT 
          created_at as Date,
          category_name as Category,
          amount as Amount
         FROM transactions 
         ORDER BY created_at DESC`,
         
        `SELECT 
          transaction_date as Date,
          category as Category,
          amount as Amount
         FROM financial_records 
         ORDER BY transaction_date DESC`,
         
        // Query per tabella generica 'records'
        `SELECT 
          date as Date,
          category as Category,
          amount as Amount
         FROM records 
         WHERE type = 'expense' OR type = 'spending'
         ORDER BY date DESC`
      ];

      let queryIndex = 0;

      const tryNextQuery = () => {
        if (queryIndex >= possibleQueries.length) {
          // Se tutte le query falliscono, proviamo a scoprire la struttura
          this.discoverDatabaseStructure(db, resolve, reject);
          return;
        }

        const currentQuery = possibleQueries[queryIndex];
        console.log(`Tentativo query ${queryIndex + 1}:`, currentQuery);

        db.all(currentQuery, [], (err, rows: any[]) => {
          if (err) {
            console.log(`Query ${queryIndex + 1} fallita:`, err.message);
            queryIndex++;
            tryNextQuery();
            return;
          }

          console.log(`Query ${queryIndex + 1} riuscita! Trovate ${rows.length} righe`);
          
          const formattedData: ExpenseRecord[] = rows.map((row: any) => ({
            Date: this.formatDate(row.Date),
            Category: row.Category || 'Non specificata',
            Amount: parseFloat(row.Amount) || 0
          }));

          db.close();
          resolve(formattedData);
        });
      };

      tryNextQuery();
    });
  }

  /**
   * Scopre la struttura del database quando le query standard falliscono
   */
  private discoverDatabaseStructure(db: sqlite3.Database, resolve: (data: ExpenseRecord[]) => void, reject: (error: string) => void) {
    db.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      [],
      (err, tables: any[]) => {
        if (err || tables.length === 0) {
          db.close();
          reject('Impossibile trovare tabelle nel database');
          return;
        }

        const tableName = tables[0].name;
        console.log(`Analizzando struttura della tabella: ${tableName}`);

        // Ottieni info sulle colonne
        db.all(`PRAGMA table_info(${tableName})`, [], (err, columns: any[]) => {
          if (err) {
            db.close();
            reject(`Errore analisi struttura tabella: ${err.message}`);
            return;
          }

          console.log('Colonne trovate:', columns.map(col => col.name));

          // Prova a costruire una query basata sulle colonne disponibili
          const columnNames = columns.map(col => col.name.toLowerCase());
          
          let dateColumn = columnNames.find(name => 
            name.includes('date') || name.includes('time') || name.includes('created')
          ) || columns[0].name;
          
          let categoryColumn = columnNames.find(name => 
            name.includes('category') || name.includes('type') || name.includes('description')
          ) || columns[1]?.name || 'NULL';
          
          let amountColumn = columnNames.find(name => 
            name.includes('amount') || name.includes('value') || name.includes('price')
          ) || columns[2]?.name || 'NULL';

          const dynamicQuery = `SELECT 
            ${dateColumn} as Date,
            ${categoryColumn} as Category,
            ${amountColumn} as Amount
           FROM ${tableName} 
           ORDER BY ${dateColumn} DESC LIMIT 1000`;

          console.log('Query dinamica:', dynamicQuery);

          db.all(dynamicQuery, [], (err, rows: any[]) => {
            if (err) {
              db.close();
              reject(`Errore query dinamica: ${err.message}`);
              return;
            }

            const formattedData: ExpenseRecord[] = rows.map((row: any) => ({
              Date: this.formatDate(row.Date),
              Category: String(row.Category || 'Non specificata'),
              Amount: parseFloat(row.Amount) || 0
            }));

            db.close();
            resolve(formattedData);
          });
        });
      }
    );
  }

  /**
   * Formatta la data in formato ISO (YYYY-MM-DD)
   */
  private formatDate(dateValue: any): string {
    if (!dateValue) return new Date().toISOString().split('T')[0];
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0];
      }
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Converte i dati in formato CSV
   */
  private convertToCSV(data: ExpenseRecord[]): string {
    const headers = ['Date', 'Category', 'Amount'];
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(record => {
      const values = [
        `"${record.Date}"`,
        `"${record.Category}"`,
        record.Amount.toFixed(2)
      ];
      return values.join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }

  /**
   * Esegue l'esportazione completa
   */
  public async exportToCSV(): Promise<void> {
    try {
      console.log('🚀 Avvio esportazione database...');
      console.log(`📁 Database: ${this.dbPath}`);
      console.log(`📄 Output: ${this.outputPath}`);

      // Verifica esistenza database
      if (!fs.existsSync(this.dbPath)) {
        throw new Error(`Database non trovato: ${this.dbPath}`);
      }

      // Mostra struttura database
      const tables = await this.getTableStructure();
      console.log(`📋 Tabelle disponibili: ${tables.join(', ')}`);

      // Estrai dati
      console.log('📊 Estrazione dati in corso...');
      const expenseData = await this.getExpenseData();
      console.log(`✅ Estratte ${expenseData.length} righe di dati`);

      if (expenseData.length === 0) {
        console.log('⚠️  Nessun dato trovato nel database');
        return;
      }

      // Mostra anteprima dati
      console.log('\n📋 Anteprima primi 3 record:');
      expenseData.slice(0, 3).forEach((record, index) => {
        console.log(`${index + 1}. Data: ${record.Date}, Categoria: ${record.Category}, Importo: €${record.Amount}`);
      });

      // Converti in CSV
      console.log('\n📝 Conversione in CSV...');
      const csvContent = this.convertToCSV(expenseData);

      // Crea directory di output se non esiste
      const outputDir = path.dirname(this.outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Salva file CSV
      fs.writeFileSync(this.outputPath, csvContent, 'utf8');
      
      console.log(`✅ Esportazione completata con successo!`);
      console.log(`📁 File salvato: ${this.outputPath}`);
      console.log(`📊 Totale record esportati: ${expenseData.length}`);

      // Statistiche aggiuntive
      const totalAmount = expenseData.reduce((sum, record) => sum + record.Amount, 0);
      const categories = [...new Set(expenseData.map(r => r.Category))];
      
      console.log(`\n📈 Statistiche:`);
      console.log(`💰 Importo totale: €${totalAmount.toFixed(2)}`);
      console.log(`🏷️  Categorie uniche: ${categories.length}`);
      console.log(`📅 Periodo: ${expenseData[expenseData.length - 1]?.Date} - ${expenseData[0]?.Date}`);

    } catch (error) {
      console.error('❌ Errore durante l\'esportazione:', error);
      throw error;
    }
  }
}

// Funzione principale di esportazione
async function exportFinanceDatabase(): Promise<void> {
  const dbPath = '/Users/andreazampierolo/Projects/Bud-Jet/database/finance-tracker-db.sqlite';
  const outputPath = '/Users/andreazampierolo/Desktop/expense_export.csv';

  const exporter = new DatabaseExporter(dbPath, outputPath);
  await exporter.exportToCSV();
}

// Esecuzione se script chiamato direttamente
if (require.main === module) {
  exportFinanceDatabase()
    .then(() => {
      console.log('\n🎉 Processo di esportazione completato!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Errore fatale:', error);
      process.exit(1);
    });
}

export { DatabaseExporter, exportFinanceDatabase };