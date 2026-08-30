import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) redirect('/account?error=configuration');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account?returnTo=%2Fadmin');

  return children;
}
