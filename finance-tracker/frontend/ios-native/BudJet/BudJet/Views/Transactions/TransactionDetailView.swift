import SwiftUI

struct TransactionDetailView: View {
    @EnvironmentObject var apiManager: APIManager
    @Environment(\.dismiss) private var dismiss
    @State private var transaction: Transaction
    @State private var isEditing = false
    @State private var isLoading = false
    @State private var showDeleteConfirmation = false
    @State private var showEditView = false
    
    init(transaction: Transaction) {
        self._transaction = State(initialValue: transaction)
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: ThemeManager.Spacing.lg) {
                    // Header con icona e categoria
                    headerView
                    
                    // Dettagli principali
                    detailsSection
                    
                    // Informazioni aggiuntive
                    additionalInfoSection
                    
                    // Azioni
                    actionsSection
                }
                .padding(ThemeManager.Spacing.md)
            }
            .navigationTitle("Dettagli Transazione")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Chiudi") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Modifica") {
                        showEditView = true
                    }
                    .foregroundColor(ThemeManager.Colors.primary)
                }
            }
            .alert("Elimina Transazione", isPresented: $showDeleteConfirmation) {
                Button("Elimina", role: .destructive) {
                    Task {
                        await deleteTransaction()
                    }
                }
                Button("Annulla", role: .cancel) { }
            } message: {
                Text("Sei sicuro di voler eliminare questa transazione? Questa azione non può essere annullata.")
            }
            .sheet(isPresented: $showEditView) {
                EditTransactionView(transaction: transaction) { updatedTransaction in
                    transaction = updatedTransaction
                }
            }
        }
    }
    
    // MARK: - Header View
    private var headerView: some View {
        VStack(spacing: ThemeManager.Spacing.md) {
            // Icona categoria
            Circle()
                .fill(transaction.category.colorObject)
                .frame(width: 80, height: 80)
                .overlay(
                    Image(systemName: categoryIcon)
                        .font(.system(size: 32, weight: .medium))
                        .foregroundColor(.white)
                )
            
            // Importo
            Text(transaction.formattedAmount)
                .font(.system(size: 36, weight: .bold))
                .foregroundColor(transactionColor)
            
            // Descrizione
            Text(transaction.description)
                .font(ThemeManager.Typography.headline)
                .foregroundColor(ThemeManager.Colors.text)
                .multilineTextAlignment(.center)
        }
        .padding(ThemeManager.Spacing.lg)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.lg)
    }
    
    // MARK: - Details Section
    private var detailsSection: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            Text("Dettagli")
                .font(ThemeManager.Typography.headline)
                .foregroundColor(ThemeManager.Colors.text)
            
            VStack(spacing: ThemeManager.Spacing.sm) {
                DetailRow(title: "Categoria", value: transaction.category.name)
                DetailRow(title: "Tipo", value: transaction.type.displayName)
                DetailRow(title: "Data", value: transaction.formattedDate)
                
                if !transaction.tags.isEmpty {
                    DetailRow(title: "Tags", value: transaction.tags.joined(separator: ", "))
                }
            }
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.md)
    }
    
    // MARK: - Additional Info Section
    private var additionalInfoSection: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            Text("Informazioni Aggiuntive")
                .font(ThemeManager.Typography.headline)
                .foregroundColor(ThemeManager.Colors.text)
            
            VStack(spacing: ThemeManager.Spacing.sm) {
                DetailRow(title: "ID", value: transaction.id)
                DetailRow(title: "Creata", value: formatDateTime(transaction.createdAt))
                
                if let updatedAt = transaction.updatedAt {
                    DetailRow(title: "Modificata", value: formatDateTime(updatedAt))
                }
            }
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.md)
    }
    
    // MARK: - Actions Section
    private var actionsSection: some View {
        VStack(spacing: ThemeManager.Spacing.md) {
            Button(action: {
                showEditView = true
            }) {
                HStack {
                    Image(systemName: "pencil")
                    Text("Modifica Transazione")
                }
                .font(ThemeManager.Typography.bodyMedium)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(ThemeManager.Spacing.md)
                .background(ThemeManager.Colors.primary)
                .cornerRadius(ThemeManager.CornerRadius.md)
            }
            
            Button(action: {
                showDeleteConfirmation = true
            }) {
                HStack {
                    Image(systemName: "trash")
                    Text("Elimina Transazione")
                }
                .font(ThemeManager.Typography.bodyMedium)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(ThemeManager.Spacing.md)
                .background(ThemeManager.Colors.error)
                .cornerRadius(ThemeManager.CornerRadius.md)
            }
        }
    }
    
    // MARK: - Computed Properties
    private var transactionColor: Color {
        switch transaction.type {
        case .income:
            return ThemeManager.Colors.success
        case .expense:
            return ThemeManager.Colors.error
        }
    }
    
    private var categoryIcon: String {
        switch transaction.category.name.lowercased() {
        case "grocery", "alimentari":
            return "cart.fill"
        case "restaurant":
            return "fork.knife"
        case "car", "trasporti":
            return "car.fill"
        case "home", "casa":
            return "house.fill"
        case "health", "salute":
            return "heart.fill"
        case "technology":
            return "laptopcomputer"
        case "shopping":
            return "bag.fill"
        case "salary", "stipendio":
            return "dollarsign.circle.fill"
        case "utilities":
            return "lightbulb.fill"
        case "pets":
            return "pawprint.fill"
        case "taxes":
            return "doc.text.fill"
        case "bar":
            return "cup.and.saucer.fill"
        case "special":
            return "star.fill"
        default:
            return "questionmark.circle.fill"
        }
    }
    
    // MARK: - Helper Methods
    private func formatDateTime(_ dateString: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        
        if let date = formatter.date(from: dateString) {
            formatter.dateFormat = "dd/MM/yyyy HH:mm"
            return formatter.string(from: date)
        }
        
        return dateString
    }
    
    private func deleteTransaction() async {
        isLoading = true
        
        do {
            try await apiManager.deleteTransaction(id: transaction.id)
            await MainActor.run {
                dismiss()
            }
        } catch {
            print("❌ [ERROR] Errore nell'eliminazione della transazione: \(error)")
            // Qui potresti aggiungere un alert per mostrare l'errore
        }
        
        isLoading = false
    }
}

// MARK: - Detail Row Component
struct DetailRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
                .font(ThemeManager.Typography.bodyMedium)
                .foregroundColor(ThemeManager.Colors.textSecondary)
            
            Spacer()
            
            Text(value)
                .font(ThemeManager.Typography.bodyMedium)
                .foregroundColor(ThemeManager.Colors.text)
                .multilineTextAlignment(.trailing)
        }
        .padding(.vertical, ThemeManager.Spacing.xs)
    }
}

// MARK: - Edit Transaction View
struct EditTransactionView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var transaction: Transaction
    let onSave: (Transaction) -> Void
    
    init(transaction: Transaction, onSave: @escaping (Transaction) -> Void) {
        self._transaction = State(initialValue: transaction)
        self.onSave = onSave
    }
    
    var body: some View {
        NavigationView {
            Text("Modifica Transazione")
                .navigationTitle("Modifica")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Annulla") {
                            dismiss()
                        }
                    }
                    
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Salva") {
                            onSave(transaction)
                            dismiss()
                        }
                        .foregroundColor(ThemeManager.Colors.primary)
                    }
                }
        }
    }
}

struct TransactionDetailView_Previews: PreviewProvider {
    static var previews: some View {
        TransactionDetailView(transaction: Transaction(
            id: "1",
            amount: 50.0,
            description: "Spesa al supermercato",
            date: "2025-07-15",
            type: .expense,
            category: Category(
                id: "1",
                name: "Grocery",
                icon: "cart",
                color: "#FF5733",
                isDefault: true,
                budget: "600",
                userId: "user1",
                createdAt: "2025-07-15",
                updatedAt: "2025-07-15",
                _count: CategoryCount(transactions: 10)
            ),
            tags: ["supermercato", "essenziale"],
            createdAt: "2025-07-15T10:00:00.000Z",
            updatedAt: "2025-07-15T10:00:00.000Z"
        ))
        .environmentObject(APIManager())
    }
} 