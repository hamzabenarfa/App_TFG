import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private mailTransport() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private generateHtml(subject: string, message: string, actionUrl?: string, buttonText?: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${subject}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #4A90E2, #9013FE);
            color: #fff;
            padding: 20px;
            text-align: center;
            font-size: 22px;
            font-weight: bold;
          }
          .content {
            padding: 25px;
            font-size: 16px;
            color: #333;
            line-height: 1.6;
            text-align: center;
          }
          .button {
            display: inline-block;
            padding: 12px 20px;
            margin-top: 20px;
            background: #4A90E2;
            color: #fff;
            text-decoration: none;
            font-size: 16px;
            border-radius: 5px;
            transition: background 0.3s;
          }
          .button:hover {
            background: #357ABD;
          }
          .footer {
            background: #f4f4f4;
            padding: 15px;
            text-align: center;
            font-size: 13px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${subject}
          </div>
          <div class="content">
            <p>${message}</p>
            ${actionUrl ? `<a href="${actionUrl}" class="button">${buttonText}</a>` : ''}
          </div>
          <div class="footer">
            © 2024 Tu Empresa. Todos los derechos reservados.
          </div>
        </div>
      </body>
      </html>
    `;
  }
  

  async sendMail(to: string, subject: string, message: string, actionUrl?: string, buttonText?: string) {
    const htmlContent = this.generateHtml(subject, message, actionUrl, buttonText);
    const transporter = this.mailTransport();

    await transporter.sendMail({
      from: `"No Reply" <${process.env.SMTP_USER}>`, // Sigue enviando desde tu cuenta Gmail
      to,
      subject,
      html: htmlContent,
      replyTo: 'no-reply@example.com', // Dirección ficticia para bloquear respuestas
    });
    
  }
}
