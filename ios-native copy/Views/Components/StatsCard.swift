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

struct StatsCard_Previews: PreviewProvider {
    static var previews: some View {
        VStack {
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
    }
} 