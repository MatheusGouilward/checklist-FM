import type { NotificationPayload, NotificationRecipient } from './types';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_RESULT_LABELS,
  SERVICE_RESULT_COLORS,
} from './types';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background-color:#18181b;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">Vobi</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background-color:#f4f4f5;text-align:center;">
              <p style="margin:0;color:#71717a;font-size:12px;">
                Enviado automaticamente pela plataforma Vobi.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function statusBadge(result: NotificationPayload['serviceResult']): string {
  const color = SERVICE_RESULT_COLORS[result];
  const label = SERVICE_RESULT_LABELS[result];
  return `<span style="display:inline-block;padding:4px 12px;border-radius:4px;background-color:${color};color:#ffffff;font-size:14px;font-weight:600;">${label}</span>`;
}

function detailsTable(payload: NotificationPayload): string {
  const rows = [
    ['Loja', payload.storeName],
    ['Shopping', payload.shoppingName],
    ['Técnico', payload.technicianName],
    ['Tipo de serviço', SERVICE_TYPE_LABELS[payload.serviceType]],
    ['Concluído em', formatDate(payload.completedAt)],
  ];

  if (payload.observations) {
    rows.push(['Observações', payload.observations]);
  }

  if (payload.returnJustification) {
    rows.push(['Justificativa de retorno', payload.returnJustification]);
  }

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e4e4e7;color:#71717a;font-size:14px;white-space:nowrap;">${label}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e4e4e7;color:#18181b;font-size:14px;">${value}</td>
        </tr>`
    )
    .join('');

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">${rowsHtml}</table>`;
}

function reportLink(url: string): string {
  return `<a href="${url}" style="display:inline-block;margin-top:16px;padding:12px 24px;background-color:#18181b;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">Ver relatório completo</a>`;
}

export function buildManagerEmail(payload: NotificationPayload): {
  subject: string;
  html: string;
} {
  const subject = `Checklist finalizado — ${payload.storeName} (${payload.shoppingName})`;

  const body = `
    <h2 style="margin:0 0 8px;color:#18181b;font-size:18px;">Checklist de serviço finalizado</h2>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;">
      O técnico <strong>${payload.technicianName}</strong> finalizou o checklist para
      <strong>${payload.storeName}</strong>.
    </p>
    ${statusBadge(payload.serviceResult)}
    ${detailsTable(payload)}
    ${payload.reportUrl ? reportLink(payload.reportUrl) : ''}
  `;

  return { subject, html: baseLayout(subject, body) };
}

export function buildTenantEmail(payload: NotificationPayload): {
  subject: string;
  html: string;
} {
  const subject = `Relatório de manutenção — ${payload.storeName}`;

  const resultLabel = SERVICE_RESULT_LABELS[payload.serviceResult];

  const body = `
    <h2 style="margin:0 0 8px;color:#18181b;font-size:18px;">Relatório de manutenção</h2>
    <p style="margin:0 0 16px;color:#52525b;font-size:14px;">
      A manutenção do ar-condicionado da sua loja <strong>${payload.storeName}</strong>
      foi concluída com o resultado: <strong>${resultLabel}</strong>.
    </p>
    ${statusBadge(payload.serviceResult)}
    ${detailsTable(payload)}
    ${payload.reportUrl ? reportLink(payload.reportUrl) : ''}
    <p style="margin:16px 0 0;color:#71717a;font-size:13px;">
      Em caso de dúvidas, entre em contato com a equipe de manutenção.
    </p>
  `;

  return { subject, html: baseLayout(subject, body) };
}

export function buildEmail(
  type: NotificationRecipient,
  payload: NotificationPayload
): { subject: string; html: string } {
  if (type === 'manager') {
    return buildManagerEmail(payload);
  }
  return buildTenantEmail(payload);
}

export { formatDate };
