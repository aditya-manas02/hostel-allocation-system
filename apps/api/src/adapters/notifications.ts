import { env } from '../config/env.js';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SMSMessage {
  to: string;
  message: string;
}

export interface IEmailAdapter {
  sendEmail(msg: EmailMessage): Promise<{ messageId: string }>;
}

export interface ISMSAdapter {
  sendSMS(msg: SMSMessage): Promise<{ messageId: string }>;
}

export class ConsoleEmailAdapter implements IEmailAdapter {
  async sendEmail(msg: EmailMessage): Promise<{ messageId: string }> {
    const id = `console-email-${Date.now()}`;
    console.log(`[Email:Console] Message to: ${msg.to} | Subject: ${msg.subject}`);
    return { messageId: id };
  }
}

export class SMTPEmailAdapter implements IEmailAdapter {
  async sendEmail(msg: EmailMessage): Promise<{ messageId: string }> {
    // In production, nodemailer or SMTP connection would be initialized
    console.log(`[Email:SMTP via ${env.SMTP_HOST}:${env.SMTP_PORT}] To: ${msg.to} | Subject: ${msg.subject}`);
    return { messageId: `smtp-${Date.now()}` };
  }
}

export class ConsoleSMSAdapter implements ISMSAdapter {
  async sendSMS(msg: SMSMessage): Promise<{ messageId: string }> {
    const id = `console-sms-${Date.now()}`;
    console.log(`[SMS:Console] To: ${msg.to} | Content: ${msg.message}`);
    return { messageId: id };
  }
}

export class NotificationService {
  private emailAdapter: IEmailAdapter;
  private smsAdapter: ISMSAdapter;

  constructor(emailAdapter?: IEmailAdapter, smsAdapter?: ISMSAdapter) {
    this.emailAdapter =
      emailAdapter ||
      (env.EMAIL_PROVIDER === 'smtp' ? new SMTPEmailAdapter() : new ConsoleEmailAdapter());
    this.smsAdapter = smsAdapter || new ConsoleSMSAdapter();
  }

  async sendEmail(msg: EmailMessage): Promise<{ messageId: string }> {
    return this.emailAdapter.sendEmail(msg);
  }

  async sendSMS(msg: SMSMessage): Promise<{ messageId: string }> {
    return this.smsAdapter.sendSMS(msg);
  }
}

export const defaultNotificationService = new NotificationService();
