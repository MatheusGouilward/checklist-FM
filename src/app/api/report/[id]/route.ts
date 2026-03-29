import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Fetch checklist data
  const { data: checklist, error } = await supabase
    .from('checklists')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !checklist) {
    return NextResponse.json(
      { error: 'Checklist não encontrado' },
      { status: 404 }
    );
  }

  // Build report data structure
  const sections = checklist.sections as Array<{
    id: string;
    title: string;
    items: Array<{
      id: string;
      label: string;
      value: string | number | null;
      required: boolean;
      observation?: string;
    }>;
  }>;

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const filledItems = sections.reduce(
    (sum, s) =>
      sum +
      s.items.filter((i) => i.value !== null && i.value !== '').length,
    0
  );

  const report = {
    id: checklist.id,
    storeName: checklist.store_name,
    shoppingName: checklist.shopping_name,
    equipmentModel: checklist.equipment_model,
    equipmentCapacity: checklist.equipment_capacity,
    serviceType: checklist.service_type,
    technicianName: checklist.technician_name,
    serviceResult: checklist.service_result,
    observations: checklist.observations,
    returnJustification: checklist.return_justification,
    createdAt: checklist.created_at,
    completedAt: checklist.completed_at,
    totalItems,
    filledItems,
    sections: sections.map((s) => ({
      title: s.title,
      items: s.items.map((item) => ({
        label: item.label,
        value: item.value,
        required: item.required,
        observation: item.observation ?? null,
      })),
    })),
  };

  // NOTE: Full PDF generation with @react-pdf/renderer would be done here
  // in production. For the MVP, we return structured JSON that can be
  // rendered as PDF on the client or converted server-side.
  // The PDF generation is intentionally server-side to avoid loading
  // the heavy @react-pdf/renderer bundle on the technician's mobile device.

  return NextResponse.json(report);
}
