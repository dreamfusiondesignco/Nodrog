// data.js — Nodrog Logistics Maintenance: themes + seed data
// Stands in for a real database (Supabase/Firebase tables).

// ---------- Visual directions (3 themes) ----------
const THEMES = {
  navy: {
    label: "Nodrog Navy",
    bg: "#EEF2F7", surface: "#FFFFFF", surface2: "#F4F7FB", fg: "#0B1A2B",
    mutedFg: "#5C6B7E", border: "#DCE4ED",
    primary: "#0E2236", onPrimary: "#FFFFFF",
    accent: "#1E63D6", accent2: "#F4842B",
    danger: "#D63A3A", warn: "#D98214", ok: "#1B9255", crit: "#B11E1E",
    navBg: "#FFFFFF",
  },
  midnight: {
    label: "Field Dark",
    bg: "#0A1320", surface: "#13202F", surface2: "#1A2B3E", fg: "#E9F1F9",
    mutedFg: "#90A3B8", border: "#26384C",
    primary: "#070D16", onPrimary: "#FFFFFF",
    accent: "#3D86F4", accent2: "#FB923C",
    danger: "#F26C6C", warn: "#FBBF24", ok: "#34D399", crit: "#F0504D",
    navBg: "#0C1622",
  },
  hivis: {
    label: "Hi-Vis",
    bg: "#FFFFFF", surface: "#FFFFFF", surface2: "#FFF3E7", fg: "#07111C",
    mutedFg: "#3F5168", border: "#CBD6E2",
    primary: "#0E2236", onPrimary: "#FFFFFF",
    accent: "#EA580C", accent2: "#0E4DA4",
    danger: "#C61C1C", warn: "#A65A0A", ok: "#047A4B", crit: "#991010",
    navBg: "#FFFFFF",
  },
};

const ACCENT2_OPTIONS = ["#F4842B", "#E0531F", "#EAB308", "#16A34A"];

const FLEETS = {
  IGL:   { id: "IGL",   name: "IGL",   full: "Industrial Gases Ltd" },
  MASSY: { id: "MASSY", name: "Massy", full: "Massy Distribution" },
};
// window.FLEETS is kept in sync by the app so admin-created fleets appear everywhere.

// Mutable registry that App.jsx keeps in sync via Object.assign
export const fleetRegistry = { ...FLEETS };

// ---------- Users (auth stand-in) ----------
// access: which fleets a user can see. Admins + main mechanics see both.
const SEED_USERS = [
  { id: "u1", name: "Marlon Reid",  role: "Lead Mechanic", email: "marlon@nodrog.com", pin: "1234", access: ["IGL", "MASSY"], admin: false },
  { id: "u2", name: "Andre Gordon", role: "Fleet Admin",   email: "admin@nodrog.com",  pin: "0000", access: "*", admin: true  },
  { id: "u3", name: "Tariq Singh",  role: "Mechanic",      email: "igl@nodrog.com",    pin: "1111", access: ["IGL"],          admin: false },
  { id: "u4", name: "Kemar Brown",  role: "Mechanic",      email: "massy@nodrog.com",  pin: "2222", access: ["MASSY"],        admin: false },
];

// ---------- Trucks (expanded service model) ----------
const SEED_TRUCKS = [
  {
    id: "t1", fleet: "IGL", plate: "CN3179", model: "Isuzu FVR — Box", segment: "Distribution",
    chassis: "JALFVR34P07000123", capacity: "8 T", driver: "D. Campbell", location: "Kingston Depot",
    status: "due", odometer: 96492, idleHrs: 11369.5, lastCheck: "2026-06-02",
    service: {
      engine:       { lastMiles: 92000, lastIdleHrs: 10980, date: "2026-04-12", nextDueMiles: 100000, nextDueHrs: 11500 },
      transmission: { lastMiles: 85000, lastIdleHrs: 10210, date: "2025-12-08" },
      airFilter:    { lastMiles: 92000, date: "2026-04-12" },
      frontDiff:    { lastMiles: 85000, lastIdleHrs: 10210, date: "2025-12-08" },
      rearDiff:     { lastMiles: 85000, lastIdleHrs: 10210, date: "2025-12-08" },
    },
    fireExtDate: "2026-09-01", insuranceExp: "2026-11-30", fitnessExp: "2026-08-15",
    mvRegExp: "2027-02-28", carrierLicExp: "2026-12-31",
  },
  {
    id: "t2", fleet: "IGL", plate: "CJ0673", model: "Hino 500 — Flatbed", segment: "Heavy Haul",
    chassis: "JHDFG8JLS0XX1842", capacity: "12 T", driver: "R. Foster", location: "Spanish Town",
    status: "oos", odometer: 142880, idleHrs: 15240, lastCheck: "2026-06-09",
    service: {
      engine:       { lastMiles: 138000, lastIdleHrs: 14800, date: "2026-03-01", nextDueMiles: 146000, nextDueHrs: 15400 },
      transmission: { lastMiles: 120000, lastIdleHrs: 13100, date: "2025-09-20" },
      airFilter:    { lastMiles: 138000, date: "2026-03-01" },
      frontDiff:    { lastMiles: 120000, lastIdleHrs: 13100, date: "2025-09-20" },
      rearDiff:     { lastMiles: 120000, lastIdleHrs: 13100, date: "2025-09-20" },
    },
    fireExtDate: "2026-07-10", insuranceExp: "2026-10-01", fitnessExp: "2026-06-20",
    mvRegExp: "2026-09-30", carrierLicExp: "2027-01-15",
  },
  {
    id: "t3", fleet: "IGL", plate: "CN4420", model: "Isuzu NPR — Refrigerated", segment: "Cold Chain",
    chassis: "JALC4B14R07009921", capacity: "4 T", driver: "S. Mitchell", location: "Kingston Depot",
    status: "ok", odometer: 54310, idleHrs: 6210, lastCheck: "2026-06-09",
    service: {
      engine:       { lastMiles: 52000, lastIdleHrs: 6010, date: "2026-05-18", nextDueMiles: 60000, nextDueHrs: 6700 },
      transmission: { lastMiles: 40000, lastIdleHrs: 4900, date: "2025-11-02" },
      airFilter:    { lastMiles: 52000, date: "2026-05-18" },
      frontDiff:    { lastMiles: 40000, lastIdleHrs: 4900, date: "2025-11-02" },
      rearDiff:     { lastMiles: 40000, lastIdleHrs: 4900, date: "2025-11-02" },
    },
    fireExtDate: "2027-01-05", insuranceExp: "2027-03-01", fitnessExp: "2026-12-10",
    mvRegExp: "2027-04-30", carrierLicExp: "2027-02-28",
  },
  {
    id: "t4", fleet: "MASSY", plate: "PE8841", model: "Mack Granite — Tipper", segment: "Construction",
    chassis: "1M2AX09C8XM001233", capacity: "20 T", driver: "L. Henry", location: "Montego Bay",
    status: "overdue", odometer: 201450, idleHrs: 22980, lastCheck: "2026-05-21",
    service: {
      engine:       { lastMiles: 190000, lastIdleHrs: 21900, date: "2026-01-30", nextDueMiles: 198000, nextDueHrs: 22600 },
      transmission: { lastMiles: 175000, lastIdleHrs: 20100, date: "2025-08-14" },
      airFilter:    { lastMiles: 190000, date: "2026-01-30" },
      frontDiff:    { lastMiles: 175000, lastIdleHrs: 20100, date: "2025-08-14" },
      rearDiff:     { lastMiles: 175000, lastIdleHrs: 20100, date: "2025-08-14" },
    },
    fireExtDate: "2026-06-25", insuranceExp: "2026-08-20", fitnessExp: "2026-07-01",
    mvRegExp: "2026-11-15", carrierLicExp: "2026-10-05",
  },
  {
    id: "t5", fleet: "MASSY", plate: "PF1207", model: "Volvo FH — Tractor", segment: "Line Haul",
    chassis: "YV2RT40A8FB701882", capacity: "40 T", driver: "G. Powell", location: "Portmore Yard",
    status: "due", odometer: 88720, idleHrs: 9410, lastCheck: "2026-06-01",
    service: {
      engine:       { lastMiles: 84000, lastIdleHrs: 9020, date: "2026-04-22", nextDueMiles: 92000, nextDueHrs: 9600 },
      transmission: { lastMiles: 70000, lastIdleHrs: 7800, date: "2025-10-11" },
      airFilter:    { lastMiles: 84000, date: "2026-04-22" },
      frontDiff:    { lastMiles: 70000, lastIdleHrs: 7800, date: "2025-10-11" },
      rearDiff:     { lastMiles: 70000, lastIdleHrs: 7800, date: "2025-10-11" },
    },
    fireExtDate: "2026-12-01", insuranceExp: "2027-01-31", fitnessExp: "2026-10-18",
    mvRegExp: "2027-03-15", carrierLicExp: "2026-12-20",
  },
  {
    id: "t6", fleet: "MASSY", plate: "PG3356", model: "Isuzu FVR — Curtain", segment: "Distribution",
    chassis: "JALFVR34P07004477", capacity: "10 T", driver: "A. Walters", location: "Montego Bay",
    status: "ok", odometer: 47210, idleHrs: 5120, lastCheck: "2026-06-08",
    service: {
      engine:       { lastMiles: 44000, lastIdleHrs: 4900, date: "2026-05-30", nextDueMiles: 52000, nextDueHrs: 5600 },
      transmission: { lastMiles: 30000, lastIdleHrs: 3600, date: "2025-12-15" },
      airFilter:    { lastMiles: 44000, date: "2026-05-30" },
      frontDiff:    { lastMiles: 30000, lastIdleHrs: 3600, date: "2025-12-15" },
      rearDiff:     { lastMiles: 30000, lastIdleHrs: 3600, date: "2025-12-15" },
    },
    fireExtDate: "2027-02-14", insuranceExp: "2027-02-28", fitnessExp: "2026-11-30",
    mvRegExp: "2027-05-31", carrierLicExp: "2027-03-31",
  },
];

// ---------- Issues ----------
const SEED_ISSUES = [
  { id: "i1", fleet: "IGL", truckId: "t2", title: "Unidentified gas leak under truck", detail: "Smell of fuel/air near the gearbox area while idling. Source not yet located.", severity: "critical", status: "open", date: "2026-06-09", by: "Marlon Reid", serious: true, oos: true, partsNeeded: "Inspection + suspected air line / seal kit", photos: ["leak1"] },
  { id: "i2", fleet: "MASSY", truckId: "t4", title: "Center bolt broken — front left", detail: "Front left leaf spring center bolt sheared. Axle alignment affected.", severity: "high", status: "open", date: "2026-06-07", by: "Lee Henry", serious: true, oos: false, partsNeeded: "Center bolt + U-bolt set", photos: [] },
  { id: "i3", fleet: "IGL", truckId: "t1", title: "Serpentine belt needs replacing", detail: "Cracking/glazing visible, squeals on cold start.", severity: "medium", status: "open", date: "2026-06-05", by: "Tariq Singh", serious: false, oos: false, partsNeeded: "Serpentine belt", photos: [] },
  { id: "i4", fleet: "IGL", truckId: "t1", title: "Headlight cleaning needed", detail: "Hazed lenses reducing output.", severity: "low", status: "resolved", date: "2026-06-01", by: "Tariq Singh", serious: false, oos: false, partsNeeded: "", photos: [] },
  { id: "i5", fleet: "MASSY", truckId: "t5", title: "Brake shoes near limit", detail: "Rear rear position close to wear line; replace shortly.", severity: "medium", status: "open", date: "2026-06-03", by: "Kemar Brown", serious: false, oos: false, partsNeeded: "Brake shoe set", photos: [] },
];

// ---------- Parts inventory ----------
const SEED_PARTS = [
  { id: "p1", fleet: "IGL",   name: "Oil Filter (FVR)",   sku: "OF-204", qty: 14, min: 5, location: "Bay A — Shelf 2" },
  { id: "p2", fleet: "IGL",   name: "Brake Shoe Set",     sku: "BS-100", qty: 3,  min: 4, location: "Bay A — Shelf 5" },
  { id: "p3", fleet: "SHARED",name: "Air Filter",         sku: "AF-330", qty: 22, min: 6, location: "Bay B — Shelf 1" },
  { id: "p4", fleet: "SHARED",name: "Coolant 5L",         sku: "CL-500", qty: 9,  min: 3, location: "Store Room" },
  { id: "p5", fleet: "IGL",   name: "Serpentine Belt",    sku: "SB-911", qty: 2,  min: 3, location: "Bay A — Shelf 4" },
  { id: "p6", fleet: "MASSY", name: "Center Bolt + U-bolt",sku: "CB-220",qty: 6,  min: 2, location: "MoBay — Rack 1" },
  { id: "p7", fleet: "MASSY", name: "Leaf Spring (Mack)", sku: "LS-771", qty: 1,  min: 1, location: "MoBay — Rack 3" },
  { id: "p8", fleet: "SHARED",name: "Wheel Hub Oil 1L",   sku: "HO-010", qty: 18, min: 6, location: "Store Room" },
];

// ---------- Parts fitted to trucks ----------
const SEED_USAGE = [
  { id: "us1", partId: "p1", truckId: "t1", qty: 1, date: "2026-04-12", by: "Marlon Reid" },
  { id: "us2", partId: "p3", truckId: "t5", qty: 2, date: "2026-04-22", by: "Kemar Brown" },
  { id: "us3", partId: "p8", truckId: "t4", qty: 4, date: "2026-01-30", by: "Lee Henry" },
];

// ---------- Service history ----------
const SEED_HISTORY = [
  { id: "h1", truckId: "t1", date: "2026-04-12", type: "Engine service + air filter", miles: 92000, by: "Marlon Reid", notes: "Oil + filter, air filter renewed." },
  { id: "h2", truckId: "t1", date: "2025-12-08", type: "Transmission + diffs", miles: 85000, by: "Marlon Reid", notes: "Fluids changed front & rear diff." },
  { id: "h3", truckId: "t2", date: "2026-03-01", type: "Engine service", miles: 138000, by: "Marlon Reid", notes: "Routine." },
  { id: "h4", truckId: "t4", date: "2026-01-30", type: "Engine + hub oil", miles: 190000, by: "Lee Henry", notes: "Hub oil top-up all positions." },
  { id: "h5", truckId: "t5", date: "2026-04-22", type: "Engine service + air filter", miles: 84000, by: "Kemar Brown", notes: "Routine." },
];

// ---------- Inspection sheet structure (from Nodrog paper form) ----------
const INSPECT_POSITIONS = [
  "Front Right", "Mid Rear Right", "Rear Rear Right",
  "Front Left", "Mid Rear Left", "Rear Rear Left",
];
const INSPECT_POSITION_CATS = ["Suspension", "Lights", "Brakes", "Wheels / Tires", "Wheel hub oil"];
const INSPECT_SINGLE = ["Steering"];
const INSPECT_FLUIDS = [
  "Engine oil level / condition", "Coolant", "Power steering reservoir",
  "Transmission / Gearbox", "Front rear diff", "Rear rear diff",
];
const INSPECT_DRIVETRAIN = ["PTO and shaft", "Driving shaft", "Belts"];

// ---------- Saved weekly inspection reports (review history) ----------
const SEED_INSPECTIONS = [
  { id: "r1", truckId: "t1", fleet: "IGL", date: "2026-06-02", by: "Tariq Singh", attn: 2, missing: "",
    general: "Headlights hazed, serpentine belt cracking. Logged as issues.",
    results: { "Steering": "ok", "Belts": "attn", "Front Right · Lights": "attn", "Fluid · Coolant": "ok", "Fluid · Engine oil level / condition": "ok" },
    notes: { "Belts": "Serpentine glazed, squeals on cold start.", "Front Right · Lights": "Lens hazed — needs cleaning." } },
  { id: "r2", truckId: "t3", fleet: "IGL", date: "2026-06-09", by: "Tariq Singh", attn: 0, missing: "",
    general: "All good. Reefer unit running clean.",
    results: { "Steering": "ok", "Fluid · Coolant": "ok", "Front Right · Brakes": "ok", "Rear Rear Left · Wheels / Tires": "ok" }, notes: {} },
  { id: "r3", truckId: "t4", fleet: "MASSY", date: "2026-05-21", by: "Lee Henry", attn: 3, missing: "Wheel chock",
    general: "Front left center bolt sheared — taken out of service.",
    results: { "Steering": "attn", "Front Left · Suspension": "attn", "Front Left · Wheels / Tires": "attn", "Fluid · Power steering reservoir": "ok" },
    notes: { "Front Left · Suspension": "Center bolt broken, leaf shifted.", "Steering": "Play felt at wheel, likely related." } },
  { id: "r4", truckId: "t6", fleet: "MASSY", date: "2026-06-08", by: "Kemar Brown", attn: 0, missing: "",
    general: "Routine — no faults.",
    results: { "Steering": "ok", "Belts": "ok", "Fluid · Transmission / Gearbox": "ok" }, notes: {} },
  { id: "r5", truckId: "t5", fleet: "MASSY", date: "2026-06-01", by: "Kemar Brown", attn: 1, missing: "",
    general: "Rear brake shoes near limit.",
    results: { "Rear Rear Left · Brakes": "attn", "Rear Rear Right · Brakes": "ok", "Steering": "ok" },
    notes: { "Rear Rear Left · Brakes": "Close to wear line — replace shortly." } },
];

// ---------- Invoices (admin) ----------
const SEED_INVOICES = [
  { id: "inv1", number: "NL-1042", fleet: "IGL", truckId: "t1", party: "AutoParts Caribbean Ltd", kind: "Payable",
    date: "2026-04-12", dueDate: "2026-05-12", status: "paid",
    items: [ { desc: "Oil filter OF-204", qty: 1, unit: 2800 }, { desc: "Air filter AF-330", qty: 1, unit: 4200 }, { desc: "Engine service labour", qty: 3, unit: 3500 } ],
    notes: "Engine service @ 92,000 mi." },
  { id: "inv2", number: "NL-1043", fleet: "MASSY", truckId: "t4", party: "Island Spring & Axle", kind: "Payable",
    date: "2026-06-08", dueDate: "2026-07-08", status: "sent",
    items: [ { desc: "Center bolt + U-bolt set CB-220", qty: 1, unit: 9500 }, { desc: "Leaf spring LS-771", qty: 1, unit: 38000 }, { desc: "Fitment labour", qty: 4, unit: 4000 } ],
    notes: "Front-left suspension repair — truck OOS." },
  { id: "inv3", number: "NL-1044", fleet: "IGL", truckId: "t2", party: "Nodrog Internal — Workshop", kind: "Receivable",
    date: "2026-06-09", dueDate: "2026-06-23", status: "draft",
    items: [ { desc: "Diagnostic — gas leak", qty: 2, unit: 3500 } ],
    notes: "Awaiting parts quote before finalising." },
];

export { THEMES, ACCENT2_OPTIONS, FLEETS, SEED_USERS, SEED_TRUCKS, SEED_ISSUES, SEED_PARTS, SEED_USAGE, SEED_HISTORY, SEED_INSPECTIONS, SEED_INVOICES, INSPECT_POSITIONS, INSPECT_POSITION_CATS, INSPECT_SINGLE, INSPECT_FLUIDS, INSPECT_DRIVETRAIN };
