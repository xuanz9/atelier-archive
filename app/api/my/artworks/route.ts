import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/admin';
import { listOwnedArtworks } from '@/lib/catalog-server';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  return NextResponse.json({ artworks: await listOwnedArtworks(user.id) });
}
