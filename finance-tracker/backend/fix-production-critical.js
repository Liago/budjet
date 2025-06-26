#!/usr/bin/env node

/**
 * 🔧 SCRIPT CRITICO PER PRODUZIONE NETLIFY
 * Risolve tutti i problemi identificati per il deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Fixing production critical issues...');

// 1. 🔧 Fix UsersService injection (again, to be sure)
const usersServicePath = path.join(__dirname, 'src', 'users', 'users.service.ts');
if (fs.existsSync(usersServicePath)) {
  let content = fs.readFileSync(usersServicePath, 'utf8');
  
  // Check if still has old injection pattern
  if (content.includes('@Inject(DATABASE_PROVIDER)')) {
    console.log('❌ Found old injection pattern in UsersService, fixing...');
    
    // Replace injection pattern
    content = content.replace(
      /constructor\(\s*@Inject\(DATABASE_PROVIDER\)\s*private\s+db:\s*PrismaService\s*\)/g,
      'constructor(private prisma: PrismaService)'
    );
    
    // Replace usage pattern
    content = content.replace(/this\.db\./g, 'this.prisma.');
    
    fs.writeFileSync(usersServicePath, content);
    console.log('✅ UsersService injection pattern fixed');
  } else {
    console.log('✅ UsersService already has correct injection pattern');
  }
}

// 2. 🔧 Force PostgreSQL schema
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  
  if (schema.includes('provider = "sqlite"')) {
    console.log('❌ Schema still uses SQLite, forcing PostgreSQL...');
    schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
    fs.writeFileSync(schemaPath, schema);
    console.log('✅ Schema forced to PostgreSQL');
  } else {
    console.log('✅ Schema already uses PostgreSQL');
  }
}

// 3. 🔧 Check critical environment variables
console.log('🔧 Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'SET (length: ' + process.env.DATABASE_URL.length + ')' : 'NOT SET');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET (length: ' + process.env.JWT_SECRET.length + ')' : 'NOT SET');

// 4. 🔧 Check if any other services use old injection pattern
const srcPath = path.join(__dirname, 'src');
const checkServiceFiles = (dir) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      checkServiceFiles(fullPath);
    } else if (file.endsWith('.service.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('@Inject(DATABASE_PROVIDER)')) {
        console.log(`❌ Found old injection in: ${fullPath}`);
        // Fix it
        const fixed = content
          .replace(
            /constructor\(\s*@Inject\(DATABASE_PROVIDER\)\s*private\s+db:\s*PrismaService\s*\)/g,
            'constructor(private prisma: PrismaService)'
          )
          .replace(/this\.db\./g, 'this.prisma.');
        
        fs.writeFileSync(fullPath, fixed);
        console.log(`✅ Fixed injection in: ${fullPath}`);
      }
    }
  });
};

if (fs.existsSync(srcPath)) {
  checkServiceFiles(srcPath);
}

console.log('🎉 Production critical fixes completed!');
console.log('');
console.log('📋 Next steps:');
console.log('1. git add .');
console.log('2. git commit -m "fix: production critical issues resolved"');
console.log('3. git push origin main');
console.log('4. Redeploy both frontend and backend on Netlify'); 