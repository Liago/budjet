#!/usr/bin/env node

/**
 * 🔧 SCRIPT PER CREARE/VERIFICARE L'UTENTE ANDREA
 * Questo script crea l'utente con le credenziali corrette nel database
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Carica le variabili d'ambiente
require('dotenv').config({ path: '.env.production' });

console.log('👤 GESTIONE UTENTE ANDREA');
console.log('=========================');

async function manageAndreaUser() {
  const prisma = new PrismaClient();
  
  try {
    // Verifica connessione database
    console.log('🔗 Verificando connessione database...');
    await prisma.$connect();
    console.log('✅ Connessione database stabilita');
    
    // Dati utente Andrea
    const andreaData = {
      email: 'andrea.zampierolo@me.com',
      password: 'Mandingo',
      firstName: 'Andrea',
      lastName: 'Zampierolo'
    };
    
    console.log(`\n👤 Gestendo utente: ${andreaData.email}`);
    
    // 1. Verifica se l'utente esiste già
    console.log('🔍 Verificando se l\'utente esiste...');
    const existingUser = await prisma.user.findUnique({
      where: { email: andreaData.email }
    });
    
    if (existingUser) {
      console.log('✅ Utente trovato nel database');
      console.log(`📋 ID: ${existingUser.id}`);
      console.log(`📧 Email: ${existingUser.email}`);
      console.log(`👤 Nome: ${existingUser.firstName} ${existingUser.lastName}`);
      console.log(`🔐 Ha password: ${!!existingUser.password}`);
      console.log(`📅 Creato il: ${existingUser.createdAt}`);
      
      // Verifica la password
      console.log('\n🔐 Verificando password...');
      try {
        const passwordMatch = await bcrypt.compare(andreaData.password, existingUser.password);
        if (passwordMatch) {
          console.log('✅ Password corretta! L\'utente dovrebbe poter fare login.');
        } else {
          console.log('❌ Password NON corrisponde! Aggiornando...');
          
          // Aggiorna la password
          const hashedPassword = await bcrypt.hash(andreaData.password, 10);
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { password: hashedPassword }
          });
          
          console.log('✅ Password aggiornata con successo!');
        }
      } catch (error) {
        console.error('❌ Errore verifica password:', error.message);
        
        // Se c'è un errore, rigenera la password
        console.log('🔧 Rigenerando password...');
        const hashedPassword = await bcrypt.hash(andreaData.password, 10);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { password: hashedPassword }
        });
        console.log('✅ Password rigenerata!');
      }
      
    } else {
      console.log('❌ Utente NON trovato. Creando nuovo utente...');
      
      // Hash della password
      console.log('🔐 Hashing password...');
      const hashedPassword = await bcrypt.hash(andreaData.password, 10);
      
      // Crea l'utente
      const newUser = await prisma.user.create({
        data: {
          email: andreaData.email,
          password: hashedPassword,
          firstName: andreaData.firstName,
          lastName: andreaData.lastName
        }
      });
      
      console.log('✅ Utente creato con successo!');
      console.log(`📋 ID: ${newUser.id}`);
      console.log(`📧 Email: ${newUser.email}`);
      console.log(`👤 Nome: ${newUser.firstName} ${newUser.lastName}`);
      
      // Crea categorie di default
      console.log('📁 Creando categorie di default...');
      const defaultCategories = [
        { name: "Food", icon: "restaurant", color: "#FF5733", isDefault: true },
        { name: "Transportation", icon: "directions_car", color: "#33FF57", isDefault: true },
        { name: "Housing", icon: "home", color: "#3357FF", isDefault: true },
        { name: "Entertainment", icon: "movie", color: "#FF33F5", isDefault: true },
        { name: "Shopping", icon: "shopping_cart", color: "#F5FF33", isDefault: true },
        { name: "Utilities", icon: "power", color: "#33FFF5", isDefault: true },
        { name: "Healthcare", icon: "local_hospital", color: "#FF3333", isDefault: true },
        { name: "Salary", icon: "attach_money", color: "#33FF33", isDefault: true },
        { name: "Investments", icon: "trending_up", color: "#3333FF", isDefault: true },
        { name: "Gifts", icon: "card_giftcard", color: "#FF33FF", isDefault: true }
      ];
      
      await prisma.category.createMany({
        data: defaultCategories.map(category => ({
          ...category,
          userId: newUser.id
        }))
      });
      
      console.log('✅ Categorie di default create!');
    }
    
    // Test finale di verifica
    console.log('\n🧪 TEST FINALE DI VERIFICA');
    console.log('==========================');
    
    const finalUser = await prisma.user.findUnique({
      where: { email: andreaData.email }
    });
    
    if (finalUser) {
      const passwordTest = await bcrypt.compare(andreaData.password, finalUser.password);
      
      console.log(`✅ Utente presente: ${finalUser.email}`);
      console.log(`✅ Password corretta: ${passwordTest ? 'SÌ' : 'NO'}`);
      
      if (passwordTest) {
        console.log('\n🎉 SUCCESSO! L\'utente Andrea può ora fare login con:');
        console.log(`   📧 Email: ${andreaData.email}`);
        console.log(`   🔐 Password: ${andreaData.password}`);
      } else {
        console.log('\n❌ PROBLEMA: La password non corrisponde ancora');
      }
    } else {
      console.log('❌ ERRORE: Utente non trovato dopo la creazione');
    }
    
    // Conta tutti gli utenti
    const userCount = await prisma.user.count();
    console.log(`\n📊 Totale utenti nel database: ${userCount}`);
    
  } catch (error) {
    console.error('❌ ERRORE:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    
    if (error.code === 'P1001') {
      console.log('\n🔧 SOLUZIONE: Problema di connessione database');
      console.log('1. Verifica che DATABASE_URL sia corretto in .env.production');
      console.log('2. Verifica che Supabase sia accessibile');
      console.log('3. Controlla le credenziali del database');
    }
    
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Connessione database chiusa');
  }
}

// Esegui lo script
manageAndreaUser().catch(error => {
  console.error('💥 ERRORE FATALE:', error);
  process.exit(1);
});
