import type { SupabaseClient } from '@supabase/supabase-js';
import type { Booking, Vehicle, VehicleType } from '@/types/database';
import { SAMPLE_VEHICLES_CATALOG } from '@/lib/vehicles/catalog';
import {
  DRIVERENT_TABLES,
  isMissingTableError,
  normalizeBookingRecord,
} from '@/lib/supabase/tables';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * ตรวจสอบว่ารถคันที่เลือกว่างในช่วงวันที่ startDate ถึง endDate หรือไม่
 * รองรับตาราง DriveRent_bookings ในโปรเจกต์ CharDB (พร้อม Fallback อัตโนมัติ)
 */
export async function checkVehicleAvailability(
  supabase: SupabaseClient,
  vehicleId: string,
  startDate: string,
  endDate: string
): Promise<boolean> {
  if (!isUuid(vehicleId)) {
    return true;
  }

  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    'driverent_check_vehicle_availability',
    {
      p_vehicle_id: vehicleId,
      p_start_date: startDate,
      p_end_date: endDate,
    }
  );

  if (!rpcError && typeof rpcResult === 'boolean') {
    return rpcResult;
  }

  let res = await supabase
    .from(DRIVERENT_TABLES.bookings)
    .select('id', { count: 'exact', head: true })
    .eq('vehicle_id', vehicleId)
    .in('status', ['pending', 'confirmed'])
    .lte('start_date', endDate)
    .gte('end_date', startDate);

  if (isMissingTableError(res.error)) {
    res = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('vehicle_id', vehicleId)
      .in('status', ['pending', 'confirmed'])
      .lte('start_date', endDate)
      .gte('end_date', startDate);
  }

  if (res.error) {
    throw new Error(`ไม่สามารถตรวจสอบวันว่างได้: ${res.error.message}`);
  }

  return (res.count ?? 0) === 0;
}

/**
 * ดึงรายการรถทั้งหมดจากตาราง DriveRent_vehicles ในโปรเจกต์ CharDB
 * รวมกับรถตัวอย่างให้ครบ รถยนต์ 10 คัน และมอเตอร์ไซค์ 10 คัน
 */
export async function getAvailableVehicles(
  supabase: SupabaseClient,
  options?: {
    type?: VehicleType | 'all';
    startDate?: string;
    endDate?: string;
  }
): Promise<Vehicle[]> {
  let vehicleRes = await supabase
    .from(DRIVERENT_TABLES.vehicles)
    .select('*')
    .neq('status', 'maintenance')
    .order('created_at', { ascending: true });

  if (isMissingTableError(vehicleRes.error)) {
    vehicleRes = await supabase
      .from('vehicles')
      .select('*')
      .neq('status', 'maintenance')
      .order('created_at', { ascending: true });
  }

  if (vehicleRes.error) {
    throw new Error(`ดึงข้อมูลรถไม่สำเร็จ: ${vehicleRes.error.message}`);
  }

  const dbVehicles = (vehicleRes.data ?? []) as Vehicle[];
  const existingPlates = new Set(
    dbVehicles.map((v: Vehicle) => v.license_plate.trim().toLowerCase())
  );
  const existingNames = new Set(
    dbVehicles.map((v: Vehicle) => v.name.trim().toLowerCase())
  );

  // หากในฐานข้อมูล DriveRent_vehicles มีข้อมูลรถครบตั้งแต่ 15 คันขึ้นไปแล้ว ให้ยึดข้อมูลจริงจากฐานข้อมูลที่แอดมินจัดการเป็นหลัก
  const mergedVehicles: Vehicle[] =
    dbVehicles.length >= 15
      ? dbVehicles
      : [
          ...dbVehicles,
          ...SAMPLE_VEHICLES_CATALOG.filter(
            (sample) =>
              !existingPlates.has(sample.license_plate.trim().toLowerCase()) &&
              !existingNames.has(sample.name.trim().toLowerCase())
          ).map(({ details: _details, ...vehicleData }) => vehicleData),
        ];

  const filteredByType =
    options?.type && options.type !== 'all'
      ? mergedVehicles.filter((v) => v.type === options.type)
      : mergedVehicles;

  if (options?.startDate && options?.endDate) {
    let overlapRes = await supabase
      .from(DRIVERENT_TABLES.bookings)
      .select('vehicle_id')
      .in('status', ['pending', 'confirmed'])
      .lte('start_date', options.endDate)
      .gte('end_date', options.startDate);

    if (isMissingTableError(overlapRes.error)) {
      overlapRes = await supabase
        .from('bookings')
        .select('vehicle_id')
        .in('status', ['pending', 'confirmed'])
        .lte('start_date', options.endDate)
        .gte('end_date', options.startDate);
    }

    if (!overlapRes.error && overlapRes.data) {
      const busyVehicleIds = new Set(
        overlapRes.data.map((b: { vehicle_id: string }) => b.vehicle_id)
      );
      return filteredByType.filter((v) => !busyVehicleIds.has(v.id));
    }
  }

  return filteredByType;
}

/**
 * ดึงรายการวัน-เวลาและรถที่ถูกจองแล้วทั้งหมดจากตาราง DriveRent_bookings
 */
export async function getBookedSchedule(
  supabase: SupabaseClient
): Promise<Booking[]> {
  const res = await supabase
    .from(DRIVERENT_TABLES.bookings)
    .select(`*, ${DRIVERENT_TABLES.vehicles}(*)`)
    .in('status', ['pending', 'confirmed', 'completed'])
    .order('start_date', { ascending: true });

  if (!isMissingTableError(res.error) && res.data) {
    return (res.data as Record<string, unknown>[]).map(normalizeBookingRecord);
  }

  const fallbackRes = await supabase
    .from('bookings')
    .select('*, vehicles(*)')
    .in('status', ['pending', 'confirmed', 'completed'])
    .order('start_date', { ascending: true });

  if (fallbackRes.error || !fallbackRes.data) {
    return [];
  }

  return (fallbackRes.data as Record<string, unknown>[]).map(
    normalizeBookingRecord
  );
}

/**
 * คำนวณจำนวนวันเช่า, ราคารวม 100%, ยอดมัดจำล่วงหน้า 30% (จ่ายตอนจอง),
 * และยอดคงเหลือ 70% (จ่ายวันมารับรถ)
 */
export function calculateRentalPrice(
  startDate: string,
  endDate: string,
  pricePerDay: number
): {
  days: number;
  totalPrice: number;
  depositAmount: number;
  remainingAmount: number;
} {
  if (!startDate || !endDate) {
    return {
      days: 0,
      totalPrice: 0,
      depositAmount: 0,
      remainingAmount: 0,
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: 0,
      totalPrice: 0,
      depositAmount: 0,
      remainingAmount: 0,
    };
  }

  const rentalDays = diffDays === 0 ? 1 : diffDays;
  const totalPrice = rentalDays * pricePerDay;
  // จ่ายมัดจำล็อกคิวรถก่อน 30% และจ่ายส่วนที่เหลือ 70% ตอนมารับรถ
  const depositAmount = Math.round(totalPrice * 0.3);
  const remainingAmount = Math.max(0, totalPrice - depositAmount);

  return {
    days: rentalDays,
    totalPrice,
    depositAmount,
    remainingAmount,
  };
}
