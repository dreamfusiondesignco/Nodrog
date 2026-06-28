import React, { useState, useEffect, useMemo } from 'react';
import { FLEETS, ACCENT2_OPTIONS, fleetRegistry } from './data.js';
import { isSupabaseConfigured } from './lib/supabase.js';
import { restoreSession, signOut as authSignOut } from './lib/auth.js';
import * as db from './lib/db.js';
import { C, applyTheme, PhoneFrame, Icon, InstallPrompt } from './ui.jsx';
import { Logo, Login, Dashboard, Trucks, TruckDetail, NewTruck } from './screens/core.jsx';
import { IssueCard, Issues, NewIssue, EditIssue, Inventory, NewCheck, Reports } from './screens/forms.jsx';
import { MoreHub, NewPart, ManageFleets, WeeklyReports, ReportDetail, Invoices, InvoiceDetail, NewInvoice, NewUsage, EditDocs, NewService } from './screens/admin.jsx';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor } from './tweaks-panel.jsx';

const FONTS = {
  jakarta: "'Plus Jakarta Sans', system-ui, sans-serif",
  plex: "'IBM Plex Sans', system-ui, sans-serif",
  system: "system-ui, -apple-system, 'Segoe UI', sans-serif",
};

const TWEAK_DEFAULTS = { theme: 'navy', accent2: '#F4842B', font: 'jakarta' };
const THEMES_KEYS = ['navy', 'midnight', 'hivis'];

const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

export default function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // User-selectable theme (persisted), independent of the design-tool tweaks panel.
  const [userTheme, setUserTheme] = useState(() => LS.get('nm_theme', TWEAK_DEFAULTS.theme));
  applyTheme(userTheme, t.accent2);
  useEffect(() => LS.set('nm_theme', userTheme), [userTheme]);

  const [user, setUser] = useState(() => LS.get('nm_user', null));
  const [fleet, setFleet] = useState('ALL');
  const [route, setRoute] = useState({ name: 'dashboard', param: null });
  const [tab, setTab] = useState('dashboard');
  const [toast, setToast] = useState('');
  // Tablet/desktop (≥760px wide and tall enough) get the sidebar layout; phones keep the bottom nav.
  const [desktop, setDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 760 && window.innerHeight >= 640);

  const [fleets, setFleets] = useState(() => LS.get('nm_fleets', FLEETS));
  const [trucks, setTrucks] = useState(() => LS.get('nm_trucks', []));
  const [issues, setIssues] = useState(() => LS.get('nm_issues', []));
  const [parts, setParts] = useState(() => LS.get('nm_parts', []));
  const [inspections, setInspections] = useState(() => LS.get('nm_inspections', []));
  const [invoices, setInvoices] = useState(() => LS.get('nm_invoices', []));
  const [usage, setUsage] = useState(() => LS.get('nm_usage', []));
  const [history, setHistory] = useState(() => LS.get('nm_history', []));

  // keep the shared mutable registry in sync so every screen sees admin-created fleets
  Object.assign(fleetRegistry, fleets);

  // Pull every collection from Supabase (no-op in local/demo mode).
  const loadData = async () => {
    const data = await db.loadAll();
    if (!data) return; // local mode → keep localStorage state
    setFleets((prev) => ({ ...prev, ...data.fleets }));
    setTrucks(data.trucks); setParts(data.parts); setUsage(data.usage);
    setIssues(data.issues); setInspections(data.inspections);
    setHistory(data.history); setInvoices(data.invoices);
  };

  // Load the user's saved theme (cross-device) and apply it.
  const loadUserTheme = async (u) => {
    if (!u) return;
    const s = await db.loadUserSettings(u.id);
    if (s?.theme && THEMES_KEYS.includes(s.theme)) { setUserTheme(s.theme); LS.set('nm_theme', s.theme); }
  };
  // User picks a theme → apply instantly, cache locally, and persist to their account.
  const chooseTheme = (themeKey) => {
    setUserTheme(themeKey);
    LS.set('nm_theme', themeKey);
    if (user) db.saveTheme(user.id, themeKey);
  };

  // Restore a Supabase session on load (keeps users signed in across refreshes),
  // then pull fresh data + the user's saved theme.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    (async () => {
      const u = await restoreSession();
      if (!active) return;
      setUser(u);
      if (u) { await loadData(); await loadUserTheme(u); }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => LS.set('nm_user', user), [user]);
  useEffect(() => {
    const f = () => setDesktop(window.innerWidth >= 760 && window.innerHeight >= 640);
    window.addEventListener('resize', f); return () => window.removeEventListener('resize', f);
  }, []);
  useEffect(() => LS.set('nm_fleets', fleets), [fleets]);
  useEffect(() => LS.set('nm_trucks', trucks), [trucks]);
  useEffect(() => LS.set('nm_issues', issues), [issues]);
  useEffect(() => LS.set('nm_parts', parts), [parts]);
  useEffect(() => LS.set('nm_inspections', inspections), [inspections]);
  useEffect(() => LS.set('nm_invoices', invoices), [invoices]);
  useEffect(() => LS.set('nm_usage', usage), [usage]);
  useEffect(() => LS.set('nm_history', history), [history]);

  const myFleets = !user ? [] : (user.access === '*' ? Object.keys(fleets) : user.access);
  const multiFleet = myFleets.length > 1;
  const canSee = (f) => !user ? true : (f === 'SHARED' || user.access === '*' || user.access.includes(f));

  const scope = (arr, fld = 'fleet') => arr.filter((x) => {
    const okAccess = canSee(x[fld]);
    const okFleet = fleet === 'ALL' ? true : (x[fld] === fleet || x[fld] === 'SHARED');
    return okAccess && okFleet;
  });
  const vTrucks = useMemo(() => scope(trucks), [trucks, fleet, user, fleets]);
  const vIssues = useMemo(() => { const ids = new Set(vTrucks.map((x) => x.id)); return issues.filter((i) => ids.has(i.truckId)); }, [issues, vTrucks]);
  const vParts = useMemo(() => scope(parts), [parts, fleet, user, fleets]);
  const vInspections = useMemo(() => scope(inspections), [inspections, fleet, user, fleets]);
  const vInvoices = useMemo(() => scope(invoices), [invoices, fleet, user, fleets]);

  const go = (name, param = null) => {
    setRoute({ name, param });
    if (['dashboard', 'trucks', 'issues', 'inventory', 'more'].includes(name)) setTab(name);
    if (['newtruck', 'truck', 'newcheck', 'usepart', 'editdocs', 'newservice'].includes(name)) setTab('trucks');
    if (['reports', 'weeklyreports', 'invoices', 'fleets', 'newpart', 'report', 'editcheck', 'invoice', 'newinvoice'].includes(name)) setTab('more');
    document.querySelector('#scroll')?.scrollTo(0, 0);
  };
  const showToast = (m) => { setToast(m); clearTimeout(window.__tt); window.__tt = setTimeout(() => setToast(''), 2400); };

  const today = new Date().toISOString().slice(0, 10);
  const fail = (msg, e) => { console.error(msg, e); showToast(`${msg}${e?.message ? ': ' + e.message : ''}`); };

  const addTruck = async (d) => {
    const odo = +d.odometer || 0;
    const idle = +d.idleHrs || 0;
    const base = {
      fleet: d.fleet, plate: d.plate, model: d.model || '', segment: d.segment || '',
      chassis: d.chassis || '', capacity: d.capacity || '', driver: d.driver || '', location: d.location || '',
      status: 'ok', odometer: odo, idleHrs: idle, lastCheck: '',
      service: {
        engine: { lastMiles: odo, lastIdleHrs: idle, date: '', nextDueMiles: odo + 8000, nextDueHrs: idle + 500 },
        transmission: { lastMiles: odo, lastIdleHrs: idle, date: '' },
        airFilter: { lastMiles: odo, date: '' },
        frontDiff: { lastMiles: odo, lastIdleHrs: idle, date: '' },
        rearDiff: { lastMiles: odo, lastIdleHrs: idle, date: '' },
      },
      fireExtDate: '', insuranceExp: '', fitnessExp: '', mvRegExp: '', carrierLicExp: '',
    };
    try { const saved = await db.insertTruck(base); setTrucks((arr) => [saved, ...arr]); showToast(`Truck ${saved.plate} added`); go('truck', saved.id); }
    catch (e) { fail('Could not save truck', e); }
  };
  const saveIssue = async ({ truckId, title, detail, severity, serious, oos, partsNeeded, media }) => {
    try {
      const tr = trucks.find((t2) => t2.id === truckId);
      const { items: photos, failed } = await db.uploadMedia(media || [], user.id);
      const saved = await db.insertIssue({ fleet: tr.fleet, truckId, title, detail, severity, status: 'open', date: today, by: user.name, serious, oos, partsNeeded, photos }, user);
      setIssues((arr) => [saved, ...arr]);
      if (oos) {
        // optimistic + non-blocking so a slow/failed truck update never blocks navigation
        setTrucks((arr) => arr.map((t2) => t2.id === truckId ? { ...t2, status: 'oos' } : t2));
        db.patchTruck(truckId, { status: 'oos' }).catch((e) => console.error('OOS truck update failed', e));
      }
      showToast(failed ? `Issue saved · ${failed} photo(s) couldn't upload` : (oos ? 'Issue saved · truck out of service' : 'Issue logged'));
      go('issues');
    } catch (e) { fail('Could not save issue', e); }
  };
  const editIssue = async (id, fields) => {
    try {
      let { media, ...rest } = fields;
      let failed = 0;
      if (media) { const r = await db.uploadMedia(media, user.id); media = r.items; failed = r.failed; }
      const patch = { ...rest };
      if (media) patch.photos = media;
      setIssues((arr) => arr.map((i) => i.id === id ? { ...i, ...patch } : i));
      await db.updateIssue(id, patch);
      // if marked OOS in the edit, reflect it on the truck (non-blocking)
      const iss = issues.find((x) => x.id === id);
      if (patch.oos && iss) { setTrucks((arr) => arr.map((t2) => t2.id === iss.truckId ? { ...t2, status: 'oos' } : t2)); db.patchTruck(iss.truckId, { status: 'oos' }).catch((e) => console.error(e)); }
      showToast(failed ? `Issue updated · ${failed} photo(s) couldn't upload` : 'Issue updated');
      go('issues');
    } catch (e) { fail('Could not update issue', e); }
  };
  const removeIssue = async (id) => {
    setIssues((arr) => arr.filter((i) => i.id !== id));
    try { await db.deleteIssue(id); showToast('Issue deleted'); } catch (e) { fail('Could not delete issue', e); }
    go('issues');
  };
  const removeIssues = async (ids) => {
    if (!ids || !ids.length) return;
    const set = new Set(ids);
    setIssues((arr) => arr.filter((i) => !set.has(i.id)));
    try { await Promise.all(ids.map((id) => db.deleteIssue(id))); showToast(`${ids.length} issue${ids.length > 1 ? 's' : ''} deleted`); }
    catch (e) { fail('Could not delete issues', e); }
  };
  // Turn a check's flagged ("needs attention") items into open issues on the truck.
  // Skips items that already have an open issue so weekly re-checks don't duplicate.
  const createIssuesFromCheck = async (truck, results, notes) => {
    if (!truck) return 0;
    const flagged = Object.keys(results || {}).filter((k) => results[k] === 'attn');
    if (!flagged.length) return 0;
    const openTitles = new Set(issues.filter((i) => i.truckId === truck.id && i.status === 'open').map((i) => i.title));
    let created = 0;
    for (const key of flagged) {
      if (openTitles.has(key)) continue;
      try {
        const saved = await db.insertIssue({ fleet: truck.fleet, truckId: truck.id, title: key, detail: (notes && notes[key]) || 'Flagged during the weekly inspection.', severity: 'medium', status: 'open', serious: false, oos: false, partsNeeded: '', date: today, by: user.name }, user);
        setIssues((arr) => [saved, ...arr]);
        openTitles.add(key);
        created++;
      } catch (e) { console.error('Could not create issue from check', e); }
    }
    return created;
  };
  const saveCheck = async (truckId, payload) => {
    try {
      const tr = trucks.find((x) => x.id === truckId);
      const attn = payload.attn || 0;
      const { items: media } = await db.uploadMedia(payload.media || [], user.id);
      const saved = await db.insertInspection({ truckId, fleet: tr.fleet, date: today, by: user.name, attn, missing: payload.missing || '', general: payload.general || '', results: payload.results || {}, notes: payload.notes || {}, media }, user);
      setInspections((arr) => [saved, ...arr]);
      const status = tr.status === 'oos' ? 'oos' : (attn ? 'due' : 'ok');
      // Capture the readings taken at this inspection onto the truck — never as service history.
      const upd = { status, lastCheck: today };
      if (payload.odometer) upd.odometer = +payload.odometer;
      if (payload.idleHrs) upd.idleHrs = +payload.idleHrs;
      setTrucks((arr) => arr.map((x) => x.id === truckId ? { ...x, ...upd } : x));
      db.patchTruck(truckId, upd).catch((e) => console.error('Truck status update failed', e));
      const made = await createIssuesFromCheck(tr, payload.results, payload.notes);
      showToast(attn ? `Check saved · ${attn} flagged${made ? ` · ${made} issue${made > 1 ? 's' : ''} logged` : ''}` : 'Weekly check completed');
      go('truck', truckId);
    } catch (e) { fail('Could not save check', e); }
  };
  const editCheck = async (id, payload) => {
    try {
      const insp = inspections.find((x) => x.id === id);
      const attn = payload.attn || 0;
      const { items: media, failed } = await db.uploadMedia(payload.media || [], user.id);
      const patch = { attn, missing: payload.missing || '', general: payload.general || '', results: payload.results || {}, notes: payload.notes || {}, media };
      setInspections((arr) => arr.map((x) => x.id === id ? { ...x, ...patch } : x));
      await db.updateInspection(id, patch);
      // reflect the (possibly changed) flag count + readings on the truck, like a fresh check
      let made = 0;
      if (insp) {
        const tr = trucks.find((x) => x.id === insp.truckId);
        const status = tr?.status === 'oos' ? 'oos' : (attn ? 'due' : 'ok');
        const upd = { status };
        if (payload.odometer) upd.odometer = +payload.odometer;
        if (payload.idleHrs) upd.idleHrs = +payload.idleHrs;
        setTrucks((arr) => arr.map((x) => x.id === insp.truckId ? { ...x, ...upd } : x));
        db.patchTruck(insp.truckId, upd).catch((e) => console.error('Truck update failed', e));
        made = await createIssuesFromCheck(tr, payload.results, payload.notes);
      }
      showToast(failed ? `Check updated · ${failed} photo(s) couldn't upload` : (made ? `Check updated · ${made} new issue${made > 1 ? 's' : ''} logged` : 'Weekly check updated'));
      go('report', id);
    } catch (e) { fail('Could not update check', e); }
  };
  const toggleOOS = async (truck) => {
    const goingOut = truck.status !== 'oos';
    const status = goingOut ? 'oos' : 'due';
    setTrucks((arr) => arr.map((tr) => tr.id === truck.id ? { ...tr, status } : tr));
    try { await db.patchTruck(truck.id, { status }); showToast(goingOut ? `${truck.plate} taken out of service` : `${truck.plate} returned to duty`); }
    catch (e) { fail('Could not update status', e); }
  };
  const adjustPart = async (id, d) => {
    const p = parts.find((x) => x.id === id); if (!p) return;
    const qty = Math.max(0, p.qty + d);
    setParts((arr) => arr.map((x) => x.id === id ? { ...x, qty } : x));
    try { await db.updatePartQty(id, qty); } catch (e) { fail('Stock update failed', e); }
  };
  const addPart = async (p) => {
    try { const saved = await db.insertPart({ ...p }); setParts((arr) => [saved, ...arr]); showToast(`Part "${saved.name}" added`); go('inventory'); }
    catch (e) { fail('Could not add part', e); }
  };
  const addFleet = async (f) => {
    if (fleets[f.id]) { showToast('That fleet already exists'); return; }
    try { const saved = await db.insertFleet(f); setFleets((m) => ({ ...m, [saved.id]: saved })); showToast(`Fleet "${saved.name}" created`); }
    catch (e) { fail('Could not add fleet', e); }
  };
  const addInvoice = async (inv) => {
    const num = 'NL-' + (1044 + invoices.length + 1);
    try { const saved = await db.insertInvoice({ number: num, status: 'draft', date: today, ...inv }); setInvoices((arr) => [saved, ...arr]); showToast(`Invoice ${saved.number} created`); go('invoices'); }
    catch (e) { fail('Could not create invoice', e); }
  };
  const setInvoiceStatus = async (id, status) => {
    setInvoices((arr) => arr.map((i) => i.id === id ? { ...i, status } : i));
    try { await db.updateInvoiceStatus(id, status); showToast(`Invoice marked ${status}`); }
    catch (e) { fail('Status update failed', e); }
  };
  const recordUsage = async (truckId, { partId, qty, date, note }) => {
    try {
      const saved = await db.insertUsage({ partId, truckId, qty, date, by: user.name, note }, user);
      setUsage((arr) => [saved, ...arr]);
      const p = parts.find((x) => x.id === partId);
      if (p) { const nq = Math.max(0, p.qty - qty); setParts((arr) => arr.map((x) => x.id === partId ? { ...x, qty: nq } : x)); await db.updatePartQty(partId, nq); }
      showToast('Part recorded · stock updated');
      go('truck', truckId);
    } catch (e) { fail('Could not record part', e); }
  };
  const updateTruckDocs = async (truckId, fields) => {
    setTrucks((arr) => arr.map((tr) => tr.id === truckId ? { ...tr, ...fields } : tr));
    try { await db.patchTruck(truckId, fields); showToast('Truck details updated'); } catch (e) { fail('Could not save details', e); }
    go('truck', truckId);
  };
  const setTruckPhoto = async (truckId, dataUrl) => {
    // optimistic: show the new photo right away; the component also caches it locally
    setTrucks((arr) => arr.map((tr) => tr.id === truckId ? { ...tr, photoUrl: dataUrl } : tr));
    try {
      const url = await db.uploadImage(dataUrl, user.id); // → durable Storage URL (live) or the data URL (local)
      if (url) {
        setTrucks((arr) => arr.map((tr) => tr.id === truckId ? { ...tr, photoUrl: url } : tr));
        await db.patchTruck(truckId, { photoUrl: url });  // persist so it loads on every device
        showToast('Truck photo updated');
      } else {
        showToast('Photo saved on this device · cloud upload failed');
      }
    } catch (e) { fail('Could not save photo', e); }
  };
  const addService = async (truckId, rec) => {
    try { const saved = await db.insertHistory({ truckId, by: user.name, ...rec }, user); setHistory((arr) => [saved, ...arr]); showToast('Service record added'); go('truck', truckId); }
    catch (e) { fail('Could not add service record', e); }
  };

  const Tweaks = (
    <TweaksPanel>
      <TweakSection label="Visual direction" />
      <TweakRadio label="Theme" value={t.theme} options={['navy', 'midnight', 'hivis']} onChange={(v) => setTweak('theme', v)} />
      <TweakColor label="Accent (orange)" value={t.accent2} options={ACCENT2_OPTIONS} onChange={(v) => setTweak('accent2', v)} />
      <TweakSection label="Typography" />
      <TweakRadio label="Font" value={t.font} options={['jakarta', 'plex', 'system']} onChange={(v) => setTweak('font', v)} />
    </TweaksPanel>
  );

  if (!user) return <PhoneFrame brandFont={FONTS[t.font]}><Login onLogin={async (u) => { setUser(u); setFleet('ALL'); go('dashboard'); await loadData(); await loadUserTheme(u); }} /><InstallPrompt />{Tweaks}</PhoneFrame>;

  const canEdit = true;            // operational actions (checks, issues, parts) — any signed-in user
  const isAdmin = !!user.admin;    // truck create/edit + invoices/fleets — admins only
  let screen;
  switch (route.name) {
    case 'trucks': screen = <Trucks fleet={fleet} multiFleet={multiFleet} fleetIds={myFleets} trucks={vTrucks} go={go} canEdit={isAdmin} />; break;
    case 'newtruck': screen = isAdmin ? <NewTruck fleetIds={myFleets} onSave={addTruck} go={go} /> : <Trucks fleet={fleet} multiFleet={multiFleet} fleetIds={myFleets} trucks={vTrucks} go={go} canEdit={isAdmin} />; break;
    case 'truck': { const tr = trucks.find((x) => x.id === route.param); screen = tr ? <TruckDetail truck={tr} issues={issues} usage={usage} parts={parts} history={history} go={go} onToggleOOS={toggleOOS} onPhoto={setTruckPhoto} canEdit={canEdit} canEditTruck={isAdmin} /> : <Trucks fleet={fleet} multiFleet={multiFleet} fleetIds={myFleets} trucks={vTrucks} go={go} canEdit={isAdmin} />; break; }
    case 'issues': screen = <Issues trucks={trucks} issues={vIssues} go={go} canEdit={canEdit} onDelete={removeIssues} />; break;
    case 'newissue': screen = <NewIssue trucks={vTrucks} preTruck={route.param} onSave={saveIssue} go={go} />; break;
    case 'editissue': { const iss = issues.find((x) => x.id === route.param); screen = iss ? <EditIssue issue={iss} trucks={trucks} onSave={editIssue} onDelete={removeIssue} go={go} /> : <Issues trucks={trucks} issues={vIssues} go={go} canEdit={canEdit} />; break; }
    case 'inventory': screen = <Inventory parts={vParts} multiFleet={multiFleet} fleetIds={myFleets} go={go} onAdjust={adjustPart} canEdit={canEdit} />; break;
    case 'newpart': screen = <NewPart fleetIds={myFleets} onSave={addPart} go={go} />; break;
    case 'newcheck': screen = <NewCheck truck={trucks.find((x) => x.id === route.param)} onSave={saveCheck} go={go} />; break;
    case 'editcheck': { const insp = inspections.find((x) => x.id === route.param); const tr = insp && trucks.find((t2) => t2.id === insp.truckId); screen = (insp && tr) ? <NewCheck truck={tr} existing={insp} onSave={(_, payload) => editCheck(insp.id, payload)} go={go} /> : <WeeklyReports inspections={vInspections} trucks={trucks} go={go} />; break; }
    case 'usepart': screen = <NewUsage truck={trucks.find((x) => x.id === route.param)} parts={vParts} onSave={recordUsage} go={go} />; break;
    case 'editdocs': screen = isAdmin ? <EditDocs truck={trucks.find((x) => x.id === route.param)} onSave={updateTruckDocs} go={go} /> : <TruckDetail truck={trucks.find((x) => x.id === route.param)} issues={issues} usage={usage} parts={parts} history={history} go={go} onToggleOOS={toggleOOS} onPhoto={setTruckPhoto} canEdit={canEdit} canEditTruck={isAdmin} />; break;
    case 'newservice': screen = <NewService truck={trucks.find((x) => x.id === route.param)} onSave={addService} go={go} />; break;
    case 'reports': screen = <Reports trucks={vTrucks} issues={vIssues} parts={vParts} fleet={fleet} go={go} />; break;
    case 'weeklyreports': screen = <WeeklyReports inspections={vInspections} trucks={trucks} go={go} />; break;
    case 'report': { const r = inspections.find((x) => x.id === route.param); screen = r ? <ReportDetail report={r} trucks={trucks} go={go} canEdit={canEdit} /> : <WeeklyReports inspections={vInspections} trucks={trucks} go={go} />; break; }
    case 'fleets': screen = <ManageFleets fleets={fleets} trucks={trucks} parts={parts} onAdd={addFleet} go={go} />; break;
    case 'invoices': screen = <Invoices invoices={vInvoices} trucks={trucks} go={go} />; break;
    case 'invoice': { const inv = invoices.find((x) => x.id === route.param); screen = inv ? <InvoiceDetail invoice={inv} trucks={trucks} onStatus={setInvoiceStatus} go={go} /> : <Invoices invoices={vInvoices} trucks={trucks} go={go} />; break; }
    case 'newinvoice': screen = <NewInvoice fleetIds={myFleets} trucks={vTrucks} onSave={addInvoice} go={go} />; break;
    case 'more': screen = <MoreHub user={user} fleet={fleet} onFleet={setFleet} fleetIds={myFleets} multiFleet={multiFleet} fleetCount={Object.keys(fleets).length} inspections={vInspections} invoices={vInvoices} go={go} theme={userTheme} onTheme={chooseTheme} />; break;
    default: screen = <Dashboard user={user} fleet={fleet} trucks={vTrucks} issues={vIssues} parts={vParts} go={go} />;
  }

  const nav = [
    { id: 'dashboard', icon: 'home', label: 'Home' },
    { id: 'trucks', icon: 'truck', label: 'Trucks' },
    { id: 'issues', icon: 'alert', label: 'Issues' },
    { id: 'inventory', icon: 'box', label: 'Stock' },
    { id: 'more', icon: 'dots', label: 'More' },
  ];

  const doSignOut = async () => { if (confirm('Sign out?')) { await authSignOut(); setUser(null); go('dashboard'); } };

  const content = (
    <div id="scroll" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 18 }}>
      {desktop ? <div style={{ maxWidth: 760, margin: '0 auto', padding: '6px 8px 24px' }}>{screen}</div> : screen}
    </div>
  );

  const toastEl = toast && (
    <div style={{ position: 'absolute', bottom: desktop ? 22 : 84, ...(desktop ? { right: 22 } : { left: '50%', transform: 'translateX(-50%)' }), background: C.primary, color: '#fff', padding: '11px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,0,0,.35)', maxWidth: '90%', zIndex: 30 }}>
      <Icon name="checkc" size={16} color={C.accent2} /> {toast}
    </div>
  );

  if (desktop) {
    return (
      <PhoneFrame brandFont={FONTS[t.font]}>
        <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
          <aside style={{ width: 252, flexShrink: 0, height: '100%', background: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', padding: '20px 14px', boxSizing: 'border-box' }}>
            <div style={{ padding: '4px 8px 20px' }}><Logo size={28} light={userTheme === 'midnight'} /></div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {nav.map((n) => {
                const active = tab === n.id;
                return (
                  <button key={n.id} onClick={() => go(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', background: active ? C.accent + '14' : 'transparent', color: active ? C.accent : C.mutedFg, font: 'inherit', fontWeight: active ? 800 : 600, fontSize: 15, textAlign: 'left' }}>
                    <Icon name={n.icon} size={20} strokeWidth={active ? 2.3 : 1.9} /> {n.label}
                  </button>
                );
              })}
            </nav>
            <div style={{ flex: 1 }} />
            {multiFleet && (
              <select value={fleet} onChange={(e) => setFleet(e.target.value)} aria-label="Viewing fleet" style={{ width: '100%', minHeight: 42, borderRadius: 11, border: `1px solid ${C.border}`, padding: '0 12px', fontSize: 14, fontWeight: 700, background: C.surface, color: C.fg, boxSizing: 'border-box', cursor: 'pointer', marginBottom: 12 }}>
                <option value="ALL">All fleets</option>
                {myFleets.map((k) => <option key={k} value={k}>{fleetRegistry[k]?.name || k}</option>)}
              </select>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
              <div style={{ width: 38, height: 38, borderRadius: 999, background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="user" size={18} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: C.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ fontSize: 11.5, color: C.mutedFg }}>{user.role}</div>
              </div>
              <button onClick={doSignOut} aria-label="Sign out" style={{ width: 34, height: 34, borderRadius: 999, border: `1px solid ${C.border}`, background: C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.mutedFg, flexShrink: 0 }}><Icon name="logout" size={16} /></button>
            </div>
          </aside>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            {content}
            {toastEl}
          </div>
        </div>
        <InstallPrompt />
        {Tweaks}
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame brandFont={FONTS[t.font]}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 14px 8px', background: C.surface, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <Logo size={30} light={userTheme === 'midnight'} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {multiFleet && fleet !== 'ALL' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, border: `1px solid ${C.border}`, background: C.surface2, borderRadius: 999, padding: '6px 11px', color: C.mutedFg, whiteSpace: 'nowrap' }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: C.accent }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: C.fg }}>{fleetRegistry[fleet]?.name || fleet}</span>
            </span>
          )}
          <button onClick={doSignOut} aria-label="Sign out" style={{ width: 38, height: 38, borderRadius: 999, border: `1px solid ${C.border}`, background: C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.mutedFg }}>
            <Icon name="logout" size={17} />
          </button>
        </div>
      </div>
      {content}
      {toastEl}
      <nav style={{ display: 'flex', borderTop: `1px solid ${C.border}`, background: C.navBg, flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {nav.map((n) => {
          const active = tab === n.id;
          return (
            <button key={n.id} onClick={() => go(n.id)} style={{ flex: 1, minHeight: 62, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: active ? C.accent : C.mutedFg }}>
              <Icon name={n.icon} size={22} strokeWidth={active ? 2.3 : 1.9} />
              <span style={{ fontSize: 11, fontWeight: active ? 800 : 600 }}>{n.label}</span>
            </button>
          );
        })}
      </nav>
      <InstallPrompt />
      {Tweaks}
    </PhoneFrame>
  );
}
