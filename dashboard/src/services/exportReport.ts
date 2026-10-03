import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TestRecord, AlertRecord } from '../types';

export function exportToCsv(tests: TestRecord[], filename = 'jjm_cl_ladder_tests.csv'): void {
  const headers = [
    'Test ID',
    'Village',
    'FRC Range',
    'Pads Blue',
    'Status',
    'Worker',
    'Batch ID',
    'GPS Lat',
    'GPS Lng',
    'Tested At (UTC)',
    'Notes',
  ];

  const rows = tests.map((t) => [
    `"${t.id}"`,
    `"${t.village_name}"`,
    `"${t.frc_range}"`,
    t.blue_pad_count,
    `"${t.status.toUpperCase()}"`,
    `"${t.worker_name || 'Volunteer'}"`,
    `"${t.batch_id}"`,
    t.lat,
    t.lng,
    `"${t.tested_at}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPdf(
  tests: TestRecord[],
  alerts: AlertRecord[],
  filterInfo: { village?: string; worker?: string; dateRange?: string }
): void {
  const doc = new jsPDF();

  // Header Title & Branding
  doc.setFillColor(13, 148, 136); // JJM Teal
  doc.rect(0, 0, 210, 24, 'F');

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Jal Jeevan Mission • Cl-Ladder Water Quality Report', 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Generated on: ${new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`,
    14,
    32
  );

  doc.text(
    `Scope: ${filterInfo.village || 'All Villages'} | Worker: ${filterInfo.worker || 'All Workers'} | Period: ${filterInfo.dateRange || 'All Time'}`,
    14,
    38
  );

  // Summary KPIs
  const total = tests.length;
  const safeCount = tests.filter((t) => t.status === 'safe').length;
  const lowCount = tests.filter((t) => t.status === 'low').length;
  const safePct = total > 0 ? Math.round((safeCount / total) * 100) : 0;
  const openAlerts = alerts.filter((a) => a.status === 'open' || a.status === 'recheck_assigned').length;

  autoTable(doc, {
    startY: 44,
    head: [['Total Tests Audited', 'Safe Residual % (0.2-1.0 ppm)', 'Low-FRC Breaches (<0.2 ppm)', 'Active Action Alerts']],
    body: [[total.toString(), `${safePct}%`, lowCount.toString(), openAlerts.toString()]],
    theme: 'grid',
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    styles: { halign: 'center', fontSize: 10 },
  });

  // Table of recent tests
  const lastY = (doc as any).lastAutoTable?.finalY || 65;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Audit Log: Water Residual Chlorine Tests', 14, lastY + 12);

  const tableRows = tests.slice(0, 30).map((t) => [
    new Date(t.tested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    t.village_name.split(' ')[0],
    t.frc_range,
    `${t.blue_pad_count}/6`,
    t.status.toUpperCase(),
    t.worker_name?.split(' ')[0] || 'Worker',
    t.notes || '-',
  ]);

  autoTable(doc, {
    startY: lastY + 16,
    head: [['Date', 'Village', 'FRC Range', 'Pads', 'Status', 'Field Worker', 'Sampling Point']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
  });

  doc.save(`jjm_cl_ladder_audit_${Date.now()}.pdf`);
}
