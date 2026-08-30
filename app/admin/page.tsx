'use client';

import { FormEvent, useState } from 'react';
import { ArrowLeft, Check, ImagePlus, LayoutGrid, MoreHorizontal, Package, Plus, Search, Settings, Users, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialWorks = [
  { id: 'AA–001', title: 'The Quiet Between', artist: 'Mara Voss', year: 2024, status: 'Available', price: '$4,800' },
  { id: 'AA–002', title: 'Field Notes No. 7', artist: 'Theo Laurent', year: 2023, status: 'Reserved', price: '$3,200' },
  { id: 'AA–003', title: 'After the Rain', artist: 'Inez Calder', year: 2024, status: 'Available', price: '$3,900' },
  { id: 'AA–004', title: 'Blue Hour', artist: 'Mara Voss', year: 2022, status: 'Sold', price: '$2,900' },
  { id: 'AA–005', title: 'Folding Light', artist: 'Sora Bennett', year: 2023, status: 'Available', price: '$1,850' },
];

const statusStyle: Record<string, string> = {
  Available: 'border-emerald-700/20 bg-emerald-50 text-emerald-800',
  Reserved: 'border-amber-700/20 bg-amber-50 text-amber-800',
  Sold: 'border-stone-700/20 bg-stone-100 text-stone-700',
};

export default function AdminPage() {
  const [works, setWorks] = useState(initialWorks);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const visible = works.filter((work) => `${work.title} ${work.artist} ${work.id}`.toLowerCase().includes(query.toLowerCase()));

  function cycleStatus(id: string) {
    const order = ['Available', 'Reserved', 'Sold'];
    setWorks((current) => current.map((work) => work.id === id ? { ...work, status: order[(order.indexOf(work.status) + 1) % order.length] } : work));
  }

  function addArtwork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setWorks((current) => [{
      id: `AA–${String(current.length + 1).padStart(3, '0')}`,
      title: String(form.get('title')),
      artist: String(form.get('artist')),
      year: Number(form.get('year')),
      status: 'Available',
      price: `$${Number(form.get('price')).toLocaleString()}`,
    }, ...current]);
    setSaved(true);
    setTimeout(() => { setOpen(false); setSaved(false); }, 900);
  }

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-foreground lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden min-h-screen border-r border-border bg-[#211f1c] p-6 text-[#f6f1e8] lg:flex lg:flex-col">
        <a href="/" className="flex items-center gap-3 border-b border-white/15 pb-6">
          <span className="grid size-9 place-items-center border border-current text-sm font-semibold">A</span>
          <span className="font-heading tracking-[0.12em]">ATELIER</span>
        </a>
        <nav className="mt-8 space-y-2 text-sm">
          <a href="/admin" className="flex items-center gap-3 bg-white/10 px-3 py-2.5"><LayoutGrid className="size-4" /> Collection</a>
          <a href="#artists" className="flex items-center gap-3 px-3 py-2.5 text-white/60 hover:text-white"><Users className="size-4" /> Artists</a>
          <a href="#inquiries" className="flex items-center gap-3 px-3 py-2.5 text-white/60 hover:text-white"><Package className="size-4" /> Inquiries <span className="ml-auto rounded-full bg-[#b66a43] px-2 text-xs text-white">3</span></a>
        </nav>
        <a href="#settings" className="mt-auto flex items-center gap-3 px-3 py-2.5 text-sm text-white/60"><Settings className="size-4" /> Settings</a>
      </aside>

      <section className="min-w-0">
        <header className="flex min-h-20 items-center justify-between border-b border-border bg-background px-5 md:px-10">
          <div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Private catalog</p><h1 className="font-heading text-2xl">Collection manager</h1></div>
          <div className="flex items-center gap-2"><Button render={<a href="/" />} nativeButton={false} variant="outline" className="hidden rounded-none sm:inline-flex"><ArrowLeft /> View site</Button><Button className="rounded-none" onClick={() => setOpen(true)}><Plus /> Add artwork</Button></div>
        </header>

        <div className="p-5 md:p-10">
          <div className="grid gap-4 sm:grid-cols-3">
            {[['Total works', works.length, '+2 this month'], ['Available', works.filter((work) => work.status === 'Available').length, 'Ready for inquiry'], ['Open inquiries', 3, '2 need a reply']].map(([label, value, note]) => (
              <div key={label} className="border border-border bg-background p-5"><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</p><p className="mt-5 font-heading text-4xl">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>
            ))}
          </div>

          <div className="mt-8 border border-border bg-background">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="font-heading text-2xl">Inventory</h2><p className="text-xs text-muted-foreground">Click a status to move a work through the sales workflow.</p></div>
              <label className="relative sm:w-64"><span className="sr-only">Search inventory</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search inventory…" className="h-10 rounded-none pl-9" /></label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-border bg-secondary/45 text-[11px] uppercase tracking-[0.12em] text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Artwork</th><th className="px-5 py-3 font-medium">Artist</th><th className="px-5 py-3 font-medium">Year</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Price</th><th className="w-12 px-5 py-3"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{visible.map((work) => <tr key={work.id} className="border-b border-border/70 last:border-0"><td className="px-5 py-4"><p className="font-medium">{work.title}</p><p className="text-xs text-muted-foreground">{work.id}</p></td><td className="px-5 py-4">{work.artist}</td><td className="px-5 py-4 text-muted-foreground">{work.year}</td><td className="px-5 py-4"><button type="button" onClick={() => cycleStatus(work.id)} aria-label={`Change status for ${work.title}`}><Badge variant="outline" className={`rounded-full ${statusStyle[work.status]}`}>{work.status}</Badge></button></td><td className="px-5 py-4">{work.price}</td><td className="px-5 py-4"><Button variant="ghost" size="icon-sm" aria-label={`More options for ${work.title}`}><MoreHorizontal /></Button></td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
        <section role="dialog" aria-modal="true" aria-labelledby="add-artwork-title" className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-background p-7 shadow-2xl sm:p-9" onMouseDown={(event) => event.stopPropagation()}>
          <Button variant="ghost" size="icon-lg" className="absolute right-3 top-3 rounded-full" onClick={() => setOpen(false)} aria-label="Close add artwork form"><X /></Button>
          <header><h2 id="add-artwork-title" className="font-heading text-3xl">Add an artwork</h2><p className="mt-1 max-w-xl text-sm text-muted-foreground">Create the catalog record first. High-resolution originals can be attached for automatic web optimization.</p></header>
          {saved ? <div className="grid min-h-72 place-items-center text-center"><div><Check className="mx-auto mb-4 size-8" /><p className="font-heading text-3xl">Artwork added</p></div></div> : (
            <form onSubmit={addArtwork} className="mt-3 space-y-5">
              <label className="grid min-h-36 cursor-pointer place-items-center border border-dashed border-border bg-secondary/30 text-center"><input type="file" accept="image/*" className="sr-only" /><span><ImagePlus className="mx-auto mb-2 size-6" /><span className="block text-sm font-medium">Choose artwork images</span><span className="mt-1 block text-xs text-muted-foreground">JPEG, PNG or TIFF · up to 50 MB</span></span></label>
              <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs uppercase tracking-wider text-muted-foreground">Title<Input name="title" required className="mt-2 h-10 rounded-none text-foreground" /></label><label className="text-xs uppercase tracking-wider text-muted-foreground">Artist<Input name="artist" required className="mt-2 h-10 rounded-none text-foreground" /></label><label className="text-xs uppercase tracking-wider text-muted-foreground">Year<Input name="year" type="number" min="1900" max="2100" required className="mt-2 h-10 rounded-none text-foreground" /></label><label className="text-xs uppercase tracking-wider text-muted-foreground">Price (USD)<Input name="price" type="number" min="0" required className="mt-2 h-10 rounded-none text-foreground" /></label><label className="text-xs uppercase tracking-wider text-muted-foreground">Medium<Input name="medium" required className="mt-2 h-10 rounded-none text-foreground" /></label><label className="text-xs uppercase tracking-wider text-muted-foreground">Dimensions<Input name="dimensions" required className="mt-2 h-10 rounded-none text-foreground" /></label></div>
              <Button type="submit" className="h-11 w-full rounded-none">Save artwork</Button>
            </form>
          )}
        </section>
        </div>
      )}
    </main>
  );
}
