import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  DRIVERENT_TABLES,
  isMissingTableError,
  normalizeBookingRecord,
} from '@/lib/supabase/tables';
import type { Booking, BookingStatus } from '@/types/database';
import { stripVehicleMetaFromUrl } from '@/lib/vehicles/catalog';
import BookingVoucherButton from '@/components/BookingVoucherButton';
import {
  Calendar,
  ExternalLink,
  Car,
  Bike,
  Clock,
  Wallet,
  MapPin,
  Plane,
} from 'lucide-react';

const STATUS_BADGE: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'รอตรวจสอบสลิปมัดจำ 30%',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  confirmed: {
    label: 'ยืนยันคิวรถแล้ว',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  cancelled: {
    label: 'ยกเลิกแล้ว',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  completed: {
    label: 'คืนรถเรียบร้อย',
    className: 'bg-slate-100 text-slate-700 border-slate-300',
  },
};

export default async function UserBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/bookings');
  }

  let res = await supabase
    .from(DRIVERENT_TABLES.bookings)
    .select(`*, ${DRIVERENT_TABLES.vehicles}(*)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (isMissingTableError(res.error)) {
    res = await supabase
      .from('bookings')
      .select('*, vehicles(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
  }

  if (res.error) {
    throw new Error(`ไม่สามารถดึงรายการจองได้: ${res.error.message}`);
  }

  const typedBookings: Booking[] = (
    (res.data ?? []) as Record<string, unknown>[]
  ).map(normalizeBookingRecord);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            ประวัติการจองรถของฉัน (สาขาหาดใหญ่ จ.สงขลา)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            ตรวจสอบสถานะการจอง ยอดเงินมัดจำ 30% ที่โอนแล้ว และยอดคงเหลือ 70% สำหรับชำระในวันรับรถ
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition w-fit shadow-xs"
        >
          + จองรถเพิ่ม
        </Link>
      </div>

      {typedBookings.length === 0 ? (
        <div className="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">
            คุณยังไม่มีประวัติการจองรถ
          </p>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            เลือกรถยนต์หรือมอเตอร์ไซค์ที่คุณต้องการเช่าจากหน้ารายการรถ (จองจ่ายมัดจำเพียง 30%)
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
          >
            ค้นหารถเช่าเลย
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {typedBookings.map((booking) => {
            const vehicle = booking.vehicles;
            const cleanThumbUrl = stripVehicleMetaFromUrl(vehicle?.image_url);
            const badge = STATUS_BADGE[booking.status] ?? STATUS_BADGE.pending;
            const total = Number(booking.total_price);
            const depositPaid =
              booking.deposit_amount ?? Math.round(total * 0.3);
            const remainingPay =
              booking.remaining_amount ?? Math.max(0, total - depositPaid);
            const pickupLoc =
              booking.pickup_location ||
              'สนามบินนานาชาติหาดใหญ่ (ประตูทางออก 3)';
            const pickupTime = booking.pickup_time || '09:00 น.';

            return (
              <div
                key={booking.id}
                className="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="w-24 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    {cleanThumbUrl ? (
                      <img
                        src={cleanThumbUrl}
                        alt={vehicle?.name || 'Vehicle'}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                        {vehicle?.type === 'car' ? (
                          <>
                            <Car className="w-3.5 h-3.5" /> รถยนต์
                          </>
                        ) : (
                          <>
                            <Bike className="w-3.5 h-3.5" /> มอเตอร์ไซค์
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {vehicle
                        ? `${vehicle.brand} ${vehicle.name}`
                        : 'ข้อมูลรถ'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      ทะเบียน: {vehicle?.license_plate || '-'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          {booking.start_date} ถึง {booking.end_date} ({pickupTime})
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-semibold bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-200">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>รับ-คืนรถ: {pickupLoc}</span>
                      </div>

                      {booking.flight_or_note && (
                        <div className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          <Plane className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{booking.flight_or_note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex flex-col sm:items-end gap-2">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-500 block">
                      ค่าเช่ารวมทั้งสิ้น: ฿{total.toLocaleString()}
                    </span>
                    <span className="text-base font-extrabold text-blue-600 block">
                      โอนมัดจำแล้ว (30%): ฿{depositPaid.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1 mt-1">
                      <Wallet className="w-3 h-3" />
                      ชำระวันรับรถ (70%): ฿{remainingPay.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <BookingVoucherButton
                      booking={booking}
                      customerFallbackName={
                        user.user_metadata?.full_name || user.email || 'ลูกค้าสมาชิก'
                      }
                      compact
                    />

                    {booking.payment_slip_url && (
                      <a
                        href={booking.payment_slip_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline px-2 py-1"
                      >
                        ดูสลิปโอนเงิน
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
