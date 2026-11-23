export const ACCENT_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Gold/Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Coral/Red
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#9CA3AF', // Slate
];

export function getPriorityBadgeColor(priority: 'low' | 'medium' | 'high'): {
  bg: string;
  text: string;
  border: string;
} {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
      };
    case 'medium':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
      };
    case 'low':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
      };
    default:
      return {
        bg: 'bg-gray-500/10',
        text: 'text-gray-400',
        border: 'border-gray-500/30',
      };
  }
}

export function getAssetClassColor(assetClass: string): string {
  switch (assetClass) {
    case 'gold':
      return '#F59E0B'; // Gold
    case 'idx_stock':
      return '#3B82F6'; // Blue
    case 'us_stock':
      return '#8B5CF6'; // Purple
    case 'crypto':
      return '#10B981'; // Emerald
    case 'custom':
      return '#06B6D4'; // Cyan
    default:
      return '#9CA3AF';
  }
}

export function getAssetClassLabel(assetClass: string): string {
  switch (assetClass) {
    case 'gold':
      return 'Gold (Logam Mulia)';
    case 'idx_stock':
      return 'IDX Stock (Saham Indo)';
    case 'us_stock':
      return 'Global / US Equities';
    case 'crypto':
      return 'Digital Assets / Crypto';
    case 'custom':
      return 'Real Estate & Alternative';
    default:
      return assetClass;
  }
}
