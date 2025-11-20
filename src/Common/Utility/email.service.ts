// email.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    // host: 'smtp.hostinger.com',
    // port: 465,
    // secure: true,
    // auth: {
    //   user: 'muhammad.huzaifa@iplexsoft.com',
    //   pass: 'M@h#123123', // Use app password if 2FA enabled
    // },
     host: process.env.SMTP_MAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_APP_PASS,
  },
  });

  async sendMail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: '"CTO.SA App Support" <cto.saudi@gmail.com>',
      to,
      subject,
      html,
    });
  }
}
