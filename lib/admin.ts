import { env } from 'cloudflare:workers';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function getAdminUser() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const allowed = (env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(user.email.toLowerCase()) ? user : null;
}
