'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Check, Grid2X2, ListFilter, Mail, Search, SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ArtworkView } from '@/lib/catalog';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const statuses = ['All works', 'Available', 'Reserved', 'Sold'];

export default function Home() {
  const [artworks, setArtworks] = useState<ArtworkView[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All works');
  const [selected, setSelected] = useState<ArtworkView | null>(null);
  const [inquiryState, setInquiryState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [signedIn, setSignedIn] = useState(false);
  const [cartIds, setCartIds] = useState<Set<number>>(new Set());
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    getSupabaseBrowserClient().auth.getSession().then(async ({ data }) => {
      const authenticated = Boolean(data.session);
      setSignedIn(authenticated);
      if (authenticated) {
        const response = await fetch('/api/cart');
        if (response.ok) setCartIds(new Set((await response.json() as { items: ArtworkView[] }).items.map((item) => item.id)));
      }
    });
    fetch('/api/artworks')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load the collection.');
        return response.json() as Promise<{ artworks: ArtworkView[] }>;
      })
      .then((data) => setArtworks(data.artworks))
      .catch((error: Error) => setLoadError(error.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return artworks.filter((work) => {
      const matchesStatus = status === 'All works' || work.statusLabel === status;
      const matchesQuery = !term || [work.title, work.artist, work.medium, String(work.year)].some((value) => value.toLowerCase().includes(term));
      return matchesStatus && matchesQuery;
    });
  }, [artworks, query, status]);

  const artistDirectory = useMemo(() => {
    const directory = new Map<string, { name: string; works: ArtworkView[] }>();
    artworks.forEach((work) => {
      const entry = directory.get(work.artist) || { name: work.artist, works: [] };
      entry.works.push(work);
      directory.set(work.artist, entry);
    });
    return [...directory.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [artworks]);

  function exploreArtist(name: string) {
    setStatus('All works');
    setQuery(name);
    document.querySelector('#collection')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setInquiryState('sending');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ artworkId: selected.id, name: form.get('name'), email: form.get('email'), message: form.get('message') }),
    });
    setInquiryState(response.ok ? 'sent' : 'error');
  }

  async function addToCart(work: ArtworkView) {
    if (!signedIn) { window.location.assign('/account?returnTo=%2F'); return; }
    setCartMessage('Adding…');
    const response = await fetch('/api/cart', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ artworkId: work.id }) });
    if (response.ok) {
      setCartIds((current) => new Set(current).add(work.id));
      setCartMessage('Added to your cart.');
    } else setCartMessage((await response.json() as { error?: string }).error || 'Unable to add this work.');
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/95">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 md:px-10">
          <a href="#collection" className="flex items-center gap-3" aria-label="Atelier Archive home"><span className="grid size-9 place-items-center border border-foreground text-sm font-semibold">A</span><span className="font-heading text-lg tracking-[0.16em]">ATELIER ARCHIVE</span></a>
          <nav className="hidden items-center gap-8 text-sm md:flex" aria-label="Main navigation"><a href="#collection" className="border-b border-foreground pb-1">Collection</a><a href="#artists" className="text-muted-foreground transition-colors hover:text-foreground">Artists</a><a href={signedIn ? '/dashboard' : '/account'} className="text-muted-foreground transition-colors hover:text-foreground">{signedIn ? `Dashboard${cartIds.size ? ` (${cartIds.size})` : ''}` : 'Account'}</a></nav>
          <Button render={<a href={signedIn ? '/dashboard' : '/account'} />} nativeButton={false} className="rounded-none px-5" size="lg">{signedIn ? `Dashboard${cartIds.size ? ` · ${cartIds.size}` : ''}` : 'My account'} <ArrowUpRight /></Button>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] px-5 pb-8 pt-14 md:px-10 md:pt-20">
        <div className="grid items-end gap-8 border-b border-border pb-12 lg:grid-cols-[1fr_0.8fr]"><div><p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Selected works · living catalog</p><h1 className="max-w-4xl font-heading text-5xl leading-[0.94] tracking-[-0.04em] sm:text-7xl lg:text-[6.6rem]">A living archive<br />of contemporary art.</h1></div><p className="max-w-lg pb-1 text-base leading-7 text-muted-foreground lg:justify-self-end">Explore original works from independent artists. Every piece is documented with provenance and current availability.</p></div>
      </section>

      <section id="collection" className="mx-auto max-w-[1600px] px-5 pb-24 md:px-10">
        <div className="sticky top-0 z-20 -mx-2 flex flex-col gap-4 border-b border-border bg-background/95 px-2 py-5 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Filter by availability">{statuses.map((item) => <Button key={item} variant={status === item ? 'default' : 'outline'} className="rounded-full px-4" onClick={() => setStatus(item)} aria-pressed={status === item}>{item}</Button>)}</div>
          <div className="flex items-center gap-2"><label className="relative min-w-0 flex-1 md:w-64"><span className="sr-only">Search the collection</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, artist, medium…" className="h-10 rounded-none pl-9" /></label><Button variant="outline" size="icon-lg" className="rounded-none" aria-label="More filters"><SlidersHorizontal /></Button></div>
        </div>
        <div className="flex items-center justify-between py-7 text-sm text-muted-foreground"><p>{loading ? 'Loading collection…' : `${filtered.length} ${filtered.length === 1 ? 'work' : 'works'}`}</p><div className="flex items-center gap-4"><span className="hidden items-center gap-2 sm:flex"><ListFilter className="size-4" /> Curated order</span><Grid2X2 className="size-4 text-foreground" /></div></div>

        {loadError ? <EmptyState title="The collection could not be loaded" note={loadError} /> : filtered.length ? (
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((work, index) => (
            <button key={work.id} type="button" className="group block w-full cursor-pointer text-left" onClick={() => { setSelected(work); setInquiryState('idle'); }}>
              <div className={`relative overflow-hidden bg-muted ${index % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]'}`}>{work.image ? <img src={work.image} alt={`${work.title} by ${work.artist}`} loading={index < 3 ? 'eager' : 'lazy'} fetchPriority={index < 3 ? 'high' : 'auto'} decoding="async" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]" /> : <div className="grid h-full place-items-center text-sm text-muted-foreground">Image coming soon</div>}<Badge variant="secondary" className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-2 text-[11px] uppercase tracking-[0.12em] backdrop-blur">{work.statusLabel}</Badge><span className="absolute bottom-4 right-4 grid size-11 translate-y-2 place-items-center rounded-full bg-background opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight className="size-4" /></span></div>
              <div className="flex items-start justify-between gap-4 border-b border-border py-4"><div><h2 className="font-heading text-xl tracking-[-0.02em]">{work.title}</h2><p className="mt-1 text-sm text-muted-foreground">{work.artist} · {work.year}</p><p className="mt-1 text-xs text-muted-foreground">{work.medium} · {work.dimensions}</p></div><p className="pt-1 text-sm font-medium">{work.price}</p></div>
            </button>
          ))}</div>
        ) : !loading ? <EmptyState title="No works found" note="Try another search or availability filter." action={() => { setQuery(''); setStatus('All works'); }} /> : null}
      </section>

      <section id="artists" className="border-t border-border bg-[#f3efe7] scroll-mt-20">
        <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-28">
          <header className="grid gap-6 border-b border-border pb-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Artist directory</p><h2 className="mt-3 font-heading text-5xl tracking-[-0.04em] sm:text-6xl">Artists in the archive.</h2></div>
            <p className="max-w-lg text-sm leading-7 text-muted-foreground lg:justify-self-end">Meet the artists represented in the collection and jump directly to their available and historical works.</p>
          </header>

          {artistDirectory.length ? <div className="mt-10 grid gap-5 md:grid-cols-2">{artistDirectory.map(({ name, works }) => {
            const years = works.map((work) => work.year);
            const media = [...new Set(works.map((work) => work.medium))];
            const available = works.filter((work) => work.status === 'available').length;
            return <article key={name} className="group grid min-h-72 overflow-hidden border border-border bg-background sm:grid-cols-[0.8fr_1.2fr]">
              <div className="min-h-56 overflow-hidden bg-muted">{works[0]?.image ? <img src={works[0].image} alt={`Artwork by ${name}`} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" /> : <div className="grid h-full place-items-center text-sm text-muted-foreground">Image coming soon</div>}</div>
              <div className="flex flex-col p-6 sm:p-7"><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{works.length} {works.length === 1 ? 'work' : 'works'} · {available} available</p><h3 className="mt-3 font-heading text-3xl">{name}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Working in {media.slice(0, 2).join(' and ').toLowerCase()}, with works in the archive from {Math.min(...years)}{Math.min(...years) !== Math.max(...years) ? `–${Math.max(...years)}` : ''}.</p><Button variant="outline" className="mt-auto w-full rounded-none" onClick={() => exploreArtist(name)}>View {name.split(' ')[0]}’s works <ArrowUpRight /></Button></div>
            </article>;
          })}</div> : <p className="mt-10 text-sm text-muted-foreground">Artist profiles will appear as works are added to the catalog.</p>}
        </div>
      </section>

      {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm" onMouseDown={() => setSelected(null)}><section role="dialog" aria-modal="true" aria-labelledby="artwork-title" className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto bg-background shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><Button variant="secondary" size="icon-lg" className="absolute right-3 top-3 z-10 rounded-full" onClick={() => setSelected(null)} aria-label="Close artwork details"><X /></Button><div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-h-[430px] bg-muted lg:min-h-[680px]">{selected.image ? <img src={selected.image} alt={`${selected.title} by ${selected.artist}`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground">Image coming soon</div>}</div>
        <div className="flex flex-col p-7 sm:p-10"><header className="border-b border-border pb-7"><div className="mb-4 flex items-center justify-between pr-8"><Badge variant="outline" className="rounded-full px-3 py-1 uppercase tracking-[0.12em]">{selected.statusLabel}</Badge><span className="text-sm text-muted-foreground">{selected.accessionNumber}</span></div><h2 id="artwork-title" className="font-heading text-4xl tracking-[-0.03em] sm:text-5xl">{selected.title}</h2><p className="text-base text-muted-foreground">{selected.artist}, {selected.year}</p></header>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-border py-7 text-sm"><div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Medium</dt><dd className="mt-1.5">{selected.medium}</dd></div><div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Dimensions</dt><dd className="mt-1.5">{selected.dimensions}</dd></div><div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Price</dt><dd className="mt-1.5">{selected.price}</dd></div><div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Location</dt><dd className="mt-1.5">Indianapolis, IN</dd></div></dl>
        <div className="py-7"><p className="text-sm leading-7 text-muted-foreground">{selected.description || 'Additional catalog notes are available on request.'}</p>{selected.provenance && <><p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">Provenance</p><p className="mt-2 text-sm">{selected.provenance}</p></>}</div>
        <div className="mt-auto border-t border-border pt-6"><Button type="button" variant="outline" disabled={selected.status === 'sold' || cartIds.has(selected.id)} onClick={() => addToCart(selected)} className="mb-4 h-11 w-full rounded-none">{cartIds.has(selected.id) ? 'Saved in your cart' : selected.status === 'sold' ? 'This work is sold' : 'Add to cart'}</Button>{cartMessage && <p className="mb-4 text-center text-xs text-muted-foreground">{cartMessage}</p>}{inquiryState === 'sent' ? <div className="border border-border bg-secondary/50 p-5" role="status"><Check className="mb-3 size-5" /><p className="font-heading text-2xl">Inquiry received</p><p className="mt-1 text-sm text-muted-foreground">We’ll reply with availability and viewing details within two business days.</p></div> : <form onSubmit={submitInquiry}><p className="mb-4 flex items-center gap-2 text-sm font-medium"><Mail className="size-4" /> Inquire about this work</p><div className="grid gap-3 sm:grid-cols-2"><Input name="name" required placeholder="Your name" className="h-10 rounded-none" /><Input name="email" type="email" required placeholder="Email address" className="h-10 rounded-none" /></div><textarea name="message" placeholder="Message (optional)" className="mt-3 min-h-20 w-full border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring" />{inquiryState === 'error' && <p className="mt-2 text-sm text-red-700">Your inquiry could not be sent. Please try again.</p>}<Button type="submit" disabled={inquiryState === 'sending'} className="mt-3 h-11 w-full rounded-none">{inquiryState === 'sending' ? 'Sending…' : 'Send inquiry'} <ArrowUpRight /></Button></form>}</div>
        </div>
      </div></section></div>}
    </main>
  );
}

function EmptyState({ title, note, action }: { title: string; note: string; action?: () => void }) {
  return <div className="grid min-h-72 place-items-center border border-dashed border-border text-center"><div><p className="font-heading text-2xl">{title}</p><p className="mt-2 text-sm text-muted-foreground">{note}</p>{action && <Button className="mt-5 rounded-none" onClick={action}>Clear filters</Button>}</div></div>;
}
