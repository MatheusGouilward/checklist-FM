import { z } from 'zod';

export const photoSchema = z.object({
  id: z.string().min(1),
  checklistId: z.string().min(1),
  itemId: z.string().min(1),
  blob: z.instanceof(Blob),
  timestamp: z.date(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const checklistItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  required: z.boolean(),
  responseType: z.enum(['options', 'numeric', 'text']),
  options: z.array(z.string()).optional(),
  value: z.union([z.string(), z.number(), z.null()]),
  photos: z.array(photoSchema),
  observation: z.string().optional(),
});

export const checklistSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  items: z.array(checklistItemSchema).min(1),
});

export const checklistSchema = z
  .object({
    id: z.string().min(1),
    status: z.enum(['draft', 'in_progress', 'completed']),
    serviceResult: z.enum(['ok', 'pending_issue', 'return_needed']).nullable(),
    createdAt: z.date(),
    completedAt: z.date().nullable(),
    syncedAt: z.date().nullable(),
    storeName: z.string().min(1),
    shoppingName: z.string().min(1),
    equipmentModel: z.string().min(1),
    equipmentCapacity: z.string().min(1),
    serviceType: z.enum(['preventive', 'corrective', 'installation']),
    technicianId: z.string().min(1),
    technicianName: z.string().min(1),
    sections: z.array(checklistSectionSchema).min(1),
    photos: z.array(photoSchema),
    observations: z.string(),
    returnJustification: z.string().optional(),
    signature: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Rule: completed checklists must have all required items filled
    if (data.status === 'completed') {
      for (const section of data.sections) {
        for (const item of section.items) {
          if (item.required && (item.value === null || item.value === '')) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Item obrigatório "${item.label}" não preenchido`,
              path: ['sections', section.id, 'items', item.id],
            });
          }
        }
      }

      // Rule: completed checklists must have a serviceResult
      if (data.serviceResult === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Resultado do serviço é obrigatório para finalizar',
          path: ['serviceResult'],
        });
      }
    }

    // Rule: return_needed requires justification
    if (data.serviceResult === 'return_needed') {
      if (!data.returnJustification || data.returnJustification.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Justificativa de retorno é obrigatória',
          path: ['returnJustification'],
        });
      }
    }
  });

export type ChecklistFormData = z.infer<typeof checklistSchema>;
