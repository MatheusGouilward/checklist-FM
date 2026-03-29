export type NotificationRecipient = 'manager' | 'tenant';

export interface NotificationPayload {
  checklistId: string;
  storeName: string;
  shoppingName: string;
  technicianName: string;
  serviceType: 'preventive' | 'corrective' | 'installation';
  serviceResult: 'ok' | 'pending_issue' | 'return_needed';
  completedAt: string;
  observations: string;
  returnJustification?: string;
  reportUrl?: string;
}

export interface NotifyRequest {
  payload: NotificationPayload;
  recipients: NotifyRecipient[];
}

export interface NotifyRecipient {
  type: NotificationRecipient;
  email: string;
  name: string;
}

export interface NotifyResult {
  sent: NotifyResultEntry[];
  failed: NotifyResultEntry[];
}

export interface NotifyResultEntry {
  type: NotificationRecipient;
  email: string;
  error?: string;
}

export const SERVICE_TYPE_LABELS: Record<NotificationPayload['serviceType'], string> = {
  preventive: 'Preventiva',
  corrective: 'Corretiva',
  installation: 'Instalação',
};

export const SERVICE_RESULT_LABELS: Record<NotificationPayload['serviceResult'], string> = {
  ok: 'OK — Serviço concluído',
  pending_issue: 'Pendência identificada',
  return_needed: 'Retorno necessário',
};

export const SERVICE_RESULT_COLORS: Record<NotificationPayload['serviceResult'], string> = {
  ok: '#16a34a',
  pending_issue: '#ca8a04',
  return_needed: '#dc2626',
};
