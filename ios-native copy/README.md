# BudJet iOS Native App

App iOS nativa per la gestione delle finanze personali, sviluppata in SwiftUI e completamente allineata al backend esistente.

## 🚀 Funzionalità

### ✅ Implementate

- **Autenticazione**: Login e registrazione con gestione sicura del token
- **Dashboard**: Statistiche finanziarie con filtri per periodo
- **Transazioni**: Visualizzazione, creazione e gestione delle transazioni
- **Categorie**: Selezione categorie con colori personalizzati
- **Tema**: Supporto per tema chiaro/scuro
- **Impostazioni**: Gestione profilo utente e preferenze app

### 🔄 In Sviluppo

- **Statistiche**: Grafici dettagliati e analisi dei dati
- **Notifiche**: Push notifications per promemoria
- **Export**: Esportazione dati in CSV/PDF
- **Offline**: Sincronizzazione dati offline

## 🏗️ Architettura

### Struttura Progetto

```
ios-native/
├── BudJetApp.swift              # Entry point dell'app
├── Models/
│   └── Models.swift             # Modelli dati condivisi
├── Managers/
│   ├── AuthManager.swift        # Gestione autenticazione
│   ├── APIManager.swift         # Chiamate API
│   ├── KeychainManager.swift    # Gestione sicura token
│   └── ThemeManager.swift       # Gestione temi e colori
├── Views/
│   ├── ContentView.swift        # Vista principale con routing
│   ├── Auth/                    # Viste autenticazione
│   ├── Dashboard/               # Dashboard e statistiche
│   ├── Transactions/            # Gestione transazioni
│   ├── Settings/                # Impostazioni
│   ├── Components/              # Componenti riutilizzabili
│   ├── Common/                  # Viste comuni
│   └── Main/                    # Navigazione principale
```

### Pattern Architetturali

- **MVVM**: Model-View-ViewModel con ObservableObject
- **Dependency Injection**: EnvironmentObject per state management
- **Async/Await**: Gestione asincrona delle API calls
- **SwiftUI**: UI declarativa moderna

## 🔧 Configurazione

### Requisiti

- iOS 15.0+
- Xcode 14.0+
- Swift 5.7+

### Setup

1. **Clona il repository**

   ```bash
   git clone <repository-url>
   cd finance-tracker/frontend/ios-native
   ```

2. **Apri in Xcode**

   ```bash
   # Crea progetto Xcode
   # File > New > Project > iOS > App
   # - Product Name: BudJet
   # - Interface: SwiftUI
   # - Language: Swift
   # - Bundle Identifier: com.budjet.app
   ```

3. **Aggiungi i file sorgente**

   - Copia tutti i file Swift nel progetto Xcode
   - Organizza i gruppi come da struttura cartelle

4. **Configura Keychain**
   - Aggiungi Keychain Sharing capability
   - Configura Keychain Access Groups

## 🌐 API Integration

### Endpoint Base

```swift
let baseURL = "https://bud-jet-be.netlify.app/.netlify/functions/api"
```

### Autenticazione

- **Login**: `POST /auth/direct-login`
- **Register**: `POST /auth/register`
- **Token Storage**: Keychain sicuro

### Principali Endpoint

- **Dashboard**: `GET /direct/stats?startDate=&endDate=`
- **Transazioni**: `GET /direct/transactions?limit=&page=&type=`
- **Categorie**: `GET /direct/categories`
- **Crea Transazione**: `POST /direct/transactions`

## 🎨 Design System

### Colori

```swift
// Colori principali
ThemeManager.Colors.primary       // Blu principale
ThemeManager.Colors.success       // Verde per entrate
ThemeManager.Colors.error         // Rosso per uscite

// Background
ThemeManager.Colors.background    // Sfondo principale
ThemeManager.Colors.surface       // Carte e componenti
```

### Typography

```swift
ThemeManager.Typography.largeTitle   // Titoli principali
ThemeManager.Typography.headline     // Sezioni
ThemeManager.Typography.body         // Testo normale
ThemeManager.Typography.caption      // Dettagli
```

### Spacing

```swift
ThemeManager.Spacing.xs    // 4pt
ThemeManager.Spacing.sm    // 8pt
ThemeManager.Spacing.md    // 16pt
ThemeManager.Spacing.lg    // 24pt
ThemeManager.Spacing.xl    // 32pt
```

## 🔒 Sicurezza

### Token Management

- **Storage**: iOS Keychain sicuro
- **Auto-refresh**: Validazione automatica token
- **Logout**: Rimozione sicura dati sensibili

### Network Security

- **HTTPS**: Tutte le comunicazioni criptate
- **Certificate Pinning**: (Raccomandato per produzione)
- **Request Validation**: Validazione dati in ingresso

## 📱 Funzionalità Chiave

### Dashboard

- Bilancio attuale con indicatore visivo
- Entrate e uscite del periodo selezionato
- Filtri per periodo (mese corrente/precedente/personalizzato)
- Transazioni recenti con categorie colorate

### Gestione Transazioni

- Form intuitivo per aggiungere transazioni
- Selezione categoria con colori personalizzati
- Sistema di tag per organizzazione
- Date picker integrato
- Validazione dati real-time

### Impostazioni

- Profilo utente con iniziali personalizzate
- Toggle tema chiaro/scuro
- Sezioni organizzate per funzionalità
- Logout sicuro con conferma

## 🚀 Build e Deploy

### Debug Build

```bash
# In Xcode
Product > Build (⌘B)
Product > Run (⌘R)
```

### Release Build

```bash
# Per TestFlight/App Store
Product > Archive
Window > Organizer > Distribute App
```

### App Store

1. **Prepara assets**:

   - App icon (1024x1024)
   - Screenshots per diversi device
   - Descrizione app

2. **Upload**:
   - Archive in Xcode
   - Upload tramite Organizer
   - Gestisci in App Store Connect

## 🧪 Testing

### Unit Testing

```swift
@testable import BudJet
import XCTest

class APIManagerTests: XCTestCase {
    func testLoginValidCredentials() async throws {
        // Test login con credenziali valide
    }
}
```

### UI Testing

```swift
import XCUITest

class BudJetUITests: XCTestCase {
    func testLoginFlow() throws {
        // Test completo flusso login
    }
}
```

## 📊 Performance

### Ottimizzazioni

- **LazyVStack**: Per liste lunghe di transazioni
- **AsyncImage**: Caricamento immagini asíncrono
- **@State**: State management ottimizzato
- **Task**: Gestione concorrenza moderna

### Monitoring

- **Memory Usage**: Profiling con Instruments
- **Network**: Monitoring chiamate API
- **Battery**: Ottimizzazione consumo energia

## 🐛 Debug

### Logging

```swift
// Debug API calls
print("🔍 [API-DEBUG] Request: \(endpoint)")
print("✅ [API-DEBUG] Response: \(response)")
```

### Common Issues

1. **Token expired**: Auto-refresh implementato
2. **Network errors**: Retry logic nelle API calls
3. **UI freezing**: Tutte le API calls sono async

## 🤝 Contributing

### Code Style

- **SwiftFormat**: Formattazione automatica
- **SwiftLint**: Linting rules
- **Naming**: Convenzioni Swift standard

### Git Workflow

```bash
# Feature branch
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature
```

## 📄 License

Questo progetto è parte del sistema BudJet per la gestione delle finanze personali.

---

**Sviluppato con ❤️ in Swift e SwiftUI**
