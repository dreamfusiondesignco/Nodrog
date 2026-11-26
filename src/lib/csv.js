// Spreadsheet exports (CSV, opens directly in Excel, Numbers and Google Sheets).
import { fleetRegistry } from '../data.js';

const cell = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const today = () => new Date().toISOString().slice(0, 10);
const fleetName = (f) => fleetRegistry[f]?.full || f || '';
const safe = (s) => String(s || '').replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

function download(filename, header, rows) {
  // BOM so Excel reads UTF-8 characters (e.g. "—") correctly.
  const text = '﻿' + [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

const scopeName = (fleet) => safe(fleet === 'ALL' || !fleet ? 'all-fleets' : fleet);

/** Stock levels with a re-order flag; parts below minimum listed first. */
export function downloadInventoryCsv(parts, fleet) {
  const rows = [...parts]
    .sort((a, b) => (Number(b.qty <= b.min) - Number(a.qty <= a.min)) || (a.name || '').localeCompare(b.name || ''))
    .map((p) => {
      const low = p.qty <= p.min;
      return [p.name, p.sku, fleetName(p.fleet), p.location, p.qty, p.min, low ? 'YES' : ''];
    });
  download(`inventory-${scopeName(fleet)}-${today()}.csv`,
    ['Part', 'SKU', 'Fleet', 'Location', 'In stock', 'Minimum', 'Re-order'], rows);
}

/** Every vehicle with certificate expiries and service dates. */
export function downloadFleetRegisterCsv(trucks, fleet) {
  const sv = (t, k) => t.service?.[k] || {};
  const rows = [...trucks].sort((a, b) => (a.plate || '').localeCompare(b.plate || '')).map((t) => [
    t.plate, fleetName(t.fleet), t.model, t.segment, t.chassis, t.capacity, t.driver, t.location,
    t.status === 'oos' ? 'OUT OF SERVICE' : (t.status || '').toUpperCase(),
    t.odometer, t.idleHrs, t.lastCheck,
    sv(t, 'engine').date, sv(t, 'engine').lastMiles, sv(t, 'engine').nextDueMiles, sv(t, 'engine').nextDueHrs,
    sv(t, 'transmission').date, sv(t, 'airFilter').date, sv(t, 'frontDiff').date, sv(t, 'rearDiff').date,
    t.fireExtDate, t.insuranceExp, t.fitnessExp, t.mvRegExp, t.carrierLicExp,
  ]);
  download(`fleet-register-${scopeName(fleet)}-${today()}.csv`, [
    'Plate', 'Fleet', 'Model', 'Segment', 'Chassis', 'Capacity', 'Driver', 'Location', 'Status',
    'Odometer (mi)', 'Idle hrs', 'Last check',
    'Engine service date', 'Engine service (mi)', 'Engine next due (mi)', 'Engine next due (hrs)',
    'Transmission service', 'Air filter service', 'Front diff service', 'Rear diff service',
    'Fire extinguisher', 'Insurance expiry', 'Fitness expiry', 'MV registration expiry', 'Carrier licence expiry',
  ], rows);
}
