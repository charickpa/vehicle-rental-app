'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Booking, Vehicle } from '@/types/database';
import { getVehicleExtraDetails } from '@/lib/vehicles/catalog';
import { useLanguage } from '@/components/LanguageProvider';
import {
  Car,
  Bike,
  ArrowRight,
  Eye,
  X,
  CheckCircle2,
  Gauge,
  Cog,
  Users,
  Fuel,
  CalendarClock,
  Images,
} from 'lucide-react';

interface VehicleCardWithModalProps {
  vehicle: Vehicle;
  bookingQueryString?: string;
  vehicleBookings?: Booking[];
}

export default function VehicleCardWithModal({
  vehicle,
  bookingQueryString = '',
  vehicleBookings = [],
}: VehicleCardWithModalProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const extra = getVehicleExtraDetails(vehicle);
  const [activeImage, setActiveImage] = useState(
    extra.gallery[0] || vehicle.image_url || ''
  );

  const activeBookings = vehicleBookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  );

  const bookingHref = `/book/${vehicle.id}${
    bookingQueryString ? `?${bookingQueryString}` : ''
  }`;

  return (
    <>
      <div className="group bg-white/95 backdrop-blur rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
        <div
          onClick={() => setIsOpen(true)}
          className="relative h-52 bg-slate-100 overflow-hidden cursor-pointer"
        >
          {vehicle.image_url ? (
            <img
              src={vehicle.image_url}
              alt={vehicle.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              {t('ไม่มีรูปภาพ', 'No Image')}
            </div>
          )}

          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-sm">
            {vehicle.type === 'car' ? (
              <>
                <Car className="w-3.5 h-3.5 text-blue-400" />{' '}
                {t('รถยนต์', 'Car')}
              </>
            ) : (
              <>
                <Bike className="w-3.5 h-3.5 text-amber-400" />{' '}
                {t('มอเตอร์ไซค์', 'Motorcycle')}
              </>
            )}
          </span>

          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-black/70 text-white backdrop-blur-sm group-hover:bg-blue-600 transition">
            <Images className="w-3.5 h-3.5" />
            {t(
              `ดูรูปเพิ่ม (${extra.gallery.length} รูป)`,
              `Photos (${extra.gallery.length})`
            )}
          </span>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {vehicle.brand}
              </span>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {extra.specs.seats} • {extra.specs.transmission.split(' ')[0]}
              </span>
            </div>

            <h3
              onClick={() => setIsOpen(true)}
              className="text-lg font-extrabold text-slate-900 mt-1 hover:text-blue-600 cursor-pointer transition"
            >
              {vehicle.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('ทะเบียน:', 'Plate:')} {vehicle.license_plate}
            </p>
            <p className="text-xs text-slate-600 mt-2 line-clamp-2">
              {extra.description}
            </p>

            {activeBookings.length > 0 && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-800">
                  <CalendarClock className="w-3.5 h-3.5" />
                  {t(
                    `คิวที่ถูกจองแล้ว (${activeBookings.length} คิว):`,
                    `Booked Slots (${activeBookings.length}):`
                  )}
                </div>
                {activeBookings.slice(0, 2).map((b) => (
                  <div key={b.id} className="flex justify-between">
                    <span>
                      • {b.start_date} - {b.end_date}
                    </span>
                    <span className="font-semibold">
                      {b.status === 'confirmed'
                        ? t('ยืนยันแล้ว', 'Confirmed')
                        : t('รอตรวจสลิป', 'Pending')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">
                  {t('อัตราค่าเช่า', 'Rental Rate')}
                </span>
                <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-0.5">
                  {t(
                    `จองมัดจำ 30% (฿${Math.round(
                      Number(vehicle.price_per_day) * 0.3
                    ).toLocaleString()}/วัน)`,
                    `30% Deposit (฿${Math.round(
                      Number(vehicle.price_per_day) * 0.3
                    ).toLocaleString()}/day)`
                  )}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-blue-600">
                  ฿{Number(vehicle.price_per_day).toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">
                  {' '}
                  / {t('วัน', 'day')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                {t('รายละเอียด/รูปเพิ่ม', 'Details & Photos')}
              </button>

              <Link
                href={bookingHref}
                className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition shadow-xs"
              >
                {t('จองคันนี้', 'Book Now')}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase text-blue-600">
                  {vehicle.brand} •{' '}
                  {vehicle.type === 'car'
                    ? t('รถยนต์เช่า', 'Car Rental')
                    : t('มอเตอร์ไซค์เช่า', 'Motorcycle Rental')}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {vehicle.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-3">
                <div className="h-60 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                  <img
                    src={activeImage}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {extra.gallery.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                        activeImage === img
                          ? 'border-blue-600 ring-2 ring-blue-600/20'
                          : 'border-slate-200 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${vehicle.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 text-center">
                  {t(
                    'คลิกที่รูปขนาดย่อเพื่อดูมุมมองอื่นๆ ของรถ',
                    'Click thumbnails to switch camera angles'
                  )}
                </p>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {t('ทะเบียน:', 'License Plate:')} {vehicle.license_plate}
                      </span>
                      <span className="text-2xl font-extrabold text-blue-600">
                        ฿{Number(vehicle.price_per_day).toLocaleString()}
                        <span className="text-xs font-normal text-slate-500">
                          {' '}
                          / {t('วัน', 'day')}
                        </span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {extra.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {t('เครื่องยนต์', 'Engine')}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {extra.specs.engine}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cog className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {t('ระบบเกียร์', 'Transmission')}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {extra.specs.transmission}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {t('จำนวนที่นั่ง', 'Capacity')}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {extra.specs.seats}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {t('อัตราสิ้นเปลือง', 'Economy')}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {extra.specs.consumption}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-900">
                      {t(
                        'ออปชันและจุดเด่นของรถคันนี้:',
                        'Vehicle Highlights & Features:'
                      )}
                    </h4>
                    {extra.highlights.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-slate-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    {t('ปิดหน้าต่าง', 'Close')}
                  </button>
                  <Link
                    href={bookingHref}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition shadow-md"
                  >
                    <span>
                      {t('ดำเนินการจองรถคันนี้', 'Proceed to Book This Vehicle')}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
