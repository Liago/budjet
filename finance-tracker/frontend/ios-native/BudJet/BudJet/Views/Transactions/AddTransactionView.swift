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
            ZStack {
                // Background gradient
                LinearGradient(
                    colors: [ThemeManager.Colors.background, ThemeManager.Colors.surface],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: ThemeManager.Spacing.lg) {
                        // Header section with icon
                        headerSection
                        
                        // Type Selector
                        modernTypeSelector
                        
                        // Main form in card
                        VStack(spacing: ThemeManager.Spacing.lg) {
                            // Description Field
                            modernTextField(
                                title: "Descrizione",
                                placeholder: "Descrizione della transazione",
                                text: $description,
                                error: descriptionError,
                                icon: "doc.text.fill"
                            ) {
                                if !descriptionError.isEmpty {
                                    descriptionError = ""
                                }
                            }
                            
                            // Amount Field
                            modernTextField(
                                title: "Importo (€)",
                                placeholder: "0,00",
                                text: $amount,
                                error: amountError,
                                icon: "eurosign.circle.fill",
                                keyboardType: .decimalPad
                            ) {
                                if !amountError.isEmpty {
                                    amountError = ""
                                }
                            }
                            
                            // Date Picker
                            modernDatePicker
                            
                            // Category Selector
                            modernCategorySelector
                            
                            // Tags
                            modernTagsSection
                        }
                        .padding(ThemeManager.Spacing.lg)
                        .background(ThemeManager.Colors.surface)
                        .cornerRadius(ThemeManager.CornerRadius.xl)
                        .shadow(color: ThemeManager.Colors.border.opacity(0.1), radius: 8, x: 0, y: 4)
                        
                        // Save Button
                        modernSaveButton
                    }
                    .padding(.horizontal, ThemeManager.Spacing.md)
                    .padding(.vertical, ThemeManager.Spacing.lg)
                }
            }
            .navigationTitle("Aggiungi Transazione")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Annulla") {
                        dismiss()
                    }
                    .foregroundColor(ThemeManager.Colors.textSecondary)
                    .fontWeight(.medium)
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
    
    // MARK: - Modern UI Components
    private var headerSection: some View {
        VStack(spacing: ThemeManager.Spacing.md) {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [ThemeManager.Colors.primary, ThemeManager.Colors.primary.opacity(0.7)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 60, height: 60)
                
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 30))
                    .foregroundColor(.white)
            }
            
            VStack(spacing: ThemeManager.Spacing.xs) {
                Text("Nuova Transazione")
                    .font(ThemeManager.Typography.title2)
                    .fontWeight(.bold)
                    .foregroundColor(ThemeManager.Colors.text)
                
                Text("Aggiungi una nuova entrata o spesa")
                    .font(ThemeManager.Typography.body)
                    .foregroundColor(ThemeManager.Colors.textSecondary)
            }
        }
        .padding(.top, ThemeManager.Spacing.md)
    }
    
    private var modernTypeSelector: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            Text("Tipo di Transazione")
                .font(ThemeManager.Typography.bodyMedium)
                .fontWeight(.semibold)
                .foregroundColor(ThemeManager.Colors.text)
            
            HStack(spacing: ThemeManager.Spacing.sm) {
                // Expense Button
                Button(action: {
                    selectedType = .expense
                    updateCategorySelection()
                }) {
                    HStack(spacing: ThemeManager.Spacing.sm) {
                        Image(systemName: "minus.circle.fill")
                            .font(.system(size: 20))
                            .foregroundColor(selectedType == .expense ? .white : ThemeManager.Colors.expense)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Spesa")
                                .font(ThemeManager.Typography.bodyMedium)
                                .fontWeight(.semibold)
                                .foregroundColor(selectedType == .expense ? .white : ThemeManager.Colors.text)
                            
                            Text("Denaro in uscita")
                                .font(ThemeManager.Typography.caption)
                                .foregroundColor(selectedType == .expense ? .white.opacity(0.8) : ThemeManager.Colors.textSecondary)
                        }
                        
                        Spacer()
                    }
                    .padding(ThemeManager.Spacing.md)
                    .background(
                        selectedType == .expense ? ThemeManager.Colors.expense : ThemeManager.Colors.surface
                    )
                    .cornerRadius(ThemeManager.CornerRadius.lg)
                    .overlay(
                        RoundedRectangle(cornerRadius: ThemeManager.CornerRadius.lg)
                            .stroke(
                                selectedType == .expense ? ThemeManager.Colors.expense : ThemeManager.Colors.border,
                                lineWidth: 1
                            )
                    )
                }
                
                // Income Button
                Button(action: {
                    selectedType = .income
                    updateCategorySelection()
                }) {
                    HStack(spacing: ThemeManager.Spacing.sm) {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 20))
                            .foregroundColor(selectedType == .income ? .white : ThemeManager.Colors.income)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Entrata")
                                .font(ThemeManager.Typography.bodyMedium)
                                .fontWeight(.semibold)
                                .foregroundColor(selectedType == .income ? .white : ThemeManager.Colors.text)
                            
                            Text("Denaro in entrata")
                                .font(ThemeManager.Typography.caption)
                                .foregroundColor(selectedType == .income ? .white.opacity(0.8) : ThemeManager.Colors.textSecondary)
                        }
                        
                        Spacer()
                    }
                    .padding(ThemeManager.Spacing.md)
                    .background(
                        selectedType == .income ? ThemeManager.Colors.income : ThemeManager.Colors.surface
                    )
                    .cornerRadius(ThemeManager.CornerRadius.lg)
                    .overlay(
                        RoundedRectangle(cornerRadius: ThemeManager.CornerRadius.lg)
                            .stroke(
                                selectedType == .income ? ThemeManager.Colors.income : ThemeManager.Colors.border,
                                lineWidth: 1
                            )
                    )
                }
            }
        }
    }
    
    private func modernTextField(
        title: String,
        placeholder: String,
        text: Binding<String>,
        error: String,
        icon: String,
        keyboardType: UIKeyboardType = .default,
        onChange: @escaping () -> Void = {}
    ) -> some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            Text(title)
                .font(ThemeManager.Typography.bodyMedium)
                .fontWeight(.semibold)
                .foregroundColor(ThemeManager.Colors.text)
            
            HStack(spacing: ThemeManager.Spacing.sm) {
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundColor(ThemeManager.Colors.primary)
                    .frame(width: 24)
                
                TextField(placeholder, text: text)
                    .font(ThemeManager.Typography.body)
                    .foregroundColor(ThemeManager.Colors.text)
                    .keyboardType(keyboardType)
                    .onChange(of: text.wrappedValue) { _ in
                        onChange()
                    }
            }
            .padding(ThemeManager.Spacing.md)
            .background(ThemeManager.Colors.background)
            .cornerRadius(ThemeManager.CornerRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: ThemeManager.CornerRadius.md)
                    .stroke(
                        error.isEmpty ? ThemeManager.Colors.border : ThemeManager.Colors.error,
                        lineWidth: 1
                    )
            )
            
            if !error.isEmpty {
                HStack(spacing: ThemeManager.Spacing.xs) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 12))
                        .foregroundColor(ThemeManager.Colors.error)
                    
                    Text(error)
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.error)
                }
            }
        }
    }
    
    private var modernDatePicker: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            Text("Data")
                .font(ThemeManager.Typography.bodyMedium)
                .fontWeight(.semibold)
                .foregroundColor(ThemeManager.Colors.text)
            
            HStack(spacing: ThemeManager.Spacing.sm) {
                Image(systemName: "calendar.circle.fill")
                    .font(.system(size: 18))
                    .foregroundColor(ThemeManager.Colors.primary)
                    .frame(width: 24)
                
                DatePicker("", selection: $selectedDate, displayedComponents: .date)
                    .datePickerStyle(CompactDatePickerStyle())
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(ThemeManager.Spacing.md)
            .background(ThemeManager.Colors.background)
            .cornerRadius(ThemeManager.CornerRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: ThemeManager.CornerRadius.md)
                    .stroke(ThemeManager.Colors.border, lineWidth: 1)
            )
        }
    }
    
    private var modernSaveButton: some View {
        Button(action: {
            Task {
                await saveTransaction()
            }
        }) {
            HStack(spacing: ThemeManager.Spacing.sm) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                } else {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.white)
                }
                
                Text(isLoading ? "Salvando..." : "Salva Transazione")
                    .font(ThemeManager.Typography.bodyMedium)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity)
            .padding(ThemeManager.Spacing.md)
            .background(
                LinearGradient(
                    colors: [ThemeManager.Colors.primary, ThemeManager.Colors.primary.opacity(0.8)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .cornerRadius(ThemeManager.CornerRadius.lg)
            .shadow(color: ThemeManager.Colors.primary.opacity(0.3), radius: 8, x: 0, y: 4)
        }
        .disabled(isLoading)
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
    
    private var modernCategorySelector: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            HStack(spacing: ThemeManager.Spacing.sm) {
                Image(systemName: "folder.circle.fill")
                    .font(.system(size: 18))
                    .foregroundColor(ThemeManager.Colors.primary)
                    .frame(width: 24)
                
                Text("Categoria")
                    .font(ThemeManager.Typography.bodyMedium)
                    .fontWeight(.semibold)
                    .foregroundColor(ThemeManager.Colors.text)
            }
            
            if categories.isEmpty {
                HStack(spacing: ThemeManager.Spacing.sm) {
                    ProgressView()
                        .scaleEffect(0.8)
                    
                    Text("Caricamento categorie...")
                        .font(ThemeManager.Typography.body)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
                .padding(.vertical, ThemeManager.Spacing.md)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: ThemeManager.Spacing.sm) {
                        ForEach(categories) { category in
                            ModernCategoryChip(
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
                HStack(spacing: ThemeManager.Spacing.xs) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 12))
                        .foregroundColor(ThemeManager.Colors.error)
                    
                    Text(categoryError)
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.error)
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
    
    private var modernTagsSection: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            HStack(spacing: ThemeManager.Spacing.sm) {
                Image(systemName: "tag.circle.fill")
                    .font(.system(size: 18))
                    .foregroundColor(ThemeManager.Colors.primary)
                    .frame(width: 24)
                
                Text("Tag")
                    .font(ThemeManager.Typography.bodyMedium)
                    .fontWeight(.semibold)
                    .foregroundColor(ThemeManager.Colors.text)
            }
            
            // Existing tags
            if !tags.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: ThemeManager.Spacing.sm) {
                        ForEach(tags, id: \.self) { tag in
                            HStack(spacing: ThemeManager.Spacing.xs) {
                                Text(tag)
                                    .font(ThemeManager.Typography.caption)
                                    .foregroundColor(ThemeManager.Colors.primary)
                                
                                Button(action: {
                                    withAnimation(.easeInOut(duration: 0.2)) {
                                        tags.removeAll { $0 == tag }
                                    }
                                }) {
                                    Image(systemName: "xmark.circle.fill")
                                        .font(.system(size: 16))
                                        .foregroundColor(ThemeManager.Colors.textSecondary)
                                }
                            }
                            .padding(.horizontal, ThemeManager.Spacing.sm)
                            .padding(.vertical, ThemeManager.Spacing.xs)
                            .background(ThemeManager.Colors.primary.opacity(0.1))
                            .cornerRadius(ThemeManager.CornerRadius.md)
                            .overlay(
                                RoundedRectangle(cornerRadius: ThemeManager.CornerRadius.md)
                                    .stroke(ThemeManager.Colors.primary.opacity(0.3), lineWidth: 1)
                            )
                        }
                    }
                    .padding(.horizontal, ThemeManager.Spacing.xs)
                }
            }
            
            // Add new tag
            HStack(spacing: ThemeManager.Spacing.sm) {
                TextField("Aggiungi tag", text: $newTag)
                    .font(ThemeManager.Typography.body)
                    .foregroundColor(ThemeManager.Colors.text)
                    .padding(.horizontal, ThemeManager.Spacing.sm)
                    .padding(.vertical, ThemeManager.Spacing.xs)
                    .background(ThemeManager.Colors.background)
                    .cornerRadius(ThemeManager.CornerRadius.md)
                    .overlay(
                        RoundedRectangle(cornerRadius: ThemeManager.CornerRadius.md)
                            .stroke(ThemeManager.Colors.border, lineWidth: 1)
                    )
                
                Button(action: {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        addTag()
                    }
                }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 24))
                        .foregroundColor(ThemeManager.Colors.primary)
                }
                .disabled(newTag.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
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
        // All categories are available for both income and expense
        // If no category is selected, select the first one
        if selectedCategory == nil {
            selectedCategory = categories.first
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
                
                // Select first category by default if none selected
                if selectedCategory == nil, let firstCategory = categoriesResponse.first {
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
                    case .invalidResponse:
                        errorMsg = "Risposta non valida dal server"
                    case .networkError:
                        errorMsg = "Errore di connessione"
                    case .serverError(let code):
                        errorMsg = "Errore del server (\(code))"
                    case .decodingError(let message):
                        errorMsg = "Errore nei dati: \(message)"
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
    
    // MARK: - Helper Functions
    private func getCategoryIcon(_ iconName: String?) -> String {
        guard let iconName = iconName else { return "questionmark.circle.fill" }
        
        switch iconName.lowercased() {
        case "shopping-cart", "cart", "shopping":
            return "cart.fill"
        case "utensils", "food", "restaurant":
            return "fork.knife"
        case "car", "transport", "vehicle":
            return "car.fill"
        case "home", "house", "rent":
            return "house.fill"
        case "gamepad", "entertainment", "game":
            return "gamecontroller.fill"
        case "medical", "health", "hospital":
            return "heart.fill"
        case "graduation-cap", "education", "school":
            return "graduationcap.fill"
        case "credit-card", "finance", "card":
            return "creditcard.fill"
        case "gift", "present":
            return "gift.fill"
        case "plane", "travel", "flight":
            return "airplane"
        case "coffee", "drink", "cafe":
            return "cup.and.saucer.fill"
        case "music", "sound", "audio":
            return "music.note"
        case "tools", "work", "repair":
            return "wrench.and.screwdriver.fill"
        case "pets", "animal", "pet":
            return "pawprint.fill"
        case "book", "reading", "library":
            return "book.fill"
        case "camera", "photo", "picture":
            return "camera.fill"
        case "phone", "mobile", "cell":
            return "phone.fill"
        case "laptop", "computer", "tech":
            return "laptopcomputer"
        case "lightbulb", "electricity", "power":
            return "lightbulb.fill"
        case "leaf", "environment", "nature":
            return "leaf.fill"
        case "fitness", "gym", "sport":
            return "figure.run"
        case "clothing", "shirt", "fashion":
            return "tshirt.fill"
        case "beauty", "cosmetics", "makeup":
            return "paintbrush.fill"
        case "fuel", "gas", "petrol":
            return "fuelpump.fill"
        case "subscription", "recurring", "monthly":
            return "repeat.circle.fill"
        case "insurance", "protection", "safety":
            return "shield.fill"
        case "investment", "stocks", "portfolio":
            return "chart.line.uptrend.xyaxis"
        case "savings", "money", "bank":
            return "banknote.fill"
        default:
            return "circle.fill"
        }
    }
}

struct ModernCategoryChip: View {
    let category: Category
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: ThemeManager.Spacing.sm) {
                ZStack {
                    Circle()
                        .fill(category.colorObject)
                        .frame(width: 50, height: 50)
                        .shadow(color: category.colorObject.opacity(0.3), radius: 4, x: 0, y: 2)
                    
                    Image(systemName: getCategoryIcon(category.icon))
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(.white)
                }
                
                Text(category.name)
                    .font(ThemeManager.Typography.caption)
                    .fontWeight(.medium)
                    .foregroundColor(isSelected ? ThemeManager.Colors.primary : ThemeManager.Colors.text)
                    .lineLimit(1)
            }
            .padding(.vertical, ThemeManager.Spacing.sm)
            .padding(.horizontal, ThemeManager.Spacing.sm)
            .background(
                isSelected ? ThemeManager.Colors.primary.opacity(0.1) : ThemeManager.Colors.background
            )
            .cornerRadius(ThemeManager.CornerRadius.lg)
            .overlay(
                RoundedRectangle(cornerRadius: ThemeManager.CornerRadius.lg)
                    .stroke(
                        isSelected ? ThemeManager.Colors.primary : ThemeManager.Colors.border,
                        lineWidth: isSelected ? 2 : 1
                    )
            )
            .scaleEffect(isSelected ? 1.05 : 1.0)
            .animation(.easeInOut(duration: 0.2), value: isSelected)
        }
    }
    
    private func getCategoryIcon(_ iconName: String?) -> String {
        guard let iconName = iconName else { return "questionmark.circle.fill" }
        
        switch iconName.lowercased() {
        case "shopping-cart", "cart", "shopping":
            return "cart.fill"
        case "utensils", "food", "restaurant":
            return "fork.knife"
        case "car", "transport", "vehicle":
            return "car.fill"
        case "home", "house", "rent":
            return "house.fill"
        case "gamepad", "entertainment", "game":
            return "gamecontroller.fill"
        case "medical", "health", "hospital":
            return "heart.fill"
        case "graduation-cap", "education", "school":
            return "graduationcap.fill"
        case "credit-card", "finance", "card":
            return "creditcard.fill"
        case "gift", "present":
            return "gift.fill"
        case "plane", "travel", "flight":
            return "airplane"
        case "coffee", "drink", "cafe":
            return "cup.and.saucer.fill"
        case "music", "sound", "audio":
            return "music.note"
        case "tools", "work", "repair":
            return "wrench.and.screwdriver.fill"
        case "pets", "animal", "pet":
            return "pawprint.fill"
        case "book", "reading", "library":
            return "book.fill"
        case "camera", "photo", "picture":
            return "camera.fill"
        case "phone", "mobile", "cell":
            return "phone.fill"
        case "laptop", "computer", "tech":
            return "laptopcomputer"
        case "lightbulb", "electricity", "power":
            return "lightbulb.fill"
        case "leaf", "environment", "nature":
            return "leaf.fill"
        case "fitness", "gym", "sport":
            return "figure.run"
        case "clothing", "shirt", "fashion":
            return "tshirt.fill"
        case "beauty", "cosmetics", "makeup":
            return "paintbrush.fill"
        case "fuel", "gas", "petrol":
            return "fuelpump.fill"
        case "subscription", "recurring", "monthly":
            return "repeat.circle.fill"
        case "insurance", "protection", "safety":
            return "shield.fill"
        case "investment", "stocks", "portfolio":
            return "chart.line.uptrend.xyaxis"
        case "savings", "money", "bank":
            return "banknote.fill"
        default:
            return "circle.fill"
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
                        Image(systemName: getCategoryIcon(category.icon))
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
    
    private func getCategoryIcon(_ iconName: String?) -> String {
        guard let iconName = iconName else { return "questionmark.circle.fill" }
        
        switch iconName.lowercased() {
        case "shopping-cart", "cart", "shopping":
            return "cart.fill"
        case "utensils", "food", "restaurant":
            return "fork.knife"
        case "car", "transport", "vehicle":
            return "car.fill"
        case "home", "house", "rent":
            return "house.fill"
        case "gamepad", "entertainment", "game":
            return "gamecontroller.fill"
        case "medical", "health", "hospital":
            return "heart.fill"
        case "graduation-cap", "education", "school":
            return "graduationcap.fill"
        case "credit-card", "finance", "card":
            return "creditcard.fill"
        case "gift", "present":
            return "gift.fill"
        case "plane", "travel", "flight":
            return "airplane"
        case "coffee", "drink", "cafe":
            return "cup.and.saucer.fill"
        case "music", "sound", "audio":
            return "music.note"
        case "tools", "work", "repair":
            return "wrench.and.screwdriver.fill"
        case "pets", "animal", "pet":
            return "pawprint.fill"
        case "book", "reading", "library":
            return "book.fill"
        case "camera", "photo", "picture":
            return "camera.fill"
        case "phone", "mobile", "cell":
            return "phone.fill"
        case "laptop", "computer", "tech":
            return "laptopcomputer"
        case "lightbulb", "electricity", "power":
            return "lightbulb.fill"
        case "leaf", "environment", "nature":
            return "leaf.fill"
        case "fitness", "gym", "sport":
            return "figure.run"
        case "clothing", "shirt", "fashion":
            return "tshirt.fill"
        case "beauty", "cosmetics", "makeup":
            return "paintbrush.fill"
        case "fuel", "gas", "petrol":
            return "fuelpump.fill"
        case "subscription", "recurring", "monthly":
            return "repeat.circle.fill"
        case "insurance", "protection", "safety":
            return "shield.fill"
        case "investment", "stocks", "portfolio":
            return "chart.line.uptrend.xyaxis"
        case "savings", "money", "bank":
            return "banknote.fill"
        default:
            return "circle.fill"
        }
    }
}

struct AddTransactionView_Previews: PreviewProvider {
    static var previews: some View {
        AddTransactionView()
            .environmentObject(APIManager())
    }
} 