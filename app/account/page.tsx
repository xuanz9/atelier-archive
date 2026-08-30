'use client';

import { FormEvent, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type Mode = 'create' | 'signin';

export default function AccountPage() {
  const [mode, setMode] = useState<Mode>('create');
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const confirmPassword = String(form.get('confirmPassword') ?? '');
    const fullName = String(form.get('fullName') ?? '').trim();

    if (mode === 'create' && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'The passwords do not match.' });
      return;
    }
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Use at least 8 characters for your password.' });
      return;
    }
    if (mode === 'create' && !accepted) {
      setMessage({ type: 'error', text: 'Please accept the terms to create your account.' });
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage({ type: 'error', text: 'Account registration is being connected. Please try again shortly.' });
      return;
    }

    setPending(true);
    try {
      if (mode === 'create') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/account?confirmed=true`,
          },
        });
        if (error) throw error;
        if (data.session) {
          window.location.assign('/admin');
          return;
        }
        setMessage({ type: 'success', text: 'Check your email to confirm your account, then return here to sign in.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.assign('/admin');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'We could not complete that request.' });
    } finally {
      setPending(false);
    }
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setMessage(null);
  }

  return (
    <main className="min-h-screen bg-[#eee9df] text-foreground lg:grid lg:grid-cols-[0.92fr_1.08fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#211f1c] lg:block">
        <img src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1600&q=88" alt="Abstract contemporary artwork" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />
        <a href="/" className="absolute left-10 top-9 flex items-center gap-3 text-white" aria-label="Atelier Archive home">
          <span className="grid size-10 place-items-center border border-white text-sm font-semibold">A</span>
          <span className="font-heading text-lg tracking-[0.16em]">ATELIER ARCHIVE</span>
        </a>
        <div className="absolute bottom-12 left-10 max-w-lg pr-8 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/65">Your private view</p>
          <p className="mt-4 font-heading text-5xl leading-[0.96]">Save works, request viewings, and follow the artists you love.</p>
        </div>
      </section>

      <section className="flex min-h-screen flex-col bg-background">
        <header className="flex h-20 items-center justify-between border-b border-border px-5 sm:px-10">
          <a href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to collection</a>
          <span className="font-heading tracking-[0.14em] lg:hidden">ATELIER ARCHIVE</span>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Atelier membership</p>
            <h1 className="mt-3 font-heading text-5xl tracking-[-0.04em]">{mode === 'create' ? 'Create your account' : 'Welcome back'}</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{mode === 'create' ? 'Build a personal collection and contact the gallery directly.' : 'Sign in to return to your saved collection and inquiries.'}</p>

            <div className="mt-8 grid grid-cols-2 border-b border-border" role="tablist" aria-label="Account options">
              <button type="button" role="tab" aria-selected={mode === 'create'} className={`border-b-2 px-3 py-3 text-sm ${mode === 'create' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'}`} onClick={() => switchMode('create')}>Create account</button>
              <button type="button" role="tab" aria-selected={mode === 'signin'} className={`border-b-2 px-3 py-3 text-sm ${mode === 'signin' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'}`} onClick={() => switchMode('signin')}>Sign in</button>
            </div>

            <form onSubmit={submit} className="mt-7 space-y-5">
              {mode === 'create' && (
                <label className="block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Full name<Input name="fullName" autoComplete="name" required className="mt-2 h-12 rounded-none bg-transparent text-base normal-case tracking-normal text-foreground" placeholder="Your name" /></label>
              )}
              <label className="block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Email address<div className="relative mt-2"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" /><Input name="email" type="email" autoComplete="email" required className="h-12 rounded-none bg-transparent pl-10 text-base normal-case tracking-normal text-foreground" placeholder="you@example.com" /></div></label>
              <label className="block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Password<div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" /><Input name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'create' ? 'new-password' : 'current-password'} required minLength={8} className="h-12 rounded-none bg-transparent px-10 text-base normal-case tracking-normal text-foreground" placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>
              {mode === 'create' && (
                <><label className="block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Confirm password<Input name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} className="mt-2 h-12 rounded-none bg-transparent text-base normal-case tracking-normal text-foreground" placeholder="Repeat your password" /></label><div className="flex items-start gap-3"><Checkbox id="terms" checked={accepted} onCheckedChange={(checked) => setAccepted(checked === true)} /><label htmlFor="terms" className="text-xs leading-5 text-muted-foreground">I agree to the terms of use and acknowledge the privacy policy.</label></div></>
              )}

              {message && <div role={message.type === 'error' ? 'alert' : 'status'} className={`flex gap-3 border p-4 text-sm ${message.type === 'error' ? 'border-destructive/30 bg-destructive/5 text-destructive' : 'border-emerald-700/20 bg-emerald-50 text-emerald-900'}`}>{message.type === 'success' && <Check className="mt-0.5 size-4 shrink-0" />}<span>{message.text}</span></div>}

              <Button type="submit" disabled={pending} className="h-12 w-full rounded-none text-sm">{pending ? <><LoaderCircle className="animate-spin" /> Please wait</> : <>{mode === 'create' ? 'Create account' : 'Sign in'} <ArrowRight /></>}</Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">{mode === 'create' ? 'Already have an account?' : 'New to Atelier Archive?'} <button type="button" onClick={() => switchMode(mode === 'create' ? 'signin' : 'create')} className="font-medium text-foreground underline underline-offset-4">{mode === 'create' ? 'Sign in' : 'Create an account'}</button></p>
          </div>
        </div>
      </section>
    </main>
  );
}
