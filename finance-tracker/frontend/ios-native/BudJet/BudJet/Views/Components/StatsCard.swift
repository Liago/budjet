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

// MARK: - Budget Overview Card
struct BudgetOverviewCard: View {
    let totalBudget: Double
    let totalExpenses: Double
    let categories: [Category]
    let period: String
    
    private var budgetUsagePercentage: Double {
        guard totalBudget > 0 else { return 0 }
        return min(totalExpenses / totalBudget, 1.0)
    }
    
    private var remainingBudget: Double {
        return max(totalBudget - totalExpenses, 0)
    }
    
    private var budgetStatus: BudgetStatus {
        if totalBudget == 0 {
            return .noBudget
        } else if totalExpenses >= totalBudget {
            return .exceeded
        } else if budgetUsagePercentage >= 0.8 {
            return .warning
        } else {
            return .good
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.lg) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: ThemeManager.Spacing.xs) {
                    Text("Budget")
                        .font(ThemeManager.Typography.footnote)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Text(period)
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
                
                Spacer()
                
                Image(systemName: budgetStatus.icon)
                    .font(.title2)
                    .foregroundColor(budgetStatus.color)
            }
            
            // Budget Progress
            if totalBudget > 0 {
                VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                    // Progress Bar
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            Rectangle()
                                .fill(ThemeManager.Colors.border.opacity(0.2))
                                .frame(height: 8)
                                .cornerRadius(4)
                            
                            Rectangle()
                                .fill(budgetStatus.color)
                                .frame(
                                    width: max(0, min(geometry.size.width, geometry.size.width * CGFloat(budgetUsagePercentage))),
                                    height: 8
                                )
                                .cornerRadius(4)
                        }
                    }
                    .frame(height: 8)
                    
                    // Budget Details
                    HStack {
                        VStack(alignment: .leading, spacing: ThemeManager.Spacing.xs) {
                            Text("Speso")
                                .font(ThemeManager.Typography.caption)
                                .foregroundColor(ThemeManager.Colors.textSecondary)
                            
                            Text(formatCurrency(totalExpenses))
                                .font(ThemeManager.Typography.bodyMedium)
                                .fontWeight(.semibold)
                                .foregroundColor(ThemeManager.Colors.expense)
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: ThemeManager.Spacing.xs) {
                            Text("Rimanente")
                                .font(ThemeManager.Typography.caption)
                                .foregroundColor(ThemeManager.Colors.textSecondary)
                            
                            Text(formatCurrency(remainingBudget))
                                .font(ThemeManager.Typography.bodyMedium)
                                .fontWeight(.semibold)
                                .foregroundColor(budgetStatus == .exceeded ? ThemeManager.Colors.error : ThemeManager.Colors.success)
                        }
                    }
                    
                    // Budget Status Message
                    HStack {
                        Text(budgetStatus.message)
                            .font(ThemeManager.Typography.caption)
                            .foregroundColor(budgetStatus.color)
                        
                        Spacer()
                        
                        Text("\(Int(budgetUsagePercentage * 100))%")
                            .font(ThemeManager.Typography.caption)
                            .fontWeight(.medium)
                            .foregroundColor(budgetStatus.color)
                    }
                }
            } else {
                VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                    Text("Nessun budget impostato")
                        .font(ThemeManager.Typography.body)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Text("Imposta un budget per le tue categorie per tenere traccia delle tue spese")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                        .multilineTextAlignment(.leading)
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

// MARK: - Budget Status
enum BudgetStatus {
    case noBudget
    case good
    case warning
    case exceeded
    
    var color: Color {
        switch self {
        case .noBudget:
            return ThemeManager.Colors.textSecondary
        case .good:
            return ThemeManager.Colors.success
        case .warning:
            return Color.orange
        case .exceeded:
            return ThemeManager.Colors.error
        }
    }
    
    var icon: String {
        switch self {
        case .noBudget:
            return "questionmark.circle"
        case .good:
            return "checkmark.circle.fill"
        case .warning:
            return "exclamationmark.triangle.fill"
        case .exceeded:
            return "xmark.circle.fill"
        }
    }
    
    var message: String {
        switch self {
        case .noBudget:
            return "Imposta un budget"
        case .good:
            return "Budget sotto controllo"
        case .warning:
            return "Attenzione al budget"
        case .exceeded:
            return "Budget superato"
        }
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
            
            BudgetOverviewCard(
                totalBudget: 1500.00,
                totalExpenses: 1212.37,
                categories: [],
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