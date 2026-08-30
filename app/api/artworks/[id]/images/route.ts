import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { artworkImages, artworks } from '@/db/schema';
import { getAdminUser } from '@/lib/admin';
import { findArtwork } from '@/lib/catalog-server';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = Number((await context.params).id);
  const artwork = await findArtwork(id, true);
  if (!artwork) return NextResponse.json({ error: 'Artwork not found.' }, { status: 404 });
  const form = await request.formData();
  const file = form.get('image');
  if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Choose a JPEG, PNG, or WebP image under 10 MB.' }, { status: 400 });
  }

  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const objectKey = `artworks/${id}/${crypto.randomUUID()}.${extension}`;
  await env.FILES.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type } });
  const db = getDb();
  if (artwork.primaryImageKey) await env.FILES.delete(artwork.primaryImageKey);
  await db.delete(artworkImages).where(eq(artworkImages.artworkId, id));
  await db.insert(artworkImages).values({ artworkId: id, objectKey, altText: `${artwork.title} artwork`, width: 0, height: 0, sortOrder: 0, createdAt: new Date() });
  await db.update(artworks).set({ primaryImageKey: objectKey, externalImageUrl: null, updatedAt: new Date() }).where(eq(artworks.id, id));
  return NextResponse.json({ image: `/api/artworks/${id}/image` }, { status: 201 });
}
