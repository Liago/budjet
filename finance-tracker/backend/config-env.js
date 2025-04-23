// config-env.js
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function setupEnvironment() {
  // Determine environment
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(`Setting up environment for: ${nodeEnv}`);
  
  // Load the appropriate .env file
  const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
  
  if (!fs.existsSync(path.join(__dirname, envFile))) {
    console.error(`Error: ${envFile} not found!`);
    process.exit(1);
  }
  
  // Copy the environment file to .env
  fs.copyFileSync(
    path.join(__dirname, envFile),
    path.join(__dirname, '.env')
  );
  
  // Load the environment variables
  dotenv.config();
  
  // Update the Prisma schema based on environment
  const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Replace provider based on environment
  if (nodeEnv === 'development') {
    console.log('Setting database provider to: sqlite');
    schemaContent = schemaContent.replace(
      /provider = "postgresql"/,
      'provider = "sqlite"'
    );
  } else {
    console.log('Setting database provider to: postgresql');
    schemaContent = schemaContent.replace(
      /provider = "sqlite"/,
      'provider = "postgresql"'
    );
  }
  
  // Write the updated schema
  fs.writeFileSync(schemaPath, schemaContent);
  
  console.log('Prisma schema updated for ' + nodeEnv);
  console.log('Environment configuration completed successfully');
}

setupEnvironment(); 