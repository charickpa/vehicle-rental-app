import Swal from 'sweetalert2';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildProModalHtml(options: {
  badgeText: string;
  badgeColor: 'emerald' | 'rose' | 'amber' | 'blue';
  title: string;
  text?: string;
  extraHtml?: string;
}) {
  const colorMap = {
    emerald: {
      topBar: 'from-emerald-500 via-teal-500 to-cyan-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      boxBg: 'bg-emerald-50/50 border-emerald-100',
    },
    rose: {
      topBar: 'from-rose-500 via-red-500 to-orange-500',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      boxBg: 'bg-rose-50/50 border-rose-100',
    },
    amber: {
      topBar: 'from-amber-500 via-orange-500 to-yellow-500',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      boxBg: 'bg-amber-50/50 border-amber-100',
    },
    blue: {
      topBar: 'from-blue-600 via-indigo-600 to-cyan-500',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-600',
      boxBg: 'bg-slate-50 border-slate-200/80',
    },
  }[options.badgeColor];

  const safeTitle = escapeHtml(options.title);
  const safeText = options.text ? escapeHtml(options.text) : '';

  return `
    <div class="text-center space-y-3 pt-1">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${colorMap.badgeBg}">
        <span class="w-2 h-2 rounded-full ${colorMap.dot} animate-pulse"></span>
        <span>${escapeHtml(options.badgeText)}</span>
      </div>

      <h3 class="text-lg sm:text-xl font-black text-slate-900 leading-snug px-2">
        ${safeTitle}
      </h3>

      ${
        safeText
          ? `<div class="p-3.5 rounded-2xl border ${colorMap.boxBg} text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              ${safeText}
            </div>`
          : ''
      }

      ${options.extraHtml || ''}

      <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold px-1">
        <span>charickDriveRent • สาขาหาดใหญ่ จ.สงขลา</span>
        <span>โทร 074-234-567 / 089-999-8888</span>
      </div>
    </div>
  `;
}

// ตั้งค่าเริ่มต้นของ SweetAlert2 ระดับ Enterprise Luxury
export const MySwal = Swal.mixin({
  customClass: {
    popup:
      'rounded-3xl shadow-2xl border border-slate-200/90 p-6 sm:p-7 bg-white/98 backdrop-blur-xl max-w-md w-full',
    title: 'hidden',
    htmlContainer: '!m-0 !p-0 text-sm text-slate-600',
    actions: 'mt-5 flex items-center justify-center gap-2.5 w-full',
    confirmButton:
      'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25 hover:shadow-lg cursor-pointer',
    cancelButton:
      'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer',
    denyButton:
      'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer',
  },
  buttonsStyling: false,
});

// แจ้งเตือนแบบ Toast มุมขวาบน ดีไซน์โทนเข้มพรีเมียม (สำหรับ Login / Logout / อัปเดตสถานะไวๆ)
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3200,
  timerProgressBar: true,
});

export function alertSuccess(title: string, text?: string) {
  return MySwal.fire({
    icon: 'success',
    html: buildProModalHtml({
      badgeText: 'charickDriveRent • ดำเนินการสำเร็จ',
      badgeColor: 'emerald',
      title,
      text,
    }),
    confirmButtonText: 'ตกลง (เรียบร้อย)',
  });
}

export function alertError(title: string, text?: string) {
  return MySwal.fire({
    icon: 'error',
    html: buildProModalHtml({
      badgeText: 'charickDriveRent • แจ้งเตือนข้อผิดพลาด',
      badgeColor: 'rose',
      title,
      text,
    }),
    confirmButtonText: 'รับทราบและแก้ไข',
    customClass: {
      popup:
        'rounded-3xl shadow-2xl border border-rose-200 p-6 sm:p-7 bg-white max-w-md w-full',
      title: 'hidden',
      htmlContainer: '!m-0 !p-0 text-sm text-slate-600',
      actions: 'mt-5 flex items-center justify-center gap-2.5 w-full',
      confirmButton:
        'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-rose-600/25 cursor-pointer',
    },
  });
}

export function alertWarning(title: string, text?: string) {
  return MySwal.fire({
    icon: 'warning',
    html: buildProModalHtml({
      badgeText: 'charickDriveRent • กรุณาตรวจสอบข้อมูล',
      badgeColor: 'amber',
      title,
      text,
    }),
    confirmButtonText: 'เข้าใจแล้ว',
  });
}

export async function confirmAction(options: {
  title: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
  icon?: 'warning' | 'question' | 'info';
}): Promise<boolean> {
  const isWarning = options.icon === 'warning';
  const result = await MySwal.fire({
    icon: options.icon || 'question',
    html: buildProModalHtml({
      badgeText: isWarning
        ? 'charickDriveRent • ยืนยันการดำเนินการสำคัญ'
        : 'charickDriveRent • ยืนยันรายการ',
      badgeColor: isWarning ? 'amber' : 'blue',
      title: options.title,
      text: options.text,
    }),
    showCancelButton: true,
    confirmButtonText: options.confirmText || 'ยืนยันการทำรายการ',
    cancelButtonText: options.cancelText || 'ยกเลิก',
    reverseButtons: true,
    customClass: {
      popup:
        'rounded-3xl shadow-2xl border border-slate-200/90 p-6 sm:p-7 bg-white max-w-md w-full',
      title: 'hidden',
      htmlContainer: '!m-0 !p-0 text-sm text-slate-600',
      actions: 'mt-5 flex items-center justify-center gap-2.5 w-full',
      confirmButton: isWarning
        ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-rose-600/25 cursor-pointer'
        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25 cursor-pointer',
      cancelButton:
        'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer',
    },
  });
  return result.isConfirmed;
}

/**
 * ป๊อปอัปตรวจสอบหลักฐานสลิปโอนเงินมัดจำ 30% แบบมืออาชีพสำหรับหน้า Admin Dashboard
 */
export function previewPaymentSlipPopup(options: {
  slipUrl: string;
  vehicleName: string;
  customerName: string;
  depositAmount: number;
  remainingAmount: number;
  totalPrice: number;
}) {
  const safeSlipUrl = escapeHtml(options.slipUrl);
  return MySwal.fire({
    html: buildProModalHtml({
      badgeText: 'charickDriveRent • ตรวจสอบสลิปโอนเงินมัดจำ',
      badgeColor: 'blue',
      title: options.vehicleName,
      text: `ผู้จอง: ${options.customerName} | ยอดรวม ฿${options.totalPrice.toLocaleString()}`,
      extraHtml: `
        <div class="space-y-3 mt-2">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="p-2.5 rounded-xl bg-blue-50 border border-blue-200 font-bold text-blue-800">
              โอนมัดจำแล้ว: ฿${options.depositAmount.toLocaleString()}
            </div>
            <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200 font-bold text-amber-800">
              เก็บวันรับรถ: ฿${options.remainingAmount.toLocaleString()}
            </div>
          </div>
          <div class="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-72 flex items-center justify-center">
            <img src="${safeSlipUrl}" alt="Payment Slip" class="max-h-72 w-auto object-contain mx-auto" />
          </div>
          <a href="${safeSlipUrl}" target="_blank" rel="noopener noreferrer" class="inline-block text-xs font-bold text-blue-600 hover:underline">
            🔍 เปิดรูปสลิปขนาดเต็มในแท็บใหม่
          </a>
        </div>
      `,
    }),
    confirmButtonText: 'ปิดหน้าต่างตรวจสอบสลิป',
  });
}
