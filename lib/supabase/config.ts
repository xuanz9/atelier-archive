export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  'https://qhfvxqodmalxlfuxosep.supabase.co';

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  'sb_publishable_2UnoiRqMmLoD59YTcoe3oQ_8SwAGU1K';

export const supabaseJwksUrl =
  process.env.SUPABASE_JWKS_URL ??
  `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
