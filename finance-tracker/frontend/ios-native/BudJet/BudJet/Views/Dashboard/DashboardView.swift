import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var apiManager: APIManager
    @State private var dashboardStats: DashboardStats?
    @State private var recentTransactions: [Transaction] = []
    @State private var categories: [Category] = []
    @State private var isLoading = true
    @State private var selectedPeriod: DateFilterPeriod = .current
    @State private var showingAddTransaction = false
    @State private var refreshing = false
    @State private var loadDataTask: Task<Void, Never>?
    @State private var showingCustomDatePicker = false
    @State private var customStartDate: Date = Date()
    @State private var customEndDate: Date = Date()
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: ThemeManager.Spacing.lg) {
                    // Header
                    headerView
                    
                    // Date Filter
                    dateFilterView
                    
                    // Stats Cards
                    if let stats = dashboardStats {
                        statsCardsView(stats: stats)
                    }
                    
                    // Recent Transactions
                    recentTransactionsView
                }
                .padding(.horizontal, ThemeManager.Spacing.md)
                .padding(.bottom, ThemeManager.Spacing.lg)
            }
            .refreshable {
                await loadData()
            }
            .navigationTitle("BudJet")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingAddTransaction = true
                    }) {
                        Image(systemName: "plus")
                            .foregroundColor(ThemeManager.Colors.primary)
                    }
                }
            }
            .sheet(isPresented: $showingAddTransaction) {
                AddTransactionView()
            }
            .sheet(isPresented: $showingCustomDatePicker) {
                CustomDateRangeView(
                    startDate: $customStartDate,
                    endDate: $customEndDate
                ) {
                    selectedPeriod = .custom
                    Task {
                        await loadData()
                    }
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .onAppear {
            Task {
                await loadData()
            }
        }
        .onDisappear {
            loadDataTask?.cancel()
        }
    }
    
    // MARK: - Header
    private var headerView: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            Text("Benvenuto")
                .font(ThemeManager.Typography.title2)
                .foregroundColor(ThemeManager.Colors.text)
            
            Text("Ecco il riepilogo del tuo mese")
                .font(ThemeManager.Typography.body)
                .foregroundColor(ThemeManager.Colors.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, ThemeManager.Spacing.md)
    }
    
    // MARK: - Date Filter
    private var dateFilterView: some View {
        HStack {
            ForEach(DateFilterPeriod.allCases, id: \.self) { period in
                Button(action: {
                    if period == .custom {
                        showingCustomDatePicker = true
                    } else {
                        selectedPeriod = period
                        Task {
                            await loadData()
                        }
                    }
                }) {
                    Text(period.displayName)
                        .font(ThemeManager.Typography.footnote)
                        .foregroundColor(selectedPeriod == period ? .white : ThemeManager.Colors.textSecondary)
                        .padding(.horizontal, ThemeManager.Spacing.sm)
                        .padding(.vertical, ThemeManager.Spacing.xs)
                        .background(
                            selectedPeriod == period ? ThemeManager.Colors.primary : ThemeManager.Colors.surface
                        )
                        .cornerRadius(ThemeManager.CornerRadius.sm)
                }
            }
            
            Spacer()
        }
    }
    
    // MARK: - Stats Cards
    private func statsCardsView(stats: DashboardStats) -> some View {
        SlidingStatsCardsView(
            balance: stats.balance,
            totalIncome: stats.totalIncome,
            totalExpenses: stats.totalExpenses,
            totalBudget: calculateTotalBudget(),
            categories: categories,
            period: getPeriodDisplayName(selectedPeriod)
        )
    }
    
    // MARK: - Period Display Name
    private func getPeriodDisplayName(_ period: DateFilterPeriod) -> String {
        switch period {
        case .current:
            return "Mese Corrente"
        case .previous:
            return "Mese Precedente"
        case .custom:
            return "Periodo Personalizzato"
        }
    }
    
    
    // MARK: - Recent Transactions
    private var recentTransactionsView: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            HStack {
                Text("Transazioni Recenti")
                    .font(ThemeManager.Typography.headline)
                    .foregroundColor(ThemeManager.Colors.text)
                
                Spacer()
                
                NavigationLink(destination: TransactionsView()) {
                    Text("Vedi tutte")
                        .font(ThemeManager.Typography.footnote)
                        .foregroundColor(ThemeManager.Colors.primary)
                }
                .foregroundColor(ThemeManager.Colors.primary)
            }
            
            if recentTransactions.isEmpty {
                Text("Nessuna transazione recente")
                    .font(ThemeManager.Typography.body)
                    .foregroundColor(ThemeManager.Colors.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, ThemeManager.Spacing.xl)
            } else {
                LazyVStack(spacing: ThemeManager.Spacing.sm) {
                    ForEach(recentTransactions) { transaction in
                        TransactionRow(transaction: transaction)
                    }
                }
            }
        }
    }
    
    // MARK: - Helper Methods
    private func loadData() async {
        // Cancella il task precedente se esistente
        loadDataTask?.cancel()
        
        loadDataTask = Task {
            await MainActor.run {
                isLoading = true
            }
            
            do {
                let dateRange = getDateRangeFromPeriod(selectedPeriod, customStart: customStartDate, customEnd: customEndDate)
                
                // Controlla se il task è stato cancellato
                guard !Task.isCancelled else {
                    return
                }
                
                async let statsTask = apiManager.getDashboardStats(
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate
                )
                async let transactionsTask = apiManager.getTransactions(limit: 5)
                async let categoriesTask = apiManager.getCategories()
                
                let (stats, transactionResponse, categoriesResponse) = try await (statsTask, transactionsTask, categoriesTask)
                
                // Controlla di nuovo se il task è stato cancellato prima di aggiornare l'UI
                guard !Task.isCancelled else {
                    return
                }
                
                await MainActor.run {
                    dashboardStats = stats
                    recentTransactions = transactionResponse.data
                    categories = categoriesResponse
                    isLoading = false
                }
            } catch {
                // Ignora errori di cancellazione
                if let urlError = error as? URLError, urlError.code == .cancelled {
                    print("🔄 [DEBUG] Richiesta cancellata durante il refresh")
                    return
                }
                
                await MainActor.run {
                    isLoading = false
                    ErrorManager.shared.handleError(error, context: "Dashboard - Caricamento dati")
                }
            }
        }
        
        await loadDataTask?.value
    }
    
    private func formatCurrency(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "EUR"
        return formatter.string(from: NSNumber(value: amount)) ?? "€0,00"
    }
    
    private func calculateTotalBudget() -> Double {
        return categories.reduce(0) { $0 + $1.budgetAmount }
    }
}

struct DashboardView_Previews: PreviewProvider {
    static var previews: some View {
        DashboardView()
            .environmentObject(AuthManager())
            .environmentObject(APIManager())
    }
} 