// nm-ui.jsx — shared UI: theme engine, icons, primitives, phone frame
const { useState, useRef, useEffect } = React;

// Live theme object; App calls applyTheme() each render before children render.
const C = { ...window.THEMES.navy };
function applyTheme(themeKey, accent2) {
  Object.assign(C, window.THEMES[themeKey] || window.THEMES.navy);
  if (accent2) C.accent2 = accent2;
}

// ---------- Minimal stroke icon set (24x24) ----------
const PATHS = {
  home:   "M3 11.5 12 4l9 7.5M5 10v9h5v-5h4v5h5v-9",
  truck:  "M3 6h11v9H3zM14 9h4l3 3v3h-7M6.5 18.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zM17.5 18.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z",
  alert:  "M12 3 22 19H2L12 3zM12 9v5M12 17h.01",
  box:    "M12 3 21 7.5v9L12 21 3 16.5v-9L12 3zM3 7.5 12 12l9-4.5M12 12v9",
  clip:   "M9 4h6v3H9zM7 5H5v15h14V5h-2M8.5 12l2 2 4-4",
  plus:   "M12 5v14M5 12h14",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  back:   "M14 6l-6 6 6 6",
  chevron:"M9 6l6 6-6 6",
  check:  "M5 12l4 4 10-10",
  checkc: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 12l2.5 2.5 5-5",
  pkg:    "M12 3 21 7.5v9L12 21 3 16.5v-9L12 3zM3 7.5 12 12l9-4.5M12 12v9M7.5 5.2 16.5 9.7",
  user:   "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20c0-3.3 3.1-5 7-5s7 1.7 7 5",
  logout: "M15 5h4v14h-4M10 8l-4 4 4 4M6 12h9",
  x:      "M6 6l12 12M18 6 6 18",
  camera: "M4 8h3l2-2h6l2 2h3v11H4zM12 16.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  cal:    "M5 5h14v15H5zM5 9h14M9 3v3M15 3v3",
  gauge:  "M21 14a9 9 0 1 0-18 0M12 14l4-4M12 14a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8z",
  wrench: "M21 7a4 4 0 0 1-5.3 3.8L8 18.5 5.5 16l7.7-7.7A4 4 0 0 1 17 3l-2.5 2.5L16 7l1.5 1.5L20 6",
  fire:   "M12 3c1 3-2 4-2 7a3 3 0 0 0 6 0c0-1-.5-2-1-2.5C16 11 17 13 17 15a5 5 0 0 1-10 0c0-4 3-5 5-12z",
  shield: "M12 3 20 6v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6l8-3z",
  ban:    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM6 6l12 12",
  cog:    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13a7.8 7.8 0 0 0 0-2l2-1.5-2-3.4-2.3 1a7.8 7.8 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7.8 7.8 0 0 0-1.7 1l-2.3-1-2 3.4L4.6 11a7.8 7.8 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7.8 7.8 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7.8 7.8 0 0 0 1.7-1l2.3 1 2-3.4z",
  file:   "M7 3h7l4 4v14H7zM14 3v4h4M9 12h7M9 16h7",
  bell:   "M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 21h4",
  swap:   "M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8",
  pin:    "M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  drop:   "M12 3c3.5 4.5 6 7.5 6 11a6 6 0 1 1-12 0c0-3.5 2.5-6.5 6-11z",
  list:   "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  video:  "M3 7h12v10H3zM15 10.5 21 7v10l-6-3.5z",
  receipt:"M6 3h12v18l-2.5-1.6L13 21l-2.5-1.6L8 21l-2.5-1.6L6 21zM9 8h6M9 12h6M9 16h3",
  layers: "M12 3 21 8l-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5",
  edit:   "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  dots:   "M5 12h.01M12 12h.01M19 12h.01",
  money:  "M12 3v18M16 7.5C16 5.6 14.2 4.5 12 4.5S8 5.6 8 7.5 9.8 10 12 10.5s4 1 4 3-1.8 3-4 3-4-1.1-4-3",
};
function Icon({ name, size = 22, color = "currentColor", fill = "none", strokeWidth = 1.9, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={PATHS[name] || ""} />
    </svg>
  );
}

// ---------- color helpers ----------
const sevColor = (s) => s === "critical" ? C.crit : s === "high" ? C.danger : s === "medium" ? C.warn : C.mutedFg;
const statusColor = (s) => s === "oos" ? C.crit : s === "overdue" ? C.danger : s === "due" ? C.warn : C.ok;
const statusLabel = (s) => s === "oos" ? "OUT OF SERVICE" : s.toUpperCase();
const fmtDate = (iso) => { if (!iso) return "—"; const d = new Date(iso + "T00:00"); return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };
const fmtNum = (n) => (n == null ? "—" : Number(n).toLocaleString("en-US"));
const daysUntil = (iso) => Math.round((new Date(iso + "T00:00") - new Date("2026-06-11T00:00")) / 86400000);

// ---------- primitives ----------
const Badge = ({ children, color, solid }) => (
  <span style={{
    fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, letterSpacing: ".01em",
    background: solid ? color : color + "1A", color: solid ? "#fff" : color, whiteSpace: "nowrap",
    display: "inline-flex", alignItems: "center", gap: 4, lineHeight: 1.2,
  }}>{children}</span>
);

const cardStyle = () => ({ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: "0 1px 2px rgba(11,26,43,.04), 0 12px 28px -20px rgba(11,26,43,.22)" });
const rowStyle = () => ({
  display: "flex", alignItems: "center", gap: 12, width: "100%",
  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
  padding: 14, minHeight: 60, cursor: "pointer", textAlign: "left",
  color: C.fg, font: "inherit",
});

const Field = ({ label, hint, ...p }) => (
  <label style={{ display: "block", marginBottom: 14 }}>
    {label && <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.fg, marginBottom: 6 }}>{label}</span>}
    <input {...p} style={{
      width: "100%", minHeight: 48, padding: "0 14px", fontSize: 16, color: C.fg,
      border: `1px solid ${C.border}`, borderRadius: 11, background: C.surface, outline: "none",
      boxSizing: "border-box", ...(p.style || {}),
    }} />
    {hint && <span style={{ display: "block", fontSize: 12, color: C.mutedFg, marginTop: 5 }}>{hint}</span>}
  </label>
);

const Select = ({ label, children, ...p }) => (
  <label style={{ display: "block", marginBottom: 14 }}>
    {label && <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.fg, marginBottom: 6 }}>{label}</span>}
    <select {...p} style={{
      width: "100%", minHeight: 48, borderRadius: 11, border: `1px solid ${C.border}`,
      padding: "0 12px", fontSize: 16, background: C.surface, color: C.fg, boxSizing: "border-box",
    }}>{children}</select>
  </label>
);

const PrimaryBtn = ({ children, color, ...p }) => (
  <button {...p} style={{
    width: "100%", minHeight: 52, border: "none", borderRadius: 13, cursor: "pointer",
    background: color || C.accent, color: "#fff", fontSize: 16, fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 9, whiteSpace: "nowrap",
    opacity: p.disabled ? 0.45 : 1, ...(p.style || {}),
  }}>{children}</button>
);

const GhostBtn = ({ children, ...p }) => (
  <button {...p} style={{
    minHeight: 44, border: `1px solid ${C.border}`, borderRadius: 11, cursor: "pointer",
    background: C.surface, color: C.fg, fontSize: 14, fontWeight: 700, padding: "0 14px",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, whiteSpace: "nowrap", ...(p.style || {}),
  }}>{children}</button>
);

function Header({ title, sub, onBack, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px 8px" }}>
      {onBack && (
        <button onClick={onBack} aria-label="Back" style={{ minWidth: 40, minHeight: 40, marginLeft: -8, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", color: C.fg }}>
          <Icon name="back" />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.fg, lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h2>
        {sub && <div style={{ fontSize: 12.5, color: C.mutedFg, marginTop: 2 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

// Photo placeholder slot (camera/upload affordance)
function PhotoSlot({ label = "Add photo", filled }) {
  const [added, setAdded] = useState(filled);
  return (
    <button onClick={() => setAdded(true)} style={{
      width: 84, height: 84, flexShrink: 0, borderRadius: 12, cursor: "pointer",
      border: `1.5px dashed ${added ? C.accent : C.border}`,
      background: added ? C.accent + "14" : C.surface2, color: added ? C.accent : C.mutedFg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
      fontSize: 10.5, fontWeight: 700, padding: 4,
    }}>
      <Icon name="camera" size={22} />
      <span style={{ textAlign: "center", lineHeight: 1.1 }}>{added ? "Photo ✓" : label}</span>
    </button>
  );
}

// Media slot — photo OR video upload affordance (user fills in the real app)
function MediaSlot({ label, kind = "photo" }) {
  const [added, setAdded] = useState(false);
  const isVid = kind === "video";
  return (
    <button onClick={() => setAdded(true)} style={{
      width: 84, height: 84, flexShrink: 0, borderRadius: 12, cursor: "pointer",
      border: `1.5px dashed ${added ? C.accent : C.border}`,
      background: added ? C.accent + "14" : C.surface2, color: added ? C.accent : C.mutedFg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5,
      fontSize: 10.5, fontWeight: 700, padding: 4,
    }}>
      <Icon name={isVid ? "video" : "camera"} size={22} />
      <span style={{ textAlign: "center", lineHeight: 1.1 }}>{added ? (isVid ? "Video ✓" : "Photo ✓") : (label || (isVid ? "Add video" : "Add photo"))}</span>
    </button>
  );
}

const SectionTitle = ({ children, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "14px 0 2px" }}>
    <h3 style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: C.mutedFg, margin: 0 }}>{children}</h3>
    {right}
  </div>
);

// ---------- adaptive phone frame ----------
function PhoneFrame({ children, brandFont }) {
  const [wide, setWide] = useState(typeof window !== "undefined" && window.innerWidth > 520);
  useEffect(() => {
    const f = () => setWide(window.innerWidth > 520);
    window.addEventListener("resize", f); return () => window.removeEventListener("resize", f);
  }, []);
  const screen = (
    <div style={{ width: "100%", height: "100%", background: C.bg, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: brandFont }}>
      {children}
    </div>
  );
  if (!wide) {
    return <div style={{ position: "fixed", inset: 0, fontFamily: brandFont }}>{screen}</div>;
  }
  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0F16", padding: 24, boxSizing: "border-box", fontFamily: brandFont }}>
      <div style={{ width: 402, height: 844, maxHeight: "94vh", borderRadius: 46, padding: 12, background: "linear-gradient(145deg,#222C39,#0D131C)", boxShadow: "0 40px 90px rgba(0,0,0,.55), inset 0 1px 2px rgba(255,255,255,.12)", position: "relative" }}>
        <div style={{ position: "absolute", top: 22, left: "50%", transform: "translateX(-50%)", width: 120, height: 30, background: "#05080D", borderRadius: 999, zIndex: 50 }} />
        <div style={{ width: "100%", height: "100%", borderRadius: 36, overflow: "hidden", position: "relative" }}>{screen}</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  C, applyTheme, Icon, sevColor, statusColor, statusLabel, fmtDate, fmtNum, daysUntil,
  Badge, cardStyle, rowStyle, Field, Select, PrimaryBtn, GhostBtn, Header, PhotoSlot, MediaSlot,
  SectionTitle, PhoneFrame,
});
