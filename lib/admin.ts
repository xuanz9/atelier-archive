import { env } from 'cloudflare:workers';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function getAuthenticatedUser() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user || null;
}

export function isAdminUser(user: { email?: string | null } | null) {
  if (!user?.email) return false;

  const allowed = (env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(user.email.toLowerCase());
}

export async function getAdminUser() {
  const user = await getAuthenticatedUser();
  return isAdminUser(user) ? user : null;
}
