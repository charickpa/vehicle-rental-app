'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  DRIVERENT_TABLES,
  isMissingTableError,
  uploadToDriveRentBucket,
} from '@/lib/supabase/tables';
import { alertError, alertSuccess, confirmAction, Toast } from '@/lib/swal';
import {
  getVehicleExtraDetails,
  packImageUrlWithDetails,
  saveCustomVehicleDetails,
  stripVehicleMetaFromUrl,
  type VehicleExtraDetails,
} from '@/lib/vehicles/catalog';
import type { Vehicle, VehicleStatus, VehicleType } from '@/types/database';
import {
  PlusCircle,
  Upload,
  Car,
  Bike,
  Trash2,
  Loader2,
  Images,
  FileText,
  Cog,
  Pencil,
  XCircle,
  CheckCircle2,
  Search,
} from 'lucide-react';

export default function AdminVehicleManager({
  initialVehicles,
}: {
  initialVehicles: Vehicle[];
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const formTopRef = useRef<HTMLFormElement | null>(null);

  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | VehicleType>('all');

  // รหัสรถที่กำลังแก้ไข (ถ้าเป็น null คือโหมดเพิ่มรถใหม่)
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  // ข้อมูลหลักของรถ
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [type, setType] = useState<VehicleType>('car');
  const [licensePlate, setLicensePlate] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [status, setStatus] = useState<VehicleStatus>('available');

  // ข้อมูลรายละเอียดและสเปกรถครบทุกช่อง
  const [description, setDescription] = useState('');
  const [engine, setEngine] = useState('');
  const [transmission, setTransmission] = useState('อัตโนมัติ (Automatic)');
  const [seats, setSeats] = useState('5 ที่นั่ง');
  const [fuel, setFuel] = useState('เบนซิน / แก๊สโซฮอล์ E20');
  const [consumption, setConsumption] = useState('22 กม./ลิตร');
  const [highlightsText, setHighlightsText] = useState(
    'กล้องมองรอบคัน 360 องศา, รองรับ Apple CarPlay, ฟรีประกันภัยชั้น 1, ตรวจเช็คสภาพ 25 จุด'
  );

  // รูปภาพหลัก + รูปภาพเพิ่มเติม (Gallery สูงสุด 4 มุมมอง)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setVehicles(initialVehicles);
  }, [initialVehicles]);

  const resetFormToDefault = () => {
    setEditingVehicleId(null);
    setName('');
    setBrand('');
    setType('car');
    setLicensePlate('');
    setPricePerDay('');
    setStatus('available');
    setDescription('');
    setEngine('');
    setTransmission('อัตโนมัติ (Automatic)');
    setSeats('5 ที่นั่ง');
    setFuel('เบนซิน / แก๊สโซฮอล์ E20');
    setConsumption('22 กม./ลิตร');
    setHighlightsText(
      'กล้องมองรอบคัน 360 องศา, รองรับ Apple CarPlay, ฟรีประกันภัยชั้น 1, ตรวจเช็คสภาพ 25 จุด'
    );
    setImageFiles([]);
    setGalleryUrls(['', '', '', '']);
  };

  // เมื่อคลิกปุ่ม "แก้ไขรายละเอียด" ของรถคันใดคันหนึ่งจาก 24 คัน
  const handleStartEditVehicle = (vehicle: Vehicle) => {
    const extra = getVehicleExtraDetails(vehicle);
    const cleanGallery = (extra.gallery || []).map((u) =>
      stripVehicleMetaFromUrl(u)
    );
    const cleanMain = stripVehicleMetaFromUrl(vehicle.image_url);

    const fourUrls = [
      cleanGallery[0] || cleanMain || '',
      cleanGallery[1] || '',
      cleanGallery[2] || '',
      cleanGallery[3] || '',
    ];

    setEditingVehicleId(vehicle.id);
    setName(vehicle.name);
    setBrand(vehicle.brand);
    setType(vehicle.type);
    setLicensePlate(vehicle.license_plate);
    setPricePerDay(String(vehicle.price_per_day));
    setStatus(vehicle.status);

    setEngine(extra.specs.engine || '');
    setTransmission(extra.specs.transmission || 'อัตโนมัติ (Automatic)');
    setSeats(
      extra.specs.seats || (vehicle.type === 'car' ? '5 ที่นั่ง' : '2 ที่นั่ง')
    );
    setFuel(extra.specs.fuel || 'เบนซิน / แก๊สโซฮอล์ E20');
    setConsumption(
      extra.specs.consumption ||
        (vehicle.type === 'car' ? '22 กม./ลิตร' : '45 กม./ลิตร')
    );
    setDescription(extra.description || '');
    setHighlightsText((extra.highlights || []).join(', '));
    setImageFiles([]);
    setGalleryUrls(fourUrls);

    setTimeout(() => {
      formTopRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  };

  const handleTypeSelect = (newType: VehicleType) => {
    setType(newType);
    // เปลี่ยนค่าเริ่มต้นเฉพาะตอนเพิ่มรถใหม่ (ไม่ทับค่าเดิมตอนกำลังแก้ไข)
    if (!editingVehicleId) {
      if (newType === 'motorcycle') {
        setSeats('2 ที่นั่ง');
        setConsumption('45 กม./ลิตร');
        setHighlightsText(
          'ระบบเบรก ABS, กุญแจรีโมท Smart Key, ฟรีหมวกกันน็อค มอก. 2 ใบ, ช่องชาร์จมือถือ USB'
        );
      } else {
        setSeats('5 ที่นั่ง');
        setConsumption('22 กม./ลิตร');
        setHighlightsText(
          'กล้องมองรอบคัน 360 องศา, รองรับ Apple CarPlay, ฟรีประกันภัยชั้น 1, ตรวจเช็คสภาพ 25 จุด'
        );
      }
    }
  };

  const handleGalleryUrlChange = (idx: number, val: string) => {
    setGalleryUrls((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleSubmitVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedUrls: string[] = [];

      // 1. อัปโหลดไฟล์รูปภาพใหม่ที่เลือกเข้าสู่ Supabase Storage Bucket ('DriveRent-vehicles' พร้อม Fallback 'vehicles')
      for (const file of imageFiles.slice(0, 4)) {
        const fileExt = file.name.split('.').pop();
        const filePath = `DriveRent/fleet/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}.${fileExt}`;

        try {
          const { publicUrl } = await uploadToDriveRentBucket(
            supabase,
            'vehicles',
            filePath,
            file
          );
          uploadedUrls.push(publicUrl);
        } catch (uploadErr) {
          throw new Error(
            `อัปโหลดรูปรถไม่สำเร็จ: ${
              uploadErr instanceof Error ? uploadErr.message : 'Unknown error'
            }`
          );
        }
      }

      // 2. รวมลิงก์รูปภาพจากไฟล์ที่อัปโหลดใหม่ และจากช่องกรอก URL ทั้ง 4 มุมมอง
      const manualUrls = galleryUrls
        .map((u) => stripVehicleMetaFromUrl(u))
        .filter(Boolean);
      const allGalleryImages = [...uploadedUrls, ...manualUrls];

      const defaultFallback =
        type === 'car'
          ? 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80'
          : 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80';

      const mainImageUrl = allGalleryImages[0] || defaultFallback;

      while (allGalleryImages.length < 4) {
        allGalleryImages.push(mainImageUrl);
      }

      // 3. สร้างออบเจกต์รายละเอียดสเปกและรูปภาพเพิ่มเติมทั้ง 4 มุมมอง
      const parsedHighlights = highlightsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const detailsPayload: VehicleExtraDetails = {
        gallery: allGalleryImages.slice(0, 4),
        specs: {
          engine:
            engine.trim() ||
            (type === 'car' ? '1.5 ลิตร เทอร์โบ / ไฮบริด' : '155 ซีซี หัวฉีด'),
          transmission: transmission.trim() || 'อัตโนมัติ (Automatic)',
          seats: seats.trim() || (type === 'car' ? '5 ที่นั่ง' : '2 ที่นั่ง'),
          fuel: fuel.trim() || 'เบนซิน / แก๊สโซฮอล์ E20',
          consumption:
            consumption.trim() ||
            (type === 'car' ? '22 กม./ลิตร' : '45 กม./ลิตร'),
        },
        highlights:
          parsedHighlights.length > 0
            ? parsedHighlights
            : ['ตรวจเช็คสภาพ 25 จุด', 'ฟรีประกันภัยชั้น 1'],
        description:
          description.trim() ||
          `${brand} ${name} สภาพใหม่ป้ายแดง พร้อมใช้งาน ขับขี่ปลอดภัย ประหยัดน้ำมัน`,
      };

      // แนบข้อมูลสเปกและ Gallery ไว้ใน image_url เพื่อบันทึกลงฐานข้อมูล Supabase โดยตรง
      const packedImageUrl = packImageUrlWithDetails(
        mainImageUrl,
        detailsPayload
      );

      saveCustomVehicleDetails(
        licensePlate,
        detailsPayload,
        editingVehicleId || undefined
      );

      const dbPayload = {
        name: name.trim(),
        brand: brand.trim(),
        type,
        license_plate: licensePlate.trim(),
        price_per_day: Number(pricePerDay),
        image_url: packedImageUrl,
        status,
      };

      if (editingVehicleId) {
        // โหมดแก้ไขข้อมูลรถที่มีอยู่แล้ว
        let updateRes = await supabase
          .from(DRIVERENT_TABLES.vehicles)
          .update(dbPayload)
          .eq('id', editingVehicleId)
          .select('*')
          .maybeSingle();

        if (isMissingTableError(updateRes.error)) {
          updateRes = await supabase
            .from('vehicles')
            .update(dbPayload)
            .eq('id', editingVehicleId)
            .select('*')
            .maybeSingle();
        }

        if (updateRes.error) {
          throw new Error(
            `แก้ไขข้อมูลรถไม่สำเร็จ: ${updateRes.error.message}`
          );
        }

        // อัปเดต State ทันทีเพื่อให้เห็นการเปลี่ยนแปลงในรายการด้านขวาแบบ Real-time
        setVehicles((prev) =>
          prev.map((item) =>
            item.id === editingVehicleId
              ? {
                  ...item,
                  ...dbPayload,
                }
              : item
          )
        );

        await alertSuccess(
          'บันทึกการแก้ไขรายละเอียดรถสำเร็จ!',
          `อัปเดตข้อมูล สเปก และรูปภาพของ ${dbPayload.brand} ${dbPayload.name} (${dbPayload.license_plate}) เรียบร้อยแล้ว`
        );
      } else {
        // โหมดเพิ่มรถเช่าคันใหม่
        let insertRes = await supabase
          .from(DRIVERENT_TABLES.vehicles)
          .insert(dbPayload)
          .select('*')
          .maybeSingle();

        if (isMissingTableError(insertRes.error)) {
          insertRes = await supabase
            .from('vehicles')
            .insert(dbPayload)
            .select('*')
            .maybeSingle();
        }

        if (insertRes.error) {
          throw new Error(`เพิ่มข้อมูลรถไม่สำเร็จ: ${insertRes.error.message}`);
        }

        if (insertRes.data) {
          const created = insertRes.data as Vehicle;
          saveCustomVehicleDetails(
            created.license_plate,
            detailsPayload,
            created.id
          );
          setVehicles((prev) => [created, ...prev]);
        }

        await alertSuccess(
          'เพิ่มรถเช่าพร้อมรายละเอียดและรูปเพิ่มเติมสำเร็จ!',
          `เพิ่ม ${dbPayload.brand} ${dbPayload.name} (${dbPayload.license_plate}) พร้อมรูป Gallery 4 มุมมองเรียบร้อยแล้ว`
        );
      }

      resetFormToDefault();
      router.refresh();
    } catch (err) {
      await alertError(
        editingVehicleId
          ? 'ไม่สามารถบันทึกการแก้ไขข้อมูลรถได้'
          : 'ไม่สามารถเพิ่มข้อมูลรถได้',
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    vehicleId: string,
    newStatus: VehicleStatus
  ) => {
    let res = await supabase
      .from(DRIVERENT_TABLES.vehicles)
      .update({ status: newStatus })
      .eq('id', vehicleId);

    if (isMissingTableError(res.error)) {
      res = await supabase
        .from('vehicles')
        .update({ status: newStatus })
        .eq('id', vehicleId);
    }

    if (res.error) {
      await alertError('เปลี่ยนสถานะรถไม่สำเร็จ', res.error.message);
      return;
    }

    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, status: newStatus } : v))
    );

    await Toast.fire({
      icon: 'success',
      title: `อัปเดตสถานะรถเป็น ${newStatus} เรียบร้อย`,
    });
    router.refresh();
  };

  const handleDeleteVehicle = async (
    vehicleId: string,
    vehicleName: string
  ) => {
    const confirmed = await confirmAction({
      title: `ยืนยันการลบรถ "${vehicleName}"?`,
      text: 'หากลบแล้วจะไม่สามารถกู้คืนข้อมูลรถคันนี้ได้',
      confirmText: 'ลบออกจากระบบ',
      cancelText: 'ยกเลิก',
      icon: 'warning',
    });

    if (!confirmed) return;

    let res = await supabase
      .from(DRIVERENT_TABLES.vehicles)
      .delete()
      .eq('id', vehicleId);

    if (isMissingTableError(res.error)) {
      res = await supabase.from('vehicles').delete().eq('id', vehicleId);
    }

    if (res.error) {
      await alertError(
        'ลบรถไม่สำเร็จ',
        `อาจมีประวัติการจองผูกอยู่กับรถคันนี้ (${res.error.message})`
      );
      return;
    }

    if (editingVehicleId === vehicleId) {
      resetFormToDefault();
    }

    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));

    await Toast.fire({
      icon: 'success',
      title: 'ลบรายการรถเรียบร้อยแล้ว',
    });
    router.refresh();
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (filterType !== 'all' && v.type !== filterType) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.license_plate.toLowerCase().includes(q)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ฟอร์มเพิ่มรถใหม่ หรือ แก้ไขรายละเอียดรถเช่าที่มีอยู่ในระบบ */}
      <form
        ref={formTopRef}
        onSubmit={handleSubmitVehicle}
        className={`lg:col-span-6 bg-white/95 backdrop-blur rounded-2xl border-2 shadow-sm p-6 space-y-4 h-fit transition-all scroll-mt-24 ${
          editingVehicleId
            ? 'border-blue-500 ring-4 ring-blue-500/10'
            : 'border-slate-200'
        }`}
      >
        <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-2">
          <div>
            {editingVehicleId ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-700 mb-1.5">
                  <Pencil className="w-3 h-3" />
                  โหมดแก้ไขรายละเอียดรถเช่า
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  แก้ไขข้อมูล: {brand} {name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ปรับแก้ชื่อรุ่น ป้ายทะเบียน ราคา สเปกเครื่องยนต์ คำอธิบาย และรูปภาพทั้ง 4 มุมมองแล้วกดบันทึกด้านล่าง
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-blue-600" />
                  เพิ่มรถเช่าคันใหม่ (ข้อมูลสเปก &amp; รูปเพิ่มเติมครบทุกมุมมอง)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  กรอกข้อมูลรถ สเปกเครื่องยนต์ รายละเอียดจุดเด่น หรือคลิกปุ่ม{' '}
                  <strong className="text-blue-600">&quot;แก้ไขรายละเอียด&quot;</strong>{' '}
                  จากรายการรถด้านขวาเพื่อแก้ไขรถที่มีอยู่
                </p>
              </>
            )}
          </div>

          {editingVehicleId && (
            <button
              type="button"
              onClick={resetFormToDefault}
              className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>ยกเลิกแก้ไข</span>
            </button>
          )}
        </div>

        {/* หมวดที่ 1: ข้อมูลหลัก */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ประเภทรถ
            </label>
            <select
              value={type}
              onChange={(e) => handleTypeSelect(e.target.value as VehicleType)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="car">รถยนต์ (Car)</option>
              <option value="motorcycle">มอเตอร์ไซค์ (Motorcycle)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ยี่ห้อ (Brand)
            </label>
            <input
              type="text"
              required
              placeholder="เช่น Toyota, Honda"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อรุ่น (Model)
            </label>
            <input
              type="text"
              required
              placeholder="เช่น Yaris Ativ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ป้ายทะเบียน
            </label>
            <input
              type="text"
              required
              placeholder="กข 1234 สงขลา"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ราคาเช่า / วัน (บาท)
            </label>
            <input
              type="number"
              required
              min={100}
              placeholder="1200"
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              สถานะรถ
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VehicleStatus)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="available">พร้อมเช่า (Available)</option>
              <option value="rented">กำลังเช่า (Rented)</option>
              <option value="maintenance">ซ่อมบำรุง (Maintenance)</option>
            </select>
          </div>
        </div>

        {/* หมวดที่ 2: ข้อมูลสเปกโดยละเอียด */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Cog className="w-4 h-4 text-blue-600" />
            ข้อมูลสเปกรถ (แสดงในหน้าต่างคลิกดูรายละเอียดของลูกค้า)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                เครื่องยนต์ (Engine)
              </label>
              <input
                type="text"
                placeholder="เช่น 1.8 ลิตร Hybrid"
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                ระบบเกียร์
              </label>
              <input
                type="text"
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                จำนวนที่นั่ง
              </label>
              <input
                type="text"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                เชื้อเพลิง
              </label>
              <input
                type="text"
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
              />
            </div>
            <div className="col-span-2 sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                อัตราสิ้นเปลืองน้ำมัน/พลังงาน
              </label>
              <input
                type="text"
                value={consumption}
                onChange={(e) => setConsumption(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
              />
            </div>
          </div>
        </div>

        {/* หมวดที่ 3: รายละเอียดคำอธิบายและจุดเด่น */}
        <div className="space-y-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              รายละเอียดคำอธิบายรถ (Description)
            </label>
            <textarea
              rows={2}
              placeholder="อธิบายจุดเด่น ความสะดวกสบาย หรือความเหมาะสมในการใช้งาน..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ออปชันและจุดเด่นของรถ (คั่นแต่ละข้อด้วยเครื่องหมายจุลภาค ,)
            </label>
            <input
              type="text"
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
        </div>

        {/* หมวดที่ 4: รูปภาพหลักและรูปภาพเพิ่มเติม (Gallery 4 มุมมอง) */}
        <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/70 space-y-3">
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Images className="w-4 h-4 text-blue-600" />
            รูปภาพรถหลัก &amp; รูปภาพเพิ่มเติม (Gallery สูงสุด 4 มุมมอง)
          </label>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 hover:border-blue-600 rounded-xl p-3.5 cursor-pointer transition bg-white">
            <Upload className="w-5 h-5 text-blue-500 mb-1" />
            <span className="text-xs font-semibold text-slate-700 text-center">
              {imageFiles.length > 0
                ? `เลือกไฟล์ใหม่แล้ว ${imageFiles.length} รูป (${imageFiles
                    .map((f) => f.name)
                    .join(', ')})`
                : 'คลิกเพื่ออัปโหลดไฟล์รูปรถจากเครื่อง (เลือกพร้อมกันได้สูงสุด 4 รูป)'}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setImageFiles(Array.from(e.target.files || []).slice(0, 4))
              }
              className="hidden"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="space-y-1">
                <input
                  type="url"
                  placeholder={
                    idx === 0
                      ? 'ลิงก์รูปหลัก มุมที่ 1 (https://...)'
                      : `ลิงก์รูปเพิ่มเติม มุมที่ ${idx + 1} (https://...)`
                  }
                  value={galleryUrls[idx]}
                  onChange={(e) => handleGalleryUrlChange(idx, e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                />
              </div>
            ))}
          </div>

          {/* ตัวอย่างรูปภาพทั้ง 4 มุมมองปัจจุบัน */}
          {galleryUrls.some(Boolean) && (
            <div className="grid grid-cols-4 gap-2 pt-1">
              {galleryUrls.map((url, idx) =>
                url ? (
                  <div
                    key={idx}
                    className="relative h-14 rounded-lg overflow-hidden border border-slate-200 bg-white"
                  >
                    <img
                      src={url}
                      alt={`มุมที่ ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0.5 right-0.5 bg-slate-900/75 text-white text-[9px] font-bold px-1 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 inline-flex items-center justify-center gap-2 text-white font-semibold py-3 px-4 rounded-xl text-sm transition shadow-md cursor-pointer ${
              editingVehicleId
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : editingVehicleId ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <PlusCircle className="w-4 h-4" />
            )}
            <span>
              {editingVehicleId
                ? `บันทึกการแก้ไขรายละเอียดรถ (${brand} ${name})`
                : 'บันทึกข้อมูลรถใหม่พร้อมรูปเพิ่มเติม'}
            </span>
          </button>

          {editingVehicleId && (
            <button
              type="button"
              onClick={resetFormToDefault}
              className="px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              ยกเลิก / เพิ่มคันใหม่
            </button>
          )}
        </div>
      </form>

      {/* รายการรถทั้งหมดในระบบ พร้อมปุ่ม "แก้ไขรายละเอียด" ทุกคัน */}
      <div className="lg:col-span-6 bg-white/95 backdrop-blur rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              จัดการรถเช่าในระบบ ({vehicles.length} คัน)
            </h2>
            <p className="text-xs text-slate-500">
              คลิกปุ่ม <strong className="text-blue-600">&quot;แก้ไขรายละเอียด&quot;</strong>{' '}
              เพื่อแก้ไขสเปก ราคา คำอธิบาย และรูปภาพทั้ง 4 มุมมองของรถแต่ละคัน
            </p>
          </div>
        </div>

        {/* แถบค้นหาและกรองประเภทรถในหน้า Admin */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อรุ่น ยี่ห้อ หรือป้ายทะเบียน..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1">
            {(['all', 'car', 'motorcycle'] as const).map((tKey) => (
              <button
                key={tKey}
                type="button"
                onClick={() => setFilterType(tKey)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterType === tKey
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tKey === 'all'
                  ? 'ทั้งหมด'
                  : tKey === 'car'
                  ? 'รถยนต์'
                  : 'มอเตอร์ไซค์'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 max-h-[760px] overflow-y-auto pr-1">
          {filteredVehicles.map((v) => {
            const isEditingThis = editingVehicleId === v.id;
            const extra = getVehicleExtraDetails(v);
            const cleanThumb = stripVehicleMetaFromUrl(v.image_url);

            return (
              <div
                key={v.id}
                className={`flex flex-col gap-3 p-3.5 rounded-2xl border transition ${
                  isEditingThis
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {cleanThumb && (
                        <img
                          src={cleanThumb}
                          alt={v.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900">
                          {v.brand} {v.name}
                        </span>
                        <span className="text-[11px] text-slate-500 inline-flex items-center gap-0.5">
                          {v.type === 'car' ? (
                            <Car className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <Bike className="w-3.5 h-3.5 text-indigo-600" />
                          )}
                        </span>
                        {isEditingThis && (
                          <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                            กำลังแก้ไขคันนี้
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {v.license_plate} •{' '}
                        <strong className="text-blue-600">
                          ฿{Number(v.price_per_day).toLocaleString()}/วัน
                        </strong>
                      </p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        ⚙️ {extra.specs.engine} • 💺 {extra.specs.seats} • ⛽{' '}
                        {extra.specs.consumption}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEditVehicle(v)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isEditingThis
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>แก้ไขรายละเอียด</span>
                    </button>

                    <select
                      value={v.status}
                      onChange={(e) =>
                        handleStatusChange(
                          v.id,
                          e.target.value as VehicleStatus
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      <option value="available">พร้อมเช่า</option>
                      <option value="rented">กำลังเช่า</option>
                      <option value="maintenance">ซ่อมบำรุง</option>
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteVehicle(v.id, `${v.brand} ${v.name}`)
                      }
                      title="ลบรถคันนี้"
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
