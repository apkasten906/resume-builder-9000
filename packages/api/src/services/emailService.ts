import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Resend } from 'resend';

// Lazy initialization of Resend client to ensure env vars are loaded
let resend: Resend | null = null;
let resendInitialized = false;

function getResendClient(): Resend | null {
  if (!resendInitialized) {
    resendInitialized = true;
    if (process.env.RESEND_API_KEY) {
      resend = new Resend(process.env.RESEND_API_KEY);
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Resend client initialized successfully');
        console.log('  - API Key: ✓ Set');
        console.log('  - From Email:', process.env.RESEND_FROM_EMAIL || '✗ Not set');
      }
    } else if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Resend not configured (RESEND_API_KEY not set)');
    }
  }
  return resend;
}

export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html: string;
  readonly metadata?: Record<string, unknown>;
}

const emailOutbox: EmailMessage[] = [];

const outboxPath =
  process.env.EMAIL_OUTBOX_PATH || path.join(process.cwd(), '.tmp', 'email-outbox.json');

async function persistOutbox(): Promise<void> {
  try {
    const directory = path.dirname(outboxPath);
    await mkdir(directory, { recursive: true });
    await writeFile(outboxPath, JSON.stringify(emailOutbox, null, 2), 'utf-8');
  } catch (error) {
    // eslint-disable-next-line no-console -- logging for operational visibility
    console.warn('Failed to persist email outbox', error);
  }
}

export interface VerificationEmailParams {
  readonly to: string;
  readonly verificationUrl: string;
  readonly expiresAt: string;
  readonly token: string;
}

export async function sendVerificationEmail({
  to,
  verificationUrl,
  expiresAt,
  token,
}: VerificationEmailParams): Promise<void> {
  const subject = 'Confirm your Resume Builder 9000 account';
  const text = `Welcome to Resume Builder 9000!\n\nPlease confirm your account within 30 minutes by visiting: ${verificationUrl}\n\nThis link expires at ${expiresAt}.`;
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Confirm your account</title>
  </head>
  <body>
    <p>Welcome to <strong>Resume Builder 9000</strong>!</p>
    <p>
      Please confirm your account within 30 minutes by clicking the link below:
    </p>
    <p>
      <a href="${verificationUrl}">Confirm my account</a>
    </p>
    <p>This link expires at <strong>${expiresAt}</strong>.</p>
  </body>
</html>`;

  const emailMessage: EmailMessage = {
    to,
    subject,
    text,
    html,
    metadata: { token, expiresAt, type: 'email-verification' },
  };

  // Store in outbox for development/testing
  emailOutbox.push(emailMessage);
  void persistOutbox();

  // Actually send the email if Resend is configured
  const resendClient = getResendClient();
  if (resendClient && process.env.RESEND_FROM_EMAIL) {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log('📤 Sending email via Resend:');
        console.log('   From:', process.env.RESEND_FROM_EMAIL);
        console.log('   To:', to);
        console.log('   Subject:', subject);
      }

      // Retry with exponential backoff for transient failures
      const maxAttempts = Number.parseInt(process.env.EMAIL_RETRY_ATTEMPTS || '3', 10) || 3;
      const initialDelayMs = Number.parseInt(process.env.EMAIL_RETRY_DELAY_MS || '500', 10) || 500;
      let attempt = 0;
      let lastError: unknown = null;
      let result: Awaited<ReturnType<typeof resendClient.emails.send>> | null = null;

      while (attempt < maxAttempts) {
        try {
          result = await resendClient.emails.send({
            from: process.env.RESEND_FROM_EMAIL,
            to,
            subject,
            text,
            html,
          });
          break;
        } catch (err) {
          lastError = err;
          attempt += 1;
          if (attempt >= maxAttempts) break;
          const backoff = initialDelayMs * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
      }

      if (result) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('✅ Email sent successfully via Resend:', result);
          console.log('   Email ID:', result.data?.id);
          console.log('   Check your inbox at:', to);
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.error('❌ Failed to send email via Resend after retries:', lastError);
        }
      }
    } catch (error) {
      // Log error but don't throw - email outbox still has the message for testing
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Failed to send email via Resend:', error);
      }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    console.log('📧 Email would be sent to:', to);
    console.log('📧 Verification URL:', verificationUrl);
    console.log('💡 To send real emails, set RESEND_API_KEY and RESEND_FROM_EMAIL');
  }
}

export function getEmailOutbox(): readonly EmailMessage[] {
  return emailOutbox;
}

export function clearEmailOutbox(): void {
  emailOutbox.splice(0, emailOutbox.length);
  void persistOutbox();
}
