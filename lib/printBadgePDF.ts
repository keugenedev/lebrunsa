import { Employee } from '@/types/inventory';
import { BrandConfig, getBrandConfig, buildVCardString } from '@/lib/badgeBrands';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { formatNif } from '@/lib/formatNif';

// Dimensions officielles standard CR80 (ISO 7810 ID-1) : 54 mm × 85.6 mm
export const BADGE_WIDTH_MM = 54.0;
export const BADGE_HEIGHT_MM = 85.6;

/**
 * Construit un élément DOM sobre et propre pour le rendu PDF haute résolution
 */
async function createRenderableBadgeElement(
  emp: Employee,
  brand: BrandConfig,
  face: 'recto' | 'verso'
): Promise<HTMLDivElement> {
  const existingId = face === 'recto' ? `badge-recto-${emp.id}` : `badge-verso-${emp.id}`;
  const existingEl = document.getElementById(existingId);
  if (existingEl) {
    const clone = existingEl.cloneNode(true) as HTMLDivElement;
    clone.style.position = 'fixed';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.zIndex = '-1000';
    document.body.appendChild(clone);
    return clone;
  }

  const container = document.createElement('div');
  container.className = 'font-montserrat';
  Object.assign(container.style, {
    position: 'fixed',
    top: '-9999px',
    left: '-9999px',
    width: '288px',
    height: '456.5px',
    zIndex: '-1000',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    fontFamily: "'Montserrat', sans-serif",
    color: '#ffffff',
    backgroundColor: brand.bgPrimary
  });

  if (face === 'recto') {
    // Mention verticale à droite : GROUPE SANGUIN (Avancé près du cadre, descendu, sans trace - Uniquement si renseigné)
    if (emp.bloodGroup) {
      const bloodGroupEl = document.createElement('div');
      Object.assign(bloodGroupEl.style, {
        position: 'absolute',
        left: '238px',
        top: '248px',
        transformOrigin: '0 0',
        transform: 'rotate(-90deg)',
        whiteSpace: 'nowrap',
        fontSize: '8.5px',
        fontWeight: '700',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: 'rgba(255, 255, 255, 0.75)',
        fontFamily: "'Montserrat', sans-serif",
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: '10'
      });
      const labelSpan = document.createElement('span');
      labelSpan.textContent = 'GROUPE SANGUIN :';
      bloodGroupEl.appendChild(labelSpan);
      const valueSpan = document.createElement('span');
      valueSpan.textContent = emp.bloodGroup;
      Object.assign(valueSpan.style, {
        fontFamily: 'monospace',
        fontWeight: '700',
        color: '#ffffff'
      });
      bloodGroupEl.appendChild(valueSpan);
      container.appendChild(bloodGroupEl);
    }

    // Header : Logo seul dans un rectangle blanc contrasté
    const header = document.createElement('div');
    Object.assign(header.style, {
      paddingTop: '20px',
      paddingLeft: '18px',
      paddingRight: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });
    const logoBox = document.createElement('div');
    Object.assign(logoBox.style, {
      backgroundColor: '#ffffff',
      padding: '6px 16px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });
    const logoImg = document.createElement('img');
    logoImg.src = brand.logo;
    logoImg.alt = brand.displayName;
    Object.assign(logoImg.style, { height: '32px', maxWidth: '160px', objectFit: 'contain' });
    logoBox.appendChild(logoImg);
    header.appendChild(logoBox);
    container.appendChild(header);

    // Cadre photo sobre
    const photoContainer = document.createElement('div');
    Object.assign(photoContainer.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 'auto 0'
    });
    const frame = document.createElement('div');
    Object.assign(frame.style, {
      width: '176px',
      height: '192px',
      borderRadius: '28px',
      overflow: 'hidden',
      backgroundColor: brand.accentColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    });
    if (emp.photoUrl) {
      const img = document.createElement('img');
      img.src = emp.photoUrl;
      img.alt = emp.fullName;
      Object.assign(img.style, {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      });
      frame.appendChild(img);
    } else {
      const circle = document.createElement('div');
      Object.assign(circle.style, {
        width: '96px',
        height: '96px',
        borderRadius: '50%',
        backgroundColor: brand.bgPrimary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      });
      circle.innerHTML = `
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="${brand.accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      `;
      frame.appendChild(circle);
    }
    photoContainer.appendChild(frame);
    container.appendChild(photoContainer);

    // Identité
    const idContainer = document.createElement('div');
    Object.assign(idContainer.style, { textAlign: 'center', padding: '0 16px', marginBottom: '10px' });
    const nameEl = document.createElement('div');
    nameEl.textContent = emp.fullName;
    Object.assign(nameEl.style, {
      fontWeight: '800',
      fontSize: '17px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#ffffff'
    });
    idContainer.appendChild(nameEl);
    if (emp.nif && emp.nif.trim()) {
      const nifEl = document.createElement('div');
      nifEl.textContent = `NIF : ${formatNif(emp.nif)}`;
      Object.assign(nifEl.style, {
        fontFamily: 'monospace',
        fontSize: '10px',
        fontWeight: '600',
        letterSpacing: '0.8px',
        color: 'rgba(255, 255, 255, 0.85)',
        marginTop: '2px',
        textTransform: 'uppercase'
      });
      idContainer.appendChild(nifEl);
    }
    const dividerWrap = document.createElement('div');
    Object.assign(dividerWrap.style, { display: 'flex', justifyContent: 'center', margin: '6px 0' });
    const divider = document.createElement('div');
    Object.assign(divider.style, {
      width: '64px',
      height: '2.5px',
      borderRadius: '9999px',
      backgroundColor: brand.lineColor
    });
    dividerWrap.appendChild(divider);
    const titleEl = document.createElement('div');
    titleEl.textContent = emp.jobTitle || 'COLLABORATEUR';
    Object.assign(titleEl.style, {
      fontWeight: '600',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      color: '#f1f5f9'
    });
    idContainer.appendChild(dividerWrap);
    idContainer.appendChild(titleEl);
    container.appendChild(idContainer);

    // Bandeau inférieur : couleur brand, ID & Code-barres direct
    const footer = document.createElement('div');
    Object.assign(footer.style, {
      padding: '8px 14px 10px 14px',
      backgroundColor: brand.footerBg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    });
    const idLabel = document.createElement('div');
    idLabel.textContent = `ID ${emp.employeeId}`;
    Object.assign(idLabel.style, {
      fontWeight: '700',
      fontSize: '12px',
      letterSpacing: '1px',
      fontFamily: 'monospace',
      textTransform: 'uppercase',
      color: brand.footerText,
      marginBottom: '4px'
    });
    const bcWrap = document.createElement('div');
    Object.assign(bcWrap.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
    });
    const bcCanvas = document.createElement('canvas');
    try {
      JsBarcode(bcCanvas, emp.employeeId, {
        format: 'CODE128',
        width: 2.2,
        height: 60,
        displayValue: false,
        background: brand.footerBg,
        lineColor: '#000000',
        margin: 2
      });
    } catch (e) {
      console.error(e);
    }
    const bcImg = document.createElement('img');
    bcImg.src = bcCanvas.toDataURL('image/png');
    Object.assign(bcImg.style, { height: '38px', maxWidth: '100%', objectFit: 'contain' });
    bcWrap.appendChild(bcImg);
    footer.appendChild(idLabel);
    footer.appendChild(bcWrap);
    container.appendChild(footer);

  } else {
    // VERSO : Logo seul dans un rectangle blanc contrasté
    const header = document.createElement('div');
    Object.assign(header.style, {
      paddingTop: '16px',
      paddingLeft: '18px',
      paddingRight: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });
    const logoBox = document.createElement('div');
    Object.assign(logoBox.style, {
      backgroundColor: '#ffffff',
      padding: '5px 14px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    });
    const logoImg = document.createElement('img');
    logoImg.src = brand.logo;
    logoImg.alt = brand.displayName;
    Object.assign(logoImg.style, { height: '24px', maxWidth: '140px', objectFit: 'contain' });
    logoBox.appendChild(logoImg);
    header.appendChild(logoBox);
    container.appendChild(header);

    // QR Code
    const qrContainer = document.createElement('div');
    Object.assign(qrContainer.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 'auto 0',
      textAlign: 'center'
    });
    const qrBox = document.createElement('div');
    Object.assign(qrBox.style, {
      background: '#ffffff',
      padding: '8px',
      borderRadius: '12px',
      marginBottom: '8px'
    });
    let qrDataUrl = '';
    try {
      const vCardData = buildVCardString(emp, brand);
      qrDataUrl = await QRCode.toDataURL(vCardData, {
        width: 260,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      });
    } catch (e) {
      console.error(e);
    }
    const qrImg = document.createElement('img');
    qrImg.src = qrDataUrl;
    Object.assign(qrImg.style, { width: '110px', height: '110px', objectFit: 'contain', display: 'block' });
    qrBox.appendChild(qrImg);
    const qrLabel = document.createElement('div');
    qrLabel.textContent = 'SCAN SYSTÈME';
    Object.assign(qrLabel.style, {
      fontWeight: '700',
      fontSize: '10px',
      letterSpacing: '0.8px',
      textTransform: 'uppercase',
      color: '#ffffff'
    });
    qrContainer.appendChild(qrBox);
    qrContainer.appendChild(qrLabel);
    container.appendChild(qrContainer);

    // Coordonnées officielles
    const contacts = document.createElement('div');
    Object.assign(contacts.style, { padding: '0 18px', fontSize: '10px' });
    
    const makeRow = (icon: string, text: string, isBold = false) => {
      const row = document.createElement('div');
      Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: '#ffffff' });
      const i = document.createElement('span');
      i.textContent = icon;
      i.style.color = brand.accentColor;
      const t = document.createElement('span');
      t.textContent = text;
      if (isBold) Object.assign(t.style, { fontWeight: '700', fontFamily: 'monospace' });
      else Object.assign(t.style, { fontWeight: '500' });
      row.appendChild(i);
      row.appendChild(t);
      return row;
    };
    contacts.appendChild(makeRow('🌐', brand.website));
    contacts.appendChild(makeRow('✉️', brand.email));
    contacts.appendChild(makeRow('📞', brand.phoneFormatted, true));
    contacts.appendChild(makeRow('📍', brand.address));
    container.appendChild(contacts);

    // Terms
    const terms = document.createElement('div');
    terms.textContent = brand.terms;
    Object.assign(terms.style, { padding: '4px 18px', fontSize: '8px', color: '#94a3b8', lineHeight: '1.3', textAlign: 'justify' });
    container.appendChild(terms);

    // Bottom
    const bottom = document.createElement('div');
    Object.assign(bottom.style, {
      padding: '8px 18px',
      backgroundColor: brand.footerBg,
      color: brand.footerText,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '9.5px',
      fontWeight: '700',
      textTransform: 'uppercase'
    });
    const bLeft = document.createElement('span');
    bLeft.textContent = 'Personnel Autorisé';
    const bRight = document.createElement('span');
    bRight.textContent = emp.employeeId;
    Object.assign(bRight.style, { fontFamily: 'monospace' });
    bottom.appendChild(bLeft);
    bottom.appendChild(bRight);
    container.appendChild(bottom);
  }

  document.body.appendChild(container);

  // Attendre le chargement des images
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );

  return container;
}

/**
 * Capture un élément DOM en Canvas haute résolution (300 DPI)
 */
async function captureElementToCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import('html2canvas-pro');
  return html2canvas(el, {
    scale: 3.5, // 300+ DPI qualité imprimerie
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false
  });
}

/**
 * Télécharge le badge d'un collaborateur au format standard CR80 (54 mm × 85.6 mm)
 * Page 1 : Recto
 * Page 2 : Verso
 */
export async function downloadSingleBadgeCR80PDF(
  emp: Employee,
  brandOverride?: BrandConfig
): Promise<void> {
  if (typeof window === 'undefined') return;

  const brand = brandOverride || getBrandConfig(emp.company);
  const { default: JsPDF } = await import('jspdf');

  const doc = new JsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [BADGE_WIDTH_MM, BADGE_HEIGHT_MM],
    compress: true
  });

  // 1. Rendu Recto
  const rectoEl = await createRenderableBadgeElement(emp, brand, 'recto');
  const rectoCanvas = await captureElementToCanvas(rectoEl);
  if (rectoEl.parentNode) rectoEl.parentNode.removeChild(rectoEl);
  const rectoImgData = rectoCanvas.toDataURL('image/jpeg', 0.95);
  doc.addImage(rectoImgData, 'JPEG', 0, 0, BADGE_WIDTH_MM, BADGE_HEIGHT_MM);

  // 2. Rendu Verso (Page 2)
  doc.addPage([BADGE_WIDTH_MM, BADGE_HEIGHT_MM], 'portrait');
  const versoEl = await createRenderableBadgeElement(emp, brand, 'verso');
  const versoCanvas = await captureElementToCanvas(versoEl);
  if (versoEl.parentNode) versoEl.parentNode.removeChild(versoEl);
  const versoImgData = versoCanvas.toDataURL('image/jpeg', 0.95);
  doc.addImage(versoImgData, 'JPEG', 0, 0, BADGE_WIDTH_MM, BADGE_HEIGHT_MM);

  const cleanName = emp.fullName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanId = emp.employeeId.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Badge_${brand.displayName.replace(/\s+/g, '_')}_${cleanName}_${cleanId}.pdf`);
}

/**
 * Télécharge le badge sur une planche A4 prête à découper
 */
export async function downloadBadgePlancheA4PDF(
  emp: Employee,
  brandOverride?: BrandConfig
): Promise<void> {
  if (typeof window === 'undefined') return;

  const brand = brandOverride || getBrandConfig(emp.company);
  const { default: JsPDF } = await import('jspdf');

  const doc = new JsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const rectoEl = await createRenderableBadgeElement(emp, brand, 'recto');
  const rectoCanvas = await captureElementToCanvas(rectoEl);
  if (rectoEl.parentNode) rectoEl.parentNode.removeChild(rectoEl);
  const rectoImg = rectoCanvas.toDataURL('image/jpeg', 0.95);

  const versoEl = await createRenderableBadgeElement(emp, brand, 'verso');
  const versoCanvas = await captureElementToCanvas(versoEl);
  if (versoEl.parentNode) versoEl.parentNode.removeChild(versoEl);
  const versoImg = versoCanvas.toDataURL('image/jpeg', 0.95);

  const spacing = 12;
  const totalW = BADGE_WIDTH_MM * 2 + spacing;
  const startX = (210 - totalW) / 2;
  const startY = 40;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`PLANCHE D'IMPRESSION BADGE CR80 — ${brand.legalName.toUpperCase()}`, 105, 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Collaborateur : ${emp.fullName} (${emp.employeeId}) • Format : 5.40 cm × 8.56 cm`, 105, 26, { align: 'center' });
  doc.text(`Imprimer à échelle 100%`, 105, 31, { align: 'center' });

  const rectoX = startX;
  doc.addImage(rectoImg, 'JPEG', rectoX, startY, BADGE_WIDTH_MM, BADGE_HEIGHT_MM);

  const versoX = startX + BADGE_WIDTH_MM + spacing;
  doc.addImage(versoImg, 'JPEG', versoX, startY, BADGE_WIDTH_MM, BADGE_HEIGHT_MM);

  // Repères de coupe
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);

  const drawCropMarks = (x: number, y: number, w: number, h: number) => {
    const len = 4;
    const gap = 1.5;
    doc.line(x - gap - len, y, x - gap, y);
    doc.line(x, y - gap - len, x, y - gap);
    doc.line(x + w + gap, y, x + w + gap + len, y);
    doc.line(x + w, y - gap - len, x + w, y - gap);
    doc.line(x - gap - len, y + h, x - gap, y + h);
    doc.line(x, y + h + gap, x, y + h + gap + len);
    doc.line(x + w + gap, y + h, x + w + gap + len, y + h);
    doc.line(x + w, y + h + gap, x + w, y + h + gap + len);
  };

  drawCropMarks(rectoX, startY, BADGE_WIDTH_MM, BADGE_HEIGHT_MM);
  drawCropMarks(versoX, startY, BADGE_WIDTH_MM, BADGE_HEIGHT_MM);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('RECTO', rectoX + BADGE_WIDTH_MM / 2, startY + BADGE_HEIGHT_MM + 6, { align: 'center' });
  doc.text('VERSO', versoX + BADGE_WIDTH_MM / 2, startY + BADGE_HEIGHT_MM + 6, { align: 'center' });

  const cleanName = emp.fullName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Planche_A4_Badge_${cleanName}.pdf`);
}

/**
 * Télécharge un lot de badges au format PDF multipages (CR80)
 */
export async function downloadBatchBadgesPDF(
  employees: Employee[],
  onProgress?: (curr: number, total: number) => void
): Promise<void> {
  if (typeof window === 'undefined' || !employees || employees.length === 0) return;

  const { default: JsPDF } = await import('jspdf');

  const doc = new JsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [BADGE_WIDTH_MM, BADGE_HEIGHT_MM],
    compress: true
  });

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const brand = getBrandConfig(emp.company);

    if (i > 0) doc.addPage([BADGE_WIDTH_MM, BADGE_HEIGHT_MM], 'portrait');
    onProgress?.(i * 2 + 1, employees.length * 2);

    const rectoEl = await createRenderableBadgeElement(emp, brand, 'recto');
    const rectoCanvas = await captureElementToCanvas(rectoEl);
    if (rectoEl.parentNode) rectoEl.parentNode.removeChild(rectoEl);
    const rectoImg = rectoCanvas.toDataURL('image/jpeg', 0.95);
    doc.addImage(rectoImg, 'JPEG', 0, 0, BADGE_WIDTH_MM, BADGE_HEIGHT_MM);

    doc.addPage([BADGE_WIDTH_MM, BADGE_HEIGHT_MM], 'portrait');
    onProgress?.(i * 2 + 2, employees.length * 2);

    const versoEl = await createRenderableBadgeElement(emp, brand, 'verso');
    const versoCanvas = await captureElementToCanvas(versoEl);
    if (versoEl.parentNode) versoEl.parentNode.removeChild(versoEl);
    const versoImg = versoCanvas.toDataURL('image/jpeg', 0.95);
    doc.addImage(versoImg, 'JPEG', 0, 0, BADGE_WIDTH_MM, BADGE_HEIGHT_MM);
  }

  doc.save(`Badges_Total_${employees.length}_Employes.pdf`);
}
