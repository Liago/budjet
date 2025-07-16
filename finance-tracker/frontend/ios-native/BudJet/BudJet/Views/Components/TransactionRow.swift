import SwiftUI

struct TransactionRow: View {
    let transaction: Transaction
    
    var body: some View {
        HStack(spacing: 12) {
            // Category Icon
            Circle()
                .fill(transaction.category.colorObject)
                .frame(width: 44, height: 44)
                .overlay(
                    Image(systemName: categoryIcon)
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.white)
                )
            
            // Transaction Details
            VStack(alignment: .leading, spacing: 4) {
                Text(transaction.description)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.primary)
                    .lineLimit(1)
                
                HStack(spacing: 4) {
                    Image(systemName: "tag.fill")
                        .font(.system(size: 12))
                        .foregroundColor(.secondary)
                    
                    Text(transaction.category.name)
                        .font(.system(size: 14))
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    Text(transaction.type == .income ? "income" : "expense")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(4)
                }
            }
            
            Spacer()
            
            // Amount
            VStack(alignment: .trailing, spacing: 2) {
                Text(transaction.formattedAmount)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(transactionColor)
                
                Button(action: {}) {
                    Image(systemName: "ellipsis")
                        .font(.system(size: 14))
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 16)
        .background(Color.clear)
    }
    
    private var transactionColor: Color {
        switch transaction.type {
        case .income:
            return Color.green
        case .expense:
            return Color.red
        }
    }
    
    private var categoryIcon: String {
        // Mappa delle icone in base al nome della categoria
        switch transaction.category.name.lowercased() {
        case "grocery", "alimentari", "food":
            return "cart.fill"
        case "restaurant":
            return "fork.knife"
        case "car", "trasporti", "transport":
            return "car.fill"
        case "home", "casa":
            return "house.fill"
        case "health", "salute":
            return "heart.fill"
        case "technology":
            return "laptopcomputer"
        case "shopping":
            return "bag.fill"
        case "salary", "stipendio", "income":
            return "banknote.fill"
        case "utilities":
            return "lightbulb.fill"
        case "pets":
            return "pawprint.fill"
        case "taxes":
            return "doc.text.fill"
        case "bar", "coffee shop":
            return "cup.and.saucer.fill"
        case "special":
            return "star.fill"
        case "gas station":
            return "fuelpump.fill"
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