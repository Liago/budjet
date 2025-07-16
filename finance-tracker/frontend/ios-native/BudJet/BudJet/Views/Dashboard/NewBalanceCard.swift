import SwiftUI

struct NewBalanceCard: View {
    let balance: Double
    let period: String
    let changePercentage: Double
    
    var body: some View {
        VStack(spacing: ThemeManager.Spacing.md) {
            // Header
            Text("Current Balance")
                .font(ThemeManager.Typography.bodyMedium)
                .fontWeight(.medium)
                .foregroundColor(.white)
            
            // Balance Amount
            Text(formatCurrency(balance))
                .font(.system(size: 32, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            
            // Change indicator
            HStack(spacing: ThemeManager.Spacing.xs) {
                Image(systemName: changePercentage >= 0 ? "arrow.up.right" : "arrow.down.right")
                    .font(.caption)
                    .foregroundColor(.white)
                
                Text(String(format: "%+.1f%% from last month", changePercentage))
                    .font(ThemeManager.Typography.caption)
                    .foregroundColor(.white.opacity(0.9))
            }
        }
        .frame(maxWidth: .infinity)
        .padding(ThemeManager.Spacing.lg)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.94, green: 0.47, blue: 0.51), // #F07882
                    Color(red: 0.91, green: 0.42, blue: 0.46)  // #E86B76
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(ThemeManager.CornerRadius.lg)
        .overlay(
            // Navigation arrows
            HStack {
                Button(action: {
                    // Previous period
                }) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                        .frame(width: 32, height: 32)
                        .background(Color.white.opacity(0.1))
                        .clipShape(Circle())
                }
                
                Spacer()
                
                Button(action: {
                    // Next period
                }) {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                        .frame(width: 32, height: 32)
                        .background(Color.white.opacity(0.1))
                        .clipShape(Circle())
                }
            }
            .padding(.horizontal, ThemeManager.Spacing.md)
        )
    }
    
    private func formatCurrency(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        formatter.locale = Locale(identifier: "en_US")
        return formatter.string(from: NSNumber(value: amount)) ?? "$0.00"
    }
}

struct NewBalanceCard_Previews: PreviewProvider {
    static var previews: some View {
        NewBalanceCard(
            balance: 2847.50,
            period: "January 2024",
            changePercentage: 12.5
        )
        .padding()
    }
}