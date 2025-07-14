import SwiftUI

struct TransactionsView: View {
    @EnvironmentObject var apiManager: APIManager
    @State private var transactions: [Transaction] = []
    @State private var isLoading = false
    @State private var showingAddTransaction = false
    @State private var searchText = ""
    @State private var selectedType: TransactionType? = nil
    
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
                    VStack {
                        Spacer()
                        Image(systemName: "list.bullet")
                            .font(.system(size: 50))
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                        
                        Text("Nessuna transazione trovata")
                            .font(ThemeManager.Typography.body)
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                        
                        Spacer()
                    }
                } else {
                    ScrollView {
                        LazyVStack(spacing: ThemeManager.Spacing.sm) {
                            ForEach(filteredTransactions) { transaction in
                                TransactionRow(transaction: transaction)
                            }
                        }
                        .padding(.horizontal, ThemeManager.Spacing.md)
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
            .sheet(isPresented: $showingAddTransaction) {
                AddTransactionView()
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
    }
    
    private var filteredTransactions: [Transaction] {
        var filtered = transactions
        
        if let type = selectedType {
            filtered = filtered.filter { $0.type == type }
        }
        
        if !searchText.isEmpty {
            filtered = filtered.filter { 
                $0.description.localizedCaseInsensitiveContains(searchText) ||
                $0.category.name.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        return filtered
    }
    
    private func loadTransactions() async {
        isLoading = true
        
        do {
            let response = try await apiManager.getTransactions(limit: 100)
            await MainActor.run {
                transactions = response.data
                isLoading = false
            }
        } catch {
            print("Errore nel caricamento delle transazioni: \(error)")
            await MainActor.run {
                isLoading = false
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