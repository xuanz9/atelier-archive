import { NextResponse } from 'next/server';
import { env } from 'cloudflare:workers';
import { findArtwork } from '@/lib/catalog-server';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id);
  const artwork = await findArtwork(id);
  if (!artwork?.primaryImageKey) return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
  const object = await env.FILES.get(artwork.primaryImageKey);
  if (!object) return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=86400');
  return new Response(object.body, { headers });
}
