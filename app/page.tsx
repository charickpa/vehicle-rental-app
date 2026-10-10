import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { fetchUserProfile } from '@/lib/supabase/tables';
import {
  getAvailableVehicles,
  getBookedSchedule,
} from '@/lib/bookings/availability';
import HomeHeroSection from '@/components/HomeHeroSection';
import FleetSectionHeader from '@/components/FleetSectionHeader';
import VehicleSearchFilter from '@/components/VehicleSearchFilter';
import VehicleCardWithModal from '@/components/VehicleCardWithModal';
import BookedScheduleSection from '@/components/BookedScheduleSection';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import RentalRulesAndBenefits from '@/components/RentalRulesAndBenefits';
import CompanyContactAndMap from '@/components/CompanyContactAndMap';
import type { Profile, VehicleType } from '@/types/database';

interface HomePageProps {
  searchParams: Promise<{
    type?: string;
    start?: string;
    end?: string;
  }>;
}

export default async function VehicleListingPage({
  searchParams,
}: HomePageProps) {
  const params = await searchParams;
  const selectedType = (params.type as VehicleType | 'all') || 'all';
  const startDate = params.start || '';
  const endDate = params.end || '';

  const supabase = await createClient();

  const [
    vehicles,
    bookedSchedule,
    {
      data: { user },
    },
  ] = await Promise.all([
    getAvailableVehicles(supabase, {
      type: selectedType,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    getBookedSchedule(supabase),
    supabase.auth.getUser(),
  ]);

  let isAdmin = false;
  if (user) {
    const { data: profile } = await fetchUserProfile(supabase, user.id);
    isAdmin = (profile as Profile | null)?.role === 'admin';
  }

  const carCount = vehicles.filter((v) => v.type === 'car').length;
  const motoCount = vehicles.filter((v) => v.type === 'motorcycle').length;

  const bookingQuery = new URLSearchParams();
  if (startDate) bookingQuery.set('start', startDate);
  if (endDate) bookingQuery.set('end', endDate);
  const queryString = bookingQuery.toString();

  return (
    <div>
      {/* Hero Banner ดีไซน์ใหม่ รองรับการสลับภาษา EN/TH เต็มรูปแบบ */}
      <HomeHeroSection
        carCount={carCount}
        motoCount={motoCount}
        totalCount={vehicles.length}
        startDate={startDate}
        endDate={endDate}
      />

      {/* ตัวกรองประเภทรถ และช่วงวันที่เช่า */}
      <Suspense
        fallback={
          <div className="h-28 rounded-2xl bg-slate-200 animate-pulse mb-8" />
        }
      >
        <VehicleSearchFilter />
      </Suspense>

      {/* แถบสรุปผลการค้นหา รองรับการสลับภาษา EN/TH */}
      <FleetSectionHeader
        totalVehicles={vehicles.length}
        startDate={startDate}
        endDate={endDate}
      />

      {/* แสดงรายการรถ (Vehicle Grid) */}
      {vehicles.length === 0 ? (
        <div className="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-600 font-medium">
            ไม่พบรถว่างตามเงื่อนไขหรือช่วงวันที่คุณเลือก (No available vehicles found)
          </p>
          <p className="text-xs text-slate-400 mt-1">
            ลองเปลี่ยนช่วงวันที่รับ-คืนรถ หรือเลือกดูรถทุกประเภท
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            const thisVehicleBookings = bookedSchedule.filter(
              (b) =>
                b.vehicle_id === vehicle.id ||
                b.vehicles?.license_plate === vehicle.license_plate
            );

            return (
              <VehicleCardWithModal
                key={vehicle.id}
                vehicle={vehicle}
                bookingQueryString={queryString}
                vehicleBookings={thisVehicleBookings}
              />
            );
          })}
        </div>
      )}

      {/* 1. ตารางวัน-เวลาและรถที่ถูกจองแล้ว */}
      <BookedScheduleSection bookings={bookedSchedule} />

      {/* 2. รีวิวความประทับใจจากลูกค้า (Admin สามารถเพิ่มรีวิวได้) */}
      <CustomerReviewsSection isAdmin={isAdmin} />

      {/* 3. สิทธิประโยชน์ที่จะได้รับเมื่อเช่า (UI ใหม่) และกฎข้อบังคับในการเช่า */}
      <RentalRulesAndBenefits />

      {/* 4. รายละเอียดติดต่อเรา (หาดใหญ่ สงขลา) และแผนที่ที่อยู่บริษัท */}
      <CompanyContactAndMap />
    </div>
  );
}
