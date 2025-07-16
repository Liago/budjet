import SwiftUI

struct CustomDateRangeView: View {
    @Binding var startDate: Date
    @Binding var endDate: Date
    @Environment(\.dismiss) private var dismiss
    
    let onConfirm: () -> Void
    
    var body: some View {
        NavigationView {
            VStack(spacing: ThemeManager.Spacing.lg) {
                VStack(alignment: .leading, spacing: ThemeManager.Spacing.md) {
                    Text("Seleziona Periodo Personalizzato")
                        .font(ThemeManager.Typography.headline)
                        .foregroundColor(ThemeManager.Colors.text)
                    
                    Text("Scegli il periodo per visualizzare le statistiche del bilancio")
                        .font(ThemeManager.Typography.body)
                        .foregroundColor(ThemeManager.Colors.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                
                VStack(spacing: ThemeManager.Spacing.lg) {
                    // Data di inizio
                    VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                        Text("Data di inizio")
                            .font(ThemeManager.Typography.bodyMedium)
                            .foregroundColor(ThemeManager.Colors.text)
                        
                        DatePicker("", selection: $startDate, displayedComponents: .date)
                            .datePickerStyle(GraphicalDatePickerStyle())
                            .onChange(of: startDate) { newValue in
                                if newValue > endDate {
                                    endDate = newValue
                                }
                            }
                    }
                    
                    // Data di fine
                    VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                        Text("Data di fine")
                            .font(ThemeManager.Typography.bodyMedium)
                            .foregroundColor(ThemeManager.Colors.text)
                        
                        DatePicker("", selection: $endDate, in: startDate..., displayedComponents: .date)
                            .datePickerStyle(GraphicalDatePickerStyle())
                    }
                    
                    // Anteprima del periodo
                    VStack(alignment: .leading, spacing: ThemeManager.Spacing.sm) {
                        Text("Periodo selezionato")
                            .font(ThemeManager.Typography.bodyMedium)
                            .foregroundColor(ThemeManager.Colors.text)
                        
                        HStack {
                            Text("Dal \(formatDate(startDate)) al \(formatDate(endDate))")
                                .font(ThemeManager.Typography.body)
                                .foregroundColor(ThemeManager.Colors.primary)
                                .padding(.horizontal, ThemeManager.Spacing.md)
                                .padding(.vertical, ThemeManager.Spacing.sm)
                                .background(ThemeManager.Colors.primary.opacity(0.1))
                                .cornerRadius(ThemeManager.CornerRadius.sm)
                            
                            Spacer()
                        }
                    }
                }
                
                Spacer()
                
                // Pulsanti di azione
                HStack(spacing: ThemeManager.Spacing.md) {
                    Button("Annulla") {
                        dismiss()
                    }
                    .font(ThemeManager.Typography.bodyMedium)
                    .foregroundColor(ThemeManager.Colors.textSecondary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, ThemeManager.Spacing.md)
                    .background(ThemeManager.Colors.surface)
                    .cornerRadius(ThemeManager.CornerRadius.md)
                    
                    Button("Conferma") {
                        onConfirm()
                        dismiss()
                    }
                    .font(ThemeManager.Typography.bodyMedium)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, ThemeManager.Spacing.md)
                    .background(ThemeManager.Colors.primary)
                    .cornerRadius(ThemeManager.CornerRadius.md)
                }
            }
            .padding(ThemeManager.Spacing.lg)
            .navigationTitle("Periodo Personalizzato")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Chiudi") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "dd-MM-yyyy"
        return formatter.string(from: date)
    }
}

struct CustomDateRangeView_Previews: PreviewProvider {
    static var previews: some View {
        CustomDateRangeView(
            startDate: .constant(Date()),
            endDate: .constant(Date())
        ) {
            // Preview action
        }
    }
}