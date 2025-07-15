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
    @EnvironmentObject var apiManager: APIManager
    @Environment(\.dismiss) private var dismiss
    
    private let originalTransaction: Transaction
    let onSave: (Transaction) -> Void
    
    @State private var description = ""
    @State private var amount = ""
    @State private var selectedType: TransactionType = .expense
    @State private var selectedDate = Date()
    @State private var selectedCategory: Category?
    @State private var categories: [Category] = []
    @State private var tags: [String] = []
    @State private var newTag = ""
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    // Form validation errors
    @State private var descriptionError = ""
    @State private var amountError = ""
    @State private var categoryError = ""
    
    init(transaction: Transaction, onSave: @escaping (Transaction) -> Void) {
        self.originalTransaction = transaction
        self.onSave = onSave
        
        // Pre-popola i valori
        self._description = State(initialValue: transaction.description)
        self._amount = State(initialValue: String(transaction.amount))
        self._selectedType = State(initialValue: transaction.type)
        self._tags = State(initialValue: transaction.tags)
        
        // Converti la data stringa in Date
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        if let date = formatter.date(from: transaction.date) {
            self._selectedDate = State(initialValue: date)
        } else {
            self._selectedDate = State(initialValue: Date())
        }
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: ThemeManager.Spacing.lg) {
                    // Type Selector
                    typeSelector
                    
                    // Description Field
                    descriptionField
                    
                    // Amount Field
                    amountField
                    
                    // Date Picker
                    datePickerField
                    
                    // Category Selector
                    categorySelector
                    
                    // Tags Section
                    tagsSection
                    
                    // Save Button
                    saveButton
                }
                .padding(ThemeManager.Spacing.md)
            }
            .navigationTitle("Modifica Transazione")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Annulla") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                Task {
                    await loadCategories()
                }
            }
            .alert("Errore", isPresented: $showError) {
                Button("OK") { }
            } message: {
                Text(errorMessage)
            }
        }
        .overlay {
            if isLoading {
                Color.black.opacity(0.3)
                    .ignoresSafeArea()
                    .overlay(
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle())
                            .scaleEffect(1.5)
                            .foregroundColor(.white)
                    )
            }
        }
    }
    
    // MARK: - Type Selector
    private var typeSelector: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            Text("Tipo")
                .font(ThemeManager.Typography.bodyMedium)
                .fontWeight(.medium)
                .foregroundColor(ThemeManager.Colors.text)
            
            HStack {
                ForEach(TransactionType.allCases, id: \.self) { type in
                    Button(action: {
                        selectedType = type
                    }) {
                        Text(type.displayName)
                            .font(ThemeManager.Typography.bodyMedium)
                            .foregroundColor(selectedType == type ? .white : ThemeManager.Colors.text)
                            .padding(.horizontal, ThemeManager.Spacing.md)
                            .padding(.vertical, ThemeManager.Spacing.sm)
                            .background(
                                selectedType == type ? ThemeManager.Colors.primary : ThemeManager.Colors.surface
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
    
    // MARK: - Description Field
    private var descriptionField: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            Text("Descrizione")
                .font(ThemeManager.Typography.bodyMedium)
                .fontWeight(.medium)
                .foregroundColor(ThemeManager.Colors.text)
            
            TextField("Inserisci la descrizione...", text: $description)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .onChange(of: description) { _ in
                    validateDescription()
                }
            
            if !descriptionError.isEmpty {
                Text(descriptionError)
                    .font(ThemeManager.Typography.caption)
                    .foregroundColor(ThemeManager.Colors.error)
            }
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.md)
    }
    
    // MARK: - Amount Field
    private var amountField: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            Text("Importo")
                .font(ThemeManager.Typography.bodyMedium)
                .fontWeight(.medium)
                .foregroundColor(ThemeManager.Colors.text)
            
            TextField("0,00", text: $amount)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .keyboardType(.decimalPad)
                .onChange(of: amount) { _ in
                    validateAmount()
                }
            
            if !amountError.isEmpty {
                Text(amountError)
                    .font(ThemeManager.Typography.caption)
                    .foregroundColor(ThemeManager.Colors.error)
            }
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.md)
    }
    
    // MARK: - Date Picker
    private var datePickerField: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            Text("Data")
                .font(ThemeManager.Typography.bodyMedium)
                .fontWeight(.medium)
                .foregroundColor(ThemeManager.Colors.text)
            
            DatePicker("", selection: $selectedDate, displayedComponents: .date)
                .datePickerStyle(GraphicalDatePickerStyle())
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.md)
    }
    
    // MARK: - Category Selector
    private var categorySelector: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            Text("Categoria")
                .font(ThemeManager.Typography.bodyMedium)
                .fontWeight(.medium)
                .foregroundColor(ThemeManager.Colors.text)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: ThemeManager.Spacing.sm) {
                    ForEach(categories) { category in
                        Button(action: {
                            selectedCategory = category
                            validateCategory()
                        }) {
                            VStack(spacing: ThemeManager.Spacing.xs) {
                                Circle()
                                    .fill(category.colorObject)
                                    .frame(width: 40, height: 40)
                                    .overlay(
                                        Image(systemName: category.icon ?? "questionmark.circle")
                                            .font(.system(size: 16, weight: .medium))
                                            .foregroundColor(.white)
                                    )
                                
                                Text(category.name)
                                    .font(ThemeManager.Typography.caption)
                                    .foregroundColor(ThemeManager.Colors.text)
                                    .lineLimit(1)
                            }
                            .padding(ThemeManager.Spacing.xs)
                            .background(
                                selectedCategory?.id == category.id ? ThemeManager.Colors.primary.opacity(0.1) : Color.clear
                            )
                            .cornerRadius(ThemeManager.CornerRadius.sm)
                        }
                    }
                }
                .padding(.horizontal, ThemeManager.Spacing.sm)
            }
            
            if !categoryError.isEmpty {
                Text(categoryError)
                    .font(ThemeManager.Typography.caption)
                    .foregroundColor(ThemeManager.Colors.error)
            }
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.md)
    }
    
    // MARK: - Tags Section
    private var tagsSection: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            Text("Tags")
                .font(ThemeManager.Typography.bodyMedium)
                .fontWeight(.medium)
                .foregroundColor(ThemeManager.Colors.text)
            
            // Existing tags
            if !tags.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: ThemeManager.Spacing.xs) {
                        ForEach(tags, id: \.self) { tag in
                            HStack(spacing: ThemeManager.Spacing.xs) {
                                Text(tag)
                                    .font(ThemeManager.Typography.caption)
                                    .foregroundColor(ThemeManager.Colors.text)
                                
                                Button(action: {
                                    tags.removeAll { $0 == tag }
                                }) {
                                    Image(systemName: "xmark.circle.fill")
                                        .font(.system(size: 14))
                                        .foregroundColor(ThemeManager.Colors.textSecondary)
                                }
                            }
                            .padding(.horizontal, ThemeManager.Spacing.sm)
                            .padding(.vertical, ThemeManager.Spacing.xs)
                            .background(ThemeManager.Colors.surface)
                            .cornerRadius(ThemeManager.CornerRadius.sm)
                        }
                    }
                    .padding(.horizontal, ThemeManager.Spacing.sm)
                }
            }
            
            // Add new tag
            HStack {
                TextField("Aggiungi tag...", text: $newTag)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                Button(action: {
                    if !newTag.isEmpty && !tags.contains(newTag) {
                        tags.append(newTag)
                        newTag = ""
                    }
                }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 20))
                        .foregroundColor(ThemeManager.Colors.primary)
                }
                .disabled(newTag.isEmpty)
            }
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.md)
    }
    
    // MARK: - Save Button
    private var saveButton: some View {
        Button(action: {
            Task {
                await updateTransaction()
            }
        }) {
            HStack {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                        .scaleEffect(0.8)
                        .foregroundColor(.white)
                } else {
                    Image(systemName: "checkmark")
                    Text("Salva Modifiche")
                }
            }
            .font(ThemeManager.Typography.bodyMedium)
            .fontWeight(.medium)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(ThemeManager.Spacing.md)
            .background(isFormValid ? ThemeManager.Colors.primary : ThemeManager.Colors.textSecondary)
            .cornerRadius(ThemeManager.CornerRadius.md)
        }
        .disabled(!isFormValid || isLoading)
    }
    
    // MARK: - Helper Methods
    private func loadCategories() async {
        do {
            let categoriesResponse = try await apiManager.getCategories()
            
            await MainActor.run {
                categories = categoriesResponse
                // Trova la categoria corrispondente
                if let matchingCategory = categoriesResponse.first(where: { $0.id == originalTransaction.category.id }) {
                    selectedCategory = matchingCategory
                }
            }
        } catch {
            await MainActor.run {
                errorMessage = "Errore nel caricamento delle categorie"
                showError = true
            }
        }
    }
    
    private func updateTransaction() async {
        guard validateForm() else { return }
        
        isLoading = true
        
        do {
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
            dateFormatter.timeZone = TimeZone(identifier: "UTC")
            
            let updateRequest = UpdateTransactionRequest(
                amount: parseAmount(),
                description: description.trimmingCharacters(in: .whitespacesAndNewlines),
                date: dateFormatter.string(from: selectedDate),
                type: selectedType,
                categoryId: selectedCategory?.id,
                tags: tags
            )
            
            let updatedTransaction = try await apiManager.updateTransaction(
                id: originalTransaction.id,
                transaction: updateRequest
            )
            
            await MainActor.run {
                onSave(updatedTransaction)
                dismiss()
            }
        } catch {
            await MainActor.run {
                errorMessage = "Errore nell'aggiornamento della transazione"
                showError = true
                isLoading = false
            }
        }
    }
    
    private func validateForm() -> Bool {
        validateDescription()
        validateAmount()
        validateCategory()
        
        return descriptionError.isEmpty && amountError.isEmpty && categoryError.isEmpty
    }
    
    private func validateDescription() {
        if description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            descriptionError = "La descrizione è obbligatoria"
        } else if description.count > 100 {
            descriptionError = "La descrizione non può superare i 100 caratteri"
        } else {
            descriptionError = ""
        }
    }
    
    private func validateAmount() {
        if amount.isEmpty {
            amountError = "L'importo è obbligatorio"
        } else if parseAmount() <= 0 {
            amountError = "L'importo deve essere maggiore di zero"
        } else {
            amountError = ""
        }
    }
    
    private func validateCategory() {
        if selectedCategory == nil {
            categoryError = "Seleziona una categoria"
        } else {
            categoryError = ""
        }
    }
    
    private func parseAmount() -> Double {
        // Supporta sia virgola che punto come separatore decimale
        let cleanAmount = amount.replacingOccurrences(of: ",", with: ".")
        return Double(cleanAmount) ?? 0.0
    }
    
    private var isFormValid: Bool {
        return !description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
               !amount.isEmpty &&
               parseAmount() > 0 &&
               selectedCategory != nil
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