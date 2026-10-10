import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import dns from 'node:dns';

// แก้ปัญหา Node.js บน Windows พยายามเชื่อมต่อผ่าน IPv6 แล้วเกิด Timeout (TypeError: fetch failed หลังผ่านไป 10 วินาที)
dns.setDefaultResultOrder('ipv4first');

async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retries = 2
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return fetchWithRetry(input, init, retries - 1);
    }
    throw err;
  }
}

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: fetchWithRetry,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ถูกเรียกจาก Server Component ซึ่งไม่สามารถตั้งค่า Cookie ได้โดยตรง (จัดการผ่าน Middleware แทน)
          }
        },
      },
    }
  );

  const originalGetUser = client.auth.getUser.bind(client.auth);
  client.auth.getUser = async (jwt?: string) => {
    const res = await originalGetUser(jwt);
    if (res.data?.user) {
      return res;
    }

    const googleCookie = cookieStore.get('driverent_google_session')?.value;
    if (googleCookie) {
      const {
        parseGoogleSessionCookieValue,
        googleSessionToSupabaseUser,
      } = await import('@/lib/supabase/google-session');
      const parsed = parseGoogleSessionCookieValue(googleCookie);
      if (parsed) {
        return {
          data: { user: googleSessionToSupabaseUser(parsed) },
          error: null,
        };
      }
    }

    return res;
  };

  return client;
}
