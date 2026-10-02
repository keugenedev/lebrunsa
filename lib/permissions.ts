export interface UserProfile {
  name?: string;
  email?: string;
  role?: string;
  company?: string;
}

/**
 * Vérifie si l'utilisateur connecté correspond à Carl Hens (ou compte collaborateur restreint Caribe)
 */
export function isCarlHens(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  const name = (user.name || '').toLowerCase().trim();

  return (
    email === 'chjoseph@caribe-motors.com' ||
    email.includes('chjoseph') ||
    email.includes('carl-hens') ||
    email.includes('carlhens') ||
    (email.includes('carl') && email.includes('hens')) ||
    (name.includes('carl') && name.includes('hens'))
  );
}

/**
 * Autorisation de téléversement de photos d'identité (autorisé pour Carl Hens lors de l'ajout ou modification)
 */
export function canUploadPhoto(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return true;
}

/**
 * Droit de modification de collaborateur (autorisé pour Carl Hens)
 */
export function canEditPersonnel(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return true;
}

/**
 * Droit de suppression de collaborateur (strictement interdit pour Carl Hens)
 */
export function canDeletePersonnel(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  if (isCarlHens(user)) return false;
  return true;
}

/**
 * Droit de gestion de collaborateur (modification autorisée pour Carl Hens)
 */
export function canEditOrDeletePersonnel(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return true;
}

/**
 * Vérifie si l'utilisateur connecté correspond au responsable Obonprix (Mia Guerrier / Delmas 83)
 */
export function isGraciama(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  const name = (user.name || '').toLowerCase().trim();
  const company = (user.company || '').toLowerCase().trim();

  // Dominique (Roody Max Dominique Guerrier) est strictement à Delmas 52 chez Lebrun S.A.
  if (name.includes('dominique') || name.includes('roody') || email.includes('rmdguerrier')) {
    return false;
  }

  return (
    email === 'miaguerrier@obonprix83' ||
    email.startsWith('miaguerrier') ||
    email.includes('miaguerrier') ||
    email.includes('graciama') ||
    email.includes('obonprix') ||
    name.includes('miaguerrier') ||
    name.includes('mia guerrier') ||
    name.includes('graciama') ||
    name.includes('gracia') ||
    company === 'obonprix'
  );
}

/**
 * Entreprise autorisée pour l'utilisateur
 */
export function getRestrictedCompany(user: UserProfile | null | undefined): string | null {
  if (isCarlHens(user)) {
    return 'Caribe Motors';
  }
  if (isGraciama(user)) {
    return 'Obonprix';
  }
  return null;
}
