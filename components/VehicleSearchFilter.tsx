'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { Car, Bike, Calendar, Search, RotateCcw } from 'lucide-react';
import type { VehicleType } from '@/types/database';

export default function VehicleSearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [type, setType] = useState<VehicleType | 'all'>(
    (searchParams.get('type') as VehicleType) || 'all'
  );
  const [startDate, setStartDate] = useState(searchParams.get('start') || '');
  const [endDate, setEndDate] = useState(searchParams.get('end') || '');

  const today = new Date().toISOString().split('T')[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    router.push(`/?${params.toString()}`);
  };

  const handleReset = () => {
    setType('all');
    setStartDate('');
    setEndDate('');
    router.push('/');
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white/95 backdrop-blur rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* เลือกประเภทรถ */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('ประเภทรถเช่า', 'Vehicle Type')}
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('all')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                type === 'all'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('ทั้งหมด', 'All')}
            </button>
            <button
              type="button"
              onClick={() => setType('car')}
              className={`flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                type === 'car'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              {t('รถยนต์', 'Cars')}
            </button>
            <button
              type="button"
              onClick={() => setType('motorcycle')}
              className={`flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                type === 'motorcycle'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              {t('มอเตอร์ไซค์', 'Bikes')}
            </button>
          </div>
        </div>

        {/* วันที่รับรถ */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              {t('วันที่รับรถ (Start Date)', 'Pickup Date')}
            </span>
          </label>
          <input
            type="date"
            min={today}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (endDate && e.target.value > endDate) {
                setEndDate(e.target.value);
              }
            }}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        {/* วันที่คืนรถ */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              {t('วันที่คืนรถ (End Date)', 'Return Date')}
            </span>
          </label>
          <input
            type="date"
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        {/* ปุ่มค้นหาและล้างค่า */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition shadow-sm cursor-pointer"
          >
            <Search className="w-4 h-4" />
            {t('ค้นหารถว่าง', 'Search Available')}
          </button>
          <button
            type="button"
            onClick={handleReset}
            title={t('ล้างตัวกรอง', 'Reset Filter')}
            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
