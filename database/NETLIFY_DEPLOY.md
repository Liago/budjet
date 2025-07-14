# Deploy Backend su Netlify

## Prerequisiti

1. **Database PostgreSQL su Supabase**
   - Crea un account su [supabase.com](https://supabase.com)
   - Crea un nuovo progetto: `budjet-database`
   - password: ua4dpMvaXKdwYjjU
   - Copia la Connection String PostgreSQL

2. **Account Netlify**
   - Crea account su [netlify.com](https://netlify.com)

## Step di Deploy

### 1. Configurazione Database

Aggiorna il file `.env.production` con l'URL PostgreSQL di Supabase:

```
DATABASE_URL="postgresql://user:password@host:5432/database"
NODE_ENV="production"
```

### 2. Deploy su Netlify

#### Opzione A: CLI Deploy
```bash
# Installa Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy dalla cartella backend
cd finance-tracker/backend
netlify init
netlify deploy --prod
```

#### Opzione B: Git Deploy
1. Vai su [netlify.com](https://netlify.com)
2. **New site from Git**
3. Seleziona repository
4. Configurazioni:
   - **Base directory:** `finance-tracker/backend`
   - **Build command:** `prisma generate && npm run build`
   - **Publish directory:** `dist`

### 3. Configurazione Environment Variables

Nel Netlify Dashboard:
- Site Settings → Environment variables
- Aggiungi: `DATABASE_URL` con valore PostgreSQL Supabase

### 4. Migrazioni Database

Dopo il deploy, esegui le migrazioni:
```bash
# Local (una volta)
npx prisma migrate dev --name init

# Oppure via Netlify CLI
netlify env:set DATABASE_URL "your-postgresql-url"
```

## URL Backend

Una volta deployato, il backend sarà disponibile a:
`https://budjet-backend.netlify.app/.netlify/functions/api`

## Risoluzione Problemi

### CORS Issues
Il file `netlify/functions/api.ts` include già la configurazione CORS per:
- `https://bud-jet.netlify.app`
- `http://localhost:3000`
- `http://localhost:5173`

### Database Connection
Verifica che l'URL PostgreSQL sia corretto nel file environment variables di Netlify.

### Function Timeout
Le Netlify Functions hanno un timeout di 10 secondi su plan gratuito. Per operazioni database lunghe, considera un upgrade.
