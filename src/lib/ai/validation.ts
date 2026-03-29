import { z } from 'zod';

const reportItemSchema = z.object({
  label: z.string().min(1),
  required: z.boolean(),
  value: z.union([z.string(), z.number(), z.null()]),
  observation: z.string().optional(),
});

const reportSectionSchema = z.object({
  title: z.string().min(1),
  items: z.array(reportItemSchema).min(1),
});

export const summaryRequestSchema = z.object({
  checklist: z.object({
    id: z.string().min(1),
    storeName: z.string().min(1),
    shoppingName: z.string().min(1),
    equipmentModel: z.string().min(1),
    equipmentCapacity: z.string().min(1),
    serviceType: z.enum(['preventive', 'corrective', 'installation']),
    technicianName: z.string().min(1),
    serviceResult: z.enum(['ok', 'pending_issue', 'return_needed']),
    createdAt: z.string().min(1),
    completedAt: z.string().min(1),
    observations: z.string(),
    returnJustification: z.string().optional(),
    sections: z.array(reportSectionSchema).min(1),
  }),
});

export type ValidatedSummaryRequest = z.infer<typeof summaryRequestSchema>;
