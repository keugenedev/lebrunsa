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
    phoneFormatted: '(+509) 2940-3001',
    address: 'Delmas 52 / Pétion-Ville, Haïti',
    // Exact Caribe Motors Colors: Deep Blue & Lime Green
    bgPrimary: '#0A2540', // Deep Caribe Royal Navy Blue
    accentColor: '#52BA23', // Caribe Signature Lime Green (from CM logo)
    footerBg: '#52BA23', // Solid lime green footer block matching reference image
    footerText: '#000000', // Crisp black text on lime green
    textColor: '#ffffff',
    lineColor: '#52BA23', // Lime green divider line
    terms: 'Ce badge est strictement personnel et demeure la propriété exclusive de Caribe Motors. En cas de perte, prière de contacter le (+509) 2940-3001.'
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
    legalName: 'Leader Foods S.A.',
    logo: '/logos/leader.png',
    fallbackLogo: '/leader.png',
    website: 'www.leaderfoods.com',
    email: 'contact@leaderfoods.com',
    phone: '29403003',
    phoneFormatted: '(+509) 2940-3003',
    address: 'Port-au-Prince, Haïti',
    // Exact Leader Foods Colors: Dark Gray & Leader Lime Green
    bgPrimary: '#26292B',
    accentColor: '#78BE20', // Leader Lime Green
    footerBg: '#78BE20',
    footerText: '#000000',
    textColor: '#ffffff',
    lineColor: '#78BE20',
    terms: 'Ce badge est strictement personnel et demeure la propriété de Leader Foods S.A. En cas de perte, contacter la Direction.'
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
  const title = emp.jobTitle || 'Collaborateur';
  const org = brand.displayName;
  const tel = emp.phone || brand.phone;
  const email = emp.email || brand.email;
  const url = `https://${brand.website}`;

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${fullName}`,
    `ORG:${org}`,
    `TITLE:${title}`,
    `TEL;TYPE=WORK,VOICE:${tel}`,
    `EMAIL;TYPE=WORK:${email}`,
    `URL:${url}`,
    `NOTE:ID ${emp.employeeId} - ${brand.displayName}`,
    'END:VCARD'
  ].join('\n');
}
