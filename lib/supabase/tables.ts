import type { SupabaseClient, User } from '@supabase/supabase-js';
import {
  DRIVERENT_APP_ID,
  DRIVERENT_NAMESPACE_PREFIX,
  DRIVERENT_REALTIME_CHANNELS,
  DRIVERENT_STORAGE_BUCKETS,
  DRIVERENT_STORAGE_KEYS,
  DRIVERENT_TABLES,
  SUPABASE_PROJECT_NAME,
  type Booking,
} from '@/types/database';

export {
  DRIVERENT_APP_ID,
  DRIVERENT_NAMESPACE_PREFIX,
  DRIVERENT_REALTIME_CHANNELS,
  DRIVERENT_STORAGE_BUCKETS,
  DRIVERENT_STORAGE_KEYS,
  DRIVERENT_TABLES,
  SUPABASE_PROJECT_NAME,
};

/**
 * ตรวจสอบว่า Error เกิดจากยังไม่ได้รัน SQL เปลี่ยนชื่อตารางเป็น DriveRent_* ใน Supabase (CharDB) หรือไม่
 * หากยังไม่ได้รัน ระบบจะสลับไปใช้ตารางเดิมอัตโนมัติเพื่อไม่ให้เว็บล่ม
 */
export function isMissingTableError(
  error: { code?: string; message?: string } | null
): boolean {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    error.code === 'PGRST200' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table') ||
    msg.includes('schema cache')
  );
}

const BOOKING_META_HASH = '#booking_meta=';

export interface BookingPickupMeta {
  pickup_location: string;
  pickup_time: string;
  flight_or_note: string;
}

/**
 * แนบข้อมูลสถานที่นัดรับรถ เวลารับรถ และเลขเที่ยวบินไว้ใน Hash Fragment ของ payment_slip_url
 * เพื่อบันทึกลงตาราง DriveRent_bookings บน Supabase ได้ทันทีโดยไม่ต้องรัน SQL เพิ่มคอลัมน์ใหม่
 */
export function packSlipUrlWithBookingMeta(
  slipUrl: string,
  meta: BookingPickupMeta
): string {
  const cleanUrl = (slipUrl || '').split(BOOKING_META_HASH)[0].trim();
  try {
    return `${cleanUrl}${BOOKING_META_HASH}${encodeURIComponent(
      JSON.stringify(meta)
    )}`;
  } catch {
    return cleanUrl;
  }
}

export function extractBookingMetaFromSlipUrl(rawSlipUrl?: string | null): {
  cleanSlipUrl: string | null;
  meta: BookingPickupMeta;
} {
  const defaultMeta: BookingPickupMeta = {
    pickup_location: 'สนามบินนานาชาติหาดใหญ่ (Hat Yai Airport - ส่งรถฟรี)',
    pickup_time: '10:00 น.',
    flight_or_note: '-',
  };

  if (!rawSlipUrl) {
    return { cleanSlipUrl: null, meta: defaultMeta };
  }

  const [cleanPart, encodedPart] = rawSlipUrl.split(BOOKING_META_HASH);
  if (!encodedPart) {
    return { cleanSlipUrl: cleanPart || null, meta: defaultMeta };
  }

  try {
    const parsed = JSON.parse(
      decodeURIComponent(encodedPart)
    ) as Partial<BookingPickupMeta>;
    return {
      cleanSlipUrl: cleanPart || null,
      meta: {
        pickup_location:
          parsed.pickup_location || defaultMeta.pickup_location,
        pickup_time: parsed.pickup_time || defaultMeta.pickup_time,
        flight_or_note: parsed.flight_or_note || defaultMeta.flight_or_note,
      },
    };
  } catch {
    return { cleanSlipUrl: cleanPart || null, meta: defaultMeta };
  }
}

/**
 * แปลงข้อมูลการจอง (Booking) ให้มีฟิลด์ vehicles, profiles, deposit_amount (30%), remaining_amount (70%) และสถานที่นัดรับรถครบถ้วนเสมอ
 * รองรับทั้งตาราง DriveRent_bookings และตาราง bookings เดิม
 */
export function normalizeBookingRecord(raw: Record<string, unknown>): Booking {
  const totalPrice = Number(raw.total_price ?? 0);
  const defaultDeposit = Math.round(totalPrice * 0.3);
  const depositAmount =
    raw.deposit_amount !== undefined && raw.deposit_amount !== null
      ? Number(raw.deposit_amount)
      : defaultDeposit;
  const remainingAmount =
    raw.remaining_amount !== undefined && raw.remaining_amount !== null
      ? Number(raw.remaining_amount)
      : Math.max(0, totalPrice - depositAmount);

  const vehicleObj =
    (raw.DriveRent_vehicles as Booking['vehicles']) ||
    (raw.vehicles as Booking['vehicles']) ||
    undefined;

  const profileObj =
    (raw.DriveRent_profiles as Booking['profiles']) ||
    (raw.profiles as Booking['profiles']) ||
    undefined;

  const { cleanSlipUrl, meta } = extractBookingMetaFromSlipUrl(
    (raw.payment_slip_url as string | null) || null
  );

  return {
    ...(raw as unknown as Booking),
    total_price: totalPrice,
    deposit_amount: depositAmount,
    remaining_amount: remainingAmount,
    payment_option:
      (raw.payment_option as Booking['payment_option']) ||
      (remainingAmount === 0 ? 'full_100' : 'deposit_30'),
    payment_slip_url: cleanSlipUrl,
    pickup_location:
      (raw.pickup_location as string) || meta.pickup_location,
    pickup_time: (raw.pickup_time as string) || meta.pickup_time,
    flight_or_note: (raw.flight_or_note as string) || meta.flight_or_note,
    vehicles: vehicleObj,
    profiles: profileObj,
  };
}

/**
 * ดึงข้อมูล Profile จากตาราง DriveRent_profiles (พร้อม Fallback ไปยัง profiles และเซสชัน Google)
 */
export async function fetchUserProfile(
  supabase: SupabaseClient,
  userId: string
) {
  let res = await supabase
    .from(DRIVERENT_TABLES.profiles)
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (isMissingTableError(res.error)) {
    res = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
  }

  if (!res.data && typeof window !== 'undefined') {
    const { getBrowserGoogleSession } = await import(
      '@/lib/supabase/google-session'
    );
    const googleSession = getBrowserGoogleSession();
    if (googleSession && googleSession.id === userId) {
      return {
        data: {
          id: googleSession.id,
          full_name: googleSession.full_name,
          phone_number: googleSession.phone_number,
          role: googleSession.role,
          created_at: new Date().toISOString(),
        },
        error: null,
      };
    }
  }

  return res;
}

/**
 * ตรวจสอบและสร้าง Profile เฉพาะของเว็บ DriveRent (`DriveRent_profiles`) อัตโนมัติ
 * กรณีผู้ใช้สมัครสมาชิกมาจากเว็บไซต์อื่นที่ใช้โปรเจกต์ `CharDB` ร่วมกัน หรือเข้าสู่ระบบด้วยบัญชี Google
 * ระบบจะสร้างแถวใน `DriveRent_profiles` หรือคืนค่าโปรไฟล์จากเซสชัน Google ให้ทันที
 */
export async function ensureDriveRentProfile(
  supabase: SupabaseClient,
  user: Pick<User, 'id' | 'email' | 'user_metadata'>
) {
  const existing = await fetchUserProfile(supabase, user.id);
  if (existing.data) {
    return existing.data;
  }

  const meta = user.user_metadata || {};
  const resolvedFullName =
    (meta.driverent_full_name as string) ||
    (meta.full_name as string) ||
    (meta.name as string) ||
    user.email?.split('@')[0] ||
    'ลูกค้า DriveRent';

  const resolvedPhone =
    (meta.driverent_phone_number as string) ||
    (meta.phone_number as string) ||
    '089-999-8888';

  const resolvedRole: 'customer' | 'admin' =
    meta.driverent_role === 'admin' ||
    user.email?.toLowerCase() === 'startdoing4you@gmail.com'
      ? 'admin'
      : 'customer';

  const insertPayload = {
    id: user.id,
    full_name: resolvedFullName,
    phone_number: resolvedPhone,
    role: resolvedRole,
  };

  const res = await supabase
    .from(DRIVERENT_TABLES.profiles)
    .upsert(insertPayload, { onConflict: 'id' })
    .select('*')
    .maybeSingle();

  if (isMissingTableError(res.error)) {
    const legacyRes = await supabase
      .from('profiles')
      .upsert(insertPayload, { onConflict: 'id' })
      .select('*')
      .maybeSingle();
    if (legacyRes.data) return legacyRes.data;
  }

  if (res.data) {
    return res.data;
  }

  return {
    ...insertPayload,
    created_at: new Date().toISOString(),
  };
}

/**
 * อัปเดตสิทธิ์หรือข้อมูลในตาราง DriveRent_profiles (รองรับทั้งฐานข้อมูล Supabase และเซสชันบัญชี Google)
 */
export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  payload: Record<string, unknown>
) {
  let res = await supabase
    .from(DRIVERENT_TABLES.profiles)
    .upsert({ id: userId, ...payload }, { onConflict: 'id' });

  if (isMissingTableError(res.error)) {
    res = await supabase
      .from('profiles')
      .upsert({ id: userId, ...payload }, { onConflict: 'id' });
  }

  if (typeof window !== 'undefined') {
    const {
      getBrowserGoogleSession,
      setBrowserGoogleSession,
    } = await import('@/lib/supabase/google-session');
    const googleSession = getBrowserGoogleSession();
    if (googleSession && googleSession.id === userId) {
      setBrowserGoogleSession({
        ...googleSession,
        full_name:
          (payload.full_name as string) ?? googleSession.full_name,
        phone_number:
          (payload.phone_number as string) ?? googleSession.phone_number,
        role:
          (payload.role as 'customer' | 'admin') ?? googleSession.role,
      });
      return { data: null, error: null };
    }
  }

  return res;
}

/**
 * อัปโหลดไฟล์ไปยัง Supabase Storage Bucket ที่แยก Namespace เฉพาะของ DriveRent
 * (`DriveRent-vehicles` หรือ `DriveRent-payment-slips`)
 * พร้อม Fallback ไปยัง Bucket เดิม (`vehicles` หรือ `payment-slips`) อัตโนมัติหากยังไม่ได้รัน SQL สร้าง Bucket ใหม่
 */
export async function uploadToDriveRentBucket(
  supabase: SupabaseClient,
  bucketKind: 'vehicles' | 'paymentSlips',
  filePath: string,
  file: File
): Promise<{ publicUrl: string; bucketUsed: string }> {
  const primaryBucket =
    bucketKind === 'vehicles'
      ? DRIVERENT_STORAGE_BUCKETS.vehicles
      : DRIVERENT_STORAGE_BUCKETS.paymentSlips;
  const fallbackBucket =
    bucketKind === 'vehicles'
      ? DRIVERENT_STORAGE_BUCKETS.vehiclesFallback
      : DRIVERENT_STORAGE_BUCKETS.paymentSlipsFallback;

  // ลองอัปโหลดเข้า Bucket ที่ขึ้นต้นด้วย DriveRent- ก่อน
  const primaryUpload = await supabase.storage
    .from(primaryBucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (!primaryUpload.error) {
    const {
      data: { publicUrl },
    } = supabase.storage.from(primaryBucket).getPublicUrl(filePath);
    return { publicUrl, bucketUsed: primaryBucket };
  }

  // หากยังไม่ได้สร้าง Bucket DriveRent-* ใน CharDB ให้สลับไปใช้ Bucket สำรองอัตโนมัติ
  const fallbackUpload = await supabase.storage
    .from(fallbackBucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (fallbackUpload.error) {
    throw new Error(fallbackUpload.error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(fallbackBucket).getPublicUrl(filePath);
  return { publicUrl, bucketUsed: fallbackBucket };
}

