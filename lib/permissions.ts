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
 * Seul l'administrateur principal peut téléverser des photos d'identité
 */
export function canUploadPhoto(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  if (isCarlHens(user)) return false;
  return true;
}

/**
 * Droit de modification ou suppression de collaborateur (interdit pour Carl Hens, qui ne peut qu'ajouter)
 */
export function canEditOrDeletePersonnel(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  if (isCarlHens(user)) return false;
  return true;
}

/**
 * Entreprise autorisée pour l'utilisateur
 */
export function getRestrictedCompany(user: UserProfile | null | undefined): string | null {
  if (isCarlHens(user)) {
    return 'Caribe Motors';
  }
  return null;
}
