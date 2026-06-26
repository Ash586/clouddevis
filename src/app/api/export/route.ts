import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const POST = withApiErrorHandling(withAuth(async (req, session) => {
  try {
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

    // Sanitize a cell value: escape quotes and strip leading formula chars (=,+,-,@,tab,CR)
    const csvCell = (v: string | number | null | undefined): string => {
      const str = String(v ?? '').replace(/"/g, '""');
      // Prefix with single-quote if value starts with a formula trigger character
      const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
      return `"${safe}"`;
    };

    if (format === 'csv') {
      const header = 'Number,Type,Client,Date,Total HT,TVA,Total TTC,Status';
      const rows = documents.map(d =>
        [d.number, d.type, d.client?.name || '', d.date.toISOString().split('T')[0],
         d.subTotalHT, d.tvaAmount, d.totalTTC, d.status].map(csvCell).join(',')
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
      const xlsEsc = (v: string | number | null | undefined): string => {
        const str = String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
      };
      const rows = documents.map(d => `
        <tr>
          <td>${xlsEsc(d.number)}</td>
          <td>${xlsEsc(d.type)}</td>
          <td>${xlsEsc(d.client?.name || '')}</td>
          <td>${xlsEsc(d.date.toISOString().split('T')[0])}</td>
          <td>${xlsEsc(d.subTotalHT)}</td>
          <td>${xlsEsc(d.tvaAmount)}</td>
          <td>${xlsEsc(d.totalTTC)}</td>
          <td>${xlsEsc(d.status)}</td>
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
}), { component: 'invoice', severity: 'high', userImpact: 'blocking' });
