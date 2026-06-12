// ui.jsx — shared UI: theme engine, icons, primitives, phone frame
import React, { useState, useRef, useEffect } from 'react';
import { THEMES } from './data.js';

import markNavy from '../public/assets/nodrog-mark.svg';
import markLight from '../public/assets/nodrog-mark-light.svg';
export { markNavy, markLight };

// Live theme object; App calls applyTheme() each render before children render.
export const C = { ...THEMES.navy };
export function applyTheme(themeKey, accent2) {
  Object.assign(C, THEMES[themeKey] || THEMES.navy);
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
  eye:    "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeoff: "M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.2A9.6 9.6 0 0 1 12 5c6.4 0 10 7 10 7a18 18 0 0 1-3.1 3.9M6.2 6.2A18 18 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 3-.5",
  share:  "M12 3v13M12 3l-4 4M12 3l4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7",
  video:  "M3 7h12v10H3zM15 10.5 21 7v10l-6-3.5z",
  receipt:"M6 3h12v18l-2.5-1.6L13 21l-2.5-1.6L8 21l-2.5-1.6L6 21zM9 8h6M9 12h6M9 16h3",
  layers: "M12 3 21 8l-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5",
  edit:   "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  dots:   "M5 12h.01M12 12h.01M19 12h.01",
  money:  "M12 3v18M16 7.5C16 5.6 14.2 4.5 12 4.5S8 5.6 8 7.5 9.8 10 12 10.5s4 1 4 3-1.8 3-4 3-4-1.1-4-3",
};
export function Icon({ name, size = 22, color = "currentColor", fill = "none", strokeWidth = 1.9, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={PATHS[name] || ""} />
    </svg>
  );
}

// ---------- color helpers ----------
export const sevColor = (s) => s === "critical" ? C.crit : s === "high" ? C.danger : s === "medium" ? C.warn : C.mutedFg;
export const statusColor = (s) => s === "oos" ? C.crit : s === "overdue" ? C.danger : s === "due" ? C.warn : C.ok;
export const statusLabel = (s) => s === "oos" ? "OUT OF SERVICE" : s.toUpperCase();
export const fmtDate = (iso) => { if (!iso) return "—"; const d = new Date(iso + "T00:00"); return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };
export const fmtNum = (n) => (n == null ? "—" : Number(n).toLocaleString("en-US"));
export const daysUntil = (iso) => { if (!iso) return NaN; const todayIso = new Date().toISOString().slice(0, 10); return Math.round((new Date(iso + "T00:00") - new Date(todayIso + "T00:00")) / 86400000); };

// ---------- primitives ----------
export const Badge = ({ children, color, solid }) => (
  <span style={{
    fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, letterSpacing: ".01em",
    background: solid ? color : color + "1A", color: solid ? "#fff" : color, whiteSpace: "nowrap",
    display: "inline-flex", alignItems: "center", gap: 4, lineHeight: 1.2,
  }}>{children}</span>
);

export const cardStyle = () => ({ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: "0 1px 2px rgba(11,26,43,.04), 0 12px 28px -20px rgba(11,26,43,.22)" });
export const rowStyle = () => ({
  display: "flex", alignItems: "center", gap: 12, width: "100%",
  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
  padding: 14, minHeight: 60, cursor: "pointer", textAlign: "left",
  color: C.fg, font: "inherit",
});

export const Field = ({ label, hint, ...p }) => (
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

export const Select = ({ label, children, ...p }) => (
  <label style={{ display: "block", marginBottom: 14 }}>
    {label && <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.fg, marginBottom: 6 }}>{label}</span>}
    <select {...p} style={{
      width: "100%", minHeight: 48, borderRadius: 11, border: `1px solid ${C.border}`,
      padding: "0 12px", fontSize: 16, background: C.surface, color: C.fg, boxSizing: "border-box",
    }}>{children}</select>
  </label>
);

export const PrimaryBtn = ({ children, color, ...p }) => (
  <button {...p} style={{
    width: "100%", minHeight: 52, border: "none", borderRadius: 13, cursor: "pointer",
    background: color || C.accent, color: "#fff", fontSize: 16, fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 9, whiteSpace: "nowrap",
    opacity: p.disabled ? 0.45 : 1, ...(p.style || {}),
  }}>{children}</button>
);

export const GhostBtn = ({ children, ...p }) => (
  <button {...p} style={{
    minHeight: 44, border: `1px solid ${C.border}`, borderRadius: 11, cursor: "pointer",
    background: C.surface, color: C.fg, fontSize: 14, fontWeight: 700, padding: "0 14px",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, whiteSpace: "nowrap", ...(p.style || {}),
  }}>{children}</button>
);

export function Header({ title, sub, onBack, action }) {
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
export function PhotoSlot({ label = "Add photo", filled }) {
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
export function MediaSlot({ label, kind = "photo" }) {
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

// Downscale an image File to a JPEG data URL (keeps localStorage/payloads small).
function fileToScaledImage(file, maxDim = 1280, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round(height * maxDim / width); width = maxDim; }
        else if (height > maxDim) { width = Math.round(width * maxDim / height); height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve({ type: "image", url: canvas.toDataURL("image/jpeg", quality), name: file.name });
      };
      img.onerror = () => resolve(null);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function fileToDataUrl(file, type) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve({ type, url: e.target.result, name: file.name });
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

// Real media uploader: multiple photos + optional video, with previews and remove.
// `value` is an array of { type:'image'|'video', url, name }; `onChange` replaces it.
export function MediaUpload({ value = [], onChange, maxPhotos = 8, allowVideo = true }) {
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const photos = value.filter((m) => m.type === "image");
  const videos = value.filter((m) => m.type === "video");

  const addPhotos = async (files) => {
    if (!files || !files.length) return;
    setBusy(true);
    const room = maxPhotos - photos.length;
    const picked = Array.from(files).slice(0, Math.max(0, room));
    const added = (await Promise.all(picked.map((f) => fileToScaledImage(f)))).filter(Boolean);
    onChange([...value, ...added]);
    setBusy(false);
  };
  const addVideo = async (files) => {
    const file = files && files[0];
    if (!file) return;
    setBusy(true);
    const v = await fileToDataUrl(file, "video");
    if (v) onChange([...value.filter((m) => m.type !== "video"), v]); // one video
    setBusy(false);
  };
  const removeAt = (item) => onChange(value.filter((m) => m !== item));

  const tile = (extra) => ({
    width: 84, height: 84, flexShrink: 0, borderRadius: 12, position: "relative",
    border: `1.5px solid ${C.border}`, overflow: "hidden", background: C.surface2, ...extra,
  });
  const addTile = {
    width: 84, height: 84, flexShrink: 0, borderRadius: 12, cursor: "pointer",
    border: `1.5px dashed ${C.border}`, background: C.surface2, color: C.mutedFg,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 5, fontSize: 10.5, fontWeight: 700, padding: 4,
  };

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {photos.map((m, i) => (
        <div key={"p" + i} style={tile()}>
          <img src={m.url} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <button onClick={() => removeAt(m)} aria-label="Remove photo" style={removeBtn}><Icon name="x" size={13} color="#fff" /></button>
        </div>
      ))}
      {videos.map((m, i) => (
        <div key={"v" + i} style={tile({ display: "flex", alignItems: "center", justifyContent: "center", color: C.accent })}>
          <video src={m.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline />
          <span style={{ position: "absolute", left: 6, bottom: 6, background: "rgba(0,0,0,.55)", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 5px", borderRadius: 5 }}>VIDEO</span>
          <button onClick={() => removeAt(m)} aria-label="Remove video" style={removeBtn}><Icon name="x" size={13} color="#fff" /></button>
        </div>
      ))}
      {photos.length < maxPhotos && (
        <button type="button" onClick={() => photoRef.current?.click()} style={addTile} disabled={busy}>
          <Icon name="camera" size={22} />
          <span style={{ textAlign: "center", lineHeight: 1.1 }}>{busy ? "…" : "Add photos"}</span>
        </button>
      )}
      {allowVideo && videos.length === 0 && (
        <button type="button" onClick={() => videoRef.current?.click()} style={addTile} disabled={busy}>
          <Icon name="video" size={22} />
          <span style={{ textAlign: "center", lineHeight: 1.1 }}>Add video</span>
        </button>
      )}
      <input ref={photoRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
      <input ref={videoRef} type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => { addVideo(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
const removeBtn = {
  position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: 999,
  border: "none", background: "rgba(0,0,0,.55)", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
};

export const SectionTitle = ({ children, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "14px 0 2px" }}>
    <h3 style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: C.mutedFg, margin: 0 }}>{children}</h3>
    {right}
  </div>
);

// ---------- adaptive phone frame ----------
export function PhoneFrame({ children, brandFont }) {
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

// Install / Add-to-Home-Screen prompt. Detects platform, shows the right steps,
// uses the native Android install prompt when available, and remembers dismissal.
export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferred, setDeferred] = useState(null);
  const isStandalone = typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);

  useEffect(() => {
    if (isStandalone) return;
    let dismissed = false;
    try { dismissed = localStorage.getItem("nm_a2hs_dismissed") === "1"; } catch {}
    if (dismissed) return;
    const onBip = (e) => { e.preventDefault(); setDeferred(e); setShow(true); };
    window.addEventListener("beforeinstallprompt", onBip);
    // iOS never fires beforeinstallprompt — show manual instructions after a short delay.
    const tid = setTimeout(() => { if (isIOS) setShow(true); }, 1200);
    return () => { window.removeEventListener("beforeinstallprompt", onBip); clearTimeout(tid); };
  }, []);

  if (!show || isStandalone) return null;
  const dismiss = () => { try { localStorage.setItem("nm_a2hs_dismissed", "1"); } catch {} setShow(false); };
  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch {}
    setDeferred(null); dismiss();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2147483000, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(4,8,13,.55)", padding: 14, boxSizing: "border-box" }} onClick={dismiss}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: C.surface, borderRadius: 20, padding: 20, paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))", boxShadow: "0 -8px 40px rgba(0,0,0,.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <img src={markNavy} alt="" style={{ height: 40, width: "auto" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: C.fg, fontSize: 16 }}>Install Nodrog Maintenance</div>
            <div style={{ fontSize: 12.5, color: C.mutedFg }}>Add it to your home screen for quick, full-screen access.</div>
          </div>
          <button onClick={dismiss} aria-label="Close" style={{ width: 32, height: 32, border: "none", background: "transparent", color: C.mutedFg, cursor: "pointer" }}><Icon name="x" size={20} /></button>
        </div>

        {deferred ? (
          <PrimaryBtn onClick={install}><Icon name="plus" size={18} /> Add to Home Screen</PrimaryBtn>
        ) : isIOS ? (
          <div style={{ fontSize: 14, color: C.fg, lineHeight: 1.6 }}>
            <Step n="1">Tap the <b>Share</b> button <Icon name="share" size={15} style={{ verticalAlign: "-3px" }} /> in Safari's toolbar.</Step>
            <Step n="2">Scroll down and tap <b>“Add to Home Screen”</b>.</Step>
            <Step n="3">Tap <b>Add</b> — the Nodrog icon appears on your home screen.</Step>
          </div>
        ) : (
          <div style={{ fontSize: 14, color: C.fg, lineHeight: 1.6 }}>
            <Step n="1">Tap the <b>⋮</b> menu {isAndroid ? "(top-right in Chrome)" : "in your browser"}.</Step>
            <Step n="2">Tap <b>“Add to Home screen”</b> {isAndroid ? "or “Install app”" : ""}.</Step>
            <Step n="3">Confirm — the Nodrog icon appears on your home screen.</Step>
          </div>
        )}
        <button onClick={dismiss} style={{ width: "100%", marginTop: 12, minHeight: 40, border: "none", background: "transparent", color: C.mutedFg, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>Maybe later</button>
      </div>
    </div>
  );
}
const Step = ({ n, children }) => (
  <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
    <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 999, background: C.accent, color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</span>
    <span>{children}</span>
  </div>
);
