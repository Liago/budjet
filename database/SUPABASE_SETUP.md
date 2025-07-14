# Configurazione Database Supabase

## Step 1: Creare Progetto Supabase

1. **Vai su [supabase.com](https://supabase.com)**
2. **Sign up** con GitHub (consigliato) o email
3. **New project**
4. **Configurazioni:**
   - **Organization:** (usa quella di default o creane una)
   - **Project name:** `budjet-database`
   - **Database password:** (IMPORTANTE: salva questa password!)
   - **Region:** Europe West (London)
   - **Pricing plan:** Free
5. **Create new project**

⏱️ **Tempo setup:** ~2-3 minuti

## Step 2: Ottenere Connection String

1. Nel dashboard Supabase, vai su **Settings** (⚙️ in basso a sinistra)
2. Clicca su **Database**
3. Nella sezione **Connection string**, seleziona **URI**
4. **Copia** la stringa che sarà simile a:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijk.supabase.co:5432/postgres
   ```
5. **Attenzione:** `[YOUR-PASSWORD]` deve essere sostituito con la password che hai scelto al Step 1

## Step 3: Aggiornare File di Configurazione

### Backend - File .env.production
Sostituisci il contenuto del file:
```
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://postgres:TUA-PASSWORD-QUI@db.TUO-PROJECT-REF.supabase.co:5432/postgres"
NODE_ENV="production"
```

### Frontend - File .env.production (già configurato)
```
VITE_API_URL=https://budjet-backend.netlify.app/.netlify/functions/api
VITE_ENV=production
```

## Step 4: Test Connection (Opzionale)

Per testare la connessione localmente:
```bash
cd finance-tracker/backend
npm run prisma generate
npx prisma db push
```

## Step 5: Deploy su Netlify

Quando configuri il backend su Netlify:

**Environment Variables da aggiungere:**
- `DATABASE_URL`: La tua connection string Supabase completa
- `NODE_ENV`: `production`

## Vantaggi di Supabase

✅ **Dashboard grafico** per gestire i dati  
✅ **Real-time subscriptions** (se serve in futuro)  
✅ **Auth integrata** (se vuoi migrare da JWT custom)  
✅ **Storage per file** (per eventuali upload)  
✅ **Edge Functions** (per logica backend aggiuntiva)  
✅ **Tier gratuito generoso** (500MB storage, 2GB bandwidth)  

## Risoluzione Problemi

### Connection String Format
Assicurati che il formato sia esatto:
```
postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
```

### Password Speciali
Se la password contiene caratteri speciali (`@`, `#`, `%`), potrebbero dover essere URL-encoded.

### Regional Latency
Scegli la region più vicina per migliori performance (Europe West per l'Italia).
