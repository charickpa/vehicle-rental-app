import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DRIVERENT_TABLES, isMissingTableError } from '@/lib/supabase/tables';
import BookingForm from '@/components/BookingForm';
import { isUuid } from '@/lib/bookings/availability';
import {
  SAMPLE_VEHICLES_CATALOG,
  getVehicleExtraDetails,
} from '@/lib/vehicles/catalog';
import type { Vehicle } from '@/types/database';
import {
  ArrowLeft,
  Car,
  Bike,
  CreditCard,
  CheckCircle2,
  Gauge,
  Fuel,
  Users,
  Cog,
} from 'lucide-react';

interface BookVehiclePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ start?: string; end?: string }>;
}

export default async function BookVehiclePage({
  params,
  searchParams,
}: BookVehiclePageProps) {
  const { id } = await params;
  const { start, end } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/book/${id}`);
  }

  let typedVehicle: Vehicle | null = null;

  if (isUuid(id)) {
    let res = await supabase
      .from(DRIVERENT_TABLES.vehicles)
      .select('*')
      .eq('id', id)
      .single();

    if (isMissingTableError(res.error)) {
      res = await supabase.from('vehicles').select('*').eq('id', id).single();
    }

    if (res.data) {
      typedVehicle = res.data as Vehicle;
    }
  } else {
    const sample = SAMPLE_VEHICLES_CATALOG.find((item) => item.id === id);
    if (sample) {
      let existingRes = await supabase
        .from(DRIVERENT_TABLES.vehicles)
        .select('*')
        .eq('license_plate', sample.license_plate)
        .maybeSingle();

      if (isMissingTableError(existingRes.error)) {
        existingRes = await supabase
          .from('vehicles')
          .select('*')
          .eq('license_plate', sample.license_plate)
          .maybeSingle();
      }

      if (existingRes.data) {
        typedVehicle = existingRes.data as Vehicle;
      } else {
        const { details: _details, ...rest } = sample;
        typedVehicle = rest;
      }
    }
  }

  if (!typedVehicle) {
    notFound();
  }

  const extra = getVehicleExtraDetails(typedVehicle);

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 mb-6 transition bg-white/90 backdrop-blur px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        กลับไปหน้ารายการรถเช่า (สาขาหาดใหญ่)
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ข้อมูลรถและรูปภาพเพิ่มเติม */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur rounded-2xl border border-slate-200 overflow-hidden shadow-md h-fit">
          <div className="h-52 bg-slate-100 relative">
            {typedVehicle.image_url ? (
              <img
                src={typedVehicle.image_url}
                alt={typedVehicle.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                ไม่มีรูปภาพ
              </div>
            )}
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white">
              {typedVehicle.type === 'car' ? (
                <>
                  <Car className="w-3.5 h-3.5" /> รถยนต์
                </>
              ) : (
                <>
                  <Bike className="w-3.5 h-3.5" /> มอเตอร์ไซค์
                </>
              )}
            </span>
          </div>

          {/* รูปตัวอย่างมุมอื่นๆ */}
          <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-50 border-b border-slate-100">
            {extra.gallery.map((imgUrl, idx) => (
              <a
                key={idx}
                href={imgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-14 rounded-lg overflow-hidden border border-slate-200 hover:opacity-90 transition"
              >
                <img
                  src={imgUrl}
                  alt={`${typedVehicle.name} view ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>

          <div className="p-5 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase text-blue-600">
                {typedVehicle.brand}
              </span>
              <h1 className="text-xl font-bold text-slate-900">
                {typedVehicle.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                ป้ายทะเบียน: {typedVehicle.license_plate}
              </p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {extra.description}
              </p>
            </div>

            {/* สเปกรถ */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Gauge className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{extra.specs.engine}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Cog className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{extra.specs.transmission}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{extra.specs.seats}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Fuel className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{extra.specs.fuel}</span>
              </div>
            </div>

            {/* จุดเด่น */}
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-800">จุดเด่นของรถคันนี้:</p>
              {extra.highlights.map((hl, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-xs text-slate-600"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <CreditCard className="w-4 h-4 text-slate-400" />
                อัตราค่าเช่า
              </span>
              <span className="text-lg font-extrabold text-blue-600">
                ฿{Number(typedVehicle.price_per_day).toLocaleString()} / วัน
              </span>
            </div>
          </div>
        </div>

        {/* ฟอร์มจองรถและอัปโหลดสลิปมัดจำ 30% */}
        <div className="lg:col-span-3">
          <BookingForm
            vehicle={typedVehicle}
            initialStartDate={start}
            initialEndDate={end}
            userId={user.id}
          />
        </div>
      </div>
    </div>
  );
}
