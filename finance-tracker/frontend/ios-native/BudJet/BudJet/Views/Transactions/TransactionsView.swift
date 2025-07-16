import SwiftUI

struct TransactionGroup {
    let date: Date
    let transactions: [Transaction]
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
                VStack(spacing: ThemeManager.Spacing.sm) {
                    // Search Bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                        
                        TextField("Cerca transazioni...", text: $searchText)
                            .textFieldStyle(PlainTextFieldStyle())
                    }
                    .padding(.horizontal, ThemeManager.Spacing.md)
                    .padding(.vertical, ThemeManager.Spacing.sm)
                    .background(ThemeManager.Colors.surface)
                    .cornerRadius(ThemeManager.CornerRadius.md)
                    
                    // Type Filter
                    HStack {
                        Button(action: {
                            selectedType = nil
                        }) {
                            Text("Tutte")
                                .font(ThemeManager.Typography.footnote)
                                .foregroundColor(selectedType == nil ? .white : ThemeManager.Colors.textSecondary)
                                .padding(.horizontal, ThemeManager.Spacing.sm)
                                .padding(.vertical, ThemeManager.Spacing.xs)
                                .background(
                                    selectedType == nil ? ThemeManager.Colors.primary : ThemeManager.Colors.surface
                                )
                                .cornerRadius(ThemeManager.CornerRadius.sm)
                        }
                        
                        Button(action: {
                            selectedType = .expense
                        }) {
                            Text("Uscite")
                                .font(ThemeManager.Typography.footnote)
                                .foregroundColor(selectedType == .expense ? .white : ThemeManager.Colors.textSecondary)
                                .padding(.horizontal, ThemeManager.Spacing.sm)
                                .padding(.vertical, ThemeManager.Spacing.xs)
                                .background(
                                    selectedType == .expense ? ThemeManager.Colors.expense : ThemeManager.Colors.surface
                                )
                                .cornerRadius(ThemeManager.CornerRadius.sm)
                        }
                        
                        Button(action: {
                            selectedType = .income
                        }) {
                            Text("Entrate")
                                .font(ThemeManager.Typography.footnote)
                                .foregroundColor(selectedType == .income ? .white : ThemeManager.Colors.textSecondary)
                                .padding(.horizontal, ThemeManager.Spacing.sm)
                                .padding(.vertical, ThemeManager.Spacing.xs)
                                .background(
                                    selectedType == .income ? ThemeManager.Colors.income : ThemeManager.Colors.surface
                                )
                                .cornerRadius(ThemeManager.CornerRadius.sm)
                        }
                        
                        Spacer()
                        
                        Button(action: {
                            showingFilters.toggle()
                        }) {
                            Image(systemName: "line.3.horizontal.decrease.circle")
                                .font(.title3)
                                .foregroundColor(hasActiveFilters ? ThemeManager.Colors.primary : ThemeManager.Colors.textSecondary)
                        }
                    }
                    
                    // Advanced Filters (collapsible)
                    if showingFilters {
                        VStack(spacing: ThemeManager.Spacing.sm) {
                            // Category Filter
                            if !categories.isEmpty {
                                VStack(alignment: .leading, spacing: ThemeManager.Spacing.xs) {
                                    Text("Filtra per Categoria")
                                        .font(ThemeManager.Typography.footnote)
                                        .foregroundColor(ThemeManager.Colors.text)
                                    
                                    ScrollView(.horizontal, showsIndicators: false) {
                                        HStack(spacing: ThemeManager.Spacing.xs) {
                                            Button(action: {
                                                selectedCategory = nil
                                            }) {
                                                Text("Tutte")
                                                    .font(ThemeManager.Typography.caption)
                                                    .foregroundColor(selectedCategory == nil ? .white : ThemeManager.Colors.textSecondary)
                                                    .padding(.horizontal, ThemeManager.Spacing.sm)
                                                    .padding(.vertical, ThemeManager.Spacing.xs)
                                                    .background(
                                                        selectedCategory == nil ? ThemeManager.Colors.primary : ThemeManager.Colors.surface
                                                    )
                                                    .cornerRadius(ThemeManager.CornerRadius.sm)
                                            }
                                            
                                            ForEach(categories) { category in
                                                Button(action: {
                                                    selectedCategory = category
                                                }) {
                                                    HStack(spacing: ThemeManager.Spacing.xs) {
                                                        Circle()
                                                            .fill(category.colorObject)
                                                            .frame(width: 8, height: 8)
                                                        
                                                        Text(category.name)
                                                            .font(ThemeManager.Typography.caption)
                                                            .foregroundColor(selectedCategory?.id == category.id ? .white : ThemeManager.Colors.textSecondary)
                                                    }
                                                    .padding(.horizontal, ThemeManager.Spacing.sm)
                                                    .padding(.vertical, ThemeManager.Spacing.xs)
                                                    .background(
                                                        selectedCategory?.id == category.id ? ThemeManager.Colors.primary : ThemeManager.Colors.surface
                                                    )
                                                    .cornerRadius(ThemeManager.CornerRadius.sm)
                                                }
                                            }
                                        }
                                        .padding(.horizontal, ThemeManager.Spacing.xs)
                                    }
                                }
                            }
                            
                            // Month Filter
                            VStack(alignment: .leading, spacing: ThemeManager.Spacing.xs) {
                                Text("Filtra per Mese")
                                    .font(ThemeManager.Typography.footnote)
                                    .foregroundColor(ThemeManager.Colors.text)
                                
                                DatePicker("", selection: $selectedMonth, displayedComponents: .date)
                                    .datePickerStyle(CompactDatePickerStyle())
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            
                            // Clear Filters Button
                            if hasActiveFilters {
                                Button(action: clearFilters) {
                                    Text("Rimuovi Filtri")
                                        .font(ThemeManager.Typography.footnote)
                                        .foregroundColor(ThemeManager.Colors.primary)
                                }
                            }
                        }
                        .padding(.top, ThemeManager.Spacing.sm)
                    }
                }
                .padding(.horizontal, ThemeManager.Spacing.md)
                .padding(.vertical, ThemeManager.Spacing.sm)
                .background(ThemeManager.Colors.background)
                
                // Transactions List
                if isLoading {
                    VStack {
                        Spacer()
                        ProgressView()
                            .scaleEffect(1.2)
                        Spacer()
                    }
                } else if filteredTransactions.isEmpty {
                    VStack(spacing: ThemeManager.Spacing.md) {
                        Spacer()
                        Image(systemName: "list.bullet")
                            .font(.system(size: 50))
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                        
                        Text("Nessuna transazione trovata")
                            .font(ThemeManager.Typography.body)
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                        
                        if !searchText.isEmpty || selectedType != nil {
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
                                VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                                    // Data del gruppo
                                    Text(formatDate(group.date))
                                        .font(ThemeManager.Typography.bodyMedium)
                                        .fontWeight(.semibold)
                                        .foregroundColor(ThemeManager.Colors.text)
                                        .padding(.horizontal, ThemeManager.Spacing.md)
                                        .padding(.top, ThemeManager.Spacing.sm)
                                    
                                    // Transazioni del giorno
                                    ForEach(group.transactions) { transaction in
                                        TransactionRow(transaction: transaction)
                                            .padding(.horizontal, ThemeManager.Spacing.md)
                                            .onTapGesture {
                                                selectedTransaction = transaction
                                            }
                                    }
                                }
                            }
                            
                            // Load More Button
                            if hasMoreData && !isLoading {
                                Button(action: {
                                    Task {
                                        await loadMoreTransactions()
                                    }
                                }) {
                                    HStack {
                                        if isLoadingMore {
                                            ProgressView()
                                                .scaleEffect(0.8)
                                                .progressViewStyle(CircularProgressViewStyle())
                                        } else {
                                            Image(systemName: "arrow.down.circle")
                                                .font(.system(size: 18))
                                        }
                                        
                                        Text(isLoadingMore ? "Caricamento..." : "Carica altre transazioni")
                                            .font(ThemeManager.Typography.bodyMedium)
                                    }
                                    .foregroundColor(ThemeManager.Colors.primary)
                                    .padding(.vertical, ThemeManager.Spacing.md)
                                }
                                .disabled(isLoadingMore)
                            }
                            
                            // Pagination info
                            if let pagination = pagination {
                                Text("Pagina \(pagination.page) di \(pagination.totalPages)")
                                    .font(ThemeManager.Typography.caption)
                                    .foregroundColor(ThemeManager.Colors.textSecondary)
                                    .padding(.bottom, ThemeManager.Spacing.md)
                            }
                        }
                        .padding(.vertical, ThemeManager.Spacing.sm)
                    }
                }
            }
            .navigationTitle("Transazioni")
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
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .onAppear {
            Task {
                await loadTransactions()
            }
        }
        .refreshable {
            await loadTransactions()
        }
        .onAppear {
            Task {
                await loadCategories()
            }
        }
    }
    
    private var hasActiveFilters: Bool {
        selectedCategory != nil || !Calendar.current.isDate(selectedMonth, equalTo: Date(), toGranularity: .month)
    }
    
    private func clearFilters() {
        selectedCategory = nil
        selectedMonth = Date()
    }
    
    private var filteredTransactions: [Transaction] {
        var filtered = transactions
        
        if let type = selectedType {
            filtered = filtered.filter { $0.type == type }
        }
        
        if let category = selectedCategory {
            filtered = filtered.filter { $0.category.id == category.id }
        }
        
        // Month filter
        let calendar = Calendar.current
        let selectedMonthComponents = calendar.dateComponents([.year, .month], from: selectedMonth)
        
        filtered = filtered.filter { transaction in
            guard let transactionDate = dateFormatter.date(from: transaction.date) else { return false }
            let transactionComponents = calendar.dateComponents([.year, .month], from: transactionDate)
            return transactionComponents.year == selectedMonthComponents.year &&
                   transactionComponents.month == selectedMonthComponents.month
        }
        
        if !searchText.isEmpty {
            filtered = filtered.filter { 
                $0.description.localizedCaseInsensitiveContains(searchText) ||
                $0.category.name.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        return filtered
    }
    
    private var groupedTransactions: [TransactionGroup] {
        let sorted = filteredTransactions.sorted { $0.date > $1.date }
        
        let grouped = Dictionary(grouping: sorted) { transaction in
            // Converti la stringa date in Date object
            guard let date = dateFormatter.date(from: transaction.date) else {
                return Date() // Fallback per date invalide
            }
            return Calendar.current.startOfDay(for: date)
        }
        
        return grouped.map { date, transactions in
            TransactionGroup(date: date, transactions: transactions)
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
            print("📱 [DEBUG] Caricamento transazioni (pagina \(currentPage))...")
            let response = try await apiManager.getTransactions(limit: 20, page: currentPage)
            print("📱 [DEBUG] Transazioni caricate: \(response.data.count)")
            
            await MainActor.run {
                transactions = response.data
                pagination = response.pagination
                hasMoreData = response.pagination?.page ?? 1 < response.pagination?.totalPages ?? 1
                isLoading = false
            }
        } catch {
            print("❌ [ERROR] Errore nel caricamento delle transazioni: \(error)")
            
            // Gestione errori più dettagliata
            if let apiError = error as? APIError {
                print("❌ [ERROR] API Error: \(apiError)")
            }
            
            await MainActor.run {
                isLoading = false
            }
        }
    }
    
    private func loadMoreTransactions() async {
        guard hasMoreData, !isLoadingMore else { return }
        
        isLoadingMore = true
        currentPage += 1
        
        do {
            print("📱 [DEBUG] Caricamento transazioni aggiuntive (pagina \(currentPage))...")
            let response = try await apiManager.getTransactions(limit: 20, page: currentPage)
            print("📱 [DEBUG] Transazioni aggiuntive caricate: \(response.data.count)")
            
            await MainActor.run {
                transactions.append(contentsOf: response.data)
                pagination = response.pagination
                hasMoreData = response.pagination?.page ?? 1 < response.pagination?.totalPages ?? 1
                isLoadingMore = false
            }
        } catch {
            print("❌ [ERROR] Errore nel caricamento delle transazioni aggiuntive: \(error)")
            
            await MainActor.run {
                // Rollback the page increment on error
                currentPage -= 1
                isLoadingMore = false
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
            print("❌ [ERROR] Errore nel caricamento delle categorie: \(error)")
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
}

struct TransactionsView_Previews: PreviewProvider {
    static var previews: some View {
        TransactionsView()
            .environmentObject(APIManager())
    }
} 