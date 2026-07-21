import { NextResponse } from 'next/server';
import type { PDFDocumentData } from '../../../../../packages/pdf-engine';

export async function POST(req: Request) {
  try {
    const body: PDFDocumentData = await req.json();

    if (!body.type || !body.number || !body.company || !body.client) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { generatePDFBase64 } = await import('../../../../../packages/pdf-engine');
    const base64 = await generatePDFBase64(body);

    return NextResponse.json({ base64 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'PDF generation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
