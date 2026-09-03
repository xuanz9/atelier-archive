'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ImagePlus, LayoutGrid, Package, Pencil, Plus, Search, Settings, Trash2, Users, X } from 'lucide-react';
import { ArtworkEditDialog } from '@/components/artwork-edit-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ArtworkStatus, ArtworkView } from '@/lib/catalog';
import { optimizeArtworkImage } from '@/lib/image-upload';

type InquiryView = { inquiry: { id: number; name: string; email: string; message: string | null; status: string; createdAt: string }; artworkTitle: string };
const statusOrder: ArtworkStatus[] = ['available', 'reserved', 'sold'];
const statusStyle: Record<ArtworkStatus, string> = {
  available: 'border-emerald-700/20 bg-emerald-50 text-emerald-800', reserved: 'border-amber-700/20 bg-amber-50 text-amber-800', sold: 'border-stone-700/20 bg-stone-100 text-stone-700', not_for_sale: 'border-stone-700/20 bg-stone-100 text-stone-700',
};

export default function AdminPage() {
  const [works, setWorks] = useState<ArtworkView[]>([]);
  const [inquiries, setInquiries] = useState<InquiryView[]>([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStep, setSaveStep] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editing, setEditing] = useState<ArtworkView | null>(null);

  const loadData = useCallback(async () => {
    const [artworkResponse, inquiryResponse] = await Promise.all([fetch('/api/artworks?include_unpublished=true'), fetch('/api/inquiries')]);
    if (!artworkResponse.ok) throw new Error('Unable to load inventory.');
    const artworkData = await artworkResponse.json() as { artworks: ArtworkView[] };
    setWorks(artworkData.artworks);
    if (inquiryResponse.ok) setInquiries((await inquiryResponse.json() as { inquiries: InquiryView[] }).inquiries);
  }, []);

  useEffect(() => { loadData().catch((reason: Error) => setError(reason.message)); }, [loadData]);
  const visible = useMemo(() => works.filter((work) => `${work.title} ${work.artist} ${work.accessionNumber}`.toLowerCase().includes(query.toLowerCase())), [works, query]);

  async function cycleStatus(work: ArtworkView) {
    const next = statusOrder[(statusOrder.indexOf(work.status) + 1) % statusOrder.length];
    const response = await fetch(`/api/artworks/${work.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: next }) });
    if (response.ok) await loadData();
  }

  async function approveArtwork(work: ArtworkView) {
    const response = await fetch(`/api/artworks/${work.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ submissionStatus: 'approved', published: true, status: 'available' }) });
    if (response.ok) await loadData();
  }

  async function deleteArtwork(work: ArtworkView) {
    if (!window.confirm(`Delete “${work.title}”? This cannot be undone.`)) return;
    const response = await fetch(`/api/artworks/${work.id}`, { method: 'DELETE' });
    if (response.ok) await loadData();
  }

  async function addArtwork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      if (!selectedImage) throw new Error('Choose an artwork image before saving.');
      setSaveStep('Creating catalog record…');
      const response = await fetch('/api/artworks', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
          title: form.get('title'), artist: form.get('artist'), year: form.get('year'), price: form.get('price'), medium: form.get('medium'), widthIn: form.get('widthIn'), heightIn: form.get('heightIn'), depthIn: form.get('depthIn'), description: form.get('description'), provenance: form.get('provenance'), published: true,
        }),
      });
      const result = await response.json() as { artwork?: { id: number }; error?: string };
      if (!response.ok || !result.artwork) throw new Error(result.error || 'Unable to save artwork.');
      setSaveStep('Uploading image…');
      const optimizedImage = await optimizeArtworkImage(selectedImage);
      const imageForm = new FormData(); imageForm.set('image', optimizedImage);
      const imageResponse = await fetch(`/api/artworks/${result.artwork.id}/images`, { method: 'POST', body: imageForm });
      if (!imageResponse.ok) throw new Error((await imageResponse.json() as { error?: string }).error || 'Artwork saved, but image upload failed.');
      await loadData(); setSaved(true);
      setTimeout(() => { setOpen(false); setSaved(false); setSelectedImage(null); setImagePreview(''); }, 900);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save artwork.'); }
    finally { setSaving(false); setSaveStep(''); }
  }

  function chooseImage(file: File | undefined) {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : '');
    setError('');
  }

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-foreground lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden min-h-screen border-r border-border bg-[#211f1c] p-6 text-[#f6f1e8] lg:flex lg:flex-col"><a href="/" className="flex items-center gap-3 border-b border-white/15 pb-6"><span className="grid size-9 place-items-center border border-current text-sm font-semibold">A</span><span className="font-heading tracking-[0.12em]">ATELIER</span></a><nav className="mt-8 space-y-2 text-sm"><a href="#inventory" className="flex items-center gap-3 bg-white/10 px-3 py-2.5"><LayoutGrid className="size-4" /> Collection</a><a href="#artists" className="flex items-center gap-3 px-3 py-2.5 text-white/60"><Users className="size-4" /> Artists</a><a href="#inquiries" className="flex items-center gap-3 px-3 py-2.5 text-white/60"><Package className="size-4" /> Inquiries <span className="ml-auto rounded-full bg-[#b66a43] px-2 text-xs text-white">{inquiries.length}</span></a></nav><a href="#settings" className="mt-auto flex items-center gap-3 px-3 py-2.5 text-sm text-white/60"><Settings className="size-4" /> Settings</a></aside>
      <section className="min-w-0"><header className="flex min-h-20 items-center justify-between border-b border-border bg-background px-5 md:px-10"><div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Private catalog</p><h1 className="font-heading text-2xl">Collection manager</h1></div><div className="flex items-center gap-2"><Button render={<a href="/" />} nativeButton={false} variant="outline" className="hidden rounded-none sm:inline-flex"><ArrowLeft /> View site</Button><Button className="rounded-none" onClick={() => { setError(''); setSelectedImage(null); setImagePreview(''); setOpen(true); }}><Plus /> Add artwork</Button></div></header>
      <div className="p-5 md:p-10">{error && !open && <p className="mb-5 border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}<div className="grid gap-4 sm:grid-cols-3">{[['Total works', works.length, 'Persistent catalog'], ['Available', works.filter((work) => work.status === 'available').length, 'Ready for inquiry'], ['Open inquiries', inquiries.filter(({ inquiry }) => inquiry.status === 'new').length, 'Saved from the website']].map(([label, value, note]) => <div key={label} className="border border-border bg-background p-5"><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</p><p className="mt-5 font-heading text-4xl">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>)}</div>
      <div id="inventory" className="mt-8 border border-border bg-background"><div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-heading text-2xl">Inventory</h2><p className="text-xs text-muted-foreground">Approve member submissions or edit any catalog record.</p></div><label className="relative sm:w-64"><span className="sr-only">Search inventory</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search inventory…" className="h-10 rounded-none pl-9" /></label></div><div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm"><thead className="border-b border-border bg-secondary/45 text-[11px] uppercase tracking-[0.12em] text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Artwork</th><th className="px-5 py-3 font-medium">Artist</th><th className="px-5 py-3 font-medium">Year</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Price</th><th className="px-5 py-3 font-medium">Access</th><th className="w-24 px-5 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody>{visible.map((work) => <tr key={work.id} className="border-b border-border/70 last:border-0"><td className="px-5 py-4"><p className="font-medium">{work.title}</p><p className="text-xs text-muted-foreground">{work.accessionNumber}</p></td><td className="px-5 py-4">{work.artist}</td><td className="px-5 py-4 text-muted-foreground">{work.year}</td><td className="px-5 py-4"><button type="button" disabled={work.submissionStatus === 'pending'} onClick={() => cycleStatus(work)}><Badge variant="outline" className={`rounded-full ${statusStyle[work.status]}`}>{work.statusLabel}</Badge></button></td><td className="px-5 py-4">{work.price}</td><td className="px-5 py-4">{work.submissionStatus === 'pending' ? <Button size="sm" className="rounded-none" onClick={() => approveArtwork(work)}><Check /> Approve</Button> : <Badge variant="outline" className="rounded-full">{work.published ? 'Published' : work.submissionStatus}</Badge>}</td><td className="px-5 py-4"><div className="flex"><Button variant="ghost" size="icon-sm" onClick={() => setEditing(work)} aria-label={`Edit ${work.title}`}><Pencil /></Button><Button variant="ghost" size="icon-sm" onClick={() => deleteArtwork(work)} aria-label={`Delete ${work.title}`}><Trash2 /></Button></div></td></tr>)}</tbody></table></div></div>
      <div id="inquiries" className="mt-8 border border-border bg-background p-5"><h2 className="font-heading text-2xl">Inquiries</h2>{inquiries.length ? <div className="mt-4 divide-y divide-border">{inquiries.map(({ inquiry, artworkTitle }) => <article key={inquiry.id} className="grid gap-1 py-4 text-sm md:grid-cols-[1fr_1fr_2fr]"><div><p className="font-medium">{inquiry.name}</p><a className="text-muted-foreground underline" href={`mailto:${inquiry.email}`}>{inquiry.email}</a></div><p>{artworkTitle}</p><p className="text-muted-foreground">{inquiry.message || 'No message included.'}</p></article>)}</div> : <p className="mt-3 text-sm text-muted-foreground">No inquiries yet.</p>}</div></div></section>

      {open && <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm" onMouseDown={() => !saving && setOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby="add-artwork-title" className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-background p-7 shadow-2xl sm:p-9" onMouseDown={(event) => event.stopPropagation()}><Button variant="ghost" size="icon-lg" className="absolute right-3 top-3 rounded-full" disabled={saving} onClick={() => setOpen(false)} aria-label="Close add artwork form"><X /></Button><header><h2 id="add-artwork-title" className="font-heading text-3xl">Add an artwork</h2><p className="mt-1 text-sm text-muted-foreground">Choose an image, complete the required details, then click Save artwork to upload everything.</p></header>{saved ? <div className="grid min-h-72 place-items-center text-center"><div><Check className="mx-auto mb-4 size-8" /><p className="font-heading text-3xl">Artwork added</p></div></div> : <form onSubmit={addArtwork} className="mt-5 space-y-5"><label className="relative grid min-h-44 cursor-pointer place-items-center overflow-hidden border border-dashed border-border bg-secondary/30 text-center"><input name="image" type="file" accept="image/jpeg,image/png,image/webp" required className="sr-only" onChange={(event) => chooseImage(event.target.files?.[0])} />{imagePreview ? <><img src={imagePreview} alt="Selected artwork preview" className="absolute inset-0 h-full w-full object-cover" /><span className="absolute inset-x-0 bottom-0 bg-black/70 px-4 py-3 text-left text-xs text-white"><strong className="block truncate text-sm">{selectedImage?.name}</strong>Ready to upload · click to choose a different image</span></> : <span><ImagePlus className="mx-auto mb-2 size-6" /><span className="block text-sm font-medium">Choose artwork image</span><span className="mt-1 block text-xs text-muted-foreground">JPEG, PNG or WebP · up to 10 MB</span></span>}</label><div className="grid gap-4 sm:grid-cols-2"><Field name="title" label="Title" /><Field name="artist" label="Artist" /><Field name="year" label="Year" type="number" /><Field name="price" label="Price (USD)" type="number" /><Field name="medium" label="Medium" /><Field name="widthIn" label="Width (in)" type="number" /><Field name="heightIn" label="Height (in)" type="number" /><Field name="depthIn" label="Depth (in, optional)" type="number" required={false} /></div><label className="block text-xs uppercase tracking-wider text-muted-foreground">Description<textarea name="description" className="mt-2 min-h-20 w-full border border-input bg-transparent px-3 py-2 text-sm text-foreground" /></label><label className="block text-xs uppercase tracking-wider text-muted-foreground">Provenance<textarea name="provenance" className="mt-2 min-h-16 w-full border border-input bg-transparent px-3 py-2 text-sm text-foreground" /></label>{error && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button type="submit" disabled={saving} className="h-11 w-full rounded-none">{saving ? saveStep || 'Saving…' : 'Save artwork and upload image'}</Button></form>}</section></div>}
      {editing && <ArtworkEditDialog artwork={editing} admin onClose={() => setEditing(null)} onSaved={loadData} />}
    </main>
  );
}

function Field({ name, label, type = 'text', required = true }: { name: string; label: string; type?: string; required?: boolean }) {
  return <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}<Input name={name} type={type} min={type === 'number' ? 0 : undefined} step={type === 'number' ? 'any' : undefined} required={required} className="mt-2 h-10 rounded-none text-foreground" /></label>;
}
