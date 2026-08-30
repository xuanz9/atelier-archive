import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { cartItems } from '@/db/schema';
import { getAuthenticatedUser } from '@/lib/admin';
import { findArtwork, listArtworks } from '@/lib/catalog-server';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const rows = await getDb().select().from(cartItems).where(eq(cartItems.userId, user.id));
  const publicWorks = await listArtworks(false);
  const ids = new Set(rows.map((row) => row.artworkId));
  return NextResponse.json({ items: publicWorks.filter((work) => ids.has(work.id)) });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Sign in to add works to your cart.' }, { status: 401 });
  const { artworkId } = await request.json() as { artworkId?: number };
  const artwork = await findArtwork(Number(artworkId));
  if (!artwork || artwork.status === 'sold') return NextResponse.json({ error: 'This artwork is not available to add.' }, { status: 400 });
  await getDb().insert(cartItems).values({ userId: user.id, artworkId: artwork.id, createdAt: new Date() }).onConflictDoNothing();
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const artworkId = Number(new URL(request.url).searchParams.get('artworkId'));
  await getDb().delete(cartItems).where(and(eq(cartItems.userId, user.id), eq(cartItems.artworkId, artworkId)));
  return NextResponse.json({ ok: true });
}
