import Foundation
import SwiftUI

// MARK: - Error Types
enum AppError: Error, LocalizedError {
    case apiError(APIError)
    case networkError
    case authenticationError
    case validationError(String)
    case unknownError(String)
    
    var errorDescription: String? {
        switch self {
        case .apiError(let apiError):
            return apiError.localizedDescription
        case .networkError:
            return "Errore di connessione. Controlla la tua connessione internet."
        case .authenticationError:
            return "Errore di autenticazione. Effettua nuovamente l'accesso."
        case .validationError(let message):
            return message
        case .unknownError(let message):
            return message
        }
    }
    
    var recoverySuggestion: String? {
        switch self {
        case .apiError(let apiError):
            switch apiError {
            case .networkError:
                return "Riprova più tardi o controlla la connessione."
            case .serverError:
                return "Il server è temporaneamente non disponibile."
            case .invalidResponse:
                return "Riprova o contatta l'assistenza."
            case .decodingError:
                return "Errore nei dati ricevuti. Riprova."
            }
        case .networkError:
            return "Verifica che il dispositivo sia connesso a internet."
        case .authenticationError:
            return "Effettua nuovamente l'accesso."
        case .validationError:
            return "Correggi i dati inseriti e riprova."
        case .unknownError:
            return "Riprova più tardi o riavvia l'app."
        }
    }
}

// MARK: - Error Display Model
struct ErrorDisplayModel: Identifiable {
    let id = UUID()
    let error: AppError
    let timestamp: Date
    let context: String?
    
    var title: String {
        switch error {
        case .apiError:
            return "Errore API"
        case .networkError:
            return "Errore di Rete"
        case .authenticationError:
            return "Errore di Autenticazione"
        case .validationError:
            return "Errore di Validazione"
        case .unknownError:
            return "Errore Sconosciuto"
        }
    }
    
    var message: String {
        return error.localizedDescription
    }
    
    var suggestion: String? {
        return error.recoverySuggestion
    }
}

// MARK: - Error Manager
class ErrorManager: ObservableObject {
    static let shared = ErrorManager()
    
    @Published var currentError: ErrorDisplayModel?
    @Published var errorHistory: [ErrorDisplayModel] = []
    
    private let maxHistorySize = 50
    
    private init() {}
    
    // MARK: - Error Handling
    
    func handleError(_ error: Error, context: String? = nil) {
        let appError = convertToAppError(error)
        let errorModel = ErrorDisplayModel(
            error: appError,
            timestamp: Date(),
            context: context
        )
        
        DispatchQueue.main.async {
            self.currentError = errorModel
            self.addToHistory(errorModel)
        }
        
        // Log error for debugging
        logError(errorModel)
    }
    
    func handleAPIError(_ apiError: APIError, context: String? = nil) {
        handleError(AppError.apiError(apiError), context: context)
    }
    
    func handleValidationError(_ message: String, context: String? = nil) {
        handleError(AppError.validationError(message), context: context)
    }
    
    func clearCurrentError() {
        DispatchQueue.main.async {
            self.currentError = nil
        }
    }
    
    func clearErrorHistory() {
        DispatchQueue.main.async {
            self.errorHistory.removeAll()
        }
    }
    
    // MARK: - Private Methods
    
    private func convertToAppError(_ error: Error) -> AppError {
        if let appError = error as? AppError {
            return appError
        } else if let apiError = error as? APIError {
            return .apiError(apiError)
        } else if let urlError = error as? URLError {
            switch urlError.code {
            case .notConnectedToInternet, .networkConnectionLost:
                return .networkError
            default:
                return .unknownError(urlError.localizedDescription)
            }
        } else {
            return .unknownError(error.localizedDescription)
        }
    }
    
    private func addToHistory(_ errorModel: ErrorDisplayModel) {
        errorHistory.insert(errorModel, at: 0)
        
        // Keep only the most recent errors
        if errorHistory.count > maxHistorySize {
            errorHistory.removeLast()
        }
    }
    
    private func logError(_ errorModel: ErrorDisplayModel) {
        let contextString = errorModel.context ?? "Unknown"
        print("❌ [ERROR] [\(contextString)] \(errorModel.title): \(errorModel.message)")
        
        if let suggestion = errorModel.suggestion {
            print("💡 [SUGGESTION] \(suggestion)")
        }
    }
}

// MARK: - Error Alert Modifier
struct ErrorAlertModifier: ViewModifier {
    @ObservedObject var errorManager = ErrorManager.shared
    
    func body(content: Content) -> some View {
        content
            .alert(item: $errorManager.currentError) { errorModel in
                Alert(
                    title: Text(errorModel.title),
                    message: Text(errorModel.message + (errorModel.suggestion != nil ? "\n\n\(errorModel.suggestion!)" : "")),
                    dismissButton: .default(Text("OK")) {
                        errorManager.clearCurrentError()
                    }
                )
            }
    }
}

// MARK: - View Extension
extension View {
    func withErrorHandling() -> some View {
        self.modifier(ErrorAlertModifier())
    }
}

// MARK: - Error Helper Extensions
extension APIManager {
    func handleError(_ error: Error, context: String) {
        ErrorManager.shared.handleError(error, context: context)
    }
}

// MARK: - Loading State Manager
class LoadingManager: ObservableObject {
    static let shared = LoadingManager()
    
    @Published var isLoading = false
    @Published var loadingMessage = ""
    
    private init() {}
    
    func startLoading(_ message: String = "Caricamento...") {
        DispatchQueue.main.async {
            self.isLoading = true
            self.loadingMessage = message
        }
    }
    
    func stopLoading() {
        DispatchQueue.main.async {
            self.isLoading = false
            self.loadingMessage = ""
        }
    }
}

// MARK: - Loading Overlay Modifier
struct LoadingOverlayModifier: ViewModifier {
    @ObservedObject var loadingManager = LoadingManager.shared
    
    func body(content: Content) -> some View {
        ZStack {
            content
            
            if loadingManager.isLoading {
                Color.black.opacity(0.3)
                    .ignoresSafeArea()
                    .overlay(
                        VStack(spacing: 16) {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle())
                                .scaleEffect(1.2)
                                .foregroundColor(.white)
                            
                            Text(loadingManager.loadingMessage)
                                .font(.body)
                                .foregroundColor(.white)
                        }
                        .padding(20)
                        .background(Color.black.opacity(0.7))
                        .cornerRadius(8)
                    )
            }
        }
    }
}

// MARK: - Loading Extension
extension View {
    func withGlobalLoading() -> some View {
        self.modifier(LoadingOverlayModifier())
    }
}