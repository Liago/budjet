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
        static let primary = Color(red: 0.0, green: 0.47, blue: 1.0) // Blue
        static let secondary = Color(red: 0.35, green: 0.34, blue: 0.84) // Purple
        static let accent = Color(red: 1.0, green: 0.45, blue: 0.26) // Orange
        
        // Background colors
        static let background = Color(UIColor.systemBackground)
        static let surface = Color(UIColor.secondarySystemBackground)
        static let card = Color(UIColor.tertiarySystemBackground)
        
        // Text colors
        static let text = Color(UIColor.label)
        static let textSecondary = Color(UIColor.secondaryLabel)
        static let textTertiary = Color(UIColor.tertiaryLabel)
        
        // Status colors
        static let success = Color(red: 0.0, green: 0.78, blue: 0.0) // Green
        static let error = Color(red: 1.0, green: 0.23, blue: 0.19) // Red
        static let warning = Color(red: 1.0, green: 0.58, blue: 0.0) // Orange
        static let info = Color(red: 0.0, green: 0.48, blue: 1.0) // Blue
        
        // Border colors
        static let border = Color(UIColor.separator)
        static let divider = Color(UIColor.opaqueSeparator)
        
        // Transaction colors
        static let income = Color(red: 0.0, green: 0.78, blue: 0.0) // Green
        static let expense = Color(red: 1.0, green: 0.23, blue: 0.19) // Red
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