'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Check, ImagePlus, LayoutDashboard, LoaderCircle, Pencil, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { ArtworkEditDialog } from '@/components/artwork-edit-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ArtworkView } from '@/lib/catalog';
import { optimizeArtworkImage } from '@/lib/image-upload';

type Session = { authenticated: boolean; isAdmin: boolean; user: { email?: string } };

export default function MemberDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [myWorks, setMyWorks] = useState<ArtworkView[]>([]);
  const [cart, setCart] = useState<ArtworkView[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStep, setSaveStep] = useState('');
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editing, setEditing] = useState<ArtworkView | null>(null);

  const loadData = useCallback(async () => {
    const [sessionResponse, worksResponse, cartResponse] = await Promise.all([fetch('/api/account/session'), fetch('/api/my/artworks'), fetch('/api/cart')]);
    if (sessionResponse.ok) setSession(await sessionResponse.json());
    if (worksResponse.ok) setMyWorks((await worksResponse.json() as { artworks: ArtworkView[] }).artworks);
    if (cartResponse.ok) setCart((await cartResponse.json() as { items: ArtworkView[] }).items);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function submitArtwork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedImage) { setError('Choose an artwork image.'); return; }
    setSaving(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      setSaveStep('Creating private submission…');
      const response = await fetch('/api/artworks', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: form.get('title'), artist: form.get('artist'), year: form.get('year'), price: form.get('price'), medium: form.get('medium'), widthIn: form.get('widthIn'), heightIn: form.get('heightIn'), description: form.get('description') }) });
      const result = await response.json() as { artwork?: { id: number }; error?: string };
      if (!response.ok || !result.artwork) throw new Error(result.error || 'Unable to create submission.');
      setSaveStep('Uploading image…');
      const optimizedImage = await optimizeArtworkImage(selectedImage);
      const upload = new FormData(); upload.set('image', optimizedImage);
      const uploadResponse = await fetch(`/api/artworks/${result.artwork.id}/images`, { method: 'POST', body: upload });
      if (!uploadResponse.ok) throw new Error((await uploadResponse.json() as { error?: string }).error || 'Image upload failed.');
      await loadData(); setOpen(false); setSelectedImage(null); setImagePreview('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to submit artwork.'); }
    finally { setSaving(false); setSaveStep(''); }
  }

  async function removeCartItem(id: number) {
    await fetch(`/api/cart?artworkId=${id}`, { method: 'DELETE' });
    await loadData();
  }

  async function deleteSubmission(work: ArtworkView) {
    if (!window.confirm(`Delete “${work.title}”?`)) return;
    const response = await fetch(`/api/artworks/${work.id}`, { method: 'DELETE' });
    if (response.ok) await loadData();
  }

  function chooseImage(file?: File) {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(file || null); setImagePreview(file ? URL.createObjectURL(file) : ''); setError('');
  }

  return <main className="min-h-screen bg-[#f4f1eb] text-foreground">
    <header className="border-b border-border bg-background"><div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 md:px-10"><div><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Member portal</p><h1 className="font-heading text-2xl">My Atelier</h1></div><div className="flex items-center gap-2"><Button render={<a href="/" />} nativeButton={false} variant="outline" className="rounded-none"><ArrowLeft /> View collection</Button>{session?.isAdmin && <Button render={<a href="/admin" />} nativeButton={false} variant="outline" className="rounded-none"><LayoutDashboard /> Full catalog</Button>}<Button className="rounded-none" onClick={() => setOpen(true)}><Plus /> Submit artwork</Button></div></div></header>
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-10 lg:grid-cols-[1.2fr_0.8fr]">
      <section><div className="flex items-end justify-between border-b border-border pb-4"><div><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Private to your account</p><h2 className="font-heading text-3xl">My submissions</h2></div><span className="text-sm text-muted-foreground">{myWorks.length} works</span></div>{myWorks.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2">{myWorks.map((work) => <article key={work.id} className="overflow-hidden border border-border bg-background"><div className="aspect-[4/3] bg-muted">{work.image && <img src={work.image} alt={work.title} className="h-full w-full object-cover" />}</div><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-heading text-xl">{work.title}</h3><p className="text-xs text-muted-foreground">{work.artist} · {work.year}</p></div><Badge variant="outline" className="rounded-full capitalize">{work.submissionStatus}</Badge></div><p className="mt-3 text-xs text-muted-foreground">{work.submissionStatus === 'pending' ? 'Waiting for gallery approval. Only you and the owner can see this work.' : work.published ? 'Published in the collection.' : 'Not currently published.'}</p><div className="mt-3 grid grid-cols-2 gap-2"><Button variant="outline" className="rounded-none" onClick={() => setEditing(work)}><Pencil /> Edit details</Button><Button variant="ghost" className="rounded-none text-red-700" onClick={() => deleteSubmission(work)}><Trash2 /> Delete</Button></div></div></article>)}</div> : <div className="mt-5 grid min-h-56 place-items-center border border-dashed border-border bg-background text-center"><div><ImagePlus className="mx-auto mb-3 size-6" /><p className="font-heading text-2xl">No submissions yet</p><p className="mt-1 text-sm text-muted-foreground">Upload a work for private review.</p></div></div>}</section>
      <section><div className="flex items-end justify-between border-b border-border pb-4"><div><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Saved for consideration</p><h2 className="font-heading text-3xl">My cart</h2></div><ShoppingBag className="size-5" /></div>{cart.length ? <div className="mt-5 space-y-3">{cart.map((work) => <article key={work.id} className="flex gap-4 border border-border bg-background p-3"><div className="size-24 shrink-0 bg-muted">{work.image && <img src={work.image} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><h3 className="truncate font-heading text-lg">{work.title}</h3><p className="text-xs text-muted-foreground">{work.artist}</p><p className="mt-2 text-sm">{work.price}</p></div><Button variant="ghost" size="icon-sm" onClick={() => removeCartItem(work.id)} aria-label={`Remove ${work.title} from cart`}><X /></Button></article>)}</div> : <p className="mt-5 border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">Your cart is empty. Add works from the public collection.</p>}</section>
    </div>

    {open && <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm" onMouseDown={() => !saving && setOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby="submit-title" className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-background p-7 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><Button variant="ghost" size="icon-lg" disabled={saving} className="absolute right-3 top-3 rounded-full" onClick={() => setOpen(false)} aria-label="Close"><X /></Button><h2 id="submit-title" className="font-heading text-3xl">Submit your artwork</h2><p className="mt-1 text-sm text-muted-foreground">Your submission stays private until the gallery owner approves it.</p><form onSubmit={submitArtwork} className="mt-5 space-y-4"><label className="relative grid min-h-44 cursor-pointer place-items-center overflow-hidden border border-dashed border-border bg-secondary/30 text-center"><input type="file" accept="image/jpeg,image/png,image/webp" required className="sr-only" onChange={(event) => chooseImage(event.target.files?.[0])} />{imagePreview ? <img src={imagePreview} alt="Selected preview" className="absolute inset-0 h-full w-full object-cover" /> : <span><ImagePlus className="mx-auto mb-2" />Choose JPEG, PNG, or WebP</span>}</label><div className="grid gap-4 sm:grid-cols-2"><Field name="title" label="Title" /><Field name="artist" label="Artist" /><Field name="year" label="Year" type="number" /><Field name="price" label="Price (USD)" type="number" /><Field name="medium" label="Medium" /><Field name="widthIn" label="Width (in)" type="number" /><Field name="heightIn" label="Height (in)" type="number" /></div><label className="block text-xs uppercase tracking-wider text-muted-foreground">Description<textarea name="description" className="mt-2 min-h-20 w-full border border-input bg-transparent px-3 py-2 text-sm text-foreground" /></label>{error && <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button type="submit" disabled={saving} className="h-11 w-full rounded-none">{saving ? <><LoaderCircle className="animate-spin" /> {saveStep}</> : 'Submit artwork for review'}</Button></form></section></div>}
    {editing && <ArtworkEditDialog artwork={editing} onClose={() => setEditing(null)} onSaved={loadData} />}
  </main>;
}

function Field({ name, label, type = 'text' }: { name: string; label: string; type?: string }) {
  return <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}<Input name={name} type={type} min={type === 'number' ? 0 : undefined} step={type === 'number' ? 'any' : undefined} required className="mt-2 h-10 rounded-none text-foreground" /></label>;
}
