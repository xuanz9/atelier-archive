import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabasePublishableKey, supabaseUrl } from '@/lib/supabase/config';

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  browserClient ??= createBrowserClient(supabaseUrl, supabasePublishableKey);
  return browserClient;
}
