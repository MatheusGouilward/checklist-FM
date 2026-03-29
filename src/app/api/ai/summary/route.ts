import { NextRequest, NextResponse } from 'next/server';
import { summaryRequestSchema } from '@/lib/ai/validation';
import { generateSummary } from '@/lib/ai/summary';

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = summaryRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const result = await generateSummary(parsed.data.checklist);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI summary error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar resumo' },
      { status: 500 }
    );
  }
}
