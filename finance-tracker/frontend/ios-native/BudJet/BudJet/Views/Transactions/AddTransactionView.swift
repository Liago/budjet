import SwiftUI

struct AddTransactionView: View {
    @EnvironmentObject var apiManager: APIManager
    @Environment(\.dismiss) private var dismiss
    
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
    @State private var showSuccess = false
    @State private var successMessage = ""
    
    // Form validation errors
    @State private var descriptionError = ""
    @State private var amountError = ""
    @State private var categoryError = ""
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: ThemeManager.Spacing.lg) {
                    // Type Selector
                    typeSelector
                    
                    // Description Field
                    VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                        Text("Descrizione")
                            .font(ThemeManager.Typography.bodyMedium)
                            .foregroundColor(ThemeManager.Colors.text)
                        
                        TextField("Descrizione della transazione", text: $description)
                            .textFieldStyle(CustomTextFieldStyle())
                            .onChange(of: description) { _ in
                                if !descriptionError.isEmpty {
                                    descriptionError = ""
                                }
                            }
                        
                        if !descriptionError.isEmpty {
                            Text(descriptionError)
                                .font(ThemeManager.Typography.caption)
                                .foregroundColor(ThemeManager.Colors.error)
                        }
                    }
                    
                    // Amount Field
                    VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                        Text("Importo (€)")
                            .font(ThemeManager.Typography.bodyMedium)
                            .foregroundColor(ThemeManager.Colors.text)
                        
                        TextField("0,00", text: $amount)
                            .textFieldStyle(CustomTextFieldStyle())
                            .keyboardType(.decimalPad)
                            .onChange(of: amount) { _ in
                                if !amountError.isEmpty {
                                    amountError = ""
                                }
                            }
                        
                        if !amountError.isEmpty {
                            Text(amountError)
                                .font(ThemeManager.Typography.caption)
                                .foregroundColor(ThemeManager.Colors.error)
                        }
                    }
                    
                    // Date Picker
                    VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                        Text("Data")
                            .font(ThemeManager.Typography.bodyMedium)
                            .foregroundColor(ThemeManager.Colors.text)
                        
                        DatePicker("", selection: $selectedDate, displayedComponents: .date)
                            .datePickerStyle(CompactDatePickerStyle())
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    
                    // Category Selector
                    categorySelector
                    
                    // Tags
                    tagsSection
                }
                .padding(.horizontal, ThemeManager.Spacing.md)
                .padding(.vertical, ThemeManager.Spacing.lg)
            }
            .navigationTitle("Aggiungi Transazione")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Annulla") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Salva") {
                        Task {
                            await saveTransaction()
                        }
                    }
                    .disabled(!isFormValid || isLoading)
                    .foregroundColor(isFormValid && !isLoading ? ThemeManager.Colors.primary : ThemeManager.Colors.textSecondary)
                    .fontWeight(.semibold)
                }
            }
            .onAppear {
                Task {
                    await loadCategories()
                }
            }
            .alert("Errore", isPresented: $showError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage)
            }
            .alert("Successo", isPresented: $showSuccess) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(successMessage)
            }
            .overlay(
                // Loading overlay
                Group {
                    if isLoading {
                        Rectangle()
                            .fill(Color.black.opacity(0.3))
                            .edgesIgnoringSafeArea(.all)
                        
                        VStack {
                            ProgressView()
                                .scaleEffect(1.2)
                                .progressViewStyle(CircularProgressViewStyle(tint: ThemeManager.Colors.primary))
                            
                            Text("Salvando transazione...")
                                .font(ThemeManager.Typography.body)
                                .foregroundColor(ThemeManager.Colors.text)
                                .padding(.top, ThemeManager.Spacing.sm)
                        }
                        .padding(ThemeManager.Spacing.lg)
                        .background(ThemeManager.Colors.surface)
                        .cornerRadius(ThemeManager.CornerRadius.lg)
                    }
                }
            )
        }
    }
    
    private var typeSelector: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            Text("Tipo")
                .font(ThemeManager.Typography.bodyMedium)
                .foregroundColor(ThemeManager.Colors.text)
            
            HStack {
                Button(action: {
                    selectedType = .expense
                    updateCategorySelection()
                }) {
                    Text("Spesa")
                        .font(ThemeManager.Typography.bodyMedium)
                        .foregroundColor(selectedType == .expense ? .white : ThemeManager.Colors.text)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, ThemeManager.Spacing.md)
                        .background(
                            selectedType == .expense ? ThemeManager.Colors.expense : ThemeManager.Colors.surface
                        )
                        .cornerRadius(ThemeManager.CornerRadius.md)
                }
                
                Button(action: {
                    selectedType = .income
                    updateCategorySelection()
                }) {
                    Text("Entrata")
                        .font(ThemeManager.Typography.bodyMedium)
                        .foregroundColor(selectedType == .income ? .white : ThemeManager.Colors.text)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, ThemeManager.Spacing.md)
                        .background(
                            selectedType == .income ? ThemeManager.Colors.income : ThemeManager.Colors.surface
                        )
                        .cornerRadius(ThemeManager.CornerRadius.md)
                }
            }
        }
    }
    
    private var categorySelector: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            Text("Categoria")
                .font(ThemeManager.Typography.bodyMedium)
                .foregroundColor(ThemeManager.Colors.text)
            
            if categories.isEmpty {
                Text("Caricamento categorie...")
                    .font(ThemeManager.Typography.body)
                    .foregroundColor(ThemeManager.Colors.textSecondary)
                    .padding(.vertical, ThemeManager.Spacing.md)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: ThemeManager.Spacing.sm) {
                        ForEach(categories) { category in
                            CategoryChip(
                                category: category,
                                isSelected: selectedCategory?.id == category.id
                            ) {
                                selectedCategory = category
                                if !categoryError.isEmpty {
                                    categoryError = ""
                                }
                            }
                        }
                    }
                    .padding(.horizontal, ThemeManager.Spacing.xs)
                }
            }
            
            if !categoryError.isEmpty {
                Text(categoryError)
                    .font(ThemeManager.Typography.caption)
                    .foregroundColor(ThemeManager.Colors.error)
            }
        }
    }
    
    private var tagsSection: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            Text("Tag")
                .font(ThemeManager.Typography.bodyMedium)
                .foregroundColor(ThemeManager.Colors.text)
            
            // Existing tags
            if !tags.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: ThemeManager.Spacing.sm) {
                        ForEach(tags, id: \.self) { tag in
                            HStack(spacing: ThemeManager.Spacing.xs) {
                                Text(tag)
                                    .font(ThemeManager.Typography.caption)
                                    .foregroundColor(ThemeManager.Colors.text)
                                
                                Button(action: {
                                    tags.removeAll { $0 == tag }
                                }) {
                                    Image(systemName: "xmark.circle.fill")
                                        .font(.caption)
                                        .foregroundColor(ThemeManager.Colors.textSecondary)
                                }
                            }
                            .padding(.horizontal, ThemeManager.Spacing.sm)
                            .padding(.vertical, ThemeManager.Spacing.xs)
                            .background(ThemeManager.Colors.surface)
                            .cornerRadius(ThemeManager.CornerRadius.sm)
                        }
                    }
                    .padding(.horizontal, ThemeManager.Spacing.xs)
                }
            }
            
            // Add new tag
            HStack {
                TextField("Aggiungi tag", text: $newTag)
                    .textFieldStyle(CustomTextFieldStyle())
                
                Button(action: addTag) {
                    Text("Aggiungi")
                        .font(ThemeManager.Typography.footnote)
                        .foregroundColor(ThemeManager.Colors.primary)
                }
                .disabled(newTag.isEmpty)
            }
        }
    }
    
    private var isFormValid: Bool {
        validateForm(showErrors: false)
    }
    
    private func validateForm(showErrors: Bool = true) -> Bool {
        var isValid = true
        
        // Validate description
        if description.isEmpty {
            if showErrors {
                descriptionError = "La descrizione è obbligatoria"
            }
            isValid = false
        } else if description.count < 3 {
            if showErrors {
                descriptionError = "La descrizione deve essere almeno 3 caratteri"
            }
            isValid = false
        }
        
        // Validate amount
        if amount.isEmpty {
            if showErrors {
                amountError = "L'importo è obbligatorio"
            }
            isValid = false
        } else {
            // Handle both comma and dot as decimal separator
            let normalizedAmount = amount.replacingOccurrences(of: ",", with: ".")
            if let amountValue = Double(normalizedAmount) {
                if amountValue <= 0 {
                    if showErrors {
                        amountError = "L'importo deve essere maggiore di zero"
                    }
                    isValid = false
                } else if amountValue > 999999.99 {
                    if showErrors {
                        amountError = "L'importo è troppo grande"
                    }
                    isValid = false
                }
            } else {
                if showErrors {
                    amountError = "L'importo deve essere un numero valido"
                }
                isValid = false
            }
        }
        
        // Validate category
        if selectedCategory == nil {
            if showErrors {
                categoryError = "La categoria è obbligatoria"
            }
            isValid = false
        }
        
        return isValid
    }
    
    private func updateCategorySelection() {
        // Filter categories by current transaction type
        let filteredCategories = categories.filter { category in
            // If category doesn't have a type specified, show for both
            if category.type == nil {
                return true
            }
            return category.type == selectedType.rawValue
        }
        
        // If current selection doesn't match new type, select first appropriate category
        if let current = selectedCategory,
           let currentType = current.type,
           currentType != selectedType.rawValue {
            selectedCategory = filteredCategories.first ?? categories.first
        } else if selectedCategory == nil {
            selectedCategory = filteredCategories.first ?? categories.first
        }
    }
    
    private func addTag() {
        guard !newTag.isEmpty, !tags.contains(newTag) else { return }
        tags.append(newTag)
        newTag = ""
    }
    
    private func loadCategories() async {
        do {
            print("📱 [DEBUG] Loading categories...")
            let categoriesResponse = try await apiManager.getCategories()
            print("📱 [DEBUG] Loaded \(categoriesResponse.count) categories")
            
            await MainActor.run {
                categories = categoriesResponse
                
                // Filter categories by current transaction type for better UX
                let filteredCategories = categoriesResponse.filter { category in
                    // If category doesn't have a type specified, show for both
                    if category.type == nil {
                        return true
                    }
                    return category.type == selectedType.rawValue
                }
                
                // Select first appropriate category by default
                if selectedCategory == nil, let firstCategory = filteredCategories.first ?? categoriesResponse.first {
                    selectedCategory = firstCategory
                }
            }
        } catch {
            print("❌ [ERROR] Error loading categories: \(error)")
            await MainActor.run {
                errorMessage = "Errore nel caricamento delle categorie. Riprova più tardi."
                showError = true
            }
        }
    }
    
    private func saveTransaction() async {
        // Validate form first
        guard validateForm(showErrors: true) else {
            return
        }
        
        guard let category = selectedCategory else {
            await MainActor.run {
                categoryError = "La categoria è obbligatoria"
            }
            return
        }
        
        // Parse amount with proper decimal handling
        let normalizedAmount = amount.replacingOccurrences(of: ",", with: ".")
        guard let amountValue = Double(normalizedAmount) else {
            await MainActor.run {
                amountError = "L'importo deve essere un numero valido"
            }
            return
        }
        
        isLoading = true
        
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        
        let transaction = CreateTransactionRequest(
            amount: amountValue,
            description: description.trimmingCharacters(in: .whitespacesAndNewlines),
            date: formatter.string(from: selectedDate),
            type: selectedType,
            categoryId: category.id,
            tags: tags
        )
        
        do {
            print("📱 [DEBUG] Saving transaction: \(transaction)")
            _ = try await apiManager.createTransaction(transaction)
            
            await MainActor.run {
                successMessage = "Transazione salvata con successo"
                showSuccess = true
                isLoading = false
                
                // Dismiss after a short delay to show success message
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                    dismiss()
                }
            }
        } catch {
            print("❌ [ERROR] Error saving transaction: \(error)")
            
            await MainActor.run {
                let errorMsg: String
                if let apiError = error as? APIError {
                    switch apiError {
                    case .invalidCredentials:
                        errorMsg = "Credenziali non valide"
                    case .networkError:
                        errorMsg = "Errore di connessione"
                    case .serverError:
                        errorMsg = "Errore del server"
                    case .decodingError:
                        errorMsg = "Errore nei dati"
                    }
                } else {
                    errorMsg = "Errore nel salvare la transazione"
                }
                
                errorMessage = errorMsg
                showError = true
                isLoading = false
            }
        }
    }
}

struct CategoryChip: View {
    let category: Category
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: ThemeManager.Spacing.xs) {
                Circle()
                    .fill(category.colorObject)
                    .frame(width: 40, height: 40)
                    .overlay(
                        Image(systemName: "questionmark.circle.fill")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.white)
                    )
                
                Text(category.name)
                    .font(ThemeManager.Typography.caption)
                    .foregroundColor(ThemeManager.Colors.text)
                    .lineLimit(1)
            }
            .padding(.vertical, ThemeManager.Spacing.sm)
            .padding(.horizontal, ThemeManager.Spacing.xs)
            .background(
                isSelected ? ThemeManager.Colors.primary.opacity(0.1) : Color.clear
            )
            .cornerRadius(ThemeManager.CornerRadius.sm)
            .overlay(
                RoundedRectangle(cornerRadius: ThemeManager.CornerRadius.sm)
                    .stroke(
                        isSelected ? ThemeManager.Colors.primary : Color.clear,
                        lineWidth: 2
                    )
            )
        }
    }
}

struct AddTransactionView_Previews: PreviewProvider {
    static var previews: some View {
        AddTransactionView()
            .environmentObject(APIManager())
    }
} 