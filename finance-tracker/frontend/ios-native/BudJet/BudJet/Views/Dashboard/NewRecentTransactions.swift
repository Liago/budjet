import SwiftUI

struct NewRecentTransactions: View {
    let transactions: [Transaction]
    
    var body: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            HStack {
                Text("Recent Transactions")
                    .font(ThemeManager.Typography.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(ThemeManager.Colors.text)
                
                Spacer()
                
                Button("View All") {
                    // Navigate to all transactions
                }
                .font(ThemeManager.Typography.bodyMedium)
                .foregroundColor(Color(red: 0.95, green: 0.45, blue: 0.45))
            }
            
            VStack(spacing: ThemeManager.Spacing.sm) {
                ForEach(transactions) { transaction in
                    NewTransactionRow(transaction: transaction)
                }
            }
        }
        .padding(ThemeManager.Spacing.lg)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.lg)
    }
}

struct NewTransactionRow: View {
    let transaction: Transaction
    
    var body: some View {
        HStack(spacing: ThemeManager.Spacing.md) {
            // Category Icon
            ZStack {
                Circle()
                    .fill(categoryBackgroundColor)
                    .frame(width: 44, height: 44)
                
                Image(systemName: transaction.type == .income ? "arrow.up.right" : "arrow.down.right")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(transaction.type == .income ? Color(red: 0.4, green: 0.8, blue: 0.4) : Color(red: 0.95, green: 0.45, blue: 0.45))
            }
            
            // Transaction Details
            VStack(alignment: .leading, spacing: 2) {
                Text(transaction.description)
                    .font(ThemeManager.Typography.bodyMedium)
                    .fontWeight(.medium)
                    .foregroundColor(ThemeManager.Colors.text)
                
                HStack(spacing: ThemeManager.Spacing.xs) {
                    Text(transaction.category.name)
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Text("•")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Text(formatDate(transaction.date))
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
            }
            
            Spacer()
            
            // Amount
            Text(formatCurrency(transaction.amount, isIncome: transaction.type == .income))
                .font(ThemeManager.Typography.bodyMedium)
                .fontWeight(.semibold)
                .foregroundColor(transaction.type == .income ? Color(red: 0.4, green: 0.8, blue: 0.4) : Color(red: 0.95, green: 0.45, blue: 0.45))
        }
        .padding(.vertical, ThemeManager.Spacing.xs)
    }
    
    private var categoryBackgroundColor: Color {
        switch transaction.category.name.lowercased() {
        case "food":
            return Color(red: 0.95, green: 0.45, blue: 0.45).opacity(0.1)
        case "transport":
            return Color(red: 0.4, green: 0.6, blue: 0.95).opacity(0.1)
        case "shopping":
            return Color(red: 0.95, green: 0.75, blue: 0.35).opacity(0.1)
        case "income":
            return Color(red: 0.4, green: 0.8, blue: 0.4).opacity(0.1)
        default:
            return Color.gray.opacity(0.1)
        }
    }
    
    private func formatDate(_ dateString: String) -> String {
        let inputFormatter = DateFormatter()
        inputFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        inputFormatter.timeZone = TimeZone(identifier: "UTC")
        
        let outputFormatter = DateFormatter()
        outputFormatter.dateFormat = "yyyy-MM-dd"
        
        if let date = inputFormatter.date(from: dateString) {
            return outputFormatter.string(from: date)
        }
        
        return dateString
    }
    
    private func formatCurrency(_ amount: Double, isIncome: Bool) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        formatter.locale = Locale(identifier: "en_US")
        
        let prefix = isIncome ? "+" : "-"
        let formattedAmount = formatter.string(from: NSNumber(value: amount)) ?? "$0.00"
        
        return prefix + formattedAmount
    }
}

struct NewRecentTransactions_Previews: PreviewProvider {
    static var previews: some View {
        NewRecentTransactions(
            transactions: [
                // Sample transactions would go here
            ]
        )
        .padding()
    }
}