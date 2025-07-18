import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var themeManager: ThemeManager
    @State private var showingLogoutAlert = false
    
    var body: some View {
        NavigationView {
            List {
                // User Section
                Section {
                    HStack {
                        Circle()
                            .fill(ThemeManager.Colors.primary)
                            .frame(width: 50, height: 50)
                            .overlay(
                                Text(userInitials)
                                    .font(ThemeManager.Typography.title3)
                                    .foregroundColor(.white)
                            )
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(authManager.user?.name ?? "Utente")
                                .font(ThemeManager.Typography.bodyMedium)
                                .foregroundColor(ThemeManager.Colors.text)
                            
                            Text(authManager.user?.email ?? "")
                                .font(ThemeManager.Typography.caption)
                                .foregroundColor(ThemeManager.Colors.textSecondary)
                        }
                        
                        Spacer()
                    }
                    .padding(.vertical, ThemeManager.Spacing.xs)
                }
                
                // Appearance Section
                Section("Aspetto") {
                    HStack {
                        Image(systemName: "moon.circle.fill")
                            .foregroundColor(ThemeManager.Colors.primary)
                            .font(.title2)
                        
                        Text("Tema Scuro")
                            .font(ThemeManager.Typography.body)
                            .foregroundColor(ThemeManager.Colors.text)
                        
                        Spacer()
                        
                        Toggle("", isOn: $themeManager.isDarkMode)
                            .tint(ThemeManager.Colors.primary)
                    }
                    .padding(.vertical, ThemeManager.Spacing.xs)
                }
                
                // App Settings Section
                Section("Impostazioni App") {
                    SettingsRow(
                        icon: "bell.circle.fill",
                        title: "Notifiche",
                        color: ThemeManager.Colors.warning
                    ) {
                        // TODO: Navigate to notifications settings
                    }
                    
                    SettingsRow(
                        icon: "lock.circle.fill",
                        title: "Privacy e Sicurezza",
                        color: ThemeManager.Colors.success
                    ) {
                        // TODO: Navigate to privacy settings
                    }
                    
                    SettingsRow(
                        icon: "square.and.arrow.down.circle.fill",
                        title: "Esporta Dati",
                        color: ThemeManager.Colors.info
                    ) {
                        // TODO: Export data functionality
                    }
                }
                
                // Support Section
                Section("Supporto") {
                    SettingsRow(
                        icon: "questionmark.circle.fill",
                        title: "Centro Assistenza",
                        color: ThemeManager.Colors.info
                    ) {
                        // TODO: Open help center
                    }
                    
                    SettingsRow(
                        icon: "envelope.circle.fill",
                        title: "Contattaci",
                        color: ThemeManager.Colors.primary
                    ) {
                        // TODO: Contact support
                    }
                    
                    SettingsRow(
                        icon: "star.circle.fill",
                        title: "Valuta l'App",
                        color: ThemeManager.Colors.warning
                    ) {
                        // TODO: Rate app
                    }
                }
                
                // About Section
                Section("Informazioni") {
                    HStack {
                        Image(systemName: "info.circle.fill")
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                            .font(.title2)
                        
                        Text("Versione")
                            .font(ThemeManager.Typography.body)
                            .foregroundColor(ThemeManager.Colors.text)
                        
                        Spacer()
                        
                        Text(VersionInfo.fullVersion)
                            .font(ThemeManager.Typography.body)
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                    }
                    .padding(.vertical, ThemeManager.Spacing.xs)
                    
                    HStack {
                        Image(systemName: "hammer.circle.fill")
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                            .font(.title2)
                        
                        Text("Build")
                            .font(ThemeManager.Typography.body)
                            .foregroundColor(ThemeManager.Colors.text)
                        
                        Spacer()
                        
                        Text(VersionInfo.build)
                            .font(ThemeManager.Typography.body)
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                    }
                    .padding(.vertical, ThemeManager.Spacing.xs)
                    
                    HStack {
                        Image(systemName: "calendar.circle.fill")
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                            .font(.title2)
                        
                        Text("Data Build")
                            .font(ThemeManager.Typography.body)
                            .foregroundColor(ThemeManager.Colors.text)
                        
                        Spacer()
                        
                        Text(formatBuildDate(VersionInfo.buildDate))
                            .font(ThemeManager.Typography.body)
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                    }
                    .padding(.vertical, ThemeManager.Spacing.xs)
                    
                    HStack {
                        Image(systemName: "chevron.left.forwardslash.chevron.right")
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                            .font(.title2)
                        
                        Text("Commit")
                            .font(ThemeManager.Typography.body)
                            .foregroundColor(ThemeManager.Colors.text)
                        
                        Spacer()
                        
                        Text(VersionInfo.gitHash)
                            .font(ThemeManager.Typography.body)
                            .foregroundColor(ThemeManager.Colors.textSecondary)
                    }
                    .padding(.vertical, ThemeManager.Spacing.xs)
                }
                
                // Logout Section
                Section {
                    Button(action: {
                        showingLogoutAlert = true
                    }) {
                        HStack {
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                                .foregroundColor(ThemeManager.Colors.error)
                                .font(.title2)
                            
                            Text("Esci")
                                .font(ThemeManager.Typography.body)
                                .foregroundColor(ThemeManager.Colors.error)
                            
                            Spacer()
                        }
                        .padding(.vertical, ThemeManager.Spacing.xs)
                    }
                }
            }
            .navigationTitle("Impostazioni")
            .navigationBarTitleDisplayMode(.large)
            .listStyle(InsetGroupedListStyle())
            .alert("Conferma Logout", isPresented: $showingLogoutAlert) {
                Button("Annulla", role: .cancel) { }
                Button("Esci", role: .destructive) {
                    authManager.logout()
                }
            } message: {
                Text("Sei sicuro di voler uscire dall'app?")
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
    
    private var userInitials: String {
        guard let name = authManager.user?.name else { return "U" }
        let components = name.components(separatedBy: " ")
        let initials = components.compactMap { $0.first }.map { String($0) }
        return initials.prefix(2).joined().uppercased()
    }
    
    private func formatBuildDate(_ dateString: String) -> String {
        let isoFormatter = ISO8601DateFormatter()
        let displayFormatter = DateFormatter()
        displayFormatter.dateStyle = .medium
        displayFormatter.timeStyle = .short
        
        if let date = isoFormatter.date(from: dateString) {
            return displayFormatter.string(from: date)
        }
        return dateString
    }
}

struct SettingsRow: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .font(.title2)
                
                Text(title)
                    .font(ThemeManager.Typography.body)
                    .foregroundColor(ThemeManager.Colors.text)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundColor(ThemeManager.Colors.textSecondary)
                    .font(.caption)
            }
            .padding(.vertical, ThemeManager.Spacing.xs)
        }
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
            .environmentObject(AuthManager())
            .environmentObject(ThemeManager())
    }
} 