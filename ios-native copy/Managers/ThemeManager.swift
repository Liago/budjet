import SwiftUI

class ThemeManager: ObservableObject {
    @Published var colorScheme: ColorScheme = .light
    @Published var isDarkMode: Bool = false {
        didSet {
            colorScheme = isDarkMode ? .dark : .light
            UserDefaults.standard.set(isDarkMode, forKey: "isDarkMode")
        }
    }
    
    init() {
        isDarkMode = UserDefaults.standard.bool(forKey: "isDarkMode")
        colorScheme = isDarkMode ? .dark : .light
    }
    
    // MARK: - Colors
    
    struct Colors {
        // Primary colors
        static let primary = Color("Primary")
        static let secondary = Color("Secondary")
        static let accent = Color("Accent")
        
        // Background colors
        static let background = Color("Background")
        static let surface = Color("Surface")
        static let card = Color("Card")
        
        // Text colors
        static let text = Color("Text")
        static let textSecondary = Color("TextSecondary")
        static let textTertiary = Color("TextTertiary")
        
        // Status colors
        static let success = Color("Success")
        static let error = Color("Error")
        static let warning = Color("Warning")
        static let info = Color("Info")
        
        // Border colors
        static let border = Color("Border")
        static let divider = Color("Divider")
        
        // Transaction colors
        static let income = Color("Income")
        static let expense = Color("Expense")
    }
    
    // MARK: - Typography
    
    struct Typography {
        static let largeTitle = Font.largeTitle.weight(.bold)
        static let title = Font.title.weight(.semibold)
        static let title2 = Font.title2.weight(.semibold)
        static let title3 = Font.title3.weight(.medium)
        static let headline = Font.headline.weight(.semibold)
        static let body = Font.body
        static let bodyMedium = Font.body.weight(.medium)
        static let callout = Font.callout
        static let subheadline = Font.subheadline
        static let footnote = Font.footnote
        static let caption = Font.caption
        static let caption2 = Font.caption2
    }
    
    // MARK: - Spacing
    
    struct Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
    }
    
    // MARK: - Corner Radius
    
    struct CornerRadius {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 20
        static let xxl: CGFloat = 24
    }
    
    // MARK: - Shadows
    
    struct Shadows {
        static let small = Shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
        static let medium = Shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
        static let large = Shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
    }
    
    struct Shadow {
        let color: Color
        let radius: CGFloat
        let x: CGFloat
        let y: CGFloat
    }
} 