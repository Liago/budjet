import SwiftUI
import Foundation

@MainActor
class AuthManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var user: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiManager = APIManager()
    private let keychain = KeychainManager()
    
    init() {
        Task {
            await checkAuthenticationStatus()
        }
    }
    
    func checkAuthenticationStatus() async {
        if let token = keychain.getAccessToken() {
            await validateToken(token)
        }
    }
    
    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            // Prima verifica che il backend sia online
            print("🔍 Checking backend health...")
            let _ = try await apiManager.healthCheck()
            print("✅ Backend is healthy")
            
            // Poi prova il login
            print("🔍 Attempting login...")
            let response = try await apiManager.login(email: email, password: password)
            print("✅ Login successful")
            
            // Salva il token nel keychain
            keychain.saveAccessToken(response.accessToken)
            
            // Aggiorna lo stato
            user = response.user
            isAuthenticated = true
            
        } catch {
            print("❌ Login failed: \(error)")
            errorMessage = error.localizedDescription
            isAuthenticated = false
        }
        
        isLoading = false
    }
    
    func register(email: String, password: String, name: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let response = try await apiManager.register(email: email, password: password, name: name)
            
            // Salva il token nel keychain
            keychain.saveAccessToken(response.accessToken)
            
            // Aggiorna lo stato
            user = response.user
            isAuthenticated = true
            
        } catch {
            errorMessage = error.localizedDescription
            isAuthenticated = false
        }
        
        isLoading = false
    }
    
    func logout() {
        // Rimuovi il token dal keychain
        keychain.removeAccessToken()
        
        // Reset dello stato
        user = nil
        isAuthenticated = false
        errorMessage = nil
    }
    
    private func validateToken(_ token: String) async {
        do {
            let user = try await apiManager.getCurrentUser(token: token)
            self.user = user
            self.isAuthenticated = true
        } catch {
            // Token non valido, rimuovilo
            keychain.removeAccessToken()
            self.isAuthenticated = false
        }
    }
} 