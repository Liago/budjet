# ISSUES TRACKER - Luglio 2025

## Issues Risolti ✅

### Issue #1: TypeScript Compilation Error - Cannot find name 'process'

- **Tipo**: Bug 🐛
- **Stato**: ✅ Risolto
- **Descrizione**: Errore di compilazione TypeScript nel file `direct.controller.ts` - 'process' is not defined
- **Soluzione**: Aggiunto `import * as process from 'process'` nel file
- **File**: `finance-tracker/backend/src/direct/direct.controller.ts`

### Issue #2: Expense Forecast Date Logic Error

- **Tipo**: Bug 🐛
- **Stato**: ✅ Risolto
- **Descrizione**: L'endpoint expense-forecast utilizzava range di date sbagliati e logica incorretta
- **Problema Specifico**: Usava range 30 giorni dalla data odierna invece del mese corrente completo
- **Soluzione**: Modificato per utilizzare sempre il mese corrente completo (es. 9 luglio → 2025-07-01 to 2025-07-31), calcolando spese effettive dall'inizio mese ad oggi + pagamenti ricorrenti pendenti da oggi a fine mese
- **File**: `finance-tracker/backend/src/direct/direct.controller.ts`

### Issue #3: Frontend Props Missing in DashboardStats

- **Tipo**: Bug 🐛
- **Stato**: ✅ Risolto
- **Descrizione**: DashboardStats riceveva undefined per selectedTimeRange perché le props non venivano passate
- **Soluzione**: Aggiunte props mancanti (selectedTimeRange, customStartDate, customEndDate) a DashboardStats in Dashboard.tsx
- **File**: `finance-tracker/frontend/web/src/pages/Dashboard.tsx`

### Issue #4: TypeScript Date Type Error

- **Tipo**: Bug 🐛
- **Stato**: ✅ Risolto
- **Descrizione**: Errore "customStartDate.toISOString is not a function" perché le date erano stringhe non oggetti Date
- **Soluzione**: Rimossi i .toISOString() calls, aggiornata interfaccia per riflettere i tipi string
- **File**: `finance-tracker/frontend/web/src/components/dashboard/DashboardStats.tsx`

### Issue #5: CSV Import TypeScript Error

- **Tipo**: Bug 🐛
- **Stato**: ✅ Risolto
- **Descrizione**: Incompatibilità di tipo nella creazione transaction usando spread operator
- **Soluzione**: Sostituito spread con assegnazione esplicita dei campi e proper type casting
- **File**: `finance-tracker/backend/src/direct/direct.controller.ts`

### Issue #6: Frontend Date Range Still Wrong

- **Tipo**: Bug 🐛
- **Stato**: ✅ Risolto
- **Descrizione**: Frontend chiamava expense-forecast con range incorretti (2025-06-10 → 2025-07-10)
- **Soluzione**: Implementata funzione robusta getCurrentMonthRange() basata su UTC che calcola sempre primo-ultimo giorno del mese corrente, ignorando qualsiasi props
- **File**: `finance-tracker/frontend/web/src/components/dashboard/DashboardStats.tsx`

### Issue #7: Clickable Forecast Modal Implementation

- **Tipo**: Feature 🚀
- **Stato**: ✅ Implementato
- **Descrizione**: Rendere la sezione forecast nella card "Uscite" cliccabile
- **Implementazione**:
  - Sezione forecast cliccabile
  - Apertura modal React nativo con recurringDetails dalla response expense-forecast
  - Visualizzazione nome pagamento, importo, categoria, prossima data pagamento
  - Uso componenti Dialog da @/components/ui/dialog con named imports corretti
- **File**: `finance-tracker/frontend/web/src/components/dashboard/DashboardStats.tsx`

### Issue #8: Implementazione Bulk Edit Modal per Transazioni

- **Tipo**: Feature 🚀
- **Stato**: ✅ Implementato
- **Descrizione**: Modal per modifiche in batch delle transazioni selezionate
- **Implementazione**:
  - Componente BulkEditModal con form per category, tags, notes
  - Integrazione con selection system nelle transazioni
  - API call a bulk-update endpoint
- **File**: `finance-tracker/frontend/web/src/components/transactions/BulkEditModal.tsx`

## Issues Aperti 🔄

### Issue #9: Errore CSS "Cannot resolve --chart-1"

- **Tipo**: Bug 🐛
- **Stato**: 🔄 In investigazione
- **Descrizione**: Errori CSS per variabili chart non definite
- **File**: Vari componenti chart
- **Priorità**: Media

### Issue #10: Modal Ricerca Avanzata Non Funziona

- **Tipo**: Bug 🐛
- **Stato**: 🔄 Identificato
- **Descrizione**: Il modal di ricerca avanzata transazioni non si apre/funziona correttamente
- **File**: `finance-tracker/frontend/web/src/pages/Transactions.tsx`
- **Priorità**: Media

### Issue #11: CSV Import Bulk Update Error

- **Tipo**: Bug 🐛
- **Stato**: ✅ Risolto
- **Descrizione**: L'import CSV falliva perché l'endpoint /bulk-update restituiva errore 'Cannot read properties of undefined (reading update)' per ogni transazione
- **Causa Root**:
  1. Frontend chiamava `/transactions/import/csv` che era disabilitato nel controller standard
  2. Frontend inviava FormData ma endpoint direct si aspettava JSON con csvData
  3. Frontend chiamava `/transactions/bulk-update` invece di endpoint direct per Netlify
- **Soluzione**:
  1. Modificato frontend per chiamare `/direct/transactions/import/csv` con payload JSON
  2. Aggiunto endpoint `/direct/transactions/bulk-update` nel DirectController
  3. Aggiornato frontend per usare endpoint direct per bulk-update
- **File Modificati**:
  - `finance-tracker/frontend/web/src/components/CsvImporter.tsx`
  - `finance-tracker/frontend/web/src/store/slices/transactionSlice.ts`
  - `finance-tracker/frontend/web/src/services/transactionService.ts`
  - `finance-tracker/frontend/web/src/utils/apiServices.ts`
  - `finance-tracker/backend/src/direct/direct.controller.ts`
- **Priorità**: ✅ Risolto

### Issue #12: Sidebar Menu Always Open Redux Flag

- **Tipo**: Feature 🚀
- **Stato**: ✅ Implementato
- **Descrizione**: Implementare flag Redux per sidebar menu sempre aperta di default
- **Implementazione**:
  1. **Redux Slice**: Creato `uiSlice.ts` per gestire preferenze UI con flag `sidebarAlwaysOpen`
  2. **Persistenza**: Hook `useUIPreferences.ts` per salvare/caricare da localStorage
  3. **Comportamento**: Quando abilitato, sidebar rimane sempre espansa senza chiudersi al mouse leave
  4. **UI**: Sezione "Preferenze Interfaccia" in `/preferences` con Switch per abilitare/disabilitare
  5. **Integrazione**: Modificato `Layout.tsx` per usare Redux invece di stato locale
- **File Implementati/Modificati**:
  - `finance-tracker/frontend/web/src/store/slices/uiSlice.ts` (nuovo)
  - `finance-tracker/frontend/web/src/utils/hooks/useUIPreferences.ts` (nuovo)
  - `finance-tracker/frontend/web/src/store/index.ts` (aggiunto uiReducer)
  - `finance-tracker/frontend/web/src/components/Layout.tsx` (usa Redux)
  - `finance-tracker/frontend/web/src/components/ui/sidebar.tsx` (gestori personalizzati)
  - `finance-tracker/frontend/web/src/pages/UserPreferences.tsx` (sezione UI prefs)
- **Priorità**: ✅ Implementato

## Statistiche

- **Totale Issues**: 12
- **Risolti**: 10 ✅
- **In Corso**: 2 🔄
- **Success Rate**: 83%

## Note Tecniche

- **Deployment**: Netlify - richiede pattern endpoint /direct/
- **Database**: Prisma ORM con PostgreSQL
- **State Management**: Redux
- **UI Components**: Radix UI
- **Date Handling**: UTC per compatibilità cross-timezone
- **Forecast Logic**: Spese effettive + pagamenti ricorrenti pendenti

---

_Ultimo aggiornamento: Luglio 2025_
