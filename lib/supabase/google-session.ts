import type { User } from '@supabase/supabase-js';

export const GOOGLE_SESSION_COOKIE = 'driverent_google_session';
export const GOOGLE_SESSION_STORAGE_KEY = 'CharDB_DriveRent_google_session_v1';
export const GOOGLE_SAVED_ACCOUNTS_KEY = 'CharDB_DriveRent_google_accounts_v1';

export interface GoogleSessionUser {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  role: 'customer' | 'admin';
  avatar_url?: string;
}

/**
 * แปลงอีเมลเป็นรหัส UUID v4 แบบคงที่ (Deterministic UUID)
 * เพื่อให้บัญชี Gmail เดิมได้รหัส user.id เดิมเสมอทุกครั้งที่ล็อกอิน
 */
export function emailToDeterministicUuid(email: string): string {
  const clean = email.trim().toLowerCase();
  let h1 = 0xdeadbeef ^ clean.length;
  let h2 = 0x41c6ce57 ^ clean.length;
  let h3 = 0x1b873593 ^ clean.length;
  let h4 = 0x85ebca6b ^ clean.length;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822507);
    h4 = Math.imul(h4 ^ ch, 3266489909);
  }

  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  h3 =
    Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^
    Math.imul(h4 ^ (h4 >>> 13), 3266489909);
  h4 =
    Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^
    Math.imul(h3 ^ (h3 >>> 13), 3266489909);

  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  const raw = `${hex(h1)}${hex(h2)}${hex(h3)}${hex(h4)}`;

  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-4${raw.slice(
    13,
    16
  )}-a${raw.slice(17, 20)}-${raw.slice(20, 32)}`;
}

export function parseGoogleSessionCookieValue(
  rawCookieValue?: string | null
): GoogleSessionUser | null {
  if (!rawCookieValue) return null;
  try {
    const decoded = decodeURIComponent(rawCookieValue);
    const parsed = JSON.parse(decoded) as Partial<GoogleSessionUser>;
    if (!parsed || !parsed.email || !parsed.id) return null;
    return {
      id: parsed.id,
      email: parsed.email,
      full_name: parsed.full_name || parsed.email.split('@')[0],
      phone_number: parsed.phone_number || '089-999-8888',
      role:
        parsed.role === 'admin' ||
        parsed.email.toLowerCase() === 'startdoing4you@gmail.com'
          ? 'admin'
          : 'customer',
      avatar_url: parsed.avatar_url,
    };
  } catch {
    return null;
  }
}

export function googleSessionToSupabaseUser(
  sessionUser: GoogleSessionUser
): User {
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    app_metadata: {
      provider: 'google',
      providers: ['google'],
    },
    user_metadata: {
      full_name: sessionUser.full_name,
      name: sessionUser.full_name,
      driverent_full_name: sessionUser.full_name,
      driverent_phone_number: sessionUser.phone_number,
      driverent_role: sessionUser.role,
      avatar_url: sessionUser.avatar_url,
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as unknown as User;
}

export function getBrowserGoogleSession(): GoogleSessionUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const cookieMatch = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${GOOGLE_SESSION_COOKIE}=`));
    if (cookieMatch) {
      const val = cookieMatch.split('=').slice(1).join('=');
      const parsed = parseGoogleSessionCookieValue(val);
      if (parsed) return parsed;
    }

    const rawLocal = window.localStorage.getItem(GOOGLE_SESSION_STORAGE_KEY);
    if (rawLocal) {
      const parsed = parseGoogleSessionCookieValue(rawLocal);
      if (parsed) {
        // ซิงค์กลับเข้า Cookie เพื่อให้ Server Component อ่านได้ตรงกัน
        const encoded = encodeURIComponent(JSON.stringify(parsed));
        document.cookie = `${GOOGLE_SESSION_COOKIE}=${encoded}; path=/; max-age=2592000; SameSite=Lax`;
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

export function setBrowserGoogleSession(user: GoogleSessionUser): void {
  if (typeof window === 'undefined') return;
  try {
    const json = JSON.stringify(user);
    const encoded = encodeURIComponent(json);
    document.cookie = `${GOOGLE_SESSION_COOKIE}=${encoded}; path=/; max-age=2592000; SameSite=Lax`;
    window.localStorage.setItem(GOOGLE_SESSION_STORAGE_KEY, json);

    // บันทึกไว้ในรายการบัญชี Google ที่เคยเข้าสู่ระบบบนเครื่องนี้
    const existingRaw = window.localStorage.getItem(GOOGLE_SAVED_ACCOUNTS_KEY);
    const existingList: GoogleSessionUser[] = existingRaw
      ? JSON.parse(existingRaw)
      : [];
    const filtered = existingList.filter(
      (item) => item.email.toLowerCase() !== user.email.toLowerCase()
    );
    window.localStorage.setItem(
      GOOGLE_SAVED_ACCOUNTS_KEY,
      JSON.stringify([user, ...filtered].slice(0, 5))
    );

    window.dispatchEvent(
      new CustomEvent('driverent:google-auth-change', { detail: user })
    );
  } catch {
    // ignore storage errors
  }
}

export function clearBrowserGoogleSession(): void {
  if (typeof window === 'undefined') return;
  try {
    document.cookie = `${GOOGLE_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    window.localStorage.removeItem(GOOGLE_SESSION_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent('driverent:google-auth-change', { detail: null })
    );
  } catch {
    // ignore storage errors
  }
}

export function getSavedGoogleAccounts(): GoogleSessionUser[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(GOOGLE_SAVED_ACCOUNTS_KEY);
    if (!raw) return [];
    const saved = JSON.parse(raw) as GoogleSessionUser[];
    if (!Array.isArray(saved)) return [];
    return saved.filter(
      (item) =>
        item &&
        typeof item.email === 'string' &&
        item.email.includes('@')
    );
  } catch {
    return [];
  }
}
