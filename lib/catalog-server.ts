import { and, asc, desc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { artists, artworks, inquiries } from '@/db/schema';
import { formatDimensions, formatPrice, statusLabels, type ArtworkStatus, type ArtworkView } from '@/lib/catalog';

export async function listArtworks(includeUnpublished = false): Promise<ArtworkView[]> {
  const db = getDb();
  const rows = await db
    .select({ artwork: artworks, artistName: artists.name })
    .from(artworks)
    .innerJoin(artists, eq(artworks.artistId, artists.id))
    .where(includeUnpublished ? undefined : eq(artworks.published, true))
    .orderBy(desc(artworks.year), asc(artworks.id));

  return rows.map(({ artwork, artistName }) => serializeArtwork(artwork, artistName));
}

export async function listOwnedArtworks(userId: string): Promise<ArtworkView[]> {
  const rows = await getDb()
    .select({ artwork: artworks, artistName: artists.name })
    .from(artworks)
    .innerJoin(artists, eq(artworks.artistId, artists.id))
    .where(eq(artworks.ownerUserId, userId))
    .orderBy(desc(artworks.createdAt));
  return rows.map(({ artwork, artistName }) => serializeArtwork(artwork, artistName));
}

function serializeArtwork(artwork: typeof artworks.$inferSelect, artistName: string): ArtworkView {
  return {
    id: artwork.id,
    accessionNumber: artwork.accessionNumber,
    slug: artwork.slug,
    title: artwork.title,
    artist: artistName,
    year: artwork.year,
    medium: artwork.medium,
    widthIn: artwork.widthIn,
    heightIn: artwork.heightIn,
    depthIn: artwork.depthIn,
    dimensions: formatDimensions(artwork.widthIn, artwork.heightIn, artwork.depthIn),
    description: artwork.description || '',
    provenance: artwork.provenance || '',
    priceCents: artwork.priceCents,
    currency: artwork.currency,
    price: formatPrice(artwork.priceCents, artwork.currency, artwork.status as ArtworkStatus),
    status: artwork.status as ArtworkStatus,
    statusLabel: statusLabels[artwork.status as ArtworkStatus],
    image: artwork.primaryImageKey ? `/api/artworks/${artwork.id}/image` : artwork.externalImageUrl,
    ownerUserId: artwork.ownerUserId,
    submissionStatus: artwork.submissionStatus,
    published: artwork.published,
  };
}

export async function findArtwork(id: number, includeUnpublished = false) {
  const rows = await getDb()
    .select()
    .from(artworks)
    .where(includeUnpublished ? eq(artworks.id, id) : and(eq(artworks.id, id), eq(artworks.published, true)))
    .limit(1);
  return rows[0] || null;
}

export async function listInquiries() {
  return getDb()
    .select({ inquiry: inquiries, artworkTitle: artworks.title })
    .from(inquiries)
    .innerJoin(artworks, eq(inquiries.artworkId, artworks.id))
    .orderBy(desc(inquiries.createdAt));
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled';
}
