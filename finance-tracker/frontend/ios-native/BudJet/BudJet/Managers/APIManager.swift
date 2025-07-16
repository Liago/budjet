import Foundation

class APIManager: ObservableObject {
    static let shared = APIManager()
    
    private let baseURL = "https://bud-jet-be.netlify.app/.netlify/functions/api"
    private let session = URLSession.shared
    private let keychain = KeychainManager()
    
    // MARK: - Cache
    private var categoriesCache: [Category] = []
    private var categoriesCacheTimestamp: Date?
    private let categoriesCacheTimeout: TimeInterval = 300 // 5 minutes
    
    init() {}
    
    // MARK: - Health Check
    
    func healthCheck() async throws -> Bool {
        let url = URL(string: "\(baseURL)/health")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        
        print("🔍 Health check: \(url)")
        
        let (data, response) = try await session.data(for: request)
        
        print("📥 Health response: \(String(data: data, encoding: .utf8) ?? "nil")")
        print("📊 Health status: \((response as? HTTPURLResponse)?.statusCode ?? 0)")
        
        try validateResponse(response)
        return true
    }
    
    // MARK: - Authentication
    
    func login(email: String, password: String) async throws -> AuthResponse {
        let url = URL(string: "\(baseURL)/auth/direct-login")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = LoginRequest(email: email, password: password)
        request.httpBody = try JSONEncoder().encode(body)
        
        print("🔍 Login request to: \(url)")
        print("📤 Request body: \(String(data: request.httpBody!, encoding: .utf8) ?? "nil")")
        
        let (data, response) = try await session.data(for: request)
        
        print("📥 Response data: \(String(data: data, encoding: .utf8) ?? "nil")")
        print("📊 Response status: \((response as? HTTPURLResponse)?.statusCode ?? 0)")
        
        try validateResponse(response)
        
        do {
            return try JSONDecoder().decode(AuthResponse.self, from: data)
        } catch {
            print("❌ JSON decode error: \(error)")
            throw APIError.decodingError(error.localizedDescription)
        }
    }
    
    func register(email: String, password: String, name: String) async throws -> AuthResponse {
        let url = URL(string: "\(baseURL)/auth/register")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = RegisterRequest(email: email, password: password, name: name)
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        
        return try JSONDecoder().decode(AuthResponse.self, from: data)
    }
    
    func getCurrentUser(token: String) async throws -> User {
        let url = URL(string: "\(baseURL)/direct/users/me")!
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        
        return try JSONDecoder().decode(User.self, from: data)
    }
    
    // MARK: - Dashboard
    
    func getDashboardStats(startDate: String? = nil, endDate: String? = nil) async throws -> DashboardStats {
        var urlComponents = URLComponents(string: "\(baseURL)/direct/stats")!
        
        var queryItems: [URLQueryItem] = []
        if let startDate = startDate {
            queryItems.append(URLQueryItem(name: "startDate", value: startDate))
        }
        if let endDate = endDate {
            queryItems.append(URLQueryItem(name: "endDate", value: endDate))
        }
        
        if !queryItems.isEmpty {
            urlComponents.queryItems = queryItems
        }
        
        var request = URLRequest(url: urlComponents.url!)
        if let token = keychain.getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        
        return try JSONDecoder().decode(DashboardStats.self, from: data)
    }
    
    // MARK: - Transactions
    
    func getTransactions(limit: Int = 10, page: Int = 1, type: TransactionType? = nil) async throws -> TransactionResponse {
        var urlComponents = URLComponents(string: "\(baseURL)/direct/transactions")!
        
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "limit", value: "\(limit)"),
            URLQueryItem(name: "page", value: "\(page)")
        ]
        
        if let type = type {
            queryItems.append(URLQueryItem(name: "type", value: type.rawValue))
        }
        
        urlComponents.queryItems = queryItems
        
        var request = URLRequest(url: urlComponents.url!)
        if let token = keychain.getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        
        return try JSONDecoder().decode(TransactionResponse.self, from: data)
    }
    
    func createTransaction(_ transaction: CreateTransactionRequest) async throws -> Transaction {
        let url = URL(string: "\(baseURL)/direct/transactions")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = keychain.getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        request.httpBody = try JSONEncoder().encode(transaction)
        
        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        
        return try JSONDecoder().decode(Transaction.self, from: data)
    }
    
    func updateTransaction(id: String, transaction: UpdateTransactionRequest) async throws -> Transaction {
        let url = URL(string: "\(baseURL)/direct/transactions/\(id)")!
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = keychain.getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        request.httpBody = try JSONEncoder().encode(transaction)
        
        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        
        return try JSONDecoder().decode(Transaction.self, from: data)
    }
    
    func deleteTransaction(id: String) async throws {
        let url = URL(string: "\(baseURL)/direct/transactions/\(id)")!
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        
        if let token = keychain.getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        let (_, response) = try await session.data(for: request)
        try validateResponse(response)
    }
    
    // MARK: - Categories
    
    func getCategories(forceRefresh: Bool = false) async throws -> [Category] {
        // Check cache first
        if !forceRefresh,
           let cacheTimestamp = categoriesCacheTimestamp,
           Date().timeIntervalSince(cacheTimestamp) < categoriesCacheTimeout,
           !categoriesCache.isEmpty {
            print("🗂️ [CACHE] Categories loaded from cache")
            return categoriesCache
        }
        
        let url = URL(string: "\(baseURL)/direct/categories")!
        var request = URLRequest(url: url)
        
        if let token = keychain.getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        print("🗂️ [API] Loading categories from server...")
        let (data, response) = try await session.data(for: request)
        try validateResponse(response)
        
        let categories = try JSONDecoder().decode([Category].self, from: data)
        
        // Update cache
        categoriesCache = categories
        categoriesCacheTimestamp = Date()
        print("🗂️ [CACHE] Categories cached (\(categories.count) items)")
        
        return categories
    }
    
    // MARK: - Cache Management
    
    func clearCategoriesCache() {
        categoriesCache = []
        categoriesCacheTimestamp = nil
        print("🗂️ [CACHE] Categories cache cleared")
    }
    
    func clearAllCaches() {
        clearCategoriesCache()
        print("🗂️ [CACHE] All caches cleared")
    }
    
    // MARK: - Helper Methods
    
    private func validateResponse(_ response: URLResponse) throws {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        // Accetta 200-299 (incluso 201 per il login)
        guard 200...299 ~= httpResponse.statusCode else {
            throw APIError.serverError(httpResponse.statusCode)
        }
    }
}

enum APIError: Error, LocalizedError {
    case invalidResponse
    case serverError(Int)
    case networkError
    case decodingError(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "Risposta non valida dal server"
        case .serverError(let code):
            return "Errore del server: \(code)"
        case .networkError:
            return "Errore di rete"
        case .decodingError(let message):
            return "Errore di decodifica: \(message)"
        }
    }
} 