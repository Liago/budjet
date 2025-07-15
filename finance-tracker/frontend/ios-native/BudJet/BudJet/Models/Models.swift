import Foundation
import SwiftUI

// MARK: - User Models

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String
    let createdAt: String?
    let updatedAt: String?
    
    // Campi aggiuntivi del backend
    let firstName: String?
    let lastName: String?
    
    private enum CodingKeys: String, CodingKey {
        case id, email, createdAt, updatedAt
        case firstName, lastName
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(String.self, forKey: .id)
        email = try container.decode(String.self, forKey: .email)
        createdAt = try? container.decode(String.self, forKey: .createdAt)
        updatedAt = try? container.decode(String.self, forKey: .updatedAt)
        
        // Gestisci firstName e lastName
        firstName = try? container.decode(String.self, forKey: .firstName)
        lastName = try? container.decode(String.self, forKey: .lastName)
        
        // Costruisci name da firstName e lastName se disponibili
        if let first = firstName, let last = lastName {
            name = "\(first) \(last)"
        } else if let first = firstName {
            name = first
        } else if let last = lastName {
            name = last
        } else {
            // Fallback per compatibilità
            name = "Unknown"
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(email, forKey: .email)
        try container.encodeIfPresent(createdAt, forKey: .createdAt)
        try container.encodeIfPresent(updatedAt, forKey: .updatedAt)
        try container.encodeIfPresent(firstName, forKey: .firstName)
        try container.encodeIfPresent(lastName, forKey: .lastName)
    }
    
    // Computed property per il nome completo
    var fullName: String {
        return name
    }
}

struct AuthResponse: Codable {
    let accessToken: String
    let user: User
    
    // Custom decoder per gestire sia accessToken che access_token
    private enum CodingKeys: String, CodingKey {
        case accessToken = "accessToken"
        case access_token = "access_token"
        case user
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        // Prova prima accessToken (camelCase), poi access_token (snake_case)
        if let token = try? container.decode(String.self, forKey: .accessToken) {
            accessToken = token
        } else if let token = try? container.decode(String.self, forKey: .access_token) {
            accessToken = token
        } else {
            throw DecodingError.keyNotFound(CodingKeys.accessToken, 
                DecodingError.Context(codingPath: decoder.codingPath, 
                                     debugDescription: "Nessun token trovato"))
        }
        
        user = try container.decode(User.self, forKey: .user)
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(accessToken, forKey: .accessToken)
        try container.encode(user, forKey: .user)
    }
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

struct Tag: Codable, Identifiable {
    let id: String
    let name: String
    let color: String?
    let createdAt: String
    let updatedAt: String?
}

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
    let tags: [String]  // Manteniamo come array di stringhe per l'UI
    let createdAt: String
    let updatedAt: String?
    
    // Custom init per gestire la conversione amount da stringa a Double
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(String.self, forKey: .id)
        description = try container.decode(String.self, forKey: .description)
        date = try container.decode(String.self, forKey: .date)
        type = try container.decode(TransactionType.self, forKey: .type)
        category = try container.decode(Category.self, forKey: .category)
        // Gestisci tags come array di oggetti Tag o array di stringhe
        if let tagObjects = try? container.decode([Tag].self, forKey: .tags) {
            tags = tagObjects.map { $0.name }
        } else {
            tags = try container.decode([String].self, forKey: .tags)
        }
        createdAt = try container.decode(String.self, forKey: .createdAt)
        updatedAt = try? container.decode(String.self, forKey: .updatedAt)
        
        // Gestisci amount come stringa o Double
        if let amountString = try? container.decode(String.self, forKey: .amount) {
            amount = Double(amountString) ?? 0.0
        } else {
            amount = try container.decode(Double.self, forKey: .amount)
        }
    }
    
    // Costruttore normale per creazione di istanze
    init(id: String, amount: Double, description: String, date: String, type: TransactionType, category: Category, tags: [String], createdAt: String, updatedAt: String?) {
        self.id = id
        self.amount = amount
        self.description = description
        self.date = date
        self.type = type
        self.category = category
        self.tags = tags
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
    
    // CodingKeys per la decodifica
    private enum CodingKeys: String, CodingKey {
        case id, amount, description, date, type, category, tags, createdAt, updatedAt
    }
}

struct TransactionResponse: Codable {
    let data: [Transaction]
    let pagination: Pagination?
    
    // Custom init per gestire risposte diverse dal backend
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        // Prova prima a decodificare come oggetto con data e pagination
        if let transactionsData = try? container.decode([Transaction].self, forKey: .data) {
            data = transactionsData
            pagination = try? container.decode(Pagination.self, forKey: .pagination)
        } else {
            // Se fallisce, prova a decodificare direttamente come array di transazioni
            let singleContainer = try decoder.singleValueContainer()
            data = try singleContainer.decode([Transaction].self)
            pagination = nil
        }
    }
    
    // Costruttore normale per creazione di istanze
    init(data: [Transaction], pagination: Pagination? = nil) {
        self.data = data
        self.pagination = pagination
    }
    
    private enum CodingKeys: String, CodingKey {
        case data, pagination
    }
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