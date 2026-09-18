import * as XLSX from 'xlsx';

/**
 * Utilitaire d'exportation Excel Haute Définition (.xlsx)
 * - Format natif Microsoft Excel (.xlsx) OpenXML
 * - 100% insensible aux problèmes d'encodage régionaux (accents é, è, à, ô, É préservés nativement sans distorsion)
 * - Découpage en vraies colonnes Excel avec ajustement automatique de la largeur (auto-fit)
 * - Zéro séparateur de texte ambigu (pas de tabulation, ni de conflit virgule/point-virgule)
 */
export function downloadExcel(
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][],
  sheetTitle: string = 'Inventaire'
) {
  try {
    const formattedRows = rows.map(row =>
      row.map(cell => (cell === null || cell === undefined ? '' : String(cell).trim()))
    );

    const aoa = [headers, ...formattedRows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Ajustement automatique de la largeur de chaque colonne
    const colWidths = headers.map((header, colIdx) => {
      let maxLen = header.length;
      for (const r of formattedRows) {
        const val = r[colIdx] || '';
        if (val.length > maxLen) {
          maxLen = val.length;
        }
      }
      return { wch: Math.min(Math.max(maxLen + 3, 12), 65) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    const cleanSheetName = sheetTitle.replace(/[\\/*?:[\]]/g, '').slice(0, 31) || 'Inventaire';
    XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);

    // Écriture binaire OpenXML XLSX
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const cleanFilename = filename.toLowerCase().endsWith('.xlsx')
      ? filename
      : filename.toLowerCase().endsWith('.csv')
      ? filename.replace(/\.csv$/i, '.xlsx')
      : `${filename}.xlsx`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cleanFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Erreur export XLSX, fallback CSV BOM:', err);
    fallbackCSV(filename, headers, rows);
  }
}

/**
 * Fallback de sécurité CSV avec UTF-8 BOM (\uFEFF)
 */
function fallbackCSV(
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][]
) {
  const sanitizeCell = (val: string | number | undefined | null): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).trim();
    return `"${str.replace(/"/g, '""')}"`;
  };

  const csvRows = [
    headers.map(sanitizeCell).join(';'),
    ...rows.map(row => row.map(sanitizeCell).join(';'))
  ];

  const bom = '\uFEFF';
  const csvContent = bom + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const cleanFilename = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
  link.download = cleanFilename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export standard pour compatibilité descendante
 */
export function downloadExcelCSV(
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][]
) {
  downloadExcel(filename, headers, rows);
}
