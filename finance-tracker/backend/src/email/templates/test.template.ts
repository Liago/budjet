import { baseTemplate } from "./base.template";

export const testEmailTemplate = () => {
  const content = `
    <h1>Test Email da Bud-Jet</h1>
    <div class="mb-4">
      <p>👋 Ciao! Questa è una email di test per verificare la configurazione del sistema di notifiche.</p>
    </div>
    
    <div style="background-color: #F0FDF4; border-radius: 8px; padding: 16px; border: 1px solid #86EFAC;">
      <h2 style="color: #166534; margin-bottom: 8px;">✅ Configurazione Corretta!</h2>
      <p style="color: #166534; margin: 0;">
        Se stai vedendo questa email, significa che il sistema di notifiche è configurato correttamente.
        Riceverai notifiche per:
      </p>
      <ul style="color: #166534; margin: 12px 0 0 24px;">
        <li>Transazioni automatiche create</li>
        <li>Promemoria di pagamento</li>
        <li>Aggiornamenti importanti del tuo account</li>
      </ul>
    </div>
  `;

  return baseTemplate(content);
};
