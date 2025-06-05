import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { testEmailTemplate } from "./templates/test.template";
import { transactionsEmailTemplate } from "./templates/transactions.template";
import { EmailTemplate } from "./email.controller";

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isEmailConfigured = false;

  constructor(private configService: ConfigService) {
    try {
      // Controllo sicuro della disponibilità del ConfigService
      if (!this.configService) {
        console.warn('[EmailService] ConfigService non disponibile - email disabilitata');
        return;
      }

      // Verifica delle environment variables necessarie
      const smtpHost = this.configService.get<string>("SMTP_HOST");
      const smtpUser = this.configService.get<string>("SMTP_USER");
      const smtpPass = this.configService.get<string>("SMTP_PASS");
      
      if (!smtpHost || !smtpUser || !smtpPass) {
        console.warn('[EmailService] Configurazione SMTP incompleta - email disabilitata');
        console.warn('[EmailService] Variabili mancanti:', {
          SMTP_HOST: !!smtpHost,
          SMTP_USER: !!smtpUser,
          SMTP_PASS: !!smtpPass
        });
        return;
      }

      // Creazione transporter solo se configurazione completa
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: this.configService.get<number>("SMTP_PORT") || 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          ciphers: "SSLv3",
          rejectUnauthorized: false,
        },
      });
      
      this.isEmailConfigured = true;
      console.log('[EmailService] Configurato con successo');
    } catch (error) {
      console.warn('[EmailService] Errore durante inizializzazione:', error.message);
      this.transporter = null;
      this.isEmailConfigured = false;
    }
  }

  private checkEmailConfiguration(): boolean {
    if (!this.isEmailConfigured || !this.transporter) {
      console.warn('[EmailService] Email non configurata - operazione saltata');
      return false;
    }
    return true;
  }

  async sendTestEmail(to: string, template: EmailTemplate = "test") {
    if (!this.checkEmailConfiguration()) {
      return {
        success: false,
        error: 'Email service non configurato',
        template,
      };
    }

    try {
      let html: string;
      let subject: string;

      switch (template) {
        case "transactions":
          // Example data for transaction template
          const exampleTransactions = [
            {
              paymentName: "Restituzione INPS",
              amount: 221.65,
              nextDate: new Date("2025-04-30"),
            },
            {
              paymentName: "AppleOne",
              amount: 25.95,
              nextDate: new Date("2025-04-30"),
            },
          ];
          html = transactionsEmailTemplate(exampleTransactions, 247.6);
          subject = "Test Email - Template Transazioni";
          break;

        case "test":
        default:
          html = testEmailTemplate();
          subject = "Test Email da Bud-Jet";
          break;
      }

      const info = await this.transporter!.sendMail({
        from: this.configService.get<string>("SMTP_FROM") || "noreply@bud-jet.app",
        to,
        subject,
        html,
      });

      return {
        success: true,
        messageId: info.messageId,
        template,
      };
    } catch (error) {
      console.error("Error sending test email:", error);
      return {
        success: false,
        error: error.message,
        template,
      };
    }
  }

  async testTransactionsEmail(to: string) {
    if (!this.checkEmailConfiguration()) {
      return {
        success: false,
        error: 'Email service non configurato',
      };
    }

    // This method specifically tests the transactions email template
    const exampleTransactions = [
      {
        paymentName: "Restituzione INPS",
        amount: 221.65,
        nextDate: new Date("2025-04-30"),
      },
      {
        paymentName: "AppleOne",
        amount: 25.95,
        nextDate: new Date("2025-04-30"),
      },
      {
        paymentName: "Netflix",
        amount: 17.99,
        nextDate: new Date("2025-05-05"),
      },
    ];

    try {
      const totalAmount = exampleTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      );

      const info = await this.transporter!.sendMail({
        from: this.configService.get<string>("SMTP_FROM") || "noreply@bud-jet.app",
        to,
        subject: "Test Email - Transazioni Automatiche",
        html: transactionsEmailTemplate(exampleTransactions, totalAmount),
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Error sending transactions test email:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendRecurrentPaymentsNotification(
    to: string,
    transactions: {
      paymentName: string;
      amount: number;
      nextDate: Date;
    }[],
    totalAmount: number
  ) {
    if (!this.checkEmailConfiguration()) {
      return {
        success: false,
        error: 'Email service non configurato',
      };
    }

    try {
      // No need to map anymore since the properties already match
      const info = await this.transporter!.sendMail({
        from: this.configService.get<string>("SMTP_FROM") || "noreply@bud-jet.app",
        to,
        subject: "Nuove Transazioni Automatiche Create",
        html: transactionsEmailTemplate(transactions, totalAmount),
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Error sending recurrent payments notification:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
