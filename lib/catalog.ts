export type ArtworkStatus = 'available' | 'reserved' | 'sold' | 'not_for_sale';

export type ArtworkView = {
  id: number;
  accessionNumber: string;
  slug: string;
  title: string;
  artist: string;
  year: number;
  medium: string;
  widthIn: number | null;
  heightIn: number | null;
  depthIn: number | null;
  dimensions: string;
  description: string;
  provenance: string;
  priceCents: number | null;
  currency: string;
  price: string;
  status: ArtworkStatus;
  statusLabel: string;
  image: string | null;
  published: boolean;
};

export const statusLabels: Record<ArtworkStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
  not_for_sale: 'Not for sale',
};

export function formatDimensions(width: number | null, height: number | null, depth: number | null) {
  if (width == null || height == null) return 'Dimensions on request';
  return `${width} × ${height}${depth == null ? '' : ` × ${depth}`} in`;
}

export function formatPrice(priceCents: number | null, currency: string, status: ArtworkStatus) {
  if (status === 'sold') return 'Sold';
  if (priceCents == null) return 'Price on request';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(priceCents / 100);
}
