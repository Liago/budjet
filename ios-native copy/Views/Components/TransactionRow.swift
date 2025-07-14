import SwiftUI

struct TransactionRow: View {
    let transaction: Transaction
    
    var body: some View {
        HStack {
            // Category Icon
            Circle()
                .fill(transaction.category.colorObject)
                .frame(width: 40, height: 40)
                .overlay(
                    Image(systemName: categoryIcon)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white)
                )
            
            // Transaction Details
            VStack(alignment: .leading, spacing: 2) {
                Text(transaction.description)
                    .font(ThemeManager.Typography.bodyMedium)
                    .foregroundColor(ThemeManager.Colors.text)
                    .lineLimit(1)
                
                HStack {
                    Text(transaction.category.name)
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Spacer()
                    
                    Text(transaction.formattedDate)
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
            }
            
            Spacer()
            
            // Amount
            Text(transaction.formattedAmount)
                .font(ThemeManager.Typography.bodyMedium)
                .fontWeight(.semibold)
                .foregroundColor(transactionColor)
        }
        .padding(.vertical, ThemeManager.Spacing.sm)
        .padding(.horizontal, ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.md)
    }
    
    private var transactionColor: Color {
        switch transaction.type {
        case .income:
            return ThemeManager.Colors.success
        case .expense:
            return ThemeManager.Colors.error
        }
    }
    
    private var categoryIcon: String {
        // Mappa delle icone in base al nome della categoria
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
}

struct TransactionRow_Previews: PreviewProvider {
    static var previews: some View {
        VStack {
            TransactionRow(transaction: Transaction(
                id: "1",
                amount: 50.0,
                description: "Spesa al supermercato",
                date: "2025-07-11",
                type: .expense,
                category: Category(
                    id: "1",
                    name: "Grocery",
                    icon: "cart",
                    color: "#FF5733",
                    isDefault: true,
                    budget: "600",
                    userId: "user1",
                    createdAt: "2025-07-11",
                    updatedAt: "2025-07-11",
                    _count: CategoryCount(transactions: 10)
                ),
                tags: [],
                createdAt: "2025-07-11",
                updatedAt: "2025-07-11"
            ))
            
            TransactionRow(transaction: Transaction(
                id: "2",
                amount: 2000.0,
                description: "Stipendio",
                date: "2025-07-01",
                type: .income,
                category: Category(
                    id: "2",
                    name: "Salary",
                    icon: "dollarsign",
                    color: "#33FF33",
                    isDefault: true,
                    budget: "0",
                    userId: "user1",
                    createdAt: "2025-07-01",
                    updatedAt: "2025-07-01",
                    _count: CategoryCount(transactions: 5)
                ),
                tags: [],
                createdAt: "2025-07-01",
                updatedAt: "2025-07-01"
            ))
        }
        .padding()
    }
} 