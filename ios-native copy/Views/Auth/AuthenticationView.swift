import SwiftUI

struct AuthenticationView: View {
    @State private var showLogin = true
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                VStack(spacing: ThemeManager.Spacing.md) {
                    Text("BudJet")
                        .font(ThemeManager.Typography.largeTitle)
                        .foregroundColor(ThemeManager.Colors.primary)
                    
                    Text("Gestisci le tue finanze in modo intelligente")
                        .font(ThemeManager.Typography.body)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, ThemeManager.Spacing.xxl)
                .padding(.horizontal, ThemeManager.Spacing.lg)
                
                Spacer()
                
                // Content
                VStack(spacing: ThemeManager.Spacing.lg) {
                    // Tab Selector
                    HStack(spacing: 0) {
                        Button(action: { showLogin = true }) {
                            Text("Accedi")
                                .font(ThemeManager.Typography.bodyMedium)
                                .foregroundColor(showLogin ? ThemeManager.Colors.primary : ThemeManager.Colors.textSecondary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, ThemeManager.Spacing.md)
                                .background(
                                    Rectangle()
                                        .fill(showLogin ? ThemeManager.Colors.primary.opacity(0.1) : Color.clear)
                                )
                        }
                        
                        Button(action: { showLogin = false }) {
                            Text("Registrati")
                                .font(ThemeManager.Typography.bodyMedium)
                                .foregroundColor(!showLogin ? ThemeManager.Colors.primary : ThemeManager.Colors.textSecondary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, ThemeManager.Spacing.md)
                                .background(
                                    Rectangle()
                                        .fill(!showLogin ? ThemeManager.Colors.primary.opacity(0.1) : Color.clear)
                                )
                        }
                    }
                    .background(ThemeManager.Colors.surface)
                    .cornerRadius(ThemeManager.CornerRadius.md)
                    
                    // Forms
                    if showLogin {
                        LoginView()
                    } else {
                        RegisterView()
                    }
                }
                .padding(.horizontal, ThemeManager.Spacing.lg)
                
                Spacer()
            }
            .background(ThemeManager.Colors.background)
            .navigationBarHidden(true)
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct AuthenticationView_Previews: PreviewProvider {
    static var previews: some View {
        AuthenticationView()
            .environmentObject(AuthManager())
    }
} 