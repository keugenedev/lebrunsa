// Alphabet sans caractères ambigus (ni 0/O, ni 1/I/L)
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Préfixe d'entreprise du code : LEB, AUT, CAR, LFD, TRZ (LEB par défaut, pour Lebrun). */
export function phoneCompanyCode(company?: string): string {
  const c = (company || '').toLowerCase();
  if (c.includes('auto')) return 'AUT';
  if (c.includes('caribe')) return 'CAR';
  if (c.includes('leader')) return 'LFD';
  if (c.includes('tire')) return 'TRZ';
  return 'LEB';
}

/** Partie aléatoire d'un code existant (gère aussi l'ancien format TEL-XXXXXX). */
const codeSuffix = (code: string) => (code.includes('-TEL-') ? code.split('-TEL-')[1] : code.replace(/^TEL-/, ''));

/**
 * Code complet : LEB en premier, toujours. Pour Lebrun : LEB-TEL-K7M2QX.
 * Pour une autre entreprise, son code suit LEB : LEB-CAR-TEL-4T9XZ2, LEB-AUT-TEL-…
 */
export const buildPhoneCode = (company: string | undefined, suffix: string) => {
  const co = phoneCompanyCode(company);
  return co === 'LEB' ? `LEB-TEL-${suffix}` : `LEB-${co}-TEL-${suffix}`;
};

/**
 * Partie aléatoire (6 lettres et chiffres), unique parmi les codes `existing`.
 * Elle est générée automatiquement et n'est jamais saisie à la main.
 */
export function generatePhoneSuffix(existing: Iterable<string> = []): string {
  const used = new Set(Array.from(existing, codeSuffix));
  for (let attempt = 0; attempt < 50; attempt++) {
    const bytes = new Uint32Array(6);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
    else bytes.forEach((_, i) => (bytes[i] = Math.floor(Math.random() * 0xffffffff)));
    const suffix = Array.from(bytes, b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
    if (!used.has(suffix)) return suffix;
  }
  return Date.now().toString(36).toUpperCase().slice(-6);
}

/** Nouveau code complet pour une entreprise, unique parmi `existing`. */
export const generatePhoneCode = (company: string | undefined, existing: Iterable<string> = []) =>
  buildPhoneCode(company, generatePhoneSuffix(existing));
