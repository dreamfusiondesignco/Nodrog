import React, { useState, useEffect, useMemo } from 'react';
import { FLEETS, ACCENT2_OPTIONS, fleetRegistry } from './data.js';
import { isSupabaseConfigured } from './lib/supabase.js';
import { restoreSession, signOut as authSignOut } from './lib/auth.js';
import { C, applyTheme, PhoneFrame, Icon } from './ui.jsx';
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
  applyTheme(t.theme, t.accent2);

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

  // Restore a Supabase session on load (keeps users signed in across refreshes).
  // If the backend is connected but there's no valid session, sign out locally.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    restoreSession().then((u) => { if (active) setUser(u); });
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
  const addTruck = (d) => {
    const id = 't' + Date.now();
    const odo = +d.odometer || 0;
    const idle = +d.idleHrs || 0;
    const truck = {
      id, fleet: d.fleet, plate: d.plate, model: d.model || '', segment: d.segment || '',
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
    setTrucks((arr) => [truck, ...arr]);
    showToast(`Truck ${d.plate} added`);
    go('truck', id);
  };
  const saveIssue = ({ truckId, title, detail, severity, serious, oos, partsNeeded, media }) => {
    setIssues((arr) => [{ id: 'i' + Date.now(), fleet: trucks.find((t2) => t2.id === truckId).fleet, truckId, title, detail, severity, status: 'open', date: today, by: user.name, serious, oos, partsNeeded, photos: media || [] }, ...arr]);
    if (oos) setTrucks((arr) => arr.map((tr) => tr.id === truckId ? { ...tr, status: 'oos' } : tr));
    showToast(oos ? 'Issue saved · truck taken out of service' : 'Issue logged');
    go(route.param ? 'truck' : 'issues', route.param);
  };
  const saveCheck = (truckId, payload) => {
    const tr = trucks.find((x) => x.id === truckId);
    const attn = payload.attn || 0;
    setInspections((arr) => [{ id: 'r' + Date.now(), truckId, fleet: tr.fleet, date: today, by: user.name, attn, missing: payload.missing || '', general: payload.general || '', results: payload.results || {}, notes: payload.notes || {} }, ...arr]);
    setTrucks((arr) => arr.map((x) => x.id === truckId ? { ...x, status: x.status === 'oos' ? 'oos' : (attn ? 'due' : 'ok'), lastCheck: today } : x));
    showToast(attn ? `Check saved · ${attn} item(s) flagged` : 'Weekly check completed');
    go('truck', truckId);
  };
  const toggleOOS = (truck) => {
    const goingOut = truck.status !== 'oos';
    setTrucks((arr) => arr.map((tr) => tr.id === truck.id ? { ...tr, status: goingOut ? 'oos' : 'due' } : tr));
    showToast(goingOut ? `${truck.plate} taken out of service` : `${truck.plate} returned to duty`);
  };
  const adjustPart = (id, d) => setParts((arr) => arr.map((p) => p.id === id ? { ...p, qty: Math.max(0, p.qty + d) } : p));
  const addPart = (p) => { setParts((arr) => [{ id: 'p' + Date.now(), ...p }, ...arr]); showToast(`Part "${p.name}" added`); go('inventory'); };
  const addFleet = (f) => {
    if (fleets[f.id]) { showToast('That fleet already exists'); return; }
    setFleets((m) => ({ ...m, [f.id]: f })); showToast(`Fleet "${f.name}" created`);
  };
  const addInvoice = (inv) => {
    const num = 'NL-' + (1044 + invoices.length + 1);
    setInvoices((arr) => [{ id: 'inv' + Date.now(), number: num, status: 'draft', date: today, ...inv }, ...arr]);
    showToast(`Invoice ${num} created`); go('invoices');
  };
  const setInvoiceStatus = (id, status) => { setInvoices((arr) => arr.map((i) => i.id === id ? { ...i, status } : i)); showToast(`Invoice marked ${status}`); };
  const recordUsage = (truckId, { partId, qty, date, note }) => {
    setUsage((arr) => [{ id: 'us' + Date.now(), partId, truckId, qty, date, by: user.name, note }, ...arr]);
    setParts((arr) => arr.map((p) => p.id === partId ? { ...p, qty: Math.max(0, p.qty - qty) } : p));
    showToast('Part recorded · stock updated');
    go('truck', truckId);
  };
  const updateTruckDocs = (truckId, fields) => { setTrucks((arr) => arr.map((tr) => tr.id === truckId ? { ...tr, ...fields } : tr)); showToast('Documents updated'); go('truck', truckId); };
  const addService = (truckId, rec) => { setHistory((arr) => [{ id: 'h' + Date.now(), truckId, by: user.name, ...rec }, ...arr]); showToast('Service record added'); go('truck', truckId); };

  const Tweaks = (
    <TweaksPanel>
      <TweakSection label="Visual direction" />
      <TweakRadio label="Theme" value={t.theme} options={['navy', 'midnight', 'hivis']} onChange={(v) => setTweak('theme', v)} />
      <TweakColor label="Accent (orange)" value={t.accent2} options={ACCENT2_OPTIONS} onChange={(v) => setTweak('accent2', v)} />
      <TweakSection label="Typography" />
      <TweakRadio label="Font" value={t.font} options={['jakarta', 'plex', 'system']} onChange={(v) => setTweak('font', v)} />
    </TweaksPanel>
  );

  if (!user) return <PhoneFrame brandFont={FONTS[t.font]}><Login onLogin={(u) => { setUser(u); setFleet('ALL'); go('dashboard'); }} />{Tweaks}</PhoneFrame>;

  const canEdit = true;
  let screen;
  switch (route.name) {
    case 'trucks': screen = <Trucks fleet={fleet} multiFleet={multiFleet} fleetIds={myFleets} trucks={vTrucks} go={go} canEdit={canEdit} />; break;
    case 'newtruck': screen = <NewTruck fleetIds={myFleets} onSave={addTruck} go={go} />; break;
    case 'truck': { const tr = trucks.find((x) => x.id === route.param); screen = tr ? <TruckDetail truck={tr} issues={issues} usage={usage} parts={parts} history={history} go={go} onToggleOOS={toggleOOS} canEdit={canEdit} /> : <Trucks fleet={fleet} multiFleet={multiFleet} fleetIds={myFleets} trucks={vTrucks} go={go} canEdit={canEdit} />; break; }
    case 'issues': screen = <Issues trucks={trucks} issues={vIssues} go={go} canEdit={canEdit} />; break;
    case 'newissue': screen = <NewIssue trucks={vTrucks} preTruck={route.param} onSave={saveIssue} go={go} />; break;
    case 'inventory': screen = <Inventory parts={vParts} multiFleet={multiFleet} fleetIds={myFleets} go={go} onAdjust={adjustPart} canEdit={canEdit} />; break;
    case 'newpart': screen = <NewPart fleetIds={myFleets} onSave={addPart} go={go} />; break;
    case 'newcheck': screen = <NewCheck truck={trucks.find((x) => x.id === route.param)} onSave={saveCheck} go={go} />; break;
    case 'usepart': screen = <NewUsage truck={trucks.find((x) => x.id === route.param)} parts={vParts} onSave={recordUsage} go={go} />; break;
    case 'editdocs': screen = <EditDocs truck={trucks.find((x) => x.id === route.param)} onSave={updateTruckDocs} go={go} />; break;
    case 'newservice': screen = <NewService truck={trucks.find((x) => x.id === route.param)} onSave={addService} go={go} />; break;
    case 'reports': screen = <Reports trucks={vTrucks} issues={vIssues} parts={vParts} fleet={fleet} go={go} />; break;
    case 'weeklyreports': screen = <WeeklyReports inspections={vInspections} trucks={trucks} go={go} />; break;
    case 'report': { const r = inspections.find((x) => x.id === route.param); screen = r ? <ReportDetail report={r} trucks={trucks} go={go} /> : <WeeklyReports inspections={vInspections} trucks={trucks} go={go} />; break; }
    case 'fleets': screen = <ManageFleets fleets={fleets} trucks={trucks} parts={parts} onAdd={addFleet} go={go} />; break;
    case 'invoices': screen = <Invoices invoices={vInvoices} trucks={trucks} go={go} />; break;
    case 'invoice': { const inv = invoices.find((x) => x.id === route.param); screen = inv ? <InvoiceDetail invoice={inv} trucks={trucks} onStatus={setInvoiceStatus} go={go} /> : <Invoices invoices={vInvoices} trucks={trucks} go={go} />; break; }
    case 'newinvoice': screen = <NewInvoice fleetIds={myFleets} trucks={vTrucks} onSave={addInvoice} go={go} />; break;
    case 'more': screen = <MoreHub user={user} fleet={fleet} onFleet={setFleet} fleetIds={myFleets} multiFleet={multiFleet} fleetCount={Object.keys(fleets).length} inspections={vInspections} invoices={vInvoices} go={go} />; break;
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px 8px', background: C.surface, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <Logo size={30} light={t.theme === 'midnight'} />
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
      {Tweaks}
    </PhoneFrame>
  );
}
