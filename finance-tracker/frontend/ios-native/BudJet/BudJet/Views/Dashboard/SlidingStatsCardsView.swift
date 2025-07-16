import SwiftUI
import Foundation

struct SlidingStatsCardsView: View {
    let balance: Double
    let totalIncome: Double
    let totalExpenses: Double
    let totalBudget: Double
    let categories: [Category]
    let period: String
    
    @State private var currentIndex = 0
    @State private var timer: Timer?
    
    var body: some View {
        VStack(spacing: ThemeManager.Spacing.md) {
            // Card Container
            GeometryReader { geometry in
                HStack(spacing: 0) {
                    // Balance Card
                    BalanceCard(
                        balance: balance,
                        totalIncome: totalIncome,
                        totalExpenses: totalExpenses,
                        period: period
                    )
                    .frame(width: geometry.size.width)
                    
                    // Budget Overview Card
                    BudgetOverviewCard(
                        totalBudget: totalBudget,
                        totalExpenses: totalExpenses,
                        categories: categories,
                        period: period
                    )
                    .frame(width: geometry.size.width)
                }
                .offset(x: CGFloat(currentIndex) * -geometry.size.width)
                .animation(.easeInOut(duration: 0.3), value: currentIndex)
                .gesture(
                    DragGesture()
                        .onEnded { gesture in
                            let threshold: CGFloat = geometry.size.width * 0.3
                            let translationX = gesture.translation.width
                            
                            if translationX > threshold && currentIndex > 0 {
                                currentIndex -= 1
                            } else if translationX < -threshold && currentIndex < 1 {
                                currentIndex += 1
                            }
                        }
                )
            }
            .frame(height: totalBudget > 0 ? 280 : 200) // Adjust height based on budget content
            .clipped()
            
            // Page Indicator
            HStack(spacing: ThemeManager.Spacing.xs) {
                ForEach(0..<2, id: \.self) { index in
                    Circle()
                        .fill(currentIndex == index ? ThemeManager.Colors.primary : ThemeManager.Colors.border)
                        .frame(width: 8, height: 8)
                        .scaleEffect(currentIndex == index ? 1.2 : 1.0)
                        .animation(.easeInOut(duration: 0.2), value: currentIndex)
                }
            }
            .padding(.top, ThemeManager.Spacing.sm)
        }
        .onAppear {
            // Auto-scroll every 5 seconds
            timer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { _ in
                withAnimation(.easeInOut(duration: 0.5)) {
                    currentIndex = (currentIndex + 1) % 2
                }
            }
        }
        .onDisappear {
            timer?.invalidate()
        }
    }
}

struct SlidingStatsCardsView_Previews: PreviewProvider {
    static var previews: some View {
        SlidingStatsCardsView(
            balance: 1287.63,
            totalIncome: 2500.00,
            totalExpenses: 1212.37,
            totalBudget: 1500.00,
            categories: [],
            period: "Marzo 2024"
        )
        .padding()
        .background(ThemeManager.Colors.background)
    }
}