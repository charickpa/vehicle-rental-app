'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DRIVERENT_TABLES, isMissingTableError } from '@/lib/supabase/tables';
import {
  alertError,
  confirmAction,
  previewPaymentSlipPopup,
  Toast,
} from '@/lib/swal';
import type { Booking, BookingStatus } from '@/types/database';
import BookingVoucherButton from '@/components/BookingVoucherButton';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ExternalLink,
  Calendar,
  User,
  Phone,
  Loader2,
  Wallet,
  MapPin,
  Clock,
  Plane,
} from 'lucide-react';

const STATUS_BADGE: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'รอตรวจสลิปมัดจำ 30%',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  confirmed: {
    label: 'ยืนยันคิวแล้ว',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  cancelled: {
    label: 'ยกเลิกแล้ว',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  completed: {
    label: 'รับคืนรถเรียบร้อย',
    className: 'bg-slate-100 text-slate-700 border-slate-300',
  },
};

export default function AdminBookingList({
  initialBookings,
}: {
  initialBookings: Booking[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');

  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: BookingStatus
  ) => {
    const statusLabel = STATUS_BADGE[newStatus].label;
    const confirmed = await confirmAction({
      title: `ยืนยันเปลี่ยนสถานะเป็น "${statusLabel}"?`,
      text: 'ระบบจะอัปเดตสถานะการจองของลูกค้ารายการนี้ทันที',
      confirmText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      icon: newStatus === 'cancelled' ? 'warning' : 'question',
    });

    if (!confirmed) return;

    try {
      setUpdatingId(bookingId);
      let res = await supabase
        .from(DRIVERENT_TABLES.bookings)
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (isMissingTableError(res.error)) {
        res = await supabase
          .from('bookings')
          .update({ status: newStatus })
          .eq('id', bookingId);
      }

      if (res.error) {
        await alertError('อัปเดตสถานะไม่สำเร็จ', res.error.message);
        return;
      }

      await Toast.fire({
        icon: 'success',
        title: `อัปเดตสถานะเป็น "${statusLabel}" สำเร็จ`,
      });
      router.refresh();
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings =
    filterStatus === 'all'
      ? initialBookings
      : initialBookings.filter((b) => b.status === filterStatus);

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            รายการจองของลูกค้าทั้งหมด ({filteredBookings.length} รายการ) — CharDB: DriveRent_bookings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจสอบสลิปโอนเงินมัดจำ 30% และยอดคงเหลือ 70% ที่ต้องเก็บในวันรับรถ
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(
            ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const
          ).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all'
                ? 'ทั้งหมด'
                : st === 'pending'
                ? 'รอตรวจสลิป (30%)'
                : st === 'confirmed'
                ? 'ยืนยันแล้ว'
                : st === 'completed'
                ? 'คืนรถแล้ว'
                : 'ยกเลิก'}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          ไม่พบรายการจองในหมวดหมู่นี้
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const badge = STATUS_BADGE[booking.status] ?? STATUS_BADGE.pending;
            const vehicle = booking.vehicles;
            const customer = booking.profiles;
            const isUpdating = updatingId === booking.id;
            const total = Number(booking.total_price);
            const deposit30 =
              booking.deposit_amount ?? Math.round(total * 0.3);
            const remaining70 =
              booking.remaining_amount ?? Math.max(0, total - deposit30);

            return (
              <div
                key={booking.id}
                className="rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {vehicle
                        ? `${vehicle.brand} ${vehicle.name}`
                        : 'ไม่พบข้อมูลรถ'}
                    </span>
                    <span className="text-xs text-slate-500">
                      (ทะเบียน: {vehicle?.license_plate || '-'})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      ลูกค้า:{' '}
                      <strong>{customer?.full_name || 'ไม่ระบุชื่อ'}</strong>
                    </span>
                    {customer?.phone_number && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {customer.phone_number}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {booking.start_date} ถึง {booking.end_date}
                    </span>
                    <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      <Clock className="w-3.5 h-3.5" />
                      เวลารับรถ: {booking.pickup_time || '09:00 น.'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <MapPin className="w-3.5 h-3.5" />
                      จุดรับ-คืนรถ:{' '}
                      {booking.pickup_location ||
                        'สนามบินนานาชาติหาดใหญ่ (ประตูทางออก 3)'}
                    </span>
                    {booking.flight_or_note && (
                      <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        <Plane className="w-3.5 h-3.5 text-blue-600" />
                        หมายเหตุ/เที่ยวบิน: {booking.flight_or_note}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      ค่าเช่ารวม: ฿{total.toLocaleString()}
                    </span>
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                      ยอดโอนมัดจำ (30%): ฿{deposit30.toLocaleString()}
                    </span>
                    <span className="text-xs font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5" />
                      เก็บวันรับรถ (70%): ฿{remaining70.toLocaleString()}
                    </span>

                    <BookingVoucherButton
                      booking={booking}
                      customerFallbackName={customer?.full_name || 'ลูกค้าสมาชิก'}
                      compact
                    />

                    {booking.payment_slip_url ? (
                      <button
                        type="button"
                        onClick={() =>
                          previewPaymentSlipPopup({
                            slipUrl: booking.payment_slip_url!,
                            vehicleName: vehicle
                              ? `${vehicle.brand} ${vehicle.name}`
                              : 'รายการจองรถเช่า',
                            customerName:
                              customer?.full_name || 'ลูกค้าสมาชิก',
                            depositAmount: deposit30,
                            remainingAmount: remaining70,
                            totalPrice: total,
                          })
                        }
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-100 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg transition cursor-pointer"
                      >
                        เปิดดูสลิปโอนเงิน (Popup)
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">
                        ไม่มีไฟล์สลิป
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {isUpdating ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 px-3 py-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังบันทึก...
                    </span>
                  ) : (
                    <>
                      {booking.status !== 'confirmed' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(booking.id, 'confirmed')
                          }
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          อนุมัติสลิป (Confirm)
                        </button>
                      )}

                      {booking.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(booking.id, 'completed')
                          }
                          className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          รับคืนรถแล้ว (Complete)
                        </button>
                      )}

                      {booking.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(booking.id, 'cancelled')
                          }
                          className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          ยกเลิก
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
