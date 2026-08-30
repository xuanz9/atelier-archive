import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { inquiries } from '@/db/schema';
import { getAdminUser } from '@/lib/admin';
import { findArtwork, listInquiries } from '@/lib/catalog-server';

export async function GET() {
  if (!(await getAdminUser())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ inquiries: await listInquiries() });
}

export async function POST(request: Request) {
  const input = await request.json() as Record<string, unknown>;
  const artworkId = Number(input.artworkId);
  const name = String(input.name || '').trim();
  const email = String(input.email || '').trim().toLowerCase();
  const message = String(input.message || '').trim();
  if (!Number.isInteger(artworkId) || !name || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'A name, valid email, and artwork are required.' }, { status: 400 });
  }
  if (!(await findArtwork(artworkId))) return NextResponse.json({ error: 'Artwork not found.' }, { status: 404 });
  await getDb().insert(inquiries).values({ artworkId, name, email, message: message || null, status: 'new', createdAt: new Date() });
  return NextResponse.json({ ok: true }, { status: 201 });
}
