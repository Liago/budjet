import SwiftUI

struct RegisterView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var showError = false
    
    var body: some View {
        VStack(spacing: ThemeManager.Spacing.lg) {
            // Name Field
            VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                Text("Nome")
                    .font(ThemeManager.Typography.bodyMedium)
                    .foregroundColor(ThemeManager.Colors.text)
                
                TextField("Il tuo nome", text: $name)
                    .textFieldStyle(CustomTextFieldStyle())
                    .autocapitalization(.words)
            }
            
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
                
                if !password.isEmpty && password.count < 6 {
                    Text("La password deve contenere almeno 6 caratteri")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.error)
                }
            }
            
            // Confirm Password Field
            VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                Text("Conferma Password")
                    .font(ThemeManager.Typography.bodyMedium)
                    .foregroundColor(ThemeManager.Colors.text)
                
                SecureField("Conferma la tua password", text: $confirmPassword)
                    .textFieldStyle(CustomTextFieldStyle())
                
                if !confirmPassword.isEmpty && password != confirmPassword {
                    Text("Le password non coincidono")
                        .font(ThemeManager.Typography.caption)
                        .foregroundColor(ThemeManager.Colors.error)
                }
            }
            
            // Register Button
            Button(action: handleRegister) {
                if authManager.isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                } else {
                    Text("Registrati")
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
        }
        .alert("Errore di registrazione", isPresented: $showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(authManager.errorMessage ?? "Errore sconosciuto")
        }
        .onChange(of: authManager.errorMessage) { errorMessage in
            showError = errorMessage != nil
        }
    }
    
    private var isFormValid: Bool {
        !name.isEmpty &&
        !email.isEmpty &&
        email.contains("@") &&
        password.count >= 6 &&
        password == confirmPassword
    }
    
    private func handleRegister() {
        Task {
            await authManager.register(email: email, password: password, name: name)
        }
    }
}

struct RegisterView_Previews: PreviewProvider {
    static var previews: some View {
        RegisterView()
            .environmentObject(AuthManager())
            .padding()
    }
} 