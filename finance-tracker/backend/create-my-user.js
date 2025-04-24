// create-my-user.js - Crea un nuovo utente o aggiorna se esiste
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createOrUpdateUser() {
  try {
    // Verifica se l'utente esiste
    const existingUser = await prisma.user.findUnique({
      where: { email: 'andrea.zampierolo@me.com' }
    });

    let user;
    
    if (existingUser) {
      // Aggiorna la password dell'utente esistente
      console.log('Utente trovato, aggiorno la password...');
      
      const hashedPassword = await bcrypt.hash('MandingO', 10);
      user = await prisma.user.update({
        where: { email: 'andrea.zampierolo@me.com' },
        data: {
          password: hashedPassword
        }
      });
      console.log('Password aggiornata con successo per:', user.email);
    } else {
      // Crea un nuovo utente
      console.log('Utente non trovato, creo un nuovo utente...');
      
      const hashedPassword = await bcrypt.hash('MandingO', 10);
      user = await prisma.user.create({
        data: {
          email: 'andrea.zampierolo@me.com',
          password: hashedPassword,
          firstName: 'Andrea',
          lastName: 'Zampierolo'
        }
      });
      console.log('Nuovo utente creato:', user.email);
      
      // Crea le categorie predefinite
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
        { name: "Gifts", icon: "card_giftcard", color: "#FF33FF", isDefault: true },
      ];

      for (const category of defaultCategories) {
        await prisma.category.create({
          data: {
            ...category,
            userId: user.id
          }
        });
      }
      console.log('Categorie predefinite create');
    }
  } catch (e) {
    console.error('Errore durante l\'operazione:', e);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnesso dal database');
  }
}

createOrUpdateUser()
  .catch(e => {
    console.error('Errore critico:', e);
    process.exit(1);
  }); 