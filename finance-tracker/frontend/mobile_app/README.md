# Bud-Jet Mobile App

Bud-Jet è un'applicazione mobile per la gestione delle finanze personali, sviluppata con React Native e TypeScript. L'app permette agli utenti di tenere traccia delle proprie spese e entrate, analizzare i propri dati finanziari e gestire il proprio budget in modo efficace.

## Tecnologie Utilizzate

- React Native con TypeScript
- Redux Toolkit per la gestione dello stato
- Tailwind CSS per lo styling
- Ionicons per le icone
- React Native Chart Kit per i grafici
- Expo Notifications per le notifiche
- AsyncStorage per la persistenza dei dati
- Expo File System per la gestione dei file
- Expo Sharing per la condivisione dei file

## Funzionalità Principali

### 1. Dashboard

- Visualizzazione del saldo corrente
- Grafici interattivi per l'andamento mensile
- Distribuzione delle spese per categoria
- Distribuzione delle entrate per categoria
- Accesso rapido alle funzionalità principali

### 2. Gestione Transazioni

- Aggiunta di nuove transazioni (spese ed entrate)
- Categorizzazione delle transazioni
- Selezione della data
- Validazione dei dati inseriti
- Filtri avanzati per la ricerca
- Funzionalità di ricerca testuale

### 3. Gestione Categorie

- Creazione di categorie personalizzate
- Modifica delle categorie esistenti
- Assegnazione di icone alle categorie
- Visualizzazione delle categorie più utilizzate

### 4. Statistiche Avanzate

- Analisi dettagliata delle spese
- Trend mensili e annuali
- Calcolo del tasso di risparmio
- Media delle transazioni
- Top categorie di spesa
- Visualizzazione dei dati tramite grafici

### 5. Notifiche

- Avvisi per il superamento del budget
- Report mensili automatici
- Promemoria per le bollette
- Notifiche per gli obiettivi di risparmio
- Personalizzazione delle notifiche

### 6. Backup e Ripristino

- Creazione di backup automatici
- Ripristino dei dati da backup
- Condivisione dei backup
- Gestione di più backup
- Validazione dei dati di backup

### 7. Personalizzazione

- Tema chiaro/scuro
- Personalizzazione delle categorie
- Impostazioni delle notifiche
- Preferenze di visualizzazione

## Struttura del Progetto

```
src/
├── components/
│   ├── charts/         # Componenti per i grafici
│   ├── forms/          # Componenti per i form
│   ├── stats/          # Componenti per le statistiche
│   └── themed/         # Componenti con tema
├── screens/
│   ├── dashboard/      # Schermata principale
│   ├── transactions/   # Gestione transazioni
│   ├── categories/     # Gestione categorie
│   ├── stats/          # Statistiche avanzate
│   └── settings/       # Impostazioni e backup
├── services/
│   ├── api/           # Servizi API
│   ├── backup/        # Servizio di backup
│   └── notifications/ # Servizio notifiche
├── store/
│   └── slices/        # Redux slices
├── hooks/             # Custom hooks
├── navigation/        # Configurazione navigazione
└── theme/            # Configurazione tema
```

## Installazione

1. Clona il repository:

```bash
git clone https://github.com/yourusername/bud-jet.git
cd bud-jet/frontend/mobile
```

2. Installa le dipendenze:

```bash
npm install
```

3. Avvia l'applicazione:

```bash
npm start
```

## Configurazione

1. Crea un file `.env` nella root del progetto mobile con le seguenti variabili:

```
API_URL=your_api_url
```

2. Configura le notifiche push (opzionale):

```bash
expo push:configure
```

## Contribuire

1. Fork il repository
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.

## Supporto

Per supporto, email support@budjet.com o apri un issue nel repository.
