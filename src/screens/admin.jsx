import React, { useState } from 'react';
import { fleetRegistry, THEMES } from '../data.js';
import { C, Icon, Badge, cardStyle, rowStyle, Field, Select, PrimaryBtn, GhostBtn, Header, SectionTitle, fmtDate, fmtNum } from '../ui.jsx';
import { FleetChip, Chip, EmptyNote } from './core.jsx';

const money = (n) => '$' + Number(n || 0).toLocaleString('en-US');
export const invTotal = (inv) => (inv.items || []).reduce((s, it) => s + (+it.qty || 0) * (+it.unit || 0), 0);
const invStatusColor = (s) => s === 'paid' ? C.ok : s === 'sent' ? C.accent : C.mutedFg;

const THEME_OPTIONS = [
  { key: 'navy', label: 'Navy' },
  { key: 'midnight', label: 'Midnight' },
  { key: 'hivis', label: 'Hi-Vis' },
];
function ThemePicker({ theme, onTheme }) {
  return (
    <div style={{ ...cardStyle(), padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Icon name="cog" size={17} color={C.accent} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: C.fg, fontSize: 14.5 }}>Appearance</div>
          <div style={{ fontSize: 12, color: C.mutedFg }}>Choose your theme</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {THEME_OPTIONS.map(({ key, label }) => {
          const th = THEMES[key];
          const active = theme === key;
          return (
            <button key={key} onClick={() => onTheme(key)} style={{
              flex: 1, cursor: 'pointer', borderRadius: 12, padding: 8, textAlign: 'center',
              border: `2px solid ${active ? C.accent : C.border}`, background: active ? C.accent + '12' : C.surface,
            }}>
              <div style={{ height: 38, borderRadius: 8, background: th.bg, border: `1px solid ${th.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 7 }}>
                <span style={{ width: 12, height: 12, borderRadius: 999, background: th.primary }} />
                <span style={{ width: 12, height: 12, borderRadius: 999, background: th.accent }} />
                <span style={{ width: 12, height: 12, borderRadius: 999, background: th.accent2 }} />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: active ? C.accent : C.fg }}>{label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MoreHub({ user, fleet, onFleet, fleetIds = [], multiFleet, fleetCount, inspections, invoices, go, theme, onTheme }) {
  const Item = ({ icon, title, desc, onClick, badge, accent }) => (
    <button onClick={onClick} style={rowStyle()}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: (accent || C.accent) + '16', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent || C.accent }}>
        <Icon name={icon} size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, color: C.fg, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.mutedFg }}>{desc}</div>
      </div>
      {badge != null && <Badge color={C.mutedFg}>{badge}</Badge>}
      <Icon name="chevron" size={18} color={C.mutedFg} />
    </button>
  );
  return (
    <div>
      <Header title="More" sub={user.admin ? 'Admin tools' : 'Records & reports'} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SectionTitle>Records</SectionTitle>
        <Item icon="clip" title="Weekly reports" desc="Review past inspection sheets" badge={inspections.length} onClick={() => go('weeklyreports')} />
        <Item icon="file" title="Reports & export" desc="Weekly summary, PDF & spreadsheet" onClick={() => go('reports')} />
        {user.admin && <>
          <SectionTitle>Admin</SectionTitle>
          <Item icon="receipt" title="Invoices" desc="Create & track repair invoices" badge={invoices.length} accent={C.accent2} onClick={() => go('invoices')} />
          <Item icon="layers" title="Manage fleets" desc="Add or edit fleets (IGL, Massy…)" badge={fleetCount} accent={C.accent2} onClick={() => go('fleets')} />
          <Item icon="box" title="Add a part" desc="Create a new inventory item" accent={C.accent2} onClick={() => go('newpart')} />
        </>}
        <SectionTitle>Account</SectionTitle>
        <div style={{ ...cardStyle(), padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 999, background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={22} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: C.fg }}>{user.name}</div>
            <div style={{ fontSize: 12, color: C.mutedFg }}>{user.role} · {user.access === '*' ? 'All fleets' : user.access.join(' + ')}{user.admin ? ' · Admin' : ''}</div>
          </div>
        </div>
        <ThemePicker theme={theme} onTheme={onTheme} />
        {multiFleet && (
          <div style={{ ...cardStyle(), padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icon name="swap" size={17} color={C.accent} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: C.fg, fontSize: 14.5 }}>Viewing fleet</div>
                <div style={{ fontSize: 12, color: C.mutedFg }}>Filters every screen to this fleet</div>
              </div>
            </div>
            <select value={fleet} onChange={(e) => onFleet(e.target.value)} style={{ width: '100%', minHeight: 48, borderRadius: 11, border: `1px solid ${C.border}`, padding: '0 12px', fontSize: 16, background: C.surface, color: C.fg, boxSizing: 'border-box', fontWeight: 700 }}>
              <option value="ALL">All fleets</option>
              {fleetIds.map((k) => <option key={k} value={k}>{fleetRegistry[k]?.full || fleetRegistry[k]?.name || k}</option>)}
            </select>
          </div>
        )}
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

export function NewPart({ fleetIds, onSave, go }) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [qty, setQty] = useState('');
  const [min, setMin] = useState('');
  return (
    <div>
      <Header title="New part" sub="Add an inventory item" onBack={() => go('inventory')} />
      <div style={{ padding: '0 16px 20px' }}>
        <Field label="Part name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Oil Filter (FVR)" />
        <Field label="SKU / part number" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. OF-204" />
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><Field label="Quantity in stock" value={qty} onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="0" /></div>
          <div style={{ flex: 1 }}><Field label="Min level (alert)" value={min} onChange={(e) => setMin(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="0" /></div>
        </div>
        <PrimaryBtn disabled={!name.trim()} onClick={() => onSave({ name, sku, qty: +qty || 0, min: +min || 0, location: '', fleet: 'SHARED' })}>
          <Icon name="check" size={18} /> Save part
        </PrimaryBtn>
      </div>
    </div>
  );
}

export function ManageFleets({ fleets, trucks, parts, onAdd, go }) {
  const [name, setName] = useState('');
  const [full, setFull] = useState('');
  const ids = Object.keys(fleets);
  const add = () => {
    const id = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || ('F' + Date.now());
    onAdd({ id, name: name.trim(), full: full.trim() || name.trim() });
    setName(''); setFull('');
  };
  return (
    <div>
      <Header title="Manage fleets" sub={`${ids.length} fleets`} onBack={() => go('more')} />
      <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SectionTitle>Fleets</SectionTitle>
        {ids.map((k) => {
          const tc = trucks.filter((t) => t.fleet === k).length;
          const pc = parts.filter((p) => p.fleet === k).length;
          return (
            <div key={k} style={{ ...cardStyle(), padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: C.accent2 + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent2 }}><Icon name="layers" size={20} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: C.fg }}>{fleets[k].name}</div>
                <div style={{ fontSize: 12, color: C.mutedFg }}>{fleets[k].full}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 11.5, color: C.mutedFg, lineHeight: 1.5 }}>
                <div>{tc} truck{tc !== 1 ? 's' : ''}</div>
                <div>{pc} part{pc !== 1 ? 's' : ''}</div>
              </div>
            </div>
          );
        })}
        <div style={{ ...cardStyle(), padding: 16, marginTop: 6 }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: C.mutedFg, margin: '0 0 12px' }}>Add a fleet</h3>
          <Field label="Short name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Caribe" hint="Used on tags & filters (kept short)" />
          <Field label="Full name" value={full} onChange={(e) => setFull(e.target.value)} placeholder="e.g. Caribe Haulage Ltd" />
          <PrimaryBtn color={C.accent2} disabled={!name.trim()} onClick={add}><Icon name="plus" size={18} /> Add fleet</PrimaryBtn>
        </div>
        <div style={{ fontSize: 12, color: C.mutedFg, padding: '2px 4px', lineHeight: 1.5 }}>
          New fleets appear instantly in the fleet switcher, truck &amp; parts filters, and when assigning trucks, parts and invoices.
        </div>
      </div>
    </div>
  );
}

export function WeeklyReports({ inspections, trucks, go }) {
  const [f, setF] = useState('all');
  const plate = (id) => trucks.find((t) => t.id === id)?.plate || '—';
  const list = [...inspections].sort((a, b) => b.date.localeCompare(a.date))
    .filter((r) => f === 'all' ? true : f === 'flagged' ? r.attn > 0 : r.attn === 0);
  return (
    <div>
      <Header title="Weekly reports" sub={`${inspections.length} completed checks`} onBack={() => go('more')} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['all', 'All'], ['flagged', 'With flags'], ['clean', 'All clear']].map(([k, l]) => (
            <Chip key={k} active={f === k} onClick={() => setF(k)} small>{l}</Chip>
          ))}
        </div>
        {list.length === 0 && <EmptyNote icon="clip">No reports yet.</EmptyNote>}
        {list.map((r) => (
          <button key={r.id} onClick={() => go('report', r.id)} style={{ ...rowStyle(), alignItems: 'flex-start' }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: (r.attn ? C.warn : C.ok) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.attn ? C.warn : C.ok }}>
              <Icon name={r.attn ? 'alert' : 'checkc'} size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, color: C.fg }}>{plate(r.truckId)} <FleetChip fleet={r.fleet} /></div>
              <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 2 }}>{fmtDate(r.date)} · {r.by}</div>
              {r.general && <div style={{ fontSize: 12.5, color: C.fg, marginTop: 5, lineHeight: 1.4 }}>{r.general}</div>}
            </div>
            <Badge color={r.attn ? C.warn : C.ok}>{r.attn ? `${r.attn} flagged` : 'clear'}</Badge>
          </button>
        ))}
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

export function ReportDetail({ report, trucks, go }) {
  const truck = trucks.find((t) => t.id === report.truckId);
  const results = report.results || {};
  const notes = report.notes || {};
  const keys = Object.keys(results);
  const flagged = keys.filter((k) => results[k] === 'attn');
  const ok = keys.filter((k) => results[k] === 'ok');
  const Row = ({ k, v }) => (
    <div style={{ padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name={v === 'attn' ? 'alert' : 'checkc'} size={16} color={v === 'attn' ? C.danger : C.ok} />
        <span style={{ flex: 1, fontSize: 13.5, color: C.fg, fontWeight: 600 }}>{k}</span>
        <Badge color={v === 'attn' ? C.danger : C.ok}>{v === 'attn' ? 'attention' : 'ok'}</Badge>
      </div>
      {notes[k] && <div style={{ fontSize: 12.5, color: C.mutedFg, marginTop: 5, paddingLeft: 24 }}>{notes[k]}</div>}
    </div>
  );
  return (
    <div>
      <Header title="Weekly report" sub={`${truck?.plate || ''} · ${fmtDate(report.date)}`} onBack={() => go('weeklyreports')}
        action={<Badge color={report.attn ? C.warn : C.ok} solid={!report.attn}>{report.attn ? `${report.attn} flagged` : 'clear'}</Badge>} />
      <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ ...cardStyle(), padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['Truck', truck?.plate], ['Model', truck?.model], ['Inspector', report.by], ['Date', fmtDate(report.date)]].map(([k, v]) => (
              <div key={k}><div style={{ fontSize: 11, color: C.mutedFg, marginBottom: 3 }}>{k}</div><div style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>{v}</div></div>
            ))}
          </div>
          {report.general && <div style={{ marginTop: 12, fontSize: 13.5, color: C.fg, lineHeight: 1.5, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>{report.general}</div>}
          {report.missing && <div style={{ marginTop: 8, fontSize: 12.5, color: C.warn }}><b>Missing items:</b> {report.missing}</div>}
        </div>
        {flagged.length > 0 && <>
          <SectionTitle>Needs attention ({flagged.length})</SectionTitle>
          <div style={{ ...cardStyle(), padding: '2px 14px', borderColor: C.warn }}>
            {flagged.map((k) => <Row key={k} k={k} v="attn" />)}
          </div>
        </>}
        <SectionTitle>Checked OK ({ok.length})</SectionTitle>
        <div style={{ ...cardStyle(), padding: '2px 14px' }}>
          {ok.length === 0 && <div style={{ padding: 10 }}><EmptyNote>No items recorded.</EmptyNote></div>}
          {ok.map((k) => <Row key={k} k={k} v="ok" />)}
        </div>
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

export function Invoices({ invoices, trucks, go }) {
  const [f, setF] = useState('all');
  const plate = (id) => trucks.find((t) => t.id === id)?.plate || '—';
  const list = [...invoices].sort((a, b) => b.date.localeCompare(a.date)).filter((i) => f === 'all' || i.status === f);
  const totalOpen = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + invTotal(i), 0);
  return (
    <div>
      <Header title="Invoices" sub={`${money(totalOpen)} outstanding`} onBack={() => go('more')}
        action={<button onClick={() => go('newinvoice')} aria-label="New invoice" style={{ minWidth: 42, minHeight: 42, borderRadius: 12, border: 'none', background: C.accent2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={20} color="#fff" /></button>} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[['all', 'All'], ['draft', 'Draft'], ['sent', 'Sent'], ['paid', 'Paid']].map(([k, l]) => (
            <Chip key={k} active={f === k} onClick={() => setF(k)} small>{l}</Chip>
          ))}
        </div>
        {list.length === 0 && <EmptyNote icon="receipt">No invoices.</EmptyNote>}
        {list.map((inv) => (
          <button key={inv.id} onClick={() => go('invoice', inv.id)} style={{ ...rowStyle(), alignItems: 'flex-start' }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: invStatusColor(inv.status) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: invStatusColor(inv.status) }}>
              <Icon name="receipt" size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, color: C.fg }}>{inv.number}</span><FleetChip fleet={inv.fleet} />
              </div>
              <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 2 }}>{inv.party} · {plate(inv.truckId)} · {fmtDate(inv.date)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: C.fg, fontSize: 15 }}>{money(invTotal(inv))}</div>
              <Badge color={invStatusColor(inv.status)} solid={inv.status === 'paid'}>{inv.status}</Badge>
            </div>
          </button>
        ))}
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

export function InvoiceDetail({ invoice, trucks, onStatus, go }) {
  const truck = trucks.find((t) => t.id === invoice.truckId);
  const total = invTotal(invoice);
  return (
    <div>
      <Header title={invoice.number} sub={`${invoice.kind} · ${fmtDate(invoice.date)}`} onBack={() => go('invoices')}
        action={<Badge color={invStatusColor(invoice.status)} solid={invoice.status === 'paid'}>{invoice.status}</Badge>} />
      <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ ...cardStyle(), padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['Party', invoice.party], ['Fleet', fleetRegistry[invoice.fleet]?.name || invoice.fleet], ['Truck', truck?.plate || '—'], ['Due', fmtDate(invoice.dueDate)]].map(([k, v]) => (
              <div key={k}><div style={{ fontSize: 11, color: C.mutedFg, marginBottom: 3 }}>{k}</div><div style={{ fontSize: 14, fontWeight: 700, color: C.fg }}>{v}</div></div>
            ))}
          </div>
        </div>
        <SectionTitle>Line items</SectionTitle>
        <div style={{ ...cardStyle(), padding: '4px 14px' }}>
          {invoice.items.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.fg }}>{it.desc}</div>
                <div style={{ fontSize: 11.5, color: C.mutedFg }}>{it.qty} × {money(it.unit)}</div>
              </div>
              <div style={{ fontWeight: 700, color: C.fg, fontSize: 14 }}>{money(it.qty * it.unit)}</div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', fontWeight: 800 }}>
            <span style={{ color: C.fg }}>Total</span><span style={{ color: C.accent2, fontSize: 17 }}>{money(total)}</span>
          </div>
        </div>
        {invoice.notes && <div style={{ ...cardStyle(), padding: 14, fontSize: 13.5, color: C.fg, lineHeight: 1.5 }}>{invoice.notes}</div>}
        <SectionTitle>Update status</SectionTitle>
        <div style={{ display: 'flex', gap: 8 }}>
          {['draft', 'sent', 'paid'].map((s) => (
            <button key={s} onClick={() => onStatus(invoice.id, s)} style={{ flex: 1, minHeight: 46, borderRadius: 11, cursor: 'pointer', fontWeight: 700, textTransform: 'capitalize', fontSize: 13.5,
              border: `1.5px solid ${invoice.status === s ? invStatusColor(s) : C.border}`, background: invoice.status === s ? invStatusColor(s) : C.surface, color: invoice.status === s ? '#fff' : C.mutedFg }}>{s}</button>
          ))}
        </div>
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

export function NewInvoice({ fleetIds, trucks, onSave, go }) {
  const [fleet, setFleet] = useState(fleetIds[0] || 'IGL');
  const [truckId, setTruckId] = useState('');
  const [party, setParty] = useState('');
  const [kind, setKind] = useState('Payable');
  const [due, setDue] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ desc: '', qty: '1', unit: '' }]);
  const fleetTrucks = trucks.filter((t) => t.fleet === fleet);
  const setItem = (i, key, val) => setItems((arr) => arr.map((it, j) => j === i ? { ...it, [key]: val } : it));
  const addItem = () => setItems((arr) => [...arr, { desc: '', qty: '1', unit: '' }]);
  const rmItem = (i) => setItems((arr) => arr.length > 1 ? arr.filter((_, j) => j !== i) : arr);
  const total = items.reduce((s, it) => s + (+it.qty || 0) * (+it.unit || 0), 0);
  const valid = party.trim() && items.some((it) => it.desc.trim() && +it.unit > 0);
  return (
    <div>
      <Header title="New invoice" sub="Repair / parts billing" onBack={() => go('invoices')} />
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Select label="Fleet" value={fleet} onChange={(e) => { setFleet(e.target.value); setTruckId(''); }}>
              {fleetIds.map((k) => <option key={k} value={k}>{fleetRegistry[k]?.name || k}</option>)}
            </Select>
          </div>
          <div style={{ flex: 1 }}>
            <Select label="Truck (optional)" value={truckId} onChange={(e) => setTruckId(e.target.value)}>
              <option value="">— none —</option>
              {fleetTrucks.map((t) => <option key={t.id} value={t.id}>{t.plate}</option>)}
            </Select>
          </div>
        </div>
        <Field label="Vendor / customer" value={party} onChange={(e) => setParty(e.target.value)} placeholder="e.g. AutoParts Caribbean Ltd" />
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Select label="Type" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option>Payable</option><option>Receivable</option>
            </Select>
          </div>
          <div style={{ flex: 1 }}><Field label="Due date" value={due} onChange={(e) => setDue(e.target.value)} type="date" /></div>
        </div>
        <SectionTitle right={<button onClick={addItem} style={{ border: 'none', background: 'transparent', color: C.accent2, fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="plus" size={15} /> Add line</button>}>Line items</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((it, i) => (
            <div key={i} style={{ ...cardStyle(), padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <input value={it.desc} onChange={(e) => setItem(i, 'desc', e.target.value)} placeholder="Description (part or labour)" style={{ flex: 1, minHeight: 42, padding: '0 12px', fontSize: 15, border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface, color: C.fg, boxSizing: 'border-box' }} />
                {items.length > 1 && <button onClick={() => rmItem(i)} aria-label="Remove" style={{ width: 38, height: 38, borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface, color: C.danger, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="x" size={16} /></button>}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 72 }}>
                  <input value={it.qty} onChange={(e) => setItem(i, 'qty', e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="Qty" style={{ width: '100%', minHeight: 42, padding: '0 10px', fontSize: 15, border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface, color: C.fg, boxSizing: 'border-box', textAlign: 'center' }} />
                </div>
                <span style={{ color: C.mutedFg }}>×</span>
                <div style={{ flex: 1, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 11, top: 11, color: C.mutedFg, fontSize: 15 }}>$</span>
                  <input value={it.unit} onChange={(e) => setItem(i, 'unit', e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" placeholder="Unit price" style={{ width: '100%', minHeight: 42, padding: '0 12px 0 22px', fontSize: 15, border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface, color: C.fg, boxSizing: 'border-box' }} />
                </div>
                <div style={{ width: 84, textAlign: 'right', fontWeight: 700, color: C.fg, fontSize: 14 }}>{money((+it.qty || 0) * (+it.unit || 0))}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 4px', fontWeight: 800 }}>
          <span style={{ color: C.fg }}>Total</span><span style={{ color: C.accent2, fontSize: 20 }}>{money(total)}</span>
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes (optional)…" style={{ width: '100%', borderRadius: 11, border: `1px solid ${C.border}`, padding: 12, fontSize: 16, boxSizing: 'border-box', resize: 'vertical', marginBottom: 14, background: C.surface, color: C.fg, fontFamily: 'inherit' }} />
        <PrimaryBtn color={C.accent2} disabled={!valid} onClick={() => onSave({ fleet, truckId, party, kind, dueDate: due, notes, items: items.map((it) => ({ desc: it.desc, qty: +it.qty || 0, unit: +it.unit || 0 })) })}>
          <Icon name="check" size={18} /> Create invoice {total > 0 ? '· ' + money(total) : ''}
        </PrimaryBtn>
      </div>
    </div>
  );
}

export function NewUsage({ truck, parts, onSave, go }) {
  const avail = parts.filter((p) => p.fleet === 'SHARED' || p.fleet === truck.fleet);
  const [partId, setPartId] = useState(avail[0]?.id || '');
  const [qty, setQty] = useState('1');
  const [date, setDate] = useState('2026-06-11');
  const [note, setNote] = useState('');
  const part = parts.find((p) => p.id === partId);
  const n = +qty || 0;
  const short = part && n > part.qty;
  return (
    <div>
      <Header title="Record part used" sub={`${truck.plate} · ${truck.model}`} onBack={() => go('truck', truck.id)} />
      <div style={{ padding: '0 16px 20px' }}>
        {avail.length === 0 ? <EmptyNote icon="pkg">No parts available for this fleet. Add one in Stock first.</EmptyNote> : <>
          <Select label="Part" value={partId} onChange={(e) => setPartId(e.target.value)}>
            {avail.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.qty} in stock{p.sku ? ` (${p.sku})` : ''}</option>)}
          </Select>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="Quantity used" value={qty} onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="1" hint={part ? `${part.qty} currently in stock` : ''} /></div>
            <div style={{ flex: 1 }}><Field label="Date fitted" value={date} onChange={(e) => setDate(e.target.value)} type="date" /></div>
          </div>
          {short && <div style={{ ...cardStyle(), borderColor: C.danger, background: C.danger + '10', padding: 11, fontSize: 12.5, color: C.danger, fontWeight: 700, marginBottom: 12 }}>Only {part.qty} in stock — recording this will set it to 0.</div>}
          <Field label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. fitted to front left hub" />
          <PrimaryBtn disabled={!partId || n < 1} onClick={() => onSave(truck.id, { partId, qty: n, date, note })}>
            <Icon name="check" size={18} /> Record &amp; deduct from stock
          </PrimaryBtn>
          <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 12, lineHeight: 1.5 }}>
            This logs the part against {truck.plate} (shown under <b>Parts fitted</b>) and reduces inventory by {n || 0}.
          </div>
        </>}
      </div>
    </div>
  );
}

export function EditDocs({ truck, onSave, go }) {
  const [driver, setDriver] = useState(truck.driver || '');
  const [odometer, setOdometer] = useState(truck.odometer ? String(truck.odometer) : '');
  const [idleHrs, setIdleHrs] = useState(truck.idleHrs ? String(truck.idleHrs) : '');
  const [chassis, setChassis] = useState(truck.chassis || '');
  const [insuranceExp, setIns] = useState(truck.insuranceExp || '');
  const [fitnessExp, setFit] = useState(truck.fitnessExp || '');
  const [mvRegExp, setMv] = useState(truck.mvRegExp || '');
  const [carrierLicExp, setCar] = useState(truck.carrierLicExp || '');
  const [fireExtDate, setFire] = useState(truck.fireExtDate || '');
  const Sec = ({ children }) => <h3 style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: C.mutedFg, margin: '16px 0 10px' }}>{children}</h3>;
  const D = ({ label, value, onChange }) => <Field label={label} value={value} onChange={onChange} type="date" />;
  const save = () => {
    const patch = { driver, chassis, insuranceExp, fitnessExp, mvRegExp, carrierLicExp, fireExtDate };
    // Only touch readings when a value is present, so clearing a field never zeroes the truck.
    if (odometer !== '') patch.odometer = +odometer || 0;
    if (idleHrs !== '') patch.idleHrs = +idleHrs || 0;
    onSave(truck.id, patch);
  };
  return (
    <div>
      <Header title="Edit truck details" sub={`${truck.plate} · ${truck.model}`} onBack={() => go('truck', truck.id)} />
      <div style={{ padding: '0 16px 20px' }}>
        <Sec>Vehicle &amp; driver</Sec>
        <Field label="Driver" value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="e.g. D. Campbell" />

        <Sec>Current readings</Sec>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><Field label="Odometer (mi)" value={odometer} onChange={(e) => setOdometer(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="0" /></div>
          <div style={{ flex: 1 }}><Field label="Idle hours" value={idleHrs} onChange={(e) => setIdleHrs(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" placeholder="0" /></div>
        </div>
        <div style={{ fontSize: 12, color: C.mutedFg, margin: '-6px 0 4px', lineHeight: 1.5 }}>Updates the truck's current readings only — this does not create a service-history record.</div>

        <Sec>Documents</Sec>
        <Field label="Chassis number" value={chassis} onChange={(e) => setChassis(e.target.value)} placeholder="Chassis / VIN" />
        <D label="Insurance" value={insuranceExp} onChange={(e) => setIns(e.target.value)} />
        <D label="Fitness certification" value={fitnessExp} onChange={(e) => setFit(e.target.value)} />
        <D label="MV registration" value={mvRegExp} onChange={(e) => setMv(e.target.value)} />
        <D label="Carrier licence" value={carrierLicExp} onChange={(e) => setCar(e.target.value)} />
        <D label="Fire extinguisher service" value={fireExtDate} onChange={(e) => setFire(e.target.value)} />
        <PrimaryBtn onClick={save}>
          <Icon name="check" size={18} /> Save changes
        </PrimaryBtn>
      </div>
    </div>
  );
}

export function NewService({ truck, onSave, go }) {
  const [date, setDate] = useState('2026-06-11');
  const [type, setType] = useState('');
  const [miles, setMiles] = useState(String(truck.odometer || ''));
  const [notes, setNotes] = useState('');
  const presets = ['Engine service', 'Engine service + air filter', 'Transmission + diffs', 'Brake service', 'Tyres', 'General inspection'];
  return (
    <div>
      <Header title="Add service record" sub={`${truck.plate} · ${truck.model}`} onBack={() => go('truck', truck.id)} />
      <div style={{ padding: '0 16px 20px' }}>
        <Field label="Service type" value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Engine service + air filter" />
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', margin: '-6px 0 14px' }}>
          {presets.map((p) => (
            <button key={p} onClick={() => setType(p)} style={{ minHeight: 32, padding: '0 11px', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 700, border: `1px solid ${type === p ? C.accent : C.border}`, background: type === p ? C.accent + '1A' : C.surface, color: type === p ? C.accent : C.mutedFg }}>{p}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><Field label="Date" value={date} onChange={(e) => setDate(e.target.value)} type="date" /></div>
          <div style={{ flex: 1 }}><Field label="Odometer (mi)" value={miles} onChange={(e) => setMiles(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="0" /></div>
        </div>
        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: C.fg }}>Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="What was done…" style={{ width: '100%', borderRadius: 11, border: `1px solid ${C.border}`, padding: 12, fontSize: 16, boxSizing: 'border-box', resize: 'vertical', background: C.surface, color: C.fg, fontFamily: 'inherit' }} />
        </label>
        <PrimaryBtn disabled={!type.trim()} onClick={() => onSave(truck.id, { date, type, miles: +miles || 0, notes })}>
          <Icon name="check" size={18} /> Save to service history
        </PrimaryBtn>
      </div>
    </div>
  );
}
