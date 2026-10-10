'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  DRIVERENT_TABLES,
  ensureDriveRentProfile,
  isMissingTableError,
  packSlipUrlWithBookingMeta,
  updateUserProfile,
  uploadToDriveRentBucket,
} from '@/lib/supabase/tables';
import {
  calculateRentalPrice,
  checkVehicleAvailability,
} from '@/lib/bookings/availability';
import {
  alertError,
  alertSuccess,
  alertWarning,
  confirmAction,
} from '@/lib/swal';
import type { PaymentOption, Vehicle } from '@/types/database';
import {
  Calendar,
  Upload,
  CheckCircle2,
  Loader2,
  CreditCard,
  MapPin,
  ShieldCheck,
  Wallet,
  Plane,
  Clock,
} from 'lucide-react';

interface BookingFormProps {
  vehicle: Vehicle;
  initialStartDate?: string;
  initialEndDate?: string;
  userId: string;
}

const HATYAI_PICKUP_LOCATIONS = [
  {
    value: 'สนามบินนานาชาติหาดใหญ่ (Hat Yai Airport - ส่งรถฟรี)',
    title: '✈️ สนามบินนานาชาติหาดใหญ่ (HDY)',
    subtitle: 'รอรับหน้าประตูทางออกผู้โดยสารขาเข้า (ฟรี)',
  },
  {
    value: 'สำนักงานใหญ่ charickDriveRent ถ.กาญจนวนิช (ใกล้ ม.อ. หาดใหญ่)',
    title: '🏢 สำนักงานใหญ่ ถ.กาญจนวนิช',
    subtitle: 'ใกล้ ม.อ. หาดใหญ่ รับรถได้ทันที (ฟรี)',
  },
  {
    value: 'สถานีรถไฟชุมทางหาดใหญ่ / บขส. หาดใหญ่',
    title: '🚆 สถานีรถไฟหาดใหญ่ / บขส.',
    subtitle: 'ส่งมอบรถหน้าสถานีรถไฟหรือท่ารถตู้/บขส. (ฟรี)',
  },
  {
    value: 'เซ็นทรัลเฟสติวัล หาดใหญ่ / โรงแรมในตัวเมืองหาดใหญ่',
    title: '🏨 โรงแรมในตัวเมือง / เซ็นทรัล',
    subtitle: 'ระบุชื่อโรงแรมในเขตตัวเมืองหาดใหญ่ได้ด้านล่าง (ฟรี)',
  },
];

export default function BookingForm({
  vehicle,
  initialStartDate = '',
  initialEndDate = '',
  userId,
}: BookingFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(initialStartDate || today);
  const [endDate, setEndDate] = useState(initialEndDate || today);
  const [pickupLocation, setPickupLocation] = useState(
    HATYAI_PICKUP_LOCATIONS[0].value
  );
  const [pickupTime, setPickupTime] = useState('10:00 น.');
  const [flightOrNote, setFlightOrNote] = useState('');
  const [paymentOption, setPaymentOption] =
    useState<PaymentOption>('deposit_30');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // คำนวณจำนวนวัน, ราคารวม 100%, ยอดมัดจำ 30% และยอดคงเหลือจ่ายวันรับรถ 70%
  const { days, totalPrice, depositAmount, remainingAmount } = useMemo(
    () =>
      calculateRentalPrice(startDate, endDate, Number(vehicle.price_per_day)),
    [startDate, endDate, vehicle.price_per_day]
  );

  const amountToPayNow =
    paymentOption === 'deposit_30' ? depositAmount : totalPrice;
  const amountAtPickup =
    paymentOption === 'deposit_30' ? remainingAmount : 0;
  const securityDeposit = vehicle.type === 'car' ? 3000 : 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      await alertWarning(
        'กรุณาเลือกวันที่',
        'กรุณาเลือกวันรับรถและวันคืนรถให้ครบถ้วน'
      );
      return;
    }

    if (endDate < startDate) {
      await alertWarning(
        'วันที่ไม่ถูกต้อง',
        'วันคืนรถต้องไม่น้อยกว่าวันรับรถ'
      );
      return;
    }

    if (!slipFile) {
      await alertWarning(
        'กรุณาแนบสลิปโอนเงินมัดจำ',
        `กรุณาอัปโหลดรูปสลิปการโอนเงินยอด ฿${amountToPayNow.toLocaleString()} เพื่อล็อกคิวรถ`
      );
      return;
    }

    const confirmed = await confirmAction({
      title: 'ยืนยันการจองรถเช่าสาขาหาดใหญ่?',
      text: `${vehicle.brand} ${vehicle.name} (${startDate} ถึง ${endDate} • เวลารับรถ ${pickupTime}) • จุดรับรถ: ${pickupLocation} • โอนวันนี้ ฿${amountToPayNow.toLocaleString()} (${
        paymentOption === 'deposit_30'
          ? `มัดจำ 30% • ชำระวันรับรถอีก ฿${amountAtPickup.toLocaleString()}`
          : 'ชำระเต็มจำนวน 100%'
      })`,
      confirmText: 'ยืนยันการจองและส่งสลิป',
      cancelText: 'ตรวจสอบอีกครั้ง',
      icon: 'question',
    });

    if (!confirmed) return;

    try {
      setIsSubmitting(true);

      // 1. ตรวจสอบรหัสรถในฐานข้อมูล DriveRent_vehicles (พร้อม Fallback ไปยัง vehicles)
      let targetVehicleId = vehicle.id;
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (!uuidPattern.test(targetVehicleId)) {
        let existingRes = await supabase
          .from(DRIVERENT_TABLES.vehicles)
          .select('id')
          .eq('license_plate', vehicle.license_plate)
          .maybeSingle();

        let useLegacyTable = false;
        if (isMissingTableError(existingRes.error)) {
          useLegacyTable = true;
          existingRes = await supabase
            .from('vehicles')
            .select('id')
            .eq('license_plate', vehicle.license_plate)
            .maybeSingle();
        }

        if (existingRes.data?.id) {
          targetVehicleId = existingRes.data.id;
        } else {
          await updateUserProfile(supabase, userId, { role: 'admin' });

          const targetTable = useLegacyTable
            ? 'vehicles'
            : DRIVERENT_TABLES.vehicles;

          const { data: insertedVehicle, error: seedError } = await supabase
            .from(targetTable)
            .insert({
              name: vehicle.name,
              type: vehicle.type,
              brand: vehicle.brand,
              license_plate: vehicle.license_plate,
              price_per_day: vehicle.price_per_day,
              image_url: vehicle.image_url,
              status: 'available',
            })
            .select('id')
            .single();

          if (seedError || !insertedVehicle) {
            throw new Error(
              `ไม่สามารถซิงค์ข้อมูลรถเข้าฐานข้อมูลได้: ${seedError?.message}`
            );
          }
          targetVehicleId = insertedVehicle.id;
        }
      }

      // 2. เช็คว่ารถว่างในช่วงวันที่เลือกหรือไม่
      const isAvailable = await checkVehicleAvailability(
        supabase,
        targetVehicleId,
        startDate,
        endDate
      );

      if (!isAvailable) {
        await alertError(
          'คิวรถไม่ว่างในช่วงเวลานี้',
          'ขออภัย รถคันนี้ถูกจองในช่วงวันที่คุณเลือกแล้ว กรุณาเลือกช่วงวันอื่น'
        );
        setIsSubmitting(false);
        return;
      }

      // 3. ตรวจสอบให้แน่ใจว่าผู้ใช้ในโปรเจกต์ CharDB มีแถวในตาราง DriveRent_profiles แล้ว (กรณีสมัครมาจากเว็บอื่นใน CharDB)
      await ensureDriveRentProfile(supabase, {
        id: userId,
        email: undefined,
        user_metadata: {},
      });

      // 4. อัปโหลดไฟล์สลิปไปยัง Supabase Storage Bucket เฉพาะของ DriveRent ('DriveRent-payment-slips' พร้อม Fallback 'payment-slips')
      const fileExt = slipFile.name.split('.').pop();
      const filePath = `DriveRent/${userId}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}.${fileExt}`;

      let publicUrl = '';
      try {
        const uploadRes = await uploadToDriveRentBucket(
          supabase,
          'paymentSlips',
          filePath,
          slipFile
        );
        publicUrl = uploadRes.publicUrl;
      } catch (uploadErr) {
        throw new Error(
          `อัปโหลดสลิปไม่สำเร็จ: ${
            uploadErr instanceof Error ? uploadErr.message : 'Unknown error'
          }`
        );
      }

      // แนบข้อมูลสถานที่นัดรับรถ เวลารับรถ และเลขเที่ยวบิน/โรงแรม ลงใน URL สลิปเพื่อบันทึกลงฐานข้อมูล
      const packedSlipUrl = packSlipUrlWithBookingMeta(publicUrl, {
        pickup_location: pickupLocation,
        pickup_time: pickupTime,
        flight_or_note: flightOrNote.trim() || '-',
      });

      // 5. บันทึกข้อมูลการจองลงตาราง 'DriveRent_bookings' (พร้อม Fallback ไปยัง 'bookings')
      let insertRes = await supabase.from(DRIVERENT_TABLES.bookings).insert({
        user_id: userId,
        vehicle_id: targetVehicleId,
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice,
        deposit_amount: amountToPayNow,
        remaining_amount: amountAtPickup,
        payment_option: paymentOption,
        payment_slip_url: packedSlipUrl,
        status: 'pending',
      });

      if (isMissingTableError(insertRes.error)) {
        insertRes = await supabase.from('bookings').insert({
          user_id: userId,
          vehicle_id: targetVehicleId,
          start_date: startDate,
          end_date: endDate,
          total_price: totalPrice,
          payment_slip_url: packedSlipUrl,
          status: 'pending',
        });
      }

      if (insertRes.error) {
        throw new Error(`บันทึกการจองไม่สำเร็จ: ${insertRes.error.message}`);
      }

      await alertSuccess(
        'บันทึกการจองรถสำเร็จ!',
        `จอง ${vehicle.brand} ${vehicle.name} เรียบร้อย! สามารถเปิดดูและสั่งพิมพ์ "ใบยืนยันการจอง (Booking Voucher)" ได้ทันทีในหน้าประวัติการจองของคุณ`
      );

      router.push('/bookings?success=1');
      router.refresh();
    } catch (err) {
      await alertError(
        'เกิดข้อผิดพลาดในการจองรถ',
        err instanceof Error ? err.message : 'ไม่สามารถทำรายการได้ในขณะนี้'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 shadow-md p-6 space-y-6"
    >
      <div className="border-b border-slate-100 pb-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-1.5">
          <CreditCard className="w-3.5 h-3.5" />
          ระบบจองมาตรฐานจริง: มัดจำล่วงหน้าเพียง 30%
        </span>
        <h2 className="text-xl font-extrabold text-slate-900">
          รายละเอียดการจอง &amp; ชำระเงินมัดจำ 30% (สาขาหาดใหญ่)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          เลือกวันรับ-คืนรถ จุดรับรถในหาดใหญ่ และโอนมัดจำ 30% เพื่อล็อกคิวรถทันที
        </p>
      </div>

      {/* เลือกวันรับ-คืนรถ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              วันที่รับรถ (Start Date)
            </span>
          </label>
          <input
            type="date"
            required
            min={today}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (e.target.value > endDate) {
                setEndDate(e.target.value);
              }
            }}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              วันที่คืนรถ (End Date)
            </span>
          </label>
          <input
            type="date"
            required
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>
      </div>

      {/* เลือกจุดนัดรับ-ส่งรถในหาดใหญ่ สงขลา พร้อมเวลารับรถและเลขเที่ยวบิน */}
      <div className="space-y-3 p-4 rounded-2xl bg-slate-50/90 border border-slate-200">
        <label className="block text-sm font-bold text-slate-800">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-600" />
            เลือกจุดนัดรับ-คืนรถใน อ.หาดใหญ่ จ.สงขลา (บริการรับ-ส่งฟรี)
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {HATYAI_PICKUP_LOCATIONS.map((loc) => {
            const active = pickupLocation === loc.value;
            return (
              <button
                key={loc.value}
                type="button"
                onClick={() => setPickupLocation(loc.value)}
                className={`text-left p-3 rounded-xl border-2 transition cursor-pointer ${
                  active
                    ? 'border-blue-600 bg-blue-50/80 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-extrabold text-slate-900">
                  {loc.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {loc.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              เวลานัดรับรถโดยประมาณ
            </label>
            <select
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white focus:border-blue-600 focus:outline-none"
            >
              {[
                '07:00 น.',
                '08:00 น.',
                '09:00 น.',
                '10:00 น.',
                '11:00 น.',
                '12:00 น.',
                '13:00 น.',
                '14:00 น.',
                '15:00 น.',
                '16:00 น.',
                '17:00 น.',
                '18:00 น.',
                '19:00 น.',
                '20:00 น.',
                '21:00 น.',
                '22:00 น.',
              ].map((tVal) => (
                <option key={tVal} value={tVal}>
                  {tVal}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Plane className="w-3.5 h-3.5 text-blue-600" />
              เลขเที่ยวบิน / ชื่อโรงแรม / หมายเหตุ (ถ้ามี)
            </label>
            <input
              type="text"
              placeholder="เช่น เที่ยวบิน FD3102 หรือ โรงแรมบุรีศรีภู"
              value={flightOrNote}
              onChange={(e) => setFlightOrNote(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ตัวเลือกรูปแบบการชำระเงิน: มัดจำ 30% (แนะนำ) หรือ จ่ายเต็ม 100% */}
      <div className="space-y-2.5">
        <label className="block text-sm font-semibold text-slate-700">
          เลือกรูปแบบการชำระเงินออนไลน์
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentOption('deposit_30')}
            className={`text-left p-4 rounded-2xl border-2 transition cursor-pointer ${
              paymentOption === 'deposit_30'
                ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                ⭐ แนะนำ (ใช้จริงยอดนิยม)
              </span>
              <span className="text-base font-black text-blue-600">
                ฿{depositAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              จ่ายมัดจำล่วงหน้า 30%
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              โอนมัดจำวันนี้ 30% เพื่อล็อกคิวรถ • ส่วนที่เหลืออีก 70% (฿
              {remainingAmount.toLocaleString()}) จ่ายตอนมารับรถ
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPaymentOption('full_100')}
            className={`text-left p-4 rounded-2xl border-2 transition cursor-pointer ${
              paymentOption === 'full_100'
                ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                จ่ายเต็มจำนวน
              </span>
              <span className="text-base font-black text-slate-900">
                ฿{totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              ชำระเต็มจำนวน 100%
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              จ่ายค่าเช่าครบ 100% วันนี้ วันรับรถไม่ต้องจ่ายค่าเช่าเพิ่ม
            </p>
          </button>
        </div>
      </div>

      {/* สรุปการคำนวณราคาแบบแยกชัดเจน (100% / มัดจำ 30% / จ่ายวันรับรถ 70%) */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2.5">
        <div className="flex justify-between text-xs sm:text-sm text-slate-600">
          <span>อัตราค่าเช่า ({days} วัน × ฿{Number(vehicle.price_per_day).toLocaleString()})</span>
          <span className="font-semibold text-slate-900">
            ฿{totalPrice.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between text-xs sm:text-sm text-slate-600">
          <span>บริการรับ-ส่งรถ ({pickupLocation.split(' ')[0]})</span>
          <span className="font-bold text-emerald-600">ฟรี (฿0)</span>
        </div>

        <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
          <div>
            <span className="font-extrabold text-slate-900 block text-sm sm:text-base">
              ยอดที่ต้องโอนตอนนี้ ({paymentOption === 'deposit_30' ? 'มัดจำ 30%' : 'เต็มจำนวน 100%'})
            </span>
            <span className="text-[11px] text-slate-500">
              โอนตามยอดนี้และแนบสลิปด้านล่างเพื่อยืนยันล็อกคิวรถทันที
            </span>
          </div>
          <span className="text-2xl font-black text-blue-600">
            ฿{amountToPayNow.toLocaleString()}
          </span>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <Wallet className="w-4 h-4 text-amber-600 shrink-0" />
            <span>ยอดคงเหลือชำระในวันมารับรถ (70%):</span>
          </div>
          <span className="text-sm font-extrabold text-amber-800">
            ฿{amountAtPickup.toLocaleString()} บาท
          </span>
        </div>

        <div className="flex items-start gap-2 text-[11px] text-slate-500 pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            หมายเหตุ: ในวันรับรถจะมีเงินประกันตัวรถ ฿
            {securityDeposit.toLocaleString()} บาท (โอนคืนเต็มจำนวน 100%
            ทันทีเมื่อส่งคืนรถเรียบร้อย)
          </span>
        </div>
      </div>

      {/* ข้อมูลบัญชีและการอัปโหลดสลิป */}
      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-xs sm:text-sm text-slate-700 space-y-1">
          <p className="font-extrabold text-blue-950">
            🏦 ช่องทางการโอนเงินมัดจำ 30% (฿{amountToPayNow.toLocaleString()}):
          </p>
          <p>
            ธนาคารกสิกรไทย (KBANK):{' '}
            <strong className="text-blue-700 text-base">123-4-56789-0</strong>
          </p>
          <p>ชื่อบัญชี: บจก. ชาริค ไดร์ฟเรนท์ (สาขาหาดใหญ่)</p>
        </div>

        <label className="block text-sm font-semibold text-slate-700">
          อัปโหลดสลิปโอนเงินมัดจำ (JPG, PNG ไม่เกิน 5MB)
        </label>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 cursor-pointer transition bg-slate-50/50">
          <Upload className="w-8 h-8 text-blue-500 mb-2" />
          <span className="text-sm font-semibold text-slate-700">
            {slipFile
              ? slipFile.name
              : `คลิกเพื่อเลือกไฟล์รูปสลิปโอนเงิน (ยอด ฿${amountToPayNow.toLocaleString()})`}
          </span>
          <span className="text-xs text-slate-500 mt-1">
            อัปโหลดเข้าสู่ระบบ CharDB Storage (Bucket: payment-slips)
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || days <= 0}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold py-3.5 px-5 rounded-xl transition shadow-md cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            กำลังตรวจสอบคิวว่างและบันทึกการจอง...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            ยืนยันการจอง • โอนวันนี้ ฿{amountToPayNow.toLocaleString()} (
            {paymentOption === 'deposit_30' ? 'มัดจำ 30%' : 'จ่ายเต็ม 100%'})
          </>
        )}
      </button>
    </form>
  );
}
