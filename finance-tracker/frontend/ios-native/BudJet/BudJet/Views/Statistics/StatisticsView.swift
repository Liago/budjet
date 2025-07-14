import SwiftUI

struct StatisticsView: View {
    @State private var selectedPeriod: DateFilterPeriod = .current
    @State private var showingExpenses = true
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: ThemeManager.Spacing.lg) {
                    // Period Filter
                    periodFilterView
                    
                    // Type Toggle
                    typeToggleView
                    
                    // Placeholder for charts
                    chartPlaceholderView
                    
                    // Category breakdown
                    categoryBreakdownView
                }
                .padding(.horizontal, ThemeManager.Spacing.md)
            }
            .navigationTitle("Statistiche")
            .navigationBarTitleDisplayMode(.large)
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
    
    private var periodFilterView: some View {
        HStack {
            ForEach(DateFilterPeriod.allCases, id: \.self) { period in
                Button(action: {
                    selectedPeriod = period
                }) {
                    Text(period.displayName)
                        .font(ThemeManager.Typography.footnote)
                        .foregroundColor(selectedPeriod == period ? .white : ThemeManager.Colors.textSecondary)
                        .padding(.horizontal, ThemeManager.Spacing.sm)
                        .padding(.vertical, ThemeManager.Spacing.xs)
                        .background(
                            selectedPeriod == period ? ThemeManager.Colors.primary : ThemeManager.Colors.surface
                        )
                        .cornerRadius(ThemeManager.CornerRadius.sm)
                }
            }
            
            Spacer()
        }
    }
    
    private var typeToggleView: some View {
        HStack {
            Button(action: {
                showingExpenses = true
            }) {
                Text("Uscite")
                    .font(ThemeManager.Typography.bodyMedium)
                    .foregroundColor(showingExpenses ? .white : ThemeManager.Colors.textSecondary)
                    .padding(.horizontal, ThemeManager.Spacing.md)
                    .padding(.vertical, ThemeManager.Spacing.sm)
                    .background(
                        showingExpenses ? ThemeManager.Colors.expense : ThemeManager.Colors.surface
                    )
                    .cornerRadius(ThemeManager.CornerRadius.sm)
            }
            
            Button(action: {
                showingExpenses = false
            }) {
                Text("Entrate")
                    .font(ThemeManager.Typography.bodyMedium)
                    .foregroundColor(!showingExpenses ? .white : ThemeManager.Colors.textSecondary)
                    .padding(.horizontal, ThemeManager.Spacing.md)
                    .padding(.vertical, ThemeManager.Spacing.sm)
                    .background(
                        !showingExpenses ? ThemeManager.Colors.income : ThemeManager.Colors.surface
                    )
                    .cornerRadius(ThemeManager.CornerRadius.sm)
            }
            
            Spacer()
        }
    }
    
    private var chartPlaceholderView: some View {
        VStack(spacing: ThemeManager.Spacing.md) {
            Text("Grafico \(showingExpenses ? "Uscite" : "Entrate")")
                .font(ThemeManager.Typography.headline)
                .foregroundColor(ThemeManager.Colors.text)
            
            // Placeholder for pie chart
            RoundedRectangle(cornerRadius: ThemeManager.CornerRadius.lg)
                .fill(ThemeManager.Colors.surface)
                .frame(height: 200)
                .overlay(
                    VStack {
                        Image(systemName: "chart.pie")
                            .font(.system(size: 50))
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                        
                        Text("Grafico in arrivo")
                            .font(ThemeManager.Typography.body)
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                    }
                )
        }
    }
    
    private var categoryBreakdownView: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            Text("Spese per Categoria")
                .font(ThemeManager.Typography.headline)
                .foregroundColor(ThemeManager.Colors.text)
            
            // Placeholder for category list
            ForEach(0..<5) { index in
                HStack {
                    Circle()
                        .fill(Color.random)
                        .frame(width: 12, height: 12)
                    
                    Text("Categoria \(index + 1)")
                        .font(ThemeManager.Typography.body)
                        .foregroundColor(ThemeManager.Colors.text)
                    
                    Spacer()
                    
                    Text("€\(Int.random(in: 100...500))")
                        .font(ThemeManager.Typography.bodyMedium)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
                .padding(.vertical, ThemeManager.Spacing.xs)
            }
        }
        .padding(ThemeManager.Spacing.md)
        .background(ThemeManager.Colors.surface)
        .cornerRadius(ThemeManager.CornerRadius.md)
    }
}

extension Color {
    static var random: Color {
        return Color(
            red: .random(in: 0...1),
            green: .random(in: 0...1),
            blue: .random(in: 0...1)
        )
    }
}

struct StatisticsView_Previews: PreviewProvider {
    static var previews: some View {
        StatisticsView()
    }
} 