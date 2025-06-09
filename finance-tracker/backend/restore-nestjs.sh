#!/bin/bash

echo "🔄 Ripristinando la configurazione NestJS normale..."

# Ripristina la function NestJS originale
if [ -f "netlify/functions/api-nestjs.ts" ]; then
    mv netlify/functions/api-nestjs.ts netlify/functions/api.ts
    echo "✅ Function NestJS ripristinata"
else
    echo "❌ Backup api-nestjs.ts non trovato!"
    exit 1
fi

# Ripristina il build script normale
cat > netlify.toml << 'EOF'
[build]
  command = "chmod +x build-netlify.sh && ./build-netlify.sh"
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--production=false"

[functions]
  node_bundler = "nft"

# Redirect per API - IMPORTANTE: questo cattura tutte le richieste API
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
  force = true

# Headers globali per CORS - backup per tutti i file
[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization, x-requested-with, Accept, Origin"

# Headers specifici per le functions
[[headers]]
  for = "/.netlify/functions/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization, x-requested-with, Accept, Origin"
    Access-Control-Allow-Credentials = "true"
EOF

echo "✅ netlify.toml ripristinato con build NestJS"

echo "🚀 Ora puoi deployare la versione completa con:"
echo "git add ."
echo "git commit -m 'restore: back to full NestJS function'"
echo "git push origin main"
