import { createBrowserClient } from '@supabase/ssr';
import {
  clearBrowserGoogleSession,
  getBrowserGoogleSession,
  googleSessionToSupabaseUser,
} from '@/lib/supabase/google-session';

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const originalGetUser = client.auth.getUser.bind(client.auth);
  client.auth.getUser = async (jwt?: string) => {
    const res = await originalGetUser(jwt);
    if (res.data?.user) {
      return res;
    }

    const googleSession = getBrowserGoogleSession();
    if (googleSession) {
      return {
        data: { user: googleSessionToSupabaseUser(googleSession) },
        error: null,
      };
    }

    return res;
  };

  const originalSignOut = client.auth.signOut.bind(client.auth);
  client.auth.signOut = async (options?: {
    scope?: 'global' | 'local' | 'others';
  }) => {
    clearBrowserGoogleSession();
    return originalSignOut(options);
  };

  return client;
}
