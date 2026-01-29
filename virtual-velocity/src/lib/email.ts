/**
 * Email Notification Service
 *
 * This module handles sending email notifications for form submissions
 * using ZeptoMail (https://www.zoho.com/zeptomail/) - Zoho's transactional email service.
 *
 * Setup Instructions:
 * 1. Sign up at https://www.zoho.com/zeptomail/
 * 2. Create a Mail Agent and verify your domain
 * 3. Get the Send Mail Token from the Mail Agent's SMTP/API settings
 * 4. Add to .env: ZEPTOMAIL_TOKEN=your_token_here
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  referralSource?: string;
  message: string;
}

export interface TestimonialData {
  name: string;
  email: string;
  condition?: string;
  testimonial: string;
  rating: number;
}

/**
 * Send email using ZeptoMail API
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const apiToken = import.meta.env.ZEPTOMAIL_TOKEN;

  if (!apiToken) {
    console.error('ZEPTOMAIL_TOKEN not configured');
    return false;
  }

  const fromEmail = import.meta.env.ZEPTOMAIL_FROM_EMAIL || 'noreply@holisticacupuncture.net';
  const fromName = import.meta.env.ZEPTOMAIL_FROM_NAME || 'Holistic Acupuncture Website';

  // Format recipients for ZeptoMail API
  const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
  const toList = toAddresses.map(email => ({
    email_address: {
      address: email,
      name: email.split('@')[0]
    }
  }));

  try {
    const requestBody: Record<string, unknown> = {
      from: {
        address: fromEmail,
        name: fromName
      },
      to: toList,
      subject: options.subject,
    };

    // Add content (prefer HTML, fallback to text)
    if (options.html) {
      requestBody.htmlbody = options.html;
    }
    if (options.text) {
      requestBody.textbody = options.text;
    }

    // Add reply-to if provided
    if (options.replyTo) {
      requestBody.reply_to = [{
        address: options.replyTo,
        name: options.replyTo.split('@')[0]
      }];
    }

    const response = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Zoho-enczapikey ${apiToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('ZeptoMail send failed:', error);
      return false;
    }

    const result = await response.json();
    console.log('Email sent successfully:', result.request_id);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

/**
 * Send contact form notification email
 */
export async function sendContactFormNotification(data: ContactFormData): Promise<boolean> {
  const adminEmail = import.meta.env.PUBLIC_ADMIN_EMAIL || 'info@holisticacupuncture.net';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #2d3436;
          background-color: #fafaf8;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #7a9063 0%, #657a52 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
        }
        .field {
          margin-bottom: 20px;
        }
        .field-label {
          font-weight: 600;
          color: #4f5f40;
          margin-bottom: 5px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .field-value {
          color: #2d3436;
          font-size: 16px;
        }
        .message-box {
          background: #f6f7f3;
          border-left: 4px solid #657a52;
          padding: 15px;
          margin-top: 10px;
          border-radius: 4px;
        }
        .footer {
          background: #f6f7f3;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #636e72;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Form Submission</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="field-label">Name</div>
            <div class="field-value">${escapeHtml(data.name)}</div>
          </div>

          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">
              <a href="mailto:${escapeHtml(data.email)}" style="color: #657a52; text-decoration: none;">
                ${escapeHtml(data.email)}
              </a>
            </div>
          </div>

          ${data.phone ? `
            <div class="field">
              <div class="field-label">Phone</div>
              <div class="field-value">
                <a href="tel:${escapeHtml(data.phone)}" style="color: #657a52; text-decoration: none;">
                  ${escapeHtml(data.phone)}
                </a>
              </div>
            </div>
          ` : ''}

          ${data.referralSource ? `
            <div class="field">
              <div class="field-label">How They Found Us</div>
              <div class="field-value">${escapeHtml(data.referralSource)}</div>
            </div>
          ` : ''}

          <div class="field">
            <div class="field-label">Message</div>
            <div class="message-box">
              ${escapeHtml(data.message).replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
        <div class="footer">
          <p>Submitted from holisticacupuncture.net contact form</p>
          <p style="margin: 5px 0; font-size: 12px;">
            Reply directly to this email to respond to ${escapeHtml(data.name)}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ''}
${data.referralSource ? `How They Found Us: ${data.referralSource}` : ''}

Message:
${data.message}

---
Submitted from holisticacupuncture.net
Reply to this email to respond to ${data.name}
  `.trim();

  return sendEmail({
    to: adminEmail,
    subject: `New Contact Form Submission from ${data.name}`,
    text,
    html,
    replyTo: data.email,
  });
}

/**
 * Send testimonial submission notification email
 */
export async function sendTestimonialNotification(data: TestimonialData): Promise<boolean> {
  const adminEmail = import.meta.env.PUBLIC_ADMIN_EMAIL || 'info@holisticacupuncture.net';

  const stars = '⭐'.repeat(data.rating);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #2d3436;
          background-color: #fafaf8;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #d8915b 0%, #c17557 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
        }
        .rating {
          font-size: 28px;
          text-align: center;
          margin: 20px 0;
        }
        .testimonial {
          background: #f6f7f3;
          border-left: 4px solid #d8915b;
          padding: 20px;
          border-radius: 4px;
          font-style: italic;
          font-family: 'Georgia', serif;
          font-size: 16px;
          line-height: 1.8;
        }
        .field {
          margin: 15px 0;
        }
        .field-label {
          font-weight: 600;
          color: #4f5f40;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .field-value {
          color: #2d3436;
          font-size: 16px;
          margin-top: 5px;
        }
        .footer {
          background: #f6f7f3;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #636e72;
        }
        .button {
          display: inline-block;
          background: #657a52;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Testimonial Submission</h1>
        </div>
        <div class="content">
          <div class="rating">${stars}</div>

          <div class="field">
            <div class="field-label">From</div>
            <div class="field-value">${escapeHtml(data.name)}</div>
          </div>

          <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">
              <a href="mailto:${escapeHtml(data.email)}" style="color: #657a52;">
                ${escapeHtml(data.email)}
              </a>
            </div>
          </div>

          ${data.condition ? `
            <div class="field">
              <div class="field-label">Condition Treated</div>
              <div class="field-value">${escapeHtml(data.condition)}</div>
            </div>
          ` : ''}

          <div class="field">
            <div class="field-label">Testimonial</div>
            <div class="testimonial">
              "${escapeHtml(data.testimonial)}"
            </div>
          </div>

          <div style="text-align: center;">
            <a href="https://holisticacupuncture.net/admin" class="button">
              View in Admin Dashboard
            </a>
          </div>
        </div>
        <div class="footer">
          <p>Review and approve this testimonial in your admin dashboard</p>
          <p style="font-size: 12px; margin-top: 10px;">
            Submitted from holisticacupuncture.net
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Testimonial Submission

Rating: ${stars} (${data.rating}/5)
From: ${data.name}
Email: ${data.email}
${data.condition ? `Condition: ${data.condition}` : ''}

Testimonial:
"${data.testimonial}"

---
Review and approve in admin dashboard: https://holisticacupuncture.net/admin
  `.trim();

  return sendEmail({
    to: adminEmail,
    subject: `New ${data.rating}-Star Testimonial from ${data.name}`,
    text,
    html,
    replyTo: data.email,
  });
}

/**
 * Send confirmation email to form submitter
 */
export async function sendConfirmationEmail(to: string, name: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #2d3436;
          background-color: #fafaf8;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #7a9063 0%, #657a52 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .content p {
          margin: 15px 0;
          font-size: 16px;
        }
        .footer {
          background: #f6f7f3;
          padding: 30px;
          text-align: center;
          font-size: 14px;
          color: #636e72;
        }
        .contact-info {
          margin: 20px 0;
          padding: 20px;
          background: #f6f7f3;
          border-radius: 6px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Contacting Us!</h1>
        </div>
        <div class="content">
          <p>Dear ${escapeHtml(name)},</p>

          <p>Thank you for reaching out to Acupuncture & Holistic Health Associates. We have received your message and will respond within 1-2 business days.</p>

          <p>If you need immediate assistance, please feel free to call us during our business hours.</p>

          <div class="contact-info">
            <strong>Phone:</strong> (414) 332-8888<br>
            <strong>Email:</strong> info@holisticacupuncture.net<br>
            <strong>Location:</strong> Bayshore Town Center, Glendale, WI
          </div>

          <p>We look forward to helping you on your wellness journey.</p>

          <p>
            Warm regards,<br>
            <strong>Acupuncture & Holistic Health Associates</strong>
          </p>
        </div>
        <div class="footer">
          <p>Acupuncture & Holistic Health Associates</p>
          <p>Bayshore Town Center | 5800 N Bayshore Drive | Glendale, WI 53217</p>
          <p style="font-size: 12px; margin-top: 15px;">
            <a href="https://holisticacupuncture.net" style="color: #657a52; text-decoration: none;">
              holisticacupuncture.net
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Dear ${name},

Thank you for reaching out to Acupuncture & Holistic Health Associates. We have received your message and will respond within 1-2 business days.

If you need immediate assistance, please feel free to call us during our business hours.

Phone: (414) 332-8888
Email: info@holisticacupuncture.net
Location: Bayshore Town Center, Glendale, WI

We look forward to helping you on your wellness journey.

Warm regards,
Acupuncture & Holistic Health Associates

---
Bayshore Town Center | 5800 N Bayshore Drive | Glendale, WI 53217
holisticacupuncture.net
  `.trim();

  return sendEmail({
    to,
    subject: 'Thank you for contacting us',
    text,
    html,
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
