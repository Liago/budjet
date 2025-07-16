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
            Group {
                if isLoading {
                    DashboardSkeletonView()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            // Header
                            headerView
                                .padding(.bottom, ThemeManager.Spacing.lg)
                            
                            // New Dashboard Layout
                            if let stats = dashboardStats {
                                VStack(spacing: ThemeManager.Spacing.lg) {
                                    // Balance Card
                                    NewBalanceCard(
                                        balance: stats.balance,
                                        period: getCurrentMonthYear(),
                                        changePercentage: 12.5 // This should be calculated
                                    )
                                    
                                    // Income/Expense Cards
                                    IncomeExpenseCards(
                                        income: stats.totalIncome,
                                        expenses: stats.totalExpenses
                                    )
                                    
                                    // Spending by Category
                                    SpendingByCategoryCard(
                                        categories: getCategorySpendingData()
                                    )
                                    
                                    // Recent Transactions
                                    NewRecentTransactions(
                                        transactions: Array(recentTransactions.prefix(5))
                                    )
                                }
                            }
                        }
                        .padding(.horizontal, ThemeManager.Spacing.md)
                        .padding(.bottom, ThemeManager.Spacing.lg)
                    }
                    .refreshable {
                        await loadData()
                    }
                }
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
        VStack(spacing: ThemeManager.Spacing.sm) {
            Text("Dashboard")
                .font(ThemeManager.Typography.title2)
                .fontWeight(.bold)
                .foregroundColor(ThemeManager.Colors.text)
            
            HStack {
                Image(systemName: "calendar")
                    .foregroundColor(ThemeManager.Colors.textSecondary)
                Text(getCurrentMonthYear())
                    .font(ThemeManager.Typography.body)
                    .foregroundColor(ThemeManager.Colors.textSecondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.top, ThemeManager.Spacing.md)
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
    
    private func getCurrentMonthYear() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"
        formatter.locale = Locale(identifier: "it_IT")
        return formatter.string(from: Date())
    }
    
    private func getCategorySpendingData() -> [CategorySpending] {
        // Sample data for now - this should be calculated from actual transactions
        return [
            CategorySpending(name: "Food", amount: 450.00, color: Color(red: 0.95, green: 0.45, blue: 0.45)),
            CategorySpending(name: "Transport", amount: 280.00, color: Color(red: 0.4, green: 0.6, blue: 0.95)),
            CategorySpending(name: "Shopping", amount: 320.00, color: Color(red: 0.95, green: 0.75, blue: 0.35)),
            CategorySpending(name: "Bills", amount: 180.00, color: Color(red: 0.4, green: 0.8, blue: 0.4)),
            CategorySpending(name: "Entertainment", amount: 122.50, color: Color(red: 0.95, green: 0.65, blue: 0.35))
        ]
    }
}

struct DashboardView_Previews: PreviewProvider {
    static var previews: some View {
        DashboardView()
            .environmentObject(AuthManager())
            .environmentObject(APIManager())
    }
} 