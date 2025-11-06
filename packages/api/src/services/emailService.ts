import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Resend } from 'resend';
import { logger } from '../utils/logger.js';

// Lazy initialization of Resend client to ensure env vars are loaded
let resend: Resend | null = null;
let resendInitialized = false;

function getResendClient(): Resend | null {
  if (!resendInitialized) {
    resendInitialized = true;
    if (process.env.RESEND_API_KEY) {
      resend = new Resend(process.env.RESEND_API_KEY);
      if (process.env.NODE_ENV !== 'production') {
        logger.info('📧 Resend client initialized successfully');
        logger.info('  - API Key: ✓ Set');
        logger.info('  - From Email: %s', process.env.RESEND_FROM_EMAIL || '✗ Not set');
      }
    } else if (process.env.NODE_ENV !== 'production') {
      logger.info('📧 Resend not configured (RESEND_API_KEY not set)');
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
    // Use structured logger instead of console for consistency
    logger.warn('Failed to persist email outbox', { error });
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
        logger.info('📤 Sending email via Resend:');
        logger.info('   From: %s', process.env.RESEND_FROM_EMAIL);
        logger.info('   To: %s', to);
        logger.info('   Subject: %s', subject);
      }

      const result = await resendClient.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to,
        subject,
        text,
        html,
      });

      if (process.env.NODE_ENV !== 'production') {
        logger.info('✅ Email sent successfully via Resend: %o', result);
        logger.info('   Email ID: %s', result.data?.id);
        logger.info('   Check your inbox at: %s', to);
      }
    } catch (error) {
      // Log error but don't throw - email outbox still has the message for testing
      if (process.env.NODE_ENV !== 'production') {
        logger.error('❌ Failed to send email via Resend:', { error });
      }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    logger.info('📧 Email would be sent to: %s', to);
    logger.info('📧 Verification URL: %s', verificationUrl);
    logger.info('💡 To send real emails, set RESEND_API_KEY and RESEND_FROM_EMAIL');
  }
}

export function getEmailOutbox(): readonly EmailMessage[] {
  return emailOutbox;
}

export function clearEmailOutbox(): void {
  emailOutbox.splice(0, emailOutbox.length);
  void persistOutbox();
}
