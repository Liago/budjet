import SwiftUI

@main
struct BudJetApp: App {
    // Gestione dello stato dell'app
    @StateObject private var authManager = AuthManager()
    @StateObject private var apiManager = APIManager()
    @StateObject private var themeManager = ThemeManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(apiManager)
                .environmentObject(themeManager)
        }
    }
} 