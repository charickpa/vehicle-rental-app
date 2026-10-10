'use client';

import { useLanguage } from '@/components/LanguageProvider';
import type { Booking } from '@/types/database';
import { CalendarClock, Car, Bike, Clock, CheckCircle2 } from 'lucide-react';

interface BookedScheduleSectionProps {
  bookings: Booking[];
}

export default function BookedScheduleSection({
  bookings,
}: BookedScheduleSectionProps) {
  const { t } = useLanguage();

  return (
    <section className="mt-14 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-2">
            <CalendarClock className="w-3.5 h-3.5" />
            {t(
              'ตารางคิวจองล่าสุด (Booked Vehicles & Dates)',
              'Live Booked Schedule & Dates'
            )}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {t(
              'รายการวัน-เวลาและรถที่ถูกจองแล้ว',
              'Booked Vehicles & Rental Schedule'
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t(
              'ตรวจสอบช่วงวันที่รถแต่ละคันติดคิวจอง เพื่อวางแผนเลือกวันรับ-คืนรถที่สาขาหาดใหญ่ได้อย่างสะดวก',
              'Check current vehicle reservations to plan your pickup and return dates in Hat Yai.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('ยืนยันแล้ว', 'Confirmed')}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            {t('รอตรวจสลิปมัดจำ 30%', 'Pending 30% Slip')}
          </span>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-8 text-center">
          <CalendarClock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">
            {t(
              'ขณะนี้ยังไม่มีคิวจองที่กำลังใช้งาน — รถทุกคันพร้อมให้บริการ!',
              'No active reservations at this moment — all vehicles are available!'
            )}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'เมื่อมีการจองรถ ระบบจะแสดงชื่อรถ ทะเบียน และช่วงวัน-เวลาที่ถูกจองไว้ในตารางนี้ทันที',
              'Once a vehicle is booked, its model, license plate, and reserved dates will appear here.'
            )}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">
                  {t('รถที่ถูกจอง', 'Booked Vehicle')}
                </th>
                <th className="py-3 px-4">
                  {t('ประเภท / ทะเบียน', 'Type / License Plate')}
                </th>
                <th className="py-3 px-4">
                  {t('ช่วงวันที่เช่า (รับรถ - คืนรถ)', 'Rental Dates')}
                </th>
                <th className="py-3 px-4">
                  {t('เวลาที่ทำรายการจอง', 'Booked At')}
                </th>
                <th className="py-3 px-4 text-right">
                  {t('สถานะคิวจอง', 'Status')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {bookings.map((booking) => {
                const vehicle = booking.vehicles;
                const total = Number(booking.total_price);
                const deposit30 =
                  booking.deposit_amount ?? Math.round(total * 0.3);
                const bookedAt = new Date(booking.created_at).toLocaleString(
                  'th-TH',
                  {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }
                );

                return (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          {vehicle?.image_url && (
                            <img
                              src={vehicle.image_url}
                              alt={vehicle.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {vehicle
                              ? `${vehicle.brand} ${vehicle.name}`
                              : t('รถเช่าในระบบ', 'Rental Vehicle')}
                          </div>
                          <div className="text-xs text-blue-600 font-semibold">
                            {t('รวม', 'Total')} ฿{total.toLocaleString()}{' '}
                            <span className="text-emerald-600">
                              ({t('มัดจำ 30%:', '30% Deposit:')} ฿
                              {deposit30.toLocaleString()})
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div className="inline-flex items-center gap-1 font-semibold text-slate-800">
                        {vehicle?.type === 'car' ? (
                          <>
                            <Car className="w-3.5 h-3.5 text-blue-600" />{' '}
                            {t('รถยนต์', 'Car')}
                          </>
                        ) : (
                          <>
                            <Bike className="w-3.5 h-3.5 text-amber-600" />{' '}
                            {t('มอเตอร์ไซค์', 'Motorcycle')}
                          </>
                        )}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {vehicle?.license_plate || '-'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold text-xs border border-blue-200">
                        <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
                        {booking.start_date} {t('ถึง', 'to')} {booking.end_date}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {bookedAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {booking.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t('ยืนยันคิวแล้ว', 'Confirmed')}
                        </span>
                      ) : booking.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          {t('รอตรวจสอบสลิป', 'Pending Slip')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
                          {t('คืนรถเรียบร้อย', 'Completed')}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
