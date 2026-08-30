import { createSupabaseContext } from '@supabase/server';
import { supabaseJwksUrl, supabasePublishableKey, supabaseUrl } from '@/lib/supabase/config';

export async function GET(request: Request) {
  const { data: context, error } = await createSupabaseContext(request, {
    auth: 'user',
    cors: 'disabled',
    env: {
      url: supabaseUrl,
      publishableKeys: { default: supabasePublishableKey },
      secretKeys: {},
      jwks: new URL(supabaseJwksUrl),
    },
  });

  if (error) {
    return Response.json(
      { message: error.message, code: error.code },
      { status: error.status },
    );
  }

  return Response.json({
    authenticated: true,
    user: {
      id: context.userClaims?.id,
      email: context.userClaims?.email,
    },
  });
}
