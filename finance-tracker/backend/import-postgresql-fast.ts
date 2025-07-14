// Script veloce per importare dati da JSON a Supabase PostgreSQL
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function importData() {
  console.log("🚀 Import veloce dati in Supabase PostgreSQL...");
  console.log(
    "💾 DATABASE_URL:",
    process.env.DATABASE_URL?.substring(0, 30) + "..."
  );

  try {
    // Leggi file export
    const exportPath = path.join(__dirname, "sqlite-export.json");

    if (!fs.existsSync(exportPath)) {
      throw new Error(`File export non trovato: ${exportPath}`);
    }

    const data = JSON.parse(fs.readFileSync(exportPath, "utf8"));
    console.log("📂 File export caricato");

    // Connessione rapida
    console.log("🔗 Connettendo a PostgreSQL...");
    await prisma.$connect();
    console.log("✅ Connesso!");

    // Pulisci database esistente (in ordine per foreign keys)
    console.log("🧹 Pulendo database esistente...");
    await prisma.transaction.deleteMany();
    console.log("   ✅ Transactions pulite");
    await prisma.automaticExecutionLog.deleteMany();
    console.log("   ✅ Execution logs puliti");
    await prisma.notificationPreference.deleteMany();
    console.log("   ✅ Notification preferences pulite");
    await prisma.notification.deleteMany();
    console.log("   ✅ Notifications pulite");
    await prisma.savingsGoal.deleteMany();
    console.log("   ✅ Savings goals puliti");
    await prisma.recurrentPayment.deleteMany();
    console.log("   ✅ Recurrent payments puliti");
    await prisma.tag.deleteMany();
    console.log("   ✅ Tags puliti");
    await prisma.category.deleteMany();
    console.log("   ✅ Categories pulite");
    await prisma.user.deleteMany();
    console.log("   ✅ Users puliti");
    console.log("✅ Database pulito");

    let importStats = {
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

    console.log("📊 Importando dati...");

    // Importa users
    console.log("👥 Importando users...");
    for (const userData of data.users) {
      console.log(`   📧 User: ${userData.email}`);

      // Crea user
      const user = await prisma.user.create({
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
      importStats.users++;

      // Crea categories
      for (const categoryData of userData.categories) {
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
        importStats.categories++;
      }

      // Crea tags
      for (const tagData of userData.tags) {
        await prisma.tag.create({
          data: {
            id: tagData.id,
            name: tagData.name,
            userId: tagData.userId,
            createdAt: new Date(tagData.createdAt),
            updatedAt: new Date(tagData.updatedAt),
          },
        });
        importStats.tags++;
      }

      // Crea recurrent payments
      for (const rpData of userData.recurrentPayments) {
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
        importStats.recurrentPayments++;
      }

      // Crea savings goals
      for (const sgData of userData.savingsGoals) {
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
        importStats.savingsGoals++;
      }

      // Crea notifications
      for (const notData of userData.notifications) {
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
        importStats.notifications++;
      }

      // Crea notification preferences
      for (const npData of userData.notificationPreferences) {
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
        importStats.notificationPreferences++;
      }

      // Crea transactions (più complesse per tags)
      console.log(
        `   💰 Importando ${userData.transactions.length} transactions...`
      );
      for (const txData of userData.transactions) {
        // Crea transaction
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

        importStats.transactions++;
      }
    }

    // Importa execution logs
    console.log("📝 Importando execution logs...");
    for (const logData of data.automaticExecutionLogs) {
      await prisma.automaticExecutionLog.create({
        data: {
          id: logData.id,
          executionDate: new Date(logData.executionDate),
          processedPayments: logData.processedPayments,
          createdTransactions: logData.createdTransactions,
          totalAmount: logData.totalAmount,
          details: logData.details,
          createdAt: new Date(logData.createdAt),
          updatedAt: new Date(logData.updatedAt),
        },
      });
      importStats.executionLogs++;
    }

    console.log("");
    console.log("📊 IMPORTAZIONE COMPLETATA!");
    console.log("================================");
    console.log(`👥 Users importati: ${importStats.users}`);
    console.log(`📁 Categories importate: ${importStats.categories}`);
    console.log(`🏷️  Tags importati: ${importStats.tags}`);
    console.log(`💰 Transactions importate: ${importStats.transactions}`);
    console.log(
      `🔄 Recurrent payments importati: ${importStats.recurrentPayments}`
    );
    console.log(`💳 Savings goals importati: ${importStats.savingsGoals}`);
    console.log(`🔔 Notifications importate: ${importStats.notifications}`);
    console.log(
      `⚙️  Notification preferences importate: ${importStats.notificationPreferences}`
    );
    console.log(`📝 Execution logs importati: ${importStats.executionLogs}`);
    console.log("================================");
    console.log("🎉 MIGRAZIONE COMPLETATA CON SUCCESSO!");

    return importStats;
  } catch (error) {
    console.error("❌ Errore durante importazione:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui import
importData()
  .then((stats) => {
    console.log("🎉 Import completato con successo!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Errore fatale:", error);
    process.exit(1);
  });
