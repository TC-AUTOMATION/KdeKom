/**
 * Valide un numéro SIRET français
 * Format: 14 chiffres (SIREN 9 chiffres + NIC 5 chiffres)
 * Vérifie simplement le format (14 chiffres)
 */
export const validateSiret = (siret: string | undefined | null): boolean => {
  // Vérifier que siret est une chaîne de caractères
  if (!siret || typeof siret !== 'string') {
    return false;
  }

  // Enlever les espaces et tirets
  const cleanedSiret = siret.replace(/[\s-]/g, '');

  // Vérifier que c'est composé de 14 chiffres
  return /^\d{14}$/.test(cleanedSiret);
};

/**
 * Formate un numéro SIRET pour l'affichage
 * Exemple: 12345678901234 -> 123 456 789 01234
 */
export const formatSiret = (siret: string | undefined | null): string => {
  // Vérifier que siret est une chaîne de caractères
  if (!siret || typeof siret !== 'string') {
    return '';
  }

  const cleaned = siret.replace(/[\s-]/g, '');
  if (cleaned.length !== 14) return siret;

  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
};

/**
 * Vérifie si un client B2B a un SIRET valide
 */
export const validateClientSiret = (clientType: 'b2c' | 'b2b', siret?: string): { valid: boolean; error?: string } => {
  if (clientType === 'b2c') {
    return { valid: true };
  }

  if (!siret || typeof siret !== 'string' || siret.trim() === '') {
    return { valid: false, error: 'Le SIRET est obligatoire pour les clients professionnels (B2B)' };
  }

  if (!validateSiret(siret)) {
    return { valid: false, error: 'Le numéro SIRET n\'est pas valide' };
  }

  return { valid: true };
};
