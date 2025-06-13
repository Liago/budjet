#!/usr/bin/env node

// Script per modificare dinamicamente il provider nel schema Prisma
// Usage: node set-schema-provider.js [sqlite|postgresql]

const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const BACKUP_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma.backup');

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[34m',    // Blue
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };
  
  const icons = {
    info: 'ℹ️ ',
    success: '✅',
    warning: '⚠️ ',
    error: '❌'
  };
  
  console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
}

function createBackup() {
  if (fs.existsSync(SCHEMA_PATH)) {
    fs.copyFileSync(SCHEMA_PATH, BACKUP_PATH);
    log('Schema backup created');
  }
}

function restoreBackup() {
  if (fs.existsSync(BACKUP_PATH)) {
    fs.copyFileSync(BACKUP_PATH, SCHEMA_PATH);
    fs.unlinkSync(BACKUP_PATH);
    log('Schema restored from backup');
    return true;
  }
  return false;
}

function modifySchema(provider) {
  if (!fs.existsSync(SCHEMA_PATH)) {
    log('Schema file not found!', 'error');
    process.exit(1);
  }
  
  // Create backup before modifying
  createBackup();
  
  let schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  let modified = false;
  
  // Modify provider
  if (provider === 'postgresql') {
    if (schema.includes('provider = "sqlite"')) {
      schema = schema.replace(/provider = "sqlite"/g, 'provider = "postgresql"');
      modified = true;
      log('Provider changed from sqlite to postgresql');
    }
    
    // PostgreSQL-specific adjustments
    // Change uuid() to cuid() for better PostgreSQL compatibility
    if (schema.includes('@default(uuid())')) {
      schema = schema.replace(/@default\(uuid\(\)\)/g, '@default(cuid())');
      log('UUID functions updated for PostgreSQL compatibility');
    }
    
  } else if (provider === 'sqlite') {
    if (schema.includes('provider = "postgresql"')) {
      schema = schema.replace(/provider = "postgresql"/g, 'provider = "sqlite"');
      modified = true;
      log('Provider changed from postgresql to sqlite');
    }
    
    // SQLite-specific adjustments
    // Keep cuid() as it works with both databases
    
  } else {
    log(`Unknown provider: ${provider}`, 'error');
    log('Valid providers: sqlite, postgresql', 'error');
    process.exit(1);
  }
  
  if (modified) {
    fs.writeFileSync(SCHEMA_PATH, schema);
    log(`Schema updated for ${provider}`, 'success');
  } else {
    log(`Schema already configured for ${provider}`, 'info');
    // Remove backup if no changes were made
    if (fs.existsSync(BACKUP_PATH)) {
      fs.unlinkSync(BACKUP_PATH);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log('Usage: node set-schema-provider.js [sqlite|postgresql|restore]', 'error');
    process.exit(1);
  }
  
  const command = args[0].toLowerCase();
  
  if (command === 'restore') {
    if (restoreBackup()) {
      log('Schema restoration completed', 'success');
    } else {
      log('No backup found to restore', 'warning');
    }
    return;
  }
  
  // Environment detection for auto mode
  if (command === 'auto') {
    const isNetlify = process.env.NETLIFY === 'true' || process.env.LAMBDA_TASK_ROOT;
    const isProduction = process.env.NODE_ENV === 'production';
    const databaseUrl = process.env.DATABASE_URL;
    
    let autoProvider = 'sqlite'; // default
    
    if (isNetlify || isProduction) {
      if (databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'))) {
        autoProvider = 'postgresql';
      }
    }
    
    log(`Auto-detected environment:`);
    log(`  - NETLIFY: ${isNetlify}`);
    log(`  - NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    log(`  - DATABASE_URL: ${databaseUrl ? databaseUrl.substring(0, 30) + '...' : 'not set'}`);
    log(`  - Selected provider: ${autoProvider}`);
    
    modifySchema(autoProvider);
    return;
  }
  
  // Manual provider selection
  if (['sqlite', 'postgresql'].includes(command)) {
    modifySchema(command);
  } else {
    log(`Invalid command: ${command}`, 'error');
    log('Valid commands: sqlite, postgresql, restore, auto', 'error');
    process.exit(1);
  }
}

// Handle process termination to restore backup
process.on('SIGINT', () => {
  log('\nProcess interrupted, restoring schema...', 'warning');
  restoreBackup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Process terminated, restoring schema...', 'warning');
  restoreBackup();
  process.exit(0);
});

if (require.main === module) {
  main();
}