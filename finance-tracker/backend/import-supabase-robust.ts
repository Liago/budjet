// Script di importazione robusto per Supabase PostgreSQL
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.cmwfwxrqbpjamqzuhpxy:ua4dpMvaXKdwYjjU@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
    },
  },
});

interface ImportStats {
  users: number;
  categories: number;
  tags: number;
  transactions: number;
  recurrentPayments: number;
  savingsGoals: number;
  notifications: number;
  notificationPreferences: number;
  executionLogs: number;
  errors: string[];
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function logProgress(message: string, force = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);

  // Anche log su file per debugging
  fs.appendFileSync("import-progress.log", logMessage + "\n");
}

async function importData() {
  const stats: ImportStats = {
    users: 0,
    categories: 0,
    tags: 0,
    transactions: 0,
    recurrentPayments: 0,
    savingsGoals: 0,
    notifications: 0,
    notificationPreferences: 0,
    executionLogs: 0,
    errors: [],
  };

  try {
    await logProgress(
      "🚀 Iniziando importazione ROBUSTA in Supabase PostgreSQL..."
    );

    // Test connessione
    await logProgress("🔗 Testando connessione...");
    await prisma.$connect();
    const dbInfo = (await prisma.$queryRaw`SELECT version()`) as any[];
    await logProgress(`✅ Connesso a: ${dbInfo[0].version}`);

    // Leggi e verifica file export
    const exportPath = path.join(__dirname, "sqlite-export.json");
    if (!fs.existsSync(exportPath)) {
      throw new Error(`File export non trovato: ${exportPath}`);
    }

    await logProgress("📂 Caricando file export...");
    const data = JSON.parse(fs.readFileSync(exportPath, "utf8"));
    await logProgress(
      `📊 File caricato: ${data.users.length} users da importare`
    );

    // Pulizia database
    await logProgress("🧹 Pulendo database esistente...");
    await prisma.transaction.deleteMany();
    await prisma.automaticExecutionLog.deleteMany();
    await prisma.notificationPreference.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.savingsGoal.deleteMany();
    await prisma.recurrentPayment.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await logProgress("✅ Database pulito");

    // STEP 1: Import Users (solo users, senza relazioni)
    await logProgress("👥 STEP 1: Importando Users...");
    for (let i = 0; i < data.users.length; i++) {
      const userData = data.users[i];
      try {
        await logProgress(
          `   📧 [${i + 1}/${data.users.length}] User: ${userData.email}`
        );

        await prisma.user.create({
          data: {
            id: userData.id,
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            createdAt: new Date(userData.createdAt),
            updatedAt: new Date(userData.updatedAt),
          },
        });
        stats.users++;

        // Delay per evitare rate limiting
        await delay(100);
      } catch (error) {
        const errorMsg = `❌ Errore importando user ${userData.email}: ${error.message}`;
        await logProgress(errorMsg);
        stats.errors.push(errorMsg);
      }
    }

    // STEP 2: Import Categories
    await logProgress("📁 STEP 2: Importando Categories...");
    for (const userData of data.users) {
      for (let i = 0; i < userData.categories.length; i++) {
        const categoryData = userData.categories[i];
        try {
          await logProgress(
            `   📁 [${i + 1}/${userData.categories.length}] Category: ${
              categoryData.name
            }`
          );

          await prisma.category.create({
            data: {
              id: categoryData.id,
              name: categoryData.name,
              icon: categoryData.icon,
              color: categoryData.color,
              isDefault: categoryData.isDefault,
              budget: categoryData.budget,
              userId: categoryData.userId,
              createdAt: new Date(categoryData.createdAt),
              updatedAt: new Date(categoryData.updatedAt),
            },
          });
          stats.categories++;
          await delay(50);
        } catch (error) {
          const errorMsg = `❌ Errore importando category ${categoryData.name}: ${error.message}`;
          await logProgress(errorMsg);
          stats.errors.push(errorMsg);
        }
      }
    }

    // STEP 3: Import Tags
    await logProgress("🏷️ STEP 3: Importando Tags...");
    for (const userData of data.users) {
      for (let i = 0; i < userData.tags.length; i++) {
        const tagData = userData.tags[i];
        try {
          await logProgress(
            `   🏷️ [${i + 1}/${userData.tags.length}] Tag: ${tagData.name}`
          );

          await prisma.tag.create({
            data: {
              id: tagData.id,
              name: tagData.name,
              userId: tagData.userId,
              createdAt: new Date(tagData.createdAt),
              updatedAt: new Date(tagData.updatedAt),
            },
          });
          stats.tags++;
          await delay(50);
        } catch (error) {
          const errorMsg = `❌ Errore importando tag ${tagData.name}: ${error.message}`;
          await logProgress(errorMsg);
          stats.errors.push(errorMsg);
        }
      }
    }

    // STEP 4: Import Recurrent Payments
    await logProgress("🔄 STEP 4: Importando Recurrent Payments...");
    for (const userData of data.users) {
      for (let i = 0; i < userData.recurrentPayments.length; i++) {
        const rpData = userData.recurrentPayments[i];
        try {
          await logProgress(
            `   🔄 [${i + 1}/${userData.recurrentPayments.length}] Payment: ${
              rpData.name
            }`
          );

          await prisma.recurrentPayment.create({
            data: {
              id: rpData.id,
              name: rpData.name,
              amount: rpData.amount,
              description: rpData.description,
              interval: rpData.interval,
              dayOfMonth: rpData.dayOfMonth,
              dayOfWeek: rpData.dayOfWeek,
              startDate: new Date(rpData.startDate),
              endDate: rpData.endDate ? new Date(rpData.endDate) : null,
              nextPaymentDate: new Date(rpData.nextPaymentDate),
              isActive: rpData.isActive,
              categoryId: rpData.categoryId,
              userId: rpData.userId,
              createdAt: new Date(rpData.createdAt),
              updatedAt: new Date(rpData.updatedAt),
            },
          });
          stats.recurrentPayments++;
          await delay(50);
        } catch (error) {
          const errorMsg = `❌ Errore importando recurrent payment ${rpData.name}: ${error.message}`;
          await logProgress(errorMsg);
          stats.errors.push(errorMsg);
        }
      }
    }

    // STEP 5: Import Savings Goals
    await logProgress("💳 STEP 5: Importando Savings Goals...");
    for (const userData of data.users) {
      for (let i = 0; i < userData.savingsGoals.length; i++) {
        const sgData = userData.savingsGoals[i];
        try {
          await logProgress(
            `   💳 [${i + 1}/${userData.savingsGoals.length}] Goal: ${
              sgData.name
            }`
          );

          await prisma.savingsGoal.create({
            data: {
              id: sgData.id,
              name: sgData.name,
              targetAmount: sgData.targetAmount,
              currentAmount: sgData.currentAmount,
              deadline: sgData.deadline ? new Date(sgData.deadline) : null,
              description: sgData.description,
              isCompleted: sgData.isCompleted,
              userId: sgData.userId,
              createdAt: new Date(sgData.createdAt),
              updatedAt: new Date(sgData.updatedAt),
            },
          });
          stats.savingsGoals++;
          await delay(50);
        } catch (error) {
          const errorMsg = `❌ Errore importando savings goal ${sgData.name}: ${error.message}`;
          await logProgress(errorMsg);
          stats.errors.push(errorMsg);
        }
      }
    }

    // STEP 6: Import Notifications
    await logProgress("🔔 STEP 6: Importando Notifications...");
    for (const userData of data.users) {
      for (let i = 0; i < userData.notifications.length; i++) {
        const notData = userData.notifications[i];
        try {
          await logProgress(
            `   🔔 [${i + 1}/${userData.notifications.length}] Notification: ${
              notData.title
            }`
          );

          await prisma.notification.create({
            data: {
              id: notData.id,
              userId: notData.userId,
              title: notData.title,
              message: notData.message,
              type: notData.type,
              isRead: notData.isRead,
              createdAt: new Date(notData.createdAt),
            },
          });
          stats.notifications++;
          await delay(50);
        } catch (error) {
          const errorMsg = `❌ Errore importando notification ${notData.title}: ${error.message}`;
          await logProgress(errorMsg);
          stats.errors.push(errorMsg);
        }
      }
    }

    // STEP 7: Import Notification Preferences
    await logProgress("⚙️ STEP 7: Importando Notification Preferences...");
    for (const userData of data.users) {
      for (let i = 0; i < userData.notificationPreferences.length; i++) {
        const npData = userData.notificationPreferences[i];
        try {
          await logProgress(
            `   ⚙️ [${i + 1}/${
              userData.notificationPreferences.length
            }] Preference: ${npData.type}`
          );

          await prisma.notificationPreference.create({
            data: {
              id: npData.id,
              userId: npData.userId,
              type: npData.type,
              enabled: npData.enabled,
              channels: npData.channels,
              createdAt: new Date(npData.createdAt),
              updatedAt: new Date(npData.updatedAt),
            },
          });
          stats.notificationPreferences++;
          await delay(50);
        } catch (error) {
          const errorMsg = `❌ Errore importando notification preference ${npData.type}: ${error.message}`;
          await logProgress(errorMsg);
          stats.errors.push(errorMsg);
        }
      }
    }

    // STEP 8: Import Transactions (il più importante!)
    await logProgress("💰 STEP 8: Importando Transactions...");
    for (const userData of data.users) {
      await logProgress(
        `   👤 Processing ${userData.transactions.length} transactions for ${userData.email}`
      );

      for (let i = 0; i < userData.transactions.length; i++) {
        const txData = userData.transactions[i];
        try {
          if (i % 10 === 0) {
            await logProgress(
              `   💰 [${i + 1}/${
                userData.transactions.length
              }] Transaction progress...`
            );
          }

          // Crea transaction prima
          const transaction = await prisma.transaction.create({
            data: {
              id: txData.id,
              amount: txData.amount,
              description: txData.description,
              date: new Date(txData.date),
              type: txData.type,
              categoryId: txData.categoryId,
              userId: txData.userId,
              executionLogId: txData.executionLogId,
              createdAt: new Date(txData.createdAt),
              updatedAt: new Date(txData.updatedAt),
            },
          });

          // Collega tags se presenti
          if (txData.tags && txData.tags.length > 0) {
            for (const tagData of txData.tags) {
              await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                  tags: {
                    connect: { id: tagData.id },
                  },
                },
              });
            }
          }

          stats.transactions++;
          await delay(25); // Delay più breve per transazioni
        } catch (error) {
          const errorMsg = `❌ Errore importando transaction ${txData.description}: ${error.message}`;
          await logProgress(errorMsg);
          stats.errors.push(errorMsg);
        }
      }
    }

    // STEP 9: Import Execution Logs
    await logProgress("📝 STEP 9: Importando Execution Logs...");
    if (data.automaticExecutionLogs && data.automaticExecutionLogs.length > 0) {
      for (let i = 0; i < data.automaticExecutionLogs.length; i++) {
        const logData = data.automaticExecutionLogs[i];
        try {
          await logProgress(
            `   📝 [${i + 1}/${data.automaticExecutionLogs.length}] Log: ${
              logData.id
            }`
          );

          await prisma.automaticExecutionLog.create({
            data: {
              id: logData.id,
              executionDate: new Date(logData.executionDate),
              processedPayments: logData.processedPayments,
              createdTransactions: logData.createdTransactions,
              totalAmount: logData.totalAmount,
              details: logData.details,
            },
          });
          stats.executionLogs++;
          await delay(50);
        } catch (error) {
          const errorMsg = `❌ Errore importando execution log ${logData.id}: ${error.message}`;
          await logProgress(errorMsg);
          stats.errors.push(errorMsg);
        }
      }
    }

    // Final Stats
    await logProgress("🎉 IMPORTAZIONE COMPLETATA!");
    await logProgress("==========================================");
    await logProgress(`✅ Users importati: ${stats.users}`);
    await logProgress(`✅ Categories importate: ${stats.categories}`);
    await logProgress(`✅ Tags importati: ${stats.tags}`);
    await logProgress(`✅ Transactions importate: ${stats.transactions}`);
    await logProgress(
      `✅ Recurrent Payments importati: ${stats.recurrentPayments}`
    );
    await logProgress(`✅ Savings Goals importati: ${stats.savingsGoals}`);
    await logProgress(`✅ Notifications importate: ${stats.notifications}`);
    await logProgress(
      `✅ Notification Preferences importate: ${stats.notificationPreferences}`
    );
    await logProgress(`✅ Execution Logs importati: ${stats.executionLogs}`);

    if (stats.errors.length > 0) {
      await logProgress(`⚠️ Errori riscontrati: ${stats.errors.length}`);
      for (const error of stats.errors) {
        await logProgress(`   ${error}`);
      }
    }

    // Verifica finale
    const finalUserCount = await prisma.user.count();
    const finalTxCount = await prisma.transaction.count();
    await logProgress(
      `🔍 Verifica finale: ${finalUserCount} users, ${finalTxCount} transactions in Supabase`
    );
  } catch (error) {
    await logProgress(`❌ ERRORE CRITICO: ${error.message}`);
    stats.errors.push(error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }

  return stats;
}

// Esegui import
importData()
  .then((stats) => {
    console.log("🎉 Import completato con successo!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Import fallito:", error);
    process.exit(1);
  });
