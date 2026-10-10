import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  DRIVERENT_TABLES,
  ensureDriveRentProfile,
  fetchUserProfile,
  isMissingTableError,
  normalizeBookingRecord,
  SUPABASE_PROJECT_NAME,
} from '@/lib/supabase/tables';
import AdminBookingList from '@/components/AdminBookingList';
import AdminVehicleManager from '@/components/AdminVehicleManager';
import AdminChatInbox from '@/components/AdminChatInbox';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import PromoteAdminButton from '@/components/PromoteAdminButton';
import type { Booking, Profile, Vehicle } from '@/types/database';
import {
  ShieldAlert,
  ClipboardList,
  Clock,
  CheckCircle2,
  Banknote,
  Database,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/admin');
  }

  const { data: profileData } = await fetchUserProfile(supabase, user.id);
  const profile =
    (profileData as Profile | null) ||
    ((await ensureDriveRentProfile(supabase, user)) as Profile | null);

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto bg-white/95 backdrop-blur rounded-2xl border border-slate-200 p-8 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">
          บัญชีของคุณยังไม่ได้เป็น Admin
        </h1>
        <p className="text-sm text-slate-600">
          ขณะนี้บัญชี <strong>{user.email}</strong> มีสถานะเป็น{' '}
          <span className="font-semibold text-blue-600">
            {profile?.role || 'customer'}
          </span>{' '}
          คุณสามารถกดปุ่มด้านล่างเพื่อเปลี่ยนสิทธิ์เป็น <strong>admin</strong>{' '}
          และเข้าใช้งานหน้าจัดการระบบได้ทันทีครับ
        </p>
        <div className="pt-2">
          <PromoteAdminButton userId={user.id} />
        </div>
      </div>
    );
  }

  // 3. ดึงข้อมูลรายการจองจาก DriveRent_bookings (พร้อม Fallback ไปยัง bookings)
  let bookingsRes = await supabase
    .from(DRIVERENT_TABLES.bookings)
    .select(
      `*, ${DRIVERENT_TABLES.vehicles}(*), ${DRIVERENT_TABLES.profiles}(*)`
    )
    .order('created_at', { ascending: false });

  if (isMissingTableError(bookingsRes.error)) {
    bookingsRes = await supabase
      .from('bookings')
      .select('*, vehicles(*), profiles(*)')
      .order('created_at', { ascending: false });
  }

  // 4. ดึงข้อมูลรถจาก DriveRent_vehicles (พร้อม Fallback ไปยัง vehicles)
  let vehiclesRes = await supabase
    .from(DRIVERENT_TABLES.vehicles)
    .select('*')
    .order('created_at', { ascending: false });

  if (isMissingTableError(vehiclesRes.error)) {
    vehiclesRes = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
  }

  const bookings: Booking[] = (
    (bookingsRes.data ?? []) as Record<string, unknown>[]
  ).map(normalizeBookingRecord);
  const vehicles = (vehiclesRes.data ?? []) as Vehicle[];

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter(
    (b) => b.status === 'confirmed'
  ).length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + Number(b.total_price), 0);

  return (
    <div className="space-y-8">
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
              charickDriveRent (สาขาหาดใหญ่ จ.สงขลา) — Admin Dashboard
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <Database className="w-3.5 h-3.5" />
              Supabase Project: {SUPABASE_PROJECT_NAME} (Prefix: DriveRent_*)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            แผงควบคุมรายการจอง (มัดจำ 30%) คลังรถเช่า แชทลูกค้า และรีวิว
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            ตรวจสอบสลิปมัดจำ 30% • ตอบกลับแชทลูกค้า • เพิ่มรถใหม่พร้อมรูป 4 มุมมอง • แจ้งเตือนอีเมลแอดมิน startdoing4you@gmail.com
          </p>
        </div>
      </div>

      {/* การ์ดสรุปสถิติ 4 ช่อง */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">
              รายการจองทั้งหมด
            </span>
            <span className="text-xl font-extrabold text-slate-900">
              {bookings.length} รายการ
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">
              รอตรวจสลิปมัดจำ 30%
            </span>
            <span className="text-xl font-extrabold text-amber-600">
              {pendingCount} รายการ
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">
              ยืนยันการจองแล้ว
            </span>
            <span className="text-xl font-extrabold text-emerald-600">
              {confirmedCount} รายการ
            </span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">
              มูลค่าค่าเช่ารวม (ที่อนุมัติแล้ว)
            </span>
            <span className="text-xl font-extrabold text-indigo-600">
              ฿{totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ส่วนที่ 1: จัดการรายการจองและอนุมัติสลิปมัดจำ 30% */}
      <AdminBookingList initialBookings={bookings} />

      {/* ส่วนที่ 2: กล่องข้อความ Live Chat & ฟอร์มติดต่อด่วนจากลูกค้า (ตอบกลับได้ทันที) */}
      <AdminChatInbox />

      {/* ส่วนที่ 3: เพิ่มรถเช่าคันใหม่ (พร้อมสเปกและรูป 4 มุมมอง) และจัดการสถานะรถ */}
      <AdminVehicleManager initialVehicles={vehicles} />

      {/* ส่วนที่ 4: จัดการและเพิ่มรีวิวจากลูกค้า */}
      <CustomerReviewsSection isAdmin={true} defaultShowForm={true} />
    </div>
  );
}
