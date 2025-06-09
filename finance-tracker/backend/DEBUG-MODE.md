# 🔧 DEBUG MODE - Test CORS

## 🎯 **Cosa Ho Fatto**

Per isolare il problema CORS, ho temporaneamente sostituito la function NestJS complessa con una versione semplificata che:

1. ✅ **Gestisce CORS correttamente** senza dipendenze complesse
2. ✅ **Risponde immediatamente alle richieste OPTIONS** 
3. ✅ **Ha logging dettagliato** per il debug
4. ✅ **Non dipende da database o NestJS** (nessun crash possibile)

## 📁 **File Modificati Temporaneamente**

- `netlify/functions/api.ts` → **versione semplificata per test CORS**
- `netlify/functions/api-nestjs.ts` → **backup della versione originale NestJS**
- `netlify.toml` → **build semplificato**
- `build-debug.sh` → **script di build minimale**

## 🚀 **Deploy di Test**

```bash
# Deploy questa versione semplificata
git add .
git commit -m "debug: simplified function for CORS testing"
git push origin main
```

## 🧪 **Test da Fare**

Dopo il deploy, testa questi endpoint:

### 1. Health Check
```bash
curl -X GET https://budjet-backend.netlify.app/.netlify/functions/api/health
```

### 2. OPTIONS Preflight
```bash
curl -X OPTIONS https://budjet-backend.netlify.app/.netlify/functions/api/auth/login \
  -H "Origin: https://bud-jet.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
```

### 3. Dal Frontend
Prova il login dal tuo frontend - ora NON dovrebbe più avere errori CORS, ma riceverai un errore 501 "Not implemented in debug mode" (che è normale).

## ✅ **Se CORS Funziona**

Se questi test passano, significa che il problema era nella function NestJS complessa. 

### Per ripristinare la versione NestJS:

```bash
# Ripristina i file originali
mv netlify/functions/api-nestjs.ts netlify/functions/api.ts
```

E poi aggiorna `netlify.toml`:
```toml
[build]
  command = "chmod +x build-netlify.sh && ./build-netlify.sh"
```

## ❌ **Se CORS Non Funziona Ancora**

Se anche questa versione semplificata ha problemi CORS, allora il problema è nella configurazione Netlify o nelle variabili d'ambiente.

## 🔍 **Log di Debug**

Dopo il deploy, controlla i log su:
- Netlify Dashboard → Functions → `api` → View logs

Cerca i log con emoji:
- 🚀 = Function chiamata
- 🔄 = Gestione OPTIONS
- 📤 = Response inviata

## 🎯 **Obiettivo**

L'obiettivo è:
1. ✅ Verificare che CORS funzioni con questa versione semplice
2. 🔄 Identificare il problema specifico nella version NestJS
3. 🔧 Fixare e ripristinare la versione completa

---

**⚠️ IMPORTANTE:** Questa è una versione temporanea per DEBUG. Gli endpoint di autenticazione non funzioneranno. È solo per testare CORS!
