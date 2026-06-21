import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const POST = withApiErrorHandling(postHandler, { component: 'invoice', severity: 'high', userImpact: 'blocking' });
async function postHandler(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await req.json();
    const { format = 'csv', period = 'month' } = body;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case 'month': startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); break;
      case 'quarter': startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()); break;
      case 'year': startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); break;
      default: startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    // Fetch data
    const [users, documents, pageViews] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { name: true, email: true, country: true, subscriptionStatus: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.document.findMany({
        where: { createdAt: { gte: startDate } },
        select: { type: true, status: true, totalTTC: true, createdAt: true },
      }),
      prisma.pageView.findMany({
        where: { timestamp: { gte: startDate } },
        select: { country: true, path: true, timestamp: true },
      }),
    ]);

    const totalRevenue = documents.reduce((sum, d) => sum + d.totalTTC, 0);

    if (format === 'xls') {
      const xlsContent = buildXlsReport(users, documents, pageViews, totalRevenue);
      return new NextResponse(xlsContent, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="admin-report-${period}-${now.toISOString().split('T')[0]}.xls"`,
        },
      });
    }

    // Default: CSV
    const csvContent = buildCsvReport(users, documents, pageViews, totalRevenue);
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="admin-report-${period}-${now.toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    logger.error('Admin report export error', { error: String(error) });
    throw error;
  }
}

function escapeCsv(val: string | number | null | undefined): string {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsvReport(users: { name: string; email: string; country: string; subscriptionStatus: string; createdAt: Date }[], documents: { type: string; status: string; totalTTC: number; createdAt: Date }[], pageViews: { country: string; path: string; timestamp: Date }[], totalRevenue: number): string {
  const rows: string[] = [];

  // Summary section
  rows.push('=== ADMIN REPORT ===');
  rows.push(`Total Users,${users.length}`);
  rows.push(`Total Documents,${documents.length}`);
  rows.push(`Total Revenue (DA),${totalRevenue}`);
  rows.push(`Total Page Views,${pageViews.length}`);
  rows.push('');
  rows.push('');

  // Users section
  rows.push('=== USERS ===');
  rows.push('Name,Email,Country,Subscription,Created At');
  users.forEach(u => {
    rows.push([u.name, u.email, u.country, u.subscriptionStatus, u.createdAt.toISOString().split('T')[0]].map(escapeCsv).join(','));
  });
  rows.push('');
  rows.push('');

  // Documents section
  rows.push('=== DOCUMENTS ===');
  rows.push('Type,Status,Total (DA),Created At');
  documents.forEach(d => {
    rows.push([d.type, d.status, d.totalTTC, d.createdAt.toISOString().split('T')[0]].map(escapeCsv).join(','));
  });
  rows.push('');
  rows.push('');

  // Page Views section
  rows.push('=== PAGE VIEWS ===');
  rows.push('Country,Path,Timestamp');
  pageViews.forEach(pv => {
    rows.push([pv.country, pv.path, pv.timestamp.toISOString()].map(escapeCsv).join(','));
  });

  return '\uFEFF' + rows.join('\r\n');
}

function buildXlsReport(users: { name: string; email: string; country: string; subscriptionStatus: string; createdAt: Date }[], documents: { type: string; status: string; totalTTC: number; createdAt: Date }[], pageViews: { country: string; path: string; timestamp: Date }[], totalRevenue: number): string {
  const rows: string[] = [];
  rows.push('<html><head><meta charset="utf-8"><title>Admin Report</title></head><body>');

  // Summary
  rows.push('<h2>Summary</h2>');
  rows.push('<table border="1"><tr><th>Metric</th><th>Value</th></tr>');
  rows.push(`<tr><td>Total Users</td><td>${users.length}</td></tr>`);
  rows.push(`<tr><td>Total Documents</td><td>${documents.length}</td></tr>`);
  rows.push(`<tr><td>Total Revenue</td><td>${totalRevenue} DA</td></tr>`);
  rows.push(`<tr><td>Total Page Views</td><td>${pageViews.length}</td></tr>`);
  rows.push('</table><br/><br/>');

  // Users
  rows.push('<h2>Users</h2>');
  rows.push('<table border="1"><tr><th>Name</th><th>Email</th><th>Country</th><th>Subscription</th><th>Created At</th></tr>');
  users.forEach(u => {
    rows.push(`<tr><td>${escapeXml(u.name)}</td><td>${escapeXml(u.email)}</td><td>${escapeXml(u.country)}</td><td>${escapeXml(u.subscriptionStatus)}</td><td>${u.createdAt.toISOString().split('T')[0]}</td></tr>`);
  });
  rows.push('</table><br/><br/>');

  // Documents
  rows.push('<h2>Documents</h2>');
  rows.push('<table border="1"><tr><th>Type</th><th>Status</th><th>Total (DA)</th><th>Created At</th></tr>');
  documents.forEach(d => {
    rows.push(`<tr><td>${escapeXml(d.type)}</td><td>${escapeXml(d.status)}</td><td>${d.totalTTC}</td><td>${d.createdAt.toISOString().split('T')[0]}</td></tr>`);
  });
  rows.push('</table><br/><br/>');

  // Page Views
  rows.push('<h2>Page Views</h2>');
  rows.push('<table border="1"><tr><th>Country</th><th>Path</th><th>Timestamp</th></tr>');
  pageViews.forEach(pv => {
    rows.push(`<tr><td>${escapeXml(pv.country)}</td><td>${escapeXml(pv.path)}</td><td>${pv.timestamp.toISOString()}</td></tr>`);
  });
  rows.push('</table>');

  rows.push('</body></html>');
  return rows.join('\r\n');
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
