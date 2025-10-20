# Email Setup with Resend

This guide explains how to configure real email sending using Resend for testing and production.

## Overview

By default, the application stores emails in a JSON file (`.tmp/email-outbox.json`) for development. To send real emails, you can configure Resend, which offers a generous free tier.

## Quick Start

### 1. Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day)
3. Verify your email address

### 2. Get API Key

1. Log into the [Resend Dashboard](https://resend.com/dashboard)
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "Resume Builder 9000 - Development")
5. Copy the API key (starts with `re_`)

### 3. Configure Environment Variables

Add these to your `.env` file in the project root:

```bash
# Email Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**For Testing:** Use `onboarding@resend.dev` as the from address (no verification needed)

**For Production:** Verify your own domain and use your email address (see below)

### 4. Restart Development Server

Stop and restart the dev server to pick up the new environment variables:

```powershell
# Stop current dev server (Ctrl+C)
# Then restart:
.\dev.ps1
```

### 5. Test Email Sending

1. Navigate to registration page: `http://localhost:3000/register`
2. Register with your actual email address (e.g., `apkasten@gmail.com`)
3. Check your inbox for the verification email
4. Click the verification link to complete registration

## From Email Addresses

### Testing (No Domain Required)

For testing, use Resend's default email:

```bash
RESEND_FROM_EMAIL=onboarding@resend.dev
```

This works immediately without any domain verification.

**Important:** Emails from `onboarding@resend.dev` often land in the **spam/junk folder** on first send. This is normal behavior because:

- It's a shared test domain used by many developers
- Email providers are cautious with new senders
- The domain hasn't been "warmed up" with your recipient's email provider

**What to do:** Simply check your spam folder for the first few emails. Mark them as "Not Spam" to train your email provider.

### Production (Custom Domain)

For production or branded emails:

1. Add and verify your domain in Resend Dashboard
2. Follow DNS verification steps
3. Use your verified email address:

```bash
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Benefits of verified domains:**

- Much better deliverability (emails go to inbox, not spam)
- Professional appearance
- Build sender reputation

## Troubleshooting

### Email Goes to Spam

This is **expected behavior** when using `onboarding@resend.dev`:

**Solution:**

1. Check your spam/junk folder
2. Mark the email as "Not Spam"
3. Add `onboarding@resend.dev` to your contacts
4. Future emails will likely go to inbox

For production, use a verified custom domain to avoid spam filtering.

### Email Not Sending

Check the console logs for error messages:

```text
❌ Failed to send email via Resend: [error details]
```

Common issues:

- Invalid API key (check for typos)
- Missing `RESEND_FROM_EMAIL` environment variable
- Rate limit exceeded (free tier: 100/day)
- Unverified domain (use `onboarding@resend.dev` for testing)

### Fallback Behavior

If Resend fails or isn't configured:

- Email is still saved to `.tmp/email-outbox.json`
- Application continues to work normally
- Check console for helpful messages:

```text
📧 Email would be sent to: user@example.com
💡 To send real emails, set RESEND_API_KEY and RESEND_FROM_EMAIL
```

### Checking Email Outbox

Development emails are always saved to the outbox for debugging:

```bash
# View all sent emails
cat .tmp/email-outbox.json
```

## Resend Free Tier Limits

- **100 emails per day**
- 1 domain verification
- 1 API key
- Email logs retention: 3 days

For higher volume, consider upgrading to a paid plan.

## Security Notes

- **Never commit your API key** - it's in `.gitignore`
- Store API keys in environment variables only
- For production, use a dedicated API key
- Rotate keys regularly
- Use minimum required permissions

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Dashboard](https://resend.com/dashboard)
- [Domain Verification Guide](https://resend.com/docs/dashboard/domains/introduction)
- [API Reference](https://resend.com/docs/api-reference/emails/send-email)
