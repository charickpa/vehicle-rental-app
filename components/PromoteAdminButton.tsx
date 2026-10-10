'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { updateUserProfile } from '@/lib/supabase/tables';
import { alertError, alertSuccess } from '@/lib/swal';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function PromoteAdminButton({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handlePromote = async () => {
    setLoading(true);
    const { error } = await updateUserProfile(supabase, userId, {
      role: 'admin',
    });

    setLoading(false);
    if (error) {
      await alertError('ไม่สามารถเปลี่ยนสิทธิ์เป็น Admin ได้', error.message);
      return;
    }

    await alertSuccess(
      'อัปเกรดเป็น Admin สำเร็จ!',
      'ตอนนี้คุณสามารถจัดการรายการจอง คลังรถเช่า และตอบแชทลูกค้าใน CharDB ได้ทั้งหมดแล้ว'
    );
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handlePromote}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-sm cursor-pointer"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ShieldCheck className="w-4 h-4" />
      )}
      <span>อัปเกรดบัญชีของฉันเป็น Admin ทันที (สำหรับทดสอบ)</span>
    </button>
  );
}
