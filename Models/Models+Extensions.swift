import Foundation
import SwiftUI

// MARK: - Transaction Extensions

extension Transaction {
    var formattedAmount: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "EUR"
        return formatter.string(from: NSNumber(value: amount)) ?? "€0,00"
    }
    
    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: self.date) else { return self.date }
        
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

// MARK: - Category Extensions

extension Category {
    var colorObject: Color {
        return Color(hex: color) ?? ThemeManager.Colors.primary
    }
}

// MARK: - Color Extension for Hex Support

extension Color {
    init?(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            return nil
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - DateFilterPeriod

enum DateFilterPeriod: String, CaseIterable {
    case current = "current"
    case previous = "previous"
    case custom = "custom"
    
    var displayName: String {
        switch self {
        case .current:
            return "Questo mese"
        case .previous:
            return "Mese scorso"
        case .custom:
            return "Personalizzato"
        }
    }
}

// MARK: - Date Range Helper

struct DateRange {
    let startDate: String
    let endDate: String
}

func getDateRangeFromPeriod(_ period: DateFilterPeriod) -> DateRange {
    let today = Date()
    let calendar = Calendar.current
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    
    switch period {
    case .current:
        // Mese corrente
        let startOfMonth = calendar.dateInterval(of: .month, for: today)!.start
        let endOfMonth = calendar.dateInterval(of: .month, for: today)!.end
        let endDate = calendar.date(byAdding: .day, value: -1, to: endOfMonth)!
        
        return DateRange(
            startDate: formatter.string(from: startOfMonth),
            endDate: formatter.string(from: endDate)
        )
        
    case .previous:
        // Mese precedente
        let previousMonth = calendar.date(byAdding: .month, value: -1, to: today)!
        let startOfPreviousMonth = calendar.dateInterval(of: .month, for: previousMonth)!.start
        let endOfPreviousMonth = calendar.dateInterval(of: .month, for: previousMonth)!.end
        let endDate = calendar.date(byAdding: .day, value: -1, to: endOfPreviousMonth)!
        
        return DateRange(
            startDate: formatter.string(from: startOfPreviousMonth),
            endDate: formatter.string(from: endDate)
        )
        
    case .custom:
        // Per ora ritorna il mese corrente, sarà implementato con date picker
        let startOfMonth = calendar.dateInterval(of: .month, for: today)!.start
        let endOfMonth = calendar.dateInterval(of: .month, for: today)!.end
        let endDate = calendar.date(byAdding: .day, value: -1, to: endOfMonth)!
        
        return DateRange(
            startDate: formatter.string(from: startOfMonth),
            endDate: formatter.string(from: endDate)
        )
    }
}

// MARK: - API Request Models

struct CreateTransactionRequest: Codable {
    let amount: Double
    let description: String
    let date: String
    let type: TransactionType
    let categoryId: String
    let tags: [String]
} 