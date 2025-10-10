import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

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

  emailOutbox.push({
    to,
    subject,
    text,
    html,
    metadata: { token, expiresAt, type: 'email-verification' },
  });

  void persistOutbox();
}

export function getEmailOutbox(): readonly EmailMessage[] {
  return emailOutbox;
}

export function clearEmailOutbox(): void {
  emailOutbox.splice(0, emailOutbox.length);
  void persistOutbox();
}

