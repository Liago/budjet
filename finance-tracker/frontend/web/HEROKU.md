# Deployment su Heroku

Questa guida fornisce istruzioni su come deployare l'applicazione Finance Tracker su Heroku.

## Prerequisiti

- Account Heroku
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installato
- Git installato

## Configurazione

1. Effettua il login su Heroku dalla CLI:

   ```bash
   heroku login
   ```

2. Crea una nuova app Heroku (sostituisci `your-app-name` con il nome desiderato):

   ```bash
   heroku create your-app-name
   ```

3. Imposta le variabili d'ambiente necessarie:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set BASE_PATH=/budjet
   heroku config:set API_URL=https://your-backend-api.herokuapp.com
   ```

## Deployment

### Metodo 1: Deployment diretto dal repository

Se stai lavorando direttamente nella cartella principale del repository:

```bash
git add .
git commit -m "Preparazione per Heroku"
git push heroku main
```

### Metodo 2: Deployment da sottocartella

Se l'applicazione è in una sottocartella (come in questo caso):

```bash
git subtree push --prefix finance-tracker/frontend/web heroku main
```

Oppure, se il comando precedente dà errori:

```bash
git push heroku `git subtree split --prefix finance-tracker/frontend/web main`:main --force
```

## Verifica del deployment

1. Apri l'app nel browser:

   ```bash
   heroku open
   ```

2. Verifica che l'applicazione sia accessibile all'URL `/budjet/`

3. Controlla i log in caso di errori:
   ```bash
   heroku logs --tail
   ```

## Configurazione avanzata

### Scala l'applicazione

Per assicurarti che almeno un'istanza dell'app sia sempre in esecuzione:

```bash
heroku ps:scale web=1
```

### Configura un dominio personalizzato

1. Aggiungi il tuo dominio personalizzato:

   ```bash
   heroku domains:add www.tuo-dominio.com
   ```

2. Configura i record DNS seguendo le istruzioni fornite da Heroku.

## Risoluzione dei problemi

- **Issue con il build pack**: Assicurati di avere il buildpack Node.js configurato:

  ```bash
  heroku buildpacks:set heroku/nodejs
  ```

- **Problemi con le dipendenze**: Se ci sono problemi con le dipendenze, prova a cancellare la cache:

  ```bash
  heroku repo:purge_cache
  ```

- **Errori 404**: Verifica che il BASE_PATH sia impostato correttamente e che l'applicazione gestisca correttamente questo percorso.

- **Errori di connessione API**: Verifica che la variabile d'ambiente API_URL sia impostata correttamente.
