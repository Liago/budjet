# Struttura Progetto Xcode - BudJet iOS

## 📁 Organizzazione File in Xcode

### 1. Crea i Gruppi Principali

```
BudJet/
├── 📱 App/
│   └── BudJetApp.swift
├── 🏗️ Managers/
│   ├── AuthManager.swift
│   ├── APIManager.swift
│   ├── KeychainManager.swift
│   └── ThemeManager.swift
├── 📊 Models/
│   └── Models.swift
├── 🎨 Views/
│   ├── ContentView.swift
│   ├── 🔐 Auth/
│   │   ├── AuthenticationView.swift
│   │   ├── LoginView.swift
│   │   └── RegisterView.swift
│   ├── 📊 Dashboard/
│   │   └── DashboardView.swift
│   ├── 💰 Transactions/
│   │   ├── TransactionsView.swift
│   │   └── AddTransactionView.swift
│   ├── 📈 Statistics/
│   │   └── StatisticsView.swift
│   ├── ⚙️ Settings/
│   │   └── SettingsView.swift
│   ├── 🧩 Components/
│   │   ├── StatsCard.swift
│   │   └── TransactionRow.swift
│   ├── 🔧 Common/
│   │   └── LoadingView.swift
│   └── 📱 Main/
│       └── MainTabView.swift
├── 🎨 Resources/
│   ├── Assets.xcassets
│   ├── Colors.xcassets
│   └── LaunchScreen.storyboard
├── 📄 Supporting Files/
│   ├── Info.plist
│   └── Entitlements.plist
└── 📚 Documentation/
    ├── README.md
    ├── TODO.md
    └── PROJECT_STRUCTURE.md
```

## 🚀 Setup Passo-passo

### Step 1: Nuovo Progetto Xcode

1. **File** → **New** → **Project**
2. **iOS** → **App**
3. **Configurazione**:
   - Product Name: `BudJet`
   - Interface: `SwiftUI`
   - Language: `Swift`
   - Bundle Identifier: `com.budjet.app`
   - Team: (Il tuo Apple Developer Team)

### Step 2: Configura Project Settings

```
Target: BudJet
General:
├── Deployment Info:
│   ├── iOS Deployment Target: 15.0
│   ├── iPhone Orientation: Portrait
│   └── iPad Orientation: All
├── App Icons and Launch Screen:
│   ├── App Icon Source: Assets.xcassets/AppIcon
│   └── Launch Screen: LaunchScreen.storyboard
└── Frameworks and Libraries:
    └── (Nessuna dipendenza esterna richiesta)
```

### Step 3: Aggiungi Capabilities

```
Signing & Capabilities:
├── ✅ Keychain Sharing
│   └── Keychain Groups: $(AppIdentifierPrefix)com.budjet.app
├── 🔔 Push Notifications (Future)
└── 📱 Background Modes (Future)
    ├── Background fetch
    └── Remote notifications
```

### Step 4: Crea Asset Catalogs

#### Colors.xcassets

```
Colors/
├── Primary
├── Secondary
├── Background
├── Surface
├── Text
├── TextSecondary
├── Success
├── Error
├── Warning
└── Info
```

#### Assets.xcassets

```
Assets/
├── AppIcon (1024x1024)
├── LaunchImage
└── Icons/
    ├── house (Tab icon)
    ├── chart.bar (Tab icon)
    ├── list.bullet (Tab icon)
    └── gear (Tab icon)
```

## 📝 File da Importare

### Ordine di Importazione

1. **Models.swift** (Dipendenze: Nessuna)
2. **KeychainManager.swift** (Dipendenze: Foundation, Security)
3. **APIManager.swift** (Dipendenze: Models, KeychainManager)
4. **ThemeManager.swift** (Dipendenze: SwiftUI)
5. **AuthManager.swift** (Dipendenze: Models, APIManager, KeychainManager)
6. **Tutte le Views** (Dipendenze: Managers, Models)

### Build Settings Raccomandati

```
Build Settings:
├── Swift Compiler - Code Generation:
│   ├── Optimization Level: -Onone (Debug) / -O (Release)
│   └── Swift Compilation Mode: Incremental (Debug) / Whole Module (Release)
├── Swift Compiler - Custom Flags:
│   └── Active Compilation Conditions: DEBUG (per Debug config)
└── Deployment:
    ├── iOS Deployment Target: 15.0
    ├── Targeted Device Family: iPhone/iPad
    └── Supported Platforms: iOS
```

## 🔧 Configurazione Avanzata

### Info.plist Keys Necessari

```xml
<key>CFBundleDisplayName</key>
<string>BudJet</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>bud-jet-be.netlify.app</key>
        <dict>
            <key>NSExceptionRequiresForwardSecrecy</key>
            <false/>
        </dict>
    </dict>
</dict>
```

### Entitlements.plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
    <key>keychain-access-groups</key>
    <array>
        <string>$(AppIdentifierPrefix)com.budjet.app</string>
    </array>
</dict>
</plist>
```

## 🎯 Schema Build

### Debug Configuration

```
Debug:
├── Swift Optimization: -Onone
├── Preprocessor Macros: DEBUG=1
├── Code Signing: Development
└── Provisioning Profile: Automatic
```

### Release Configuration

```
Release:
├── Swift Optimization: -O
├── Preprocessor Macros: (None)
├── Code Signing: Distribution
└── Provisioning Profile: Distribution
```

## 🧪 Testing Setup

### Test Target

```
BudJetTests:
├── Target Membership: BudJetTests
├── Test Host: BudJet.app
└── Bundle Identifier: com.budjet.app.tests
```

### UI Test Target

```
BudJetUITests:
├── Target Membership: BudJetUITests
├── Target Application: BudJet.app
└── Bundle Identifier: com.budjet.app.uitests
```

## 🚀 Build & Run

### Comandi Utili

```bash
# Clean Build Folder
⇧⌘K

# Build
⌘B

# Run
⌘R

# Test
⌘U

# Archive (per distribuzione)
Product → Archive
```

## 📱 Device Testing

### Configurazione Device

1. **Collega iPhone via USB**
2. **Seleziona device in Xcode**
3. **Trust computer su device**
4. **Build & Run** (⌘R)

### Troubleshooting Comune

- **Code Signing Error**: Verifica Team e Bundle ID
- **Keychain Error**: Aggiungi Keychain Sharing capability
- **Network Error**: Verifica Info.plist ATS settings
- **Build Error**: Clean Build Folder (⇧⌘K)

---

**🎯 Risultato**: Progetto Xcode completamente configurato e pronto per sviluppo!
