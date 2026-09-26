/**
 * Utilitaire de formatage automatique du NIF (Numéro d'Identification Fiscale)
 * Standard officiel haïtien : 000-000-000-0 (3-3-3-1)
 *
 * Peu importe comment l'utilisateur ou la base fournit le NIF (chiffres bruts,
 * espaces, tirets mal placés), cette fonction le normalise toujours en 000-000-000-0.
 */
export const formatNif = (value?: string | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return trimmed;

  // Si au moins 10 chiffres : découpage strict 3-3-3-1
  if (digits.length >= 10) {
    const d = digits.slice(0, 10);
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 9)}-${d.slice(9, 10)}`;
  }

  // Formatage progressif pour les NIFs partiels ou en cours de saisie
  if (digits.length > 6) {
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 6);
    const p3 = digits.slice(6, 9);
    const p4 = digits.slice(9);
    return [p1, p2, p3, p4].filter(Boolean).join('-');
  }

  if (digits.length > 3) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return digits;
};
