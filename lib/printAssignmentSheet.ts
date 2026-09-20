import { Employee, WorkstationDetails } from '@/types/inventory';
import type { jsPDF } from 'jspdf';

/* -------------------------------------------------------------------------- */
/*  Fiche d'affectation de matériel informatique                              */
/*  Un seul modèle de données (buildSheetModel) alimente le PDF téléchargé,   */
/*  l'impression navigateur et l'aperçu à l'écran, pour un rendu identique.   */
/* -------------------------------------------------------------------------- */

export interface AssignmentSheetOptions {
  /** Code inventaire du poste remis (ex: AST-PC-LEB123). */
  assetTag?: string;
  /** Date d'émission (par défaut : aujourd'hui). */
  date?: Date;
  /** Référence déjà enregistrée dans la base : elle est réutilisée telle quelle. */
  reference?: string;
}

/** Une fiche à produire : le collaborateur (avec son poste) et ses options d'émission. */
export interface AssignmentSheet {
  employee: Employee;
  options?: AssignmentSheetOptions;
}

export function getCompanyLogo(company?: string): string {
  const c = (company || '').toLowerCase();
  if (c.includes('caribe')) return '/caribe motors.png';
  if (c.includes('autobiz')) return '/Autobiz.png';
  if (c.includes('leader')) return '/leader.png';
  if (c.includes('tirezone')) return '/Tirezone.png';
  return '/Lebrunog.png';
}

export const MAIN_LOGO = '/Lebrunog.png';

/** Référence unique de la fiche : FA-<SOC>-<AAAAMMJJ>-<code poste | matricule>. */
export function buildAssignmentDocRef(emp: Employee, opts: AssignmentSheetOptions = {}): string {
  if (opts.reference) return opts.reference;
  const d = opts.date || new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const company = (emp.company || 'LEB').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'LEB';
  const tail = (opts.assetTag || emp.employeeId || emp.id || '001').trim();
  return `FA-${company}-${ymd}-${tail}`;
}

/* ------------------------------- Modèle ------------------------------------ */

interface SheetField {
  label: string;
  value: string;
}

interface SheetEquipment {
  kind: string;
  kindSub: string;
  name: string;
  detail: string;
  serial: string;
  serialSub: string;
  state: string;
}

interface SheetModel {
  docRef: string;
  dateLabel: string;
  site: string;
  fullName: string;
  showCompanyLogo: boolean;
  companyName: string;
  person: SheetField[];
  equipment: SheetEquipment[];
  observations: string;
  legalText: string;
}

const DASH = '—';

const orDash = (v?: string | null): string => {
  const s = (v ?? '').toString().trim();
  return s && s.toUpperCase() !== 'N/A' ? s : DASH;
};

/** Traduit l'observation saisie dans l'inventaire (souvent "Good") en libellé lisible. */
function formatCondition(obs?: string): string {
  const s = (obs || '').trim();
  if (!s) return DASH;
  const l = s.toLowerCase();
  if (/(d[ée]f+ect|deffect|panne|hs\b)/.test(l)) return 'Défectueux';
  if (/(trace|rayure|fissure|us[ée])/.test(l)) return 'À contrôler';
  if (/(good|bon|conforme|ok|neuf)/.test(l)) return 'Bon état';
  return s.length > 22 ? `${s.slice(0, 21)}…` : s;
}

function isGenericObservation(obs?: string): boolean {
  const l = (obs || '').trim().toLowerCase();
  return !l || l === 'good' || l === 'conforme' || l === 'bon' || l === 'n/a' || l === 'bon état';
}

function workstationTypeLabel(type?: string): string {
  const l = (type || '').toLowerCase();
  if (l.includes('lap') || l.includes('port')) return 'Ordinateur portable';
  if (l.includes('desk') || l.includes('fixe') || l.includes('bureau')) return 'Ordinateur de bureau';
  return type?.trim() || 'Poste de travail';
}

function buildSheetModel(emp: Employee, opts: AssignmentSheetOptions = {}): SheetModel {
  const date = opts.date || new Date();
  const ws: Partial<WorkstationDetails> = emp.workstation || {};
  const site = orDash(emp.site || emp.location);
  const companyName = emp.company || 'Lebrun S.A.';

  const observations = [ws.observations, ws.notes, ws.obs].find(o => !isGenericObservation(o))?.trim() || '';

  return {
    docRef: buildAssignmentDocRef(emp, opts),
    dateLabel: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
    site,
    fullName: emp.fullName || '',
    showCompanyLogo: getCompanyLogo(emp.company) !== MAIN_LOGO,
    companyName,
    person: [
      { label: 'Nom complet', value: orDash(emp.fullName) },
      { label: 'Matricule', value: orDash(emp.employeeId) },
      { label: 'Société', value: orDash(companyName) },
      { label: 'Site', value: site },
      { label: 'Fonction', value: orDash(emp.jobTitle) },
      { label: 'Service', value: orDash(emp.department) },
      { label: 'Email', value: orDash(emp.email) },
      { label: 'Téléphone', value: orDash(emp.phone) }
    ],
    equipment: [
      {
        kind: 'Unité centrale',
        kindSub: workstationTypeLabel(ws.type),
        name: orDash(ws.pcName),
        detail: (ws.pcSpecs || '').trim(),
        serial: orDash(ws.pcSerial),
        serialSub: opts.assetTag ? `Inv. ${opts.assetTag}` : '',
        state: formatCondition(ws.generalState)
      },
      {
        kind: 'Écran',
        kindSub: 'Affichage',
        name: orDash(ws.monitorModel),
        detail: '',
        serial: orDash(ws.monitorSerial),
        serialSub: '',
        state: formatCondition(ws.monitorObs)
      },
      {
        kind: 'Clavier',
        kindSub: 'Saisie',
        name: orDash(ws.keyboard),
        detail: (ws.keyboardDetails || '').trim(),
        serial: DASH,
        serialSub: '',
        state: formatCondition(ws.keyboardObs)
      },
      {
        kind: 'Souris',
        kindSub: 'Pointage',
        name: orDash(ws.mouse),
        detail: (ws.mouseDetails || '').trim(),
        serial: DASH,
        serialSub: '',
        state: formatCondition(ws.mouseObs)
      }
    ],
    observations,
    legalText:
      "Le collaborateur reconnaît avoir reçu ce jour le matériel décrit ci-dessus, en bon état de fonctionnement. " +
      "Il s'engage à l'utiliser uniquement dans le cadre de ses missions, conformément à la charte informatique et à la " +
      "politique de sécurité de l'entreprise, et à en prendre soin. Ce matériel reste la propriété de l'entreprise : il devra " +
      "être restitué sur simple demande de la Direction des Systèmes d'Information ou de la Direction, ainsi qu'en cas de " +
      "départ, de mutation ou de fin de contrat. Toute perte, panne ou détérioration doit être signalée sans délai à la DSI."
  };
}

/* -------------------------------- Logos ------------------------------------ */

export interface LogoData {
  dataUrl: string;
  width: number;
  height: number;
}

const logoCache = new Map<string, Promise<LogoData | null>>();

/**
 * Charge un logo en PNG (couleurs d'origine) pour l'intégrer au PDF,
 * avec un délai maximal pour ne jamais bloquer la génération.
 */
export function getLogoData(url: string): Promise<LogoData | null> {
  if (typeof window === 'undefined' || !url) return Promise.resolve(null);
  const cached = logoCache.get(url);
  if (cached) return cached;

  const promise = new Promise<LogoData | null>((resolve) => {
    const timer = setTimeout(() => resolve(null), 3000);

    const img = new Image();
    img.onload = () => {
      clearTimeout(timer);
      try {
        const w = img.naturalWidth || img.width || 100;
        const h = img.naturalHeight || img.height || 40;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        ctx.drawImage(img, 0, 0);
        resolve({ dataUrl: canvas.toDataURL('image/png'), width: w, height: h });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });

  logoCache.set(url, promise);
  return promise;
}

/* ------------------------------ Rendu PDF ---------------------------------- */

const PAGE = { w: 210, h: 297, margin: 18 };
const X0 = PAGE.margin;
const X1 = PAGE.w - PAGE.margin;
const CONTENT_W = X1 - X0;

const INK = 17;
const MUTED = 0;
const RULE = 205;

/**
 * Dessine une fiche d'affectation A4 (1 page) : sobre, lisible, corps de texte ≥ 8 pt.
 */
export async function renderVectorAssignmentSheet(
  doc: jsPDF,
  emp: Employee,
  origin: string,
  opts: AssignmentSheetOptions = {}
): Promise<void> {
  const m = buildSheetModel(emp, opts);

  const [mainLogo, companyLogo] = await Promise.all([
    getLogoData(`${origin}${MAIN_LOGO}`),
    m.showCompanyLogo ? getLogoData(`${origin}${getCompanyLogo(emp.company)}`) : Promise.resolve(null)
  ]);

  const text = (
    str: string,
    x: number,
    y: number,
    o: { size: number; bold?: boolean; italic?: boolean; color?: number; align?: 'left' | 'right' | 'center' }
  ) => {
    doc.setFont('helvetica', o.bold ? 'bold' : o.italic ? 'italic' : 'normal');
    doc.setFontSize(o.size);
    const c = o.color ?? INK;
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

  const drawLogo = (logo: LogoData, side: 'left' | 'right') => {
    const targetH = 13;
    const targetW = Math.min(46, targetH * (logo.width / logo.height));
    const h = targetW / (logo.width / logo.height);
    const x = side === 'left' ? X0 : X1 - targetW;
    doc.addImage(logo.dataUrl, 'PNG', x, 12 + (targetH - h) / 2, targetW, h);
  };

  /** Coupe un texte sans espaces (n° de série) pour qu'il tienne dans la largeur donnée. */
  const wrapToken = (str: string, maxW: number, size: number): string[] => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    const lines: string[] = [];
    let cur = '';
    for (const ch of str) {
      if (cur && doc.getTextWidth(cur + ch) > maxW) {
        lines.push(cur);
        cur = ch;
      } else {
        cur += ch;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  };

  // --- En-tête ---
  if (mainLogo) drawLogo(mainLogo, 'left');
  else text('LEBRUN S.A.', X0, 21, { size: 13, bold: true });
  if (companyLogo) drawLogo(companyLogo, 'right');
  hRule(27, X0, X1, RULE, 0.3);

  // --- Titre ---
  text("Fiche d'affectation de matériel informatique", X0, 40, { size: 17, bold: true });
  text('Remise de matériel et décharge de responsabilité', X0, 46.5, { size: 9.5, color: MUTED });

  // --- Références ---
  const metaY = 55;
  const metaCols: [string, string, number][] = [
    ['Référence', m.docRef, X0],
    ["Date d'émission", m.dateLabel, X0 + 76],
    ['Site', m.site, X0 + 128]
  ];
  hRule(metaY - 3.5, X0, X1);
  for (const [label, value, x] of metaCols) {
    text(label.toUpperCase(), x, metaY, { size: 7, color: MUTED });
    text(value, x, metaY + 4.8, { size: 10, bold: true });
  }
  hRule(metaY + 8, X0, X1);

  // --- 1. Collaborateur ---
  let y = 73;
  sectionTitle('1. Collaborateur', y);
  y += 8.5;
  const colX = [X0, X0 + 88];
  const colW = 82;
  for (let i = 0; i < m.person.length; i += 2) {
    for (let c = 0; c < 2; c++) {
      const f = m.person[i + c];
      if (!f) continue;
      text(f.label.toUpperCase(), colX[c], y, { size: 7, color: MUTED });
      const lines = doc.splitTextToSize(f.value, colW) as string[];
      text(lines[0], colX[c], y + 4.6, { size: 10, bold: f.label === 'Nom complet' });
    }
    y += 9.8;
  }

  // --- 2. Matériel remis ---
  y += 5;
  sectionTitle('2. Matériel remis', y);
  y += 7.5;

  const colEquip = X0;
  const colDesign = X0 + 36.5;
  const colSerial = X0 + 113;
  const colState = X1;
  const designW = 74;
  const serialW = 38;

  doc.setCharSpace(0.25);
  text('ÉQUIPEMENT', colEquip, y, { size: 7, bold: true, color: MUTED });
  text('DÉSIGNATION', colDesign, y, { size: 7, bold: true, color: MUTED });
  text('N° DE SÉRIE', colSerial, y, { size: 7, bold: true, color: MUTED });
  doc.setCharSpace(0);
  text('ÉTAT', colState, y, { size: 7, bold: true, color: MUTED, align: 'right' });
  hRule(y + 2, X0, X1, RULE, 0.25);
  y += 2;

  for (const eq of m.equipment) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    const nameLines = (doc.splitTextToSize(eq.name, designW) as string[]).slice(0, 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const detailLines = eq.detail ? (doc.splitTextToSize(eq.detail, designW) as string[]).slice(0, 2) : [];
    const serialLines = wrapToken(eq.serial, serialW, 9).slice(0, 2);
    const designRows = nameLines.length + detailLines.length;
    const serialRows = serialLines.length + (eq.serialSub ? 1 : 0);
    const rowH = Math.max(11, 4.6 + Math.max(designRows, serialRows, 2) * 4.1 + 0.8);

    const top = y + 4.8;
    text(eq.kind, colEquip, top, { size: 9.5, bold: true });
    text(eq.kindSub, colEquip, top + 4.2, { size: 8, color: MUTED });

    nameLines.forEach((line, i) => text(line, colDesign, top + i * 4.2, { size: 9.5, bold: true }));
    detailLines.forEach((line, i) =>
      text(line, colDesign, top + (nameLines.length + i) * 4.2, { size: 8, color: MUTED })
    );

    serialLines.forEach((line, i) => text(line, colSerial, top + i * 4.2, { size: 9 }));
    if (eq.serialSub) text(eq.serialSub, colSerial, top + serialLines.length * 4.2, { size: 8, color: MUTED });

    text(eq.state, colState, top, { size: 9, bold: eq.state === 'Défectueux', align: 'right' });

    y += rowH;
    hRule(y, X0, X1, RULE, 0.15);
  }

  if (m.observations) {
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const obsLines = (doc.splitTextToSize(m.observations, CONTENT_W - 26) as string[]).slice(0, 2);
    text('OBSERVATIONS', X0, y, { size: 7, bold: true, color: MUTED });
    obsLines.forEach((line, i) => text(line, X0 + 26, y + i * 4.2, { size: 9 }));
    y += (obsLines.length - 1) * 4.2;
  }

  // --- 3. Engagement ---
  y += 8.5;
  sectionTitle('3. Engagement du collaborateur', y);
  y += 7.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const legalLines = doc.splitTextToSize(m.legalText, CONTENT_W) as string[];
  doc.text(m.legalText, X0, y, { align: 'justify', maxWidth: CONTENT_W, lineHeightFactor: 1.42 });
  y += (legalLines.length - 1) * 9 * 0.3528 * 1.42;

  // --- Signatures ---
  const sigTop = y + 8;
  const sigW = 82;
  const sigX = [X0, X1 - sigW];
  const blocks = [
    {
      title: 'Le collaborateur',
      name: m.fullName,
      note: 'Mention manuscrite : « Lu et approuvé »',
      date: 'Date : ____ / ____ / ________',
      caption: 'Signature'
    },
    {
      title: "Pour la Direction des Systèmes d'Information",
      name: 'Direction Informatique',
      note: '',
      date: `Date : ${m.dateLabel}`,
      caption: 'Signature et cachet'
    }
  ];

  blocks.forEach((b, i) => {
    const x = sigX[i];
    doc.setCharSpace(0.25);
    text(b.title.toUpperCase(), x, sigTop, { size: 7, bold: true, color: MUTED });
    doc.setCharSpace(0);
    text(b.name, x, sigTop + 6, { size: 10, bold: true });
    if (b.note) text(b.note, x, sigTop + 11, { size: 8, italic: true, color: MUTED });
    text(b.date, x, sigTop + (b.note ? 17 : 12), { size: 9 });

    const lineY = sigTop + 28;
    hRule(lineY, x, x + sigW, INK, 0.3);
    text(b.caption, x, lineY + 4, { size: 7.5, color: MUTED });
  });

  // --- Pied de page ---
  const footY = PAGE.h - 10;
  hRule(footY - 4, X0, X1);
  text('Lebrun S.A. · Port-au-Prince, Haïti', X0, footY, { size: 7.5, color: MUTED });
  text(m.docRef, X1, footY, { size: 7.5, color: MUTED, align: 'right' });
}

function newDoc(JsPDF: typeof jsPDF): jsPDF {
  return new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
}

const safeFilePart = (s: string, fallback: string) =>
  (s || fallback).trim().replace(/[^a-zA-Z0-9_-]/g, '_') || fallback;

/**
 * Génère et télécharge la fiche d'affectation d'un collaborateur (PDF A4, 1 page).
 */
export async function downloadSingleAssignmentSheetPDF(
  emp: Employee,
  opts: AssignmentSheetOptions = {}
): Promise<void> {
  if (typeof window === 'undefined') return;

  const { default: JsPDF } = await import('jspdf');
  const doc = newDoc(JsPDF);
  await renderVectorAssignmentSheet(doc, emp, window.location.origin, opts);

  doc.save(`Fiche_Affectation_${safeFilePart(emp.fullName, 'Collaborateur')}_${safeFilePart(emp.employeeId, '001')}.pdf`);
}

/**
 * Génère et télécharge un PDF multipages (une fiche par collaborateur).
 */
export async function downloadAllAssignmentSheetsPDF(
  sheets: AssignmentSheet[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (typeof window === 'undefined' || !sheets || sheets.length === 0) return;

  const { default: JsPDF } = await import('jspdf');
  const doc = newDoc(JsPDF);

  for (let i = 0; i < sheets.length; i++) {
    if (i > 0) doc.addPage('a4', 'portrait');
    onProgress?.(i + 1, sheets.length);
    await renderVectorAssignmentSheet(doc, sheets[i].employee, window.location.origin, sheets[i].options);
  }

  doc.save(`Fiches_Affectation_Total_${sheets.length}.pdf`);
}

/* --------------------- Aperçu écran & impression navigateur ---------------- */

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Feuille HTML (aperçu et window.print) — mêmes contenus et mêmes proportions que le PDF.
 */
export function generateAssignmentSheetHTML(
  emp: Employee,
  origin: string,
  opts: AssignmentSheetOptions = {}
): string {
  const m = buildSheetModel(emp, opts);
  const e = escapeHtml;

  const mainLogo = `${origin}${MAIN_LOGO}`;
  const companyLogo = `${origin}${getCompanyLogo(emp.company)}`;

  const personHTML = m.person
    .map(f => `<div class="field"><div class="k">${e(f.label)}</div><div class="v${f.label === 'Nom complet' ? ' strong' : ''}">${e(f.value)}</div></div>`)
    .join('');

  const equipmentHTML = m.equipment
    .map(eq => `
      <tr>
        <td><div class="strong">${e(eq.kind)}</div><div class="muted small">${e(eq.kindSub)}</div></td>
        <td><div class="strong">${e(eq.name)}</div>${eq.detail ? `<div class="muted small">${e(eq.detail)}</div>` : ''}</td>
        <td><div>${e(eq.serial)}</div>${eq.serialSub ? `<div class="muted small">${e(eq.serialSub)}</div>` : ''}</td>
        <td class="right${eq.state === 'Défectueux' ? ' strong' : ''}">${e(eq.state)}</td>
      </tr>`)
    .join('');

  return `
  <section class="sheet">
    <header class="hdr">
      <img class="logo" src="${mainLogo}" alt="Lebrun S.A." />
      ${m.showCompanyLogo ? `<img class="logo" src="${companyLogo}" alt="${e(m.companyName)}" />` : ''}
    </header>

    <h1>Fiche d'affectation de matériel informatique</h1>
    <p class="subtitle">Remise de matériel et décharge de responsabilité</p>

    <div class="meta">
      <div><div class="k">Référence</div><div class="v strong">${e(m.docRef)}</div></div>
      <div><div class="k">Date d'émission</div><div class="v strong">${e(m.dateLabel)}</div></div>
      <div><div class="k">Site</div><div class="v strong">${e(m.site)}</div></div>
    </div>

    <h2>1. Collaborateur</h2>
    <div class="fields">${personHTML}</div>

    <h2>2. Matériel remis</h2>
    <table class="equipment">
      <thead>
        <tr><th style="width:21%">Équipement</th><th style="width:44%">Désignation</th><th style="width:23%">N° de série</th><th class="right" style="width:12%">État</th></tr>
      </thead>
      <tbody>${equipmentHTML}</tbody>
    </table>
    ${m.observations ? `<p class="obs"><span class="k">Observations</span>${e(m.observations)}</p>` : ''}

    <h2>3. Engagement du collaborateur</h2>
    <p class="legal">${e(m.legalText)}</p>

    <div class="signatures">
      <div class="sig">
        <div class="k">Le collaborateur</div>
        <div class="v strong">${e(m.fullName)}</div>
        <div class="muted small italic">Mention manuscrite : « Lu et approuvé »</div>
        <div class="date">Date : ____ / ____ / ________</div>
        <div class="sig-line"><span class="muted small">Signature</span></div>
      </div>
      <div class="sig">
        <div class="k">Pour la Direction des Systèmes d'Information</div>
        <div class="v strong">Direction Informatique</div>
        <div class="date">Date : ${e(m.dateLabel)}</div>
        <div class="sig-line"><span class="muted small">Signature et cachet</span></div>
      </div>
    </div>

    <footer class="foot">
      <span>Lebrun S.A. · Port-au-Prince, Haïti</span>
      <span>${e(m.docRef)}</span>
    </footer>
  </section>
  `;
}

export function getPrintCSS(): string {
  return `
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #ffffff; }
    body {
      font-family: Helvetica, Arial, sans-serif;
      color: #111111;
      font-size: 10pt;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .sheet {
      position: relative;
      width: 210mm;
      height: 296mm;
      padding: 12mm 18mm 0;
      background: #ffffff;
      overflow: hidden;
      break-after: page;
      page-break-after: always;
    }
    .sheet:last-child { break-after: auto; page-break-after: auto; }

    .k {
      font-size: 7pt;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #000000;
    }
    .v { font-size: 10pt; }
    .strong { font-weight: 700; }
    .muted { color: #000000; }
    .small { font-size: 8pt; }
    .italic { font-style: italic; }
    .right { text-align: right; }

    .hdr {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      height: 15mm;
      border-bottom: 0.3mm solid #cdcdcd;
    }
    .logo {
      max-height: 13mm;
      max-width: 46mm;
      object-fit: contain;
    }

    h1 { font-size: 17pt; font-weight: 700; line-height: 1.15; margin-top: 5mm; }
    .subtitle { font-size: 9.5pt; color: #000000; margin-top: 1.6mm; }

    .meta {
      display: grid;
      grid-template-columns: 76mm 52mm 1fr;
      margin-top: 2.5mm;
      padding: 2.2mm 0 2.4mm;
      border-top: 0.2mm solid #cdcdcd;
      border-bottom: 0.2mm solid #cdcdcd;
    }
    .meta .v { margin-top: 1mm; }

    h2 {
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding-bottom: 1.6mm;
      border-bottom: 0.35mm solid #111111;
      margin: 6mm 0 3mm;
    }

    .fields {
      display: grid;
      grid-template-columns: 88mm 1fr;
      row-gap: 2mm;
    }
    .field .v { margin-top: 0.8mm; overflow-wrap: anywhere; }

    table.equipment {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    .equipment th {
      font-size: 7pt;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #000000;
      font-weight: 700;
      text-align: left;
      padding: 0 0 1.6mm;
      border-bottom: 0.25mm solid #cdcdcd;
    }
    .equipment th.right { text-align: right; }
    .equipment td {
      vertical-align: top;
      padding: 1.4mm 2mm 1.4mm 0;
      border-bottom: 0.15mm solid #cdcdcd;
      font-size: 9.5pt;
      overflow-wrap: anywhere;
    }
    .equipment td.right { padding-right: 0; }
    .equipment td .small { margin-top: 0.4mm; }

    .obs { margin-top: 3.5mm; font-size: 9pt; }
    .obs .k { display: inline-block; width: 26mm; font-weight: 700; }

    .legal {
      font-size: 9pt;
      line-height: 1.42;
      color: #000000;
      text-align: justify;
    }

    .signatures {
      margin-top: 6mm;
      display: flex;
      justify-content: space-between;
    }
    .sig { width: 82mm; min-height: 33mm; display: flex; flex-direction: column; }
    .sig .v { margin-top: 1.4mm; }
    .sig .date { font-size: 9pt; margin-top: 2mm; }
    .sig-line {
      margin-top: auto;
      border-top: 0.3mm solid #111111;
      padding-top: 1.2mm;
    }

    .foot {
      position: absolute;
      left: 18mm;
      right: 18mm;
      bottom: 6mm;
      display: flex;
      justify-content: space-between;
      padding-top: 3mm;
      border-top: 0.2mm solid #cdcdcd;
      font-size: 7.5pt;
      color: #000000;
    }

    @media screen {
      html, body { background: #e5e7eb; }
      body { padding: 24px 0; }
      .sheet { margin: 0 auto 24px; box-shadow: 0 1px 10px rgba(0, 0, 0, 0.2); }
    }
  `;
}

export function getFullPrintHTML(sheetsHTML: string, autoPrint = true): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Fiches d'affectation - matériel informatique</title>
  <style>
    ${getPrintCSS()}
  </style>
</head>
<body>
  ${sheetsHTML}
  ${autoPrint
    ? `<script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>`
    : ''}
</body>
</html>`;
}

export function printSingleAssignmentSheet(emp: Employee, opts: AssignmentSheetOptions = {}): void {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const fullHTML = getFullPrintHTML(generateAssignmentSheetHTML(emp, origin, opts));

  const printWindow = window.open('', '_blank', 'width=920,height=1100');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(fullHTML);
    printWindow.document.close();
  }
}

export function printAllAssignmentSheets(sheets: AssignmentSheet[]): void {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const sheetsHTML = sheets.map(s => generateAssignmentSheetHTML(s.employee, origin, s.options)).join('\n');
  const fullHTML = getFullPrintHTML(sheetsHTML);

  const printWindow = window.open('', '_blank', 'width=920,height=1100');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(fullHTML);
    printWindow.document.close();
  }
}
