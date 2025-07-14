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
                    
                    // Quick Actions
                    quickActionsView
                    
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
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .onAppear {
            Task {
                await loadData()
            }
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
                    selectedPeriod = period
                    Task {
                        await loadData()
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
        VStack(spacing: ThemeManager.Spacing.md) {
            // Balance Card
            StatsCard(
                title: "Bilancio",
                value: formatCurrency(stats.balance),
                color: stats.balance >= 0 ? ThemeManager.Colors.success : ThemeManager.Colors.error,
                icon: stats.balance >= 0 ? "arrow.up.circle.fill" : "arrow.down.circle.fill"
            )
            
            // Income and Expense Cards
            HStack(spacing: ThemeManager.Spacing.md) {
                StatsCard(
                    title: "Entrate",
                    value: formatCurrency(stats.totalIncome),
                    color: ThemeManager.Colors.income,
                    icon: "arrow.up.circle.fill"
                )
                
                StatsCard(
                    title: "Uscite",
                    value: formatCurrency(stats.totalExpenses),
                    color: ThemeManager.Colors.expense,
                    icon: "arrow.down.circle.fill"
                )
            }
        }
    }
    
    // MARK: - Quick Actions
    private var quickActionsView: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            Text("Azioni Rapide")
                .font(ThemeManager.Typography.headline)
                .foregroundColor(ThemeManager.Colors.text)
            
            Button(action: {
                showingAddTransaction = true
            }) {
                HStack {
                    Image(systemName: "plus.circle.fill")
                        .foregroundColor(ThemeManager.Colors.primary)
                        .font(.title2)
                    
                    Text("Aggiungi Transazione")
                        .font(ThemeManager.Typography.bodyMedium)
                        .foregroundColor(ThemeManager.Colors.text)
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                        .font(.footnote)
                }
                .padding(ThemeManager.Spacing.md)
                .background(ThemeManager.Colors.surface)
                .cornerRadius(ThemeManager.CornerRadius.md)
            }
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
                
                Button("Vedi tutte") {
                    // TODO: Navigate to transactions view
                }
                .font(ThemeManager.Typography.footnote)
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
        isLoading = true
        
        do {
            let dateRange = getDateRangeFromPeriod(selectedPeriod)
            
            async let statsTask = apiManager.getDashboardStats(
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            )
            async let transactionsTask = apiManager.getTransactions(limit: 5)
            async let categoriesTask = apiManager.getCategories()
            
            let (stats, transactionResponse, categoriesResponse) = try await (statsTask, transactionsTask, categoriesTask)
            
            await MainActor.run {
                dashboardStats = stats
                recentTransactions = transactionResponse.data
                categories = categoriesResponse
                isLoading = false
            }
        } catch {
            print("Errore nel caricamento dei dati: \(error)")
            isLoading = false
        }
    }
    
    private func formatCurrency(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "EUR"
        return formatter.string(from: NSNumber(value: amount)) ?? "€0,00"
    }
}

struct DashboardView_Previews: PreviewProvider {
    static var previews: some View {
        DashboardView()
            .environmentObject(AuthManager())
            .environmentObject(APIManager())
    }
} 