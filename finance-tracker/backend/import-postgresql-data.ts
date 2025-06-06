// Script per importare dati da JSON a Supabase PostgreSQL
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Usa configurazione da environment (gestita dallo script di migrazione)
const prisma = new PrismaClient();

async function importData() {
  console.log('🔍 Iniziando importazione dati in Supabase PostgreSQL...');
  console.log('💾 DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 30) + '...');
  
  try {
    // Leggi file export
    const exportPath = path.join(__dirname, 'sqlite-export.json');
    
    if (!fs.existsSync(exportPath)) {
      throw new Error(`File export non trovato: ${exportPath}`);
    }
    
    const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    console.log('📂 File export caricato');
    
    // Test connessione
    console.log('🔗 Testando connessione PostgreSQL...');
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Connessione PostgreSQL OK');
    
    // Verifica che sia effettivamente PostgreSQL
    const dbInfo = await prisma.$queryRaw`SELECT version()` as any[];
    if (dbInfo && dbInfo[0] && dbInfo[0].version) {
      console.log('🐘 Database PostgreSQL confermato');
    }
    
    // Pulisci database esistente (in ordine per foreign keys)
    console.log('🧹 Pulendo database esistente...');
    await prisma.transaction.deleteMany();
    await prisma.automaticExecutionLog.deleteMany(); 
    await prisma.notificationPreference.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.savingsGoal.deleteMany();
    await prisma.recurrentPayment.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Database pulito');
    
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

    console.log('📊 Dati da importare:');
    console.log(`   👥 Users: ${data.users.length}`);
    console.log(`   📝 Execution Logs: ${data.automaticExecutionLogs.length}`);
    
    // Conta totali per statistics
    let totalCategories = 0, totalTransactions = 0, totalTags = 0;
    let totalRecurrentPayments = 0, totalSavingsGoals = 0, totalNotifications = 0;
    data.users.forEach(user => {
      totalCategories += user.categories.length;
      totalTransactions += user.transactions.length;
      totalTags += user.tags.length;
      totalRecurrentPayments += user.recurrentPayments.length;
      totalSavingsGoals += user.savingsGoals.length;
      totalNotifications += user.notifications.length;
    });
    
    console.log(`   📁 Categories: ${totalCategories}`);
    console.log(`   💰 Transactions: ${totalTransactions}`);
    console.log(`   🏷️  Tags: ${totalTags}`);
    console.log(`   🔄 Recurrent Payments: ${totalRecurrentPayments}`);
    console.log(`   💳 Savings Goals: ${totalSavingsGoals}`);
    console.log(`   🔔 Notifications: ${totalNotifications}`);

    // Importa users prima (senza relazioni)
    console.log('');
    console.log('👥 Importando users...');
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
        }
      });
      importStats.users++;
      
      // Crea categories
      console.log(`   📁 Importando ${userData.categories.length} categories...`);
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
          }
        });
        importStats.categories++;
      }
      
      // Crea tags
      console.log(`   🏷️  Importando ${userData.tags.length} tags...`);
      for (const tagData of userData.tags) {
        await prisma.tag.create({
          data: {
            id: tagData.id,
            name: tagData.name,
            userId: tagData.userId,
            createdAt: new Date(tagData.createdAt),
            updatedAt: new Date(tagData.updatedAt),
          }
        });
        importStats.tags++;
      }
      
      // Crea recurrent payments
      console.log(`   🔄 Importando ${userData.recurrentPayments.length} recurrent payments...`);
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
          }
        });
        importStats.recurrentPayments++;
      }
      
      // Crea savings goals
      console.log(`   💳 Importando ${userData.savingsGoals.length} savings goals...`);
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
          }
        });
        importStats.savingsGoals++;
      }
      
      // Crea notifications
      console.log(`   🔔 Importando ${userData.notifications.length} notifications...`);
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
          }
        });
        importStats.notifications++;
      }
      
      // Crea notification preferences
      console.log(`   ⚙️  Importando ${userData.notificationPreferences.length} notification preferences...`);
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
          }
        });
        importStats.notificationPreferences++;
      }
    }
    
    // Importa execution logs
    console.log('');
    console.log('📝 Importando execution logs...');
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
        }
      });
      importStats.executionLogs++;
    }
    
    // Importa transactions (per ultimo per le relazioni)
    console.log('');
    console.log('💰 Importando transactions...');
    let transactionCount = 0;
    for (const userData of data.users) {
      if (userData.transactions.length > 0) {
        console.log(`   💰 User ${userData.email}: ${userData.transactions.length} transactions`);
        for (const transactionData of userData.transactions) {
          const transaction = await prisma.transaction.create({
            data: {
              id: transactionData.id,
              amount: transactionData.amount,
              description: transactionData.description,
              date: new Date(transactionData.date),
              type: transactionData.type,
              categoryId: transactionData.categoryId,
              userId: transactionData.userId,
              executionLogId: transactionData.executionLogId,
              createdAt: new Date(transactionData.createdAt),
              updatedAt: new Date(transactionData.updatedAt),
            }
          });
          
          // Connetti tags se presenti
          if (transactionData.tags && transactionData.tags.length > 0) {
            await prisma.transaction.update({
              where: { id: transaction.id },
              data: {
                tags: {
                  connect: transactionData.tags.map(tag => ({ id: tag.id }))
                }
              }
            });
          }
          
          importStats.transactions++;
          transactionCount++;
          
          // Progress feedback ogni 50 transactions
          if (transactionCount % 50 === 0) {
            console.log(`     📊 ${transactionCount} transactions importate...`);
          }
        }
      }
    }
    
    // Statistiche finali
    console.log('');
    console.log('🎉 Importazione completata!');
    console.log('📊 Statistiche finali:');
    console.log(`   👥 Users: ${importStats.users}`);
    console.log(`   📁 Categories: ${importStats.categories}`);
    console.log(`   💰 Transactions: ${importStats.transactions}`);
    console.log(`   🏷️  Tags: ${importStats.tags}`);
    console.log(`   🔄 Recurrent Payments: ${importStats.recurrentPayments}`);
    console.log(`   💳 Savings Goals: ${importStats.savingsGoals}`);
    console.log(`   🔔 Notifications: ${importStats.notifications}`);
    console.log(`   ⚙️  Notification Preferences: ${importStats.notificationPreferences}`);
    console.log(`   📝 Execution Logs: ${importStats.executionLogs}`);
    
  } catch (error) {
    console.error('❌ Errore durante importazione:', error);
    
    // Informazioni aggiuntive per debug
    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        console.error('💡 Errore: Probabilmente dati duplicati');
        console.error('🔧 Prova a pulire il database PostgreSQL prima dell\'import');
      } else if (error.message.includes('foreign key')) {
        console.error('💡 Errore: Problema con relazioni tra tabelle');
        console.error('🔧 Verifica l\'ordine di importazione dei dati');
      } else if (error.message.includes('connection')) {
        console.error('💡 Errore: Problema di connessione a PostgreSQL');
        console.error('🔧 Verifica che DATABASE_URL sia corretto per PostgreSQL');
      }
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui import
importData()
  .then(() => {
    console.log('');
    console.log('🎉 Importazione completata con successo!');
    console.log('🔗 Verifica su Supabase dashboard: https://app.supabase.com/project/cmwfwxrqbpjamqzuhpxy/editor');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Errore fatale:', error);
    process.exit(1);
  });