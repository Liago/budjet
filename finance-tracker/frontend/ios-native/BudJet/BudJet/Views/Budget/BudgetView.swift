import SwiftUI

struct BudgetView: View {
    @EnvironmentObject var apiManager: APIManager
    @State private var categories: [Category] = []
    @State private var categorySpending: [String: Double] = [:]
    @State private var isLoading = true
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var selectedTimeFilter: DateFilterPeriod = .current
    @State private var showingCustomDatePicker = false
    @State private var customStartDate: Date = Date()
    @State private var customEndDate: Date = Date()
    @State private var showingEditCategory = false
    @State private var selectedCategory: Category?
    
    // DateFormatter per API
    private let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.timeZone = TimeZone.current
        return formatter
    }()
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: ThemeManager.Spacing.lg) {
                    // Header con descrizione
                    headerView
                    
                    // Filtro periodo
                    periodFilterView
                    
                    // Total Budget Card
                    totalBudgetCard
                    
                    // Budget Cards Grid
                    budgetCardsGrid
                }
                .padding(.horizontal, ThemeManager.Spacing.md)
                .padding(.bottom, ThemeManager.Spacing.lg)
            }
            .navigationTitle("Budget")
            .navigationBarTitleDisplayMode(.large)
            .navigationBarBackButtonHidden(false)
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
        .sheet(isPresented: $showingCustomDatePicker) {
            CustomDateRangeView(
                startDate: $customStartDate,
                endDate: $customEndDate
            ) {
                selectedTimeFilter = .custom
                Task {
                    await loadData()
                }
            }
        }
    }
    
    // MARK: - Header
    private var headerView: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            HStack {
                VStack(alignment: .leading, spacing: ThemeManager.Spacing.xs) {
                    Text("Budget delle Categorie")
                        .font(ThemeManager.Typography.title2)
                        .fontWeight(.bold)
                        .foregroundColor(ThemeManager.Colors.text)
                    
                    Text("Gestisci e monitora i tuoi budget mensili")
                        .font(ThemeManager.Typography.body)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
                
                Spacer()
                
                Image(systemName: "chart.bar.doc.horizontal")
                    .font(.system(size: 32))
                    .foregroundColor(ThemeManager.Colors.primary)
            }
            
            VStack(alignment: .leading, spacing: ThemeManager.Spacing.xs) {
                Text("Visualizza quanto hai speso nel periodo selezionato per ciascuna categoria con budget allocato.")
                    .font(ThemeManager.Typography.footnote)
                    .foregroundColor(ThemeManager.Colors.textSecondary)
                
                Text("Tocca una categoria per vedere i dettagli delle transazioni.")
                    .font(ThemeManager.Typography.footnote)
                    .foregroundColor(ThemeManager.Colors.textSecondary)
            }
        }
        .padding(ThemeManager.Spacing.md)
        .background(
            LinearGradient(
                colors: [ThemeManager.Colors.primary.opacity(0.1), ThemeManager.Colors.primary.opacity(0.05)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(ThemeManager.CornerRadius.lg)
    }
    
    // MARK: - Period Filter
    private var periodFilterView: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            Text("Periodo")
                .font(ThemeManager.Typography.bodyMedium)
                .fontWeight(.semibold)
                .foregroundColor(ThemeManager.Colors.text)
            
            HStack {
                ForEach(DateFilterPeriod.allCases, id: \.self) { period in
                    Button(action: {
                        if period == .custom {
                            showingCustomDatePicker = true
                        } else {
                            selectedTimeFilter = period
                            Task {
                                await loadData()
                            }
                        }
                    }) {
                        Text(period.displayName)
                            .font(ThemeManager.Typography.footnote)
                            .foregroundColor(selectedTimeFilter == period ? .white : ThemeManager.Colors.textSecondary)
                            .padding(.horizontal, ThemeManager.Spacing.sm)
                            .padding(.vertical, ThemeManager.Spacing.xs)
                            .background(
                                selectedTimeFilter == period ? ThemeManager.Colors.primary : ThemeManager.Colors.surface
                            )
                            .cornerRadius(ThemeManager.CornerRadius.sm)
                    }
                }
                
                Spacer()
            }
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.md)
    }
    
    // MARK: - Total Budget Card
    private var totalBudgetCard: some View {
        let totalBudget = categories.reduce(0) { $0 + $1.budgetAmount }
        let totalSpent = categorySpending.values.reduce(0, +)
        let totalRemaining = totalBudget - totalSpent
        let percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
        
        return VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            HStack {
                VStack(alignment: .leading, spacing: ThemeManager.Spacing.xs) {
                    Text("Budget Totale")
                        .font(ThemeManager.Typography.headline)
                        .fontWeight(.bold)
                        .foregroundColor(ThemeManager.Colors.text)
                    
                    Text(getCurrentPeriodDisplay())
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: ThemeManager.Spacing.xs) {
                    Text(formatCurrency(totalBudget))
                        .font(ThemeManager.Typography.title2)
                        .fontWeight(.bold)
                        .foregroundColor(ThemeManager.Colors.primary)
                    
                    Text("\(Int(percentage))% utilizzato")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(percentage > 90 ? ThemeManager.Colors.error : ThemeManager.Colors.success)
                }
            }
            
            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(ThemeManager.Colors.border.opacity(0.2))
                        .frame(height: 8)
                        .cornerRadius(4)
                    
                    Rectangle()
                        .fill(percentage > 90 ? ThemeManager.Colors.error : ThemeManager.Colors.success)
                        .frame(
                            width: max(0, min(geometry.size.width, geometry.size.width * CGFloat(percentage / 100))),
                            height: 8
                        )
                        .cornerRadius(4)
                }
            }
            .frame(height: 8)
            
            HStack {
                VStack(alignment: .leading, spacing: ThemeManager.Spacing.xs) {
                    Text("Speso")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Text(formatCurrency(totalSpent))
                        .font(ThemeManager.Typography.bodyMedium)
                        .fontWeight(.semibold)
                        .foregroundColor(ThemeManager.Colors.expense)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: ThemeManager.Spacing.xs) {
                    Text("Rimanente")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Text(formatCurrency(totalRemaining))
                        .font(ThemeManager.Typography.bodyMedium)
                        .fontWeight(.semibold)
                        .foregroundColor(totalRemaining < 0 ? ThemeManager.Colors.error : ThemeManager.Colors.success)
                }
            }
        }
        .padding(ThemeManager.Spacing.lg)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.lg)
        .shadow(color: ThemeManager.Colors.border.opacity(0.1), radius: 4, x: 0, y: 2)
    }
    
    // MARK: - Budget Cards Grid
    private var budgetCardsGrid: some View {
        let categoriesWithBudget = categories.filter { $0.budgetAmount > 0 }
            .sorted { $0.budgetAmount > $1.budgetAmount }
        
        return VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            HStack {
                Text("Categorie con Budget")
                    .font(ThemeManager.Typography.headline)
                    .fontWeight(.bold)
                    .foregroundColor(ThemeManager.Colors.text)
                
                Spacer()
                
                if !categoriesWithBudget.isEmpty {
                    Text("\(categoriesWithBudget.count) categorie")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
            }
            
            if isLoading {
                loadingView
            } else if categoriesWithBudget.isEmpty {
                noBudgetView
            } else {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: ThemeManager.Spacing.md) {
                    ForEach(categoriesWithBudget, id: \.id) { category in
                        CategoryBudgetCard(
                            category: category,
                            spent: categorySpending[category.id] ?? 0,
                            period: getCurrentPeriodDisplay()
                        )
                    }
                }
            }
        }
    }
    
    // MARK: - Loading View
    private var loadingView: some View {
        VStack(spacing: ThemeManager.Spacing.md) {
            ProgressView()
                .scaleEffect(1.2)
            
            Text("Caricamento budget...")
                .font(ThemeManager.Typography.body)
                .foregroundColor(ThemeManager.Colors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(ThemeManager.Spacing.xl)
    }
    
    // MARK: - No Budget View
    private var noBudgetView: some View {
        VStack(spacing: ThemeManager.Spacing.md) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(ThemeManager.Colors.textSecondary)
            
            Text("Nessun Budget Impostato")
                .font(ThemeManager.Typography.title3)
                .fontWeight(.semibold)
                .foregroundColor(ThemeManager.Colors.text)
            
            Text("Imposta un budget per le tue categorie per iniziare a tracciare le tue spese.")
                .font(ThemeManager.Typography.body)
                .foregroundColor(ThemeManager.Colors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(ThemeManager.Spacing.xl)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.lg)
    }
    
    // MARK: - Helper Methods
    private func loadData() async {
        await MainActor.run {
            isLoading = true
            showError = false
        }
        
        do {
            // Carica le categorie
            let categoriesResponse = try await apiManager.getCategories()
            
            // Carica i dati di spesa per il periodo selezionato
            let dateRange = getDateRangeFromPeriod(selectedTimeFilter, customStart: customStartDate, customEnd: customEndDate)
            let startDateString = dateRange.startDate
            let endDateString = dateRange.endDate
            
            let transactionsResponse = try await apiManager.getTransactions(
                limit: 1000,
                page: 1,
                type: .expense,
                categoryId: nil as String?,
                startDate: startDateString,
                endDate: endDateString,
                search: nil as String?
            )

            
            // Calcola le spese per categoria
            let spendingByCategory = Dictionary(grouping: transactionsResponse.data, by: { $0.category.id })
                .mapValues { transactions in
                    transactions.reduce(0) { $0 + $1.amount }
                }
            
            await MainActor.run {
                categories = categoriesResponse
                categorySpending = spendingByCategory
                isLoading = false
            }
        } catch {
            await MainActor.run {
                errorMessage = "Errore nel caricamento dei dati del budget"
                showError = true
                isLoading = false
            }
        }
    }
    
    private func getCurrentPeriodDisplay() -> String {
        switch selectedTimeFilter {
        case .current:
            let formatter = DateFormatter()
            formatter.dateFormat = "MMMM yyyy"
            formatter.locale = Locale(identifier: "it_IT")
            return formatter.string(from: Date())
        case .previous:
            let formatter = DateFormatter()
            formatter.dateFormat = "MMMM yyyy"
            formatter.locale = Locale(identifier: "it_IT")
            let previousMonth = Calendar.current.date(byAdding: .month, value: -1, to: Date()) ?? Date()
            return formatter.string(from: previousMonth)
        case .custom:
            let formatter = DateFormatter()
            formatter.dateFormat = "dd/MM/yyyy"
            return "\(formatter.string(from: customStartDate)) - \(formatter.string(from: customEndDate))"
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

struct BudgetView_Previews: PreviewProvider {
    static var previews: some View {
        BudgetView()
            .environmentObject(APIManager())
    }
}
