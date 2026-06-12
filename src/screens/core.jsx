import React, { useState, useMemo } from 'react';
import { fleetRegistry } from '../data.js';
import { signIn } from '../lib/auth.js';
import { C, Icon, Badge, cardStyle, rowStyle, Field, Select, PrimaryBtn, GhostBtn, Header, PhotoSlot, MediaSlot, SectionTitle, sevColor, statusColor, statusLabel, fmtDate, fmtNum, daysUntil } from '../ui.jsx';
import markNavy from '../../public/assets/nodrog-mark.svg';
import markLight from '../../public/assets/nodrog-mark-light.svg';

function ImageSlotSimple({ id, placeholder }) {
  const [img, setImg] = useState(() => { try { return localStorage.getItem('img-' + id) || null; } catch { return null; } });
  const inputRef = React.useRef(null);
  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { const url = e.target.result; setImg(url); try { localStorage.setItem('img-' + id, url); } catch {} };
    reader.readAsDataURL(file);
  };
  return (
    <div onClick={() => inputRef.current?.click()} onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()}
      style={{ width: '100%', height: 150, background: img ? 'transparent' : C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderBottom: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}>
      {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
        <div style={{ textAlign: 'center', color: C.mutedFg }}>
          <Icon name="camera" size={28} /><div style={{ fontSize: 12, marginTop: 6, fontWeight: 600 }}>{placeholder || 'Tap to add photo'}</div>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  );
}

export function Logo({ size = 44, light }) {
  const src = light ? markLight : markNavy;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src={src} alt="Nodrog Logistics" style={{ height: size * 1.34, width: 'auto', display: 'block', flexShrink: 0 }} />
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontSize: size * 0.42, fontWeight: 900, letterSpacing: '-.01em', color: light ? '#fff' : C.fg }}>NODROG</div>
        <div style={{ fontSize: size * 0.22, fontWeight: 700, letterSpacing: '.22em', color: light ? '#9FB3C8' : C.mutedFg, marginTop: 2 }}>LOGISTICS</div>
      </div>
    </div>
  );
}

export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (busy) return;
    setErr(''); setBusy(true);
    const res = await signIn(email, password);
    setBusy(false);
    if (res.user) onLogin(res.user);
    else setErr(res.error || 'Sign in failed.');
  };
  return (
    <div style={{ minHeight: '100%', background: `linear-gradient(165deg, ${C.primary} 0%, #0A1B2B 55%, #0B2238 100%)`, display: 'flex', flexDirection: 'column', padding: '0 22px', overflowY: 'auto' }}>
      <div style={{ paddingTop: 64, marginBottom: 30 }}><Logo size={50} light /></div>
      <h1 style={{ color: '#fff', fontSize: 27, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-.01em' }}>Fleet Maintenance</h1>
      <p style={{ color: '#9FB3C8', fontSize: 14, margin: '0 0 22px' }}>Sign in with your Nodrog account.</p>
      <div style={{ background: C.surface, borderRadius: 18, padding: 20, boxShadow: '0 18px 50px rgba(0,0,0,.35)' }}>
        <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoCapitalize="off" autoCorrect="off" placeholder="you@company.com" onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <Field label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" onKeyDown={(e) => e.key === 'Enter' && submit()} />
        {err && <p style={{ color: C.danger, fontSize: 13, margin: '-4px 0 12px', fontWeight: 600 }}>{err}</p>}
        <PrimaryBtn onClick={submit} disabled={busy || !email.trim() || !password}><Icon name="logout" size={18} /> {busy ? 'Signing in…' : 'Sign in'}</PrimaryBtn>
      </div>
      <div style={{ marginTop: 18, paddingBottom: 28, color: '#6E8198', fontSize: 12, lineHeight: 1.5 }}>
        Trouble signing in? Contact your fleet administrator to set up or reset your account.
      </div>
    </div>
  );
}

export function FleetChip({ fleet }) {
  const color = fleet === 'IGL' ? C.accent : fleet === 'MASSY' ? C.accent2 : C.mutedFg;
  const label = fleet === 'SHARED' ? 'Shared' : fleetRegistry[fleet]?.name || fleet;
  return <Badge color={color}>{label}</Badge>;
}

export function EmptyNote({ children, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.mutedFg, fontSize: 13.5, padding: '10px 4px' }}>
      <Icon name={icon || 'list'} size={18} /> {children}
    </div>
  );
}

export function Chip({ children, active, onClick, small }) {
  return (
    <button onClick={onClick} style={{
      minHeight: small ? 34 : 38, padding: small ? '0 12px' : '0 14px', borderRadius: 999, cursor: 'pointer',
      fontSize: small ? 12.5 : 13.5, fontWeight: 700, whiteSpace: 'nowrap',
      border: `1px solid ${active ? C.accent : C.border}`,
      background: active ? C.accent : C.surface, color: active ? '#fff' : C.mutedFg,
    }}>{children}</button>
  );
}

export function MeterRow({ label, value, max, unit, sub }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const over = value >= max;
  const near = pct >= 88;
  const col = over ? C.danger : near ? C.warn : C.ok;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
        <span style={{ fontWeight: 700, color: C.fg }}>{label}</span>
        <span style={{ color: col, fontWeight: 700 }}>{over ? 'Overdue' : `${fmtNum(max - value)} ${unit} left`}</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: C.surface2, overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: col, borderRadius: 999 }} />
      </div>
      {sub && <div style={{ fontSize: 11.5, color: C.mutedFg, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function Dashboard({ user, fleet, trucks, issues, parts, go }) {
  const openIssues = issues.filter((i) => i.status === 'open').length;
  const serious = issues.filter((i) => i.status === 'open' && i.serious).length;
  const lowStock = parts.filter((p) => p.qty <= p.min).length;
  const dueChecks = trucks.filter((t) => t.status === 'due' || t.status === 'overdue').length;
  const oos = trucks.filter((t) => t.status === 'oos');
  const attention = trucks.filter((t) => t.status !== 'ok').sort((a, b) => (a.status === 'oos' ? -1 : 0));

  const reminders = [];
  trucks.forEach((t) => {
    [['Insurance', t.insuranceExp], ['Fitness cert', t.fitnessExp], ['MV registration', t.mvRegExp], ['Carrier licence', t.carrierLicExp], ['Fire extinguisher', t.fireExtDate]].forEach(([k, d]) => {
      const du = daysUntil(d);
      if (du <= 30) reminders.push({ truck: t, kind: k, days: du, date: d });
    });
    const milesLeft = t.service.engine.nextDueMiles - t.odometer;
    if (milesLeft <= 4000) reminders.push({ truck: t, kind: 'Engine service', days: null, miles: milesLeft });
  });
  reminders.sort((a, b) => (a.days ?? 999) - (b.days ?? 999));

  const Stat = ({ icon, label, value, color, onClick, alert }) => (
    <button onClick={onClick} style={{ flex: 1, ...cardStyle(), padding: 14, cursor: 'pointer', minHeight: 96, textAlign: 'left', position: 'relative' }}>
      {alert > 0 && <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 800, color: '#fff', background: C.crit, borderRadius: 999, padding: '2px 7px' }}>{alert}</span>}
      <div style={{ color, marginBottom: 10 }}><Icon name={icon} size={22} /></div>
      <div style={{ fontSize: 30, fontWeight: 800, color: C.fg, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: C.mutedFg, marginTop: 5 }}>{label}</div>
    </button>
  );

  return (
    <div>
      <Header title={`Good day, ${user.name.split(' ')[0]}`} sub={`${fleet === 'ALL' ? 'All fleets' : fleetRegistry[fleet]?.full || fleet} · Week of ${fmtDate('2026-06-08')}`} />
      <div style={{ padding: '0 16px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {oos.length > 0 && (
          <button onClick={() => go('truck', oos[0].id)} style={{ ...cardStyle(), borderColor: C.crit, background: C.crit + '12', padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ color: C.crit }}><Icon name="ban" size={26} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: C.crit, fontSize: 15 }}>{oos.length} truck{oos.length > 1 ? 's' : ''} out of service</div>
              <div style={{ fontSize: 12.5, color: C.mutedFg }}>{oos.map((t) => t.plate).join(', ')} — tap to review</div>
            </div>
            <Icon name="chevron" size={18} color={C.crit} />
          </button>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <Stat icon="clip" value={dueChecks} label="Checks due" color={C.warn} onClick={() => go('trucks')} />
          <Stat icon="alert" value={openIssues} label="Open issues" color={C.danger} onClick={() => go('issues')} alert={serious} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Stat icon="box" value={lowStock} label="Low-stock parts" color={C.warn} onClick={() => go('inventory')} />
          <Stat icon="truck" value={trucks.length} label="Active trucks" color={C.accent} onClick={() => go('trucks')} />
        </div>
        <SectionTitle>Needs attention</SectionTitle>
        {attention.length === 0 && <EmptyNote icon="checkc">All trucks up to date.</EmptyNote>}
        {attention.map((t) => (
          <button key={t.id} onClick={() => go('truck', t.id)} style={rowStyle()}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: statusColor(t.status) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColor(t.status) }}>
              <Icon name={t.status === 'oos' ? 'ban' : 'truck'} size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, color: C.fg }}>{t.plate} <FleetChip fleet={t.fleet} /></div>
              <div style={{ fontSize: 12, color: C.mutedFg }}>{t.model} · last check {fmtDate(t.lastCheck)}</div>
            </div>
            <Badge color={statusColor(t.status)} solid={t.status === 'oos'}>{statusLabel(t.status)}</Badge>
          </button>
        ))}
        {reminders.length > 0 && <>
          <SectionTitle right={<span style={{ fontSize: 11, color: C.mutedFg }}>{reminders.length}</span>}>Upcoming &amp; due</SectionTitle>
          <div style={{ ...cardStyle(), padding: 4 }}>
            {reminders.slice(0, 5).map((r, i) => (
              <button key={i} onClick={() => go('truck', r.truck.id)} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', background: 'transparent', border: 'none', borderTop: i ? `1px solid ${C.border}` : 'none', padding: '11px 11px', cursor: 'pointer', textAlign: 'left' }}>
                <Icon name={r.miles != null ? 'wrench' : 'bell'} size={17} color={(r.days != null && r.days < 0) ? C.danger : C.warn} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: C.fg }}>{r.kind} — {r.truck.plate}</div>
                  <div style={{ fontSize: 11.5, color: C.mutedFg }}>
                    {r.miles != null ? `${fmtNum(Math.max(0, r.miles))} mi to service` : r.days < 0 ? `Expired ${Math.abs(r.days)}d ago · ${fmtDate(r.date)}` : `in ${r.days}d · ${fmtDate(r.date)}`}
                  </div>
                </div>
                {(r.days != null && r.days < 0) || (r.miles != null && r.miles <= 0)
                  ? <Badge color={C.danger}>OVERDUE</Badge> : <Badge color={C.warn}>SOON</Badge>}
              </button>
            ))}
          </div>
        </>}
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

const trkSelect = () => ({
  flex: 1, minWidth: 0, minHeight: 44, borderRadius: 11, border: `1px solid ${C.border}`,
  padding: '0 12px', fontSize: 14, fontWeight: 700, background: C.surface, color: C.fg,
  boxSizing: 'border-box', cursor: 'pointer',
});

export function Trucks({ fleet, multiFleet, fleetIds = ['IGL', 'MASSY'], trucks, go, canEdit = true }) {
  const [f, setF] = useState('ALL');
  const [status, setStatus] = useState('all');
  const list = trucks.filter((t) => (f === 'ALL' || t.fleet === f) && (status === 'all' || (status === 'attn' ? t.status !== 'ok' : t.status === status)));
  return (
    <div>
      <Header title="Trucks" sub={`${list.length} vehicle${list.length !== 1 ? 's' : ''}`}
        action={canEdit && <button onClick={() => go('newtruck')} aria-label="Add truck" style={{ minWidth: 42, minHeight: 42, borderRadius: 12, border: 'none', background: C.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={20} color="#fff" /></button>} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.length === 0 && <EmptyNote icon="truck">No trucks yet. Tap + to add your first truck.</EmptyNote>}
        <div style={{ display: 'flex', gap: 10 }}>
          {multiFleet && (
            <select value={f} onChange={(e) => setF(e.target.value)} aria-label="Fleet" style={trkSelect()}>
              <option value="ALL">All fleets</option>
              {fleetIds.map((k) => <option key={k} value={k}>{fleetRegistry[k]?.name || k}</option>)}
            </select>
          )}
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" style={trkSelect()}>
            <option value="all">All trucks</option>
            <option value="attn">Needs attention</option>
            <option value="ok">Up to date</option>
          </select>
        </div>
        {list.map((t) => {
          const milesLeft = t.service.engine.nextDueMiles - t.odometer;
          const attn = t.status !== 'ok';
          return (
            <button key={t.id} onClick={() => go('truck', t.id)} style={{ ...cardStyle(), padding: 0, overflow: 'hidden', textAlign: 'left', cursor: 'pointer', display: 'block', width: '100%', font: 'inherit', color: C.fg }}>
              <div style={{ display: 'flex', gap: 12, padding: 13, alignItems: 'center' }}>
                <div style={{ width: 66, height: 54, borderRadius: 11, background: C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.mutedFg, flexShrink: 0 }}>
                  <Icon name="truck" size={26} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, color: C.fg, fontSize: 16, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.plate}</span>
                    <Badge color={statusColor(t.status)} solid={t.status === 'oos'}>{statusLabel(t.status)}</Badge>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.mutedFg, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.model}</span>
                    <FleetChip fleet={t.fleet} />
                  </div>
                  <div style={{ fontSize: 11.5, color: C.mutedFg, marginTop: 6, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <span style={{ whiteSpace: 'nowrap' }}><Icon name="user" size={12} style={{ verticalAlign: '-2px' }} /> {t.driver}</span>
                    <span style={{ whiteSpace: 'nowrap' }}><Icon name="gauge" size={12} style={{ verticalAlign: '-2px' }} /> {fmtNum(t.odometer)} mi</span>
                  </div>
                </div>
                <Icon name="chevron" size={18} color={C.mutedFg} style={{ flexShrink: 0 }} />
              </div>
              <div style={{ padding: '9px 14px', borderTop: `1px solid ${C.border}`, background: attn ? statusColor(t.status) + '0E' : C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 11.5, color: C.mutedFg, fontWeight: 600, whiteSpace: 'nowrap' }}>Next service</span>
                <span style={{ fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', color: milesLeft <= 0 ? C.danger : milesLeft <= 4000 ? C.warn : C.ok }}>{milesLeft <= 0 ? 'Overdue' : `${fmtNum(milesLeft)} mi`}</span>
              </div>
            </button>
          );
        })}
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

export function TruckDetail({ truck, issues, usage, parts, history, go, onToggleOOS, canEdit }) {
  const [tab, setTab] = useState('service');
  const tIssues = issues.filter((i) => i.truckId === truck.id);
  const openIss = tIssues.filter((i) => i.status === 'open');
  const tUsage = usage.filter((u) => u.truckId === truck.id);
  const tHist = history.filter((h) => h.truckId === truck.id);
  const partName = (id) => parts.find((p) => p.id === id)?.name || '—';
  const eng = truck.service.engine;

  const Detail = ({ k, v, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13.5 }}>
      <span style={{ color: C.mutedFg }}>{k}</span>
      <span style={{ fontWeight: 700, color: color || C.fg, textAlign: 'right' }}>{v}</span>
    </div>
  );
  const ExpRow = ({ k, d }) => {
    const du = daysUntil(d);
    const col = du < 0 ? C.danger : du <= 30 ? C.warn : C.fg;
    return <Detail k={k} v={`${fmtDate(d)}${du < 0 ? ' · expired' : du <= 30 ? ` · ${du}d` : ''}`} color={col} />;
  };

  // IssueCard inline to avoid circular import
  const IssueCardInline = ({ issue }) => {
    const i = issue;
    return (
      <div style={{ ...cardStyle(), padding: 14, borderColor: i.oos ? C.crit : C.border, borderWidth: i.oos ? 1.5 : 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, color: C.fg, fontSize: 15, lineHeight: 1.3, marginBottom: 4 }}>
              {i.serious && <Icon name="alert" size={15} color={C.crit} style={{ verticalAlign: '-2px', marginRight: 5 }} />}
              {i.title}
            </div>
            <div style={{ fontSize: 12, color: C.mutedFg }}>{i.by} · {fmtDate(i.date)}</div>
          </div>
          <Badge color={i.status === 'open' ? C.danger : C.ok}>{i.status}</Badge>
        </div>
        {i.detail && <p style={{ fontSize: 13.5, color: C.fg, margin: '9px 0 0', lineHeight: 1.45 }}>{i.detail}</p>}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge color={sevColor(i.severity)}>{i.severity}</Badge>
          {i.oos && <Badge color={C.crit} solid><Icon name="ban" size={12} /> OUT OF SERVICE</Badge>}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header title={truck.plate} sub={`${truck.model} · ${fleetRegistry[truck.fleet]?.name || truck.fleet}`} onBack={() => go('trucks')}
        action={<Badge color={statusColor(truck.status)} solid={truck.status === 'oos'}>{statusLabel(truck.status)}</Badge>} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ ...cardStyle(), padding: 0, overflow: 'hidden' }}>
          <ImageSlotSimple id={'truck-photo-' + truck.id} placeholder="Tap to add truck photo" />
          <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[['Odometer', `${fmtNum(truck.odometer)} mi`], ['Idle hours', `${fmtNum(truck.idleHrs)} h`], ['Driver', truck.driver], ['Location', truck.location], ['Segment', truck.segment], ['Capacity', truck.capacity]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: C.mutedFg, marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: C.fg }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {canEdit && <div style={{ display: 'flex', gap: 10 }}>
          <PrimaryBtn onClick={() => go('newcheck', truck.id)} style={{ flex: 1.4 }}><Icon name="clip" size={18} /> Weekly check</PrimaryBtn>
          <button onClick={() => onToggleOOS(truck)} style={{ flex: 1, minHeight: 52, borderRadius: 13, cursor: 'pointer', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            border: `1.5px solid ${truck.status === 'oos' ? C.ok : C.crit}`, background: (truck.status === 'oos' ? C.ok : C.crit) + '12', color: truck.status === 'oos' ? C.ok : C.crit }}>
            <Icon name={truck.status === 'oos' ? 'checkc' : 'ban'} size={17} /> {truck.status === 'oos' ? 'Return to duty' : 'Take out of service'}
          </button>
        </div>}

        <div style={{ display: 'flex', gap: 7, marginTop: 2 }}>
          {[['service', 'Service'], ['issues', `Issues${openIss.length ? ' ' + openIss.length : ''}`], ['history', 'History'], ['docs', 'Docs']].map(([k, l]) => (
            <Chip key={k} active={tab === k} onClick={() => setTab(k)} small>{l}</Chip>
          ))}
        </div>

        {tab === 'service' && <div style={{ ...cardStyle(), padding: 16 }}>
          <MeterRow label="Engine (miles)" value={truck.odometer} max={eng.nextDueMiles} unit="mi"
            sub={`Last: ${fmtNum(eng.lastMiles)} mi · ${fmtDate(eng.date)} · next due ${fmtNum(eng.nextDueMiles)} mi`} />
          <MeterRow label="Engine (idle hrs)" value={truck.idleHrs} max={eng.nextDueHrs} unit="h"
            sub={`Last: ${fmtNum(eng.lastIdleHrs)} h · next due ${fmtNum(eng.nextDueHrs)} h`} />
          <div style={{ marginTop: 4 }}>
            <Detail k="Air filter" v={`${fmtNum(truck.service.airFilter.lastMiles)} mi · ${fmtDate(truck.service.airFilter.date)}`} />
            <Detail k="Transmission" v={`${fmtNum(truck.service.transmission.lastMiles)} mi · ${fmtDate(truck.service.transmission.date)}`} />
            <Detail k="Front rear diff" v={`${fmtNum(truck.service.frontDiff.lastMiles)} mi · ${fmtDate(truck.service.frontDiff.date)}`} />
            <Detail k="Rear rear diff" v={`${fmtNum(truck.service.rearDiff.lastMiles)} mi · ${fmtDate(truck.service.rearDiff.date)}`} />
          </div>
          <SectionTitle right={canEdit && <button onClick={() => go('usepart', truck.id)} style={{ border: 'none', background: 'transparent', color: C.accent, fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="plus" size={15} /> Add</button>}>Parts fitted</SectionTitle>
          {tUsage.length === 0 && <EmptyNote icon="pkg">No parts recorded.</EmptyNote>}
          {tUsage.map((u) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', borderBottom: `1px solid ${C.border}` }}>
              <Icon name="pkg" size={17} color={C.accent} />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13.5 }}>{partName(u.partId)}</div><div style={{ fontSize: 11.5, color: C.mutedFg }}>Qty {u.qty} · {fmtDate(u.date)} · {u.by}{u.note ? ' · ' + u.note : ''}</div></div>
            </div>
          ))}
          {canEdit && <GhostBtn onClick={() => go('usepart', truck.id)} style={{ width: '100%', marginTop: 12 }}><Icon name="pkg" size={16} /> Record part used</GhostBtn>}
        </div>}

        {tab === 'issues' && <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tIssues.length === 0 && <EmptyNote icon="checkc">No issues logged.</EmptyNote>}
          {tIssues.map((i) => <IssueCardInline key={i.id} issue={i} />)}
          {canEdit && <GhostBtn onClick={() => go('newissue', truck.id)} style={{ width: '100%' }}><Icon name="plus" size={16} /> Log an issue</GhostBtn>}
        </div>}

        {tab === 'history' && <div>
          <div style={{ ...cardStyle(), padding: 4 }}>
            {tHist.length === 0 && <div style={{ padding: 12 }}><EmptyNote>No service history.</EmptyNote></div>}
            {tHist.map((h, i) => (
              <div key={h.id} style={{ display: 'flex', gap: 12, padding: '13px 12px', borderTop: i ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: C.accent, marginTop: 3 }} />
                  {i < tHist.length - 1 && <div style={{ width: 2, flex: 1, background: C.border, marginTop: 3 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{h.type}</div>
                  <div style={{ fontSize: 12, color: C.mutedFg, margin: '2px 0 3px' }}>{fmtDate(h.date)} · {fmtNum(h.miles)} mi · {h.by}</div>
                  {h.notes && <div style={{ fontSize: 12.5, color: C.fg }}>{h.notes}</div>}
                </div>
              </div>
            ))}
          </div>
          {canEdit && <GhostBtn onClick={() => go('newservice', truck.id)} style={{ width: '100%', marginTop: 12 }}><Icon name="plus" size={16} /> Add service record</GhostBtn>}
        </div>}

        {tab === 'docs' && <div>
          <div style={{ ...cardStyle(), padding: 16 }}>
            <Detail k="Chassis no." v={truck.chassis} />
            <ExpRow k="Insurance" d={truck.insuranceExp} />
            <ExpRow k="Fitness certification" d={truck.fitnessExp} />
            <ExpRow k="MV registration" d={truck.mvRegExp} />
            <ExpRow k="Carrier licence" d={truck.carrierLicExp} />
            <ExpRow k="Fire extinguisher" d={truck.fireExtDate} />
          </div>
          {canEdit && <GhostBtn onClick={() => go('editdocs', truck.id)} style={{ width: '100%', marginTop: 12 }}><Icon name="edit" size={16} /> Edit documents</GhostBtn>}
        </div>}
        <div style={{ height: 10 }} />
      </div>
    </div>
  );
}

export function NewTruck({ fleetIds = ['IGL', 'MASSY'], onSave, go }) {
  const [fleet, setFleet] = useState(fleetIds[0] || 'IGL');
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [segment, setSegment] = useState('');
  const [driver, setDriver] = useState('');
  const [location, setLocation] = useState('');
  const [odometer, setOdometer] = useState('');
  const [idleHrs, setIdleHrs] = useState('');
  const [chassis, setChassis] = useState('');
  const [capacity, setCapacity] = useState('');
  const valid = plate.trim() && fleet;
  return (
    <div>
      <Header title="Add truck" sub="Register a new vehicle" onBack={() => go('trucks')} />
      <div style={{ padding: '0 16px 24px' }}>
        <Select label="Fleet" value={fleet} onChange={(e) => setFleet(e.target.value)}>
          {fleetIds.map((k) => <option key={k} value={k}>{fleetRegistry[k]?.full || fleetRegistry[k]?.name || k}</option>)}
        </Select>
        <Field label="Number plate" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="e.g. CN3179" />
        <Field label="Make / model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Isuzu FVR — Box" />
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><Field label="Segment" value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="e.g. Distribution" /></div>
          <div style={{ flex: 1 }}><Field label="Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 8 T" /></div>
        </div>
        <Field label="Driver" value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="e.g. D. Campbell" />
        <Field label="Base / location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kingston Depot" />
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><Field label="Odometer (mi)" value={odometer} onChange={(e) => setOdometer(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="0" /></div>
          <div style={{ flex: 1 }}><Field label="Idle hours" value={idleHrs} onChange={(e) => setIdleHrs(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" placeholder="0" /></div>
        </div>
        <Field label="Chassis / VIN" value={chassis} onChange={(e) => setChassis(e.target.value)} placeholder="Chassis number" hint="Document expiry dates can be added later under the truck's Docs tab." />
        <PrimaryBtn disabled={!valid} onClick={() => onSave({ fleet, plate: plate.trim(), model, segment, driver, location, odometer, idleHrs, chassis, capacity })}>
          <Icon name="check" size={18} /> Save truck
        </PrimaryBtn>
      </div>
    </div>
  );
}
