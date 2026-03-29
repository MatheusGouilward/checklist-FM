import { Resend } from 'resend';
import type {
  NotificationPayload,
  NotifyRecipient,
  NotifyResult,
  NotifyResultEntry,
} from './types';
import { buildEmail } from './templates';

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
}

function getSenderAddress(): string {
  return process.env.EMAIL_FROM ?? 'Vobi <noreply@vobi.com.br>';
}

export async function sendNotification(
  recipient: NotifyRecipient,
  payload: NotificationPayload
): Promise<NotifyResultEntry> {
  const resend = getResendClient();
  const { subject, html } = buildEmail(recipient.type, payload);

  try {
    const { error } = await resend.emails.send({
      from: getSenderAddress(),
      to: recipient.email,
      subject,
      html,
    });

    if (error) {
      return {
        type: recipient.type,
        email: recipient.email,
        error: error.message,
      };
    }

    return { type: recipient.type, email: recipient.email };
  } catch (err) {
    return {
      type: recipient.type,
      email: recipient.email,
      error: err instanceof Error ? err.message : 'Erro desconhecido ao enviar email',
    };
  }
}

export async function sendNotifications(
  recipients: NotifyRecipient[],
  payload: NotificationPayload
): Promise<NotifyResult> {
  const result: NotifyResult = { sent: [], failed: [] };

  const results = await Promise.allSettled(
    recipients.map((r) => sendNotification(r, payload))
  );

  for (const settled of results) {
    if (settled.status === 'fulfilled') {
      const entry = settled.value;
      if (entry.error) {
        result.failed.push(entry);
      } else {
        result.sent.push(entry);
      }
    } else {
      result.failed.push({
        type: 'manager',
        email: 'unknown',
        error: settled.reason?.message ?? 'Promise rejected',
      });
    }
  }

  return result;
}
