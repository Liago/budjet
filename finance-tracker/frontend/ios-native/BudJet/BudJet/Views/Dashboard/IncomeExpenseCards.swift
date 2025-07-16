import SwiftUI

struct IncomeExpenseCards: View {
    let income: Double
    let expenses: Double
    
    var body: some View {
        HStack(spacing: ThemeManager.Spacing.md) {
            // Income Card
            VStack(spacing: ThemeManager.Spacing.sm) {
                HStack {
                    Image(systemName: "arrow.up.right")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(Color(red: 0.4, green: 0.8, blue: 0.4)) // Green
                    
                    Text("Income")
                        .font(ThemeManager.Typography.bodyMedium)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Spacer()
                }
                
                HStack {
                    Text(formatCurrency(income))
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundColor(ThemeManager.Colors.text)
                    
                    Spacer()
                }
            }
            .padding(ThemeManager.Spacing.md)
            .background(ThemeManager.Colors.surface)
            .cornerRadius(ThemeManager.CornerRadius.md)
            
            // Expenses Card
            VStack(spacing: ThemeManager.Spacing.sm) {
                HStack {
                    Image(systemName: "arrow.down.right")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(Color(red: 0.95, green: 0.45, blue: 0.45)) // Red
                    
                    Text("Expenses")
                        .font(ThemeManager.Typography.bodyMedium)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Spacer()
                }
                
                HStack {
                    Text(formatCurrency(expenses))
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundColor(ThemeManager.Colors.text)
                    
                    Spacer()
                }
            }
            .padding(ThemeManager.Spacing.md)
            .background(ThemeManager.Colors.surface)
            .cornerRadius(ThemeManager.CornerRadius.md)
        }
    }
    
    private func formatCurrency(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        formatter.locale = Locale(identifier: "en_US")
        return formatter.string(from: NSNumber(value: amount)) ?? "$0.00"
    }
}

struct IncomeExpenseCards_Previews: PreviewProvider {
    static var previews: some View {
        IncomeExpenseCards(
            income: 4200.00,
            expenses: 1352.50
        )
        .padding()
    }
}