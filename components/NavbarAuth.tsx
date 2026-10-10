'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ensureDriveRentProfile, fetchUserProfile } from '@/lib/supabase/tables';
import { alertSuccess, confirmAction } from '@/lib/swal';
import { useLanguage } from '@/components/LanguageProvider';
import {
  LogIn,
  LogOut,
  UserCheck,
  Shield,
  Loader2,
  Globe,
  CalendarCheck,
  PhoneCall,
} from 'lucide-react';
import type { UserRole } from '@/types/database';

interface NavbarAuthProps {
  userEmail?: string | null;
  fullName?: string | null;
  role?: UserRole | null;
}

export default function NavbarAuth({
  userEmail: initialEmail,
  fullName: initialFullName,
  role: initialRole,
}: NavbarAuthProps) {
  const router = useRouter();
  const supabase = createClient();
  const { lang, toggleLang, t } = useLanguage();

  const [email, setEmail] = useState<string | null>(initialEmail || null);
  const [fullName, setFullName] = useState<string | null>(
    initialFullName || null
  );
  const [role, setRole] = useState<UserRole | null>(initialRole || null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setEmail(initialEmail || null);
    setFullName(initialFullName || null);
    setRole(initialRole || null);
  }, [initialEmail, initialFullName, initialRole]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('google_auth') === 'success') {
        url.searchParams.delete('google_auth');
        window.history.replaceState({}, '', url.toString());
        alertSuccess(
          t('เข้าสู่ระบบด้วย Google สำเร็จ!', 'Signed In with Google!'),
          t(
            'ยินดีต้อนรับเข้าสู่ charickDriveRent สาขาหาดใหญ่ จ.สงขลา',
            'Welcome to charickDriveRent Hat Yai, Songkhla!'
          )
        );
      } else if (url.searchParams.get('email_verified') === 'success') {
        url.searchParams.delete('email_verified');
        window.history.replaceState({}, '', url.toString());
        alertSuccess(
          t('ยืนยันอีเมลสำเร็จ!', 'Email Verified Successfully!'),
          t(
            'บัญชีของคุณพร้อมใช้งานสำหรับจองรถเช่ากับ charickDriveRent แล้วครับ',
            'Your account is now verified and ready to book vehicles!'
          )
        );
      }
    }
  }, [t]);

  useEffect(() => {
    const syncGoogleFallback = async () => {
      const { getBrowserGoogleSession } = await import(
        '@/lib/supabase/google-session'
      );
      const googleSession = getBrowserGoogleSession();
      if (googleSession) {
        setEmail(googleSession.email);
        setFullName(googleSession.full_name);
        setRole(googleSession.role);
        return true;
      }
      return false;
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setEmail(session.user.email || null);
        const metaName =
          session.user.user_metadata?.driverent_full_name ||
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name;
        if (metaName) setFullName(metaName);

        let { data: profile } = await fetchUserProfile(
          supabase,
          session.user.id
        );

        // หากเป็นผู้ใช้จากเว็บอื่นในโปรเจกต์ CharDB ที่เพิ่งเข้ามาเว็บ DriveRent ให้สร้างโปรไฟล์แยกของ DriveRent ทันที
        if (!profile) {
          profile = await ensureDriveRentProfile(supabase, session.user);
        }

        if (profile) {
          if (profile.full_name) setFullName(profile.full_name);
          setRole(profile.role as UserRole);
        }
      } else {
        const hasGoogle = await syncGoogleFallback();
        if (!hasGoogle) {
          setEmail(null);
          setFullName(null);
          setRole(null);
        }
      }
    });

    const handleGoogleEvent = () => {
      void syncGoogleFallback().then((hasGoogle) => {
        if (!hasGoogle) {
          setEmail(null);
          setFullName(null);
          setRole(null);
        }
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('driverent:google-auth-change', handleGoogleEvent);
    }

    return () => {
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener(
          'driverent:google-auth-change',
          handleGoogleEvent
        );
      }
    };
  }, [supabase]);

  const handleLogout = async () => {
    const confirmed = await confirmAction({
      title: t('ยืนยันการออกจากระบบ (Logout)?', 'Confirm Logout?'),
      text: t(
        'คุณต้องการออกจากระบบบัญชีนี้ใช่หรือไม่',
        'Are you sure you want to log out of your account?'
      ),
      confirmText: 'Logout',
      cancelText: t('ยกเลิก', 'Cancel'),
      icon: 'question',
    });

    if (!confirmed) return;

    setLoggingOut(true);
    await supabase.auth.signOut();
    setEmail(null);
    setFullName(null);
    setRole(null);
    setLoggingOut(false);

    await alertSuccess(
      t('ออกจากระบบ (Logout) สำเร็จ!', 'Logged Out Successfully!'),
      t(
        'ขอบคุณที่ใช้บริการ charickDriveRent สาขาหาดใหญ่ แล้วพบกันใหม่ครับ',
        'Thank you for using charickDriveRent Hat Yai. See you again!'
      )
    );

    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* เมนูหลักรองรับ 2 ภาษา */}
      <Link
        href="/"
        className="text-slate-700 hover:text-blue-600 transition text-xs sm:text-sm font-semibold hidden sm:inline"
      >
        {t('ค้นหารถเช่า', 'Vehicles')}
      </Link>

      <Link
        href="/bookings"
        className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-600 transition text-xs sm:text-sm font-semibold"
      >
        <CalendarCheck className="w-4 h-4 text-blue-600" />
        <span className="hidden md:inline">
          {t('ประวัติการจอง', 'My Bookings')}
        </span>
      </Link>

      <a
        href="/#contact-section"
        className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-600 transition text-xs sm:text-sm font-semibold hidden lg:inline-flex"
      >
        <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
        <span>{t('ติดต่อเรา', 'Contact Us')}</span>
      </a>

      {/* ปุ่มเปลี่ยนภาษาแบบ EN/TH วางติดกับปุ่ม Login / Logout */}
      <button
        type="button"
        onClick={toggleLang}
        title={t('สลับภาษา EN/TH (Switch Language)', 'Switch Language EN/TH')}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-extrabold transition cursor-pointer shadow-2xs"
      >
        <Globe className="w-3.5 h-3.5 text-blue-600" />
        <span className="flex items-center gap-1">
          <span
            className={
              lang === 'en'
                ? 'bg-blue-600 text-white px-1.5 py-0.5 rounded-md'
                : 'text-slate-500'
            }
          >
            EN
          </span>
          <span className="text-slate-400">/</span>
          <span
            className={
              lang === 'th'
                ? 'bg-blue-600 text-white px-1.5 py-0.5 rounded-md'
                : 'text-slate-500'
            }
          >
            TH
          </span>
        </span>
      </button>

      {!email ? (
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>{t('Login / เข้าสู่ระบบ', 'Login')}</span>
        </Link>
      ) : (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/admin"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
              role === 'admin'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          {/* แสดง User Login ติดกับปุ่ม Logout */}
          <div className="flex items-center bg-slate-100/95 border border-slate-200 rounded-xl p-1 pl-2.5 gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span
                className="max-w-[110px] sm:max-w-[170px] truncate"
                title={email}
              >
                {fullName ? `${fullName} (${email})` : email}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              {loggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
