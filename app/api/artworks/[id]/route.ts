import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { env } from 'cloudflare:workers';
import { getDb } from '@/db';
import { artists, artworkImages, artworks } from '@/db/schema';
import { getAuthenticatedUser, isAdminUser } from '@/lib/admin';
import { findArtwork, slugify } from '@/lib/catalog-server';
import type { ArtworkStatus } from '@/lib/catalog';

const validStatuses = new Set<ArtworkStatus>(['available', 'reserved', 'sold', 'not_for_sale']);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const id = Number((await context.params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid artwork.' }, { status: 400 });
  const artwork = await findArtwork(id, true);
  const admin = isAdminUser(user);
  if (!artwork || (!admin && artwork.ownerUserId !== user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const input = await request.json() as Record<string, unknown>;
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (admin && typeof input.status === 'string' && validStatuses.has(input.status as ArtworkStatus)) update.status = input.status;
  if (admin && typeof input.published === 'boolean') update.published = input.published;
  if (admin && ['approved', 'pending', 'rejected'].includes(String(input.submissionStatus))) update.submissionStatus = input.submissionStatus;
  if ('title' in input) {
    const title = String(input.title || '').trim();
    if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    update.title = title;
  }
  if ('medium' in input) {
    const medium = String(input.medium || '').trim();
    if (!medium) return NextResponse.json({ error: 'Medium is required.' }, { status: 400 });
    update.medium = medium;
  }
  if ('year' in input) {
    const year = Number(input.year);
    if (!Number.isInteger(year) || year < 1000 || year > 2100) return NextResponse.json({ error: 'Enter a valid four-digit year.' }, { status: 400 });
    update.year = year;
  }
  if ('price' in input) update.priceCents = nullableMoney(input.price);
  if ('widthIn' in input) update.widthIn = nullableMeasurement(input.widthIn);
  if ('heightIn' in input) update.heightIn = nullableMeasurement(input.heightIn);
  if ('depthIn' in input) update.depthIn = nullableMeasurement(input.depthIn);
  if ('description' in input) update.description = String(input.description || '').trim() || null;
  if ('provenance' in input) update.provenance = String(input.provenance || '').trim() || null;

  const db = getDb();
  if ('artist' in input) {
    const artistName = String(input.artist || '').trim();
    if (!artistName) return NextResponse.json({ error: 'Artist is required.' }, { status: 400 });
    const artistSlug = slugify(artistName);
    let artist = (await db.select().from(artists).where(eq(artists.slug, artistSlug)).limit(1))[0];
    if (!artist) {
      [artist] = await db.insert(artists).values({ name: artistName, slug: artistSlug, createdAt: new Date(), updatedAt: new Date() }).returning();
    }
    update.artistId = artist.id;
  }

  await db.update(artworks).set(update).where(eq(artworks.id, id));
  return NextResponse.json({ ok: true });
}

function nullableMoney(value: unknown) {
  if (value === '' || value == null) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

function nullableMeasurement(value: unknown) {
  if (value === '' || value == null) return null;
  const measurement = Number(value);
  return Number.isFinite(measurement) && measurement >= 0 ? measurement : null;
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const id = Number((await context.params).id);
  const artwork = await findArtwork(id, true);
  if (!artwork || (!isAdminUser(user) && artwork.ownerUserId !== user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  const images = await db.select().from(artworkImages).where(eq(artworkImages.artworkId, id));
  await Promise.all(images.map((image) => env.FILES.delete(image.objectKey)));
  await db.delete(artworks).where(eq(artworks.id, id));
  return NextResponse.json({ ok: true });
}
