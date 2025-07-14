# 🔧 GUIDA RISOLUZIONE PROBLEMA LOGIN 401

## 🎯 Problema
Il login del backend su Netlify ritorna errore 401 "Invalid email or password"

## 🔍 Strumenti di Diagnostica Creati

### 1. Strumento Web di Debug React
- **File**: Artifact "Strumento di Debug per API Netlify" 
- **Descrizione**: Interfaccia React per testare l'API direttamente dal browser
- **Come usare**: Apri l'artifact, inserisci le credenziali e clicca "Esegui Diagnostica Completa"

### 2. Script di Debug da Terminale  
- **File**: `debug-login-netlify.js`
- **Descrizione**: Script completo per testare tutti gli endpoint da terminale
- **Come usare**: 
  ```bash
  cd /Users/andreazampierolo/Projects/Bud-Jet/finance-tracker/backend
  node debug-login-netlify.js
  ```

### 3. Script di Gestione Utente Andrea
- **File**: `setup-andrea-user.js`
- **Descrizione**: Crea/verifica l'utente Andrea nel database
- **Come usare**:
  ```bash
  cd /Users/andreazampierolo/Projects/Bud-Jet/finance-tracker/backend
  node setup-andrea-user.js
  ```

## 🔄 PROCESSO DI RISOLUZIONE STEP-BY-STEP

### Step 1: Esegui Diagnostica Completa
```bash
# Naviga alla cartella backend
cd /Users/andreazampierolo/Projects/Bud-Jet/finance-tracker/backend

# Esegui lo script di debug
node debug-login-netlify.js
```

**Cosa analizzare:**
- ✅ Se connectivity test passa → Backend deployato correttamente
- ✅ Se CORS test passa → Configurazione CORS OK
- ✅ Se registration test passa → Database connesso
- ✅ Se test-login passes → AuthService funziona
- ❌ Se normal login fallisce → Problema Guards o credenziali

### Step 2: Verifica/Crea Utente Andrea
```bash
# Assicurati che le env vars siano caricate
source .env.production

# Esegui script di gestione utente
node setup-andrea-user.js
```

**Cosa fa:**
- Verifica se l'utente esiste nel database
- Se non esiste, lo crea con le credenziali corrette
- Se esiste, verifica/aggiorna la password
- Crea categorie di default

### Step 3: Test Specifici

#### Test A: Verifica che il backend sia raggiungibile
```bash
curl -X GET "https://bud-jet-be.netlify.app/.netlify/functions/api/" \
  -H "Content-Type: application/json" \
  -H "Origin: https://bud-jet.netlify.app"
```

#### Test B: Test registration
```bash
curl -X POST "https://bud-jet-be.netlify.app/.netlify/functions/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "Origin: https://bud-jet.netlify.app" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

#### Test C: Test login normale
```bash
curl -X POST "https://bud-jet-be.netlify.app/.netlify/functions/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "Origin: https://bud-jet.netlify.app" \
  -d '{"email":"andrea.zampierolo@me.com","password":"Mandingo"}'
```

#### Test D: Test debug login (bypassa guards)
```bash
curl -X POST "https://bud-jet-be.netlify.app/.netlify/functions/api/auth/test-login" \
  -H "Content-Type: application/json" \
  -H "Origin: https://bud-jet.netlify.app" \
  -d '{"email":"andrea.zampierolo@me.com","password":"Mandingo"}'
```

## 🔍 POSSIBILI CAUSE E SOLUZIONI

### Causa 1: Utente non esiste nel database
**Sintomi**: 
- Registration restituisce 201 (OK)
- Login restituisce 401 (Unauthorized)

**Soluzione**:
```bash
node setup-andrea-user.js
```

### Causa 2: Password errata o hash non valido
**Sintomi**:
- Debug login restituisce `{ success: false, message: "Invalid credentials" }`

**Soluzione**:
1. Esegui `node setup-andrea-user.js` per rigenerare la password
2. Verifica che la password sia "Mandingo" (case-sensitive)

### Causa 3: Problema con Passport Guards
**Sintomi**:
- Debug login funziona (200 OK)
- Login normale fallisce (401)

**Soluzione**:
1. Controlla `src/auth/strategies/local.strategy.ts`
2. Verifica dependency injection in `AuthModule`
3. Potrebbe essere necessario rifare il build/deploy

### Causa 4: Database non connesso
**Sintomi**:
- Registration restituisce 500
- Errori di timeout o connessione

**Soluzione**:
1. Verifica DATABASE_URL in variabili ambiente Netlify
2. Testa connessione Supabase manualmente
3. Controlla che il database sia attivo

### Causa 5: Variabili ambiente mancanti
**Sintomi**:
- Errori 500 su tutti gli endpoint
- JWT errors

**Soluzione**:
1. Vai su Netlify Dashboard > Site Settings > Environment Variables
2. Verifica che siano impostate:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `CORS_ORIGIN`

## 🚀 COMANDI QUICK FIX

### Fix Completo (Esegui tutto in sequenza)
```bash
cd /Users/andreazampierolo/Projects/Bud-Jet/finance-tracker/backend

# 1. Verifica/crea utente
node setup-andrea-user.js

# 2. Esegui diagnostica completa  
node debug-login-netlify.js

# 3. Se necessario, rebuild e redeploy
npm run build:netlify
```

### Redeploy Emergency
```bash
# Se tutto fallisce, forza un redeploy
cd /Users/andreazampierolo/Projects/Bud-Jet/finance-tracker/backend

# Build
npm run build:netlify

# Commit and push per triggerare redeploy
git add .
git commit -m "fix: login issue debug"
git push origin main
```

## 📋 CHECKLIST RISOLUZIONE

- [ ] Backend raggiungibile (test connectivity)
- [ ] CORS configurato (test preflight)
- [ ] Database connesso (test registration)
- [ ] Utente Andrea esiste nel DB
- [ ] Password Andrea corretta
- [ ] AuthService funziona (test debug login)
- [ ] Guards funzionano (test normal login)
- [ ] Variables ambiente configurate su Netlify

## 🆘 Se Nulla Funziona

1. **Controlla i log di Netlify**:
   - Vai su Netlify Dashboard
   - Functions > View logs
   - Cerca errori durante il runtime

2. **Verifica database Supabase**:
   - Apri Supabase Dashboard
   - Table Editor > users
   - Verifica che l'utente esista

3. **Ricrea da zero**:
   ```bash
   # Pulisci e ricrea
   rm -rf node_modules dist
   npm install
   npm run build:netlify
   ```

4. **Contatta supporto**:
   - Invia i log di debug
   - Invia screenshot degli errori
   - Specifica quando ha smesso di funzionare

## 📞 Comandi di Emergenza

```bash
# Test rapido connessione
curl -I https://bud-jet-be.netlify.app/.netlify/functions/api/

# Log dell'ultima build
netlify functions:list

# Redeploy manuale
netlify deploy --prod --dir=dist
```
