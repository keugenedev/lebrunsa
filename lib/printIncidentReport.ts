import type { jsPDF } from 'jspdf';
import {
  MAIN_LOGO,
  getCompanyLogo,
  getFullPrintHTML,
  getLogoData
} from '@/lib/printAssignmentSheet';

/* -------------------------------------------------------------------------- */
/*  Rapport d'incident matériel informatique                                  */
/*  Même modèle de données pour le PDF, l'impression et l'aperçu écran.       */
/*  Aucune donnée n'est stockée : le rapport est produit à la demande.        */
/* -------------------------------------------------------------------------- */

export const INCIDENT_EQUIPMENT_TYPES = [
  'Ordinateur (unité centrale)',
  'Ordinateur portable',
  'Écran',
  'Clavier',
  'Souris',
  'Imprimante / scanner',
  'Réseau / Wi-Fi / Internet',
  'Onduleur (UPS)',
  'Logiciel / application (GP, Windows...)',
  'Compte / accès / mot de passe',
  'Autre'
];
export const INCIDENT_FREQUENCIES = ['Une seule fois', 'De temps en temps', 'En permanence'];
export const INCIDENT_IMPACTS = ['Aucun impact', 'Travail ralenti', 'Travail impossible'];
export const INCIDENT_PRIORITIES = ['Faible', 'Normale', 'Élevée', 'Critique'];
export const INCIDENT_CAUSES = [
  'Inconnue',
  'Chute ou choc',
  'Liquide renversé',
  'Coupure électrique',
  'Mise à jour / installation',
  'Virus / sécurité',
  'Usure normale',
  'Autre'
];
export const INCIDENT_DAMAGES = ['Non', 'Oui'];

/** Longueurs maximales : elles garantissent que le rapport tient sur une seule page A4. */
export const INCIDENT_LIMITS = { description: 330, errorMessage: 90, actionsTried: 190, name: 60 };

export interface IncidentReportData {
  reportDate: Date;
  // Personne concernée
  fullName: string;
  employeeId: string;
  company: string;
  site: string;
  jobTitle: string;
  department: string;
  // Équipement concerné
  equipmentType: string;
  equipmentName: string;
  serialNumber: string;
  assetTag: string;
  // Incident
  incidentDate: string; // AAAA-MM-JJ
  incidentTime: string; // HH:mm
  frequency: string;
  impact: string;
  priority: string;
  description: string;
  errorMessage: string;
  actionsTried: string;
  suspectedCause: string;
  physicalDamage: string;
}

/** Référence du rapport : RI-<SOC>-<AAAAMMJJ>-<HHmm>. */
export function buildIncidentReference(data: Pick<IncidentReportData, 'company' | 'reportDate'>): string {
  const d = data.reportDate;
  const p = (n: number) => String(n).padStart(2, '0');
  const company = (data.company || 'LEB').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'LEB';
  return `RI-${company}-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

/* ------------------------------- Modèle ------------------------------------ */

const DASH = '—';
const orDash = (v?: string | null) => (v ?? '').toString().trim() || DASH;

const DESCRIPTION_LINES = 4;
const ERROR_LINES = 1;
const ACTIONS_LINES = 2;
const LINE_H = 4.5;

function formatIncidentWhen(date: string, time: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || '');
  if (!m) return time ? time : DASH;
  return `${m[3]}/${m[2]}/${m[1]}${time ? ` à ${time}` : ''}`;
}

interface IncidentModel {
  reference: string;
  dateLabel: string;
  site: string;
  fullName: string;
  showCompanyLogo: boolean;
  companyName: string;
  person: { label: string; value: string }[];
  equipment: { label: string; value: string }[];
  facts: { label: string; value: string }[];
  context: { label: string; value: string }[];
  questions: { label: string; value: string; lines: number }[];
}

function buildModel(d: IncidentReportData): IncidentModel {
  return {
    reference: buildIncidentReference(d),
    dateLabel: d.reportDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
    site: orDash(d.site),
    fullName: d.fullName,
    showCompanyLogo: getCompanyLogo(d.company) !== MAIN_LOGO,
    companyName: d.company || 'Lebrun S.A.',
    person: [
      { label: 'Nom complet', value: orDash(d.fullName) },
      { label: 'Matricule', value: orDash(d.employeeId) },
      { label: 'Société', value: orDash(d.company) },
      { label: 'Fonction', value: orDash(d.jobTitle) },
      { label: 'Service', value: orDash(d.department) },
      { label: 'Site', value: orDash(d.site) }
    ],
    equipment: [
      { label: "Type d'équipement", value: orDash(d.equipmentType) },
      { label: 'Désignation', value: orDash(d.equipmentName) },
      { label: 'N° de série', value: orDash(d.serialNumber) },
      { label: 'Code inventaire', value: orDash(d.assetTag) }
    ],
    facts: [
      { label: "Date et heure de l'incident", value: formatIncidentWhen(d.incidentDate, d.incidentTime) },
      { label: 'Fréquence', value: orDash(d.frequency) },
      { label: 'Impact sur le travail', value: orDash(d.impact) },
      { label: 'Priorité', value: orDash(d.priority) }
    ],
    context: [
      { label: 'Cause supposée', value: orDash(d.suspectedCause) },
      { label: 'Dommage visible sur le matériel', value: orDash(d.physicalDamage) }
    ],
    questions: [
      { label: "Que s'est-il passé ?", value: orDash(d.description), lines: DESCRIPTION_LINES },
      { label: "Message d'erreur affiché à l'écran", value: orDash(d.errorMessage), lines: ERROR_LINES },
      { label: 'Ce qui a déjà été essayé', value: orDash(d.actionsTried), lines: ACTIONS_LINES }
    ]
  };
}

const TREATMENT_STATUSES = ['Résolu sur place', 'Réparation en cours', 'Matériel remplacé', 'Réparation externe'];

/* ------------------------------ Rendu PDF ---------------------------------- */

const PAGE = { w: 210, h: 297, margin: 18 };
const X0 = PAGE.margin;
const X1 = PAGE.w - PAGE.margin;
const CONTENT_W = X1 - X0;
const INK = 17;
const RULE = 205;

export async function renderVectorIncidentReport(doc: jsPDF, data: IncidentReportData, origin: string): Promise<void> {
  const m = buildModel(data);

  const [mainLogo, companyLogo] = await Promise.all([
    getLogoData(`${origin}${MAIN_LOGO}`),
    m.showCompanyLogo ? getLogoData(`${origin}${getCompanyLogo(data.company)}`) : Promise.resolve(null)
  ]);

  const text = (
    str: string,
    x: number,
    y: number,
    o: { size: number; bold?: boolean; italic?: boolean; color?: number; align?: 'left' | 'right' | 'center' }
  ) => {
    doc.setFont('helvetica', o.bold ? 'bold' : o.italic ? 'italic' : 'normal');
    doc.setFontSize(o.size);
    const c = o.color ?? 0;
    doc.setTextColor(c, c, c);
    doc.text(str, x, y, { align: o.align || 'left' });
  };

  const hRule = (y: number, x0 = X0, x1 = X1, gray = RULE, width = 0.2) => {
    doc.setDrawColor(gray, gray, gray);
    doc.setLineWidth(width);
    doc.line(x0, y, x1, y);
  };

  const sectionTitle = (title: string, y: number) => {
    doc.setCharSpace(0.35);
    text(title.toUpperCase(), X0, y, { size: 8.5, bold: true });
    doc.setCharSpace(0);
    hRule(y + 2.2, X0, X1, INK, 0.35);
  };

  const labelText = (label: string, x: number, y: number) => {
    text(label.toUpperCase(), x, y, { size: 7 });
  };

  /** Coupe le texte à `maxLines` lignes (avec « … » si tronqué). */
  const wrap = (str: string, maxW: number, maxLines: number, size = 9): string[] => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(str, maxW) as string[];
    if (lines.length <= maxLines) return lines;
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S*$/, '').slice(0, 120)}…`;
    return kept;
  };

  const drawLogo = (logo: { dataUrl: string; width: number; height: number }, side: 'left' | 'right') => {
    const targetH = 13;
    const targetW = Math.min(46, targetH * (logo.width / logo.height));
    const h = targetW / (logo.width / logo.height);
    const x = side === 'left' ? X0 : X1 - targetW;
    doc.addImage(logo.dataUrl, 'PNG', x, 12 + (targetH - h) / 2, targetW, h);
  };

  // --- En-tête ---
  if (mainLogo) drawLogo(mainLogo, 'left');
  else text('LEBRUN S.A.', X0, 21, { size: 13, bold: true });
  if (companyLogo) drawLogo(companyLogo, 'right');
  hRule(27, X0, X1, RULE, 0.3);

  // --- Titre ---
  text("Rapport d'incident", X0, 40, { size: 17, bold: true });
  text("Signalement d'un problème sur un matériel informatique", X0, 46.5, { size: 9.5 });

  // --- Références ---
  const metaY = 55;
  const metaCols: [string, string, number][] = [
    ['Référence', m.reference, X0],
    ['Date du signalement', m.dateLabel, X0 + 76],
    ['Site', m.site, X0 + 128]
  ];
  hRule(metaY - 3.5, X0, X1);
  for (const [label, value, x] of metaCols) {
    labelText(label, x, metaY);
    text(value, x, metaY + 4.8, { size: 10, bold: true });
  }
  hRule(metaY + 8, X0, X1);

  // --- 1. Personne concernée ---
  let y = 72;
  sectionTitle('1. Personne concernée', y);
  y += 8;
  const cols2 = [X0, X0 + 88];
  const personX = [X0, X0 + 68, X0 + 118];
  const personW = [64, 46, 56];
  for (let i = 0; i < m.person.length; i += 3) {
    for (let c = 0; c < 3; c++) {
      const f = m.person[i + c];
      labelText(f.label, personX[c], y);
      const line = wrap(f.value, personW[c], 1, 10)[0];
      text(line, personX[c], y + 4.6, { size: 10, bold: f.label === 'Nom complet' });
    }
    y += 9.6;
  }

  // --- 2. Équipement concerné ---
  y += 3;
  sectionTitle('2. Équipement concerné', y);
  y += 8;
  const eqX = [X0, X0 + 42, X0 + 94, X0 + 140];
  const eqW = [39, 49, 43, 34];
  let eqLines = 1;
  m.equipment.forEach((f, i) => {
    labelText(f.label, eqX[i], y);
    const lines = wrap(f.value, eqW[i], 2, 9.5);
    eqLines = Math.max(eqLines, lines.length);
    lines.forEach((l, k) => text(l, eqX[i], y + 4.6 + k * 4.2, { size: 9.5, bold: i === 1 }));
  });
  y += 4.6 + eqLines * 4.2 + 1;

  // --- 3. Description de l'incident ---
  y += 2;
  sectionTitle("3. Description de l'incident", y);
  y += 8;
  const factX = [X0, X0 + 46, X0 + 92, X0 + 138];
  m.facts.forEach((f, i) => {
    labelText(f.label, factX[i], y);
    text(wrap(f.value, 42, 1, 10)[0], factX[i], y + 4.6, { size: 10, bold: i === 3 });
  });
  y += 9.2;

  m.context.forEach((f, i) => {
    labelText(f.label, cols2[i], y);
    text(wrap(f.value, 82, 1, 10)[0], cols2[i], y + 4.6, { size: 10 });
  });
  y += 10.8;

  for (const q of m.questions) {
    labelText(q.label, X0, y);
    const lines = wrap(q.value, CONTENT_W, q.lines);
    lines.forEach((l, k) => text(l, X0, y + 4.6 + k * LINE_H, { size: 9 }));
    y += 4.6 + lines.length * LINE_H + 1.6;
  }

  // --- 4. Traitement par la DSI ---
  y += 3;
  sectionTitle('4. Traitement par la DSI (à remplir par le technicien)', y);
  y += 8;
  labelText('Diagnostic et action réalisée', X0, y);
  for (let i = 1; i <= 3; i++) hRule(y + i * 6.4, X0, X1, 150, 0.15);
  y += 3 * 6.4 + 4.5;

  let bx = X0;
  const boxW = [38, 42, 40, 42];
  TREATMENT_STATUSES.forEach((s, i) => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.25);
    doc.rect(bx, y - 2.9, 3.3, 3.3);
    text(s, bx + 5, y, { size: 9 });
    bx += boxW[i];
  });

  // --- Signatures ---
  const sigTop = y + 9;
  const sigW = 82;
  const sigX = [X0, X1 - sigW];
  const blocks = [
    { title: 'La personne concernée', name: m.fullName, date: 'Date : ____ / ____ / ________' },
    { title: 'Le technicien DSI', name: 'Nom : ______________________', date: 'Résolu le : ____ / ____ / ________' }
  ];
  blocks.forEach((b, i) => {
    const x = sigX[i];
    doc.setCharSpace(0.25);
    text(b.title.toUpperCase(), x, sigTop, { size: 7, bold: true });
    doc.setCharSpace(0);
    text(b.name, x, sigTop + 5.6, { size: 10, bold: i === 0 });
    text(b.date, x, sigTop + 11.5, { size: 9 });
    const lineY = sigTop + 24;
    hRule(lineY, x, x + sigW, INK, 0.3);
    text('Signature', x, lineY + 4, { size: 7.5 });
  });

  // --- Pied de page ---
  const footY = PAGE.h - 10;
  hRule(footY - 4, X0, X1);
  text('Lebrun S.A. · Port-au-Prince, Haïti', X0, footY, { size: 7.5 });
  text(m.reference, X1, footY, { size: 7.5, align: 'right' });
}

const safe = (s: string, fallback: string) => (s || fallback).trim().replace(/[^a-zA-Z0-9_-]/g, '_') || fallback;

export async function downloadIncidentReportPDF(data: IncidentReportData): Promise<void> {
  if (typeof window === 'undefined') return;
  const { default: JsPDF } = await import('jspdf');
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  await renderVectorIncidentReport(doc, data, window.location.origin);
  doc.save(`Rapport_Incident_${safe(data.fullName, 'Collaborateur')}_${buildIncidentReference(data)}.pdf`);
}

/* --------------------- Aperçu écran & impression navigateur ---------------- */

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function generateIncidentReportHTML(data: IncidentReportData, origin: string): string {
  const m = buildModel(data);
  const e = escapeHtml;
  const field = (f: { label: string; value: string }, strong = false) =>
    `<div class="field"><div class="k">${e(f.label)}</div><div class="v${strong ? ' strong' : ''}">${e(f.value)}</div></div>`;

  return `
  <section class="sheet incident">
    <header class="hdr">
      <img class="logo" src="${origin}${MAIN_LOGO}" alt="Lebrun S.A." />
      ${m.showCompanyLogo ? `<img class="logo" src="${origin}${getCompanyLogo(data.company)}" alt="${e(m.companyName)}" />` : ''}
    </header>

    <h1>Rapport d'incident</h1>
    <p class="subtitle">Signalement d'un problème sur un matériel informatique</p>

    <div class="meta">
      <div><div class="k">Référence</div><div class="v strong">${e(m.reference)}</div></div>
      <div><div class="k">Date du signalement</div><div class="v strong">${e(m.dateLabel)}</div></div>
      <div><div class="k">Site</div><div class="v strong">${e(m.site)}</div></div>
    </div>

    <h2>1. Personne concernée</h2>
    <div class="grid-person">${m.person.map(f => field(f, f.label === 'Nom complet')).join('')}</div>

    <h2>2. Équipement concerné</h2>
    <div class="grid-eq">${m.equipment.map((f, i) => field(f, i === 1)).join('')}</div>

    <h2>3. Description de l'incident</h2>
    <div class="grid-facts">${m.facts.map((f, i) => field(f, i === 3)).join('')}</div>
    <div class="fields row-tight">${m.context.map(f => field(f)).join('')}</div>
    ${m.questions
      .map(
        q => `<div class="qa"><div class="k">${e(q.label)}</div><div class="txt" style="-webkit-line-clamp:${q.lines}">${e(q.value)}</div></div>`
      )
      .join('')}

    <h2>4. Traitement par la DSI (à remplir par le technicien)</h2>
    <div class="k">Diagnostic et action réalisée</div>
    <div class="write-lines"><span></span><span></span><span></span></div>
    <div class="checks">${TREATMENT_STATUSES.map(s => `<span><i></i>${e(s)}</span>`).join('')}</div>

    <div class="signatures">
      <div class="sig">
        <div class="k strong">La personne concernée</div>
        <div class="v strong">${e(m.fullName)}</div>
        <div class="date">Date : ____ / ____ / ________</div>
        <div class="sig-line"><span class="muted small">Signature</span></div>
      </div>
      <div class="sig">
        <div class="k strong">Le technicien DSI</div>
        <div class="v">Nom : ______________________</div>
        <div class="date">Résolu le : ____ / ____ / ________</div>
        <div class="sig-line"><span class="muted small">Signature</span></div>
      </div>
    </div>

    <footer class="foot">
      <span>Lebrun S.A. · Port-au-Prince, Haïti</span>
      <span>${e(m.reference)}</span>
    </footer>
  </section>
  `;
}

const INCIDENT_CSS = `
  .incident h2 { margin: 5.5mm 0 2.6mm; }
  .incident .grid-person { display: grid; grid-template-columns: 64mm 46mm 1fr; column-gap: 4mm; row-gap: 1.4mm; }
  .incident .grid-eq .v { font-size: 9.5pt; }
  .incident .grid-eq { display: grid; grid-template-columns: 43mm 48mm 42mm 1fr; column-gap: 2mm; }
  .incident .grid-facts { display: grid; grid-template-columns: 43mm 43mm 43mm 1fr; column-gap: 3mm; }
  .incident .field .v { overflow-wrap: anywhere; }
  .incident .row-tight { margin-top: 1.2mm; }
  .incident .qa { margin-top: 1.8mm; }
  .incident .qa .txt {
    font-size: 9pt;
    line-height: 1.42;
    margin-top: 0.8mm;
    white-space: pre-line;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .incident .write-lines { margin-top: 0.5mm; }
  .incident .write-lines span { display: block; height: 6.4mm; border-bottom: 0.15mm solid #969696; }
  .incident .checks { display: flex; margin-top: 3.2mm; font-size: 9pt; }
  .incident .checks span { display: inline-flex; align-items: center; margin-right: 6mm; }
  .incident .checks i {
    display: inline-block; width: 3.3mm; height: 3.3mm; border: 0.25mm solid #000; margin-right: 1.7mm;
  }
  .incident .signatures { margin-top: 4mm; }
  .incident .sig { min-height: 27mm; }
`;

export function getIncidentPrintHTML(sheetHTML: string, autoPrint = true): string {
  return getFullPrintHTML(sheetHTML, autoPrint).replace('</style>', `${INCIDENT_CSS}\n  </style>`);
}

export function printIncidentReport(data: IncidentReportData): void {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const html = getIncidentPrintHTML(generateIncidentReportHTML(data, origin));
  const w = window.open('', '_blank', 'width=920,height=1100');
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
  }
}

