import { z } from 'zod';

const notifyRecipientSchema = z.object({
  type: z.enum(['manager', 'tenant']),
  email: z.email(),
  name: z.string().min(1),
});

const notificationPayloadSchema = z.object({
  checklistId: z.string().min(1),
  storeName: z.string().min(1),
  shoppingName: z.string().min(1),
  technicianName: z.string().min(1),
  serviceType: z.enum(['preventive', 'corrective', 'installation']),
  serviceResult: z.enum(['ok', 'pending_issue', 'return_needed']),
  completedAt: z.string().min(1),
  observations: z.string(),
  returnJustification: z.string().optional(),
  reportUrl: z.string().url().optional(),
});

export const notifyRequestSchema = z.object({
  payload: notificationPayloadSchema,
  recipients: z.array(notifyRecipientSchema).min(1),
});

export type ValidatedNotifyRequest = z.infer<typeof notifyRequestSchema>;
