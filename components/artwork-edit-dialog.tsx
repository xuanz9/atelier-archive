'use client';

import { FormEvent, useState } from 'react';
import { LoaderCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ArtworkStatus, ArtworkView } from '@/lib/catalog';

type ArtworkEditDialogProps = {
  artwork: ArtworkView;
  admin?: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

export function ArtworkEditDialog({ artwork, admin = false, onClose, onSaved }: ArtworkEditDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const body: Record<string, unknown> = {
      title: form.get('title'),
      artist: form.get('artist'),
      year: form.get('year'),
      medium: form.get('medium'),
      widthIn: form.get('widthIn'),
      heightIn: form.get('heightIn'),
      depthIn: form.get('depthIn'),
      price: form.get('price'),
      description: form.get('description'),
      provenance: form.get('provenance'),
    };

    if (admin) {
      body.status = form.get('status');
      body.submissionStatus = form.get('submissionStatus');
      body.published = form.get('published') === 'on';
    }

    try {
      const response = await fetch(`/api/artworks/${artwork.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Unable to update this artwork.');
      await onSaved();
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to update this artwork.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm" onMouseDown={() => !saving && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="edit-artwork-title" className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-background p-7 shadow-2xl sm:p-9" onMouseDown={(event) => event.stopPropagation()}>
        <Button variant="ghost" size="icon-lg" disabled={saving} className="absolute right-3 top-3 rounded-full" onClick={onClose} aria-label="Close edit form"><X /></Button>
        <h2 id="edit-artwork-title" className="font-heading text-3xl">Edit artwork details</h2>
        <p className="mt-1 text-sm text-muted-foreground">Update the catalog information for “{artwork.title}”.</p>
        <form onSubmit={save} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <EditField name="title" label="Title" defaultValue={artwork.title} />
            <EditField name="artist" label="Artist" defaultValue={artwork.artist} />
            <EditField name="year" label="Year" type="number" defaultValue={artwork.year} />
            <EditField name="price" label="Price (USD)" type="number" required={false} defaultValue={artwork.priceCents == null ? '' : artwork.priceCents / 100} />
            <EditField name="medium" label="Medium" defaultValue={artwork.medium} />
            <EditField name="widthIn" label="Width (in)" type="number" required={false} defaultValue={artwork.widthIn ?? ''} />
            <EditField name="heightIn" label="Height (in)" type="number" required={false} defaultValue={artwork.heightIn ?? ''} />
            <EditField name="depthIn" label="Depth (in)" type="number" required={false} defaultValue={artwork.depthIn ?? ''} />
          </div>

          {admin && <div className="grid gap-4 border-y border-border py-5 sm:grid-cols-2">
            <SelectField name="status" label="Sales status" defaultValue={artwork.status} options={[['available', 'Available'], ['reserved', 'Reserved'], ['sold', 'Sold'], ['not_for_sale', 'Not for sale']]} />
            <SelectField name="submissionStatus" label="Review status" defaultValue={artwork.submissionStatus} options={[['approved', 'Approved'], ['pending', 'Pending'], ['rejected', 'Rejected']]} />
            <label className="flex items-center gap-3 text-sm sm:col-span-2"><input name="published" type="checkbox" defaultChecked={artwork.published} className="size-4 accent-current" /> Show this artwork in the public collection</label>
          </div>}

          <TextAreaField name="description" label="Description" defaultValue={artwork.description} />
          <TextAreaField name="provenance" label="Provenance / exhibition history" defaultValue={artwork.provenance} />
          {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" disabled={saving} className="rounded-none" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} className="rounded-none">{saving ? <><LoaderCircle className="animate-spin" /> Saving…</> : 'Save changes'}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function EditField({ name, label, type = 'text', required = true, defaultValue }: { name: string; label: string; type?: string; required?: boolean; defaultValue: string | number }) {
  return <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}<Input name={name} type={type} min={type === 'number' ? 0 : undefined} step={type === 'number' ? 'any' : undefined} required={required} defaultValue={defaultValue} className="mt-2 h-10 rounded-none text-foreground" /></label>;
}

function TextAreaField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return <label className="block text-xs uppercase tracking-wider text-muted-foreground">{label}<textarea name={name} defaultValue={defaultValue} className="mt-2 min-h-24 w-full border border-input bg-transparent px-3 py-2 text-sm normal-case tracking-normal text-foreground" /></label>;
}

function SelectField({ name, label, defaultValue, options }: { name: string; label: string; defaultValue: ArtworkStatus | ArtworkView['submissionStatus']; options: Array<[string, string]> }) {
  return <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}<select name={name} defaultValue={defaultValue} className="mt-2 h-10 w-full border border-input bg-background px-3 text-sm normal-case tracking-normal text-foreground">{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>;
}
