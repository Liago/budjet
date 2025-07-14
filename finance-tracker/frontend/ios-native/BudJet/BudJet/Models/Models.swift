import Foundation
import SwiftUI

// MARK: - User Models

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String
    let createdAt: String
    let updatedAt: String?
}

struct AuthResponse: Codable {
    let accessToken: String
    let user: User
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RegisterRequest: Codable {
    let email: String
    let password: String
    let name: String
}

// MARK: - Transaction Models

enum TransactionType: String, Codable, CaseIterable {
    case income = "INCOME"
    case expense = "EXPENSE"
    
    var displayName: String {
        switch self {
        case .income:
            return "Entrata"
        case .expense:
            return "Spesa"
        }
    }
}

struct Transaction: Codable, Identifiable {
    let id: String
    let amount: Double
    let description: String
    let date: String
    let type: TransactionType
    let category: Category
    let tags: [String]
    let createdAt: String
    let updatedAt: String?
}

struct TransactionResponse: Codable {
    let data: [Transaction]
    let pagination: Pagination
}

struct Pagination: Codable {
    let total: Int
    let page: Int
    let limit: Int
    let totalPages: Int
}

struct CreateTransactionRequest: Codable {
    let amount: Double
    let description: String
    let date: String
    let type: TransactionType
    let categoryId: String
    let tags: [String]
}

struct UpdateTransactionRequest: Codable {
    let amount: Double?
    let description: String?
    let date: String?
    let type: TransactionType?
    let categoryId: String?
    let tags: [String]?
}

// MARK: - Category Models

struct Category: Codable, Identifiable {
    let id: String
    let name: String
    let icon: String?
    let color: String
    let isDefault: Bool
    let budget: String?
    let userId: String
    let createdAt: String
    let updatedAt: String
    let _count: CategoryCount?
}

struct CategoryCount: Codable {
    let transactions: Int
}

// MARK: - Dashboard Models

struct DashboardStats: Codable {
    let totalTransactions: Int
    let totalIncome: Double
    let totalExpenses: Double
    let balance: Double
    let period: DatePeriod
    let timestamp: String
}

struct DatePeriod: Codable {
    let startDate: String
    let endDate: String
}

// MARK: - Date Filter Models

enum DateFilterPeriod: String, CaseIterable {
    case current = "current"
    case previous = "previous"
    case custom = "custom"
    
    var displayName: String {
        switch self {
        case .current:
            return "Mese Corrente"
        case .previous:
            return "Mese Precedente"
        case .custom:
            return "Personalizzato"
        }
    }
}

struct DateRange {
    let startDate: String
    let endDate: String
}

// MARK: - Helper Extensions

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
        
        if let date = formatter.date(from: date) {
            formatter.dateFormat = "dd/MM/yyyy"
            return formatter.string(from: date)
        }
        
        return date
    }
}

extension Category {
    var budgetAmount: Double {
        return Double(budget ?? "0") ?? 0
    }
    
    var colorObject: Color {
        return Color(hex: color) ?? .gray
    }
}

extension Color {
    init?(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")
        
        var rgb: UInt64 = 0
        
        var r: CGFloat = 0.0
        var g: CGFloat = 0.0
        var b: CGFloat = 0.0
        var a: CGFloat = 1.0
        
        let length = hexSanitized.count
        
        guard Scanner(string: hexSanitized).scanHexInt64(&rgb) else { return nil }
        
        if length == 6 {
            r = CGFloat((rgb & 0xFF0000) >> 16) / 255.0
            g = CGFloat((rgb & 0x00FF00) >> 8) / 255.0
            b = CGFloat(rgb & 0x0000FF) / 255.0
            
        } else if length == 8 {
            r = CGFloat((rgb & 0xFF000000) >> 24) / 255.0
            g = CGFloat((rgb & 0x00FF0000) >> 16) / 255.0
            b = CGFloat((rgb & 0x0000FF00) >> 8) / 255.0
            a = CGFloat(rgb & 0x000000FF) / 255.0
            
        } else {
            return nil
        }
        
        self.init(.sRGB, red: r, green: g, blue: b, opacity: a)
    }
}

// MARK: - Date Helper Functions

func getDateRangeFromPeriod(_ period: DateFilterPeriod) -> DateRange {
    let today = Date()
    let calendar = Calendar.current
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    
    var startDate: Date
    var endDate: Date
    
    switch period {
    case .current:
        // Mese corrente
        startDate = calendar.date(from: calendar.dateComponents([.year, .month], from: today))!
        endDate = calendar.date(byAdding: DateComponents(month: 1, day: -1), to: startDate)!
        
    case .previous:
        // Mese precedente
        let previousMonth = calendar.date(byAdding: .month, value: -1, to: today)!
        startDate = calendar.date(from: calendar.dateComponents([.year, .month], from: previousMonth))!
        endDate = calendar.date(byAdding: DateComponents(month: 1, day: -1), to: startDate)!
        
    case .custom:
        // Usa le date personalizzate (default: mese corrente)
        startDate = calendar.date(from: calendar.dateComponents([.year, .month], from: today))!
        endDate = calendar.date(byAdding: DateComponents(month: 1, day: -1), to: startDate)!
    }
    
    return DateRange(
        startDate: formatter.string(from: startDate),
        endDate: formatter.string(from: endDate)
    )
} 