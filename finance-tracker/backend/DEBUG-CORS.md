# 🔧 Debug Guide - Bud-Jet Backend CORS Fix

## 📋 Problema Risolto

**Errore originale:**
```
Access to XMLHttpRequest at 'https://budjet-backend.netlify.app/.netlify/functions/api/auth/login' 
from origin 'https://bud-jet.netlify.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Modifiche Applicate

### 1. **Netlify Function (api.ts)**
- ✅ Gestione immediata delle richieste OPTIONS preflight
- ✅ Headers CORS sempre presenti in tutte le risposte
- ✅ Configurazione CORS permissiva per il debug
- ✅ Logging migliorato per il debug

### 2. **Configurazione Netlify (netlify.toml)**
- ✅ Headers CORS globali come backup
- ✅ Headers specifici per le functions
- ✅ Redirect API correttamente configurati

### 3. **PrismaService**
- ✅ Retry logic per connessioni database
- ✅ Gestione ottimizzata per ambiente serverless
- ✅ Health check robusto

### 4. **AuthService & LocalStrategy**
- ✅ Logging dettagliato per debug
- ✅ Gestione errori migliorata
- ✅ Validazione input più robusta

## 🧪 Testing

### Test Locale della Function
```bash
npm run test:netlify
```

### Test CORS dal Browser
1. Apri `test-cors.html` nel browser
2. Inserisci l'URL del backend: `https://budjet-backend.netlify.app`
3. Esegui i test per verificare CORS

### Test degli Endpoint
```bash
# Health check
curl -X GET https://budjet-backend.netlify.app/.netlify/functions/api/health

# OPTIONS preflight
curl -X OPTIONS https://budjet-backend.netlify.app/.netlify/functions/api/auth/login \
  -H "Origin: https://bud-jet.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization"

# Login test
curl -X POST https://budjet-backend.netlify.app/.netlify/functions/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://bud-jet.netlify.app" \
  -d '{"email":"test@example.com","password":"testpassword"}'
```

## 🚀 Deploy

### Deploy Automatico
```bash
npm run deploy:netlify
```

### Deploy Manuale
```bash
git add .
git commit -m "fix: CORS configuration for auth endpoints"
git push origin main
```

## 🔍 Verifica delle Variabili d'Ambiente su Netlify

Assicurati che su **Netlify Dashboard** → **Site Settings** → **Environment Variables** siano configurate:

```env
DATABASE_URL=postgresql://postgres.cmwfwxrqbpjamqzuhpxy:ua4dpMvaXKdwYjjU@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=1d
NETLIFY=true
```

## 🐛 Debug dei Log Netlify

1. Vai su **Netlify Dashboard** → **Functions**
2. Clicca su `api` function
3. Vai su **View logs**
4. Cerca i log con emoji per identificare rapidamente i problemi:
   - 🚀 = Inizializzazione function
   - 🔄 = Gestione richieste
   - ✅ = Operazioni riuscite
   - ❌ = Errori

## 📊 Checklist di Verifica

- [ ] La richiesta OPTIONS restituisce status 200
- [ ] Tutti i response hanno l'header `Access-Control-Allow-Origin`
- [ ] Il database si connette correttamente (health check)
- [ ] I log mostrano la corretta trasformazione dei path
- [ ] Le variabili d'ambiente sono configurate su Netlify

## ⚡ Prossimi Passi

1. **Deploy delle modifiche**
2. **Test CORS dal browser**
3. **Verifica funzionamento login**
4. **Monitoraggio log per 24h**
5. **Ottimizzazione CORS per produzione** (restringere gli origin permessi)

## 🎯 Configurazione CORS per Produzione

Una volta verificato che tutto funziona, aggiorna la configurazione CORS in `api.ts` per essere più restrittiva:

```typescript
const allowedOrigins = [
  'https://bud-jet.netlify.app',
  'https://bud-jet-frontend.netlify.app'
];
```

---

**🔗 Link Utili:**
- Frontend: https://bud-jet.netlify.app
- Backend: https://budjet-backend.netlify.app
- Health Check: https://budjet-backend.netlify.app/.netlify/functions/api/health
