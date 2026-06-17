// db.js — data layer. When Supabase is configured, all reads/writes go to the
// Postgres tables (so every device shares live data); otherwise it falls back to
// returning plain objects that App.jsx persists in localStorage (offline/demo mode).
import { supabase, isSupabaseConfigured } from './supabase.js';

const live = () => isSupabaseConfigured && supabase;

// Date columns reject empty strings — convert '' <-> null at the boundary.
const dOut = (v) => (v ? v : null);
const dIn = (v) => (v || '');
const newId = (p) => p + Date.now() + Math.random().toString(36).slice(2, 6);

// ───────────────────────── mappers (row <-> app shape) ─────────────────────────
const truckFromRow = (r) => ({
  id: r.id, fleet: r.fleet, plate: r.plate, model: r.model || '', segment: r.segment || '',
  chassis: r.chassis || '', capacity: r.capacity || '', driver: r.driver || '', location: r.location || '',
  status: r.status || 'ok', odometer: Number(r.odometer) || 0, idleHrs: Number(r.idle_hrs) || 0,
  lastCheck: dIn(r.last_check), photoUrl: r.photo_url || '', service: r.service || {},
  fireExtDate: dIn(r.fire_ext_date), insuranceExp: dIn(r.insurance_exp), fitnessExp: dIn(r.fitness_exp),
  mvRegExp: dIn(r.mv_reg_exp), carrierLicExp: dIn(r.carrier_lic_exp),
});
const truckToRow = (t) => ({
  fleet: t.fleet, plate: t.plate, model: t.model, segment: t.segment, chassis: t.chassis,
  capacity: t.capacity, driver: t.driver, location: t.location, status: t.status,
  odometer: t.odometer, idle_hrs: t.idleHrs, last_check: dOut(t.lastCheck), photo_url: t.photoUrl || null,
  service: t.service || {}, fire_ext_date: dOut(t.fireExtDate), insurance_exp: dOut(t.insuranceExp),
  fitness_exp: dOut(t.fitnessExp), mv_reg_exp: dOut(t.mvRegExp), carrier_lic_exp: dOut(t.carrierLicExp),
});

const partFromRow = (r) => ({ id: r.id, fleet: r.fleet, name: r.name, sku: r.sku || '', qty: r.qty ?? 0, min: r.min_level ?? 0, location: r.location || '' });
const partToRow = (p) => ({ fleet: p.fleet, name: p.name, sku: p.sku, qty: p.qty, min_level: p.min, location: p.location });

const issueFromRow = (r) => ({ id: r.id, fleet: r.fleet, truckId: r.truck_id, title: r.title, detail: r.detail || '', severity: r.severity, status: r.status, serious: !!r.serious, oos: !!r.oos, partsNeeded: r.parts_needed || '', photos: r.media || [], date: dIn(r.date), by: r.by_name || '' });
const issueToRow = (i, user) => ({ fleet: i.fleet, truck_id: i.truckId, title: i.title, detail: i.detail, severity: i.severity, status: i.status || 'open', serious: i.serious, oos: i.oos, parts_needed: i.partsNeeded, media: i.photos || [], date: dOut(i.date), by_user: user?.id || null, by_name: i.by || user?.name || '' });

const inspFromRow = (r) => ({ id: r.id, truckId: r.truck_id, fleet: r.fleet, date: dIn(r.date), by: r.by_name || '', attn: r.attn ?? 0, missing: r.missing || '', general: r.general || '', results: r.results || {}, notes: r.notes || {}, media: r.media || [] });
const inspToRow = (x, user) => ({ truck_id: x.truckId, fleet: x.fleet, date: dOut(x.date), attn: x.attn || 0, missing: x.missing || '', general: x.general || '', results: x.results || {}, notes: x.notes || {}, media: x.media || [], by_user: user?.id || null, by_name: x.by || user?.name || '' });

const histFromRow = (r) => ({ id: r.id, truckId: r.truck_id, date: dIn(r.date), type: r.type, miles: Number(r.miles) || 0, notes: r.notes || '', by: r.by_name || '' });
const histToRow = (h, user) => ({ truck_id: h.truckId, date: dOut(h.date), type: h.type, miles: h.miles, notes: h.notes, by_user: user?.id || null, by_name: h.by || user?.name || '' });

const usageFromRow = (r) => ({ id: r.id, partId: r.part_id, truckId: r.truck_id, qty: r.qty ?? 0, date: dIn(r.used_on), by: r.by_name || '', note: r.note || '' });
const usageToRow = (u, user) => ({ part_id: u.partId, truck_id: u.truckId, qty: u.qty, note: u.note || '', used_on: dOut(u.date), by_user: user?.id || null, by_name: u.by || user?.name || '' });

const invFromRow = (r) => ({ id: r.id, number: r.number, fleet: r.fleet, truckId: r.truck_id, party: r.party || '', kind: r.kind, date: dIn(r.date), dueDate: dIn(r.due_date), status: r.status, items: r.items || [], notes: r.notes || '' });
const invToRow = (v) => ({ number: v.number, fleet: v.fleet, truck_id: v.truckId || null, party: v.party, kind: v.kind, date: dOut(v.date), due_date: dOut(v.dueDate), status: v.status || 'draft', items: v.items || [], notes: v.notes || '' });

const fleetFromRow = (r) => ({ id: r.id, name: r.name, full: r.full_name });

// ───────────────────────── load everything (on login / refresh) ─────────────────────────
export async function loadAll() {
  if (!live()) return null; // signal: keep existing local state
  const [fleets, trucks, parts, usage, issues, inspections, history, invoices] = await Promise.all([
    supabase.from('fleets').select('*'),
    supabase.from('trucks').select('*').order('created_at', { ascending: false }),
    supabase.from('parts').select('*').order('created_at', { ascending: false }),
    supabase.from('part_usage').select('*').order('created_at', { ascending: false }),
    supabase.from('issues').select('*').order('created_at', { ascending: false }),
    supabase.from('inspections').select('*').order('created_at', { ascending: false }),
    supabase.from('service_history').select('*').order('created_at', { ascending: false }),
    supabase.from('invoices').select('*').order('created_at', { ascending: false }),
  ]);
  const fleetMap = {};
  (fleets.data || []).forEach((r) => { fleetMap[r.id] = fleetFromRow(r); });
  return {
    fleets: fleetMap,
    trucks: (trucks.data || []).map(truckFromRow),
    parts: (parts.data || []).map(partFromRow),
    usage: (usage.data || []).map(usageFromRow),
    issues: (issues.data || []).map(issueFromRow),
    inspections: (inspections.data || []).map(inspFromRow),
    history: (history.data || []).map(histFromRow),
    invoices: (invoices.data || []).map(invFromRow),
  };
}

// ───────────────────────── media upload (Supabase Storage 'media' bucket) ─────────────────────────
async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}
// items: [{ type:'image'|'video', url, name }]. Uploads any data-URL items to Storage,
// returns { items, failed }: items get durable public URLs; failures are dropped (never
// embedded as base64 in the DB) and counted. http(s) URLs pass through untouched.
export async function uploadMedia(items, userId) {
  if (!items || !items.length) return { items: [], failed: 0 };
  if (!live()) return { items, failed: 0 }; // local mode: keep data URLs (single device)
  const out = []; let failed = 0; let lastError = null;
  for (const m of items) {
    if (!m || !m.url) continue;
    if (/^https?:\/\//.test(m.url)) { out.push(m); continue; }
    try {
      const blob = await dataUrlToBlob(m.url);
      const ext = m.type === 'video' ? (m.name?.split('.').pop() || 'mp4') : 'jpg';
      const path = `${userId || 'anon'}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(path, blob, {
        contentType: m.type === 'video' ? blob.type || 'video/mp4' : 'image/jpeg', upsert: false,
      });
      if (error) { failed++; lastError = error; continue; } // do NOT embed base64 in the DB
      const { data } = supabase.storage.from('media').getPublicUrl(path);
      out.push({ type: m.type, url: data.publicUrl, name: m.name || '' });
    } catch (e) { failed++; lastError = e; }
  }
  if (lastError) console.error('Media upload failed (is the "media" Storage bucket created & public?):', lastError.message || lastError);
  return { items: out, failed };
}

// Upload one image (data URL) to Storage and return a durable public URL.
// In local/demo mode the data URL passes straight through (single-device preview).
// Returns '' if the upload failed so the caller can keep its optimistic preview.
export async function uploadImage(dataUrl, userId) {
  if (!dataUrl) return '';
  const { items } = await uploadMedia([{ type: 'image', url: dataUrl, name: 'truck.jpg' }], userId);
  return items[0]?.url || '';
}

// ───────────────────────── inserts / updates ─────────────────────────
// Each returns the saved object in app shape. In local mode it just stamps an id.

// Per-user preferences (theme) — stored in user_settings, scoped to the user by RLS.
// Degrades gracefully if the table hasn't been created yet.
export async function loadUserSettings(userId) {
  if (!live() || !userId) return null;
  try {
    const { data, error } = await supabase.from('user_settings').select('theme').eq('id', userId).maybeSingle();
    if (error) return null;
    return data || null;
  } catch { return null; }
}
export async function saveTheme(userId, theme) {
  if (!live() || !userId) return;
  try { await supabase.from('user_settings').upsert({ id: userId, theme, updated_at: new Date().toISOString() }); } catch {}
}

export async function insertTruck(t) {
  if (!live()) return { ...t, id: t.id || newId('t') };
  const { data, error } = await supabase.from('trucks').insert(truckToRow(t)).select().single();
  if (error) throw error;
  return truckFromRow(data);
}
export async function updateTruck(id, patch) {
  if (!live()) return patch;
  const { error } = await supabase.from('trucks').update(truckToRow({ ...patch })).eq('id', id);
  if (error) throw error;
}
export async function patchTruck(id, fields) {
  // partial update for status / docs (avoids overwriting unspecified columns)
  if (!live()) return;
  const row = {};
  if ('status' in fields) row.status = fields.status;
  if ('lastCheck' in fields) row.last_check = dOut(fields.lastCheck);
  if ('photoUrl' in fields) row.photo_url = fields.photoUrl || null;
  if ('driver' in fields) row.driver = fields.driver;
  if ('odometer' in fields) row.odometer = Number(fields.odometer) || 0;
  if ('idleHrs' in fields) row.idle_hrs = Number(fields.idleHrs) || 0;
  if ('chassis' in fields) row.chassis = fields.chassis;
  if ('insuranceExp' in fields) row.insurance_exp = dOut(fields.insuranceExp);
  if ('fitnessExp' in fields) row.fitness_exp = dOut(fields.fitnessExp);
  if ('mvRegExp' in fields) row.mv_reg_exp = dOut(fields.mvRegExp);
  if ('carrierLicExp' in fields) row.carrier_lic_exp = dOut(fields.carrierLicExp);
  if ('fireExtDate' in fields) row.fire_ext_date = dOut(fields.fireExtDate);
  if (!Object.keys(row).length) return;
  const { error } = await supabase.from('trucks').update(row).eq('id', id);
  if (error) throw error;
}
export async function insertIssue(i, user) {
  if (!live()) return { ...i, id: newId('i') };
  const { data, error } = await supabase.from('issues').insert(issueToRow(i, user)).select().single();
  if (error) throw error;
  return issueFromRow(data);
}
export async function updateIssue(id, fields) {
  if (!live()) return;
  const row = {};
  if ('title' in fields) row.title = fields.title;
  if ('detail' in fields) row.detail = fields.detail;
  if ('severity' in fields) row.severity = fields.severity;
  if ('status' in fields) row.status = fields.status;
  if ('serious' in fields) row.serious = fields.serious;
  if ('oos' in fields) row.oos = fields.oos;
  if ('partsNeeded' in fields) row.parts_needed = fields.partsNeeded;
  if ('photos' in fields) row.media = fields.photos || [];
  if (!Object.keys(row).length) return;
  const { error } = await supabase.from('issues').update(row).eq('id', id);
  if (error) throw error;
}
export async function deleteIssue(id) {
  if (!live()) return;
  const { error } = await supabase.from('issues').delete().eq('id', id);
  if (error) throw error;
}
export async function insertInspection(x, user) {
  if (!live()) return { ...x, id: newId('r') };
  const { data, error } = await supabase.from('inspections').insert(inspToRow(x, user)).select().single();
  if (error) throw error;
  return inspFromRow(data);
}
export async function insertHistory(h, user) {
  if (!live()) return { ...h, id: newId('h') };
  const { data, error } = await supabase.from('service_history').insert(histToRow(h, user)).select().single();
  if (error) throw error;
  return histFromRow(data);
}
export async function insertPart(p) {
  if (!live()) return { ...p, id: newId('p') };
  const { data, error } = await supabase.from('parts').insert(partToRow(p)).select().single();
  if (error) throw error;
  return partFromRow(data);
}
export async function updatePartQty(id, qty) {
  if (!live()) return;
  const { error } = await supabase.from('parts').update({ qty }).eq('id', id);
  if (error) throw error;
}
export async function insertUsage(u, user) {
  if (!live()) return { ...u, id: newId('us') };
  const { data, error } = await supabase.from('part_usage').insert(usageToRow(u, user)).select().single();
  if (error) throw error;
  return usageFromRow(data);
}
export async function insertInvoice(v) {
  if (!live()) return { ...v, id: newId('inv') };
  const { data, error } = await supabase.from('invoices').insert(invToRow(v)).select().single();
  if (error) throw error;
  return invFromRow(data);
}
export async function updateInvoiceStatus(id, status) {
  if (!live()) return;
  const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
  if (error) throw error;
}
export async function insertFleet(f) {
  if (!live()) return f;
  const { data, error } = await supabase.from('fleets').insert({ id: f.id, name: f.name, full_name: f.full }).select().single();
  if (error) throw error;
  return fleetFromRow(data);
}
