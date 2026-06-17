import React, { useState } from 'react';
import { fleetRegistry, INSPECT_SINGLE, INSPECT_POSITIONS, INSPECT_POSITION_CATS, INSPECT_FLUIDS, INSPECT_DRIVETRAIN } from '../data.js';
import { C, Icon, Badge, cardStyle, rowStyle, Field, Select, PrimaryBtn, GhostBtn, Header, PhotoSlot, MediaSlot, MediaUpload, SectionTitle, sevColor, fmtDate } from '../ui.jsx';
import { FleetChip, Chip, EmptyNote } from './core.jsx';

export function IssueCard({ issue, truckPlate, compact, onEdit, selectable, selected, onToggle }) {
  const i = issue;
  return (
    <div onClick={selectable ? onToggle : undefined} style={{ ...cardStyle(), padding: 14, borderColor: selected ? C.accent : i.oos ? C.crit : C.border, borderWidth: (i.oos || selected) ? 1.5 : 1, cursor: selectable ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, color: C.fg, fontSize: 15, lineHeight: 1.3, marginBottom: 4, textWrap: 'pretty' }}>
            {i.serious && <Icon name="alert" size={15} color={C.crit} style={{ verticalAlign: '-2px', marginRight: 5 }} />}
            {i.title}
          </div>
          <div style={{ fontSize: 12, color: C.mutedFg, lineHeight: 1.4 }}>{truckPlate ? truckPlate + ' · ' : ''}{i.by} · {fmtDate(i.date)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Badge color={i.status === 'open' ? C.danger : C.ok}>{i.status}</Badge>
          {selectable
            ? <span style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${selected ? C.accent : C.border}`, background: selected ? C.accent : C.surface }}>{selected && <Icon name="check" size={15} color="#fff" />}</span>
            : (onEdit && <button onClick={onEdit} aria-label="Edit issue" style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface, color: C.mutedFg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="edit" size={16} /></button>)}
        </div>
      </div>
      {i.detail && <p style={{ fontSize: 13.5, color: C.fg, margin: '9px 0 0', lineHeight: 1.45 }}>{i.detail}</p>}
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Badge color={sevColor(i.severity)}>{i.severity}</Badge>
        {i.oos && <Badge color={C.crit} solid><Icon name="ban" size={12} /> OUT OF SERVICE</Badge>}
        {i.photos && i.photos.length > 0 && <Badge color={C.mutedFg}><Icon name="camera" size={12} /> {i.photos.length}</Badge>}
      </div>
      {Array.isArray(i.photos) && i.photos.some((m) => m && m.url) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {i.photos.filter((m) => m && m.url).map((m, idx) => (
            <div key={idx} style={{ width: 60, height: 60, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}`, position: 'relative', background: C.surface2 }}>
              {m.type === 'video'
                ? <><video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline /><span style={{ position: 'absolute', left: 4, bottom: 4, background: 'rgba(0,0,0,.55)', color: '#fff', fontSize: 8, fontWeight: 800, padding: '1px 4px', borderRadius: 4 }}>VIDEO</span></>
                : <img src={m.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
          ))}
        </div>
      )}
      {i.serious && i.partsNeeded && (
        <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: C.crit + '10', fontSize: 12.5 }}>
          <span style={{ fontWeight: 800, color: C.crit }}>Needed to fix: </span>
          <span style={{ color: C.fg }}>{i.partsNeeded}</span>
        </div>
      )}
    </div>
  );
}

const issueSelect = () => ({ width: '100%', minHeight: 44, borderRadius: 11, border: `1px solid ${C.border}`, padding: '0 12px', fontSize: 14, fontWeight: 700, background: C.surface, color: C.fg, boxSizing: 'border-box', cursor: 'pointer' });

export function Issues({ trucks, issues, go, canEdit, onDelete }) {
  const [filter, setFilter] = useState('open');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(() => new Set());

  const list = issues.filter((i) => filter === 'all' ? true : filter === 'serious' ? (i.serious && i.status === 'open') : i.status === filter);

  // Group the filtered issues under their truck.
  const groups = React.useMemo(() => {
    const m = new Map();
    list.forEach((i) => { if (!m.has(i.truckId)) m.set(i.truckId, []); m.get(i.truckId).push(i); });
    return [...m.entries()]
      .map(([truckId, items]) => ({ truckId, items, truck: trucks.find((t) => t.id === truckId) }))
      .sort((a, b) => (a.truck?.plate || 'zz').localeCompare(b.truck?.plate || 'zz'));
  }, [list, trucks]);

  const allIds = list.map((i) => i.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const toggle = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = () => setSelected(allSelected ? new Set() : new Set(allIds));
  const exitSelect = () => { setSelectMode(false); setSelected(new Set()); };
  const doDelete = () => {
    if (!selected.size) return;
    if (confirm(`Delete ${selected.size} issue${selected.size > 1 ? 's' : ''}? This cannot be undone.`)) { onDelete([...selected]); exitSelect(); }
  };

  const openCount = issues.filter((i) => i.status === 'open').length;
  const filters = [['open', 'Open'], ['serious', 'Serious'], ['resolved', 'Resolved'], ['all', 'All']];

  return (
    <div>
      <Header title="Issues" sub={selectMode ? `${selected.size} selected` : `${openCount} open`}
        action={canEdit && (selectMode
          ? <button onClick={exitSelect} style={{ minHeight: 42, padding: '0 14px', borderRadius: 11, border: `1px solid ${C.border}`, background: C.surface, color: C.fg, fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }}>Cancel</button>
          : <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setSelectMode(true)} aria-label="Select issues" style={{ minWidth: 42, minHeight: 42, borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, color: C.mutedFg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="checkc" size={19} /></button>
              <button onClick={() => go('newissue')} aria-label="New issue" style={{ minWidth: 42, minHeight: 42, borderRadius: 12, border: 'none', background: C.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={20} color="#fff" /></button>
            </div>)} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter issues" style={issueSelect()}>
          {filters.map(([k, l]) => <option key={k} value={k}>{l} issues</option>)}
        </select>
        {list.length === 0 && <EmptyNote icon="checkc">No {filter === 'all' ? '' : filter + ' '}issues.</EmptyNote>}
        {groups.map((g) => (
          <React.Fragment key={g.truckId}>
            <button onClick={() => { if (!selectMode) go('truck', g.truckId); }} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, padding: '2px 2px', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: selectMode ? 'default' : 'pointer', font: 'inherit' }}>
              <Icon name="truck" size={15} color={C.mutedFg} />
              <span style={{ fontWeight: 800, fontSize: 14, color: C.fg }}>{g.truck?.plate || '—'}</span>
              {g.truck && <FleetChip fleet={g.truck.fleet} />}
              {g.truck?.model && <span style={{ fontSize: 12, color: C.mutedFg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{g.truck.model}</span>}
              <span style={{ fontSize: 11, fontWeight: 800, color: C.mutedFg, background: C.surface2, borderRadius: 999, padding: '2px 8px', marginLeft: 'auto', flexShrink: 0 }}>{g.items.length}</span>
            </button>
            {g.items.map((i) => (
              <IssueCard key={i.id} issue={i}
                onEdit={canEdit ? () => go('editissue', i.id) : undefined}
                selectable={selectMode} selected={selected.has(i.id)} onToggle={() => toggle(i.id)} />
            ))}
          </React.Fragment>
        ))}
        <div style={{ height: 8 }} />
      </div>
      {selectMode && (
        <div style={{ position: 'sticky', bottom: 0, background: C.surface, borderTop: `1px solid ${C.border}`, padding: '10px 16px calc(10px + env(safe-area-inset-bottom))', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 -6px 20px rgba(0,0,0,.12)' }}>
          <button onClick={selectAll} disabled={!allIds.length} style={{ minHeight: 44, padding: '0 14px', borderRadius: 11, border: `1px solid ${C.border}`, background: C.surface, color: C.fg, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap' }}>{allSelected ? 'Clear' : 'Select all'}</button>
          <button onClick={doDelete} disabled={!selected.size} style={{ flex: 1, minHeight: 46, borderRadius: 12, border: 'none', background: selected.size ? C.danger : C.border, color: '#fff', fontWeight: 800, fontSize: 14.5, cursor: selected.size ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Icon name="x" size={17} /> Delete{selected.size ? ` (${selected.size})` : ''}</button>
        </div>
      )}
    </div>
  );
}

export function NewIssue({ trucks, preTruck, onSave, go }) {
  const [truckId, setTruckId] = useState(preTruck || trucks[0]?.id || '');
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [serious, setSerious] = useState(false);
  const [oos, setOos] = useState(false);
  const [partsNeeded, setPartsNeeded] = useState('');
  const [media, setMedia] = useState([]);
  const sevs = ['low', 'medium', 'high', 'critical'];
  return (
    <div>
      <Header title="Log issue" onBack={() => go(preTruck ? 'truck' : 'issues', preTruck)} />
      <div style={{ padding: '0 16px 20px' }}>
        <Select label="Truck" value={truckId} onChange={(e) => setTruckId(e.target.value)}>
          {trucks.map((t) => <option key={t.id} value={t.id}>{t.plate} — {t.model} ({fleetRegistry[t.fleet]?.name || t.fleet})</option>)}
        </Select>
        <Field label="What's the problem?" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Brake squeal front axle" />
        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: C.fg }}>Details</span>
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3} placeholder="What you saw, heard, smelled…" style={{ width: '100%', borderRadius: 11, border: `1px solid ${C.border}`, padding: 12, fontSize: 16, boxSizing: 'border-box', resize: 'vertical', background: C.surface, color: C.fg, fontFamily: 'inherit' }} />
        </label>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: C.fg }}>Severity</span>
        <div style={{ display: 'flex', gap: 7, marginBottom: 16 }}>
          {sevs.map((s) => (
            <button key={s} onClick={() => { setSeverity(s); if (s === 'critical') setSerious(true); }} style={{ flex: 1, minHeight: 46, borderRadius: 11, cursor: 'pointer', fontWeight: 700, textTransform: 'capitalize', fontSize: 13,
              border: `1.5px solid ${severity === s ? sevColor(s) : C.border}`, background: severity === s ? sevColor(s) + '1A' : C.surface, color: severity === s ? sevColor(s) : C.mutedFg }}>{s}</button>
          ))}
        </div>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: C.fg }}>Photos &amp; video</span>
        <div style={{ marginBottom: 6 }}>
          <MediaUpload value={media} onChange={setMedia} maxPhotos={8} allowVideo />
        </div>
        <div style={{ fontSize: 11.5, color: C.mutedFg, marginBottom: 16 }}>Add multiple photos (e.g. truck or damage images) and one short video.</div>
        <ToggleRow label="Serious issue" desc="Flag for supervisor — needs parts or major repair" value={serious} onChange={setSerious} color={C.warn} />
        {serious && <>
          <ToggleRow label="Take truck out of service" desc="Vehicle removed from duty until fixed" value={oos} onChange={setOos} color={C.crit} />
          <Field label="What's needed to fix it?" value={partsNeeded} onChange={(e) => setPartsNeeded(e.target.value)} placeholder="e.g. Center bolt + U-bolt set" hint="Parts / labour required" />
        </>}
        <PrimaryBtn disabled={!title.trim()} color={oos ? C.crit : C.accent}
          onClick={() => onSave({ truckId, title, detail, severity, serious, oos, partsNeeded, media })}>
          <Icon name="check" size={18} /> {oos ? 'Save & take out of service' : 'Save issue'}
        </PrimaryBtn>
      </div>
    </div>
  );
}

export function EditIssue({ issue, trucks, onSave, onDelete, go }) {
  const truck = trucks.find((t) => t.id === issue.truckId);
  const [title, setTitle] = useState(issue.title || '');
  const [detail, setDetail] = useState(issue.detail || '');
  const [severity, setSeverity] = useState(issue.severity || 'medium');
  const [status, setStatus] = useState(issue.status || 'open');
  const [serious, setSerious] = useState(!!issue.serious);
  const [oos, setOos] = useState(!!issue.oos);
  const [partsNeeded, setPartsNeeded] = useState(issue.partsNeeded || '');
  const [media, setMedia] = useState(Array.isArray(issue.photos) ? issue.photos.filter((m) => m && m.url) : []);
  const sevs = ['low', 'medium', 'high', 'critical'];
  return (
    <div>
      <Header title="Edit issue" sub={truck ? `${truck.plate} · ${truck.model}` : ''} onBack={() => go('issues')} />
      <div style={{ padding: '0 16px 24px' }}>
        <Field label="What's the problem?" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: C.fg }}>Details</span>
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3} style={{ width: '100%', borderRadius: 11, border: `1px solid ${C.border}`, padding: 12, fontSize: 16, boxSizing: 'border-box', resize: 'vertical', background: C.surface, color: C.fg, fontFamily: 'inherit' }} />
        </label>

        <span style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: C.fg }}>Status</span>
        <div style={{ display: 'flex', gap: 7, marginBottom: 16 }}>
          {[['open', 'Open'], ['resolved', 'Resolved']].map(([k, l]) => (
            <button key={k} onClick={() => setStatus(k)} style={{ flex: 1, minHeight: 46, borderRadius: 11, cursor: 'pointer', fontWeight: 700, fontSize: 13.5,
              border: `1.5px solid ${status === k ? (k === 'open' ? C.danger : C.ok) : C.border}`, background: status === k ? (k === 'open' ? C.danger : C.ok) + '1A' : C.surface, color: status === k ? (k === 'open' ? C.danger : C.ok) : C.mutedFg }}>{l}</button>
          ))}
        </div>

        <span style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: C.fg }}>Severity</span>
        <div style={{ display: 'flex', gap: 7, marginBottom: 16 }}>
          {sevs.map((s) => (
            <button key={s} onClick={() => setSeverity(s)} style={{ flex: 1, minHeight: 46, borderRadius: 11, cursor: 'pointer', fontWeight: 700, textTransform: 'capitalize', fontSize: 13,
              border: `1.5px solid ${severity === s ? sevColor(s) : C.border}`, background: severity === s ? sevColor(s) + '1A' : C.surface, color: severity === s ? sevColor(s) : C.mutedFg }}>{s}</button>
          ))}
        </div>

        <span style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: C.fg }}>Photos &amp; video</span>
        <div style={{ marginBottom: 16 }}><MediaUpload value={media} onChange={setMedia} maxPhotos={8} allowVideo /></div>

        <ToggleRow label="Serious issue" desc="Flag for supervisor — needs parts or major repair" value={serious} onChange={setSerious} color={C.warn} />
        <ToggleRow label="Truck out of service" desc="Vehicle removed from duty until fixed" value={oos} onChange={setOos} color={C.crit} />
        {serious && <Field label="What's needed to fix it?" value={partsNeeded} onChange={(e) => setPartsNeeded(e.target.value)} placeholder="e.g. Center bolt + U-bolt set" />}

        <PrimaryBtn disabled={!title.trim()} onClick={() => onSave(issue.id, { title, detail, severity, status, serious, oos, partsNeeded, media })}>
          <Icon name="check" size={18} /> Save changes
        </PrimaryBtn>
        <button onClick={() => { if (confirm('Delete this issue? This cannot be undone.')) onDelete(issue.id); }}
          style={{ width: '100%', marginTop: 12, minHeight: 48, borderRadius: 13, cursor: 'pointer', fontWeight: 800, fontSize: 14, border: `1.5px solid ${C.danger}`, background: C.danger + '12', color: C.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="x" size={17} /> Delete issue
        </button>
      </div>
    </div>
  );
}

export function ToggleRow({ label, desc, value, onChange, color }) {
  return (
    <button onClick={() => onChange(!value)} style={{ ...rowStyle(), borderColor: value ? color : C.border, marginBottom: 14, alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: value ? color : C.fg, fontSize: 14.5 }}>{label}</div>
        <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ width: 46, height: 28, borderRadius: 999, background: value ? color : C.border, position: 'relative', transition: 'background .15s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 22, height: 22, borderRadius: 999, background: '#fff', transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
      </div>
    </button>
  );
}

const StepBtn = ({ children, ...p }) => (
  <button {...p} style={{ width: 32, height: 32, borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface, color: C.fg, fontSize: 18, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p.disabled ? .4 : 1 }}>{children}</button>
);

export function Inventory({ parts, multiFleet, fleetIds = ['IGL', 'MASSY'], go, onAdjust, canEdit }) {
  const [q, setQ] = useState('');
  const [f, setF] = useState('ALL');
  const list = parts.filter((p) => (f === 'ALL' || p.fleet === f || p.fleet === 'SHARED') && (p.name + p.sku).toLowerCase().includes(q.toLowerCase()));
  const low = parts.filter((p) => p.qty <= p.min).length;
  return (
    <div>
      <Header title="Inventory" sub={q.trim() ? `${list.length} of ${parts.length} parts` : `${parts.length} parts · ${low} low`}
        action={canEdit && <button onClick={() => go('newpart')} aria-label="New part" style={{ minWidth: 42, minHeight: 42, borderRadius: 12, border: 'none', background: C.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={20} color="#fff" /></button>} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.mutedFg, pointerEvents: 'none' }}><Icon name="search" size={18} /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search parts" placeholder="Search parts or SKU" style={{ width: '100%', minHeight: 48, padding: q ? '0 42px 0 40px' : '0 14px 0 40px', borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 16, boxSizing: 'border-box', background: C.surface, color: C.fg }} />
          {q && <button onClick={() => setQ('')} aria-label="Clear search" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.mutedFg }}><Icon name="x" size={18} /></button>}
        </div>
        {multiFleet && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['ALL', ...fleetIds].map((k) => <Chip key={k} active={f === k} onClick={() => setF(k)} small>{k === 'ALL' ? 'All' : (fleetRegistry[k]?.name || k)}</Chip>)}
          </div>
        )}
        {list.length === 0 && <EmptyNote icon="search">No parts match{q.trim() ? ` “${q.trim()}”` : ' these filters'}.</EmptyNote>}
        {list.map((p) => {
          const isLow = p.qty <= p.min;
          return (
            <div key={p.id} style={{ ...cardStyle(), padding: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: isLow ? C.danger + '18' : C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isLow ? C.danger : C.accent }}>
                <Icon name="pkg" size={21} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14.5, color: C.fg }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.mutedFg }}>{p.sku} · {p.location} · <FleetChip fleet={p.fleet} /></div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 54 }}>
                <div style={{ fontWeight: 800, fontSize: 22, color: isLow ? C.danger : C.fg, lineHeight: 1 }}>{p.qty}</div>
                {isLow ? <div style={{ fontSize: 10, color: C.danger, fontWeight: 800 }}>LOW · min {p.min}</div> : <div style={{ fontSize: 10.5, color: C.mutedFg }}>min {p.min}</div>}
              </div>
              {canEdit && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <StepBtn onClick={() => onAdjust(p.id, 1)}>+</StepBtn>
                <StepBtn onClick={() => onAdjust(p.id, -1)} disabled={p.qty <= 0}>−</StepBtn>
              </div>}
            </div>
          );
        })}
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

const triBtn = (active, color) => ({
  width: 38, height: 38, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: `1.5px solid ${active ? color : C.border}`, background: active ? color : C.surface,
});

export function NewCheck({ truck, onSave, go }) {
  const [state, setState] = useState({});
  const [noteState, setNoteState] = useState({});
  const [openNote, setOpenNote] = useState({});
  const [notes, setNotes] = useState('');
  const [missing, setMissing] = useState('');
  const [odometer, setOdometer] = useState(truck.odometer ? String(truck.odometer) : '');
  const [idleHrs, setIdleHrs] = useState(truck.idleHrs ? String(truck.idleHrs) : '');
  const set = (k, v) => setState((s) => ({ ...s, [k]: s[k] === v ? undefined : v }));
  const setNote = (k, v) => setNoteState((s) => ({ ...s, [k]: v }));
  const toggleNote = (k) => setOpenNote((s) => ({ ...s, [k]: !s[k] }));

  const allKeys = [];
  INSPECT_SINGLE.forEach((s) => allKeys.push(s));
  INSPECT_POSITIONS.forEach((p) => INSPECT_POSITION_CATS.forEach((c) => allKeys.push(p + ' · ' + c)));
  INSPECT_FLUIDS.forEach((s) => allKeys.push('Fluid · ' + s));
  INSPECT_DRIVETRAIN.forEach((s) => allKeys.push(s));
  const done = Object.values(state).filter(Boolean).length;
  const attn = Object.values(state).filter((v) => v === 'attn').length;
  const pct = Math.round((done / allKeys.length) * 100);

  const renderItem = (k, label) => {
    const v = state[k];
    const hasNote = !!(noteState[k] && noteState[k].trim());
    const open = !!openNote[k];
    return (
      <div key={k} style={{ padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flex: 1, fontSize: 13.5, color: C.fg, fontWeight: 600 }}>{label}</span>
          <button onClick={() => toggleNote(k)} aria-label="Note" style={{ ...triBtn(open || hasNote, C.accent), width: 34, height: 34 }}>
            <Icon name="edit" size={14} color={(open || hasNote) ? '#fff' : C.mutedFg} />
          </button>
          <button onClick={() => set(k, 'ok')} aria-label="OK" style={triBtn(v === 'ok', C.ok)}><Icon name="check" size={16} color={v === 'ok' ? '#fff' : C.mutedFg} /></button>
          <button onClick={() => set(k, 'attn')} aria-label="Needs attention" style={triBtn(v === 'attn', C.danger)}><Icon name="alert" size={15} color={v === 'attn' ? '#fff' : C.mutedFg} /></button>
        </div>
        {open && (
          <textarea autoFocus value={noteState[k] || ''} onChange={(e) => setNote(k, e.target.value)} rows={2}
            placeholder={`Note for ${label}…`}
            style={{ width: '100%', marginTop: 8, borderRadius: 10, border: `1px solid ${C.border}`, padding: 10, fontSize: 15, boxSizing: 'border-box', resize: 'vertical', background: C.surface2, color: C.fg, fontFamily: 'inherit' }} />
        )}
        {!open && hasNote && (
          <div onClick={() => toggleNote(k)} style={{ marginTop: 6, fontSize: 12, color: C.mutedFg, display: 'flex', gap: 6, cursor: 'pointer' }}>
            <Icon name="edit" size={12} color={C.accent} style={{ flexShrink: 0, marginTop: 1 }} /> <span>{noteState[k]}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <Header title="Weekly check" sub={`${truck.plate} · ${truck.model}`} onBack={() => go('truck', truck.id)} />
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ ...cardStyle(), padding: 14, marginBottom: 14, position: 'sticky', top: 0, zIndex: 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ fontWeight: 700, color: C.fg }}>{done}/{allKeys.length} checked</span>
            <span style={{ color: attn ? C.danger : C.mutedFg, fontWeight: 700 }}>{attn ? `${attn} need attention` : 'All good'}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: C.surface2, overflow: 'hidden' }}>
            <div style={{ width: pct + '%', height: '100%', background: C.accent }} />
          </div>
          <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 8, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <span><Icon name="check" size={12} style={{ verticalAlign: '-1px' }} /> tap = OK</span>
            <span><Icon name="alert" size={11} style={{ verticalAlign: '-1px' }} /> tap = needs attention</span>
            <span><Icon name="edit" size={11} style={{ verticalAlign: '-1px' }} /> add a note</span>
          </div>
        </div>

        <SectionTitle>Readings</SectionTitle>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><Field label="Odometer (mi)" value={odometer} onChange={(e) => setOdometer(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="0" /></div>
          <div style={{ flex: 1 }}><Field label="Idle hours" value={idleHrs} onChange={(e) => setIdleHrs(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" placeholder="0" /></div>
        </div>
        <div style={{ fontSize: 11.5, color: C.mutedFg, margin: '-6px 0 4px' }}>Updates the truck's readings with this check — not service history.</div>

        <SectionTitle>Steering &amp; drivetrain</SectionTitle>
        <div style={{ ...cardStyle(), padding: '4px 14px' }}>
          {INSPECT_SINGLE.map((s) => renderItem(s, s))}
          {INSPECT_DRIVETRAIN.map((s) => renderItem(s, s))}
        </div>
        <SectionTitle>Fluids</SectionTitle>
        <div style={{ ...cardStyle(), padding: '4px 14px' }}>
          {INSPECT_FLUIDS.map((s) => renderItem('Fluid · ' + s, s))}
        </div>
        {INSPECT_POSITIONS.map((pos) => (
          <React.Fragment key={pos}>
            <SectionTitle>{pos}</SectionTitle>
            <div style={{ ...cardStyle(), padding: '4px 14px' }}>
              {INSPECT_POSITION_CATS.map((c) => renderItem(pos + ' · ' + c, c))}
            </div>
          </React.Fragment>
        ))}

        <SectionTitle>Missing items</SectionTitle>
        <Field value={missing} onChange={(e) => setMissing(e.target.value)} placeholder="e.g. wheel chock, jack handle…" />
        <SectionTitle>Photos &amp; video</SectionTitle>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <MediaSlot kind="photo" /><MediaSlot kind="photo" /><MediaSlot kind="video" />
        </div>
        <SectionTitle>General comments</SectionTitle>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Anything to flag for the supervisor…" style={{ width: '100%', borderRadius: 11, border: `1px solid ${C.border}`, padding: 12, fontSize: 16, boxSizing: 'border-box', resize: 'vertical', marginBottom: 16, background: C.surface, color: C.fg, fontFamily: 'inherit' }} />
        <PrimaryBtn onClick={() => onSave(truck.id, { attn, results: state, notes: noteState, general: notes, missing, odometer: +odometer || 0, idleHrs: +idleHrs || 0 })} color={attn ? C.warn : C.accent}>
          <Icon name="checkc" size={18} /> {attn ? `Complete check (${attn} flagged)` : 'Complete check'}
        </PrimaryBtn>
      </div>
    </div>
  );
}

export function Reports({ trucks, issues, parts, fleet, go }) {
  const open = issues.filter((i) => i.status === 'open').length;
  const serious = issues.filter((i) => i.status === 'open' && i.serious).length;
  const oos = trucks.filter((t) => t.status === 'oos').length;
  const due = trucks.filter((t) => t.status === 'due' || t.status === 'overdue').length;
  const low = parts.filter((p) => p.qty <= p.min);
  const Stat = ({ v, l, c }) => (
    <div style={{ ...cardStyle(), padding: 14, flex: 1 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
      <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 5 }}>{l}</div>
    </div>
  );
  const Export = ({ icon, title, desc }) => (
    <button onClick={() => alert('Demo: this would generate a ' + title + '.')} style={{ ...rowStyle() }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent }}><Icon name={icon} size={20} /></div>
      <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14.5 }}>{title}</div><div style={{ fontSize: 12, color: C.mutedFg }}>{desc}</div></div>
      <Icon name="chevron" size={18} color={C.mutedFg} />
    </button>
  );
  return (
    <div>
      <Header title="Reports" sub={fleet === 'ALL' ? 'All fleets' : fleetRegistry[fleet]?.full || fleet} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionTitle>This week</SectionTitle>
        <div style={{ display: 'flex', gap: 10 }}><Stat v={due} l="Checks due" c={C.warn} /><Stat v={open} l="Open issues" c={C.danger} /></div>
        <div style={{ display: 'flex', gap: 10 }}><Stat v={oos} l="Out of service" c={C.crit} /><Stat v={low.length} l="Low stock" c={C.warn} /></div>
        <SectionTitle>Export</SectionTitle>
        <Export icon="file" title="Weekly summary (PDF)" desc="Checks, issues & OOS for the week" />
        <Export icon="list" title="Inventory (spreadsheet)" desc="Stock levels & re-order list" />
        <Export icon="truck" title="Fleet register (spreadsheet)" desc="All vehicles, certs & service dates" />
        {serious > 0 && <div style={{ ...cardStyle(), borderColor: C.crit, background: C.crit + '10', padding: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
          <Icon name="alert" size={20} color={C.crit} />
          <div style={{ fontSize: 13.5, color: C.fg }}><b style={{ color: C.crit }}>{serious} serious issue{serious > 1 ? 's' : ''}</b> flagged this week.</div>
        </div>}
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
