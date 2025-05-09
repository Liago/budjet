import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { testEmailTemplate } from "./templates/test.template";
import { transactionsEmailTemplate } from "./templates/transactions.template";
import { EmailTemplate } from "./email.controller";

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("SMTP_HOST"),
      port: this.configService.get<number>("SMTP_PORT"),
      secure: false,
      requireTLS: true,
      auth: {
        user: this.configService.get<string>("SMTP_USER"),
        pass: this.configService.get<string>("SMTP_PASS"),
      },
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
    });
  }

  async sendTestEmail(to: string, template: EmailTemplate = "test") {
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

      const info = await this.transporter.sendMail({
        from: this.configService.get<string>("SMTP_FROM"),
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

      const info = await this.transporter.sendMail({
        from: this.configService.get<string>("SMTP_FROM"),
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
    try {
      // No need to map anymore since the properties already match
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>("SMTP_FROM"),
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
