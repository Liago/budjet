// Script per convertire JSON export in CSV files per import Supabase
import * as fs from "fs";
import * as path from "path";

interface CSVData {
  headers: string[];
  rows: string[][];
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  let str = String(value);

  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }

  return str;
}

function arrayToCSV(data: CSVData): string {
  const lines = [data.headers.join(",")];

  for (const row of data.rows) {
    lines.push(row.map(escapeCSV).join(","));
  }

  return lines.join("\n");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toISOString();
}

async function convertToCSV() {
  console.log("🔄 Convertendo JSON in CSV files per Supabase...");

  // Leggi file JSON
  const jsonPath = path.join(__dirname, "sqlite-export.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`File JSON non trovato: ${jsonPath}`);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  console.log(`📂 File JSON caricato: ${data.users.length} users`);

  // Crea directory CSV
  const csvDir = path.join(__dirname, "csv-export");
  if (!fs.existsSync(csvDir)) {
    fs.mkdirSync(csvDir);
  }

  let stats = {
    users: 0,
    categories: 0,
    tags: 0,
    transactions: 0,
    recurrentPayments: 0,
    savingsGoals: 0,
    notifications: 0,
    notificationPreferences: 0,
    executionLogs: 0,
  };

  // 1. USERS CSV
  console.log("👥 Generando users.csv...");
  const usersCSV: CSVData = {
    headers: [
      "id",
      "email",
      "password",
      "firstName",
      "lastName",
      "createdAt",
      "updatedAt",
    ],
    rows: [],
  };

  for (const user of data.users) {
    usersCSV.rows.push([
      user.id,
      user.email,
      user.password,
      user.firstName,
      user.lastName,
      formatDate(user.createdAt),
      formatDate(user.updatedAt),
    ]);
    stats.users++;
  }

  fs.writeFileSync(path.join(csvDir, "01-users.csv"), arrayToCSV(usersCSV));
  console.log(`✅ users.csv: ${stats.users} records`);

  // 2. CATEGORIES CSV
  console.log("📁 Generando categories.csv...");
  const categoriesCSV: CSVData = {
    headers: [
      "id",
      "name",
      "icon",
      "color",
      "isDefault",
      "budget",
      "userId",
      "createdAt",
      "updatedAt",
    ],
    rows: [],
  };

  for (const user of data.users) {
    for (const category of user.categories) {
      categoriesCSV.rows.push([
        category.id,
        category.name,
        category.icon || "",
        category.color || "",
        category.isDefault.toString(),
        category.budget || "",
        category.userId,
        formatDate(category.createdAt),
        formatDate(category.updatedAt),
      ]);
      stats.categories++;
    }
  }

  fs.writeFileSync(
    path.join(csvDir, "02-categories.csv"),
    arrayToCSV(categoriesCSV)
  );
  console.log(`✅ categories.csv: ${stats.categories} records`);

  // 3. TAGS CSV
  console.log("🏷️ Generando tags.csv...");
  const tagsCSV: CSVData = {
    headers: ["id", "name", "userId", "createdAt", "updatedAt"],
    rows: [],
  };

  for (const user of data.users) {
    for (const tag of user.tags) {
      tagsCSV.rows.push([
        tag.id,
        tag.name,
        tag.userId,
        formatDate(tag.createdAt),
        formatDate(tag.updatedAt),
      ]);
      stats.tags++;
    }
  }

  fs.writeFileSync(path.join(csvDir, "03-tags.csv"), arrayToCSV(tagsCSV));
  console.log(`✅ tags.csv: ${stats.tags} records`);

  // 4. RECURRENT PAYMENTS CSV
  console.log("🔄 Generando recurrent_payments.csv...");
  const recurrentPaymentsCSV: CSVData = {
    headers: [
      "id",
      "name",
      "amount",
      "description",
      "interval",
      "dayOfMonth",
      "dayOfWeek",
      "startDate",
      "endDate",
      "nextPaymentDate",
      "isActive",
      "categoryId",
      "userId",
      "createdAt",
      "updatedAt",
    ],
    rows: [],
  };

  for (const user of data.users) {
    for (const rp of user.recurrentPayments) {
      recurrentPaymentsCSV.rows.push([
        rp.id,
        rp.name,
        rp.amount.toString(),
        rp.description || "",
        rp.interval,
        rp.dayOfMonth || "",
        rp.dayOfWeek || "",
        formatDate(rp.startDate),
        rp.endDate ? formatDate(rp.endDate) : "",
        formatDate(rp.nextPaymentDate),
        rp.isActive.toString(),
        rp.categoryId,
        rp.userId,
        formatDate(rp.createdAt),
        formatDate(rp.updatedAt),
      ]);
      stats.recurrentPayments++;
    }
  }

  fs.writeFileSync(
    path.join(csvDir, "04-recurrent_payments.csv"),
    arrayToCSV(recurrentPaymentsCSV)
  );
  console.log(`✅ recurrent_payments.csv: ${stats.recurrentPayments} records`);

  // 5. SAVINGS GOALS CSV
  console.log("💳 Generando savings_goals.csv...");
  const savingsGoalsCSV: CSVData = {
    headers: [
      "id",
      "name",
      "targetAmount",
      "currentAmount",
      "deadline",
      "description",
      "isCompleted",
      "userId",
      "createdAt",
      "updatedAt",
    ],
    rows: [],
  };

  for (const user of data.users) {
    for (const sg of user.savingsGoals) {
      savingsGoalsCSV.rows.push([
        sg.id,
        sg.name,
        sg.targetAmount.toString(),
        sg.currentAmount.toString(),
        sg.deadline ? formatDate(sg.deadline) : "",
        sg.description || "",
        sg.isCompleted.toString(),
        sg.userId,
        formatDate(sg.createdAt),
        formatDate(sg.updatedAt),
      ]);
      stats.savingsGoals++;
    }
  }

  fs.writeFileSync(
    path.join(csvDir, "05-savings_goals.csv"),
    arrayToCSV(savingsGoalsCSV)
  );
  console.log(`✅ savings_goals.csv: ${stats.savingsGoals} records`);

  // 6. NOTIFICATIONS CSV
  console.log("🔔 Generando notifications.csv...");
  const notificationsCSV: CSVData = {
    headers: [
      "id",
      "userId",
      "title",
      "message",
      "type",
      "isRead",
      "createdAt",
    ],
    rows: [],
  };

  for (const user of data.users) {
    for (const notification of user.notifications) {
      notificationsCSV.rows.push([
        notification.id,
        notification.userId,
        notification.title,
        notification.message,
        notification.type,
        notification.isRead.toString(),
        formatDate(notification.createdAt),
      ]);
      stats.notifications++;
    }
  }

  fs.writeFileSync(
    path.join(csvDir, "06-notifications.csv"),
    arrayToCSV(notificationsCSV)
  );
  console.log(`✅ notifications.csv: ${stats.notifications} records`);

  // 7. NOTIFICATION PREFERENCES CSV
  console.log("⚙️ Generando notification_preferences.csv...");
  const notificationPreferencesCSV: CSVData = {
    headers: [
      "id",
      "userId",
      "type",
      "enabled",
      "channels",
      "createdAt",
      "updatedAt",
    ],
    rows: [],
  };

  for (const user of data.users) {
    for (const np of user.notificationPreferences) {
      notificationPreferencesCSV.rows.push([
        np.id,
        np.userId,
        np.type,
        np.enabled.toString(),
        np.channels,
        formatDate(np.createdAt),
        formatDate(np.updatedAt),
      ]);
      stats.notificationPreferences++;
    }
  }

  fs.writeFileSync(
    path.join(csvDir, "07-notification_preferences.csv"),
    arrayToCSV(notificationPreferencesCSV)
  );
  console.log(
    `✅ notification_preferences.csv: ${stats.notificationPreferences} records`
  );

  // 8. AUTOMATIC EXECUTION LOGS CSV
  console.log("📝 Generando automatic_execution_logs.csv...");
  const executionLogsCSV: CSVData = {
    headers: [
      "id",
      "executionDate",
      "processedPayments",
      "createdTransactions",
      "totalAmount",
      "details",
      "createdAt",
      "updatedAt",
    ],
    rows: [],
  };

  if (data.automaticExecutionLogs) {
    for (const log of data.automaticExecutionLogs) {
      executionLogsCSV.rows.push([
        log.id,
        formatDate(log.executionDate),
        log.processedPayments.toString(),
        log.createdTransactions.toString(),
        log.totalAmount.toString(),
        log.details,
        formatDate(log.createdAt || log.executionDate),
        formatDate(log.updatedAt || log.executionDate),
      ]);
      stats.executionLogs++;
    }
  }

  fs.writeFileSync(
    path.join(csvDir, "08-automatic_execution_logs.csv"),
    arrayToCSV(executionLogsCSV)
  );
  console.log(
    `✅ automatic_execution_logs.csv: ${stats.executionLogs} records`
  );

  // 9. TRANSACTIONS CSV (senza tags per ora)
  console.log("💰 Generando transactions.csv...");
  const transactionsCSV: CSVData = {
    headers: [
      "id",
      "amount",
      "description",
      "date",
      "type",
      "categoryId",
      "userId",
      "executionLogId",
      "createdAt",
      "updatedAt",
    ],
    rows: [],
  };

  for (const user of data.users) {
    for (const tx of user.transactions) {
      transactionsCSV.rows.push([
        tx.id,
        tx.amount.toString(),
        tx.description || "",
        formatDate(tx.date),
        tx.type,
        tx.categoryId,
        tx.userId,
        tx.executionLogId || "",
        formatDate(tx.createdAt),
        formatDate(tx.updatedAt),
      ]);
      stats.transactions++;
    }
  }

  fs.writeFileSync(
    path.join(csvDir, "09-transactions.csv"),
    arrayToCSV(transactionsCSV)
  );
  console.log(`✅ transactions.csv: ${stats.transactions} records`);

  // 10. TRANSACTION-TAG RELATIONSHIPS CSV (many-to-many)
  console.log("🔗 Generando transaction_tags.csv...");
  const transactionTagsCSV: CSVData = {
    headers: ["transactionId", "tagId"],
    rows: [],
  };

  let tagRelations = 0;
  for (const user of data.users) {
    for (const tx of user.transactions) {
      if (tx.tags && tx.tags.length > 0) {
        for (const tag of tx.tags) {
          transactionTagsCSV.rows.push([tx.id, tag.id]);
          tagRelations++;
        }
      }
    }
  }

  fs.writeFileSync(
    path.join(csvDir, "10-transaction_tags.csv"),
    arrayToCSV(transactionTagsCSV)
  );
  console.log(`✅ transaction_tags.csv: ${tagRelations} relationships`);

  // Genera istruzioni
  const instructions = `
# 📋 ISTRUZIONI IMPORT SUPABASE VIA CSV

## 🚀 Ordine di Import (IMPORTANTE!)

Importa i file CSV in questo ESATTO ordine per rispettare le foreign keys:

1. **01-users.csv** → Tabella: \`User\`
2. **02-categories.csv** → Tabella: \`Category\`  
3. **03-tags.csv** → Tabella: \`Tag\`
4. **04-recurrent_payments.csv** → Tabella: \`RecurrentPayment\`
5. **05-savings_goals.csv** → Tabella: \`SavingsGoal\`
6. **06-notifications.csv** → Tabella: \`Notification\`
7. **07-notification_preferences.csv** → Tabella: \`NotificationPreference\`
8. **08-automatic_execution_logs.csv** → Tabella: \`AutomaticExecutionLog\`
9. **09-transactions.csv** → Tabella: \`Transaction\`
10. **10-transaction_tags.csv** → Tabella: \`_TagToTransaction\` (many-to-many)

## 🔗 Come importare:

1. Vai su: https://app.supabase.com/project/cmwfwxrqbpjamqzuhpxy
2. Sidebar → Table Editor
3. Per ogni tabella:
   - Seleziona la tabella
   - Clicca "Insert" → "Import data from CSV"
   - Seleziona il file CSV corrispondente
   - Verifica che le colonne combacino
   - Clicca "Import"

## 📊 Statistiche Export:

- 👥 Users: ${stats.users}
- 📁 Categories: ${stats.categories}  
- 🏷️ Tags: ${stats.tags}
- 💰 Transactions: ${stats.transactions}
- 🔄 Recurrent Payments: ${stats.recurrentPayments}
- 💳 Savings Goals: ${stats.savingsGoals}
- 🔔 Notifications: ${stats.notifications}
- ⚙️ Notification Preferences: ${stats.notificationPreferences}
- 📝 Execution Logs: ${stats.executionLogs}
- 🔗 Tag Relations: ${tagRelations}

## ⚠️ Note Importanti:

- Se una tabella è vuota, salta quel file CSV
- Le date sono in formato ISO (UTC)
- I booleani sono "true"/"false" come stringhe
- Se l'import fallisce, verifica che tutte le tabelle precedenti siano state importate
- La tabella \`_TagToTransaction\` gestisce la relazione many-to-many tra Transaction e Tag

🎉 Tutti i file CSV sono pronti in: ./csv-export/
`;

  fs.writeFileSync(path.join(csvDir, "IMPORT_INSTRUCTIONS.md"), instructions);

  console.log("");
  console.log("🎉 CONVERSIONE CSV COMPLETATA!");
  console.log("=====================================");
  console.log(`📁 File CSV creati in: ${csvDir}`);
  console.log("📋 Leggi IMPORT_INSTRUCTIONS.md per le istruzioni complete");
  console.log("");
  console.log("📊 STATISTICHE EXPORT:");
  console.log(`   👥 Users: ${stats.users}`);
  console.log(`   📁 Categories: ${stats.categories}`);
  console.log(`   🏷️ Tags: ${stats.tags}`);
  console.log(`   💰 Transactions: ${stats.transactions}`);
  console.log(`   🔄 Recurrent Payments: ${stats.recurrentPayments}`);
  console.log(`   💳 Savings Goals: ${stats.savingsGoals}`);
  console.log(`   🔔 Notifications: ${stats.notifications}`);
  console.log(
    `   ⚙️ Notification Preferences: ${stats.notificationPreferences}`
  );
  console.log(`   📝 Execution Logs: ${stats.executionLogs}`);
  console.log(`   🔗 Tag Relations: ${tagRelations}`);
  console.log("");
  console.log("🚀 Prossimi passi:");
  console.log(
    "1. Vai su https://app.supabase.com/project/cmwfwxrqbpjamqzuhpxy"
  );
  console.log("2. Segui le istruzioni in IMPORT_INSTRUCTIONS.md");
  console.log("3. Importa i file CSV nell'ordine specificato");
}

// Esegui conversione
convertToCSV()
  .then(() => {
    console.log("✅ Conversione CSV completata con successo!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Errore durante conversione CSV:", error);
    process.exit(1);
  });
