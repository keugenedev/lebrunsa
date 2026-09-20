import type { jsPDF } from 'jspdf';
import { Employee, PhoneAsset } from '@/types/inventory';
import { MAIN_LOGO, getCompanyLogo, getLogoData } from '@/lib/printAssignmentSheet';

/* -------------------------------------------------------------------------- */
/*  Fiche d'affectation de téléphone (PDF A4, une page)                       */
/*  Même design que la fiche d'affectation de poste informatique.             */
/* -------------------------------------------------------------------------- */

export interface PhoneSheetOptions {
  /** Date d'émission (par défaut : aujourd'hui). */
  date?: Date;
  /** Référence déjà enregistrée dans la base : elle est réutilisée telle quelle. */
  reference?: string;
}

/** Référence de la fiche : FT-<SOC>-<AAAAMMJJ>-<code du téléphone>. */
export function buildPhoneDocRef(phone: PhoneAsset, opts: PhoneSheetOptions = {}): string {
  if (opts.reference) return opts.reference;
  const d = opts.date || new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const company = (phone.company || 'LEB').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'LEB';
  return `FT-${company}-${ymd}-${phone.assetTag.replace(/^.*?TEL-/, '')}`;
}

const DASH = '—';
const orDash = (v?: string | null) => {
  const s = (v ?? '').toString().trim();
  return s && s.toUpperCase() !== 'N/A' ? s : DASH;
};

const LEGAL_TEXT =
  "Le collaborateur reconnaît avoir reçu ce jour le téléphone décrit ci-dessus, en bon état de fonctionnement. " +
  "Il s'engage à l'utiliser dans le cadre de ses missions, à le protéger par un code de verrouillage et à respecter " +
  "la politique de sécurité de l'entreprise. Ce téléphone reste la propriété de l'entreprise : il devra être restitué " +
  "sur simple demande de la Direction des Systèmes d'Information ou de la Direction, ainsi qu'en cas de départ, de " +
  "mutation ou de fin de contrat. En cas de perte ou de vol, le collaborateur doit le signaler immédiatement à la DSI " +
  "afin de faire bloquer l'appareil (IMEI) et la ligne.";

const PAGE = { w: 210, h: 297, margin: 18 };
const X0 = PAGE.margin;
const X1 = PAGE.w - PAGE.margin;
const CONTENT_W = X1 - X0;
const INK = 17;
const RULE = 205;

export async function renderVectorPhoneSheet(
  doc: jsPDF,
  phone: PhoneAsset,
  emp: Employee | undefined,
  origin: string,
  opts: PhoneSheetOptions = {}
): Promise<void> {
  const date = opts.date || new Date();
  const reference = buildPhoneDocRef(phone, opts);
  const dateLabel = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const fullName = emp?.fullName || phone.assignedTo || '';
  const site = orDash(emp?.site || emp?.location || phone.site);
  const showCompanyLogo = getCompanyLogo(phone.company) !== MAIN_LOGO;

  const [mainLogo, companyLogo] = await Promise.all([
    getLogoData(`${origin}${MAIN_LOGO}`),
    showCompanyLogo ? getLogoData(`${origin}${getCompanyLogo(phone.company)}`) : Promise.resolve(null)
  ]);

  const text = (
    str: string,
    x: number,
    y: number,
    o: { size: number; bold?: boolean; italic?: boolean; align?: 'left' | 'right' | 'center' }
  ) => {
    doc.setFont('helvetica', o.bold ? 'bold' : o.italic ? 'italic' : 'normal');
    doc.setFontSize(o.size);
    doc.setTextColor(0, 0, 0);
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

  const field = (label: string, value: string, x: number, y: number, maxW: number, bold = false) => {
    text(label.toUpperCase(), x, y, { size: 7 });
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(10);
    const line = (doc.splitTextToSize(value, maxW) as string[])[0] || DASH;
    text(line, x, y + 4.6, { size: 10, bold });
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
  text("Fiche d'affectation de téléphone", X0, 40, { size: 17, bold: true });
  text('Remise de matériel et décharge de responsabilité', X0, 46.5, { size: 9.5 });

  // --- Références ---
  const metaY = 55;
  hRule(metaY - 3.5, X0, X1);
  (
    [
      ['Référence', reference, X0],
      ["Date d'émission", dateLabel, X0 + 76],
      ['Site', site, X0 + 128]
    ] as [string, string, number][]
  ).forEach(([label, value, x]) => {
    text(label.toUpperCase(), x, metaY, { size: 7 });
    text(value, x, metaY + 4.8, { size: 10, bold: true });
  });
  hRule(metaY + 8, X0, X1);

  // --- 1. Collaborateur ---
  let y = 73;
  sectionTitle('1. Collaborateur', y);
  y += 8.5;
  const cols2 = [X0, X0 + 88];
  const person: [string, string, boolean?][] = [
    ['Nom complet', orDash(fullName), true],
    ['Matricule', orDash(emp?.employeeId || phone.assignedPersonnelId)],
    ['Société', orDash(emp?.company || phone.company)],
    ['Site', site],
    ['Fonction', orDash(emp?.jobTitle)],
    ['Service', orDash(emp?.department)],
    ['Email', orDash(emp?.email)],
    ['Téléphone', orDash(emp?.phone)]
  ];
  for (let i = 0; i < person.length; i += 2) {
    for (let c = 0; c < 2; c++) {
      const [label, value, bold] = person[i + c];
      field(label, value, cols2[c], y, 82, Boolean(bold));
    }
    y += 9.8;
  }

  // --- 2. Téléphone remis ---
  y += 5;
  sectionTitle('2. Téléphone remis', y);
  y += 8.5;
  const cols3 = [X0, X0 + 62, X0 + 124];
  const device: [string, string, boolean?][] = [
    ['Marque', orDash(phone.brand), true],
    ['Modèle', orDash(phone.model), true],
    ['Code inventaire', orDash(phone.assetTag)],
    ['IMEI 1', orDash(phone.imei1)],
    ['IMEI 2', orDash(phone.imei2)],
    ['Date de remise', dateLabel]
  ];
  for (let i = 0; i < device.length; i += 3) {
    for (let c = 0; c < 3; c++) {
      const [label, value, bold] = device[i + c];
      field(label, value, cols3[c], y, 58, Boolean(bold));
    }
    y += 9.8;
  }

  const obs = (phone.observations || '').trim();
  if (obs) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = (doc.splitTextToSize(obs, CONTENT_W - 26) as string[]).slice(0, 2);
    text('OBSERVATIONS', X0, y + 1, { size: 7 });
    lines.forEach((l, i) => text(l, X0 + 26, y + 1 + i * 4.2, { size: 9 }));
    y += 1 + lines.length * 4.2;
  }

  // --- 3. Engagement ---
  y += 9;
  sectionTitle('3. Engagement du collaborateur', y);
  y += 7.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const legalLines = doc.splitTextToSize(LEGAL_TEXT, CONTENT_W) as string[];
  doc.text(LEGAL_TEXT, X0, y, { align: 'justify', maxWidth: CONTENT_W, lineHeightFactor: 1.42 });
  y += (legalLines.length - 1) * 9 * 0.3528 * 1.42;

  // --- Signatures ---
  const sigTop = y + 12;
  const sigW = 82;
  const sigX = [X0, X1 - sigW];
  const blocks = [
    {
      title: 'Le collaborateur',
      name: fullName,
      note: 'Mention manuscrite : « Lu et approuvé »',
      date: 'Date : ____ / ____ / ________',
      caption: 'Signature'
    },
    {
      title: "Pour la Direction des Systèmes d'Information",
      name: 'Direction Informatique',
      note: '',
      date: `Date : ${dateLabel}`,
      caption: 'Signature et cachet'
    }
  ];
  blocks.forEach((b, i) => {
    const x = sigX[i];
    doc.setCharSpace(0.25);
    text(b.title.toUpperCase(), x, sigTop, { size: 7, bold: true });
    doc.setCharSpace(0);
    text(b.name, x, sigTop + 6, { size: 10, bold: true });
    if (b.note) text(b.note, x, sigTop + 11, { size: 8, italic: true });
    text(b.date, x, sigTop + (b.note ? 17 : 12), { size: 9 });
    const lineY = sigTop + 31;
    hRule(lineY, x, x + sigW, INK, 0.3);
    text(b.caption, x, lineY + 4, { size: 7.5 });
  });

  // --- Pied de page ---
  const footY = PAGE.h - 10;
  hRule(footY - 4, X0, X1);
  text('Lebrun S.A. · Port-au-Prince, Haïti', X0, footY, { size: 7.5 });
  text(reference, X1, footY, { size: 7.5, align: 'right' });
}

const safe = (s: string, fallback: string) => (s || fallback).trim().replace(/[^a-zA-Z0-9_-]/g, '_') || fallback;

/** Génère et télécharge la fiche d'affectation d'un téléphone (PDF A4, 1 page). */
export async function downloadPhoneSheetPDF(
  phone: PhoneAsset,
  emp: Employee | undefined,
  opts: PhoneSheetOptions = {}
): Promise<void> {
  if (typeof window === 'undefined') return;
  const { default: JsPDF } = await import('jspdf');
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  await renderVectorPhoneSheet(doc, phone, emp, window.location.origin, opts);
  doc.save(`Fiche_Telephone_${safe(emp?.fullName || phone.assignedTo || '', 'Collaborateur')}_${safe(phone.assetTag, 'TEL')}.pdf`);
}
