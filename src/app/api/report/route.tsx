import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReportPDF } from '@/lib/report/pdf-document';
import type { ReportData } from '@/lib/report/types';

async function generatePDF(data: ReportData): Promise<Uint8Array> {
  const document = <ReportPDF data={data} />;
  const buffer = await renderToBuffer(document);
  return new Uint8Array(buffer);
}

export async function POST(request: NextRequest) {
  let data: ReportData;

  try {
    data = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'JSON inválido' },
      { status: 400 }
    );
  }

  if (!data.id || !data.storeName || !data.serviceResult || !data.sections) {
    return NextResponse.json(
      { error: 'Dados incompletos para gerar relatório' },
      { status: 400 }
    );
  }

  try {
    const uint8 = await generatePDF(data);

    return new Response(uint8 as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-${data.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar PDF' },
      { status: 500 }
    );
  }
}
