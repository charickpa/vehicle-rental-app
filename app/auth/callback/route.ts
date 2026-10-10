import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureDriveRentProfile } from '@/lib/supabase/tables';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const authType = searchParams.get('type');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // สร้างหรือซิงค์ข้อมูลผู้ใช้เข้าตาราง DriveRent_profiles เฉพาะของเว็บ DriveRent ในโปรเจกต์ CharDB
      // โดยไม่ไปยุ่งกับตารางของเว็บไซต์อื่น และไม่เขียนทับสิทธิ์ Admin เดิม
      await ensureDriveRentProfile(supabase, data.user);

      const redirectTarget = new URL(next, origin);
      if (authType === 'signup') {
        redirectTarget.searchParams.set('email_verified', 'success');
      } else {
        redirectTarget.searchParams.set('google_auth', 'success');
      }
      return NextResponse.redirect(redirectTarget.toString());
    }
  }

  return NextResponse.redirect(`${origin}/login?error=google_oauth_failed`);
}

