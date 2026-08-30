import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { artists, artworks } from '@/db/schema';
import { getAdminUser } from '@/lib/admin';
import { listArtworks, slugify } from '@/lib/catalog-server';
import type { ArtworkStatus } from '@/lib/catalog';

const validStatuses = new Set<ArtworkStatus>(['available', 'reserved', 'sold', 'not_for_sale']);

export async function GET(request: Request) {
  const includeUnpublished = new URL(request.url).searchParams.get('include_unpublished') === 'true';
  if (includeUnpublished && !(await getAdminUser())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ artworks: await listArtworks(includeUnpublished) });
}

export async function POST(request: Request) {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const input = await request.json() as Record<string, unknown>;
  const title = String(input.title || '').trim();
  const artistName = String(input.artist || '').trim();
  const medium = String(input.medium || '').trim();
  const year = Number(input.year);
  if (!title || !artistName || !medium || !Number.isInteger(year) || year < 1000 || year > 2100) {
    return NextResponse.json({ error: 'Title, artist, medium, and a valid year are required.' }, { status: 400 });
  }

  const status = String(input.status || 'available') as ArtworkStatus;
  if (!validStatuses.has(status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });

  const db = getDb();
  const artistSlug = slugify(artistName);
  let artist = (await db.select().from(artists).where(eq(artists.slug, artistSlug)).limit(1))[0];
  if (!artist) {
    [artist] = await db.insert(artists).values({
      name: artistName,
      slug: artistSlug,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
  }

  const uniquePart = crypto.randomUUID().slice(0, 8);
  const [created] = await db.insert(artworks).values({
    accessionNumber: `AA-${Date.now().toString().slice(-6)}-${uniquePart.slice(0, 2).toUpperCase()}`,
    slug: `${slugify(title)}-${uniquePart}`,
    artistId: artist.id,
    title,
    year,
    medium,
    widthIn: nullableNumber(input.widthIn),
    heightIn: nullableNumber(input.heightIn),
    depthIn: nullableNumber(input.depthIn),
    description: String(input.description || '').trim() || null,
    provenance: String(input.provenance || '').trim() || null,
    priceCents: input.price == null || input.price === '' ? null : Math.max(0, Math.round(Number(input.price) * 100)),
    currency: 'USD',
    status,
    published: input.published !== false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return NextResponse.json({ artwork: created }, { status: 201 });
}

function nullableNumber(value: unknown) {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}
