import SwiftUI

struct CategoryTransactionsModal: View {
    @EnvironmentObject var apiManager: APIManager
    let category: Category
    let period: String
    let selectedTimeFilter: DateFilterPeriod
    let customStartDate: Date
    let customEndDate: Date
    @Environment(\.dismiss) private var dismiss
    
    @State private var transactions: [Transaction] = []
    @State private var isLoading = true
    @State private var showError = false
    @State private var errorMessage = ""
    
    // Statistiche calcolate
    private var totalSpent: Double {
        transactions.reduce(0) { $0 + $1.amount }
    }
    
    private var transactionCount: Int {
        transactions.count
    }
    
    private var averageSpent: Double {
        guard transactionCount > 0 else { return 0 }
        return totalSpent / Double(transactionCount)
    }
    
    // Raggruppa transazioni per giorno
    private var transactionsByDay: [(String, [Transaction])] {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        dateFormatter.timeZone = TimeZone(identifier: "UTC")
        
        let displayFormatter = DateFormatter()
        displayFormatter.dateFormat = "dd MMM yyyy"
        displayFormatter.locale = Locale(identifier: "it_IT")
        
        let grouped = Dictionary(grouping: transactions) { transaction in
            guard let date = dateFormatter.date(from: transaction.date) else {
                return "Data non valida"
            }
            return displayFormatter.string(from: date)
        }
        
        return grouped.map { (key, value) in
            (key, value.sorted { $0.date > $1.date })
        }.sorted { $0.0 > $1.0 }
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: ThemeManager.Spacing.lg) {
                    // Header con info categoria
                    categoryHeader
                    
                    // Statistiche riepilogative
                    if !isLoading {
                        statisticsSection
                    }
                    
                    // Lista transazioni per giorno
                    if isLoading {
                        loadingView
                    } else if transactions.isEmpty {
                        emptyStateView
                    } else {
                        transactionsList
                    }
                }
                .padding(.horizontal, ThemeManager.Spacing.md)
                .padding(.bottom, ThemeManager.Spacing.lg)
            }
            .navigationTitle("Transazioni")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Chiudi") {
                        dismiss()
                    }
                }
            }
        }
        .onAppear {
            Task {
                await loadTransactions()
            }
        }
        .alert("Errore", isPresented: $showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage)
        }
    }
    
    // MARK: - Category Header
    private var categoryHeader: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            HStack {
                // Icona categoria
                ZStack {
                    Circle()
                        .fill(category.colorObject)
                        .frame(width: 50, height: 50)
                    
                    Image(systemName: getCategoryIcon(category.icon))
                        .font(.system(size: 24))
                        .foregroundColor(.white)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(category.name)
                        .font(ThemeManager.Typography.title2)
                        .fontWeight(.bold)
                        .foregroundColor(ThemeManager.Colors.text)
                    
                    Text(period)
                        .font(ThemeManager.Typography.body)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
                
                Spacer()
            }
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.lg)
    }
    
    // MARK: - Statistics Section
    private var statisticsSection: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            Text("Riepilogo")
                .font(ThemeManager.Typography.headline)
                .fontWeight(.bold)
                .foregroundColor(ThemeManager.Colors.text)
            
            HStack(spacing: ThemeManager.Spacing.md) {
                // Totale speso
                VStack(alignment: .leading, spacing: 4) {
                    Text("Totale Speso")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Text(formatCurrency(totalSpent))
                        .font(ThemeManager.Typography.title3)
                        .fontWeight(.bold)
                        .foregroundColor(ThemeManager.Colors.expense)
                }
                
                Spacer()
                
                // Numero transazioni
                VStack(alignment: .center, spacing: 4) {
                    Text("Transazioni")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Text("\(transactionCount)")
                        .font(ThemeManager.Typography.title3)
                        .fontWeight(.bold)
                        .foregroundColor(ThemeManager.Colors.text)
                }
                
                Spacer()
                
                // Spesa media
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Media")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Text(formatCurrency(averageSpent))
                        .font(ThemeManager.Typography.title3)
                        .fontWeight(.bold)
                        .foregroundColor(ThemeManager.Colors.primary)
                }
            }
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.lg)
    }
    
    // MARK: - Transactions List
    private var transactionsList: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            Text("Transazioni per Data")
                .font(ThemeManager.Typography.headline)
                .fontWeight(.bold)
                .foregroundColor(ThemeManager.Colors.text)
            
            ForEach(transactionsByDay, id: \.0) { (date, dayTransactions) in
                VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                    // Data del giorno
                    HStack {
                        Text(date)
                            .font(ThemeManager.Typography.bodyMedium)
                            .fontWeight(.semibold)
                            .foregroundColor(ThemeManager.Colors.text)
                        
                        Spacer()
                        
                        Text(formatCurrency(dayTransactions.reduce(0) { $0 + $1.amount }))
                            .font(ThemeManager.Typography.bodyMedium)
                            .fontWeight(.semibold)
                            .foregroundColor(ThemeManager.Colors.expense)
                    }
                    .padding(.horizontal, ThemeManager.Spacing.sm)
                    .padding(.vertical, ThemeManager.Spacing.xs)
                    .background(ThemeManager.Colors.border.opacity(0.1))
                    .cornerRadius(ThemeManager.CornerRadius.sm)
                    
                    // Transazioni del giorno
                    ForEach(dayTransactions, id: \.id) { transaction in
                        TransactionRowView(transaction: transaction)
                    }
                }
                .padding(.bottom, ThemeManager.Spacing.sm)
            }
        }
    }
    
    // MARK: - Loading View
    private var loadingView: some View {
        VStack(spacing: ThemeManager.Spacing.md) {
            ProgressView()
                .scaleEffect(1.2)
            
            Text("Caricamento transazioni...")
                .font(ThemeManager.Typography.body)
                .foregroundColor(ThemeManager.Colors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(ThemeManager.Spacing.xl)
    }
    
    // MARK: - Empty State
    private var emptyStateView: some View {
        VStack(spacing: ThemeManager.Spacing.md) {
            Image(systemName: "list.bullet")
                .font(.system(size: 48))
                .foregroundColor(ThemeManager.Colors.textSecondary)
            
            Text("Nessuna Transazione")
                .font(ThemeManager.Typography.title3)
                .fontWeight(.semibold)
                .foregroundColor(ThemeManager.Colors.text)
            
            Text("Non ci sono transazioni per questa categoria nel periodo selezionato.")
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
    private func loadTransactions() async {
        await MainActor.run {
            isLoading = true
            showError = false
        }
        
        do {
            // Ottieni il range di date per il periodo selezionato
            let dateRange = getDateRangeFromPeriod(selectedTimeFilter, customStart: customStartDate, customEnd: customEndDate)
            
            let transactionsResponse = try await apiManager.getTransactions(
                limit: 1000,
                page: 1,
                type: .expense,
                categoryId: category.id,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                search: nil
            )
            
            await MainActor.run {
                transactions = transactionsResponse.data
                isLoading = false
            }
        } catch {
            await MainActor.run {
                errorMessage = "Errore nel caricamento delle transazioni"
                showError = true
                isLoading = false
            }
        }
    }
    
    private func getCategoryIcon(_ iconName: String?) -> String {
        guard let iconName = iconName else { return "questionmark.circle" }
        
        switch iconName.lowercased() {
        case "shopping-cart", "cart", "shopping":
            return "cart.fill"
        case "utensils", "food", "restaurant":
            return "fork.knife"
        case "car":
            return "car.fill"
        case "home":
            return "house.fill"
        case "gamepad":
            return "gamecontroller.fill"
        case "medical":
            return "heart.fill"
        case "graduation-cap":
            return "graduationcap.fill"
        case "credit-card":
            return "creditcard.fill"
        case "gift":
            return "gift.fill"
        case "plane":
            return "airplane"
        case "coffee":
            return "cup.and.saucer.fill"
        case "music":
            return "music.note"
        case "tools":
            return "wrench.and.screwdriver.fill"
        case "pets":
            return "pawprint.fill"
        case "book":
            return "book.fill"
        case "camera":
            return "camera.fill"
        case "phone":
            return "phone.fill"
        case "laptop":
            return "laptopcomputer"
        case "lightbulb":
            return "lightbulb.fill"
        case "leaf":
            return "leaf.fill"
        default:
            return "circle.fill"
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

// MARK: - Transaction Row View
struct TransactionRowView: View {
    let transaction: Transaction
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(transaction.description)
                    .font(ThemeManager.Typography.body)
                    .fontWeight(.medium)
                    .foregroundColor(ThemeManager.Colors.text)
                
                if !transaction.tags.isEmpty {
                    HStack {
                        ForEach(transaction.tags.prefix(3), id: \.self) { tag in
                            Text(tag)
                                .font(ThemeManager.Typography.caption)
                                .foregroundColor(ThemeManager.Colors.primary)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(ThemeManager.Colors.primary.opacity(0.1))
                                .cornerRadius(8)
                        }
                        
                        if transaction.tags.count > 3 {
                            Text("+\(transaction.tags.count - 3)")
                                .font(ThemeManager.Typography.caption)
                                .foregroundColor(ThemeManager.Colors.textSecondary)
                        }
                    }
                }
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 2) {
                Text(formatCurrency(transaction.amount))
                    .font(ThemeManager.Typography.bodyMedium)
                    .fontWeight(.semibold)
                    .foregroundColor(ThemeManager.Colors.expense)
                
                Text(transaction.formattedDate)
                    .font(ThemeManager.Typography.caption)
                    .foregroundColor(ThemeManager.Colors.textSecondary)
            }
        }
        .padding(ThemeManager.Spacing.sm)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.sm)
    }
    
    private func formatCurrency(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "EUR"
        formatter.locale = Locale(identifier: "it_IT")
        return formatter.string(from: NSNumber(value: amount)) ?? "€0,00"
    }
}

struct CategoryTransactionsModal_Previews: PreviewProvider {
    static var previews: some View {
        let sampleCategory = Category(
            id: "1",
            name: "Spesa",
            icon: "shopping-cart",
            color: "#FF6B6B",
            isDefault: false,
            budget: "500",
            userId: "1",
            createdAt: "",
            updatedAt: "",
            _count: nil
        )
        
        CategoryTransactionsModal(
            category: sampleCategory, 
            period: "Luglio 2025",
            selectedTimeFilter: .current,
            customStartDate: Date(),
            customEndDate: Date()
        )
        .environmentObject(APIManager())
    }
}