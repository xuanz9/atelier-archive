'use client';

import { FormEvent, useMemo, useState } from 'react';
import { ArrowUpRight, Check, Grid2X2, ListFilter, Mail, Search, SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const artworks = [
  { id: 1, title: 'The Quiet Between', artist: 'Mara Voss', year: 2024, medium: 'Oil on linen', dimensions: '36 × 48 in', price: '$4,800', status: 'Available', image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1400&q=85', aspect: 'aspect-[4/5]' },
  { id: 2, title: 'Field Notes No. 7', artist: 'Theo Laurent', year: 2023, medium: 'Acrylic on canvas', dimensions: '40 × 40 in', price: '$3,200', status: 'Reserved', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1400&q=85', aspect: 'aspect-square' },
  { id: 3, title: 'After the Rain', artist: 'Inez Calder', year: 2024, medium: 'Mixed media', dimensions: '30 × 42 in', price: '$3,900', status: 'Available', image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=1400&q=85', aspect: 'aspect-[4/5]' },
  { id: 4, title: 'Blue Hour', artist: 'Mara Voss', year: 2022, medium: 'Oil on panel', dimensions: '24 × 30 in', price: 'Sold', status: 'Sold', image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988a5?auto=format&fit=crop&w=1400&q=85', aspect: 'aspect-[4/5]' },
  { id: 5, title: 'Folding Light', artist: 'Sora Bennett', year: 2023, medium: 'Pigment on paper', dimensions: '22 × 30 in', price: '$1,850', status: 'Available', image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1400&q=85', aspect: 'aspect-square' },
  { id: 6, title: 'Soft Architecture', artist: 'Theo Laurent', year: 2021, medium: 'Acrylic and graphite', dimensions: '48 × 60 in', price: '$5,600', status: 'Available', image: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&w=1400&q=85', aspect: 'aspect-[4/5]' },
];

const statuses = ['All works', 'Available', 'Reserved', 'Sold'];

export default function Home() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All works');
  const [selected, setSelected] = useState<(typeof artworks)[number] | null>(null);
  const [inquirySent, setInquirySent] = useState(false);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return artworks.filter((work) => {
      const matchesStatus = status === 'All works' || work.status === status;
      const matchesQuery = !term || [work.title, work.artist, work.medium, String(work.year)].some((value) => value.toLowerCase().includes(term));
      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInquirySent(true);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/95">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 md:px-10">
          <a href="#collection" className="flex items-center gap-3" aria-label="Atelier Archive home">
            <span className="grid size-9 place-items-center border border-foreground text-sm font-semibold">A</span>
            <span className="font-heading text-lg tracking-[0.16em]">ATELIER ARCHIVE</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm md:flex" aria-label="Main navigation">
            <a href="#collection" className="border-b border-foreground pb-1">Collection</a>
            <a href="#artists" className="text-muted-foreground transition-colors hover:text-foreground">Artists</a>
            <a href="#about" className="text-muted-foreground transition-colors hover:text-foreground">About</a>
          </nav>
          <Button render={<a href="/admin" />} className="rounded-none px-5" size="lg">Private view <ArrowUpRight /></Button>
        </div>
      </header>

      <section className="mx-auto max-w-[1600px] px-5 pb-8 pt-14 md:px-10 md:pt-20">
        <div className="grid items-end gap-8 border-b border-border pb-12 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Selected works · 2021—2024</p>
            <h1 className="max-w-4xl font-heading text-5xl leading-[0.94] tracking-[-0.04em] sm:text-7xl lg:text-[6.6rem]">A living archive<br />of contemporary art.</h1>
          </div>
          <p className="max-w-lg pb-1 text-base leading-7 text-muted-foreground lg:justify-self-end">Explore original works from independent artists. Every piece is documented with provenance, exhibition history, and current availability.</p>
        </div>
      </section>

      <section id="collection" className="mx-auto max-w-[1600px] px-5 pb-24 md:px-10">
        <div className="sticky top-0 z-20 -mx-2 flex flex-col gap-4 border-b border-border bg-background/95 px-2 py-5 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Filter by availability">
            {statuses.map((item) => (
              <Button key={item} variant={status === item ? 'default' : 'outline'} className="rounded-full px-4" onClick={() => setStatus(item)} aria-pressed={status === item}>{item}</Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="relative min-w-0 flex-1 md:w-64">
              <span className="sr-only">Search the collection</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, artist, medium…" className="h-10 rounded-none pl-9" />
            </label>
            <Button variant="outline" size="icon-lg" className="rounded-none" aria-label="More filters"><SlidersHorizontal /></Button>
          </div>
        </div>

        <div className="flex items-center justify-between py-7 text-sm text-muted-foreground">
          <p>{filtered.length} {filtered.length === 1 ? 'work' : 'works'}</p>
          <div className="flex items-center gap-4"><span className="hidden items-center gap-2 sm:flex"><ListFilter className="size-4" /> Curated order</span><Grid2X2 className="size-4 text-foreground" /></div>
        </div>

        {filtered.length ? (
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((work) => (
              <button key={work.id} type="button" className="group block w-full cursor-pointer text-left" onClick={() => { setSelected(work); setInquirySent(false); }}>
                <div className={`relative overflow-hidden bg-muted ${work.aspect}`}>
                  <img src={work.image} alt={`${work.title} by ${work.artist}`} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]" />
                  <Badge variant="secondary" className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-2 text-[11px] uppercase tracking-[0.12em] backdrop-blur">{work.status}</Badge>
                  <span className="absolute bottom-4 right-4 grid size-11 translate-y-2 place-items-center rounded-full bg-background opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight className="size-4" /></span>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-border py-4">
                  <div><h2 className="font-heading text-xl tracking-[-0.02em]">{work.title}</h2><p className="mt-1 text-sm text-muted-foreground">{work.artist} · {work.year}</p><p className="mt-1 text-xs text-muted-foreground">{work.medium} · {work.dimensions}</p></div>
                  <p className="pt-1 text-sm font-medium">{work.price}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center border border-dashed border-border text-center"><div><p className="font-heading text-2xl">No works found</p><p className="mt-2 text-sm text-muted-foreground">Try another search or availability filter.</p><Button className="mt-5 rounded-none" onClick={() => { setQuery(''); setStatus('All works'); }}>Clear filters</Button></div></div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm" onMouseDown={() => setSelected(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="artwork-title" className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto bg-background shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <Button variant="secondary" size="icon-lg" className="absolute right-3 top-3 z-10 rounded-full" onClick={() => setSelected(null)} aria-label="Close artwork details"><X /></Button>
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="min-h-[430px] bg-muted lg:min-h-[680px]">
                <img src={selected.image} alt={`${selected.title} by ${selected.artist}`} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col p-7 sm:p-10">
                <header className="border-b border-border pb-7">
                  <div className="mb-4 flex items-center justify-between pr-8">
                    <Badge variant="outline" className="rounded-full px-3 py-1 uppercase tracking-[0.12em]">{selected.status}</Badge>
                    <span className="text-sm text-muted-foreground">AA–{String(selected.id).padStart(3, '0')}</span>
                  </div>
                  <h2 id="artwork-title" className="font-heading text-4xl tracking-[-0.03em] sm:text-5xl">{selected.title}</h2>
                  <p className="text-base text-muted-foreground">{selected.artist}, {selected.year}</p>
                </header>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-border py-7 text-sm">
                  <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Medium</dt><dd className="mt-1.5">{selected.medium}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Dimensions</dt><dd className="mt-1.5">{selected.dimensions}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Price</dt><dd className="mt-1.5">{selected.price}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Location</dt><dd className="mt-1.5">Indianapolis, IN</dd></div>
                </dl>

                <div className="py-7">
                  <p className="text-sm leading-7 text-muted-foreground">From the artist’s ongoing study of memory and place, this work layers gestural marks with quieter passages of color. Signed and dated verso. Certificate of authenticity included.</p>
                  <p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">Exhibition history</p>
                  <p className="mt-2 text-sm">New Form, Calder House, 2024</p>
                </div>

                {inquirySent ? (
                  <div className="mt-auto border border-border bg-secondary/50 p-5" role="status">
                    <Check className="mb-3 size-5" />
                    <p className="font-heading text-2xl">Inquiry received</p>
                    <p className="mt-1 text-sm text-muted-foreground">We’ll reply with availability and viewing details within two business days.</p>
                  </div>
                ) : (
                  <form onSubmit={submitInquiry} className="mt-auto border-t border-border pt-6">
                    <p className="mb-4 flex items-center gap-2 text-sm font-medium"><Mail className="size-4" /> Inquire about this work</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input name="name" required placeholder="Your name" className="h-10 rounded-none" />
                      <Input name="email" type="email" required placeholder="Email address" className="h-10 rounded-none" />
                    </div>
                    <Button type="submit" className="mt-3 h-11 w-full rounded-none">Send inquiry <ArrowUpRight /></Button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
