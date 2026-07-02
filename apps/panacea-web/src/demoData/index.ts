export type DemoSeverity = "normal" | "watch" | "critical";

export interface DemoTimelineEvent {
  time: string;
  type: string;
  title: string;
  detail: string;
}

export interface DemoPatient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  sex: "Female" | "Male";
  room: string;
  ward: string;
  attending: string;
  status: string;
  risk: DemoSeverity;
  allergies: string[];
  conditions: string[];
  medications: string[];
  vitals: Array<{ time: string; bp: string; hr: number; temp: number; spo2: number }>;
  encounters: Array<{ date: string; type: string; provider: string; reason: string }>;
  timeline: DemoTimelineEvent[];
  notes: Array<{ date: string; author: string; note: string }>;
  labs: Array<{ orderId: string; test: string; status: string; value: string; flag: DemoSeverity; collectedAt: string }>;
  radiology: Array<{ studyId: string; modality: string; bodyPart: string; status: string; report: string; reportedAt: string }>;
  pharmacy: Array<{ medication: string; status: string; route: string; safety: string }>;
  appointments: Array<{ date: string; clinic: string; status: string }>;
  billing: { balance: string; insurance: string; lastInvoice: string };
  careInstructions: string[];
  messages: Array<{ from: string; subject: string; status: string }>;
}

export const DEMO_DATA_LABEL = "PROTECTED PREVIEW RECORD -- NOT REAL PATIENT DATA";
export const DEMO_DATA_LABEL_DISPLAY = "PROTECTED PREVIEW RECORDS";

export const demoHospital = {
  name: "Panacea Gulf Hospital",
  tenantId: "utbe-health-system",
  departments: ["Emergency", "Internal Medicine", "Laboratory", "Radiology", "Pharmacy", "Administration"],
  wards: ["Medical Ward A", "Surgical Ward B", "ICU", "Day Care"],
  rooms: ["A-101", "A-102", "A-103", "B-210", "ICU-01", "ICU-02"],
  beds: 96,
  clinics: ["Cardiology Clinic", "Diabetes Clinic", "Family Medicine", "Post-Discharge Clinic"],
  tenants: [
    { id: "utbe-health-system", name: "UTBE Health System", country: "KW", status: "Active" },
    { id: "training-tenant", name: "Training Tenant", country: "KW", status: "Preview" }
  ]
};

export const demoUsers = [
  { id: "usr-doctor", name: "Clinical Doctor", role: "doctor", department: "Internal Medicine", tenant: "utbe-health-system", status: "Active" },
  { id: "usr-nurse", name: "Nursing Lead", role: "nurse", department: "Medical Ward A", tenant: "utbe-health-system", status: "Active" },
  { id: "usr-lab", name: "Laboratory User", role: "laboratory", department: "Laboratory", tenant: "utbe-health-system", status: "Active" },
  { id: "usr-rad", name: "Radiology User", role: "radiology", department: "Radiology", tenant: "utbe-health-system", status: "Active" },
  { id: "usr-pharm", name: "Clinical Pharmacist", role: "pharmacy", department: "Pharmacy", tenant: "utbe-health-system", status: "Active" },
  { id: "usr-admin", name: "System Administrator", role: "administrator", department: "Administration", tenant: "utbe-health-system", status: "Active" },
  { id: "usr-patient", name: "Patient Portal User", role: "patient", department: "Patient Portal", tenant: "utbe-health-system", status: "Active" },
  { id: "usr-operator", name: "Platform Operator", role: "operator", department: "Platform Operations", tenant: "utbe-health-system", status: "Active" }
];

const firstNames = [
  "Patient Alpha",
  "Patient Bravo",
  "Patient Cedar",
  "Patient Delta",
  "Patient Echo",
  "Patient Falcon",
  "Patient Gulf",
  "Patient Harbor",
  "Patient Iris",
  "Patient Jade",
  "Patient Kuwait",
  "Patient Lotus",
  "Patient Marina",
  "Patient Noor",
  "Patient Oasis",
  "Patient Pearl",
  "Patient Qamar",
  "Patient Reef",
  "Patient Safa",
  "Patient Tariq"
];

const conditionPool = [
  ["Hypertension", "Type 2 diabetes"],
  ["Asthma", "Seasonal allergy"],
  ["Post-operative observation"],
  ["Anemia", "Vitamin D deficiency"],
  ["Migraine"],
  ["Chronic kidney disease monitoring"],
  ["Pregnancy follow-up"],
  ["Chest pain observation"],
  ["Community-acquired pneumonia follow-up"],
  ["Physical therapy follow-up"]
];

const medicationPool = [
  ["Metformin 500 mg", "Amlodipine 5 mg"],
  ["Salbutamol inhaler", "Cetirizine 10 mg"],
  ["Paracetamol 500 mg"],
  ["Ferrous sulfate", "Vitamin D"],
  ["Omeprazole 20 mg"],
  ["Atorvastatin 20 mg"],
  ["Insulin glargine pen"],
  ["Amoxicillin-clavulanate course"],
  ["Enoxaparin prophylaxis order"],
  ["Normal saline infusion"]
];

export const demoPatients: DemoPatient[] = firstNames.map((name, index) => {
  const n = index + 1;
  const risk: DemoSeverity = n % 9 === 0 ? "critical" : n % 4 === 0 ? "watch" : "normal";
  const ward = demoHospital.wards[index % demoHospital.wards.length];
  const room = demoHospital.rooms[index % demoHospital.rooms.length];
  const labFlag: DemoSeverity = risk === "critical" ? "critical" : n % 3 === 0 ? "watch" : "normal";
  return {
    id: `patient-px-${String(n).padStart(3, "0")}`,
    mrn: `PX-MRN-${String(1000 + n)}`,
    name,
    age: 22 + (n * 3) % 61,
    sex: n % 2 === 0 ? "Female" : "Male",
    room,
    ward,
    attending: n % 2 === 0 ? "Clinical Doctor" : "Clinical Reviewer",
    status: risk === "critical" ? "Critical review" : risk === "watch" ? "Watch list" : "Stable",
    risk,
    allergies: n % 5 === 0 ? ["Penicillin allergy"] : n % 4 === 0 ? ["Shellfish allergy"] : ["No known allergy"],
    conditions: conditionPool[index % conditionPool.length],
    medications: medicationPool[index % medicationPool.length],
    vitals: [
      { time: "08:00", bp: `${118 + n}/${72 + n % 8}`, hr: 68 + n, temp: 36.5 + (n % 4) / 10, spo2: 98 - (n % 3) },
      { time: "12:00", bp: `${120 + n}/${74 + n % 8}`, hr: 70 + n, temp: 36.6 + (n % 5) / 10, spo2: 97 - (n % 2) },
      { time: "16:00", bp: `${116 + n}/${70 + n % 8}`, hr: 66 + n, temp: 36.4 + (n % 3) / 10, spo2: 98 - (n % 2) }
    ],
    encounters: [
      { date: `2026-06-${String((n % 20) + 1).padStart(2, "0")}`, type: "Outpatient", provider: "Clinical Doctor", reason: "Preview follow-up visit" },
      { date: `2026-06-${String((n % 20) + 2).padStart(2, "0")}`, type: "Care team review", provider: "Nursing Lead", reason: "Care plan review" }
    ],
    timeline: [
      { time: "08:20", type: "Laboratory", title: "Specimen collected", detail: "Illustrative specimen event for operational UI review." },
      { time: "10:10", type: "Radiology", title: "Imaging report updated", detail: "Illustrative imaging event; no DICOM image is displayed." },
      { time: "11:35", type: "Pharmacy", title: "Medication review queued", detail: "Medication safety visibility preview only." },
      { time: "13:00", type: "Encounter", title: "Care team review", detail: "Illustrative timeline event; not real clinical documentation." }
    ],
    notes: [
      { date: "2026-06-30", author: "Clinical Doctor", note: "Illustrative clinical note for UI review only. No real patient information." },
      { date: "2026-07-01", author: "Nursing Lead", note: "Illustrative nursing observation recorded in frontend seed data only." }
    ],
    labs: [
      { orderId: `LAB-${n}-CBC`, test: "CBC", status: n % 2 === 0 ? "Validated" : "Pending validation", value: `${11 + n % 5}.2 g/dL`, flag: labFlag, collectedAt: "2026-07-01 08:20" },
      { orderId: `LAB-${n}-BMP`, test: "Basic metabolic panel", status: "Resulted", value: `${135 + n % 6} mmol/L sodium`, flag: n % 7 === 0 ? "watch" : "normal", collectedAt: "2026-07-01 08:25" }
    ],
    radiology: [
      { studyId: `RAD-${n}-CXR`, modality: "XR", bodyPart: "Chest", status: n % 3 === 0 ? "Report pending" : "Reported", report: "Illustrative radiology report text for operational UI only.", reportedAt: "2026-07-01 10:10" }
    ],
    pharmacy: [
      { medication: medicationPool[index % medicationPool.length][0], status: n % 2 === 0 ? "Ready for review" : "Dispensed in preview", route: "Oral", safety: risk === "critical" ? "Review required" : "No active preview alert" }
    ],
    appointments: [
      { date: "2026-07-04 09:30", clinic: demoHospital.clinics[index % demoHospital.clinics.length], status: "Scheduled" },
      { date: "2026-07-18 11:00", clinic: "Follow-up Clinic", status: "Planned" }
    ],
    billing: { balance: `KWD ${(n * 4.25).toFixed(2)}`, insurance: n % 2 === 0 ? "Insurance Plan A" : "Self-pay preview", lastInvoice: `INV-PX-${String(n).padStart(4, "0")}` },
    careInstructions: ["Use the patient portal for appointment review.", "Contact the care team for real medical advice.", "This content is educational and illustrative."],
    messages: [
      { from: "Care Team", subject: "Appointment reminder", status: "Unread" },
      { from: "Billing Office", subject: "Statement available", status: "Read" }
    ]
  };
});

export const demoLabOrders = demoPatients.flatMap((patient) => patient.labs.map((lab) => ({
  ...lab,
  patientId: patient.id,
  patientName: patient.name,
  ward: patient.ward,
  priority: lab.flag === "critical" ? "Critical" : lab.flag === "watch" ? "Soon" : "Routine"
})));

export const demoRadiologyStudies = demoPatients.flatMap((patient) => patient.radiology.map((study) => ({
  ...study,
  patientId: patient.id,
  patientName: patient.name,
  location: patient.room,
  priority: patient.risk === "critical" ? "Urgent" : "Routine",
  pacsStatus: "Metadata available"
})));

export const demoPharmacyRecords = demoPatients.flatMap((patient) => patient.pharmacy.map((record, index) => ({
  ...record,
  id: `RX-${patient.id}-${index + 1}`,
  patientId: patient.id,
  patientName: patient.name,
  priority: record.safety.includes("Review") ? "Review" : "Routine"
})));

export const demoMedicationCatalog = [
  { code: "MED-PX-001", name: "Metformin 500 mg", form: "Tablet", stock: 420, status: "Available" },
  { code: "MED-PX-002", name: "Amlodipine 5 mg", form: "Tablet", stock: 360, status: "Available" },
  { code: "MED-PX-003", name: "Salbutamol inhaler", form: "Inhaler", stock: 84, status: "Watch" },
  { code: "MED-PX-004", name: "Insulin glargine pen", form: "Pen", stock: 42, status: "Cold chain" },
  { code: "MED-PX-005", name: "Controlled analgesic", form: "Ampoule", stock: 12, status: "Controlled" }
];

export const demoInventory = [
  { item: "Sodium chloride bags", lot: "LOT-PX-410", expiry: "2026-12-31", quantity: 240, status: "Available" },
  { item: "CBC reagent kit", lot: "LOT-PX-512", expiry: "2026-08-15", quantity: 18, status: "Expiry watch" },
  { item: "Radiology contrast vial", lot: "LOT-PX-620", expiry: "2026-10-05", quantity: 32, status: "Controlled storage" },
  { item: "Pharmacy safety label roll", lot: "LOT-PX-707", expiry: "2027-01-20", quantity: 64, status: "Available" }
];

export const demoAuditLogs = [
  { id: "AUD-PX-001", actor: "Platform Operator", action: "Viewed release evidence", tenant: "utbe-health-system", status: "Recorded", time: "2026-07-01 08:00" },
  { id: "AUD-PX-002", actor: "System Administrator", action: "Opened users table", tenant: "utbe-health-system", status: "Recorded", time: "2026-07-01 08:04" },
  { id: "AUD-PX-003", actor: "Clinical Doctor", action: "Viewed preview patient chart", tenant: "utbe-health-system", status: "Preview only", time: "2026-07-01 08:08" }
];

export const demoSystemHealth = [
  { service: "Foundation Provider", status: "Live partial", detail: "GET health and JWKS available; auth routing still requires deployment validation." },
  { service: "Runtime Services", status: "Validated", detail: "9 active services passed runtime orchestration." },
  { service: "OpenAPI Bundle", status: "Available", detail: "26 OpenAPI documents validated." },
  { service: "Quality Gate", status: "Passing", detail: "Repository validation passed before this sprint." }
];

export function findDemoPatient(id: string | undefined): DemoPatient {
  return demoPatients.find((patient) => patient.id === id) ?? demoPatients[0];
}
