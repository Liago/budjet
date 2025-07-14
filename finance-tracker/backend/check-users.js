#!/usr/bin/env node

/**
 * 🔧 CHECK USER IN DATABASE - Verifica se ci sono utenti nel database
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function checkUsers() {
  console.log('👥 CHECKING USERS IN DATABASE');
  console.log('=============================');
  
  const prisma = new PrismaClient();
  
  try {
    console.log('🔗 Connecting to database...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('⚠️ NO USERS FOUND!');
      console.log('💡 This might be why login fails');
      console.log('🔧 Create a test user first');
    } else {
      // Get first few users (without passwords)
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true
        },
        take: 5
      });
      
      console.log('👤 Users in database:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.firstName} ${user.lastName})`);
      });
      
      // Check if test user exists
      const testUser = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
        select: { id: true, email: true, firstName: true }
      });
      
      if (testUser) {
        console.log('✅ Test user (test@example.com) exists');
      } else {
        console.log('❌ Test user (test@example.com) NOT found');
        console.log('💡 Need to register first or use different credentials');
      }
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.log('🔍 Make sure DATABASE_URL is correct in .env');
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
