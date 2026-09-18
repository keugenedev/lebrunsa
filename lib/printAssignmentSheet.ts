import { Employee } from '@/types/inventory';

export function getCompanyLogo(company?: string): string {
  const c = (company || '').toLowerCase();
  if (c.includes('caribe')) return '/caribe motors.png';
  if (c.includes('autobiz')) return '/Autobiz.png';
  if (c.includes('leader')) return '/leader.png';
  if (c.includes('tirezone')) return '/Tirezone.png';
  return '/Lebrunog.png';
}

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
    monitorModel: 'Dell 22"',
    monitorSerial: 'N/A',
    monitorObs: 'Good',
    keyboard: 'Clavier Dell Câble',
    keyboardDetails: 'Alpha-numérique',
    keyboardObs: 'Good',
    mouse: 'Dell',
    mouseDetails: 'Souris Bureau (Câble)',
    mouseObs: 'Good',
    generalState: 'Good',
    observations: 'Good'
  };

  return `
  <div class="sheet-container">
    <!-- Header with enlarged logos on Left and Right ONLY - NOTHING in between -->
    <div class="header-logos-row">
      <div class="logo-box-left">
        <img src="${leftLogo}" class="logo-left" alt="Lebrun S.A." />
      </div>
      <div class="logo-box-right">
        <img src="${rightLogo}" class="logo-right" alt="${emp.company || 'Filiale'}" />
      </div>
    </div>

    <!-- Official Document Title Block (Clean Corporate Heading) -->
    <div class="doc-title-block">
      <div class="doc-company-sup">GROUPE LEBRUN S.A. • DIRECTION DES SYSTÈMES D'INFORMATION (DSI)</div>
      <h1 class="doc-main-title">FICHE D'AFFECTATION DE MATÉRIEL INFORMATIQUE</h1>
      <div class="doc-sub-title">Procès-Verbal Officiel de Mise à Disposition & Décharge de Responsabilité</div>
      <div class="doc-meta-bar">
        <span><strong>RÉFÉRENCE :</strong> ${docRef}</span>
        <span class="meta-sep">•</span>
        <span><strong>DATE D'ÉMISSION :</strong> ${today}</span>
        <span class="meta-sep">•</span>
        <span><strong>SITE :</strong> ${emp.site || emp.location || 'Delmas 52'}</span>
      </div>
    </div>

    <!-- Section 1: Identification du Collaborateur (Première section) -->
    <div class="section-title">1. IDENTIFICATION DU BÉNÉFICIAIRE (COLLABORATEUR)</div>
    <table class="data-table">
      <tr>
        <td class="label-cell" style="width: 25%;">Nom de la personne :</td>
        <td class="value-cell" style="width: 25%;"><strong>${emp.fullName}</strong></td>
        <td class="label-cell" style="width: 25%;">Matricule Salarié :</td>
        <td class="value-cell font-mono" style="width: 25%;"><strong>${emp.employeeId}</strong></td>
      </tr>
      <tr>
        <td class="label-cell">Entreprise / Filiale :</td>
        <td class="value-cell"><strong>${emp.company || 'Lebrun S.A.'}</strong></td>
        <td class="label-cell">Site / Localisation :</td>
        <td class="value-cell">${emp.site || emp.location || 'Delmas 52'}</td>
      </tr>
      <tr>
        <td class="label-cell">Fonction / Poste :</td>
        <td class="value-cell">${emp.jobTitle || 'Collaborateur'}</td>
        <td class="label-cell">Département / Service :</td>
        <td class="value-cell">${emp.department || 'Administration & Opérations'}</td>
      </tr>
      <tr>
        <td class="label-cell">Email Professionnel :</td>
        <td class="value-cell">${emp.email || 'N/A'}</td>
        <td class="label-cell">Téléphone de Contact :</td>
        <td class="value-cell">${emp.phone || 'N/A'}</td>
      </tr>
      <tr>
        <td class="label-cell">Session Windows assignée :</td>
        <td class="value-cell font-mono">${emp.accounts?.windowsUsername || 'Admin'}</td>
        <td class="label-cell">Compte Applicatif (GP) :</td>
        <td class="value-cell font-mono">${emp.accounts?.appUsername || 'N/A'}</td>
      </tr>
    </table>

    <!-- Section 2: Équipements Assignés avec Détails Complets (PC, Écran, Clavier, Souris) -->
    <div class="section-title" style="margin-top: 14px;">2. ÉQUIPEMENTS ASSIGNÉS & DÉTAILS COMPLETS DU MATÉRIEL</div>
    <table class="equipment-table">
      <thead>
        <tr>
          <th style="width: 22%;">Composant / Matériel</th>
          <th style="width: 36%;">Désignation, Marque & Modèle</th>
          <th style="width: 24%;">N° de Série (S/N) / Hostname</th>
          <th style="width: 18%;">État & Observations</th>
        </tr>
      </thead>
      <tbody>
        <!-- Unité Centrale / PC -->
        <tr>
          <td class="comp-cell">
            <strong>Ordinateur / UC</strong>
            <div class="comp-sub">${ws.type || 'Desktop'}</div>
          </td>
          <td>
            <div class="comp-bold">${ws.pcName || 'Workstation Dell'}</div>
            <div class="specs-text">${ws.pcSpecs || 'Conforme aux standards informatiques Groupe Lebrun S.A.'}</div>
          </td>
          <td class="font-mono">
            <strong>S/N :</strong> ${ws.pcSerial || 'N/A'}
          </td>
          <td class="state-cell">
            <span class="badge badge-ok">${ws.generalState || 'Good / Conforme'}</span>
          </td>
        </tr>

        <!-- Écran / Moniteur -->
        <tr>
          <td class="comp-cell">
            <strong>Écran / Moniteur</strong>
            <div class="comp-sub">Affichage principal</div>
          </td>
          <td>
            <div class="comp-bold">${ws.monitorModel || 'Dell Professional'}</div>
            <div class="specs-text">Écran professionnel haute définition avec pied réglable</div>
          </td>
          <td class="font-mono">
            <strong>S/N :</strong> ${ws.monitorSerial || 'N/A'}
          </td>
          <td class="state-cell">
            <span class="badge ${ws.monitorObs?.toLowerCase().includes('deffect') ? 'badge-warn' : 'badge-ok'}">
              ${ws.monitorObs || 'Good'}
            </span>
          </td>
        </tr>

        <!-- Clavier (Détails complets) -->
        <tr>
          <td class="comp-cell">
            <strong>Clavier</strong>
            <div class="comp-sub">Périphérique de saisie</div>
          </td>
          <td>
            <div class="comp-bold">${ws.keyboard || 'Clavier Dell'}</div>
            <div class="specs-text">Type : ${ws.keyboardDetails || 'Clavier Alpha-numérique'}</div>
          </td>
          <td class="font-mono">
            Rattaché au poste ${ws.pcName || ''}
          </td>
          <td class="state-cell">
            <span class="badge ${ws.keyboardObs?.toLowerCase().includes('deffect') ? 'badge-warn' : 'badge-ok'}">
              ${ws.keyboardObs || 'Good / Fonctionnel'}
            </span>
          </td>
        </tr>

        <!-- Souris (Détails complets) -->
        <tr>
          <td class="comp-cell">
            <strong>Souris</strong>
            <div class="comp-sub">Dispositif de pointage</div>
          </td>
          <td>
            <div class="comp-bold">${ws.mouse || 'Souris Optique Dell'}</div>
            <div class="specs-text">Type : ${ws.mouseDetails || 'Souris Bureau Ergonomique'}</div>
          </td>
          <td class="font-mono">
            Rattachée au poste ${ws.pcName || ''}
          </td>
          <td class="state-cell">
            <span class="badge ${ws.mouseObs?.toLowerCase().includes('deffect') ? 'badge-warn' : 'badge-ok'}">
              ${ws.mouseObs || 'Good / Fonctionnel'}
            </span>
          </td>
        </tr>

        <!-- Accessoires & Câblage -->
        <tr>
          <td class="comp-cell">
            <strong>Câblage & Alimentation</strong>
            <div class="comp-sub">Connectique officielle</div>
          </td>
          <td>
            <div>Câble secteur d'alimentation tripolaire 110V/220V</div>
            <div class="specs-text">Câble vidéo HDMI / DisplayPort haute vitesse</div>
          </td>
          <td class="font-mono">
            Kit complet certifié
          </td>
          <td class="state-cell">
            <span class="badge badge-ok">Complet & Vérifié</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Section 3: Engagement Légal & Décharge de Responsabilité (AUCUN PRIX) -->
    <div class="legal-box">
      <div class="legal-box-title">3. ENGAGEMENT FORMEL & DÉCHARGE DE RESPONSABILITÉ</div>
      <div class="legal-box-text">
        Le collaborateur soussigné déclare expressément avoir reçu en main propre ce jour la totalité des équipements et accessoires informatiques mentionnés ci-dessus, configurés et reconnus en parfait état d&apos;usage et de fonctionnement. Il s&apos;engage à en assurer la garde vigilante, à les utiliser exclusivement dans l&apos;exercice strict de ses fonctions professionnelles et en conformité intégrale avec la Politique de Sécurité des Systèmes d&apos;Information (PSSI) du Groupe Lebrun S.A. En cas de départ, résiliation du contrat de travail, réaffectation ou sur simple demande de la Direction Générale ou de la DSI, l&apos;ensemble du matériel devra être restitué immédiatement dans son état d&apos;origine.
      </div>
    </div>

    <!-- Section 4: Signatures & Visas Officiels -->
    <div class="section-title" style="margin-top: 14px;">4. VISAS, ATTESTATIONS & SIGNATURES OBLIGATOIRES</div>
    <div class="signatures-grid">
      <!-- Cadre Salarié -->
      <div class="sig-box">
        <div class="sig-header">LE BÉNÉFICIAIRE / COLLABORATEUR</div>
        <div class="sig-name">M./Mme ${emp.fullName}</div>
        <div class="sig-mention">Mention manuscrite obligatoire : <em>« Lu et approuvé, matériel reçu conforme »</em></div>
        <div class="sig-date">Date : ______ / ______ / 2026</div>
        <div class="sig-space">
          <span class="sig-placeholder">Signature du salarié :</span>
        </div>
      </div>

      <!-- Cadre Direction IT -->
      <div class="sig-box">
        <div class="sig-header">POUR LA DIRECTION INFORMATIQUE (DSI)</div>
        <div class="sig-name">M. Kensly Eugene / Direction IT Lebrun S.A.</div>
        <div class="sig-mention">Mention : <em>« Matériel vérifié, audité et remis conforme »</em></div>
        <div class="sig-date">Date : ${today}</div>
        <div class="sig-space" style="position: relative;">
          <span class="sig-placeholder">Signature & Visa DSI :</span>
          <!-- Official stamp -->
          <div class="stamp-box">
            <div style="font-size: 8px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px;">GROUPE LEBRUN S.A.</div>
            <div style="font-size: 7px; color: #475569; margin: 1px 0;">DIRECTION IT & SYSTÈMES</div>
            <div style="font-size: 8px; font-weight: 800; color: #047857; letter-spacing: 1px;">VISA CONFORME</div>
            <div style="font-size: 6px; color: #64748b;">SERVICE PARC & MATÉRIEL</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="doc-footer">
      <span>Groupe Lebrun S.A. • Port-au-Prince, Haïti • Delmas 52 / Pétion-Ville</span>
      <span>Fiche officielle d'affectation individuelle IT • Page 1 / 1</span>
      <span>Système Centralisé de Gestion IT - Document Certifié</span>
    </div>
  </div>
  `;
}

export function getFullPrintHTML(sheetsHTML: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Fiches d'Affectation Matériel IT - Groupe Lebrun S.A.</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet-container {
      width: 100%;
      max-width: 790px;
      margin: 0 auto;
      padding: 14px 18px;
      background: #ffffff;
      page-break-after: always;
      position: relative;
    }
    .sheet-container:last-child {
      page-break-after: auto;
    }

    /* Header with enlarged logos ONLY on left and right, NOTHING between them */
    .header-logos-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 2px solid #0f172a;
      margin-bottom: 14px;
    }
    .logo-box-left {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    .logo-box-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    img.logo-left {
      height: 70px;
      max-width: 220px;
      object-fit: contain;
    }
    img.logo-right {
      height: 70px;
      max-width: 220px;
      object-fit: contain;
    }

    /* Official Document Title Block */
    .doc-title-block {
      text-align: center;
      margin-bottom: 14px;
    }
    .doc-company-sup {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #475569;
      text-transform: uppercase;
    }
    .doc-main-title {
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.5px;
      margin: 3px 0 2px 0;
      text-transform: uppercase;
    }
    .doc-sub-title {
      font-size: 9.5px;
      color: #64748b;
      font-style: italic;
    }
    .doc-meta-bar {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      padding: 3px 10px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      font-size: 9px;
      color: #334155;
    }
    .meta-sep {
      color: #94a3b8;
    }

    /* Section Titles */
    .section-title {
      font-size: 10px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      border-left: 3.5px solid #0f172a;
      padding-left: 7px;
      margin-bottom: 6px;
    }

    /* Data Tables */
    .data-table, .equipment-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-bottom: 6px;
    }
    .data-table td {
      border: 1px solid #cbd5e1;
      padding: 4.5px 8px;
    }
    .label-cell {
      background: #f8fafc;
      color: #475569;
      font-weight: 600;
    }
    .value-cell {
      color: #0f172a;
    }

    /* Equipment Table */
    .equipment-table th {
      background: #0f172a;
      color: #ffffff;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 5px 8px;
      text-align: left;
      border: 1px solid #0f172a;
    }
    .equipment-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
      vertical-align: middle;
    }
    .equipment-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    .comp-cell {
      font-size: 10px;
    }
    .comp-sub {
      font-size: 8.5px;
      color: #64748b;
    }
    .comp-bold {
      font-weight: 700;
      color: #0f172a;
    }
    .specs-text {
      font-size: 8.5px;
      color: #475569;
      margin-top: 1px;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 9.5px;
    }
    .state-cell {
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 1.5px 6px;
      border-radius: 3px;
      font-size: 8.5px;
      font-weight: 700;
    }
    .badge-ok {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }
    .badge-warn {
      background: #fffbeb;
      color: #b45309;
      border: 1px solid #fde68a;
    }

    /* Legal Box (Without price) */
    .legal-box {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 5px;
      padding: 7px 10px;
      margin-top: 10px;
    }
    .legal-box-title {
      font-size: 9.5px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
    }
    .legal-box-text {
      font-size: 8.5px;
      color: #334155;
      line-height: 1.4;
      text-align: justify;
    }

    /* Signatures Section */
    .signatures-grid {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }
    .sig-box {
      flex: 1;
      border: 1px solid #94a3b8;
      border-radius: 5px;
      padding: 7px 9px;
      background: #ffffff;
    }
    .sig-header {
      font-size: 9px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 2px;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .sig-name {
      font-size: 9.5px;
      font-weight: 700;
      color: #1e293b;
    }
    .sig-mention {
      font-size: 8px;
      color: #64748b;
      margin-top: 2px;
    }
    .sig-date {
      font-size: 8.5px;
      font-weight: 600;
      color: #475569;
      margin-top: 4px;
    }
    .sig-space {
      height: 52px;
      margin-top: 4px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 3px;
    }
    .sig-placeholder {
      font-size: 8px;
      color: #94a3b8;
      font-style: italic;
    }
    .stamp-box {
      position: absolute;
      right: 8px;
      bottom: 6px;
      border: 1.5px solid #059669;
      border-radius: 4px;
      padding: 3px 6px;
      text-align: center;
      background: rgba(240, 253, 244, 0.85);
      transform: rotate(-3deg);
    }

    /* Footer */
    .doc-footer {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #cbd5e1;
      padding-top: 6px;
      margin-top: 12px;
      font-size: 7.5px;
      color: #64748b;
    }

    /* Print Specifics */
    @media print {
      body {
        margin: 0;
      }
      .sheet-container {
        padding: 0;
        margin: 0 auto;
      }
    }
  </style>
</head>
<body>
  ${sheetsHTML}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
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
