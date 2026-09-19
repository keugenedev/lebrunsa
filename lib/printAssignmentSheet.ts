import { Employee } from '@/types/inventory';
import type { jsPDF } from 'jspdf';

export function getCompanyLogo(company?: string): string {
  const c = (company || '').toLowerCase();
  if (c.includes('caribe')) return '/caribe motors.png';
  if (c.includes('autobiz')) return '/Autobiz.png';
  if (c.includes('leader')) return '/leader.png';
  if (c.includes('tirezone')) return '/Tirezone.png';
  return '/Lebrunog.png';
}

/**
 * Convertit une image en Data URL PNG en niveaux de gris (monochrome strict)
 * avec un timeout garanti pour ne JAMAIS bloquer la génération.
 */
async function getGrayscaleBase64Logo(url: string): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (typeof window === 'undefined' || !url) return null;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(null);
    }, 1200);

    const img = new Image();
    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || img.width || 100;
        const h = img.naturalHeight || img.height || 40;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        ctx.drawImage(img, 0, 0);
        try {
          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] === 0) continue;
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
          }
          ctx.putImageData(imgData, 0, 0);
        } catch {
          // Si tainted canvas, on continue avec l'image telle quelle
        }
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width: w,
          height: h
        });
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
}

/**
 * Dessine une fiche d'affectation vectorielle parfaite au format A4 portrait (Page 1/1 stricte)
 * Monochrome strict, sans faux sceau, 100% lisible et nette.
 */
export async function renderVectorAssignmentSheet(doc: jsPDF, emp: Employee, origin: string): Promise<void> {
  const docRef = `FA-${(emp.company || 'LEB').slice(0, 3).toUpperCase()}-2026-${emp.employeeId || '001'}`;
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const ws = emp.workstation || {
    type: 'Poste Fixe (Desktop)',
    pcName: 'Non renseigné',
    pcSerial: 'N/A',
    pcSpecs: 'Intel Core i5 - 16 GB RAM - SSD 500 GB - Windows 11 Pro',
    monitorModel: 'Dell Professional 22"',
    monitorSerial: 'N/A',
    monitorObs: 'Conforme',
    keyboard: 'Clavier Dell Câble',
    keyboardDetails: 'Alpha-numérique standard',
    keyboardObs: 'Conforme',
    mouse: 'Souris Dell',
    mouseDetails: 'Souris Bureau (Câble)',
    mouseObs: 'Conforme',
    generalState: 'Conforme',
    observations: 'Conforme'
  };

  // Logos N&B (haute qualité vectorielle/PNG)
  const leftLogoUrl = `${origin}/Lebrunog.png`;
  const rightLogoUrl = `${origin}${getCompanyLogo(emp.company)}`;

  const [leftLogo, rightLogo] = await Promise.all([
    getGrayscaleBase64Logo(leftLogoUrl),
    getGrayscaleBase64Logo(rightLogoUrl)
  ]);

  if (leftLogo) {
    const ratio = leftLogo.width / leftLogo.height;
    const targetH = 9.5;
    const targetW = Math.min(30, targetH * ratio);
    doc.addImage(leftLogo.dataUrl, 'PNG', 14, 7.5, targetW, targetH);
  }

  if (rightLogo) {
    const ratio = rightLogo.width / rightLogo.height;
    const targetH = 9.5;
    const targetW = Math.min(30, targetH * ratio);
    doc.addImage(rightLogo.dataUrl, 'PNG', 196 - targetW, 7.5, targetW, targetH);
  }

  // 1. En-tête Institutionnel : LEBRUN S.A. (pas de Groupe)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('LEBRUN S.A.', 105, 11, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text("DIRECTION DES SYSTÈMES D'INFORMATION (DSI) • PARC INFORMATIQUE", 105, 15, { align: 'center' });

  // Ligne de séparation haute
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(14, 18.5, 196, 18.5);

  // 2. Titre Officiel du Document
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(0, 0, 0);
  doc.text("FICHE D'AFFECTATION DE MATÉRIEL INFORMATIQUE", 105, 23.5, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(90, 90, 90);
  doc.text('Procès-Verbal Officiel de Mise à Disposition & Décharge de Responsabilité', 105, 27.2, { align: 'center' });

  // Barre Métadonnées (RÉFÉRENCE | DATE | SITE)
  doc.setFillColor(243, 244, 246);
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.roundedRect(14, 29.5, 182, 5.5, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text('RÉFÉRENCE : ' + docRef, 20, 33.3);
  doc.setTextColor(170, 170, 170);
  doc.text('|', 78, 33.3);
  doc.setTextColor(0, 0, 0);
  doc.text("DATE D'ÉMISSION : " + today, 86, 33.3);
  doc.setTextColor(170, 170, 170);
  doc.text('|', 148, 33.3);
  doc.setTextColor(0, 0, 0);
  doc.text('SITE : ' + (emp.site || emp.location || 'Delmas 52'), 156, 33.3);

  // 3. Section 1 : Bénéficiaire
  let y = 38;
  doc.setFillColor(17, 24, 39);
  doc.rect(14, y, 182, 4.4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text('1. IDENTIFICATION DU COLLABORATEUR (BÉNÉFICIAIRE)', 17, y + 3.1);

  y += 4.4;
  const s1Rows = [
    ['Nom & Prénom :', emp.fullName || 'N/A', 'Matricule Salarié :', emp.employeeId || 'N/A'],
    ['Entreprise / Entité :', emp.company || 'Lebrun S.A.', 'Site / Affectation :', emp.site || emp.location || 'Delmas 52'],
    ['Fonction / Poste :', emp.jobTitle || 'Collaborateur', 'Département / Service :', emp.department || 'Opérations'],
    ['Email Professionnel :', emp.email || 'N/A', 'Téléphone de Contact :', emp.phone || 'N/A'],
    ['Session Windows :', (emp.accounts && emp.accounts.windowsUsername) || 'Admin', 'Compte ERP / App (GP) :', (emp.accounts && emp.accounts.appUsername) || 'N/A']
  ];

  doc.setLineWidth(0.15);
  doc.setDrawColor(180, 180, 180);
  const rowH = 4.4;
  for (let i = 0; i < s1Rows.length; i++) {
    const r = s1Rows[i];
    const curY = y + i * rowH;
    // Col 1 label
    doc.setFillColor(248, 250, 252);
    doc.rect(14, curY, 36, rowH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(70, 70, 70);
    doc.text(r[0], 16, curY + 2.9);

    // Col 2 value
    doc.setFillColor(255, 255, 255);
    doc.rect(50, curY, 55, rowH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(r[1], 52, curY + 2.9);

    // Col 3 label
    doc.setFillColor(248, 250, 252);
    doc.rect(105, curY, 36, rowH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 70, 70);
    doc.text(r[2], 107, curY + 2.9);

    // Col 4 value
    doc.setFillColor(255, 255, 255);
    doc.rect(141, curY, 55, rowH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(r[3], 143, curY + 2.9);
  }

  y += s1Rows.length * rowH + 3;

  // 4. Section 2 : Équipements Assignés
  doc.setFillColor(17, 24, 39);
  doc.rect(14, y, 182, 4.4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text('2. INVENTAIRE DU MATÉRIEL & ÉQUIPEMENTS ASSIGNÉS', 17, y + 3.1);

  y += 4.4;
  // En-tête tableau équipements
  doc.setFillColor(55, 65, 81);
  doc.rect(14, y, 182, 4.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(255, 255, 255);
  doc.text('COMPOSANT', 16, y + 2.8);
  doc.text('DÉSIGNATION, MARQUE & MODÈLE', 52, y + 2.8);
  doc.text('N° DE SÉRIE (S/N) / HOSTNAME', 130, y + 2.8);
  doc.text('ÉTAT CONSTATÉ', 175, y + 2.8, { align: 'center' });

  y += 4.2;
  const eqRows = [
    {
      comp: 'Ordinateur / UC',
      sub: ws.type || 'Poste Fixe',
      desc: ws.pcName || 'Dell Workstation',
      specs: ws.pcSpecs || 'Intel Core i5 - 16 GB RAM - SSD 500 GB - Windows 11 Pro',
      sn: 'S/N : ' + (ws.pcSerial || 'N/A'),
      etat: (ws.generalState || 'Conforme').toUpperCase()
    },
    {
      comp: 'Écran / Moniteur',
      sub: 'Affichage principal',
      desc: ws.monitorModel || 'Écran Dell Professional 22"',
      specs: 'Écran professionnel haute résolution avec pied réglable',
      sn: 'S/N : ' + (ws.monitorSerial || 'N/A'),
      etat: (ws.monitorObs || 'Conforme').toUpperCase()
    },
    {
      comp: 'Clavier',
      sub: 'Périphérique de saisie',
      desc: ws.keyboard || 'Clavier Dell Standard',
      specs: 'Format : ' + (ws.keyboardDetails || 'Alpha-numérique USB'),
      sn: 'Rattaché au poste ' + (ws.pcName || ''),
      etat: (ws.keyboardObs || 'Conforme').toUpperCase()
    },
    {
      comp: 'Souris',
      sub: 'Dispositif de pointage',
      desc: ws.mouse || 'Souris Optique Dell',
      specs: 'Format : ' + (ws.mouseDetails || 'Souris optique filaire'),
      sn: 'Rattachée au poste ' + (ws.pcName || ''),
      etat: (ws.mouseObs || 'Conforme').toUpperCase()
    },
    {
      comp: 'Connectique & Câbles',
      sub: 'Alimentation & Vidéo',
      desc: "Lot Câble d'Alimentation & Câble Vidéo",
      specs: 'Cordon secteur tripolaire 110V/220V + Câble HDMI / DP',
      sn: 'Lot certifié standard',
      etat: 'CONFORME'
    }
  ];

  const eqRowH = 9.2;
  for (let i = 0; i < eqRows.length; i++) {
    const eq = eqRows[i];
    const curY = y + i * eqRowH;
    doc.setFillColor(i % 2 === 0 ? 255 : 249, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
    doc.rect(14, curY, 182, eqRowH, 'FD');

    // Col 1
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(0, 0, 0);
    doc.text(eq.comp, 16, curY + 3.6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(90, 90, 90);
    doc.text(eq.sub, 16, curY + 7.2);

    // Col 2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(0, 0, 0);
    doc.text(eq.desc, 52, curY + 3.6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(60, 60, 60);
    const specsLines = doc.splitTextToSize(eq.specs, 74);
    doc.text(specsLines[0] || '', 52, curY + 7.2);

    // Col 3
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(0, 0, 0);
    doc.text(eq.sn, 130, curY + 5.2);

    // Col 4 : État sobre et propre (PAS de bouton moche)
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.15);
    doc.setFillColor(255, 255, 255);
    doc.rect(167, curY + 2.6, 16, 4.2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(0, 0, 0);
    doc.text(eq.etat, 175, curY + 5.6, { align: 'center' });

    // Lignes verticales internes
    doc.line(50, curY, 50, curY + eqRowH);
    doc.line(128, curY, 128, curY + eqRowH);
    doc.line(165, curY, 165, curY + eqRowH);
  }

  y += eqRows.length * eqRowH + 3;

  // 5. Section 3 : Engagement & Décharge (Lebrun S.A., pas de Groupe)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.2);
  doc.roundedRect(14, y, 182, 17.5, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text('3. ENGAGEMENT FORMEL & DÉCHARGE DE RESPONSABILITÉ', 17, y + 3.4);
  doc.line(14, y + 4.8, 196, y + 4.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(30, 41, 59);
  const legalText = "Le collaborateur soussigné certifie expressément avoir reçu en main propre ce jour la totalité des équipements, périphériques et accessoires mentionnés ci-dessus, configurés et reconnus en bon état de fonctionnement. Il s'engage à en assurer la garde vigilante, à les utiliser exclusivement dans le cadre de ses missions professionnelles conformément à la charte informatique et à la Politique de Sécurité des Systèmes d'Information (PSSI) de Lebrun S.A. En cas de départ de l'entreprise, mutation, fin de contrat ou sur simple demande de la DSI ou de la Direction Générale, le matériel devra être immédiatement restitué dans son état d'origine.";
  const splitLegal = doc.splitTextToSize(legalText, 176);
  doc.text(splitLegal, 17, y + 7.8);

  y += 17.5 + 3;

  // 6. Section 4 : Visas, Signatures & Sceau Officiel (Entièrement visible, jamais coupée)
  doc.setFillColor(17, 24, 39);
  doc.rect(14, y, 182, 4.4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text('4. VISAS, SIGNATURES & VALIDATION OFFICIELLE', 17, y + 3.1);

  y += 4.4 + 1.8;
  const sigBoxH = 44;

  // Cadre Salarié
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.2);
  doc.rect(14, y, 88, sigBoxH, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(0, 0, 0);
  doc.text('LE COLLABORATEUR / BÉNÉFICIAIRE', 17, y + 4.2);
  doc.line(14, y + 5.8, 102, y + 5.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('M./Mme ' + (emp.fullName || ''), 17, y + 10.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.8);
  doc.setTextColor(80, 80, 80);
  doc.text('Mention obligatoire : « Lu et approuvé, matériel reçu conforme »', 17, y + 14.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text('Date : ______ / ______ / 2026', 17, y + 19);

  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(17, y + 30, 99, y + 30);
  doc.setLineDashPattern([], 0);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.8);
  doc.setTextColor(120, 120, 120);
  doc.text('Signature manuscrite du collaborateur :', 17, y + 34);

  // Cadre DSI
  doc.setFillColor(255, 255, 255);
  doc.rect(108, y, 88, sigBoxH, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(0, 0, 0);
  doc.text("POUR LA DIRECTION DES SYSTÈMES D'INFORMATION", 111, y + 4.2);
  doc.line(108, y + 5.8, 196, y + 5.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('Direction Informatique / Lebrun S.A.', 111, y + 10.5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.8);
  doc.setTextColor(80, 80, 80);
  doc.text('Mention : « Matériel audité, configuré et remis conforme »', 111, y + 14.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text("Date d'émission : " + today, 111, y + 19);

  // Ligne signature DSI
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(111, y + 30, 148, y + 30);
  doc.setLineDashPattern([], 0);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.8);
  doc.setTextColor(120, 120, 120);
  doc.text('Signature & Visa DSI :', 111, y + 34);

  // Cadre réservé au Sceau Officiel réel (Laissé vide pour apposition de votre tampon physique)
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(80, 80, 80);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.rect(152, y + 21, 41, 20, 'FD');
  doc.setLineDashPattern([], 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(0, 0, 0);
  doc.text('CADRE RÉSERVÉ AU', 172.5, y + 29, { align: 'center' });
  doc.text('SCEAU OFFICIEL', 172.5, y + 32.5, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(4.6);
  doc.setTextColor(100, 100, 100);
  doc.text('(Tampon physique & visa)', 172.5, y + 36.5, { align: 'center' });

  // 7. Bas de page officiel
  const footerY = 284;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.line(14, footerY, 196, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text('Lebrun S.A. • Port-au-Prince, Haïti • Delmas 52 / Pétion-Ville', 14, footerY + 3.8);
  doc.text("Fiche officielle d'affectation individuelle IT • Exemplaire Original • Page 1 / 1", 196, footerY + 3.8, { align: 'right' });
}

/**
 * Génère et télécharge directement un fichier PDF vectoriel pur, haute fidélité,
 * sans coupure et instantané.
 */
export async function downloadSingleAssignmentSheetPDF(emp: Employee): Promise<void> {
  if (typeof window === 'undefined') return;

  const { default: jsPDF } = await import('jspdf');
  const origin = window.location.origin;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  await renderVectorAssignmentSheet(doc, emp, origin);

  const safeName = (emp.fullName || 'Collaborateur').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeId = (emp.employeeId || '001').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Fiche_Affectation_${safeName}_${safeId}.pdf`);
}

/**
 * Génère et télécharge un PDF multipages pour l'ensemble des collaborateurs filtrés.
 */
export async function downloadAllAssignmentSheetsPDF(
  employees: Employee[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (typeof window === 'undefined' || !employees || employees.length === 0) return;

  const { default: jsPDF } = await import('jspdf');
  const origin = window.location.origin;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  for (let i = 0; i < employees.length; i++) {
    if (i > 0) {
      doc.addPage('a4', 'portrait');
    }
    if (onProgress) {
      onProgress(i + 1, employees.length);
    }
    await renderVectorAssignmentSheet(doc, employees[i], origin);
  }

  doc.save(`Fiches_Affectation_Lebrun_SA_Total_${employees.length}.pdf`);
}

/**
 * Template HTML/CSS pour l'aperçu à l'écran et pour l'impression navigateur (window.print)
 */
export function generateAssignmentSheetHTML(emp: Employee, origin: string): string {
  const leftLogo = `${origin}/Lebrunog.png`;
  const rightLogo = `${origin}${getCompanyLogo(emp.company)}`;
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const docRef = `FA-${(emp.company || 'LEB').slice(0, 3).toUpperCase()}-2026-${emp.employeeId || '001'}`;

  const ws = emp.workstation || {
    type: 'Poste Fixe (Desktop)',
    pcName: 'Non renseigné',
    pcSerial: 'N/A',
    pcSpecs: 'Intel Core i5 - 16 GB RAM - SSD 500 GB - Windows 11 Pro',
    monitorModel: 'Dell Professional 22"',
    monitorSerial: 'N/A',
    monitorObs: 'Conforme',
    keyboard: 'Clavier Dell Câble',
    keyboardDetails: 'Alpha-numérique',
    keyboardObs: 'Conforme',
    mouse: 'Dell',
    mouseDetails: 'Souris Bureau (Câble)',
    mouseObs: 'Conforme',
    generalState: 'Conforme',
    observations: 'Conforme'
  };

  return `
  <div class="sheet-container">
    <!-- En-tête : Logos N&B à gauche et à droite -->
    <div class="header-logos-row">
      <div class="logo-box-left">
        <img src="${leftLogo}" class="logo-left" alt="Lebrun S.A." />
      </div>
      <div class="header-center-info">
        <div class="header-org-title">LEBRUN S.A.</div>
        <div class="header-org-sub">Direction des Systèmes d'Information (DSI) • Service Parc & Matériel</div>
      </div>
      <div class="logo-box-right">
        <img src="${rightLogo}" class="logo-right" alt="${emp.company || 'Filiale'}" />
      </div>
    </div>

    <!-- Bloc Titre Officiel du Document -->
    <div class="doc-title-block">
      <h1 class="doc-main-title">FICHE D'AFFECTATION DE MATÉRIEL INFORMATIQUE</h1>
      <div class="doc-sub-title">Procès-Verbal Officiel de Remise de Matériel & Décharge de Responsabilité</div>
      <div class="doc-meta-bar">
        <span class="meta-item"><strong>RÉFÉRENCE :</strong> ${docRef}</span>
        <span class="meta-sep">|</span>
        <span class="meta-item"><strong>DATE D'ÉMISSION :</strong> ${today}</span>
        <span class="meta-sep">|</span>
        <span class="meta-item"><strong>SITE :</strong> ${emp.site || emp.location || 'Delmas 52'}</span>
      </div>
    </div>

    <!-- Section 1 : Bénéficiaire -->
    <div class="section-title">1. IDENTIFICATION DU COLLABORATEUR (BÉNÉFICIAIRE)</div>
    <table class="data-table">
      <tr>
        <td class="label-cell" style="width: 24%;">Nom & Prénom :</td>
        <td class="value-cell" style="width: 26%;"><strong>${emp.fullName}</strong></td>
        <td class="label-cell" style="width: 24%;">Matricule Salarié :</td>
        <td class="value-cell font-mono" style="width: 26%;"><strong>${emp.employeeId}</strong></td>
      </tr>
      <tr>
        <td class="label-cell">Entreprise / Entité :</td>
        <td class="value-cell"><strong>${emp.company || 'Lebrun S.A.'}</strong></td>
        <td class="label-cell">Site / Affectation :</td>
        <td class="value-cell">${emp.site || emp.location || 'Delmas 52'}</td>
      </tr>
      <tr>
        <td class="label-cell">Fonction / Poste :</td>
        <td class="value-cell">${emp.jobTitle || 'Collaborateur'}</td>
        <td class="label-cell">Département / Service :</td>
        <td class="value-cell">${emp.department || 'Opérations'}</td>
      </tr>
      <tr>
        <td class="label-cell">Email Professionnel :</td>
        <td class="value-cell">${emp.email || 'N/A'}</td>
        <td class="label-cell">Téléphone de Contact :</td>
        <td class="value-cell">${emp.phone || 'N/A'}</td>
      </tr>
      <tr>
        <td class="label-cell">Session Windows :</td>
        <td class="value-cell font-mono">${emp.accounts?.windowsUsername || 'Admin'}</td>
        <td class="label-cell">Compte ERP / App (GP) :</td>
        <td class="value-cell font-mono">${emp.accounts?.appUsername || 'N/A'}</td>
      </tr>
    </table>

    <!-- Section 2 : Équipements Assignés -->
    <div class="section-title" style="margin-top: 8px;">2. INVENTAIRE DU MATÉRIEL & ÉQUIPEMENTS ASSIGNÉS</div>
    <table class="equipment-table">
      <thead>
        <tr>
          <th style="width: 22%;">Composant</th>
          <th style="width: 42%;">Désignation, Marque & Modèle</th>
          <th style="width: 24%;">N° de Série (S/N) / Hostname</th>
          <th style="width: 12%; text-align: center;">État</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="comp-cell">
            <strong>Ordinateur / UC</strong>
            <div class="comp-sub">${ws.type || 'Poste Fixe'}</div>
          </td>
          <td>
            <div class="comp-bold">${ws.pcName || 'Dell OptiPlex'}</div>
            <div class="specs-text">${ws.pcSpecs || 'Intel Core i5 - 16 GB RAM - SSD 500 GB'}</div>
          </td>
          <td class="font-mono">
            <strong>S/N :</strong> ${ws.pcSerial || 'N/A'}
          </td>
          <td class="state-cell">
            <span class="badge">CONFORME</span>
          </td>
        </tr>
        <tr>
          <td class="comp-cell">
            <strong>Écran / Moniteur</strong>
            <div class="comp-sub">Affichage principal</div>
          </td>
          <td>
            <div class="comp-bold">${ws.monitorModel || 'Écran Dell Professional 22"'}</div>
            <div class="specs-text">Écran haute résolution avec pied réglable</div>
          </td>
          <td class="font-mono">
            <strong>S/N :</strong> ${ws.monitorSerial || 'N/A'}
          </td>
          <td class="state-cell">
            <span class="badge">CONFORME</span>
          </td>
        </tr>
        <tr>
          <td class="comp-cell">
            <strong>Clavier</strong>
            <div class="comp-sub">Périphérique de saisie</div>
          </td>
          <td>
            <div class="comp-bold">${ws.keyboard || 'Clavier Dell Standard'}</div>
            <div class="specs-text">Format : ${ws.keyboardDetails || 'Alpha-numérique USB'}</div>
          </td>
          <td class="font-mono text-muted">
            Rattaché au poste ${ws.pcName || ''}
          </td>
          <td class="state-cell">
            <span class="badge">CONFORME</span>
          </td>
        </tr>
        <tr>
          <td class="comp-cell">
            <strong>Souris</strong>
            <div class="comp-sub">Dispositif de pointage</div>
          </td>
          <td>
            <div class="comp-bold">${ws.mouse || 'Souris Optique Dell'}</div>
            <div class="specs-text">Format : ${ws.mouseDetails || 'Souris optique filaire'}</div>
          </td>
          <td class="font-mono text-muted">
            Rattachée au poste ${ws.pcName || ''}
          </td>
          <td class="state-cell">
            <span class="badge">CONFORME</span>
          </td>
        </tr>
        <tr>
          <td class="comp-cell">
            <strong>Connectique & Câbles</strong>
            <div class="comp-sub">Alimentation & Vidéo</div>
          </td>
          <td>
            <div class="comp-bold">Lot Câblage & Alimentation</div>
            <div class="specs-text">Cordon secteur tripolaire + Câble HDMI/DP</div>
          </td>
          <td class="font-mono text-muted">
            Lot certifié standard
          </td>
          <td class="state-cell">
            <span class="badge">CONFORME</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Section 3 : Engagement Légal -->
    <div class="legal-box">
      <div class="legal-box-title">3. ENGAGEMENT FORMEL & DÉCHARGE DE RESPONSABILITÉ</div>
      <div class="legal-box-text">
        Le collaborateur soussigné certifie expressément avoir reçu en main propre ce jour la totalité des équipements, périphériques et accessoires mentionnés ci-dessus, configurés et reconnus en bon état de fonctionnement. Il s'engage à en assurer la garde vigilante, à les utiliser exclusivement dans le cadre de ses missions professionnelles conformément à la charte informatique et à la Politique de Sécurité des Systèmes d'Information (PSSI) de Lebrun S.A. En cas de départ de l'entreprise, mutation, fin de contrat ou sur simple demande de la DSI ou de la Direction Générale, le matériel devra être immédiatement restitué dans son état d'origine.
      </div>
    </div>

    <!-- Section 4 : Signatures & Sceau Physique (Sans faux sceau) -->
    <div class="section-title" style="margin-top: 8px;">4. VISAS, SIGNATURES & VALIDATION OFFICIELLE</div>
    <div class="signatures-grid">
      <!-- Cadre Salarié -->
      <div class="sig-box">
        <div class="sig-header">LE COLLABORATEUR / BÉNÉFICIAIRE</div>
        <div class="sig-name">M./Mme ${emp.fullName}</div>
        <div class="sig-mention">Mention manuscrite obligatoire : <em>« Lu et approuvé, matériel reçu conforme »</em></div>
        <div class="sig-date">Date : ______ / ______ / 2026</div>
        <div class="sig-space">
          <span class="sig-placeholder">Signature manuscrite du collaborateur :</span>
        </div>
      </div>

      <!-- Cadre DSI avec espace réservé pour le vrai sceau physique -->
      <div class="sig-box">
        <div class="sig-header">POUR LA DIRECTION DES SYSTÈMES D'INFORMATION (DSI)</div>
        <div class="sig-name">Direction Informatique / Lebrun S.A.</div>
        <div class="sig-mention">Mention : <em>« Matériel audité, configuré et remis conforme »</em></div>
        <div class="sig-date">Date : ${today}</div>
        <div class="dsi-sig-row">
          <div class="sig-space-dsi">
            <span class="sig-placeholder">Signature & Visa DSI :</span>
          </div>
          <!-- Emplacement propre pour apposition du vrai sceau physique de l'entreprise -->
          <div class="physical-stamp-zone">
            <div class="stamp-zone-header">CADRE RÉSERVÉ AU SCEAU OFFICIEL</div>
            <div class="stamp-zone-desc">(Apposition du tampon physique)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bas de page officiel -->
    <div class="doc-footer">
      <span>Lebrun S.A. • Port-au-Prince, Haïti • Delmas 52 / Pétion-Ville</span>
      <span>Fiche officielle d'affectation individuelle IT • Exemplaire Original • Page 1 / 1</span>
      <span>Système Centralisé de Gestion IT</span>
    </div>
  </div>
  `;
}

export function getPrintCSS(): string {
  return `
    @page {
      size: A4 portrait;
      margin: 6mm 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #000000;
      background: #ffffff;
      font-size: 9.5px;
      line-height: 1.3;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet-container {
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
      padding: 6px 10px;
      background: #ffffff;
      page-break-after: always;
      box-sizing: border-box;
    }
    .sheet-container:last-child {
      page-break-after: auto;
    }

    /* En-tête */
    .header-logos-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 6px;
      border-bottom: 1.5px solid #000000;
      margin-bottom: 6px;
    }
    .logo-box-left, .logo-box-right {
      display: flex;
      align-items: center;
    }
    .header-center-info {
      text-align: center;
      flex: 1;
      padding: 0 10px;
    }
    .header-org-title {
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #000000;
      text-transform: uppercase;
    }
    .header-org-sub {
      font-size: 7.5px;
      color: #4b5563;
      margin-top: 1px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    img.logo-left, img.logo-right {
      height: 44px;
      max-width: 150px;
      object-fit: contain;
      filter: grayscale(100%);
      -webkit-filter: grayscale(100%);
    }

    /* Titre */
    .doc-title-block {
      text-align: center;
      margin-bottom: 6px;
    }
    .doc-main-title {
      font-size: 13px;
      font-weight: 900;
      color: #000000;
      letter-spacing: 0.5px;
      margin: 0 0 1px 0;
      text-transform: uppercase;
    }
    .doc-sub-title {
      font-size: 8.5px;
      color: #374151;
      font-style: italic;
    }
    .doc-meta-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-top: 4px;
      padding: 2.5px 10px;
      background: #f3f4f6;
      border: 1px solid #9ca3af;
      border-radius: 3px;
      font-size: 8.5px;
      color: #111827;
    }
    .meta-item {
      display: inline-block;
    }
    .meta-sep {
      color: #9ca3af;
    }

    /* Titres sections */
    .section-title {
      font-size: 9px;
      font-weight: 800;
      color: #ffffff;
      background: #111827;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      padding: 2.5px 6px;
      margin-bottom: 3px;
    }

    /* Tableaux */
    .data-table, .equipment-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      margin-bottom: 3px;
    }
    .data-table td {
      border: 1px solid #cbd5e1;
      padding: 3px 6px;
    }
    .label-cell {
      background: #f8fafc;
      color: #374151;
      font-weight: 600;
    }
    .value-cell {
      color: #000000;
    }

    /* Tableau équipements */
    .equipment-table th {
      background: #374151;
      color: #ffffff;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      padding: 3.5px 6px;
      text-align: left;
      border: 1px solid #374151;
    }
    .equipment-table td {
      border: 1px solid #cbd5e1;
      padding: 3px 6px;
      vertical-align: middle;
    }
    .equipment-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    .comp-cell {
      font-size: 9px;
    }
    .comp-sub {
      font-size: 7.5px;
      color: #64748b;
    }
    .comp-bold {
      font-weight: 700;
      color: #000000;
    }
    .specs-text {
      font-size: 7.5px;
      color: #475569;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8.5px;
    }
    .text-muted {
      color: #64748b;
    }
    .state-cell {
      text-align: center;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 2px;
      font-size: 7.5px;
      font-weight: 700;
      background: #ffffff;
      color: #000000;
      border: 1px solid #475569;
      letter-spacing: 0.2px;
    }

    /* Cadre légal */
    .legal-box {
      border: 1px solid #64748b;
      background: #f8fafc;
      border-radius: 3px;
      padding: 4px 7px;
      margin-top: 5px;
    }
    .legal-box-title {
      font-size: 8px;
      font-weight: 800;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 2px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 1.5px;
    }
    .legal-box-text {
      font-size: 7.5px;
      color: #1e293b;
      line-height: 1.3;
      text-align: justify;
    }

    /* Signatures */
    .signatures-grid {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }
    .sig-box {
      flex: 1;
      border: 1px solid #64748b;
      border-radius: 3px;
      padding: 5px 7px;
      background: #ffffff;
    }
    .sig-header {
      font-size: 8px;
      font-weight: 800;
      color: #000000;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 1.5px;
      margin-bottom: 2.5px;
      letter-spacing: 0.3px;
    }
    .sig-name {
      font-size: 8.5px;
      font-weight: 700;
      color: #111827;
    }
    .sig-mention {
      font-size: 7px;
      color: #64748b;
      margin-top: 1px;
    }
    .sig-date {
      font-size: 7.5px;
      font-weight: 600;
      color: #334155;
      margin-top: 2px;
    }
    .sig-space {
      height: 42px;
      margin-top: 3px;
      border-top: 1px dashed #94a3b8;
      padding-top: 2px;
    }
    .sig-placeholder {
      font-size: 7px;
      color: #94a3b8;
      font-style: italic;
    }

    /* Zone signature DSI et Sceau physique */
    .dsi-sig-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 6px;
      margin-top: 3px;
    }
    .sig-space-dsi {
      flex: 1;
      height: 42px;
      border-top: 1px dashed #94a3b8;
      padding-top: 2px;
    }

    /* Emplacement réservé au vrai Sceau physique */
    .physical-stamp-zone {
      width: 140px;
      height: 42px;
      border: 1px dashed #475569;
      border-radius: 3px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: #fafafa;
      padding: 2px 3px;
    }
    .stamp-zone-header {
      font-size: 6.5px;
      font-weight: 800;
      color: #111827;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    .stamp-zone-desc {
      font-size: 5.5px;
      color: #64748b;
      margin-top: 1px;
    }

    /* Bas de page */
    .doc-footer {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #cbd5e1;
      padding-top: 4px;
      margin-top: 6px;
      font-size: 6.5px;
      color: #64748b;
    }

    @media print {
      body {
        margin: 0;
      }
      .sheet-container {
        padding: 0;
        margin: 0 auto;
      }
    }
  `;
}

export function getFullPrintHTML(sheetsHTML: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Fiches d'Affectation Matériel IT - Lebrun S.A.</title>
  <style>
    ${getPrintCSS()}
  </style>
</head>
<body>
  ${sheetsHTML}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;
}

export function printSingleAssignmentSheet(emp: Employee): void {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const sheetContent = generateAssignmentSheetHTML(emp, origin);
  const fullHTML = getFullPrintHTML(sheetContent);

  const printWindow = window.open('', '_blank', 'width=920,height=1100');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(fullHTML);
    printWindow.document.close();
  }
}

export function printAllAssignmentSheets(employees: Employee[]): void {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const sheets = employees.map(emp => generateAssignmentSheetHTML(emp, origin)).join('\n');
  const fullHTML = getFullPrintHTML(sheets);

  const printWindow = window.open('', '_blank', 'width=920,height=1100');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(fullHTML);
    printWindow.document.close();
  }
}
