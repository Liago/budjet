import SwiftUI

struct StatsCard: View {
    let title: String
    let value: String
    let color: Color
    let icon: String
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                Text(title)
                    .font(ThemeManager.Typography.footnote)
                    .foregroundColor(ThemeManager.Colors.textSecondary)
                
                Text(value)
                    .font(ThemeManager.Typography.title2)
                    .fontWeight(.bold)
                    .foregroundColor(color)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            
            Spacer()
            
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.md)
        .shadow(color: ThemeManager.Colors.border.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

// MARK: - Enhanced Balance Card
struct BalanceCard: View {
    let balance: Double
    let totalIncome: Double
    let totalExpenses: Double
    let period: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.lg) {
            // Balance Label
            Text("Bilancio del periodo")
                .font(ThemeManager.Typography.footnote)
                .foregroundColor(ThemeManager.Colors.textSecondary)
            
            // Balance Amount
            Text(formatCurrency(balance))
                .font(.system(size: 32, weight: .bold, design: .default))
                .foregroundColor(balance >= 0 ? ThemeManager.Colors.success : ThemeManager.Colors.error)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
            
            // Income and Expense Row
            HStack(spacing: 0) {
                // Income Section
                VStack(alignment: .leading, spacing: ThemeManager.Spacing.xs) {
                    HStack(spacing: ThemeManager.Spacing.xs) {
                        Image(systemName: "arrow.down.circle.fill")
                            .font(.system(size: 16))
                            .foregroundColor(ThemeManager.Colors.income)
                        
                        Text("Entrate")
                            .font(ThemeManager.Typography.footnote)
                            .foregroundColor(ThemeManager.Colors.text)
                    }
                    
                    Text(formatCurrency(totalIncome))
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(ThemeManager.Colors.income)
                }
                
                Spacer()
                
                // Expense Section
                VStack(alignment: .trailing, spacing: ThemeManager.Spacing.xs) {
                    HStack(spacing: ThemeManager.Spacing.xs) {
                        Text("Uscite")
                            .font(ThemeManager.Typography.footnote)
                            .foregroundColor(ThemeManager.Colors.text)
                        
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.system(size: 16))
                            .foregroundColor(ThemeManager.Colors.expense)
                    }
                    
                    Text(formatCurrency(totalExpenses))
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(ThemeManager.Colors.expense)
                }
            }
        }
        .padding(ThemeManager.Spacing.lg)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.lg)
        .shadow(color: ThemeManager.Colors.border.opacity(0.1), radius: 4, x: 0, y: 2)
    }
    
    private func formatCurrency(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "EUR"
        formatter.locale = Locale(identifier: "it_IT")
        return formatter.string(from: NSNumber(value: amount)) ?? "€0,00"
    }
}

struct StatsCard_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: ThemeManager.Spacing.md) {
            BalanceCard(
                balance: 1287.63,
                totalIncome: 2500.00,
                totalExpenses: 1212.37,
                period: "Marzo 2024"
            )
            
            StatsCard(
                title: "Bilancio",
                value: "€1.287,63",
                color: ThemeManager.Colors.success,
                icon: "arrow.up.circle.fill"
            )
            
            StatsCard(
                title: "Uscite",
                value: "€1.204,65",
                color: ThemeManager.Colors.error,
                icon: "arrow.down.circle.fill"
            )
        }
        .padding()
        .background(ThemeManager.Colors.background)
    }
} 