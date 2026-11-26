// PDF exports for weekly reports. jsPDF is loaded on demand so it doesn't
// weigh down the initial app bundle.
import { fmtDate } from '../ui.jsx';
import { fleetRegistry } from '../data.js';

const NAVY = [11, 26, 43];
const MUTED = [110, 120, 135];
const WARN = [196, 120, 0];
const OK = [22, 140, 80];

async function newDoc() {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  return { doc, autoTable };
}

const isoDay = (d) => d.toISOString().slice(0, 10);
const safe = (s) => String(s || '').replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const fleetName = (fleet) => (fleet === 'ALL' || !fleet ? 'All fleets' : fleetRegistry[fleet]?.full || fleet);

function header(doc, title, sub) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, w, 64, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(title, 40, 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(sub, 40, 50);
  doc.setTextColor(0, 0, 0);
  return 88;
}

function section(doc, y, text) {
  if (y > doc.internal.pageSize.getHeight() - 80) { doc.addPage(); y = 50; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.text(text, 40, y);
  doc.setTextColor(0, 0, 0);
  return y + 8;
}

function footer(doc) {
  const n = doc.internal.getNumberOfPages();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Nodrog Maintenance · generated ${fmtDate(isoDay(new Date()))}`, 40, h - 20);
    doc.text(`Page ${i} of ${n}`, w - 40, h - 20, { align: 'right' });
  }
}

const tableOpts = { margin: { left: 40, right: 40 }, styles: { fontSize: 9, cellPadding: 5 }, headStyles: { fillColor: NAVY } };

// Save the PDF. Falls back to opening it in a new tab where direct downloads
// are blocked (e.g. iOS home-screen apps).
function deliver(doc, filename) {
  try {
    doc.save(filename);
  } catch {
    const url = doc.output('bloburl');
    window.open(url, '_blank');
  }
}

/** One weekly inspection sheet. */
export async function downloadInspectionPdf(report, trucks) {
  const { doc, autoTable } = await newDoc();
  const truck = trucks.find((t) => t.id === report.truckId);
  let y = header(doc, 'Weekly inspection report', `${truck?.plate || '—'} · ${fmtDate(report.date)} · ${fleetName(report.fleet)}`);

  autoTable(doc, {
    ...tableOpts, startY: y, theme: 'plain',
    body: [
      ['Truck', truck?.plate || '—', 'Model', truck?.model || '—'],
      ['Inspector', report.by || '—', 'Date', fmtDate(report.date)],
      ['Result', report.attn ? `${report.attn} item(s) flagged` : 'All clear', 'Missing items', report.missing || 'None'],
    ],
    columnStyles: { 0: { fontStyle: 'bold', textColor: MUTED }, 2: { fontStyle: 'bold', textColor: MUTED } },
  });
  y = doc.lastAutoTable.finalY + 14;

  if (report.general) {
    y = section(doc, y, 'General comments');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    const lines = doc.splitTextToSize(report.general, doc.internal.pageSize.getWidth() - 80);
    doc.text(lines, 40, y + 10);
    y += 10 + lines.length * 13 + 10;
  }

  const results = report.results || {};
  const notes = report.notes || {};
  const keys = Object.keys(results);
  const flagged = keys.filter((k) => results[k] === 'attn');
  const ok = keys.filter((k) => results[k] === 'ok');

  if (flagged.length) {
    y = section(doc, y, `Needs attention (${flagged.length})`);
    autoTable(doc, { ...tableOpts, startY: y, head: [['Item', 'Note']], body: flagged.map((k) => [k, notes[k] || '']), headStyles: { fillColor: WARN } });
    y = doc.lastAutoTable.finalY + 18;
  }
  y = section(doc, y, `Checked OK (${ok.length})`);
  autoTable(doc, {
    ...tableOpts, startY: y, head: [['Item', 'Note']],
    body: ok.length ? ok.map((k) => [k, notes[k] || '']) : [['No items recorded.', '']],
    headStyles: { fillColor: OK },
  });

  footer(doc);
  deliver(doc, `weekly-report-${safe(truck?.plate || 'truck')}-${report.date || 'undated'}.pdf`);
}

/** Summary of the last 7 days: checks completed, open issues, OOS / due trucks, low stock. */
export async function downloadWeeklySummaryPdf({ trucks, issues, parts, inspections, fleet }) {
  const { doc, autoTable } = await newDoc();
  const end = new Date();
  const start = new Date(end); start.setDate(end.getDate() - 6);
  const from = isoDay(start), to = isoDay(end);
  const plate = (id) => trucks.find((t) => t.id === id)?.plate || '—';

  const weekChecks = inspections.filter((r) => r.date >= from && r.date <= to).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const openIssues = issues.filter((i) => i.status === 'open');
  const oos = trucks.filter((t) => t.status === 'oos');
  const due = trucks.filter((t) => t.status === 'due' || t.status === 'overdue');
  const low = parts.filter((p) => p.qty <= p.min);

  let y = header(doc, 'Weekly summary', `${fleetName(fleet)} · ${fmtDate(from)} – ${fmtDate(to)}`);

  autoTable(doc, {
    ...tableOpts, startY: y,
    head: [['Checks completed', 'Open issues', 'Out of service', 'Checks due', 'Low stock']],
    body: [[weekChecks.length, openIssues.length, oos.length, due.length, low.length]],
    styles: { ...tableOpts.styles, halign: 'center', fontSize: 11 },
  });
  y = doc.lastAutoTable.finalY + 22;

  y = section(doc, y, `Weekly checks this week (${weekChecks.length})`);
  autoTable(doc, {
    ...tableOpts, startY: y, head: [['Date', 'Truck', 'Inspector', 'Result', 'Comments']],
    body: weekChecks.length
      ? weekChecks.map((r) => [fmtDate(r.date), plate(r.truckId), r.by || '—', r.attn ? `${r.attn} flagged` : 'Clear', r.general || ''])
      : [['No checks completed this week.', '', '', '', '']],
  });
  y = doc.lastAutoTable.finalY + 22;

  y = section(doc, y, `Open issues (${openIssues.length})`);
  autoTable(doc, {
    ...tableOpts, startY: y, head: [['Date', 'Truck', 'Issue', 'Severity', 'Serious', 'OOS']],
    body: openIssues.length
      ? openIssues.map((i) => [fmtDate(i.date), plate(i.truckId), i.title, i.severity || '—', i.serious ? 'Yes' : '', i.oos ? 'Yes' : ''])
      : [['No open issues.', '', '', '', '', '']],
  });
  y = doc.lastAutoTable.finalY + 22;

  y = section(doc, y, `Out of service / checks due (${oos.length + due.length})`);
  autoTable(doc, {
    ...tableOpts, startY: y, head: [['Truck', 'Model', 'Status', 'Last check', 'Driver']],
    body: [...oos, ...due].length
      ? [...oos, ...due].map((t) => [t.plate, t.model || '—', t.status === 'oos' ? 'OUT OF SERVICE' : t.status.toUpperCase(), fmtDate(t.lastCheck), t.driver || '—'])
      : [['All trucks in service and up to date.', '', '', '', '']],
  });
  y = doc.lastAutoTable.finalY + 22;

  y = section(doc, y, `Low stock (${low.length})`);
  autoTable(doc, {
    ...tableOpts, startY: y, head: [['Part', 'SKU', 'In stock', 'Minimum']],
    body: low.length ? low.map((p) => [p.name || '—', p.sku || '', p.qty, p.min]) : [['No parts below minimum.', '', '', '']],
  });

  footer(doc);
  deliver(doc, `weekly-summary-${safe(fleet === 'ALL' ? 'all-fleets' : fleet)}-${to}.pdf`);
}
