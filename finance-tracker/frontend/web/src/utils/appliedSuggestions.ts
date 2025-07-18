// Utility per gestire i suggerimenti applicati
export interface AppliedSuggestion {
  id: string;
  appliedAt: Date;
  type: 'spending_reduction' | 'subscription' | 'automation' | 'debt_management';
  category?: string;
  action: string;
}

const APPLIED_SUGGESTIONS_KEY = 'budjet_applied_suggestions';

export const appliedSuggestionsUtils = {
  // Ottieni tutti i suggerimenti applicati
  getAppliedSuggestions(): AppliedSuggestion[] {
    try {
      const stored = localStorage.getItem(APPLIED_SUGGESTIONS_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        appliedAt: new Date(item.appliedAt)
      }));
    } catch (error) {
      console.error('Error reading applied suggestions:', error);
      return [];
    }
  },

  // Segna un suggerimento come applicato
  markAsApplied(suggestionId: string, type: AppliedSuggestion['type'], category?: string, action?: string): void {
    try {
      const applied = this.getAppliedSuggestions();
      
      // Verifica se è già applicato
      if (applied.some(s => s.id === suggestionId)) {
        return;
      }

      const newApplied: AppliedSuggestion = {
        id: suggestionId,
        appliedAt: new Date(),
        type,
        category,
        action: action || 'Configurazione applicata'
      };

      applied.push(newApplied);
      localStorage.setItem(APPLIED_SUGGESTIONS_KEY, JSON.stringify(applied));
    } catch (error) {
      console.error('Error marking suggestion as applied:', error);
    }
  },

  // Verifica se un suggerimento è applicato
  isApplied(suggestionId: string): boolean {
    return this.getAppliedSuggestions().some(s => s.id === suggestionId);
  },

  // Rimuovi un suggerimento applicato
  removeApplied(suggestionId: string): void {
    try {
      const applied = this.getAppliedSuggestions();
      const filtered = applied.filter(s => s.id !== suggestionId);
      localStorage.setItem(APPLIED_SUGGESTIONS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing applied suggestion:', error);
    }
  },

  // Ottieni statistiche sui suggerimenti applicati
  getAppliedStats(totalSuggestions: number) {
    const applied = this.getAppliedSuggestions();
    return {
      appliedCount: applied.length,
      totalCount: totalSuggestions,
      percentage: totalSuggestions > 0 ? Math.round((applied.length / totalSuggestions) * 100) : 0,
      recentlyApplied: applied.filter(s => {
        const hoursSinceApplied = (new Date().getTime() - s.appliedAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceApplied < 24; // Applied in last 24 hours
      })
    };
  }
};