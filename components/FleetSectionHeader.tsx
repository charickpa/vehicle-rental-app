'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { CarFront, CalendarCheck2 } from 'lucide-react';

interface FleetSectionHeaderProps {
  totalVehicles: number;
  startDate?: string;
  endDate?: string;
}

export default function FleetSectionHeader({
  totalVehicles,
  startDate,
  endDate,
}: FleetSectionHeaderProps) {
  const { t } = useLanguage();

  return (
    <div
      id="fleet-section"
      className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white/90 backdrop-blur-md px-5 py-4 rounded-2xl border border-slate-200/90 shadow-xs scroll-mt-20"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
          <CarFront className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            {t(
              `รายการรถที่พร้อมให้บริการสาขาหาดใหญ่ (${totalVehicles} คัน)`,
              `Available Fleet in Hat Yai (${totalVehicles} Vehicles)`
            )}
          </h2>
          <p className="text-xs text-slate-600">
            {t(
              'คลิกที่รูปภาพหรือปุ่ม "รายละเอียด/รูปเพิ่ม" เพื่อดูรูป 4 มุมมองและสเปก • จองจ่ายมัดจำเพียง 30%',
              'Click any photo or "Details / Photos" for 4-angle gallery & specs • Book with only 30% deposit'
            )}
          </p>
        </div>
      </div>

      {startDate && endDate ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-full">
          <CalendarCheck2 className="w-3.5 h-3.5" />
          {t(
            `ว่างช่วงวันที่ ${startDate} ถึง ${endDate}`,
            `Available from ${startDate} to ${endDate}`
          )}
        </span>
      ) : (
        <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1.5 rounded-full">
          {t(
            '💳 จองออนไลน์จ่ายก่อน 30% • ที่เหลือ 70% จ่ายวันรับรถ',
            '💳 Pay 30% Deposit Online • 70% on Pickup'
          )}
        </span>
      )}
    </div>
  );
}
