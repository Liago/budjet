// create-test-user.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestUser() {
  // Prima elimina l'utente esistente se esiste
  try {
    await prisma.user.delete({
      where: { email: 'test@example.com' }
    });
    console.log('Utente esistente eliminato');
  } catch (e) {
    console.log('Nessun utente da eliminare');
  }

  // Crea un nuovo utente
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User'
    }
  });
  console.log('Utente creato:', user);
  
  // Crea anche le categorie predefinite
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
  
  console.log('Categorie create');
  await prisma.$disconnect();
}

createTestUser()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 