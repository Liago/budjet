import SwiftUI

struct LoadingView: View {
    var message: String = "Caricamento..."
    
    var body: some View {
        VStack(spacing: ThemeManager.Spacing.lg) {
            ProgressView()
                .scaleEffect(1.5)
                .progressViewStyle(CircularProgressViewStyle(tint: ThemeManager.Colors.primary))
            
            Text(message)
                .font(ThemeManager.Typography.body)
                .foregroundColor(ThemeManager.Colors.textSecondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ThemeManager.Colors.background)
    }
}

struct LoadingView_Previews: PreviewProvider {
    static var previews: some View {
        LoadingView()
    }
} 