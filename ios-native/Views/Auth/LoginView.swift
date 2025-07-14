import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var email = ""
    @State private var password = ""
    @State private var showError = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: ThemeManager.Spacing.lg) {
                // Header
                VStack(spacing: ThemeManager.Spacing.md) {
                    Text("💰")
                        .font(.system(size: 60))
                    
                    Text("BudJet")
                        .font(ThemeManager.Typography.largeTitle)
                        .foregroundColor(ThemeManager.Colors.text)
                    
                    Text("Gestisci le tue finanze")
                        .font(ThemeManager.Typography.bodyMedium)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
                .padding(.top, ThemeManager.Spacing.xl)
                .padding(.bottom, ThemeManager.Spacing.lg)
                
                // Email Field
                VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                Text("Email")
                    .font(ThemeManager.Typography.bodyMedium)
                    .foregroundColor(ThemeManager.Colors.text)
                
                TextField("La tua email", text: $email)
                    .textFieldStyle(CustomTextFieldStyle())
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .autocorrectionDisabled(true)
            }
            
            // Password Field
            VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                Text("Password")
                    .font(ThemeManager.Typography.bodyMedium)
                    .foregroundColor(ThemeManager.Colors.text)
                
                SecureField("La tua password", text: $password)
                    .textFieldStyle(CustomTextFieldStyle())
            }
            
            // Login Button
            Button(action: handleLogin) {
                if authManager.isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                } else {
                    Text("Accedi")
                        .font(ThemeManager.Typography.bodyMedium)
                        .foregroundColor(.white)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, ThemeManager.Spacing.md)
            .background(ThemeManager.Colors.primary)
            .cornerRadius(ThemeManager.CornerRadius.md)
            .disabled(authManager.isLoading || !isFormValid)
            .opacity(authManager.isLoading || !isFormValid ? 0.6 : 1.0)
            
            // Forgot Password
            Button(action: {
                // TODO: Implement forgot password
            }) {
                Text("Password dimenticata?")
                    .font(ThemeManager.Typography.footnote)
                    .foregroundColor(ThemeManager.Colors.primary)
            }
            
            // Divider
            HStack {
                Rectangle()
                    .fill(ThemeManager.Colors.divider)
                    .frame(height: 1)
                Text("oppure")
                    .font(ThemeManager.Typography.footnote)
                    .foregroundColor(ThemeManager.Colors.textSecondary)
                Rectangle()
                    .fill(ThemeManager.Colors.divider)
                    .frame(height: 1)
            }
            .padding(.vertical, ThemeManager.Spacing.sm)
            
            // Register Button
            Button(action: {
                // TODO: Navigate to registration
            }) {
                Text("Crea un nuovo account")
                    .font(ThemeManager.Typography.bodyMedium)
                    .foregroundColor(ThemeManager.Colors.primary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, ThemeManager.Spacing.md)
            .background(Color.clear)
            .overlay(
                RoundedRectangle(cornerRadius: ThemeManager.CornerRadius.md)
                    .stroke(ThemeManager.Colors.primary, lineWidth: 2)
            )
            }
            .padding(.horizontal, ThemeManager.Spacing.lg)
            .padding(.bottom, ThemeManager.Spacing.lg)
        }
        .background(ThemeManager.Colors.background)
        .alert("Errore di accesso", isPresented: $showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(authManager.errorMessage ?? "Errore sconosciuto")
        }
        .onChange(of: authManager.errorMessage) { errorMessage in
            showError = errorMessage != nil
        }
    }
    
    private var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty && email.contains("@")
    }
    
    private func handleLogin() {
        Task {
            await authManager.login(email: email, password: password)
        }
    }
}

struct CustomTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding(.horizontal, ThemeManager.Spacing.md)
            .padding(.vertical, ThemeManager.Spacing.sm)
            .background(ThemeManager.Colors.surface)
            .cornerRadius(ThemeManager.CornerRadius.sm)
            .overlay(
                RoundedRectangle(cornerRadius: ThemeManager.CornerRadius.sm)
                    .stroke(ThemeManager.Colors.border, lineWidth: 1)
            )
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
            .environmentObject(AuthManager())
            .padding()
    }
} 