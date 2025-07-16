import SwiftUI

struct CategorySpending: Identifiable {
    let id = UUID()
    let name: String
    let amount: Double
    let color: Color
}

struct SpendingByCategoryCard: View {
    let categories: [CategorySpending]
    
    var body: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            Text("Spending by Category")
                .font(ThemeManager.Typography.headline)
                .fontWeight(.semibold)
                .foregroundColor(ThemeManager.Colors.text)
            
            VStack(spacing: ThemeManager.Spacing.lg) {
                // Donut Chart
                PieChartView(categories: categories)
                    .frame(height: 200)
                
                // Category Legend
                categoryLegend
            }
        }
        .padding(ThemeManager.Spacing.lg)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.lg)
    }
    
    private var categoryLegend: some View {
        let columns = Array(repeating: GridItem(.flexible(), spacing: ThemeManager.Spacing.sm), count: 2)
        
        return LazyVGrid(columns: columns, spacing: ThemeManager.Spacing.sm) {
            ForEach(categories) { category in
                HStack(spacing: ThemeManager.Spacing.xs) {
                    Circle()
                        .fill(category.color)
                        .frame(width: 12, height: 12)
                    
                    Text(category.name)
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                    
                    Spacer()
                    
                    Text(formatCurrency(category.amount))
                        .font(ThemeManager.Typography.caption)
                        .fontWeight(.medium)
                        .foregroundColor(ThemeManager.Colors.text)
                }
            }
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

struct PieChartView: View {
    let categories: [CategorySpending]
    
    var body: some View {
        let total = categories.reduce(0) { $0 + $1.amount }
        
        return ZStack {
            // Background circle
            Circle()
                .fill(Color.gray.opacity(0.1))
            
            // Pie segments
            ForEach(Array(categories.enumerated()), id: \.element.id) { index, category in
                let percentage = total > 0 ? category.amount / total : 0
                let startAngle = getStartAngle(for: index)
                let endAngle = startAngle + (percentage * 360)
                
                Path { path in
                    let center = CGPoint(x: 100, y: 100)
                    path.move(to: center)
                    path.addArc(
                        center: center,
                        radius: 80,
                        startAngle: .degrees(startAngle),
                        endAngle: .degrees(endAngle),
                        clockwise: false
                    )
                }
                .fill(category.color)
            }
            
            // Inner circle (donut hole)
            Circle()
                .fill(ThemeManager.Colors.surface)
                .frame(width: 80, height: 80)
        }
        .frame(width: 200, height: 200)
    }
    
    private func getStartAngle(for index: Int) -> Double {
        let total = categories.reduce(0) { $0 + $1.amount }
        var angle: Double = -90 // Start from top
        
        for i in 0..<index {
            let percentage = total > 0 ? categories[i].amount / total : 0
            angle += percentage * 360
        }
        
        return angle
    }
}

struct SpendingByCategoryCard_Previews: PreviewProvider {
    static var previews: some View {
        SpendingByCategoryCard(
            categories: [
                CategorySpending(name: "Food", amount: 450.00, color: Color(red: 0.95, green: 0.45, blue: 0.45)),
                CategorySpending(name: "Transport", amount: 280.00, color: Color(red: 0.4, green: 0.6, blue: 0.95)),
                CategorySpending(name: "Shopping", amount: 320.00, color: Color(red: 0.95, green: 0.75, blue: 0.35)),
                CategorySpending(name: "Bills", amount: 180.00, color: Color(red: 0.4, green: 0.8, blue: 0.4)),
                CategorySpending(name: "Entertainment", amount: 122.50, color: Color(red: 0.95, green: 0.65, blue: 0.35))
            ]
        )
        .padding()
    }
}