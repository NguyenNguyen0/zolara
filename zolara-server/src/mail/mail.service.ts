import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    if (!sendgridApiKey) {
      this.logger.error('SENDGRID_API_KEY is required');
      throw new Error('SENDGRID_API_KEY is required');
    }

    this.logger.log('Using SendGrid for email delivery');
    this.transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false, // use TLS
      auth: {
        user: 'apikey', // This is fixed for SendGrid
        pass: sendgridApiKey,
      },
    });
  }

  async sendOtpEmail(email: string, otp: string) {
    try {
      const fromEmail = process.env.SENDGRID_FROM_EMAIL;
      
      if (!fromEmail) {
        throw new Error('SENDGRID_FROM_EMAIL is required');
      }

      const info = await this.transporter.sendMail({
        from: `"Zolara" <${fromEmail}>`,
        to: email,
        subject: 'Verify your email address',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification - Zolara</title>
          </head>
          <body style="
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f7;
            line-height: 1.6;
          ">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 60px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                    <!-- Title -->
                    <tr>
                      <td style="padding: 0 48px; text-align: center;">
                        <h1 style="
                          margin: 0;
                          font-size: 28px;
                          font-weight: 600;
                          color: #1d1d1f;
                          letter-spacing: -0.5px;
                        ">Verify your email</h1>
                      </td>
                    </tr>

                    <!-- Description -->
                    <tr>
                      <td style="padding: 16px 48px 32px 48px; text-align: center;">
                        <p style="
                          margin: 0;
                          font-size: 16px;
                          color: #86868b;
                          line-height: 1.5;
                        ">Enter this verification code to complete your registration:</p>
                      </td>
                    </tr>

                    <!-- OTP Code -->
                    <tr>
                      <td align="center" style="padding: 0 48px 32px 48px;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="
                              background-color: #f5f5f7;
                              border-radius: 8px;
                              padding: 24px 48px;
                            ">
                              <span style="
                                font-size: 36px;
                                font-weight: 600;
                                color: #1d1d1f;
                                letter-spacing: 8px;
                                font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
                              ">${otp}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Expiry Notice -->
                    <tr>
                      <td style="padding: 0 48px 32px 48px; text-align: center;">
                        <p style="
                          margin: 0;
                          font-size: 14px;
                          color: #86868b;
                        ">This code expires in 5 minutes</p>
                      </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                      <td style="padding: 0 48px;">
                        <div style="height: 1px; background-color: #e5e5e7;"></div>
                      </td>
                    </tr>

                    <!-- Security Notice -->
                    <tr>
                      <td style="padding: 32px 48px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="
                              background-color: #f5f5f7;
                              border-radius: 8px;
                              padding: 16px 20px;
                            ">
                              <p style="
                                margin: 0;
                                font-size: 13px;
                                color: #6e6e73;
                                line-height: 1.5;
                              ">
                                <strong style="color: #1d1d1f;">Security reminder:</strong> Never share this code with anyone. Zolara will never ask you for this code.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Not Requested -->
                    <tr>
                      <td style="padding: 0 48px 48px 48px; text-align: center;">
                        <p style="
                          margin: 0;
                          font-size: 13px;
                          color: #86868b;
                          line-height: 1.5;
                        ">If you didn't request this code, you can safely ignore this email.</p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="
                        padding: 32px 48px;
                        background-color: #f5f5f7;
                        text-align: center;
                        border-top: 1px solid #e5e5e7;
                      ">
                        <p style="
                          margin: 0 0 8px 0;
                          font-size: 13px;
                          color: #6e6e73;
                        ">Zolara</p>
                        <p style="
                          margin: 0;
                          font-size: 12px;
                          color: #86868b;
                        ">© 2025 Zolara. All rights reserved.</p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      this.logger.log(`Email sent successfully to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);
      return false;
    }
  }
}
