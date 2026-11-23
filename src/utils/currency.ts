import { Asset, Currency } from '../types/finance';

/**
 * Format number to Indonesian Rupiah (IDR) with proper dot thousand separator
 * e.g., 15000000 -> "Rp 15.000.000"
 */
export function formatIDR(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format USD currency
 * e.g. 142.5 -> "$142.50"
 */
export function formatUSD(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$0.00';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Compact IDR format for small badges / charts
 * e.g. 15.000.000 -> "Rp 15,0 jt" / "Rp 1,2 M"
 */
export function formatCompactIDR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_000_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000_000).toFixed(2)} T`;
  } else if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2)} M`;
  } else if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(1)} Jt`;
  } else if (abs >= 1_000) {
    return `${sign}Rp ${(abs / 1_000).toFixed(0)} Rb`;
  }
  return `${sign}Rp ${abs.toLocaleString('id-ID')}`;
}

/**
 * Format percentage with + / - sign
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (isNaN(value) || value === null || value === undefined) return '0.00%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Convert USD to IDR
 */
export function convertUSDToIDR(usdAmount: number, usdToIdrRate: number): number {
  return usdAmount * usdToIdrRate;
}

/**
 * Calculate Asset Current Value in IDR
 */
export function getAssetCurrentValueIDR(asset: Asset, usdToIdrRate: number): number {
  const nativeValue = asset.quantity * asset.currentPrice;
  if (asset.currency === 'USD') {
    return nativeValue * usdToIdrRate;
  }
  return nativeValue;
}

/**
 * Calculate Asset Total Cost Basis in IDR
 */
export function getAssetCostBasisIDR(asset: Asset, usdToIdrRate: number): number {
  const nativeCost = asset.quantity * asset.avgBuyPrice;
  if (asset.currency === 'USD') {
    return nativeCost * usdToIdrRate;
  }
  return nativeCost;
}

/**
 * Calculate Asset Unrealized P&L in IDR
 */
export function getAssetUnrealizedGainIDR(asset: Asset, usdToIdrRate: number): {
  gainIDR: number;
  gainPercent: number;
} {
  const cost = getAssetCostBasisIDR(asset, usdToIdrRate);
  const current = getAssetCurrentValueIDR(asset, usdToIdrRate);
  const gainIDR = current - cost;
  const gainPercent = cost > 0 ? (gainIDR / cost) * 100 : 0;
  return { gainIDR, gainPercent };
}
