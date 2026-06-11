import React, { useState, useMemo } from "react";
import {
  Truck, Wrench, Boxes, ClipboardCheck, LogOut, Plus, Search,
  AlertTriangle, CheckCircle2, Clock, ChevronRight, Package,
  ArrowLeft, User, Calendar, X
} from "lucide-react";

// ---- Design tokens (B2B Service palette: professional navy + blue CTA) ----
const C = {
  primary: "#0F172A", onPrimary: "#FFFFFF", accent: "#0369A1",
  bg: "#F8FAFC", fg: "#020617", card: "#FFFFFF",
  muted: "#E8ECF1", mutedFg: "#64748B", border: "#E2E8F0",
  danger: "#DC2626", warn: "#D97706", ok: "#16A34A",
};

// ---- Seed data (stands in for Supabase tables) ----
const SEED_USERS = [
  { id: "u1", name: "Marlon Reid", role: "Mechanic", email: "marlon@igl.com", pin: "1234" },
  { id: "u2", name: "Supervisor", role: "Supervisor", email: "super@igl.com", pin: "0000" },
];

const SEED_TRUCKS = [
  { id: "t1", reg: "IGL-204", model: "Isuzu FVR", lastCheck: "2026-06-08", status: "ok" },
  { id: "t2", reg: "IGL-318", model: "Hino 500", lastCheck: "2026-06-02", status: "due" },
  { id: "t3", reg: "MGP-077", model: "Mack Granite", lastCheck: "2026-05-28", status: "overdue" },
];

const SEED_PARTS = [
  { id: "p1", name: "Oil Filter (FVR)", sku: "OF-204", qty: 14, min: 5, location: "Bay A — Shelf 2" },
  { id: "p2", name: "Brake Pad Set", sku: "BP-100", qty: 3, min: 4, location: "Bay A — Shelf 5" },
  { id: "p3", name: "Air Filter", sku: "AF-330", qty: 22, min: 6, location: "Bay B — Shelf 1" },
  { id: "p4", name: "Coolant 5L", sku: "CL-500", qty: 9, min: 3, location: "Store Room" },
];

const SEED_ISSUES = [
  { id: "i1", truckId: "t3", title: "Brake squeal front axle", severity: "high", status: "open", date: "2026-06-09", by: "Marlon Reid" },
  { id: "i2", truckId: "t2", title: "Coolant level low", severity: "medium", status: "open", date: "2026-06-07", by: "Marlon Reid" },
  { id: "i3", truckId: "t1", title: "Wiper blade worn", severity: "low", status: "resolved", date: "2026-06-04", by: "Marlon Reid" },
];

// parts that have been used / fitted to a truck
const SEED_USAGE = [
  { id: "us1", partId: "p1", truckId: "t1", qty: 1, date: "2026-06-08", by: "Marlon Reid" },
  { id: "us2", partId: "p3", truckId: "t2", qty: 2, date: "2026-06-02", by: "Marlon Reid" },
];

const CHECK_ITEMS = [
  "Engine oil level", "Coolant level", "Brakes & pads", "Tyres & pressure",
  "Lights & indicators", "Wipers & washers", "Battery terminals", "Leaks (oil/fuel/air)",
];

// ---- Small UI helpers ----
const Badge = ({ children, color }) => (
  <span style={{
    fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999,
    background: color + "1A", color, whiteSpace: "nowrap",
  }}>{children}</span>
);

const sevColor = (s) => (s === "high" ? C.danger : s === "medium" ? C.warn : C.mutedFg);
const statusColor = (s) => (s === "overdue" ? C.danger : s === "due" ? C.warn : C.ok);

const Field = ({ label, ...p }) => (
  <label style={{ display: "block", marginBottom: 14 }}>
    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.fg, marginBottom: 6 }}>{label}</span>
    <input {...p} style={{
      width: "100%", minHeight: 46, padding: "0 14px", fontSize: 16, color: C.fg,
      border: `1px solid ${C.border}`, borderRadius: 10, background: C.card, outline: "none",
      boxSizing: "border-box",
    }} />
  </label>
);

const PrimaryBtn = ({ children, ...p }) => (
  <button {...p} style={{
    width: "100%", minHeight: 50, border: "none", borderRadius: 12, cursor: "pointer",
    background: C.accent, color: "#fff", fontSize: 16, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8, ...(p.style || {}),
  }}>{children}</button>
);

// ---- Screens ----
function Login({ onLogin }) {
  const [email, setEmail] = useState("marlon@igl.com");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    const u = SEED_USERS.find((x) => x.email === email.trim() && x.pin === pin.trim());
    if (u) onLogin(u); else setErr("Email or PIN is incorrect.");
  };
  return (
    <div style={{ minHeight: "100%", background: C.primary, display: "flex", flexDirection: "column", justifyContent: "center", padding: 24 }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
        <Truck size={30} color="#fff" />
      </div>
      <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: "0 0 4px" }}>Fleet Maintenance</h1>
      <p style={{ color: "#94A3B8", margin: "0 0 28px", fontSize: 14 }}>Sign in to log checks, issues and parts.</p>
      <div style={{ background: C.card, borderRadius: 16, padding: 20 }}>
        <Field label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        <Field label="PIN" value={pin} onChange={(e) => setPin(e.target.value)} type="password" placeholder="1234" inputMode="numeric" />
        {err && <p style={{ color: C.danger, fontSize: 13, margin: "0 0 12px" }}>{err}</p>}
        <PrimaryBtn onClick={submit}>Sign in</PrimaryBtn>
        <p style={{ color: C.mutedFg, fontSize: 12, textAlign: "center", marginTop: 14 }}>Demo PIN: 1234 (mechanic) · 0000 (supervisor)</p>
      </div>
    </div>
  );
}

function Header({ title, onBack, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 16px 10px" }}>
      {onBack && (
        <button onClick={onBack} style={{ minWidth: 40, minHeight: 40, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={22} color={C.fg} />
        </button>
      )}
      <h2 style={{ flex: 1, margin: 0, fontSize: 22, fontWeight: 800, color: C.fg }}>{title}</h2>
      {action}
    </div>
  );
}

function Dashboard({ trucks, issues, parts, go }) {
  const openIssues = issues.filter((i) => i.status === "open").length;
  const lowStock = parts.filter((p) => p.qty <= p.min).length;
  const dueChecks = trucks.filter((t) => t.status !== "ok").length;
  const Stat = ({ icon, label, value, color, onClick }) => (
    <button onClick={onClick} style={{ flex: 1, textAlign: "left", background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, cursor: "pointer", minHeight: 90 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.fg, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 4 }}>{label}</div>
    </button>
  );
  return (
    <div>
      <Header title="Overview" />
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <Stat icon={<ClipboardCheck size={20} />} value={dueChecks} label="Checks due" color={C.warn} onClick={() => go("checks")} />
          <Stat icon={<AlertTriangle size={20} />} value={openIssues} label="Open issues" color={C.danger} onClick={() => go("issues")} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Stat icon={<Boxes size={20} />} value={lowStock} label="Low-stock parts" color={C.warn} onClick={() => go("inventory")} />
          <Stat icon={<Truck size={20} />} value={trucks.length} label="Trucks" color={C.accent} onClick={() => go("trucks")} />
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.fg, margin: "10px 0 2px" }}>Trucks needing attention</h3>
        {trucks.filter((t) => t.status !== "ok").map((t) => (
          <button key={t.id} onClick={() => go("truck", t.id)} style={rowStyle}>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontWeight: 700, color: C.fg }}>{t.reg}</div>
              <div style={{ fontSize: 12, color: C.mutedFg }}>{t.model} · last check {t.lastCheck}</div>
            </div>
            <Badge color={statusColor(t.status)}>{t.status.toUpperCase()}</Badge>
            <ChevronRight size={18} color={C.mutedFg} />
          </button>
        ))}
      </div>
    </div>
  );
}

const rowStyle = {
  display: "flex", alignItems: "center", gap: 10, width: "100%",
  background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
  padding: 14, minHeight: 60, cursor: "pointer",
};

function Trucks({ trucks, go }) {
  return (
    <div>
      <Header title="Trucks" />
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {trucks.map((t) => (
          <button key={t.id} onClick={() => go("truck", t.id)} style={rowStyle}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Truck size={20} color={C.primary} />
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontWeight: 700, color: C.fg }}>{t.reg}</div>
              <div style={{ fontSize: 12, color: C.mutedFg }}>{t.model}</div>
            </div>
            <Badge color={statusColor(t.status)}>{t.status.toUpperCase()}</Badge>
            <ChevronRight size={18} color={C.mutedFg} />
          </button>
        ))}
      </div>
    </div>
  );
}

function TruckDetail({ truck, issues, usage, parts, go }) {
  const tIssues = issues.filter((i) => i.truckId === truck.id);
  const tUsage = usage.filter((u) => u.truckId === truck.id);
  const partName = (id) => parts.find((p) => p.id === id)?.name || "—";
  return (
    <div>
      <Header title={truck.reg} onBack={() => go("trucks")} />
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 13, color: C.mutedFg }}>{truck.model}</div>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            <div><div style={{ fontSize: 11, color: C.mutedFg }}>Last check</div><div style={{ fontWeight: 700 }}>{truck.lastCheck}</div></div>
            <div><div style={{ fontSize: 11, color: C.mutedFg }}>Status</div><Badge color={statusColor(truck.status)}>{truck.status.toUpperCase()}</Badge></div>
          </div>
        </div>
        <PrimaryBtn onClick={() => go("newcheck", truck.id)}><ClipboardCheck size={18} /> Start weekly check</PrimaryBtn>

        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "6px 0 0" }}>Issues</h3>
        {tIssues.length === 0 && <p style={{ color: C.mutedFg, fontSize: 13 }}>No issues logged.</p>}
        {tIssues.map((i) => (
          <div key={i.id} style={{ ...rowStyle, cursor: "default" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{i.title}</div>
              <div style={{ fontSize: 12, color: C.mutedFg }}>{i.date}</div>
            </div>
            <Badge color={sevColor(i.severity)}>{i.severity}</Badge>
            <Badge color={i.status === "open" ? C.danger : C.ok}>{i.status}</Badge>
          </div>
        ))}

        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "6px 0 0" }}>Parts fitted to this truck</h3>
        {tUsage.length === 0 && <p style={{ color: C.mutedFg, fontSize: 13 }}>No parts recorded.</p>}
        {tUsage.map((u) => (
          <div key={u.id} style={{ ...rowStyle, cursor: "default" }}>
            <Package size={18} color={C.accent} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{partName(u.partId)}</div>
              <div style={{ fontSize: 12, color: C.mutedFg }}>Qty {u.qty} · {u.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Issues({ issues, trucks, go }) {
  const reg = (id) => trucks.find((t) => t.id === id)?.reg || "—";
  return (
    <div>
      <Header title="Issues" action={<button onClick={() => go("newissue")} style={addBtn}><Plus size={20} color="#fff" /></button>} />
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {issues.map((i) => (
          <div key={i.id} style={{ ...rowStyle, cursor: "default", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{i.title}</div>
              <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 2 }}>{reg(i.truckId)} · {i.by} · {i.date}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <Badge color={sevColor(i.severity)}>{i.severity}</Badge>
                <Badge color={i.status === "open" ? C.danger : C.ok}>{i.status}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const addBtn = { minWidth: 40, minHeight: 40, borderRadius: 12, border: "none", background: C.accent, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };

function NewIssue({ trucks, onSave, go }) {
  const [truckId, setTruckId] = useState(trucks[0].id);
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("medium");
  return (
    <div>
      <Header title="New issue" onBack={() => go("issues")} />
      <div style={{ padding: "0 16px" }}>
        <label style={{ display: "block", marginBottom: 14 }}>
          <span style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Truck</span>
          <select value={truckId} onChange={(e) => setTruckId(e.target.value)} style={{ width: "100%", minHeight: 46, borderRadius: 10, border: `1px solid ${C.border}`, padding: "0 12px", fontSize: 16, background: C.card }}>
            {trucks.map((t) => <option key={t.id} value={t.id}>{t.reg} — {t.model}</option>)}
          </select>
        </label>
        <Field label="What's the problem?" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Brake squeal front axle" />
        <label style={{ display: "block", marginBottom: 18 }}>
          <span style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Severity</span>
          <div style={{ display: "flex", gap: 8 }}>
            {["low", "medium", "high"].map((s) => (
              <button key={s} onClick={() => setSeverity(s)} style={{ flex: 1, minHeight: 44, borderRadius: 10, cursor: "pointer", fontWeight: 700, textTransform: "capitalize", border: `1px solid ${severity === s ? sevColor(s) : C.border}`, background: severity === s ? sevColor(s) + "1A" : C.card, color: severity === s ? sevColor(s) : C.mutedFg }}>{s}</button>
            ))}
          </div>
        </label>
        <PrimaryBtn disabled={!title.trim()} onClick={() => onSave({ truckId, title, severity })} style={{ opacity: title.trim() ? 1 : 0.5 }}>Save issue</PrimaryBtn>
      </div>
    </div>
  );
}

function Inventory({ parts, go }) {
  const [q, setQ] = useState("");
  const list = parts.filter((p) => (p.name + p.sku).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <Header title="Inventory" />
      <div style={{ padding: "0 16px" }}>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Search size={18} color={C.mutedFg} style={{ position: "absolute", left: 12, top: 14 }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search parts or SKU" style={{ width: "100%", minHeight: 46, padding: "0 12px 0 38px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 16, boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map((p) => {
            const low = p.qty <= p.min;
            return (
              <div key={p.id} style={{ ...rowStyle, cursor: "default" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: low ? C.danger + "1A" : C.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={20} color={low ? C.danger : C.primary} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: C.mutedFg }}>{p.sku} · {p.location}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: low ? C.danger : C.fg }}>{p.qty}</div>
                  {low && <div style={{ fontSize: 10, color: C.danger, fontWeight: 600 }}>LOW (min {p.min})</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NewCheck({ truck, onSave, go }) {
  const [checked, setChecked] = useState({});
  const [notes, setNotes] = useState("");
  const toggle = (item) => setChecked((c) => ({ ...c, [item]: !c[item] }));
  const done = Object.values(checked).filter(Boolean).length;
  return (
    <div>
      <Header title={`Weekly check — ${truck.reg}`} onBack={() => go("truck", truck.id)} />
      <div style={{ padding: "0 16px" }}>
        <div style={{ fontSize: 13, color: C.mutedFg, marginBottom: 10 }}>{done}/{CHECK_ITEMS.length} items checked</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {CHECK_ITEMS.map((item) => (
            <button key={item} onClick={() => toggle(item)} style={{ ...rowStyle, justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600, color: C.fg }}>{item}</span>
              {checked[item] ? <CheckCircle2 size={24} color={C.ok} /> : <div style={{ width: 22, height: 22, borderRadius: 999, border: `2px solid ${C.border}` }} />}
            </button>
          ))}
        </div>
        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Anything to flag…" style={{ width: "100%", borderRadius: 10, border: `1px solid ${C.border}`, padding: 12, fontSize: 16, boxSizing: "border-box", resize: "vertical" }} />
        </label>
        <PrimaryBtn onClick={() => onSave(truck.id)}><CheckCircle2 size={18} /> Complete check</PrimaryBtn>
      </div>
    </div>
  );
}

// ---- App shell with bottom nav ----
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [route, setRoute] = useState({ name: "dashboard", param: null });
  const [trucks, setTrucks] = useState(SEED_TRUCKS);
  const [issues, setIssues] = useState(SEED_ISSUES);
  const [parts] = useState(SEED_PARTS);
  const [usage] = useState(SEED_USAGE);
  const [toast, setToast] = useState("");

  const go = (name, param = null) => {
    setRoute({ name, param });
    if (["dashboard", "trucks", "issues", "inventory", "checks"].includes(name)) setTab(name);
  };
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };

  if (!user) return <Frame><Login onLogin={(u) => { setUser(u); go("dashboard"); }} /></Frame>;

  const today = "2026-06-11";
  const saveIssue = ({ truckId, title, severity }) => {
    setIssues((arr) => [{ id: "i" + Date.now(), truckId, title, severity, status: "open", date: today, by: user.name }, ...arr]);
    showToast("Issue saved"); go("issues");
  };
  const completeCheck = (truckId) => {
    setTrucks((arr) => arr.map((t) => t.id === truckId ? { ...t, status: "ok", lastCheck: today } : t));
    showToast("Weekly check completed"); go("truck", truckId);
  };

  let screen;
  switch (route.name) {
    case "trucks": screen = <Trucks trucks={trucks} go={go} />; break;
    case "truck": screen = <TruckDetail truck={trucks.find((t) => t.id === route.param)} issues={issues} usage={usage} parts={parts} go={go} />; break;
    case "issues": screen = <Issues issues={issues} trucks={trucks} go={go} />; break;
    case "newissue": screen = <NewIssue trucks={trucks} onSave={saveIssue} go={go} />; break;
    case "inventory": screen = <Inventory parts={parts} go={go} />; break;
    case "checks": screen = <Trucks trucks={trucks} go={go} />; break;
    case "newcheck": screen = <NewCheck truck={trucks.find((t) => t.id === route.param)} onSave={completeCheck} go={go} />; break;
    default: screen = <Dashboard trucks={trucks} issues={issues} parts={parts} go={go} />;
  }

  const navItems = [
    { id: "dashboard", icon: Wrench, label: "Home" },
    { id: "trucks", icon: Truck, label: "Trucks" },
    { id: "issues", icon: AlertTriangle, label: "Issues" },
    { id: "inventory", icon: Boxes, label: "Stock" },
  ];

  return (
    <Frame>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.mutedFg }}>
            <User size={14} /> {user.name} · {user.role}
          </div>
          <button onClick={() => { setUser(null); }} style={{ display: "flex", alignItems: "center", gap: 4, border: "none", background: "transparent", color: C.mutedFg, fontSize: 12, cursor: "pointer", minHeight: 36 }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>{screen}</div>
        {toast && (
          <div style={{ position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)", background: C.primary, color: "#fff", padding: "10px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle2 size={16} color={C.ok} /> {toast}
          </div>
        )}
        <nav style={{ display: "flex", borderTop: `1px solid ${C.border}`, background: C.card }}>
          {navItems.map((n) => {
            const active = tab === n.id;
            const Icon = n.icon;
            return (
              <button key={n.id} onClick={() => go(n.id)} style={{ flex: 1, minHeight: 60, border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, color: active ? C.accent : C.mutedFg }}>
                <Icon size={22} />
                <span style={{ fontSize: 11, fontWeight: active ? 700 : 500 }}>{n.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </Frame>
  );
}

// Phone frame so the mobile layout is clear in preview
function Frame({ children }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 16, background: "#1E293B", minHeight: "100vh", fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 390, height: 780, background: C.bg, borderRadius: 28, overflow: "hidden", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,.4)" }}>
        {children}
      </div>
    </div>
  );
}
