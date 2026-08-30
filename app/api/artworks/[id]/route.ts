import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { env } from 'cloudflare:workers';
import { getDb } from '@/db';
import { artworkImages, artworks } from '@/db/schema';
import { getAdminUser } from '@/lib/admin';
import type { ArtworkStatus } from '@/lib/catalog';

const validStatuses = new Set<ArtworkStatus>(['available', 'reserved', 'sold', 'not_for_sale']);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = Number((await context.params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid artwork.' }, { status: 400 });
  const input = await request.json() as Record<string, unknown>;
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof input.status === 'string' && validStatuses.has(input.status as ArtworkStatus)) update.status = input.status;
  if (typeof input.published === 'boolean') update.published = input.published;
  if (typeof input.title === 'string' && input.title.trim()) update.title = input.title.trim();
  if (typeof input.medium === 'string' && input.medium.trim()) update.medium = input.medium.trim();
  if (Number.isInteger(Number(input.year))) update.year = Number(input.year);
  if ('price' in input) update.priceCents = input.price === '' || input.price == null ? null : Math.max(0, Math.round(Number(input.price) * 100));
  await getDb().update(artworks).set(update).where(eq(artworks.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = Number((await context.params).id);
  const db = getDb();
  const images = await db.select().from(artworkImages).where(eq(artworkImages.artworkId, id));
  await Promise.all(images.map((image) => env.FILES.delete(image.objectKey)));
  await db.delete(artworks).where(eq(artworks.id, id));
  return NextResponse.json({ ok: true });
}
