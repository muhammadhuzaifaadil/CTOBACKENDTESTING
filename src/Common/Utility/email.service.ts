// email.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: 'muhammad.huzaifa@iplexsoft.com',
      pass: 'M@h#123123', // Use app password if 2FA enabled
    },
  });

  async sendMail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: '"YourApp Support" <muhammad.huzaifa@iplexsoft.com>',
      to,
      subject,
      html,
    });
  }
}