#!/bin/bash

# Script di deploy con verifica delle variabili d'ambiente
# Per il progetto Bud-Jet

set -e

echo "🚀 Bud-Jet Deploy Script con Fix CORS"
echo "======================================"

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per logging colorato
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Verifica che siamo nella directory corretta
if [ ! -f "package.json" ]; then
    log_error "Questo script deve essere eseguito dalla directory frontend/web"
    exit 1
fi

# 2. Verifica variabili d'ambiente locali
log_info "Verificando variabili d'ambiente locali..."

if [ ! -f ".env.production" ]; then
    log_warning "File .env.production non trovato, creandolo..."
    cat > .env.production << EOF
VITE_API_URL=https://bud-jet-be.netlify.app/.netlify/functions/api
VITE_ENV=production
EOF
    log_success "File .env.production creato"
else
    log_success "File .env.production trovato"
fi

# Mostra contenuto delle variabili d'ambiente
echo ""
log_info "Contenuto file .env.production:"
cat .env.production
echo ""

# 3. Test connessione backend
log_info "Testando connessione al backend..."

BACKEND_URL="https://bud-jet-be.netlify.app/.netlify/functions/diagnose-url"
if curl -s -f "$BACKEND_URL" > /dev/null; then
    log_success "Backend raggiungibile su: $BACKEND_URL"
else
    log_error "Backend NON raggiungibile. Verifica che il backend sia deployato."
    read -p "Vuoi continuare comunque? (y/N): " continue_deploy
    if [[ ! $continue_deploy =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 4. Pulizia build precedente
log_info "Pulendo build precedente..."
rm -rf dist node_modules/.vite
log_success "Build precedente pulita"

# 5. Reinstallazione dipendenze (per sicurezza)
log_info "Reinstallando dipendenze..."
npm ci --include=optional
log_success "Dipendenze installate"

# 6. Build del progetto
log_info "Building del progetto per produzione..."
npm run build:prod

# Verifica che il build sia riuscito
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    log_error "Build fallito o directory dist vuota"
    exit 1
fi

log_success "Build completato con successo!"

# 7. Verifica file di build
echo ""
log_info "File nella directory dist:"
ls -la dist/
echo ""

# 8. Verifica che l'API URL sia corretto nel build
log_info "Verificando configurazione API nel build..."
if grep -r "bud-jet-be\.netlify\.app" dist/ > /dev/null 2>&1; then
    log_success "URL API corretto trovato nel build"
else
    log_warning "URL API potrebbe non essere corretto nel build"
fi

# 9. Test di smoke del build
log_info "Eseguendo test di smoke del build..."
if command -v npx > /dev/null; then
    echo "Avviando server di preview per 5 secondi..."
    timeout 5s npx vite preview --port 4173 --host &
    PREVIEW_PID=$!
    sleep 2
    
    if curl -s -f "http://localhost:4173" > /dev/null; then
        log_success "Build funziona correttamente in preview"
    else
        log_warning "Preview non risponde, ma il build potrebbe essere comunque valido"
    fi
    
    kill $PREVIEW_PID 2>/dev/null || true
fi

# 10. Istruzioni per il deploy su Netlify
echo ""
log_info "🎯 ISTRUZIONI PER IL DEPLOY SU NETLIFY:"
echo ""
echo "1. BACKEND (se non già fatto):"
echo "   - Vai nella directory backend: cd ../../../backend"
echo "   - Fai push delle modifiche CORS: git add . && git commit -m 'fix: CORS configuration'"
echo "   - Aspetta che Netlify ribuildi il backend"
echo ""
echo "2. FRONTEND:"
echo "   - Verifica variabili d'ambiente su Netlify Dashboard:"
echo "     → Site settings → Environment variables"
echo "     → Aggiungi: VITE_API_URL=https://bud-jet-be.netlify.app/.netlify/functions/api"
echo "   - Fai deploy di questo build:"
echo "     → git add . && git commit -m 'fix: frontend API configuration'"
echo "     → git push origin main"
echo ""
echo "3. VERIFICA:"
echo "   - Aspetta che entrambi i deploy siano completati"
echo "   - Vai su https://[tuo-frontend].netlify.app/auth/login"
echo "   - Apri DevTools e prova a fare login"
echo "   - Se vedi ancora errori CORS, controlla i log su Netlify Functions"
echo ""

# 11. Crea file di test per verifica CORS
log_info "Creando file di test CORS..."
cat > dist/test-cors.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Bud-Jet CORS Test</title>
    <style>
        body { font-family: Arial; margin: 40px; }
        .test { margin: 20px 0; padding: 10px; border: 1px solid #ddd; }
        .success { background: #d4edda; }
        .error { background: #f8d7da; }
        button { padding: 10px 20px; margin: 5px; }
    </style>
</head>
<body>
    <h1>🔧 Bud-Jet CORS Test</h1>
    <p>Usa questo test per verificare la connessione API dopo il deploy.</p>
    
    <button onclick="testAPI()">Test Connessione API</button>
    <button onclick="testCORS()">Test CORS Preflight</button>
    <button onclick="testLogin()">Test Login</button>
    
    <div id="results"></div>

    <script>
        const API_URL = 'https://bud-jet-be.netlify.app/.netlify/functions/api';
        
        function addResult(test, success, message) {
            const div = document.createElement('div');
            div.className = 'test ' + (success ? 'success' : 'error');
            div.innerHTML = `<strong>${test}:</strong> ${message}`;
            document.getElementById('results').appendChild(div);
        }
        
        async function testAPI() {
            try {
                const response = await fetch(API_URL + '/health');
                if (response.ok) {
                    const data = await response.text();
                    addResult('API Health', true, 'Connessione riuscita: ' + data);
                } else {
                    addResult('API Health', false, 'Status: ' + response.status);
                }
            } catch (error) {
                addResult('API Health', false, 'Errore: ' + error.message);
            }
        }
        
        async function testCORS() {
            try {
                const response = await fetch(API_URL + '/auth/login', {
                    method: 'OPTIONS',
                    headers: {
                        'Origin': window.location.origin,
                        'Access-Control-Request-Method': 'POST',
                        'Access-Control-Request-Headers': 'Content-Type'
                    }
                });
                
                if (response.ok) {
                    addResult('CORS Preflight', true, 'Headers CORS presenti e validi');
                } else {
                    addResult('CORS Preflight', false, 'Status: ' + response.status);
                }
            } catch (error) {
                addResult('CORS Preflight', false, 'Errore: ' + error.message);
            }
        }
        
        async function testLogin() {
            try {
                const response = await fetch(API_URL + '/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: 'test@example.com',
                        password: 'wrong'
                    })
                });
                
                // Anche un 401 è un successo CORS
                if (response.status === 401) {
                    addResult('Login Test', true, 'CORS funziona (credenziali sbagliate ma richiesta passata)');
                } else if (response.ok) {
                    addResult('Login Test', true, 'Login riuscito (inaspettato con credenziali di test)');
                } else {
                    addResult('Login Test', false, 'Status imprevisto: ' + response.status);
                }
            } catch (error) {
                addResult('Login Test', false, 'Errore CORS: ' + error.message);
            }
        }
    </script>
</body>
</html>
EOF

log_success "File test-cors.html creato in dist/"

echo ""
log_success "🎉 DEPLOY PREPARATION COMPLETATO!"
echo ""
log_info "Dopo aver deployato su Netlify, puoi testare CORS visitando:"
echo "https://[tuo-frontend].netlify.app/test-cors.html"
echo ""
log_warning "RICORDA: Configura le variabili d'ambiente su Netlify!"
echo "VITE_API_URL=https://bud-jet-be.netlify.app/.netlify/functions/api"