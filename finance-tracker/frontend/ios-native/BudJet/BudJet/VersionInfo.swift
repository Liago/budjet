//
//  VersionInfo.swift
//  BudJet
//
//  Auto-generated version information
//

import Foundation

struct VersionInfo {
    static let version = "1.0.1"
    static let build = "2"
    static let buildDate = "2025-07-17T15:42:49Z"
    static let gitHash = "52560fd"
    static let gitBranch = "main"
    
    static var fullVersion: String {
        return "\(version) (\(build))"
    }
    
    static var detailedVersion: String {
        return "\(version) (\(build)) - \(gitHash) on \(gitBranch)"
    }
}
