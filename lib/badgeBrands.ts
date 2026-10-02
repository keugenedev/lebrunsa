import { Employee } from '@/types/inventory';

export interface BrandConfig {
  id: string;
  displayName: string;
  legalName: string;
  logo: string;
  fallbackLogo: string;
  website: string;
  email: string;
  phone: string;
  phoneFormatted: string;
  address: string;
  address2?: string;
  // Exact brand colors derived directly from brand logos
  bgPrimary: string;
  accentColor: string; // Brand accent: Caribe Lime Green, Lebrun Red, etc.
  footerBg: string;
  footerText: string;
  textColor: string;
  lineColor: string;
  terms: string;
}

export const BRAND_CONFIGS: Record<string, BrandConfig> = {
  caribe: {
    id: 'caribe',
    displayName: 'Caribe Motors',
    legalName: 'Caribe Motors S.A.',
    logo: '/logos/Caribe.png',
    fallbackLogo: '/Caribe.png',
    website: 'www.caribe-motors.com',
    email: 'info@caribe-motors.com',
    phone: '29403001',
    phoneFormatted: '(509) 2940-3001 à (509) 2940-3005',
    address: '33, Blvd Toussaint Louverture, Port-au-Prince, Haïti',
    address2: '27B, Rue Rigaud, Pétion-Ville, Haïti',
    // Exact Caribe Motors Colors: Deep Blue & Lime Green
    bgPrimary: '#0A2540', // Deep Caribe Royal Navy Blue
    accentColor: '#52BA23', // Caribe Signature Lime Green (from CM logo)
    footerBg: '#52BA23', // Solid lime green footer block matching reference image
    footerText: '#000000', // Crisp black text on lime green
    textColor: '#ffffff',
    lineColor: '#52BA23', // Lime green divider line
    terms: 'Ce badge est strictement personnel et demeure la propriété exclusive de Caribe Motors. En cas de perte, merci de le rapporter à la Direction ou d\'appeler le (509) 2940-3001 à 3005.'
  },
  lebrun: {
    id: 'lebrun',
    displayName: 'Lebrun S.A.',
    legalName: 'Lebrun S.A.',
    logo: '/logos/lebrun.png',
    fallbackLogo: '/Lebrunog.png',
    website: 'www.lebrunsa.com',
    email: 'info@lebrunsa.com',
    phone: '29403000',
    phoneFormatted: '(+509) 2940-3000',
    address: 'Delmas 52, Port-au-Prince, Haïti',
    // Exact Lebrun Colors: Dark Slate & Lebrun Red
    bgPrimary: '#1E232A',
    accentColor: '#E11D24', // Lebrun Red
    footerBg: '#E11D24',
    footerText: '#ffffff',
    textColor: '#ffffff',
    lineColor: '#E11D24',
    terms: 'Ce badge est strictement personnel et demeure la propriété de Lebrun S.A. En cas de perte, merci de le rapporter à la Direction.'
  },
  autobiz: {
    id: 'autobiz',
    displayName: 'Autobiz',
    legalName: 'Autobiz S.A.',
    logo: '/logos/Autobiz.png',
    fallbackLogo: '/Autobiz.png',
    website: 'www.autobiz.ht',
    email: 'info@autobiz.ht',
    phone: '29403002',
    phoneFormatted: '(+509) 2940-3002',
    address: 'Delmas 52, Port-au-Prince, Haïti',
    // Exact Autobiz Colors: Charcoal & Autobiz Red
    bgPrimary: '#14171A',
    accentColor: '#E11D24',
    footerBg: '#E11D24',
    footerText: '#ffffff',
    textColor: '#ffffff',
    lineColor: '#E11D24',
    terms: 'Ce badge est strictement personnel et demeure la propriété d\'Autobiz S.A. En cas de perte, contacter la Direction au (+509) 2940-3002.'
  },
  leader: {
    id: 'leader',
    displayName: 'Leader Foods',
    legalName: 'Leader Foods',
    logo: '/logos/leader.png',
    fallbackLogo: '/leader.png',
    website: 'www.leaderfoods.com',
    email: 'contact@leaderfoods.com',
    phone: '31606001',
    phoneFormatted: '(509) 3160-6001 / (509) 3160-6002',
    address: '5, Rue Tertulien Guilbaud, Port-au-Prince, Haïti',
    // Exact Leader Foods Colors: Fresh Lime Green, Deep Charcoal & Card White
    bgPrimary: '#1E2328',
    accentColor: '#70BD1B', // Leader Fresh Lime Green (Logo Leaf / FOODS)
    footerBg: '#70BD1B',
    footerText: '#0F172A',
    textColor: '#ffffff',
    lineColor: '#70BD1B',
    terms: 'Ce badge est strictement personnel et demeure la propriété exclusive de Leader Foods. En cas de perte, merci de le rapporter à la Direction ou de contacter le (509) 3160-6001 / (509) 3160-6002.'
  },
  tirezone: {
    id: 'tirezone',
    displayName: 'Tirezone',
    legalName: 'Tirezone S.A.',
    logo: '/logos/tirezone.png',
    fallbackLogo: '/Tirezone.png',
    website: 'www.tirezone.ht',
    email: 'info@tirezone.ht',
    phone: '29403004',
    phoneFormatted: '(+509) 2940-3004',
    address: 'Port-au-Prince, Haïti',
    // Exact Tirezone Colors: Dark Charcoal & Tirezone Red
    bgPrimary: '#1A1D20',
    accentColor: '#E11D24',
    footerBg: '#E11D24',
    footerText: '#ffffff',
    textColor: '#ffffff',
    lineColor: '#E11D24',
    terms: 'Ce badge est strictement personnel et demeure la propriété de Tirezone. En cas de perte, contacter le (+509) 2940-3004.'
  },
  obonprix: {
    id: 'obonprix',
    displayName: 'Obonprix',
    legalName: 'Obonprix S.A.',
    logo: '/logos/obonprix.png',
    fallbackLogo: '/obonprixlogo.png',
    website: 'www.obonprix.ht',
    email: 'contact@obonprix.ht',
    phone: '29403006',
    phoneFormatted: '(+509) 2940-3006',
    address: 'Delmas 83, Port-au-Prince, Haïti',
    // Exact Obonprix Colors: ROUGE: #DA2027, JAUNE: #FFCB06, GRIS FONCÉ: #574C46, BLANC: #FFFFFF
    bgPrimary: '#574C46',
    accentColor: '#DA2027',
    footerBg: '#DA2027',
    footerText: '#FFFFFF',
    textColor: '#FFFFFF',
    lineColor: '#FFCB06',
    terms: 'Ce badge est strictement personnel et demeure la propriété exclusive d\'Obonprix. En cas de perte, merci de le rapporter à la Direction ou de contacter le service RH (Delmas 83).'
  }
};

/**
 * Résout la configuration de marque d'un collaborateur
 */
export function getBrandConfig(company?: string): BrandConfig {
  const c = (company || '').toLowerCase();
  if (c.includes('caribe')) return BRAND_CONFIGS.caribe;
  if (c.includes('autobiz')) return BRAND_CONFIGS.autobiz;
  if (c.includes('leader')) return BRAND_CONFIGS.leader;
  if (c.includes('tire') || c.includes('zone')) return BRAND_CONFIGS.tirezone;
  if (c.includes('obonprix') || c.includes('bonprix') || c.includes('obp')) return BRAND_CONFIGS.obonprix;
  if (c.includes('lebrun')) return BRAND_CONFIGS.lebrun;
  return BRAND_CONFIGS.caribe;
}

/**
 * Construit un contenu vCard standard
 */
export function buildVCardString(emp: Employee, brand: BrandConfig): string {
  const lastName = emp.lastName || '';
  const firstName = emp.firstName || '';
  const fullName = emp.fullName || `${firstName} ${lastName}`.trim();
  const org = brand.displayName;
  const tel = emp.phone || brand.phone;

  return [
    'BEGIN:VCARD',
    'VERSION:2.1',
    `FN:${fullName}`,
    `ORG:${org}`,
    `TEL:${tel}`,
    `NOTE:ID:${emp.employeeId}`,
    'END:VCARD'
  ].join('\n');
}

export type CompanyCode = 'CRB' | 'LDF' | 'TRZ' | 'ATB' | 'LBN' | 'OBP';

/**
 * Retourne le code officiel 3 lettres de l'entreprise :
 * Caribe Motors -> CRB
 * Leader Foods -> LDF
 * Tirezone -> TRZ
 * Autobiz -> ATB
 * Lebrun S.A. -> LBN
 * Obonprix -> OBP
 */
export function getCompanyCode(company?: string): CompanyCode {
  const c = (company || '').toLowerCase();
  if (c.includes('caribe')) return 'CRB';
  if (c.includes('leader')) return 'LDF';
  if (c.includes('tire') || c.includes('zone')) return 'TRZ';
  if (c.includes('autobiz') || c.includes('autobix')) return 'ATB';
  if (c.includes('obonprix') || c.includes('bonprix') || c.includes('obp')) return 'OBP';
  if (c.includes('lebrun')) return 'LBN';
  return 'LBN';
}

/**
 * Normalise un matricule collaborateur au format officiel : EMP-[CODE]-[3_CHIFFRES]
 * Ex : EMP-LEB-445 (Caribe) -> EMP-CRB-445
 * Ex : EMP-AUT-002 (Autobiz) -> EMP-ATB-002
 * Ex : EMP-LEB-900 (Leader Foods) -> EMP-LDF-900
 * Ex : EMP-LEB-831 (Tirezone) -> EMP-TRZ-831
 * Ex : EMP-LEB-001 (Lebrun) -> EMP-LBN-001
 */
export function normalizeEmployeeId(currentId: string, company?: string): string {
  const targetCode = getCompanyCode(company);
  if (!currentId) {
    const rand = Math.floor(Math.random() * 900 + 100);
    return `EMP-${targetCode}-${rand}`;
  }

  const clean = currentId.trim().toUpperCase();
  if (clean.startsWith(`EMP-${targetCode}-`) && /^EMP-[A-Z]{3}-\d{3}$/.test(clean)) {
    return clean;
  }

  const digitsMatch = clean.match(/\d+/g);
  let numStr = '001';
  if (digitsMatch && digitsMatch.length > 0) {
    const lastDigits = digitsMatch[digitsMatch.length - 1];
    numStr = lastDigits.slice(-3).padStart(3, '0');
  } else {
    numStr = String(Math.floor(Math.random() * 900 + 100));
  }

  return `EMP-${targetCode}-${numStr}`;
}

/**
 * Génère un nouvel identifiant collaborateur aléatoire à 3 chiffres
 */
export function generateEmployeeId(company?: string, existingIds?: string[]): string {
  const code = getCompanyCode(company);
  let id = '';
  let attempts = 0;
  do {
    const num = Math.floor(Math.random() * 900 + 100);
    id = `EMP-${code}-${num}`;
    attempts++;
  } while (existingIds && existingIds.includes(id) && attempts < 1000);
  return id;
}

/**
 * Normalise un identifiant d'imprimante au format officiel : PRN-[CODE]-[3_CHIFFRES]
 * Ex : PRN-CAR-014 (Caribe) -> PRN-CRB-014
 * Ex : PRN-LFD-001 (Tirezone) -> PRN-TRZ-001
 * Ex : PRN-LEB-004 (Autobiz) -> PRN-ATB-004
 * Ex : PRN-LFD-014 (Leader) -> PRN-LDF-014
 * Ex : PRN-LEB-001 (Lebrun) -> PRN-LBN-001
 */
export function normalizePrinterId(currentTag: string, company?: string): string {
  const targetCode = getCompanyCode(company);
  if (!currentTag) {
    return `PRN-${targetCode}-001`;
  }

  const clean = currentTag.trim().toUpperCase();
  if (clean.startsWith(`PRN-${targetCode}-`) && /^PRN-[A-Z]{3}-\d{3}$/.test(clean)) {
    return clean;
  }

  const digitsMatch = clean.match(/\d+/g);
  let numStr = '001';
  if (digitsMatch && digitsMatch.length > 0) {
    const lastDigits = digitsMatch[digitsMatch.length - 1];
    numStr = lastDigits.slice(-3).padStart(3, '0');
  }

  return `PRN-${targetCode}-${numStr}`;
}

/**
 * Génère un identifiant d'imprimante conforme : PRN-[CODE]-[3_CHIFFRES]
 * Ex : PRN-CRB-001, PRN-ATB-005, etc.
 */
export function generatePrinterId(company?: string, existingTags?: string[]): string {
  const code = getCompanyCode(company);
  const prefix = `PRN-${code}-`;

  if (existingTags && existingTags.length > 0) {
    const matchingNumbers = existingTags
      .filter(tag => tag && tag.toUpperCase().startsWith(prefix))
      .map(tag => {
        const match = tag.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
      });
    const maxNum = matchingNumbers.length > 0 ? Math.max(...matchingNumbers) : 0;
    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  }

  return `${prefix}001`;
}

/**
 * Génère un tag de poste informatique conforme au parc : AST-PC-[CODE][NUMERO]
 * Ex : AST-PC-LEB01, AST-PC-AUT02, AST-PC-OBP01, AST-PC-CRB01
 */
export function generateITAssetTag(company?: string, existingTags?: string[]): string {
  const code = getCompanyCode(company);
  const prefix = `AST-PC-${code}`;

  if (existingTags && existingTags.length > 0) {
    const matchingNumbers = existingTags
      .filter(tag => tag && tag.toUpperCase().startsWith(prefix))
      .map(tag => {
        const match = tag.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
      });
    const maxNum = matchingNumbers.length > 0 ? Math.max(...matchingNumbers) : 0;
    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(2, '0')}`;
  }

  return `${prefix}01`;
}

/**
 * Génère un identifiant équipement réseau conforme : NET-[CODE]-[3_CHIFFRES]
 * Ex : NET-LEB-001, NET-ATB-001, NET-OBP-001
 */
export function generateNetworkId(company?: string, existingTags?: string[]): string {
  const code = getCompanyCode(company);
  const prefix = `NET-${code}-`;

  if (existingTags && existingTags.length > 0) {
    const matchingNumbers = existingTags
      .filter(tag => tag && tag.toUpperCase().startsWith(prefix))
      .map(tag => {
        const match = tag.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
      });
    const maxNum = matchingNumbers.length > 0 ? Math.max(...matchingNumbers) : 0;
    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  }

  return `${prefix}001`;
}

/**
 * Génère un identifiant onduleur UPS conforme : UPS-[CODE]-[3_CHIFFRES]
 * Ex : UPS-LEB-001, UPS-ATB-001, UPS-OBP-001
 */
export function generateUPSId(company?: string, existingTags?: string[]): string {
  const code = getCompanyCode(company);
  const prefix = `UPS-${code}-`;

  if (existingTags && existingTags.length > 0) {
    const matchingNumbers = existingTags
      .filter(tag => tag && tag.toUpperCase().startsWith(prefix))
      .map(tag => {
        const match = tag.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
      });
    const maxNum = matchingNumbers.length > 0 ? Math.max(...matchingNumbers) : 0;
    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  }

  return `${prefix}001`;
}

