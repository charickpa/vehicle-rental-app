'use client';

import { useState, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MySwal, alertError, alertSuccess } from '@/lib/swal';
import { useLanguage } from '@/components/LanguageProvider';
import BrandLogo from '@/components/BrandLogo';
import {
  LogIn,
  UserPlus,
  Loader2,
  MailCheck,
  Copy,
  Check,
  ExternalLink,
  X,
} from 'lucide-react';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';
  const supabase = createClient();
  const { t } = useLanguage();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://kelzmgwfmxfddiukqras.supabase.co';
  const supabaseCallbackUrl = `${supabaseUrl}/auth/v1/callback`;
  const appCallbackUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : 'http://localhost:3000/auth/callback';

  const handleCopyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  // ฟังก์ชันเมื่อกดปุ่ม "ดำเนินการต่อด้วยบัญชี Google"
  // เมื่อเปิด Google Provider บน Supabase แล้ว จะวิ่งไปที่หน้า accounts.google.com ของเบราว์เซอร์ผู้ใช้อัตโนมัติ (เลือกบัญชีที่ล็อกอินอยู่ใน Chrome ได้เลยโดยไม่ต้องกรอกอะไร)
  const handleGoogleAuth = async () => {
    try {
      setGoogleLoading(true);

      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: {
          apikey: anonKey,
        },
      }).catch(() => null);

      if (settingsRes && settingsRes.ok) {
        const settingsData = (await settingsRes.json()) as {
          external?: { google?: boolean };
        };
        if (!settingsData?.external?.google) {
          setGoogleLoading(false);
          setShowGoogleSetupModal(true);
          return;
        }
      }

      const redirectUrl = `${window.location.origin}/auth/callback?app=DriveRent&next=${encodeURIComponent(
        nextUrl
      )}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch {
      setGoogleLoading(false);
      setShowGoogleSetupModal(true);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const emailVerifyRedirect = `${window.location.origin}/auth/callback?app=DriveRent&type=signup&next=${encodeURIComponent(
          nextUrl
        )}`;

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: emailVerifyRedirect,
            data: {
              app_id: 'DriveRent',
              registered_app: 'charickDriveRent',
              full_name: fullName,
              phone_number: phone,
              driverent_full_name: fullName,
              driverent_phone_number: phone,
              driverent_role: 'customer',
            },
          },
        });
        if (error) throw error;

        await MySwal.fire({
          icon: 'info',
          title: t(
            'สมัครสมาชิกสำเร็จ! กรุณายืนยันอีเมล',
            'Registration Successful! Please Confirm Your Email'
          ),
          html: t(
            `<div class="space-y-2 text-left bg-blue-50 p-4 rounded-2xl border border-blue-200 text-slate-700 text-xs leading-relaxed">
              <p class="font-bold text-blue-900">📧 ระบบได้ส่งลิงก์ยืนยันตัวตนไปที่อีเมล:</p>
              <p class="font-extrabold text-sm text-blue-600">${email}</p>
              <p>กรุณาเปิดกล่องจดหมาย (หรือโฟลเดอร์ Spam/Junk) และคลิกลิงก์ยืนยันในอีเมลก่อนทำการเข้าสู่ระบบครับ</p>
            </div>`,
            `<div class="space-y-2 text-left bg-blue-50 p-4 rounded-2xl border border-blue-200 text-slate-700 text-xs leading-relaxed">
              <p class="font-bold text-blue-900">📧 A confirmation link has been sent to:</p>
              <p class="font-extrabold text-sm text-blue-600">${email}</p>
              <p>Please check your email inbox (or Spam folder) and click the verification link before logging in.</p>
            </div>`
          ),
          confirmButtonText: t(
            'รับทราบ (ไปหน้าเข้าสู่ระบบ)',
            'Got it (Go to Login)'
          ),
        });

        setIsRegister(false);
      } else {
        const { data: signInData, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });
        if (error) throw error;

        if (signInData.user) {
          const { ensureDriveRentProfile } = await import(
            '@/lib/supabase/tables'
          );
          await ensureDriveRentProfile(supabase, signInData.user);
        }

        await alertSuccess(
          t('เข้าสู่ระบบ (Login) สำเร็จ!', 'Logged In Successfully!'),
          t(
            `ยินดีต้อนรับคุณ ${email} เข้าสู่ระบบเช่ารถ charickDriveRent (สาขาหาดใหญ่)`,
            `Welcome ${email} to charickDriveRent Hat Yai!`
          )
        );

        router.push(nextUrl);
        router.refresh();
      }
    } catch (err) {
      await alertError(
        t('ไม่สามารถทำรายการได้', 'Authentication Failed'),
        err instanceof Error
          ? err.message
          : t(
              'กรุณาตรวจสอบอีเมล รหัสผ่าน หรือการยืนยันอีเมลของคุณอีกครั้ง',
              'Please verify your email, password, or email confirmation status.'
            )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto bg-white/95 backdrop-blur rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl">
        <div className="flex justify-center mb-4">
          <BrandLogo size="lg" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 text-center">
          {isRegister
            ? t('สมัครสมาชิกใหม่', 'Create an Account')
            : t('เข้าสู่ระบบ', 'Sign In to Your Account')}
        </h1>
        <p className="text-xs text-slate-500 text-center mt-1 mb-6">
          {t(
            'สมัครหรือเข้าสู่ระบบเพื่อจองรถเช่าสาขาหาดใหญ่ (มัดจำเพียง 30%)',
            'Sign in or register to book vehicles in Hat Yai (only 30% deposit).'
          )}
        </p>

        {/* ปุ่มสมัครสมาชิก / เข้าสู่ระบบผ่าน Google OAuth (วิ่งไป accounts.google.com ของเบราว์เซอร์ลูกค้า) */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={googleLoading || loading}
          className="w-full inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold py-3 px-4 rounded-2xl border-2 border-slate-200 hover:border-blue-400 text-xs sm:text-sm transition shadow-xs cursor-pointer mb-5"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span>
            {isRegister
              ? t(
                  'สมัครสมาชิกด่วนด้วยบัญชี Google',
                  'Sign Up Quickly with Google'
                )
              : t(
                  'ดำเนินการต่อด้วยบัญชี Google (Continue with Google)',
                  'Continue with Google'
                )}
          </span>
        </button>

        {/* เส้นคั่นระหว่าง Google กับ Email */}
        <div className="relative flex py-1 items-center mb-5">
          <div className="grow border-t border-slate-200" />
          <span className="shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase">
            {t('หรือใช้อีเมลของคุณ', 'OR CONTINUE WITH EMAIL')}
          </span>
          <div className="grow border-t border-slate-200" />
        </div>

        {isRegister && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-4">
            <MailCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              {t(
                'หากสมัครด้วยอีเมล กรุณาตรวจสอบกล่องจดหมายของคุณเพื่อกดยืนยันตัวตนก่อนเข้าสู่ระบบ (หากสมัครด้วย Google ไม่ต้องรอยืนยันอีเมล)',
                'For email registration, please check your inbox to verify your email before logging in.'
              )}
            </span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('ชื่อ-นามสกุล', 'Full Name')}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('สมชาย ใจดี', 'John Doe')}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('เบอร์โทรศัพท์', 'Phone Number')}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081-234-5678"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('อีเมล (Email)', 'Email Address')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('รหัสผ่าน (Password)', 'Password')}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition shadow-md cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />{' '}
                {t('สมัครสมาชิกด้วยอีเมล', 'Register with Email')}
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />{' '}
                {t('Login เข้าสู่ระบบด้วยอีเมล', 'Login with Email')}
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            {isRegister
              ? t(
                  'มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่',
                  'Already have an account? Login here'
                )
              : t(
                  'ยังไม่มีบัญชี? สมัครสมาชิกใหม่',
                  "Don't have an account? Register now"
                )}
          </button>
        </div>
      </div>

      {/* หน้าต่างแจ้งขั้นตอนเปิดสวิตช์ Google OAuth บน Supabase เพื่อให้วิ่งไปดึงบัญชี Google ที่ล็อกอินอยู่ในเบราว์เซอร์ของลูกค้าโดยตรง */}
      {mounted &&
        showGoogleSetupModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      ต้องเปิดสวิตช์ Google บน Supabase ก่อนใช้งาน
                    </h2>
                    <p className="text-xs text-slate-500">
                      เพื่อให้ระบบวิ่งไปดึงบัญชี Google ที่ล็อกอินอยู่ในเบราว์เซอร์ของผู้ใช้โดยอัตโนมัติ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleSetupModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 leading-relaxed">
                <strong>ทำไมยังไม่เด้งไปหน้าบัญชี Google ของผู้ใช้?</strong>
                <br />
                เนื่องจากระบบความปลอดภัยของ Google (`accounts.google.com`) จะอนุญาตให้เว็บดึงบัญชีที่ล็อกอินอยู่ใน Chrome มาสมัคร/เข้าสู่ระบบอัตโนมัติได้ ก็ต่อเมื่อเปิดสวิตช์ <strong>Google Provider</strong> ใน Supabase Dashboard และใส่ <strong>Client ID / Secret</strong> แล้วเท่านั้นครับ
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                  <p className="font-extrabold text-slate-900">
                    ขั้นตอนที่ 1: สร้าง OAuth Client ID บน Google Cloud Console
                  </p>
                  <p className="text-[11px] text-slate-600">
                    ไปที่เมนู <strong>APIs &amp; Services &gt; Credentials &gt; Create Credentials &gt; OAuth client ID</strong> (เลือก Web application) แล้วนำ URL ด้านล่างนี้ไปวางในช่อง <strong>Authorized redirect URIs</strong>:
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <code className="flex-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-800 truncate">
                      {supabaseCallbackUrl}
                    </code>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(supabaseCallbackUrl, 'supabase_cb')
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'supabase_cb' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> คัดลอกแล้ว
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> คัดลอก
                        </>
                      )}
                    </button>
                  </div>
                  <div className="pt-1">
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      คลิกเปิด Google Cloud Console (Credentials)
                    </a>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                  <p className="font-extrabold text-slate-900">
                    ขั้นตอนที่ 2: เปิดสวิตช์ Google บน Supabase (โปรเจกต์ CharDB)
                  </p>
                  <p className="text-[11px] text-slate-600">
                    กดเปิด <strong>Enable Sign in with Google</strong> แล้วนำ <strong>Client ID</strong> และ <strong>Client Secret</strong> ที่ได้จากข้อ 1 มาวางและกด <strong>Save</strong>:
                  </p>
                  <a
                    href="https://supabase.com/dashboard/project/kelzmgwfmxfddiukqras/auth/providers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:underline pt-0.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    คลิกเปิดหน้า Authentication &gt; Providers บน Supabase
                  </a>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                  <p className="font-extrabold text-slate-900">
                    ขั้นตอนที่ 3: เพิ่ม Redirect URL ใน Supabase URL Configuration
                  </p>
                  <div className="flex items-center gap-1.5">
                    <code className="flex-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-800 truncate">
                      {appCallbackUrl}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyText(appCallbackUrl, 'app_cb')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'app_cb' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> คัดลอกแล้ว
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> คัดลอก
                        </>
                      )}
                    </button>
                  </div>
                  <div className="pt-0.5">
                    <a
                      href="https://supabase.com/dashboard/project/kelzmgwfmxfddiukqras/auth/url-configuration"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      คลิกเปิดหน้า Authentication &gt; URL Configuration บน Supabase
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowGoogleSetupModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  รับทราบ
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto h-80 bg-white rounded-3xl animate-pulse" />
      }
    >
      <AuthForm />
    </Suspense>
  );
}
