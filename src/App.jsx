import React, { useState, useEffect, useMemo } from 'react';
import { FLEETS, ACCENT2_OPTIONS, fleetRegistry } from './data.js';
import { isSupabaseConfigured } from './lib/supabase.js';
import { restoreSession, signOut as authSignOut } from './lib/auth.js';
import * as db from './lib/db.js';
import { C, applyTheme, PhoneFrame, Icon, InstallPrompt } from './ui.jsx';
import { Logo, Login, Dashboard, Trucks, TruckDetail, NewTruck } from './screens/core.jsx';
import { IssueCard, Issues, NewIssue, Inventory, NewCheck, Reports } from './screens/forms.jsx';
import { MoreHub, NewPart, ManageFleets, WeeklyReports, ReportDetail, Invoices, InvoiceDetail, NewInvoice, NewUsage, EditDocs, NewService } from './screens/admin.jsx';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor } from './tweaks-panel.jsx';

const FONTS = {
  jakarta: "'Plus Jakarta Sans', system-ui, sans-serif",
  plex: "'IBM Plex Sans', system-ui, sans-serif",
  system: "system-ui, -apple-system, 'Segoe UI', sans-serif",
};

const TWEAK_DEFAULTS = { theme: 'navy', accent2: '#F4842B', font: 'jakarta' };

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

  // Restore a Supabase session on load (keeps users signed in across refreshes),
  // then pull fresh data. If the backend is connected but there's no session, log out.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    (async () => {
      const u = await restoreSession();
      if (!active) return;
      setUser(u);
      if (u) await loadData();
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => LS.set('nm_user', user), [user]);
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
    if (['reports', 'weeklyreports', 'invoices', 'fleets', 'newpart', 'report', 'invoice', 'newinvoice'].includes(name)) setTab('more');
    document.querySelector('#scroll')?.scrollTo(0, 0);
  };
  const showToast = (m) => { setToast(m); clearTimeout(window.__tt); window.__tt = setTimeout(() => setToast(''), 2400); };

  const today = new Date().toISOString().slice(0, 10);
  const fail = (msg, e) => showToast(`${msg}${e?.message ? ': ' + e.message : ''}`);

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
      const photos = await db.uploadMedia(media || [], user.id);
      const saved = await db.insertIssue({ fleet: tr.fleet, truckId, title, detail, severity, status: 'open', date: today, by: user.name, serious, oos, partsNeeded, photos }, user);
      setIssues((arr) => [saved, ...arr]);
      if (oos) { await db.patchTruck(truckId, { status: 'oos' }); setTrucks((arr) => arr.map((t2) => t2.id === truckId ? { ...t2, status: 'oos' } : t2)); }
      showToast(oos ? 'Issue saved · truck taken out of service' : 'Issue logged');
      go(route.param ? 'truck' : 'issues', route.param);
    } catch (e) { fail('Could not save issue', e); }
  };
  const saveCheck = async (truckId, payload) => {
    try {
      const tr = trucks.find((x) => x.id === truckId);
      const attn = payload.attn || 0;
      const media = await db.uploadMedia(payload.media || [], user.id);
      const saved = await db.insertInspection({ truckId, fleet: tr.fleet, date: today, by: user.name, attn, missing: payload.missing || '', general: payload.general || '', results: payload.results || {}, notes: payload.notes || {}, media }, user);
      setInspections((arr) => [saved, ...arr]);
      const status = tr.status === 'oos' ? 'oos' : (attn ? 'due' : 'ok');
      await db.patchTruck(truckId, { status, lastCheck: today });
      setTrucks((arr) => arr.map((x) => x.id === truckId ? { ...x, status, lastCheck: today } : x));
      showToast(attn ? `Check saved · ${attn} item(s) flagged` : 'Weekly check completed');
      go('truck', truckId);
    } catch (e) { fail('Could not save check', e); }
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
    try { await db.patchTruck(truckId, fields); showToast('Documents updated'); } catch (e) { fail('Could not save documents', e); }
    go('truck', truckId);
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

  if (!user) return <PhoneFrame brandFont={FONTS[t.font]}><Login onLogin={async (u) => { setUser(u); setFleet('ALL'); go('dashboard'); await loadData(); }} /><InstallPrompt />{Tweaks}</PhoneFrame>;

  const canEdit = true;            // operational actions (checks, issues, parts) — any signed-in user
  const isAdmin = !!user.admin;    // truck create/edit + invoices/fleets — admins only
  let screen;
  switch (route.name) {
    case 'trucks': screen = <Trucks fleet={fleet} multiFleet={multiFleet} fleetIds={myFleets} trucks={vTrucks} go={go} canEdit={isAdmin} />; break;
    case 'newtruck': screen = isAdmin ? <NewTruck fleetIds={myFleets} onSave={addTruck} go={go} /> : <Trucks fleet={fleet} multiFleet={multiFleet} fleetIds={myFleets} trucks={vTrucks} go={go} canEdit={isAdmin} />; break;
    case 'truck': { const tr = trucks.find((x) => x.id === route.param); screen = tr ? <TruckDetail truck={tr} issues={issues} usage={usage} parts={parts} history={history} go={go} onToggleOOS={toggleOOS} canEdit={canEdit} canEditTruck={isAdmin} /> : <Trucks fleet={fleet} multiFleet={multiFleet} fleetIds={myFleets} trucks={vTrucks} go={go} canEdit={isAdmin} />; break; }
    case 'issues': screen = <Issues trucks={trucks} issues={vIssues} go={go} canEdit={canEdit} />; break;
    case 'newissue': screen = <NewIssue trucks={vTrucks} preTruck={route.param} onSave={saveIssue} go={go} />; break;
    case 'inventory': screen = <Inventory parts={vParts} multiFleet={multiFleet} fleetIds={myFleets} go={go} onAdjust={adjustPart} canEdit={canEdit} />; break;
    case 'newpart': screen = <NewPart fleetIds={myFleets} onSave={addPart} go={go} />; break;
    case 'newcheck': screen = <NewCheck truck={trucks.find((x) => x.id === route.param)} onSave={saveCheck} go={go} />; break;
    case 'usepart': screen = <NewUsage truck={trucks.find((x) => x.id === route.param)} parts={vParts} onSave={recordUsage} go={go} />; break;
    case 'editdocs': screen = isAdmin ? <EditDocs truck={trucks.find((x) => x.id === route.param)} onSave={updateTruckDocs} go={go} /> : <TruckDetail truck={trucks.find((x) => x.id === route.param)} issues={issues} usage={usage} parts={parts} history={history} go={go} onToggleOOS={toggleOOS} canEdit={canEdit} canEditTruck={isAdmin} />; break;
    case 'newservice': screen = <NewService truck={trucks.find((x) => x.id === route.param)} onSave={addService} go={go} />; break;
    case 'reports': screen = <Reports trucks={vTrucks} issues={vIssues} parts={vParts} fleet={fleet} go={go} />; break;
    case 'weeklyreports': screen = <WeeklyReports inspections={vInspections} trucks={trucks} go={go} />; break;
    case 'report': { const r = inspections.find((x) => x.id === route.param); screen = r ? <ReportDetail report={r} trucks={trucks} go={go} /> : <WeeklyReports inspections={vInspections} trucks={trucks} go={go} />; break; }
    case 'fleets': screen = <ManageFleets fleets={fleets} trucks={trucks} parts={parts} onAdd={addFleet} go={go} />; break;
    case 'invoices': screen = <Invoices invoices={vInvoices} trucks={trucks} go={go} />; break;
    case 'invoice': { const inv = invoices.find((x) => x.id === route.param); screen = inv ? <InvoiceDetail invoice={inv} trucks={trucks} onStatus={setInvoiceStatus} go={go} /> : <Invoices invoices={vInvoices} trucks={trucks} go={go} />; break; }
    case 'newinvoice': screen = <NewInvoice fleetIds={myFleets} trucks={vTrucks} onSave={addInvoice} go={go} />; break;
    case 'more': screen = <MoreHub user={user} fleet={fleet} onFleet={setFleet} fleetIds={myFleets} multiFleet={multiFleet} fleetCount={Object.keys(fleets).length} inspections={vInspections} invoices={vInvoices} go={go} theme={userTheme} onTheme={setUserTheme} />; break;
    default: screen = <Dashboard user={user} fleet={fleet} trucks={vTrucks} issues={vIssues} parts={vParts} go={go} />;
  }

  const nav = [
    { id: 'dashboard', icon: 'home', label: 'Home' },
    { id: 'trucks', icon: 'truck', label: 'Trucks' },
    { id: 'issues', icon: 'alert', label: 'Issues' },
    { id: 'inventory', icon: 'box', label: 'Stock' },
    { id: 'more', icon: 'dots', label: 'More' },
  ];

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
          <button onClick={async () => { if (confirm('Sign out?')) { await authSignOut(); setUser(null); go('dashboard'); } }} aria-label="Sign out" style={{ width: 38, height: 38, borderRadius: 999, border: `1px solid ${C.border}`, background: C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.mutedFg }}>
            <Icon name="logout" size={17} />
          </button>
        </div>
      </div>

      <div id="scroll" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 18 }}>{screen}</div>

      {toast && (
        <div style={{ position: 'absolute', bottom: 84, left: '50%', transform: 'translateX(-50%)', background: C.primary, color: '#fff', padding: '11px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,0,0,.35)', maxWidth: '90%', zIndex: 30 }}>
          <Icon name="checkc" size={16} color={C.accent2} /> {toast}
        </div>
      )}

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
