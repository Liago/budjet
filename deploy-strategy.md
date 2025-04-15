# Strategia di Deploy per Bud-Jet Finance Tracker

Questo documento descrive la strategia di deploy completa per l'applicazione Bud-Jet Finance Tracker, includendo database, backend, frontend web (containerizzati con Docker) e frontend mobile (esportato come .apk e .ipa).

## Indice
1. [Panoramica dell'Architettura](#panoramica-dellarchitettura)
2. [Prerequisiti](#prerequisiti)
3. [Deploy del Database](#deploy-del-database)
4. [Deploy del Backend](#deploy-del-backend)
5. [Deploy del Frontend Web](#deploy-del-frontend-web)
6. [Deploy del Frontend Mobile](#deploy-del-frontend-mobile)
7. [Orchestrazione con Docker Compose](#orchestrazione-con-docker-compose)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Monitoraggio e Manutenzione](#monitoraggio-e-manutenzione)

## Panoramica dell'Architettura

L'architettura del progetto Bud-Jet Finance Tracker è composta da:

- **Database**: Per la persistenza dei dati
- **Backend**: API RESTful per la logica di business
- **Frontend Web**: Interfaccia utente web responsive
- **Frontend Mobile**: App nativa per dispositivi iOS e Android costruita con React Native ed Expo

## Prerequisiti

Prima di iniziare il processo di deploy, assicurati di avere:

- Docker e Docker Compose installati nell'ambiente di produzione
- Account sviluppatore Apple (per pubblicare su App Store)
- Account sviluppatore Google (per pubblicare su Play Store)
- Account Expo per la gestione del progetto mobile
- Certificati SSL per domini in produzione
- CI/CD tool configurato (GitHub Actions, GitLab CI, Jenkins, ecc.)

## Deploy del Database

### 1. Preparazione dell'immagine Docker per il Database

Crea un `Dockerfile` nella directory del database:

```dockerfile
FROM postgres:14-alpine

ENV POSTGRES_USER=budjet
ENV POSTGRES_PASSWORD=your_secure_password
ENV POSTGRES_DB=finance_tracker

# Copia script di inizializzazione
COPY ./init.sql /docker-entrypoint-initdb.d/

# Espone la porta standard di PostgreSQL
EXPOSE 5432

# Volume per persistenza dei dati
VOLUME ["/var/lib/postgresql/data"]
```

### 2. Configurazione per la persistenza dei dati

Crea un volume Docker dedicato per garantire che i dati persistano anche dopo il riavvio dei container:

```bash
docker volume create budjet-db-data
```

### 3. Script di inizializzazione

Crea un file `init.sql` con lo schema iniziale del database e le configurazioni necessarie:

```sql
-- Creazione delle tabelle base
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Altre tabelle dell'applicazione...

-- Configurazione dei permessi e indici
CREATE INDEX idx_users_email ON users(email);

-- Eventuali dati iniziali
INSERT INTO app_settings (key, value) VALUES ('version', '1.0.0');
```

## Deploy del Backend

### 1. Preparazione dell'immagine Docker per il Backend

Crea un `Dockerfile` nella directory radice del backend:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm ci

# Copia il codice sorgente
COPY . .

# Build dell'applicazione
RUN npm run build

# Immagine finale più leggera
FROM node:18-alpine

WORKDIR /app

# Copia solo file necessari dall'immagine di build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Espone la porta dell'API
EXPOSE 3000

# Comando per avviare l'applicazione
CMD ["node", "dist/main.js"]
```

### 2. Configurazione delle variabili d'ambiente

Crea un file `.env.production` per le variabili d'ambiente in produzione:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://budjet:your_secure_password@db:5432/finance_tracker
JWT_SECRET=your_very_secure_jwt_secret
JWT_EXPIRATION=24h
CORS_ORIGIN=https://budjet.example.com
```

### 3. Configurazione per il logging

Implementa una strategia di logging efficace utilizzando Winston o Pino per monitorare l'applicazione in produzione.

## Deploy del Frontend Web

### 1. Preparazione dell'immagine Docker per il Frontend Web

Crea un `Dockerfile` nella directory radice del frontend web:

```dockerfile
# Stage di build
FROM node:18-alpine AS builder

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm ci

# Copia il codice sorgente
COPY . .

# Build dell'applicazione
RUN npm run build

# Stage finale con Nginx
FROM nginx:alpine

# Copia la configurazione Nginx personalizzata
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia i file di build dall'immagine builder
COPY --from=builder /app/build /usr/share/nginx/html

# Espone la porta 80
EXPOSE 80

# Comando per avviare Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Configurazione Nginx

Crea un file `nginx.conf` per la configurazione del server Nginx:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip settings
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/x-javascript application/xml;
    gzip_disable "MSIE [1-6]\.";

    # Cache settings for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Route all requests to index.html for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
}
```

### 3. Configurazione per ambiente di produzione

Crea un file `.env.production` per le variabili d'ambiente in produzione:

```
REACT_APP_API_URL=https://api.budjet.example.com
REACT_APP_ENV=production
```

## Deploy del Frontend Mobile

### 1. Configurazione Expo per la distribuzione

Assicurati che il file `app.json` nel progetto Expo contenga le configurazioni necessarie:

```json
{
  "expo": {
    "name": "Bud-Jet Finance Tracker",
    "slug": "budjet-finance-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/your-project-id"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.budjet",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.budjet",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

### 2. Configurazione EAS (Expo Application Services) per build native

Crea un file `eas.json` alla radice del progetto Expo:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "credentialsSource": "remote"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./path/to/service-account-key.json",
        "track": "production"
      }
    }
  }
}
```

### 3. Generazione degli artefatti di build (.apk e .ipa)

Per generare i file .apk (Android) e .ipa (iOS), esegui:

```bash
# Installa EAS CLI
npm install -g eas-cli

# Login ad Expo
eas login

# Configura il progetto
eas build:configure

# Build per Android e iOS
eas build --platform all --profile production

# Alternativamente, build separati per piattaforma
eas build --platform android --profile production
eas build --platform ios --profile production
```

### 4. Implementazione OTA Updates con Expo

Configura gli aggiornamenti Over-The-Air per distribuire rapidamente fix e aggiornamenti minori:

```bash
# Pubblica un aggiornamento OTA
eas update --branch production --message "Fix: risolto problema di login"
```

## Orchestrazione con Docker Compose

### 1. Configurazione Docker Compose

Crea un file `docker-compose.yml` nella directory radice del progetto:

```yaml
version: '3.8'

services:
  # Database
  db:
    build: ./database
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - budjet-db-data:/var/lib/postgresql/data
    networks:
      - budjet-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U budjet"]
      interval: 10s
      timeout: 5s
      retries: 5
      
  # Backend API
  api:
    build: ./backend
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
    networks:
      - budjet-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      
  # Frontend Web
  web:
    build: ./frontend/web
    restart: always
    depends_on:
      api:
        condition: service_healthy
    networks:
      - budjet-network
      
  # Reverse Proxy
  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - web
      - api
    networks:
      - budjet-network

networks:
  budjet-network:
    driver: bridge

volumes:
  budjet-db-data:
    external: true
```

### 2. Configurazione Nginx come Reverse Proxy

Crea un file `nginx/conf/default.conf` per configurare il reverse proxy:

```nginx
# Configurazione HTTPS per il frontend web
server {
    listen 443 ssl http2;
    server_name budjet.example.com;

    # Certificati SSL
    ssl_certificate /etc/nginx/ssl/budjet.example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/budjet.example.com.key;
    
    # Impostazioni SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    
    # HSTS
    add_header Strict-Transport-Security 'max-age=31536000; includeSubDomains; preload' always;
    
    # Location per il frontend
    location / {
        proxy_pass http://web:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Configurazione HTTPS per il backend API
server {
    listen 443 ssl http2;
    server_name api.budjet.example.com;

    # Certificati SSL
    ssl_certificate /etc/nginx/ssl/api.budjet.example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/api.budjet.example.com.key;
    
    # Impostazioni SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    
    # HSTS
    add_header Strict-Transport-Security 'max-age=31536000; includeSubDomains; preload' always;
    
    # Location per l'API
    location / {
        proxy_pass http://api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP a HTTPS
server {
    listen 80;
    server_name budjet.example.com api.budjet.example.com;
    return 301 https://$host$request_uri;
}
```

## CI/CD Pipeline

### 1. Configurazione GitHub Actions

Crea un file `.github/workflows/deploy.yml` per automatizzare il processo di build e deploy:

```yaml
name: Deploy Bud-Jet Finance Tracker

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: |
          cd backend
          npm ci
          cd ../frontend/web
          npm ci
          cd ../mobile
          npm ci
          
      - name: Run tests
        run: |
          cd backend
          npm test
          cd ../frontend/web
          npm test
          cd ../mobile
          npm test
          
  build-and-push-docker:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
        
      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
          
      - name: Build and push database
        uses: docker/build-push-action@v3
        with:
          context: ./database
          push: true
          tags: yourcompany/budjet-db:latest
          
      - name: Build and push backend
        uses: docker/build-push-action@v3
        with:
          context: ./backend
          push: true
          tags: yourcompany/budjet-api:latest
          
      - name: Build and push frontend web
        uses: docker/build-push-action@v3
        with:
          context: ./frontend/web
          push: true
          tags: yourcompany/budjet-web:latest
          
  build-mobile:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Install dependencies
        run: |
          cd frontend/mobile
          npm ci
          
      - name: Build APK and IPA
        run: |
          cd frontend/mobile
          eas build --platform all --profile production --non-interactive
          
  deploy:
    needs: [build-and-push-docker, build-mobile]
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/budjet
            docker-compose pull
            docker-compose down
            docker-compose up -d
```

### 2. Variabili d'ambiente e segreti

Configura le variabili d'ambiente necessarie negli ambienti CI/CD:

- `DOCKERHUB_USERNAME` e `DOCKERHUB_TOKEN`: Credenziali per DockerHub
- `EXPO_TOKEN`: Token per accedere all'account Expo
- `SSH_HOST`, `SSH_USERNAME`, `SSH_KEY`: Credenziali per accedere al server di produzione

## Monitoraggio e Manutenzione

### 1. Implementazione del monitoraggio

Integra strumenti di monitoraggio come:

- **Prometheus e Grafana**: Per monitorare metriche del sistema e delle applicazioni
- **ELK Stack (Elasticsearch, Logstash, Kibana)**: Per la gestione centralizzata dei log
- **Sentry**: Per il monitoraggio degli errori e delle performance lato client

### 2. Backup del database

Implementa una strategia di backup automatizzata:

```bash
# Script di backup da inserire in un cron job
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups/budjet"

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

# Create backup
docker exec budjet_db_1 pg_dump -U budjet finance_tracker | gzip > $BACKUP_DIR/finance_tracker_$TIMESTAMP.sql.gz

# Retention policy - keep last 30 days
find $BACKUP_DIR -name "finance_tracker_*.sql.gz" -type f -mtime +30 -delete
```

### 3. Procedure di rollback

Definisci procedure chiare per il rollback in caso di problemi:

```bash
# Rollback al deploy precedente
docker-compose down
docker-compose -f docker-compose.prev.yml up -d

# Per le versioni mobile, utilizza Expo OTA Updates per ripristinare la versione precedente
eas update:rollback
```

### 4. Aggiornamenti di sicurezza

Implementa un processo per gli aggiornamenti di sicurezza regolari:

```bash
# Aggiornamento delle immagini base
docker-compose pull
docker-compose build --no-cache
docker-compose up -d
```

## Conclusione

Questa strategia di deploy fornisce una soluzione completa per il deployment di Bud-Jet Finance Tracker con:

- Database, backend e frontend web containerizzati con Docker
- App mobile distribuita come file .apk e .ipa
- Pipeline CI/CD automatizzata
- Monitoraggio e procedure di manutenzione