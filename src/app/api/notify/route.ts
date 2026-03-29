import { NextRequest, NextResponse } from 'next/server';
import { notifyRequestSchema } from '@/lib/email/validation';
import { sendNotifications } from '@/lib/email/send';

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = notifyRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { payload, recipients } = parsed.data;

  const result = await sendNotifications(recipients, payload);

  const status = result.failed.length > 0 && result.sent.length === 0 ? 502 : 200;

  return NextResponse.json(result, { status });
}
