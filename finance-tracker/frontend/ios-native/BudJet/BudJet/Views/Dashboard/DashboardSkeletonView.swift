import SwiftUI

struct DashboardSkeletonView: View {
    @State private var isAnimating = false
    
    var body: some View {
        ScrollView {
            LazyVStack(spacing: ThemeManager.Spacing.lg) {
                // Header Skeleton
                headerSkeleton
                
                // Date Filter Skeleton
                dateFilterSkeleton
                
                // Stats Cards Skeleton
                statsCardsSkeleton
                
                // Recent Transactions Skeleton
                recentTransactionsSkeleton
            }
            .padding(.horizontal, ThemeManager.Spacing.md)
            .padding(.bottom, ThemeManager.Spacing.lg)
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true)) {
                isAnimating = true
            }
        }
    }
    
    private var headerSkeleton: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
            RoundedRectangle(cornerRadius: 4)
                .fill(Color.gray.opacity(0.3))
                .frame(width: 120, height: 24)
                .opacity(isAnimating ? 0.3 : 0.6)
            
            RoundedRectangle(cornerRadius: 4)
                .fill(Color.gray.opacity(0.3))
                .frame(width: 200, height: 16)
                .opacity(isAnimating ? 0.3 : 0.6)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, ThemeManager.Spacing.md)
    }
    
    private var dateFilterSkeleton: some View {
        HStack {
            ForEach(0..<3, id: \.self) { index in
                RoundedRectangle(cornerRadius: ThemeManager.CornerRadius.sm)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 80, height: 32)
                    .opacity(isAnimating ? 0.3 : 0.6)
            }
            
            Spacer()
        }
    }
    
    private var statsCardsSkeleton: some View {
        VStack(spacing: ThemeManager.Spacing.md) {
            // Card Container
            RoundedRectangle(cornerRadius: ThemeManager.CornerRadius.lg)
                .fill(Color.gray.opacity(0.3))
                .frame(height: 240)
                .opacity(isAnimating ? 0.3 : 0.6)
            
            // Page Indicator
            HStack(spacing: ThemeManager.Spacing.xs) {
                ForEach(0..<2, id: \.self) { index in
                    Circle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(width: 8, height: 8)
                        .opacity(isAnimating ? 0.3 : 0.6)
                }
            }
            .padding(.top, ThemeManager.Spacing.sm)
        }
    }
    
    private var recentTransactionsSkeleton: some View {
        VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
            // Header
            HStack {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 150, height: 20)
                    .opacity(isAnimating ? 0.3 : 0.6)
                
                Spacer()
                
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 70, height: 16)
                    .opacity(isAnimating ? 0.3 : 0.6)
            }
            
            // Transaction Items
            ForEach(0..<5, id: \.self) { _ in
                transactionItemSkeleton
            }
        }
    }
    
    private var transactionItemSkeleton: some View {
        HStack {
            // Category Icon
            Circle()
                .fill(Color.gray.opacity(0.3))
                .frame(width: 40, height: 40)
                .opacity(isAnimating ? 0.3 : 0.6)
            
            VStack(alignment: .leading, spacing: 4) {
                // Transaction Name
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 120, height: 16)
                    .opacity(isAnimating ? 0.3 : 0.6)
                
                // Category & Date
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 80, height: 12)
                    .opacity(isAnimating ? 0.3 : 0.6)
            }
            
            Spacer()
            
            // Amount
            VStack(alignment: .trailing, spacing: 4) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 60, height: 16)
                    .opacity(isAnimating ? 0.3 : 0.6)
                
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 40, height: 12)
                    .opacity(isAnimating ? 0.3 : 0.6)
            }
        }
        .padding(.vertical, ThemeManager.Spacing.sm)
    }
}

struct DashboardSkeletonView_Previews: PreviewProvider {
    static var previews: some View {
        DashboardSkeletonView()
    }
}