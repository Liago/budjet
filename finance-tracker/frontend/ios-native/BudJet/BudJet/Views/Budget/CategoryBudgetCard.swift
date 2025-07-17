import SwiftUI

struct CategoryBudgetCard: View {
    let category: Category
    let spent: Double
    let period: String
    
    private var isClickable: Bool {
        return spent > 0
    }
    
    private var budget: Double {
        return category.budgetAmount
    }
    
    private var remaining: Double {
        return budget - spent
    }
    
    private var percentage: Double {
        guard budget > 0 else { return 0 }
        return (spent / budget) * 100
    }
    
    private var isOverBudget: Bool {
        return spent > budget
    }
    
    private var statusColor: Color {
        if percentage > 100 { return ThemeManager.Colors.error }
        if percentage > 90 { return Color.orange }
        if percentage > 75 { return Color.yellow }
        return ThemeManager.Colors.success
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            // Header con icona e nome
            HStack {
                // Icona categoria
                ZStack {
                    Circle()
                        .fill(category.colorObject)
                        .frame(width: 40, height: 40)
                    
                    Image(systemName: getCategoryIcon(category.icon))
                        .font(.system(size: 18))
                        .foregroundColor(.white)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(category.name)
                        .font(ThemeManager.Typography.bodyMedium)
                        .fontWeight(.semibold)
                        .foregroundColor(ThemeManager.Colors.text)
                        .lineLimit(1)
                    
                    Text(period)
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
                
                Spacer()
                
                // Trend indicator
                VStack {
                    Image(systemName: isOverBudget ? "arrow.up" : "arrow.down")
                        .font(.system(size: 14))
                        .foregroundColor(isOverBudget ? ThemeManager.Colors.error : ThemeManager.Colors.success)
                    
                    Text(formatCurrency(budget))
                        .font(ThemeManager.Typography.title3)
                        .fontWeight(.bold)
                        .foregroundColor(ThemeManager.Colors.text)
                }
            }
            
            // Statistiche
            VStack(spacing: ThemeManager.Spacing.sm) {
                // Budget vs Speso
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Budget")
                            .font(ThemeManager.Typography.caption)
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                        
                        Text(formatCurrency(budget))
                            .font(ThemeManager.Typography.bodyMedium)
                            .fontWeight(.semibold)
                            .foregroundColor(ThemeManager.Colors.primary)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Speso")
                            .font(ThemeManager.Typography.caption)
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                        
                        Text(formatCurrency(spent))
                            .font(ThemeManager.Typography.bodyMedium)
                            .fontWeight(.semibold)
                            .foregroundColor(isOverBudget ? ThemeManager.Colors.error : ThemeManager.Colors.success)
                    }
                }
                
                // Rimanente
                HStack {
                    Text("Rimanente")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Spacer()
                    
                    Text(formatCurrency(remaining))
                        .font(ThemeManager.Typography.bodyMedium)
                        .fontWeight(.semibold)
                        .foregroundColor(remaining < 0 ? ThemeManager.Colors.error : ThemeManager.Colors.success)
                }
            }
            
            // Progress bar con percentuale
            VStack(alignment: .leading, spacing: ThemeManager.Spacing.xs) {
                HStack {
                    Text("Utilizzato")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Spacer()
                    
                    Text("\(Int(percentage))%")
                        .font(ThemeManager.Typography.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(statusColor)
                }
                
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(ThemeManager.Colors.border.opacity(0.2))
                            .frame(height: 6)
                            .cornerRadius(3)
                        
                        Rectangle()
                            .fill(statusColor)
                            .frame(
                                width: max(0, min(geometry.size.width, geometry.size.width * CGFloat(min(percentage, 100) / 100))),
                                height: 6
                            )
                            .cornerRadius(3)
                    }
                }
                .frame(height: 6)
            }
            
            // Status message o hint per click
            HStack {
                if spent > 0 {
                    Image(systemName: getStatusIcon())
                        .font(.system(size: 12))
                        .foregroundColor(statusColor)
                    
                    Text(getStatusMessage())
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(statusColor)
                        .lineLimit(1)
                } else {
                    Image(systemName: "info.circle")
                        .font(.system(size: 12))
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Text("Nessuna spesa registrata")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                        .lineLimit(1)
                }
                
                Spacer()
            }
            
            // Hint per click
            if isClickable {
                HStack {
                    Spacer()
                    Text("Tocca per vedere le transazioni")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.primary)
                        .italic()
                    Spacer()
                }
                .padding(.top, ThemeManager.Spacing.xs)
            }
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.lg)
        .shadow(color: ThemeManager.Colors.border.opacity(0.1), radius: 2, x: 0, y: 1)
        .overlay(
            RoundedRectangle(cornerRadius: ThemeManager.CornerRadius.lg)
                .stroke(
                    isOverBudget ? ThemeManager.Colors.error.opacity(0.3) : statusColor.opacity(0.2),
                    lineWidth: 1
                )
        )
    }
    
    // MARK: - Helper Methods
    private func getCategoryIcon(_ iconName: String?) -> String {
        // Mappa le icone dal backend alle icone SF Symbols
        guard let iconName = iconName else { return "questionmark.circle" }
        
        switch iconName.lowercased() {
        case "shopping-cart", "cart":
            return "cart.fill"
        case "utensils", "food":
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
    
    private func getStatusIcon() -> String {
        if percentage > 100 { return "exclamationmark.triangle.fill" }
        if percentage > 90 { return "exclamationmark.circle.fill" }
        if percentage > 75 { return "info.circle.fill" }
        return "checkmark.circle.fill"
    }
    
    private func getStatusMessage() -> String {
        if percentage > 100 { return "Budget superato!" }
        if percentage > 90 { return "Attenzione al budget" }
        if percentage > 75 { return "Quasi al limite" }
        return "Budget sotto controllo"
    }
    
    private func formatCurrency(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "EUR"
        formatter.locale = Locale(identifier: "it_IT")
        return formatter.string(from: NSNumber(value: amount)) ?? "€0,00"
    }
}

struct CategoryBudgetCard_Previews: PreviewProvider {
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
        
        VStack(spacing: 16) {
            CategoryBudgetCard(
                category: sampleCategory,
                spent: 320.50,
                period: "Dicembre 2024"
            )
            
            CategoryBudgetCard(
                category: sampleCategory,
                spent: 520.80,
                period: "Dicembre 2024"
            )
        }
        .padding()
        .background(ThemeManager.Colors.background)
    }
}