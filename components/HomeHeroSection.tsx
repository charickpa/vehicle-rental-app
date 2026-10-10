'use client';

import { useLanguage } from '@/components/LanguageProvider';
import BrandLogo from '@/components/BrandLogo';
import {
  ShieldCheck,
  Car,
  Bike,
  Sparkles,
  MapPin,
  CreditCard,
  Plane,
  CheckCircle2,
  ArrowDownRight,
  PhoneCall,
} from 'lucide-react';

interface HomeHeroSectionProps {
  carCount: number;
  motoCount: number;
  totalCount: number;
  startDate?: string;
  endDate?: string;
}

export default function HomeHeroSection({
  carCount,
  motoCount,
}: HomeHeroSectionProps) {
  const { t } = useLanguage();

  return (
    <div className="relative rounded-[2rem] overflow-hidden mb-8 shadow-2xl border border-white/20 bg-slate-950">
      {/* ภาพพื้นหลังรถยนต์และเส้นทางท่องเที่ยวระดับพรีเมียม */}
      <img
        src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=85"
        alt="charickDriveRent Hat Yai Luxury Fleet"
        className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform duration-700"
      />
      {/* เลเยอร์ไล่เฉดสีเพื่อให้ตัวอักษรคมชัดและดูหรูหรา */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-blue-950/65" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 text-white grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* ฝั่งซ้าย: โลโก้ ข้อความหลัก 2 ภาษา และปุ่มลัด */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <BrandLogo size="lg" lightText />
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-200 border border-amber-400/40 backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              {t(
                'สาขาหาดใหญ่ จ.สงขลา & สนามบินหาดใหญ่',
                'Hat Yai, Songkhla & Hat Yai Airport (HDY)'
              )}
            </span>
          </div>

          {/* แถบป้ายจุดเด่น 3 รายการ */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/25 text-blue-200 border border-blue-400/30 backdrop-blur-md">
              <CreditCard className="w-3.5 h-3.5 text-cyan-300" />
              {t(
                'จองจ่ายมัดจำเพียง 30% • ที่เหลือ 70% จ่ายวันรับรถ',
                'Pay Only 30% Deposit • Remaining 70% at Pickup'
              )}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              {t(
                'ฟรีประกันภัยชั้น 1 ทุกคัน',
                'Free 1st Class Insurance Included'
              )}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/25 text-indigo-200 border border-indigo-400/30 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              {t('เช็คคิวว่างเรียลไทม์ 100%', '100% Real-time Availability')}
            </span>
          </div>

          {/* หัวข้อหลักและคำอธิบาย รองรับการสลับภาษา EN/TH สมบูรณ์ */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
              {t(
                'เช่ารถยนต์และมอเตอร์ไซค์ พร้อมออกเดินทางทันที',
                'Rent Cars & Motorcycles — Ready for Your Journey Immediately'
              )}
            </h1>
            <p className="text-slate-200/95 text-sm sm:text-base leading-relaxed max-w-2xl">
              {t(
                'บริการเช่ารถคุณภาพโดย charickDriveRent (สาขาหาดใหญ่ จ.สงขลา) คลังรถยนต์ 10 รุ่น และมอเตอร์ไซค์ 10 รุ่น คลิกที่การ์ดรถเพื่อดูรูปเพิ่มเติมหลายมุมมองและสเปกโดยละเอียดได้เลย',
                'Premium vehicle rental service by charickDriveRent (Hat Yai, Songkhla). Explore 10 car models and 10 motorcycle models — click any vehicle card to view multi-angle photos and full specifications.'
              )}
            </p>
          </div>

          {/* ปุ่มสถิติจำนวนรถและปุ่มลัด */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#fleet-section"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold shadow-lg shadow-blue-600/30 transition hover:scale-[1.02]"
            >
              <span>
                {t(
                  'เลือกรถและเช็ควันว่างทันที',
                  'Browse Fleet & Check Availability'
                )}
              </span>
              <ArrowDownRight className="w-4 h-4" />
            </a>

            <a
              href="#contact-section"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition"
            >
              <PhoneCall className="w-4 h-4 text-emerald-300" />
              <span>
                {t('ติดต่อสาขาหาดใหญ่', 'Contact Hat Yai Branch')}
              </span>
            </a>
          </div>
        </div>

        {/* ฝั่งขวา: การ์ดสรุปจุดเด่นแบบ Glassmorphism สุดพรีเมียม */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-500/30 border border-blue-400/30 flex items-center justify-center mb-3">
              <Car className="w-5 h-5 text-blue-300" />
            </div>
            <div className="text-2xl font-black text-white">
              {carCount} {t('คัน', 'Cars')}
            </div>
            <div className="text-xs font-bold text-blue-200 mt-0.5">
              {t('รถยนต์พร้อมเช่า', 'Available Cars')}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              {t(
                'อีโคคาร์ ซีดาน SUV และรถยุโรป ตรวจเช็ค 25 จุด',
                'Eco, Sedan, SUV & Luxury models inspected 25 points'
              )}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/30 border border-amber-400/30 flex items-center justify-center mb-3">
              <Bike className="w-5 h-5 text-amber-300" />
            </div>
            <div className="text-2xl font-black text-white">
              {motoCount} {t('คัน', 'Bikes')}
            </div>
            <div className="text-xs font-bold text-amber-200 mt-0.5">
              {t('มอเตอร์ไซค์พร้อมเช่า', 'Available Motorcycles')}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              {t(
                'ออโตเมติก ทัวริ่ง และบิ๊กไบค์ ฟรีหมวกกันน็อค 2 ใบ',
                'Automatic, Touring & Big Bikes with 2 free helmets'
              )}
            </p>
          </div>

          <div className="sm:col-span-2 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-indigo-500/20 backdrop-blur-xl border border-emerald-400/35 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-200 flex items-center justify-center shrink-0">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>
                    {t(
                      'ระบบจองมาตรฐานจริง: จ่ายมัดจำล่วงหน้าเพียง 30%',
                      'Standard Booking: Pay Only 30% Deposit Today'
                    )}
                  </span>
                </h3>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  {t(
                    'โอนมัดจำ 30% เพื่อล็อกคิวรถทันที ส่วนที่เหลืออีก 70% ชำระตอนรับรถที่สนามบินหาดใหญ่หรือสาขาหาดใหญ่ได้เลย!',
                    'Transfer 30% deposit to lock your vehicle right away. Pay the remaining 70% when you pick up the vehicle at Hat Yai Airport or our branch!'
                  )}
                </p>
                <div className="flex flex-wrap gap-3 mt-2.5 text-[11px] font-bold text-emerald-300">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('รับ-ส่งฟรีสนามบินหาดใหญ่', 'Free Hat Yai Airport Pickup')}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('ไม่จำกัดเลขไมล์', 'Unlimited Mileage')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
