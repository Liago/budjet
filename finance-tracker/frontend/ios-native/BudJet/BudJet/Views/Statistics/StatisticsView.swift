import SwiftUI
// import Charts // Temporaneamente commentato - richiede iOS 16.0+

struct CategoryStats: Identifiable {
    let id = UUID()
    let categoryId: String
    let categoryName: String
    let categoryColor: String
    let amount: Double
    let percentage: Double
    let transactionCount: Int
    
    var colorObject: Color {
        Color(hex: categoryColor) ?? Color.gray
    }
}

struct TrendData: Identifiable {
    let id = UUID()
    let date: Date
    let income: Double
    let expenses: Double
    let balance: Double
}

struct StatisticsView: View {
    @EnvironmentObject var apiManager: APIManager
    @State private var selectedPeriod: DateFilterPeriod = .current
    @State private var showingExpenses = true
    @State private var categoryStats: [CategoryStats] = []
    @State private var trendData: [TrendData] = []
    @State private var transactions: [Transaction] = []
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    // DateFormatter per convertire le stringhe di data in Date objects
    private let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        formatter.timeZone = TimeZone(identifier: "UTC")
        return formatter
    }()
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: ThemeManager.Spacing.lg) {
                    // Period Filter
                    periodFilterView
                    
                    // Type Toggle
                    typeToggleView
                    
                    // Charts
                    chartView
                    
                    // Category breakdown
                    categoryBreakdownView
                }
                .padding(.horizontal, ThemeManager.Spacing.md)
            }
            .navigationTitle("Statistiche")
            .navigationBarTitleDisplayMode(.large)
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .onAppear {
            Task {
                await loadData()
            }
        }
        .refreshable {
            await loadData()
        }
        .alert("Errore", isPresented: $showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
    }
    
    private var periodFilterView: some View {
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
    
    private var typeToggleView: some View {
        HStack {
            Button(action: {
                showingExpenses = true
                processCategoryStats()
            }) {
                Text("Uscite")
                    .font(ThemeManager.Typography.bodyMedium)
                    .foregroundColor(showingExpenses ? .white : ThemeManager.Colors.textSecondary)
                    .padding(.horizontal, ThemeManager.Spacing.md)
                    .padding(.vertical, ThemeManager.Spacing.sm)
                    .background(
                        showingExpenses ? ThemeManager.Colors.expense : ThemeManager.Colors.surface
                    )
                    .cornerRadius(ThemeManager.CornerRadius.sm)
            }
            
            Button(action: {
                showingExpenses = false
                processCategoryStats()
            }) {
                Text("Entrate")
                    .font(ThemeManager.Typography.bodyMedium)
                    .foregroundColor(!showingExpenses ? .white : ThemeManager.Colors.textSecondary)
                    .padding(.horizontal, ThemeManager.Spacing.md)
                    .padding(.vertical, ThemeManager.Spacing.sm)
                    .background(
                        !showingExpenses ? ThemeManager.Colors.income : ThemeManager.Colors.surface
                    )
                    .cornerRadius(ThemeManager.CornerRadius.sm)
            }
            
            Spacer()
        }
    }
    
    private var chartView: some View {
        VStack(spacing: ThemeManager.Spacing.lg) {
            // Pie Chart
            pieChartView
            
            // Trend Chart
            if !trendData.isEmpty {
                trendChartView
            }
        }
    }
    
    private var pieChartView: some View {
        VStack(spacing: ThemeManager.Spacing.md) {
            Text("Grafico \(showingExpenses ? "Uscite" : "Entrate") per Categoria")
                .font(ThemeManager.Typography.headline)
                .foregroundColor(ThemeManager.Colors.text)
            
            if isLoading {
                ProgressView()
                    .scaleEffect(1.2)
                    .frame(height: 200)
            } else if categoryStats.isEmpty {
                VStack {
                    Image(systemName: "chart.pie")
                        .font(.system(size: 50))
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Text("Nessun dato disponibile")
                        .font(ThemeManager.Typography.body)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
                .frame(height: 200)
            } else {
                // Chart temporaneamente sostituito con placeholder
                VStack {
                    Text("Grafico Categorie")
                        .font(ThemeManager.Typography.headline)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    Text("(Grafico disponibile con iOS 16.0+)")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
                .frame(height: 200)
                .background(ThemeManager.Colors.surface)
                .cornerRadius(8)
            }
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.lg)
    }
    
    private var trendChartView: some View {
        VStack(spacing: ThemeManager.Spacing.md) {
            Text("Andamento nel Tempo")
                .font(ThemeManager.Typography.headline)
                .foregroundColor(ThemeManager.Colors.text)
            
            // Chart temporaneamente sostituito con placeholder
            VStack {
                Text("Grafico Andamento")
                    .font(ThemeManager.Typography.headline)
                    .foregroundColor(ThemeManager.Colors.textSecondary)
                Text("(Grafico disponibile con iOS 16.0+)")
                    .font(ThemeManager.Typography.caption)
                    .foregroundColor(ThemeManager.Colors.textSecondary)
            }
            .frame(height: 150)
            .background(ThemeManager.Colors.surface)
            .cornerRadius(8)
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.lg)
    }
    
    private var categoryBreakdownView: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            HStack {
                Text("\(showingExpenses ? "Uscite" : "Entrate") per Categoria")
                    .font(ThemeManager.Typography.headline)
                    .foregroundColor(ThemeManager.Colors.text)
                
                Spacer()
                
                if !categoryStats.isEmpty {
                    Text("Top \(min(categoryStats.count, 10))")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
            }
            
            if isLoading {
                ForEach(0..<5, id: \.self) { _ in
                    HStack {
                        Circle()
                            .fill(Color.gray.opacity(0.3))
                            .frame(width: 12, height: 12)
                        
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.gray.opacity(0.3))
                            .frame(height: 16)
                        
                        Spacer()
                        
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.gray.opacity(0.3))
                            .frame(width: 60, height: 16)
                    }
                    .padding(.vertical, ThemeManager.Spacing.xs)
                }
            } else if categoryStats.isEmpty {
                VStack {
                    Image(systemName: "chart.bar")
                        .font(.system(size: 30))
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Text("Nessuna categoria disponibile")
                        .font(ThemeManager.Typography.body)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .center)
                .padding(.vertical, ThemeManager.Spacing.lg)
            } else {
                ForEach(Array(categoryStats.prefix(10).enumerated()), id: \.offset) { index, stat in
                    HStack {
                        Circle()
                            .fill(stat.colorObject)
                            .frame(width: 12, height: 12)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(stat.categoryName)
                                .font(ThemeManager.Typography.body)
                                .foregroundColor(ThemeManager.Colors.text)
                            
                            HStack {
                                Text("\(stat.transactionCount) transazioni")
                                    .font(ThemeManager.Typography.caption)
                                    .foregroundColor(ThemeManager.Colors.textSecondary)
                                
                                Text("•")
                                    .font(ThemeManager.Typography.caption)
                                    .foregroundColor(ThemeManager.Colors.textSecondary)
                                
                                Text("\(String(format: "%.1f", stat.percentage))%")
                                    .font(ThemeManager.Typography.caption)
                                    .foregroundColor(ThemeManager.Colors.textSecondary)
                            }
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 2) {
                            Text(formatCurrency(stat.amount))
                                .font(ThemeManager.Typography.bodyMedium)
                                .fontWeight(.semibold)
                                .foregroundColor(showingExpenses ? ThemeManager.Colors.error : ThemeManager.Colors.success)
                            
                            // Progress bar
                            GeometryReader { geometry in
                                RoundedRectangle(cornerRadius: 2)
                                    .fill(Color.gray.opacity(0.2))
                                    .frame(height: 4)
                                    .overlay(
                                        HStack {
                                            RoundedRectangle(cornerRadius: 2)
                                                .fill(stat.colorObject)
                                                .frame(
                                                    width: max(1, geometry.size.width * CGFloat(stat.percentage / 100)),
                                                    height: 4
                                                )
                                            
                                            Spacer()
                                        }
                                    )
                            }
                            .frame(height: 4)
                        }
                        .frame(width: 80)
                    }
                    .padding(.vertical, ThemeManager.Spacing.xs)
                }
            }
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.md)
    }
    
    // MARK: - Data Loading
    private func loadData() async {
        await MainActor.run {
            isLoading = true
            showError = false
        }
        
        do {
            print("📊 [DEBUG] Loading statistics data...")
            let transactionsResponse = try await apiManager.getTransactions()
            print("📊 [DEBUG] Loaded \(transactionsResponse.data.count) transactions")
            
            await MainActor.run {
                transactions = transactionsResponse.data
                processCategoryStats()
                processTrendData()
                isLoading = false
            }
        } catch {
            print("❌ [ERROR] Error loading statistics: \(error)")
            await MainActor.run {
                errorMessage = "Errore nel caricamento delle statistiche"
                showError = true
                isLoading = false
            }
        }
    }
    
    private func processCategoryStats() {
        let filteredTransactions = transactions.filter { transaction in
            return showingExpenses ? transaction.type == .expense : transaction.type == .income
        }
        
        let groupedByCategory = Dictionary(grouping: filteredTransactions) { $0.category.id }
        let totalAmount = filteredTransactions.reduce(0) { $0 + $1.amount }
        
        categoryStats = groupedByCategory.compactMap { (categoryId, transactions) in
            guard let firstTransaction = transactions.first else { return nil }
            
            let categoryAmount = transactions.reduce(0) { $0 + $1.amount }
            let percentage = totalAmount > 0 ? (categoryAmount / totalAmount) * 100 : 0
            
            return CategoryStats(
                categoryId: categoryId,
                categoryName: firstTransaction.category.name,
                categoryColor: firstTransaction.category.color,
                amount: categoryAmount,
                percentage: percentage,
                transactionCount: transactions.count
            )
        }.sorted { $0.amount > $1.amount }
    }
    
    private func processTrendData() {
        let groupedByDate = Dictionary(grouping: transactions) { transaction in
            // Converti la stringa date in Date object
            guard let date = dateFormatter.date(from: transaction.date) else {
                return Date() // Fallback per date invalide
            }
            return Calendar.current.startOfDay(for: date)
        }
        
        trendData = groupedByDate.compactMap { (date, transactions) in
            let income = transactions.filter { $0.type == .income }.reduce(0) { $0 + $1.amount }
            let expenses = transactions.filter { $0.type == .expense }.reduce(0) { $0 + $1.amount }
            let balance = income - expenses
            
            return TrendData(
                date: date,
                income: income,
                expenses: expenses,
                balance: balance
            )
                }.sorted { $0.date < $1.date }
    }
    
    private func getDateRangeFromPeriod(_ period: DateFilterPeriod) -> (startDate: Date, endDate: Date) {
        let calendar = Calendar.current
        let now = Date()
        
        switch period {
        case .current:
            let startOfMonth = calendar.dateInterval(of: .month, for: now)?.start ?? now
            let endOfMonth = calendar.dateInterval(of: .month, for: now)?.end ?? now
            return (startOfMonth, endOfMonth)
        case .previous:
            let previousMonth = calendar.date(byAdding: .month, value: -1, to: now) ?? now
            let startOfPreviousMonth = calendar.dateInterval(of: .month, for: previousMonth)?.start ?? now
            let endOfPreviousMonth = calendar.dateInterval(of: .month, for: previousMonth)?.end ?? now
            return (startOfPreviousMonth, endOfPreviousMonth)
        case .custom:
            // For now, return last 3 months
            let threeMonthsAgo = calendar.date(byAdding: .month, value: -3, to: now) ?? now
            return (threeMonthsAgo, now)
        }
    }
      
      private func formatCurrency(_ amount: Double) -> String {
          let formatter = NumberFormatter()
          formatter.numberStyle = .currency
          formatter.currencyCode = "EUR"
          formatter.locale = Locale(identifier: "it_IT")
          return formatter.string(from: NSNumber(value: amount)) ?? "€0,00"
      }
}



struct StatisticsView_Previews: PreviewProvider {
    static var previews: some View {
        StatisticsView()
            .environmentObject(APIManager())
    }
} 