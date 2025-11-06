/**
 * Currency formatting utilities for Indonesian Rupiah (Rp)
 */

/**
 * Format number as Indonesian Rupiah with standard formatting
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "Rp 5,000,000")
 */
export function formatCurrency(
  amount: number,
  options: {
    showSymbol?: boolean;
    compact?: boolean;
    decimals?: number;
  } = {}
): string {
  const {
    showSymbol = true,
    compact = false,
    decimals = 0,
  } = options;

  // Handle edge cases
  if (!isFinite(amount) || isNaN(amount)) {
    return showSymbol ? 'Rp 0' : '0';
  }

  // Compact notation for large numbers (e.g., 5M, 1.2B)
  if (compact && Math.abs(amount) >= 1_000_000) {
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const tier = Math.floor(Math.log10(Math.abs(amount)) / 3);
    const scaled = amount / Math.pow(1000, tier);
    const formatted = scaled.toFixed(tier > 0 ? 1 : 0);
    return `${showSymbol ? 'Rp ' : ''}${formatted}${suffixes[tier]}`;
  }

  // Standard formatting with thousand separators
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return showSymbol ? `Rp ${formatted}` : formatted;
}

/**
 * Format number as plain Indonesian number (no currency symbol)
 * @param amount - The amount to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string (e.g., "5.000.000")
 */
export function formatNumber(amount: number, decimals: number = 0): string {
  if (!isFinite(amount) || isNaN(amount)) {
    return '0';
  }

  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Parse formatted currency string back to number
 * @param value - Formatted currency string (e.g., "Rp 5,000,000" or "5.000.000")
 * @returns Parsed number
 */
export function parseCurrency(value: string): number {
  if (!value || typeof value !== 'string') {
    return 0;
  }

  // Remove currency symbol, whitespace, and thousand separators
  const cleaned = value
    .replace(/Rp/gi, '')
    .replace(/\s/g, '')
    .replace(/\./g, '') // Remove dots (thousand separators)
    .replace(/,/g, '.'); // Replace comma with dot (decimal separator)

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format percentage (e.g., 0.05 -> "5%")
 * @param value - Decimal percentage value (0.05 = 5%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  if (!isFinite(value) || isNaN(value)) {
    return '0%';
  }

  const percentage = value * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Validate if a string is a valid currency format
 * @param value - String to validate
 * @returns True if valid currency format
 */
export function isValidCurrency(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // Allow: "Rp 5,000,000", "5.000.000", "5000000"
  const pattern = /^(Rp\s*)?[\d.,]+$/;
  return pattern.test(value.trim());
}

/**
 * Calculate percentage of a total
 * @param amount - The amount
 * @param total - The total
 * @returns Percentage as decimal (0.05 = 5%)
 */
export function calculatePercentage(amount: number, total: number): number {
  if (total === 0 || !isFinite(total)) {
    return 0;
  }
  return amount / total;
}

/**
 * Format currency for input fields (no symbol, thousand separators)
 * @param amount - The amount to format
 * @returns Formatted string for input (e.g., "5,000,000")
 */
export function formatCurrencyInput(amount: number): string {
  if (!isFinite(amount) || isNaN(amount)) {
    return '';
  }

  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
