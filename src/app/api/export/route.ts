import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const POST = withApiErrorHandling(postHandler, { component: 'invoice', severity: 'high', userImpact: 'blocking' });
async function postHandler(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { ids, format } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Document IDs required' }, { status: 400 });
    }

    const documents = await prisma.document.findMany({
      where: {
        id: { in: ids },
        userId: session.userId,
      },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const header = 'Number,Type,Client,Date,Total HT,TVA,Total TTC,Status';
      const rows = documents.map(d =>
        `"${d.number}","${d.type}","${d.client?.name || ''}","${d.date.toISOString().split('T')[0]}","${d.subTotalHT}","${d.tvaAmount}","${d.totalTTC}","${d.status}"`
      );
      const csv = [header, ...rows].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="documents-export-${Date.now()}.csv"`,
        },
      });
    }

    if (format === 'xls') {
      // HTML table format that Excel opens natively
      const rows = documents.map(d => `
        <tr>
          <td>${d.number}</td>
          <td>${d.type}</td>
          <td>${d.client?.name || ''}</td>
          <td>${d.date.toISOString().split('T')[0]}</td>
          <td>${d.subTotalHT}</td>
          <td>${d.tvaAmount}</td>
          <td>${d.totalTTC}</td>
          <td>${d.status}</td>
        </tr>
      `).join('');

      const xls = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Documents</x:Name></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>td{mso-number-format:"\\#,##0.00"} th{background:#1e3a5f;color:white;font-weight:bold}</style></head>
<body><table>
  <tr><th>Number</th><th>Type</th><th>Client</th><th>Date</th><th>Total HT</th><th>TVA</th><th>Total TTC</th><th>Status</th></tr>
  ${rows}
</table></body></html>`;

      return new NextResponse(xls, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="documents-export-${Date.now()}.xls"`,
        },
      });
    }

    return NextResponse.json({ documents });
  } catch (error) {
    logger.error('Export error', { error: String(error) });
    throw error;
  }
}
