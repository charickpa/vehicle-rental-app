'use client';

import { useLanguage } from '@/components/LanguageProvider';
import {
  ShieldCheck,
  Headphones,
  Sparkles,
  Gauge,
  MapPin,
  Gift,
  FileText,
  UserCheck,
  Fuel,
  Clock,
  Ban,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function RentalRulesAndBenefits() {
  const { t } = useLanguage();

  const benefits = [
    {
      badge: '01',
      icon: ShieldCheck,
      color: 'from-blue-500 to-cyan-400',
      tag: t('คุ้มครองสูงสุด', 'Full Protection'),
      title: t(
        'ฟรี! ประกันภัยชั้น 1 เชิงพาณิชย์ทุกคัน',
        'FREE Commercial 1st-Class Insurance'
      ),
      desc: t(
        'คุ้มครองอุบัติเหตุตลอดทริปการเดินทางในหาดใหญ่-สงขลาและภาคใต้ ขับขี่อุ่นใจไม่ต้องจ่ายค่าประกันเพิ่ม',
        'Full accident coverage throughout your trip in Hat Yai, Songkhla, and Southern Thailand at no extra cost.'
      ),
    },
    {
      badge: '02',
      icon: CreditCard,
      color: 'from-emerald-500 to-teal-400',
      tag: t('แบ่งจ่ายสบาย', 'Flexible Payment'),
      title: t(
        'จองจ่ายมัดจำเพียง 30% ที่เหลือจ่ายวันรับรถ',
        'Pay Only 30% Deposit • 70% at Pickup'
      ),
      desc: t(
        'ล็อกคิวรถคันโปรดได้ทันทีด้วยการโอนมัดจำเพียง 30% ส่วนที่เหลืออีก 70% ค่อยชำระเมื่อตรวจสอบและรับรถจริง',
        'Lock your vehicle immediately with just a 30% deposit. Pay the remaining 70% only when you inspect and pick up the vehicle.'
      ),
    },
    {
      badge: '03',
      icon: MapPin,
      color: 'from-amber-500 to-orange-400',
      tag: t('ส่งฟรีหาดใหญ่', 'Free Delivery'),
      title: t(
        'รับ-ส่งรถฟรี! สนามบินหาดใหญ่ & ตัวเมือง',
        'FREE Pickup & Drop-off at Hat Yai Airport'
      ),
      desc: t(
        'นัดรับ-คืนรถฟรีที่สนามบินนานาชาติหาดใหญ่ (HDY), ม.อ. หาดใหญ่, สถานีรถไฟหาดใหญ่ และโรงแรมในตัวเมือง',
        'Convenient free vehicle delivery at Hat Yai Airport (HDY), PSU Hat Yai, Train Station, and city hotels.'
      ),
    },
    {
      badge: '04',
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-400',
      tag: t('สะอาด ปลอดภัย', '25-Point Check'),
      title: t(
        'ตรวจเช็ค 25 จุด & อบโอโซนฆ่าเชื้อ',
        '25-Point Inspection & Ozone Sanitization'
      ),
      desc: t(
        'รถทุกคันผ่านการตรวจสภาพเครื่องยนต์ เบรก ยาง แบตเตอรี่ และอบโอโซนทำความสะอาดก่อนส่งมอบทุกครั้ง',
        'Every vehicle undergoes a rigorous 25-point mechanical check and cabin ozone sanitization before delivery.'
      ),
    },
    {
      badge: '05',
      icon: Gauge,
      color: 'from-rose-500 to-pink-400',
      tag: t('วิ่งไม่จำกัด', 'Unlimited KM'),
      title: t(
        'ไม่จำกัดระยะทางวิ่ง (Unlimited Mileage)',
        'Unlimited Mileage — Drive Freely'
      ),
      desc: t(
        'ขับเที่ยวทั่วหาดใหญ่ สงขลา พัทลุง สตูล ได้เต็มที่ ไม่คิดค่าบริการเพิ่มตามเลขไมล์',
        'Explore Hat Yai, Songkhla, and nearby provinces with zero mileage surcharges.'
      ),
    },
    {
      badge: '06',
      icon: Headphones,
      color: 'from-cyan-500 to-blue-500',
      tag: t('ดูแล 24 ชม.', '24/7 Assistance'),
      title: t(
        'ช่วยเหลือฉุกเฉิน 24 ชม. & ฟรีอุปกรณ์เสริม',
        '24/7 Roadside Support & Free Accessories'
      ),
      desc: t(
        'มีทีมช่างและรถสำรองสแตนด์บายดูแล 24 ชม. แถมฟรีหมวกกันน็อค มอก. 2 ใบ ที่จับมือถือ และน้ำดื่ม',
        '24/7 emergency support with replacement vehicles, plus 2 certified helmets, phone mount, and bottled water.'
      ),
    },
  ];

  const rules = [
    {
      icon: FileText,
      title: t(
        '1. เอกสารที่ใช้ในการรับรถ',
        '1. Required Documents for Pickup'
      ),
      desc: t(
        'บัตรประชาชนตัวจริง (หรือ Passport) และใบอนุญาตขับขี่รถยนต์/รถจักรยานยนต์ที่ยังไม่หมดอายุ',
        'Original National ID Card (or Passport) and a valid car/motorcycle driving license.'
      ),
    },
    {
      icon: CreditCard,
      title: t(
        '2. การชำระเงินมัดจำ 30% และส่วนที่เหลือ 70%',
        '2. 30% Booking Deposit & 70% Balance on Pickup'
      ),
      desc: t(
        'ชำระมัดจำ 30% ตอนจองผ่านเว็บเพื่อล็อกคิวรถ และชำระส่วนที่เหลืออีก 70% พร้อมเงินประกันตัวรถในวันรับรถ (ได้คืนทันทีเมื่อคืนรถ)',
        'Pay 30% deposit online to confirm your booking, and pay the remaining 70% plus refundable security deposit at vehicle pickup.'
      ),
    },
    {
      icon: UserCheck,
      title: t(
        '3. คุณสมบัติและเกณฑ์อายุผู้เช่า',
        '3. Renter Age & Qualifications'
      ),
      desc: t(
        'ผู้เช่าต้องมีอายุตั้งแต่ 20 ปีบริบูรณ์ขึ้นไป และมีใบอนุญาตขับขี่มาแล้วอย่างน้อย 1 ปี',
        'Renters must be at least 20 years old and hold a valid driver license for at least 1 year.'
      ),
    },
    {
      icon: Fuel,
      title: t(
        '4. นโยบายน้ำมันเชื้อเพลิง (Full-to-Full)',
        '4. Fuel Policy (Full-to-Full)'
      ),
      desc: t(
        'ทางร้านส่งมอบรถพร้อมน้ำมันเต็มถัง ลูกค้าเติมน้ำมันชนิดที่กำหนดคืนเต็มถังเมื่อนำรถมาส่งคืน',
        'Vehicles are delivered with a full tank of fuel and must be returned with a full tank.'
      ),
    },
    {
      icon: Clock,
      title: t(
        '5. การนับเวลาเช่าและการคืนรถล่าช้า',
        '5. Rental Duration & Late Return'
      ),
      desc: t(
        'เช่า 1 วัน = 24 ชั่วโมง ผ่อนผันคืนรถช้าได้ฟรี 1 ชั่วโมง (หากเกินคิดชั่วโมงละ 100-200 บาท เกิน 4 ชั่วโมงคิดเป็น 1 วัน)',
        '1 rental day = 24 hours with a 1-hour grace period (100-200 THB/hr after; over 4 hours counts as 1 extra day).'
      ),
    },
    {
      icon: Ban,
      title: t(
        '6. ข้อห้ามภายในตัวรถและขอบเขตการใช้งาน',
        '6. Vehicle Care & Prohibited Uses'
      ),
      desc: t(
        'ห้ามสูบบุหรี่ นำสัตว์เลี้ยง หรือของกลิ่นฉุนขึ้นรถ (ค่าปรับอบโอโซน 2,000 บาท) และห้ามนำรถไปใช้ผิดกฎหมาย',
        'No smoking, pets, or strong-smelling items inside the vehicle (2,000 THB cleaning fee). Illegal use is strictly prohibited.'
      ),
    },
  ];

  return (
    <div className="mt-14 space-y-12">
      {/* ส่วนที่ 1: สิทธิประโยชน์ที่คุณจะได้รับเมื่อเช่ารถกับ charickDriveRent (ดีไซน์ใหม่สุดพรีเมียม) */}
      <section className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-950 text-white">
        {/* รูปภาพพื้นหลังบรรยากาศรถหรูแบบจาง */}
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=80"
          alt="Benefits Background"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-blue-950/90 to-indigo-950/95" />
        <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-28 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          {/* ส่วนหัวเรื่อง */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-cyan-200 border border-cyan-400/30 mb-3">
                <Gift className="w-3.5 h-3.5 text-cyan-300" />
                <span>
                  {t(
                    'EXCLUSIVE PRIVILEGES • สาขาหาดใหญ่ จ.สงขลา',
                    'EXCLUSIVE PRIVILEGES • HAT YAI, SONGKHLA'
                  )}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                {t(
                  'สิทธิประโยชน์ที่คุณจะได้รับเมื่อเช่ารถกับ charickDriveRent',
                  'Exclusive Benefits When You Rent with charickDriveRent'
                )}
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                {t(
                  'ยกระดับประสบการณ์เช่ารถยนต์และมอเตอร์ไซค์ในหาดใหญ่ ด้วยมาตรฐานการดูแลระดับ VIP โปร่งใส จองง่ายด้วยมัดจำเพียง 30%',
                  'Elevate your car & motorcycle rental experience in Hat Yai with VIP care, transparent pricing, and easy 30% deposit booking.'
                )}
              </p>
            </div>

            {/* ป้ายสรุปขั้นตอนการจ่ายเงิน 30% / 70% */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-black text-sm">
                30%
              </div>
              <div className="text-xs">
                <div className="font-extrabold text-white">
                  {t(
                    'มาตรฐานการจองรถจริง (Real Standard)',
                    'Real Rental Standard'
                  )}
                </div>
                <div className="text-emerald-300 font-semibold flex items-center gap-1 mt-0.5">
                  <span>{t('มัดจำ 30% ตอนจอง', '30% Deposit Now')}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span>{t('จ่าย 70% วันรับรถ', '70% on Pickup')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* การ์ดสิทธิประโยชน์ 6 ช่อง ดีไซน์ใหม่แบบ Glassmorphism + แถบสีด้านบน */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-white/[0.07] hover:bg-white/[0.12] backdrop-blur-xl border border-white/15 hover:border-cyan-400/50 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-lg"
                >
                  {/* แถบไฟไล่เฉดสีด้านบนการ์ด */}
                  <div
                    className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${item.color} mb-5 group-hover:w-28 transition-all duration-300`}
                  />

                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-cyan-200 border border-white/15">
                        {item.tag}
                      </span>
                      <span className="text-xl font-black text-white/20 group-hover:text-white/40 transition">
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-cyan-200 transition">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {t(
                        'รวมในทุกแพ็กเกจเช่ารถแล้ว (ไม่มีค่าใช้จ่ายแอบแฝง)',
                        'Included with every rental (No hidden fees)'
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ส่วนที่ 2: กฎข้อบังคับและเงื่อนไขการเช่ารถ */}
      <section className="bg-white/95 backdrop-blur-md rounded-[2rem] border border-slate-200/90 p-6 sm:p-10 shadow-xl">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t('Rental Rules & Terms', 'Rental Rules & Terms')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t(
              'กฎข้อบังคับและเงื่อนไขการเช่ารถยนต์ / มอเตอร์ไซค์',
              'Vehicle Rental Rules & Terms of Service'
            )}
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            {t(
              'กรุณาศึกษารายละเอียดเอกสารและการชำระเงินมัดจำ 30% เพื่อความสะดวกรวดเร็วในการรับ-คืนรถที่สาขาหาดใหญ่',
              'Please review the required documents and 30% deposit terms for a smooth pickup and return in Hat Yai.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/30 transition shadow-2xs"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {rule.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {rule.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
