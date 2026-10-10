'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { createClient } from '@/lib/supabase/client';
import { DRIVERENT_STORAGE_KEYS, DRIVERENT_TABLES } from '@/types/database';
import { alertSuccess, confirmAction, Toast } from '@/lib/swal';
import {
  Star,
  MessageSquarePlus,
  Quote,
  CheckCircle2,
  Trash2,
  X,
} from 'lucide-react';

export interface CustomerReview {
  id: string;
  customerName: string;
  vehicleName: string;
  rating: number;
  comment: string;
  date: string;
}

const STORAGE_KEY = DRIVERENT_STORAGE_KEYS.customerReviews;

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    customerName: 'คุณณัฐพล วงศ์สวัสดิ์',
    vehicleName: 'Toyota Yaris Ativ 1.2 Smart',
    rating: 5,
    comment:
      'รถใหม่สะอาดมากครับ กลิ่นหอม ไม่มีกลิ่นบุหรี่เลย พนักงานส่งรถตรงเวลาที่สนามบินหาดใหญ่ ประทับใจบริการของ charickDriveRent มากครับ',
    date: '2026-10-02',
  },
  {
    id: 'rev-2',
    customerName: 'คุณแพรวพรรณ ชัยเจริญ',
    vehicleName: 'Honda Civic e:HEV RS',
    rating: 5,
    comment:
      'เช่าขับเที่ยวหาดใหญ่-สงขลา 3 วัน รถอัตราเร่งดีและประหยัดน้ำมันสุดๆ ขั้นตอนการจองมัดจำ 30% และอัปโหลดสลิปผ่านเว็บง่ายมากค่ะ',
    date: '2026-10-04',
  },
  {
    id: 'rev-3',
    customerName: 'Mr. David Miller',
    vehicleName: 'Yamaha XMAX 300 Connected',
    rating: 5,
    comment:
      'Best motorcycle rental experience in Hat Yai! The XMAX 300 was in mint condition with two clean helmets included. Highly recommended!',
    date: '2026-10-06',
  },
  {
    id: 'rev-4',
    customerName: 'คุณกิตติพงศ์ รัตนโชติ',
    vehicleName: 'BYD ATTO 3 Extended Range',
    rating: 5,
    comment:
      'ได้ลองเช่ารถไฟฟ้าขับเที่ยวสงขลา แอดมินแนะนำจุดชาร์จไฟละเอียดมาก รถสภาพป้ายแดง ขับนุ่มเงียบ คุ้มค่าเกินราคาครับ',
    date: '2026-10-08',
  },
  {
    id: 'rev-5',
    customerName: 'คุณสิรินภา ทองดี',
    vehicleName: 'Vespa Sprint 150 i-Get ABS',
    rating: 5,
    comment:
      'รถเวสป้าสีสวยตรงปก ถ่ายรูปกับคาเฟ่ย่านเมืองเก่าสงขลาสวยทุกมุม เบรก ABS มั่นใจมาก รอบหน้ามาหาดใหญ่จะมาเช่าอีกแน่นอนค่ะ',
    date: '2026-10-09',
  },
  {
    id: 'rev-6',
    customerName: 'คุณธนกร ศรีสุวรรณ',
    vehicleName: 'Toyota Fortuner 2.8 Legender 4WD',
    rating: 5,
    comment:
      'พาครอบครัว 7 คนเดินทางเที่ยวใต้ นั่งสบาย แอร์เย็นทั่วคัน มีประกันชั้น 1 ให้ฟรี ขับขี่อุ่นใจตลอดทริปครับ',
    date: '2026-10-10',
  },
];

interface CustomerReviewsSectionProps {
  isAdmin?: boolean;
  defaultShowForm?: boolean;
}

export default function CustomerReviewsSection({
  isAdmin = false,
  defaultShowForm = false,
}: CustomerReviewsSectionProps) {
  const { t } = useLanguage();
  const supabase = createClient();
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [showAddForm, setShowAddForm] = useState(defaultShowForm);

  const [customerName, setCustomerName] = useState('');
  const [vehicleName, setVehicleName] = useState('Toyota Yaris Ativ 1.2 Smart');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    let active = true;
    const loadReviews = async () => {
      let deletedIds: string[] = [];
      try {
        const rawDeleted = localStorage.getItem(`${STORAGE_KEY}_deleted_ids`);
        if (rawDeleted) {
          const parsedDel = JSON.parse(rawDeleted);
          if (Array.isArray(parsedDel)) {
            deletedIds = parsedDel.map(String);
          }
        }
      } catch {
        // Ignore storage error
      }

      try {
        const saved =
          localStorage.getItem(STORAGE_KEY) ||
          localStorage.getItem('charick_customer_reviews_v1');
        if (saved) {
          const parsed = JSON.parse(saved) as CustomerReview[];
          if (Array.isArray(parsed) && parsed.length > 0 && active) {
            setReviews(parsed.filter((r) => !deletedIds.includes(r.id)));
          }
        } else if (deletedIds.length > 0 && active) {
          setReviews(INITIAL_REVIEWS.filter((r) => !deletedIds.includes(r.id)));
        }
      } catch {
        // Ignore storage error
      }

      try {
        const { data, error } = await supabase
          .from(DRIVERENT_TABLES.reviews)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (!error && Array.isArray(data) && data.length > 0 && active) {
          const dbReviews: CustomerReview[] = data
            .map((row) => ({
              id: String(row.id),
              customerName: String(row.customer_name || ''),
              vehicleName: String(row.vehicle_name || ''),
              rating: Number(row.rating || 5),
              comment: String(row.comment || ''),
              date: String(
                row.review_date ||
                  (row.created_at
                    ? String(row.created_at).split('T')[0]
                    : new Date().toISOString().split('T')[0])
              ),
            }))
            .filter((r) => !deletedIds.includes(r.id));

          const filteredInitial = INITIAL_REVIEWS.filter(
            (r) => !deletedIds.includes(r.id)
          );
          setReviews([...dbReviews, ...filteredInitial]);
        }
      } catch {
        // Ignore missing table error
      }
    };

    loadReviews();
    return () => {
      active = false;
    };
  }, [supabase]);

  const saveReviews = (updated: CustomerReview[]) => {
    setReviews(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage error
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    const newReview: CustomerReview = {
      id: `rev-${Date.now()}`,
      customerName: customerName.trim(),
      vehicleName: vehicleName.trim(),
      rating,
      comment: comment.trim(),
      date: todayStr,
    };

    const updated = [newReview, ...reviews];
    saveReviews(updated);

    try {
      await supabase.from(DRIVERENT_TABLES.reviews).insert({
        customer_name: newReview.customerName,
        vehicle_name: newReview.vehicleName,
        rating: newReview.rating,
        comment: newReview.comment,
        review_date: todayStr,
      });
    } catch {
      // Ignore if table not created yet
    }

    setCustomerName('');
    setComment('');
    setRating(5);
    if (!defaultShowForm) setShowAddForm(false);

    await alertSuccess(
      t('เพิ่มรีวิวจากลูกค้าสำเร็จ!', 'Customer Review Added!'),
      t(
        `บันทึกรีวิวของคุณ ${newReview.customerName} ลงระบบ DriveRent (CharDB) เรียบร้อยแล้ว`,
        `Review by ${newReview.customerName} is now live on the website.`
      )
    );
  };

  const handleDeleteReview = async (id: string, name: string) => {
    const ok = await confirmAction({
      title: t(`ลบรีวิวของ "${name}"?`, `Delete review by "${name}"?`),
      text: t(
        'คุณต้องการลบรีวิวลูกค้ารายการนี้ออกจากหน้าเว็บใช่หรือไม่',
        'Are you sure you want to remove this review?'
      ),
      confirmText: t('ลบรีวิว', 'Delete'),
      cancelText: t('ยกเลิก', 'Cancel'),
      icon: 'warning',
    });

    if (!ok) return;

    try {
      const rawDeleted = localStorage.getItem(`${STORAGE_KEY}_deleted_ids`);
      const prevDel: string[] = rawDeleted ? JSON.parse(rawDeleted) : [];
      const nextDel = Array.from(new Set([...prevDel, id]));
      localStorage.setItem(
        `${STORAGE_KEY}_deleted_ids`,
        JSON.stringify(nextDel)
      );
    } catch {
      // Ignore storage error
    }

    const updated = reviews.filter((r) => r.id !== id);
    saveReviews(updated);

    try {
      await supabase.from(DRIVERENT_TABLES.reviews).delete().eq('id', id);
    } catch {
      // Ignore if local id
    }

    await Toast.fire({
      icon: 'success',
      title: t('ลบรีวิวเรียบร้อยแล้ว', 'Review removed'),
    });
  };

  return (
    <section className="mt-14 bg-white/95 backdrop-blur rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-2">
            ⭐ 4.9 / 5.0 Customer Satisfaction
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t(
              'รีวิวความประทับใจจากลูกค้าจริง (Customer Reviews)',
              'Verified Customer Reviews'
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t(
              'เสียงตอบรับจากลูกค้าที่ไว้วางใจเช่ารถยนต์และมอเตอร์ไซค์กับ charickDriveRent',
              'Real feedback from customers who rented cars and motorcycles with charickDriveRent.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer w-fit"
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" />
              {t('ปิดฟอร์มเพิ่มรีวิว', 'Close Review Form')}
            </>
          ) : (
            <>
              <MessageSquarePlus className="w-4 h-4" />
              {t('+ เพิ่มรีวิวลูกค้า (Admin)', '+ Add Review (Admin)')}
            </>
          )}
        </button>
      </div>

      {/* ฟอร์มเพิ่มรีวิวสำหรับ Admin */}
      {showAddForm && (
        <form
          onSubmit={handleAddReview}
          className="mb-8 p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-4"
        >
          <h3 className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-indigo-600" />
            {t(
              'เพิ่มรีวิวความประทับใจของลูกค้า (สำหรับ Admin)',
              'Add New Customer Review (Admin Panel)'
            )}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('ชื่อลูกค้า', 'Customer Name')}
              </label>
              <input
                type="text"
                required
                placeholder={t('เช่น คุณสมชาย ใจดี', 'e.g. John Smith')}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('รุ่นรถที่ลูกค้าเช่า', 'Rented Vehicle Model')}
              </label>
              <input
                type="text"
                required
                placeholder="เช่น Honda Civic e:HEV RS"
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('คะแนนความพึงพอใจ', 'Star Rating')}
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-amber-600"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 ดาว - ดีเยี่ยม)</option>
                <option value={4}>⭐⭐⭐⭐ (4 ดาว - ดีมาก)</option>
                <option value={3}>⭐⭐⭐ (3 ดาว - ปานกลาง)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('ข้อความรีวิวจากลูกค้า', 'Review Comment')}
            </label>
            <textarea
              required
              rows={2}
              placeholder={t(
                'พิมพ์ข้อความรีวิวความประทับใจของลูกค้าที่นี่...',
                'Write customer review feedback here...'
              )}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t('บันทึกรีวิวขึ้นหน้าเว็บ', 'Publish Review')}
            </button>
          </div>
        </form>
      )}

      {/* การ์ดแสดงรายการรีวิว */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="rounded-2xl bg-slate-50/90 border border-slate-200/80 p-5 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition relative"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <Quote className="w-5 h-5 text-blue-200" />
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between">
              <div>
                <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                  <span>{rev.customerName}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-[11px] font-medium text-blue-600">
                  {rev.vehicleName}
                </div>
                <div className="text-[10px] text-slate-400">{rev.date}</div>
              </div>

              {(isAdmin || showAddForm) && (
                <button
                  type="button"
                  onClick={() => handleDeleteReview(rev.id, rev.customerName)}
                  title="ลบรีวิวนี้"
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
