'use client';

import React from 'react';
import Swal from 'sweetalert2';
import type { Booking } from '@/types/database';
import { stripVehicleMetaFromUrl } from '@/lib/vehicles/catalog';
import { FileText } from 'lucide-react';

interface BookingVoucherButtonProps {
  booking: Booking;
  customerFallbackName?: string;
  compact?: boolean;
}

const STATUS_LABEL_TH: Record<
  string,
  { text: string; color: string; bg: string }
> = {
  pending: {
    text: 'รอตรวจสอบสลิปมัดจำ 30%',
    color: '#d97706',
    bg: '#fef3c7',
  },
  confirmed: {
    text: 'ยืนยันคิวรถแล้ว (พร้อมรับรถ)',
    color: '#2563eb',
    bg: '#dbeafe',
  },
  completed: {
    text: 'ส่งคืนรถเรียบร้อยแล้ว (เสร็จสิ้น)',
    color: '#059669',
    bg: '#d1fae5',
  },
  cancelled: {
    text: 'ยกเลิกรายการจอง',
    color: '#dc2626',
    bg: '#fee2e2',
  },
};

const formatBaht = (amount: number) => `฿${Math.round(amount).toLocaleString('th-TH')}`;

export default function BookingVoucherButton({
  booking,
  customerFallbackName,
  compact = false,
}: BookingVoucherButtonProps) {
  const vehicle = booking.vehicles || booking.DriveRent_vehicles;
  const profile = booking.profiles || booking.DriveRent_profiles;
  const cleanImageUrl = stripVehicleMetaFromUrl(vehicle?.image_url);

  const startDateObj = new Date(booking.start_date);
  const endDateObj = new Date(booking.end_date);
  const diffDays = Math.max(
    1,
    Math.ceil(
      (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const totalPrice = Number(booking.total_price || 0);
  const depositAmount =
    Number(booking.deposit_amount || 0) > 0
      ? Number(booking.deposit_amount)
      : Math.round(totalPrice * 0.3);
  const remainingAmount =
    booking.remaining_amount !== undefined
      ? Number(booking.remaining_amount)
      : Math.max(0, totalPrice - depositAmount);
  const securityDeposit = vehicle?.type === 'car' ? 3000 : 1000;

  const customerName =
    profile?.full_name || customerFallbackName || 'ลูกค้าสมาชิก charickDriveRent';
  const customerPhone = profile?.phone_number || 'ติดต่อตามข้อมูลสมาชิก';
  const pickupLocation =
    booking.pickup_location || 'สนามบินนานาชาติหาดใหญ่ (ประตูทางออก 3)';
  const pickupTime = booking.pickup_time || '09:00 น.';
  const flightOrNote = booking.flight_or_note || '-';
  const bookingRef = `DR-${booking.id.slice(0, 8).toUpperCase()}`;

  const statusInfo = STATUS_LABEL_TH[booking.status] || STATUS_LABEL_TH.pending;

  const formatThaiDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const handlePrintVoucher = () => {
    const printWindow = window.open('', '_blank', 'width=860,height=920');
    if (!printWindow) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาอนุญาตการเปิดหน้าต่างป๊อปอัป',
        text: 'เบราว์เซอร์ของคุณบล็อกหน้าต่างพิมพ์ใบยืนยันการจอง กรุณากดอนุญาต Popup แล้วลองอีกครั้ง',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <title>ใบยืนยันการจองรถเช่า ${bookingRef} - charickDriveRent หาดใหญ่</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      padding: 24px;
      line-height: 1.55;
    }
    .voucher-sheet {
      max-width: 780px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #ffffff;
      padding: 24px 28px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.3px;
    }
    .brand-sub {
      font-size: 13px;
      color: #cbd5e1;
      margin-top: 4px;
    }
    .doc-badge {
      text-align: right;
    }
    .doc-type {
      display: inline-block;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.25);
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .ref-no {
      font-size: 18px;
      font-weight: 800;
      margin-top: 6px;
      color: #93c5fd;
    }
    .content {
      padding: 24px 28px;
    }
    .status-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-radius: 12px;
      background: ${statusInfo.bg};
      color: ${statusInfo.color};
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 20px;
      border: 1px solid rgba(0,0,0,0.06);
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 18px;
    }
    .box {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px 16px;
      background: #f8fafc;
    }
    .box-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 8px;
      letter-spacing: 0.4px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      font-size: 13.5px;
      padding: 4px 0;
      gap: 10px;
    }
    .row-label {
      color: #64748b;
      flex-shrink: 0;
    }
    .row-val {
      font-weight: 700;
      color: #0f172a;
      text-align: right;
    }
    .price-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      margin-bottom: 18px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }
    .price-table th, .price-table td {
      padding: 10px 14px;
      font-size: 13.5px;
      border-bottom: 1px solid #e2e8f0;
    }
    .price-table th {
      background: #f1f5f9;
      text-align: left;
      color: #475569;
      font-weight: 700;
    }
    .price-table td.num, .price-table th.num {
      text-align: right;
    }
    .highlight-row {
      background: #eff6ff;
      font-weight: 800;
      color: #1d4ed8;
    }
    .checklist {
      border: 1px dashed #94a3b8;
      border-radius: 14px;
      padding: 14px 16px;
      background: #ffffff;
      font-size: 12.5px;
      color: #334155;
      margin-bottom: 18px;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      margin-top: 26px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12.5px;
      color: #475569;
    }
    .sig-line {
      margin: 34px auto 6px;
      width: 75%;
      border-bottom: 1px dotted #94a3b8;
    }
    .toolbar {
      max-width: 780px;
      margin: 0 auto 14px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn {
      padding: 9px 16px;
      border-radius: 10px;
      border: none;
      font-family: inherit;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-print {
      background: #2563eb;
      color: #ffffff;
    }
    .btn-close {
      background: #e2e8f0;
      color: #334155;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .toolbar { display: none !important; }
      .voucher-sheet { box-shadow: none; border: 1px solid #cbd5e1; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="btn btn-close" onclick="window.close()">ปิดหน้าต่าง</button>
    <button class="btn btn-print" onclick="window.print()">🖨️ สั่งพิมพ์ / บันทึกเป็น PDF</button>
  </div>

  <div class="voucher-sheet">
    <div class="header">
      <div>
        <div class="brand-title">charickDriveRent (สาขาหาดใหญ่ จ.สงขลา)</div>
        <div class="brand-sub">บริการเช่ารถยนต์และรถจักรยานยนต์หาดใหญ่ • รับ-ส่งสนามบินหาดใหญ่ / บขส. / สถานีรถไฟ</div>
        <div class="brand-sub">โทรติดต่อฝ่ายบริการลูกค้า: 089-999-8877 • เปิดบริการทุกวัน 07:00 - 22:00 น.</div>
      </div>
      <div class="doc-badge">
        <div class="doc-type">Booking Voucher & Receipt</div>
        <div class="ref-no">${bookingRef}</div>
        <div style="font-size: 11.5px; color: #cbd5e1; margin-top: 2px;">วันที่ออกเอกสาร: ${formatThaiDate(booking.created_at)}</div>
      </div>
    </div>

    <div class="content">
      <div class="status-banner">
        <span>สถานะรายการจอง: ${statusInfo.text}</span>
        <span>ระยะเวลาเช่า: ${diffDays} วัน</span>
      </div>

      <div class="grid-2">
        <div class="box">
          <div class="box-title">👤 ข้อมูลผู้เช่ารถ (Customer Details)</div>
          <div class="row">
            <span class="row-label">ชื่อ-นามสกุลผู้เช่า:</span>
            <span class="row-val">${customerName}</span>
          </div>
          <div class="row">
            <span class="row-label">เบอร์โทรศัพท์ติดต่อ:</span>
            <span class="row-val">${customerPhone}</span>
          </div>
          <div class="row">
            <span class="row-label">เที่ยวบิน / โรงแรม / หมายเหตุ:</span>
            <span class="row-val">${flightOrNote}</span>
          </div>
        </div>

        <div class="box">
          <div class="box-title">🚘 ข้อมูลรถเช่า (Vehicle Information)</div>
          <div class="row">
            <span class="row-label">ยี่ห้อ / รุ่นรถ:</span>
            <span class="row-val">${vehicle ? `${vehicle.brand} ${vehicle.name}` : '-'}</span>
          </div>
          <div class="row">
            <span class="row-label">ป้ายทะเบียน / ประเภท:</span>
            <span class="row-val">${vehicle?.license_plate || '-'} (${vehicle?.type === 'car' ? 'รถยนต์' : 'รถจักรยานยนต์'})</span>
          </div>
          <div class="row">
            <span class="row-label">อัตราค่าเช่าต่อวัน:</span>
            <span class="row-val">${formatBaht(vehicle?.price_per_day || Math.round(totalPrice / diffDays))}/วัน</span>
          </div>
        </div>
      </div>

      <div class="box" style="margin-bottom: 18px; background: #eff6ff; border-color: #bfdbfe;">
        <div class="box-title" style="color: #1d4ed8;">📍 กำหนดการและสถานที่นัดรับ-คืนรถ (Hat Yai Pickup & Return)</div>
        <div class="grid-2" style="margin-bottom: 0; gap: 12px;">
          <div>
            <div class="row">
              <span class="row-label">สถานที่นัดรับ-คืนรถ:</span>
              <span class="row-val" style="color: #1e40af;">${pickupLocation}</span>
            </div>
            <div class="row">
              <span class="row-label">เวลานัดรับรถ:</span>
              <span class="row-val">${pickupTime}</span>
            </div>
          </div>
          <div>
            <div class="row">
              <span class="row-label">วันที่เริ่มรับรถ:</span>
              <span class="row-val">${formatThaiDate(booking.start_date)}</span>
            </div>
            <div class="row">
              <span class="row-label">วันที่ส่งคืนรถ:</span>
              <span class="row-val">${formatThaiDate(booking.end_date)}</span>
            </div>
          </div>
        </div>
      </div>

      <table class="price-table">
        <thead>
          <tr>
            <th>รายการสรุปค่าใช้จ่าย (Payment Breakdown)</th>
            <th class="num">จำนวนเงิน (บาท)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ค่าเช่ารถรวมทั้งหมด (${diffDays} วัน)</td>
            <td class="num"><strong>${formatBaht(totalPrice)}</strong></td>
          </tr>
          <tr>
            <td>หัก ค่ามัดจำการจองล่วงหน้า 30% (โอนชำระพร้อมแนบสลิปแล้ว)</td>
            <td class="num" style="color: #059669; font-weight: 700;">- ${formatBaht(depositAmount)}</td>
          </tr>
          <tr class="highlight-row">
            <td>ยอดค่าเช่าคงเหลือชำระวันรับรถ (70%)</td>
            <td class="num">${formatBaht(remainingAmount)}</td>
          </tr>
          <tr>
            <td>เงินประกันตัวรถวันรับรถ (ได้รับคืนเต็มจำนวนทันทีเมื่อคืนรถสภาพปกติ)</td>
            <td class="num">${formatBaht(securityDeposit)}</td>
          </tr>
        </tbody>
      </table>

      <div class="checklist">
        <strong>📌 เอกสารที่ต้องเตรียมแสดงในวันรับรถ (Required Documents at Pickup):</strong>
        <div style="margin-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          <div>• บัตรประจำตัวประชาชนตัวจริง หรือ Passport ที่ยังไม่หมดอายุ</div>
          <div>• ใบอนุญาตขับขี่รถยนต์ / รถจักรยานยนต์ตัวจริง</div>
          <div>• ใบยืนยันการจองฉบับนี้ (แสดงผ่านหน้าจอมือถือหรือพิมพ์กระดาษ)</div>
          <div>• ตรวจเช็คระดับน้ำมันเชื้อเพลิงและสภาพรถร่วมกับเจ้าหน้าที่ก่อนออกเดินทาง</div>
        </div>
      </div>

      <div class="signatures">
        <div>
          <div class="sig-line"></div>
          <div>ลงชื่อผู้เช่ารถ (${customerName})</div>
          <div style="font-size: 11px; color: #94a3b8;">วันที่รับรถ ......./......./...........</div>
        </div>
        <div>
          <div class="sig-line"></div>
          <div>เจ้าหน้าที่ส่งมอบรถ (charickDriveRent หาดใหญ่)</div>
          <div style="font-size: 11px; color: #94a3b8;">วันที่ส่งมอบ ......./......./...........</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleOpenVoucherModal = async () => {
    const result = await Swal.fire({
      width: 620,
      showCancelButton: true,
      confirmButtonText: '🖨️ เปิดหน้าพิมพ์ / บันทึก PDF',
      cancelButtonText: 'ปิดหน้าต่าง',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      html: `
        <div style="text-align:left; font-family:inherit; color:#0f172a;">
          <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,#0f172a,#1e3a8a); color:#fff; padding:16px 18px; border-radius:16px; margin-bottom:14px;">
            <div>
              <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.6px; color:#93c5fd; font-weight:700;">Booking Voucher • charickDriveRent หาดใหญ่</div>
              <div style="font-size:18px; font-weight:800; margin-top:2px;">ใบยืนยันการจอง #${bookingRef}</div>
            </div>
            <span style="background:${statusInfo.bg}; color:${statusInfo.color}; padding:5px 12px; border-radius:999px; font-size:12px; font-weight:800;">
              ${statusInfo.text}
            </span>
          </div>

          <div style="display:flex; gap:12px; align-items:center; background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:12px; margin-bottom:12px;">
            ${
              cleanImageUrl
                ? `<img src="${cleanImageUrl}" alt="Vehicle" style="width:84px; height:60px; object-fit:cover; border-radius:10px; border:1px solid #cbd5e1;" />`
                : ''
            }
            <div style="flex:1;">
              <div style="font-weight:800; font-size:15px; color:#0f172a;">
                ${vehicle ? `${vehicle.brand} ${vehicle.name}` : 'รถเช่าในระบบ'}
              </div>
              <div style="font-size:12.5px; color:#475569; margin-top:2px;">
                ทะเบียน: <strong>${vehicle?.license_plate || '-'}</strong> • ระยะเวลาเช่า <strong>${diffDays} วัน</strong>
              </div>
            </div>
          </div>

          <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:14px; padding:12px 14px; margin-bottom:12px; font-size:13px;">
            <div style="font-weight:800; color:#1d4ed8; margin-bottom:6px;">📍 ข้อมูลนัดรับ-คืนรถ (สาขาหาดใหญ่)</div>
            <div style="display:flex; justify-content:space-between; padding:3px 0; gap:8px;">
              <span style="color:#475569; flex-shrink:0;">สถานที่รับ-คืนรถ:</span>
              <strong style="color:#0f172a; text-align:right;">${pickupLocation}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding:3px 0; gap:8px;">
              <span style="color:#475569;">วันรับรถ - วันคืนรถ:</span>
              <strong style="color:#0f172a;">${formatThaiDate(booking.start_date)} - ${formatThaiDate(booking.end_date)}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding:3px 0;">
              <span style="color:#475569;">เวลานัดรับรถ:</span>
              <strong style="color:#1d4ed8;">${pickupTime}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding:3px 0; gap:8px;">
              <span style="color:#475569; flex-shrink:0;">เที่ยวบิน / โรงแรม / หมายเหตุ:</span>
              <strong style="color:#0f172a; text-align:right;">${flightOrNote}</strong>
            </div>
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:12px 14px; font-size:13px;">
            <div style="display:flex; justify-content:space-between; padding:3px 0;">
              <span style="color:#64748b;">ผู้เช่า:</span>
              <strong style="color:#0f172a;">${customerName}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding:3px 0;">
              <span style="color:#64748b;">ยอดค่าเช่าทั้งหมด (100%):</span>
              <strong style="color:#0f172a;">${formatBaht(totalPrice)}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding:3px 0;">
              <span style="color:#059669;">ชำระมัดจำแล้ว (30%):</span>
              <strong style="color:#059669;">${formatBaht(depositAmount)}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding:5px 0; border-top:1px dashed #cbd5e1; margin-top:4px;">
              <span style="color:#1d4ed8; font-weight:700;">ยอดชำระวันรับรถ (70%):</span>
              <strong style="color:#1d4ed8; font-size:14px;">${formatBaht(remainingAmount)}</strong>
            </div>
          </div>
        </div>
      `,
    });

    if (result.isConfirmed) {
      handlePrintVoucher();
    }
  };

  return (
    <button
      type="button"
      onClick={handleOpenVoucherModal}
      className={
        compact
          ? 'inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-lg transition cursor-pointer'
          : 'inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-1.5 rounded-xl transition shadow-xs cursor-pointer'
      }
    >
      <FileText className="w-3.5 h-3.5" />
      <span>ใบยืนยันการจอง / พิมพ์ใบรับรถ</span>
    </button>
  );
}
