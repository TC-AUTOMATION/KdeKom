import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency (EUR) with French locale
 * Safely handles undefined, null, and NaN values by converting them to 0
 * @param value The numeric value to format (can be undefined, null, or NaN)
 * @param minimumFractionDigits Minimum number of decimal places (default: 0)
 * @param maximumFractionDigits Maximum number of decimal places (default: 0)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | undefined | null,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 0
): string {
  // Handle invalid values by converting to 0
  if (value === undefined || value === null || isNaN(value)) {
    value = 0;
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
}