import SwiftUI

struct TransactionGroup {
    let date: Date
    let transactions: [Transaction]
    let dailyTotal: Double
    let transactionCount: Int
}

struct TransactionsView: View {
    @EnvironmentObject var apiManager: APIManager
    @State private var transactions: [Transaction] = []
    @State private var isLoading = false
    @State private var isLoadingMore = false
    @State private var showingAddTransaction = false
    @State private var currentPage = 1
    @State private var hasMoreData = true
    @State private var pagination: Pagination?
    @State private var searchText = ""
    @State private var selectedType: TransactionType? = nil
    @State private var selectedTransaction: Transaction? = nil
    @State private var categories: [Category] = []
    @State private var selectedCategory: Category? = nil
    @State private var selectedMonth: Date = Date()
    @State private var showingFilters = false
    @State private var dateFilterMode: DateFilterMode = .month
    @State private var startDate: Date = Date()
    @State private var endDate: Date = Date()
    @State private var searchTask: Task<Void, Never>? = nil
    @State private var filterHash: String = ""
    
    enum DateFilterMode: Equatable {
        case month
        case range
    }
    
    // DateFormatter per convertire le stringhe di data in Date objects
    private let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        formatter.timeZone = TimeZone(identifier: "UTC")
        return formatter
    }()
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search and Filter
                VStack(spacing: 12) {
                    // Search Bar
                    HStack(spacing: 8) {
                        HStack {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(ThemeManager.Colors.textSecondary)
                                .font(.system(size: 16))
                            
                            TextField("Search transactions...", text: $searchText)
                                .textFieldStyle(PlainTextFieldStyle())
                                .font(.system(size: 16))
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 10)
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(8)
                        
                        Button(action: {
                            showingFilters.toggle()
                        }) {
                            Image(systemName: "slider.horizontal.3")
                                .font(.system(size: 16))
                                .foregroundColor(ThemeManager.Colors.textSecondary)
                                .padding(10)
                                .background(Color.gray.opacity(0.1))
                                .cornerRadius(8)
                        }
                    }
                    
                    // Type Filter
                    HStack(spacing: 8) {
                        Button(action: {
                            selectedType = nil
                        }) {
                            let isSelected = selectedType == nil
                            let textColor = isSelected ? Color.white : ThemeManager.Colors.textSecondary
                            let backgroundColor = isSelected ? Color.red : Color.gray.opacity(0.1)
                            
                            Text("All")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(textColor)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(backgroundColor)
                                .cornerRadius(20)
                        }
                        
                        Button(action: {
                            selectedType = .income
                        }) {
                            let isSelected = selectedType == .income
                            let textColor = isSelected ? Color.white : ThemeManager.Colors.textSecondary
                            let backgroundColor = isSelected ? Color.red : Color.gray.opacity(0.1)
                            
                            Text("Income")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(textColor)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(backgroundColor)
                                .cornerRadius(20)
                        }
                        
                        Button(action: {
                            selectedType = .expense
                        }) {
                            let isSelected = selectedType == .expense
                            let textColor = isSelected ? Color.white : ThemeManager.Colors.textSecondary
                            let backgroundColor = isSelected ? Color.red : Color.gray.opacity(0.1)
                            
                            Text("Expenses")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(textColor)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(backgroundColor)
                                .cornerRadius(20)
                        }
                        
                        Spacer()
                    }
                    
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 16)
                .background(Color.white)
                
                // Transactions List
                if isLoading {
                    VStack {
                        Spacer()
                        ProgressView()
                            .scaleEffect(1.2)
                        Spacer()
                    }
                } else if transactions.isEmpty {
                    VStack(spacing: ThemeManager.Spacing.md) {
                        Spacer()
                        Image(systemName: "list.bullet")
                            .font(.system(size: 50))
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                        
                        Text("Nessuna transazione trovata")
                            .font(ThemeManager.Typography.body)
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                        
                        if !searchText.isEmpty || selectedType != nil || selectedCategory != nil || hasActiveFilters {
                            Text("Prova a cambiare i filtri di ricerca")
                                .font(ThemeManager.Typography.footnote)
                                .foregroundColor(ThemeManager.Colors.textSecondary)
                        } else {
                            Text("Aggiungi la tua prima transazione")
                                .font(ThemeManager.Typography.footnote)
                                .foregroundColor(ThemeManager.Colors.textSecondary)
                        }
                        
                        Spacer()
                    }
                } else {
                    ScrollView {
                        LazyVStack(spacing: ThemeManager.Spacing.md) {
                            ForEach(groupedTransactions, id: \.date) { group in
                                VStack(alignment: .leading, spacing: 0) {
                                    // Header del gruppo con data e totale
                                    HStack {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(formatDate(group.date))
                                                .font(.system(size: 16, weight: .semibold))
                                                .foregroundColor(ThemeManager.Colors.text)
                                            Text("\(group.transactionCount) transactions")
                                                .font(.system(size: 14))
                                                .foregroundColor(ThemeManager.Colors.textSecondary)
                                        }
                                        
                                        Spacer()
                                        
                                        VStack(alignment: .trailing, spacing: 2) {
                                            Text(formatCurrency(group.dailyTotal))
                                                .font(.system(size: 16, weight: .semibold))
                                                .foregroundColor(group.dailyTotal >= 0 ? Color.green : Color.red)
                                            Text("Daily total")
                                                .font(.system(size: 14))
                                                .foregroundColor(ThemeManager.Colors.textSecondary)
                                        }
                                    }
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 12)
                                    
                                    // Transazioni del giorno in contenitore arrotondato
                                    VStack(spacing: 0) {
                                        ForEach(group.transactions) { transaction in
                                            TransactionRow(transaction: transaction)
                                                .padding(.horizontal, 16)
                                                .onTapGesture {
                                                    selectedTransaction = transaction
                                                }
                                        }
                                    }
                                    .background(Color.white)
                                    .cornerRadius(12)
                                    .padding(.horizontal, 16)
                                }
                            }
                            
                            // Infinite Scrolling Trigger
                            if hasMoreData && !isLoading {
                                HStack {
                                    Spacer()
                                    if isLoadingMore {
                                        ProgressView()
                                            .scaleEffect(0.8)
                                            .progressViewStyle(CircularProgressViewStyle())
                                    } else {
                                        Rectangle()
                                            .fill(Color.clear)
                                            .frame(height: 1)
                                    }
                                    Spacer()
                                }
                                .padding(.vertical, ThemeManager.Spacing.md)
                                .onAppear {
                                    Task {
                                        await loadMoreTransactions()
                                    }
                                }
                            }
                            
                            // Pagination info
                            if let pagination = pagination {
                                Text("Pagina \(pagination.page) di \(pagination.totalPages)")
                                    .font(ThemeManager.Typography.caption)
                                    .foregroundColor(ThemeManager.Colors.textSecondary)
                                    .padding(.bottom, ThemeManager.Spacing.md)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                }
            }
            .background(Color.gray.opacity(0.05))
            .navigationTitle("Transactions")
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
            .safeAreaInset(edge: .bottom) {
                if !filteredTransactions.isEmpty {
                    summaryView
                }
            }
            .sheet(isPresented: $showingAddTransaction) {
                AddTransactionView()
                    .onDisappear {
                        // Ricarica i dati quando si chiude la vista di aggiunta
                        Task {
                            await loadTransactions()
                        }
                    }
            }
            .sheet(item: $selectedTransaction) { transaction in
                TransactionDetailView(transaction: transaction)
                    .onDisappear {
                        // Ricarica i dati quando la vista di dettaglio si chiude
                        Task {
                            await loadTransactions()
                        }
                    }
            }
            .sheet(isPresented: $showingFilters) {
                TransactionFiltersSheet(
                    categories: categories,
                    selectedCategory: $selectedCategory,
                    dateFilterMode: $dateFilterMode,
                    selectedMonth: $selectedMonth,
                    startDate: $startDate,
                    endDate: $endDate,
                    hasActiveFilters: hasActiveFilters,
                    clearFilters: clearFilters
                )
                .presentationDetents([.medium])
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .onAppear {
            Task {
                await loadTransactions()
                await loadCategories()
            }
        }
        .onChange(of: generateFilterHash()) { _ in
            if searchText.isEmpty {
                Task {
                    await loadTransactions()
                }
            } else {
                // Cancel previous search task
                searchTask?.cancel()
                
                // Start new search task with delay
                searchTask = Task {
                    try? await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
                    if !Task.isCancelled {
                        await loadTransactions()
                    }
                }
            }
        }
        .refreshable {
            await loadTransactions()
        }
    }
    
    private var hasActiveFilters: Bool {
        if dateFilterMode == .month {
            return selectedCategory != nil || !Calendar.current.isDate(selectedMonth, equalTo: Date(), toGranularity: .month)
        } else {
            return selectedCategory != nil || !Calendar.current.isDate(startDate, equalTo: Date(), toGranularity: .day) || !Calendar.current.isDate(endDate, equalTo: Date(), toGranularity: .day)
        }
    }
    
    private func clearFilters() {
        selectedCategory = nil
        selectedMonth = Date()
        startDate = Date()
        endDate = Date()
        dateFilterMode = .month
    }
    
    private var filteredTransactions: [Transaction] {
        return transactions
    }
    
    private var groupedTransactions: [TransactionGroup] {
        let sorted = transactions.sorted { $0.date > $1.date }
        
        let grouped = Dictionary(grouping: sorted) { transaction in
            // Converti la stringa date in Date object
            guard let date = dateFormatter.date(from: transaction.date) else {
                return Date() // Fallback per date invalide
            }
            return Calendar.current.startOfDay(for: date)
        }
        
        return grouped.map { date, transactions in
            let dailyTotal = transactions.reduce(0) { total, transaction in
                return total + (transaction.type == .income ? transaction.amount : -transaction.amount)
            }
            return TransactionGroup(
                date: date,
                transactions: transactions,
                dailyTotal: dailyTotal,
                transactionCount: transactions.count
            )
        }.sorted { $0.date > $1.date }
    }
    
    private var summaryView: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Entrate")
                    .font(ThemeManager.Typography.footnote)
                    .foregroundColor(ThemeManager.Colors.textSecondary)
                Text(formatCurrency(totalIncome))
                    .font(ThemeManager.Typography.bodyMedium)
                    .fontWeight(.semibold)
                    .foregroundColor(ThemeManager.Colors.income)
            }
            
            Spacer()
            
            VStack(alignment: .center, spacing: 4) {
                Text("Uscite")
                    .font(ThemeManager.Typography.footnote)
                    .foregroundColor(ThemeManager.Colors.textSecondary)
                Text(formatCurrency(totalExpenses))
                    .font(ThemeManager.Typography.bodyMedium)
                    .fontWeight(.semibold)
                    .foregroundColor(ThemeManager.Colors.expense)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 4) {
                Text("Saldo")
                    .font(ThemeManager.Typography.footnote)
                    .foregroundColor(ThemeManager.Colors.textSecondary)
                Text(formatCurrency(totalBalance))
                    .font(ThemeManager.Typography.bodyMedium)
                    .fontWeight(.bold)
                    .foregroundColor(totalBalance >= 0 ? ThemeManager.Colors.success : ThemeManager.Colors.error)
            }
        }
        .padding(.horizontal, ThemeManager.Spacing.md)
        .padding(.vertical, ThemeManager.Spacing.sm)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.md)
        .shadow(color: ThemeManager.Colors.border.opacity(0.1), radius: 2, x: 0, y: -1)
        .padding(.horizontal, ThemeManager.Spacing.md)
        .padding(.bottom, ThemeManager.Spacing.sm)
    }
    
    private var totalIncome: Double {
        filteredTransactions.filter { $0.type == .income }.reduce(0) { $0 + $1.amount }
    }
    
    private var totalExpenses: Double {
        filteredTransactions.filter { $0.type == .expense }.reduce(0) { $0 + $1.amount }
    }
    
    private var totalBalance: Double {
        totalIncome - totalExpenses
    }
    
    private func loadTransactions() async {
        isLoading = true
        currentPage = 1
        
        do {
            let startDateParam = getStartDateString()
            let endDateParam = getEndDateString()
            print("📱 [DEBUG] Caricamento transazioni (pagina \(currentPage))...")
            print("📱 [DEBUG] Parametri: type=\(selectedType?.rawValue ?? "nil"), categoryId=\(selectedCategory?.id ?? "nil"), startDate=\(startDateParam ?? "nil"), endDate=\(endDateParam ?? "nil"), search=\(searchText.isEmpty ? "nil" : searchText)")
            let response = try await apiManager.getTransactions(
                limit: 20, 
                page: currentPage,
                type: selectedType,
                categoryId: selectedCategory?.id,
                startDate: getStartDateString(),
                endDate: getEndDateString(),
                search: searchText.isEmpty ? nil : searchText
            )
            print("📱 [DEBUG] Transazioni caricate: \(response.data.count)")
            
            await MainActor.run {
                transactions = response.data
                pagination = response.pagination
                hasMoreData = response.pagination?.page ?? 1 < response.pagination?.totalPages ?? 1
                isLoading = false
            }
        } catch {
            await MainActor.run {
                isLoading = false
                ErrorManager.shared.handleError(error, context: "Transazioni - Caricamento")
            }
        }
    }
    
    private func loadMoreTransactions() async {
        guard hasMoreData, !isLoadingMore else { return }
        
        isLoadingMore = true
        currentPage += 1
        
        do {
            print("📱 [DEBUG] Caricamento transazioni aggiuntive (pagina \(currentPage))...")
            let response = try await apiManager.getTransactions(
                limit: 20, 
                page: currentPage,
                type: selectedType,
                categoryId: selectedCategory?.id,
                startDate: getStartDateString(),
                endDate: getEndDateString(),
                search: searchText.isEmpty ? nil : searchText
            )
            print("📱 [DEBUG] Transazioni aggiuntive caricate: \(response.data.count)")
            
            await MainActor.run {
                transactions.append(contentsOf: response.data)
                pagination = response.pagination
                hasMoreData = response.pagination?.page ?? 1 < response.pagination?.totalPages ?? 1
                isLoadingMore = false
            }
        } catch {
            await MainActor.run {
                // Rollback the page increment on error
                currentPage -= 1
                isLoadingMore = false
                ErrorManager.shared.handleError(error, context: "Transazioni - Caricamento pagina aggiuntiva")
            }
        }
    }
    
    private func loadCategories() async {
        do {
            print("📱 [DEBUG] Caricamento categorie...")
            let categoriesResponse = try await apiManager.getCategories()
            print("📱 [DEBUG] Categorie caricate: \(categoriesResponse.count)")
            
            await MainActor.run {
                categories = categoriesResponse
            }
        } catch {
            await MainActor.run {
                ErrorManager.shared.handleError(error, context: "Transazioni - Caricamento categorie")
            }
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "it_IT")
        
        if Calendar.current.isDateInToday(date) {
            return "Oggi"
        } else if Calendar.current.isDateInYesterday(date) {
            return "Ieri"
        } else if Calendar.current.isDate(date, equalTo: Date(), toGranularity: .year) {
            // Stesso anno: mostra solo giorno e mese
            formatter.dateFormat = "EEEE, d MMMM"
            return formatter.string(from: date).capitalized
        } else {
            // Anno diverso: mostra tutto
            formatter.dateFormat = "EEEE, d MMMM yyyy"
            return formatter.string(from: date).capitalized
        }
    }
    
    private func formatCurrency(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "EUR"
        formatter.locale = Locale(identifier: "it_IT")
        return formatter.string(from: NSNumber(value: amount)) ?? "€0,00"
    }
    
    private func getSelectedPeriodText() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "dd-MM-yyyy"
        
        if dateFilterMode == .month {
            let calendar = Calendar.current
            let startOfMonth = calendar.dateInterval(of: .month, for: selectedMonth)?.start ?? selectedMonth
            let endOfMonth = calendar.dateInterval(of: .month, for: selectedMonth)?.end ?? selectedMonth
            let lastDayOfMonth = calendar.date(byAdding: .day, value: -1, to: endOfMonth) ?? selectedMonth
            
            return "dal \(formatter.string(from: startOfMonth)) al \(formatter.string(from: lastDayOfMonth))"
        } else {
            return "dal \(formatter.string(from: startDate)) al \(formatter.string(from: endDate))"
        }
    }
    
    private func getStartDateString() -> String? {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        
        if dateFilterMode == .month {
            let calendar = Calendar.current
            let startOfMonth = calendar.dateInterval(of: .month, for: selectedMonth)?.start ?? selectedMonth
            return formatter.string(from: startOfMonth)
        } else {
            return formatter.string(from: startDate)
        }
    }
    
    private func getEndDateString() -> String? {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        
        if dateFilterMode == .month {
            let calendar = Calendar.current
            let endOfMonth = calendar.dateInterval(of: .month, for: selectedMonth)?.end ?? selectedMonth
            let lastDayOfMonth = calendar.date(byAdding: .day, value: -1, to: endOfMonth) ?? selectedMonth
            return formatter.string(from: lastDayOfMonth)
        } else {
            return formatter.string(from: endDate)
        }
    }
    
    private func generateFilterHash() -> String {
        let typeString = selectedType?.rawValue ?? "nil"
        let categoryString = selectedCategory?.id ?? "nil"
        let startDateString = getStartDateString() ?? "nil"
        let endDateString = getEndDateString() ?? "nil"
        let searchString = searchText.isEmpty ? "nil" : searchText
        let modeString = dateFilterMode == .month ? "month" : "range"
        
        return "\(typeString)-\(categoryString)-\(startDateString)-\(endDateString)-\(searchString)-\(modeString)"
    }
}

struct TransactionFiltersSheet: View {
    let categories: [Category]
    @Binding var selectedCategory: Category?
    @Binding var dateFilterMode: TransactionsView.DateFilterMode
    @Binding var selectedMonth: Date
    @Binding var startDate: Date
    @Binding var endDate: Date
    let hasActiveFilters: Bool
    let clearFilters: () -> Void
    
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: 24) {
                // Category Filter
                if !categories.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Filter by Category")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.primary)
                        
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                Button(action: {
                                    selectedCategory = nil
                                }) {
                                    let isSelected = selectedCategory == nil
                                    let textColor = isSelected ? Color.white : Color.secondary
                                    let backgroundColor = isSelected ? Color.red : Color.gray.opacity(0.1)
                                    
                                    Text("All")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(textColor)
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 8)
                                        .background(backgroundColor)
                                        .cornerRadius(20)
                                }
                                
                                ForEach(categories) { category in
                                    Button(action: {
                                        selectedCategory = category
                                    }) {
                                        let isSelected = selectedCategory?.id == category.id
                                        let textColor = isSelected ? Color.white : Color.secondary
                                        let backgroundColor = isSelected ? Color.red : Color.gray.opacity(0.1)
                                        
                                        HStack(spacing: 6) {
                                            Circle()
                                                .fill(category.colorObject)
                                                .frame(width: 8, height: 8)
                                            
                                            Text(category.name)
                                                .font(.system(size: 14, weight: .medium))
                                                .foregroundColor(textColor)
                                        }
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 8)
                                        .background(backgroundColor)
                                        .cornerRadius(20)
                                    }
                                }
                            }
                            .padding(.horizontal, 4)
                        }
                    }
                }
                
                // Date Filter
                VStack(alignment: .leading, spacing: 12) {
                    Text("Filter by Date")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.primary)
                    
                    // Date filter mode selector
                    HStack(spacing: 8) {
                        Button(action: {
                            dateFilterMode = .month
                        }) {
                            let isSelected = dateFilterMode == .month
                            let textColor = isSelected ? Color.white : Color.secondary
                            let backgroundColor = isSelected ? Color.red : Color.gray.opacity(0.1)
                            
                            Text("Month")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(textColor)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(backgroundColor)
                                .cornerRadius(20)
                        }
                        
                        Button(action: {
                            dateFilterMode = .range
                        }) {
                            let isSelected = dateFilterMode == .range
                            let textColor = isSelected ? Color.white : Color.secondary
                            let backgroundColor = isSelected ? Color.red : Color.gray.opacity(0.1)
                            
                            Text("Date Range")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(textColor)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(backgroundColor)
                                .cornerRadius(20)
                        }
                        
                        Spacer()
                    }
                    
                    // Date picker based on mode
                    if dateFilterMode == .month {
                        DatePicker("Select Month", selection: $selectedMonth, displayedComponents: .date)
                            .datePickerStyle(CompactDatePickerStyle())
                            .frame(maxWidth: .infinity, alignment: .leading)
                    } else {
                        VStack(spacing: 12) {
                            HStack {
                                Text("From:")
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundColor(.secondary)
                                    .frame(width: 60, alignment: .leading)
                                
                                DatePicker("", selection: $startDate, displayedComponents: .date)
                                    .datePickerStyle(CompactDatePickerStyle())
                            }
                            
                            HStack {
                                Text("To:")
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundColor(.secondary)
                                    .frame(width: 60, alignment: .leading)
                                
                                DatePicker("", selection: $endDate, displayedComponents: .date)
                                    .datePickerStyle(CompactDatePickerStyle())
                            }
                        }
                    }
                }
                
                Spacer()
                
                // Clear Filters Button
                if hasActiveFilters {
                    Button(action: {
                        clearFilters()
                        dismiss()
                    }) {
                        HStack {
                            Spacer()
                            Text("Clear All Filters")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.red)
                            Spacer()
                        }
                        .padding(.vertical, 12)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(8)
                    }
                }
            }
            .padding(20)
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(.red)
                }
            }
        }
    }
}

struct TransactionsView_Previews: PreviewProvider {
    static var previews: some View {
        TransactionsView()
            .environmentObject(APIManager())
    }
} 