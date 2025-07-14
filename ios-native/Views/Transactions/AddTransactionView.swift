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
                    }
                    
                    // Amount Field
                    VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                        Text("Importo")
                            .font(ThemeManager.Typography.bodyMedium)
                            .foregroundColor(ThemeManager.Colors.text)
                        
                        TextField("0,00", text: $amount)
                            .textFieldStyle(CustomTextFieldStyle())
                            .keyboardType(.decimalPad)
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
                            }
                        }
                    }
                    .padding(.horizontal, ThemeManager.Spacing.xs)
                }
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
        !description.isEmpty &&
        !amount.isEmpty &&
        Double(amount) != nil &&
        selectedCategory != nil
    }
    
    private func addTag() {
        guard !newTag.isEmpty, !tags.contains(newTag) else { return }
        tags.append(newTag)
        newTag = ""
    }
    
    private func loadCategories() async {
        do {
            let categoriesResponse = try await apiManager.getCategories()
            await MainActor.run {
                categories = categoriesResponse
                // Select first category by default
                if let firstCategory = categories.first {
                    selectedCategory = firstCategory
                }
            }
        } catch {
            await MainActor.run {
                errorMessage = "Errore nel caricamento delle categorie"
                showError = true
            }
        }
    }
    
    private func saveTransaction() async {
        guard let category = selectedCategory,
              let amountValue = Double(amount) else {
            return
        }
        
        isLoading = true
        
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        
        let transaction = CreateTransactionRequest(
            amount: amountValue,
            description: description,
            date: formatter.string(from: selectedDate),
            type: selectedType,
            categoryId: category.id,
            tags: tags
        )
        
        do {
            _ = try await apiManager.createTransaction(transaction)
            await MainActor.run {
                dismiss()
            }
        } catch {
            await MainActor.run {
                errorMessage = "Errore nel salvare la transazione"
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