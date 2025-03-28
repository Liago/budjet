import { baseTemplate } from "./base.template";

interface Transaction {
  name: string;
  amount: number;
  nextDate: Date;
}

export const transactionsEmailTemplate = (
  transactions: Transaction[],
  totalAmount: number
) => {
  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`;
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const transactionsHtml = transactions
    .map(
      (t) => `
      <tr>
        <td class="text-bold">${t.name}</td>
        <td class="text-right">${formatCurrency(t.amount)}</td>
        <td>${formatDate(t.nextDate)}</td>
      </tr>
    `
    )
    .join("");

  const content = `
    <h1>Nuove Transazioni Automatiche</h1>
    
    <div class="mb-4">
      <p>
        Sono state create <span class="text-bold">${
          transactions.length
        }</span> nuove transazioni
        per un totale di <span class="text-bold text-blue">${formatCurrency(
          totalAmount
        )}</span>.
      </p>
    </div>

    <div style="background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <table class="table">
        <thead>
          <tr>
            <th>Nome Transazione</th>
            <th class="text-right">Importo</th>
            <th>Prossima Data</th>
          </tr>
        </thead>
        <tbody>
          ${transactionsHtml}
          <tr style="background-color: #F9FAFB;">
            <td colspan="3" class="text-right text-bold">
              Totale: <span class="text-blue">${formatCurrency(
                totalAmount
              )}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4" style="background-color: #EFF6FF; border-radius: 8px; padding: 16px; border: 1px solid #BFDBFE;">
      <h2 style="color: #1E40AF; margin-bottom: 8px;">📅 Prossimi Passi</h2>
      <p style="color: #1E40AF; margin: 0;">
        Le transazioni verranno create automaticamente alle date specificate.
        Puoi modificare o cancellare queste transazioni in qualsiasi momento dal tuo pannello di controllo.
      </p>
    </div>
  `;

  return baseTemplate(content);
};
