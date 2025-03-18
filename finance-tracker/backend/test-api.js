const fs = require('fs');

// Function to check if a file exists
function fileExists(path) {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

// Check core files
const coreFiles = [
  'src/main.ts',
  'src/app.module.ts',
  'prisma/schema.prisma',
  '.env',
  '.env.example',
];

console.log('Checking core files...');
let allCoreFilesExist = true;
for (const file of coreFiles) {
  const exists = fileExists(file);
  console.log(`${file}: ${exists ? '✅' : '❌'}`);
  if (!exists) allCoreFilesExist = false;
}

// Check module files
const modules = [
  {
    name: 'Auth',
    files: [
      'src/auth/auth.module.ts',
      'src/auth/auth.service.ts',
      'src/auth/auth.controller.ts',
      'src/auth/dto/login.dto.ts',
      'src/auth/dto/register.dto.ts',
      'src/auth/strategies/jwt.strategy.ts',
      'src/auth/strategies/local.strategy.ts',
      'src/auth/guards/jwt-auth.guard.ts',
      'src/auth/guards/local-auth.guard.ts',
    ],
  },
  {
    name: 'Users',
    files: [
      'src/users/users.module.ts',
      'src/users/users.service.ts',
      'src/users/users.controller.ts',
      'src/users/dto/update-user.dto.ts',
    ],
  },
  {
    name: 'Categories',
    files: [
      'src/categories/categories.module.ts',
      'src/categories/categories.service.ts',
      'src/categories/categories.controller.ts',
      'src/categories/dto/create-category.dto.ts',
      'src/categories/dto/update-category.dto.ts',
    ],
  },
  {
    name: 'Prisma',
    files: [
      'src/prisma/prisma.module.ts',
      'src/prisma/prisma.service.ts',
    ],
  },
];

console.log('\nChecking module files...');
for (const module of modules) {
  console.log(`\n${module.name} Module:`);
  let allModuleFilesExist = true;
  for (const file of module.files) {
    const exists = fileExists(file);
    console.log(`  ${file}: ${exists ? '✅' : '❌'}`);
    if (!exists) allModuleFilesExist = false;
  }
  console.log(`  ${module.name} Module: ${allModuleFilesExist ? '✅ Complete' : '❌ Incomplete'}`);
}

console.log('\nSummary:');
console.log(`Core Files: ${allCoreFilesExist ? '✅ Complete' : '❌ Incomplete'}`);
for (const module of modules) {
  let allModuleFilesExist = true;
  for (const file of module.files) {
    if (!fileExists(file)) {
      allModuleFilesExist = false;
      break;
    }
  }
  console.log(`${module.name} Module: ${allModuleFilesExist ? '✅ Complete' : '❌ Incomplete'}`);
}

console.log('\nNext steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Generate Prisma client: npx prisma generate');
console.log('3. Run database migrations: npx prisma migrate dev');
console.log('4. Start the development server: npm run start:dev'); 