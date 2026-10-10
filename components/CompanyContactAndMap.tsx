'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/components/LanguageProvider';
import { alertSuccess, alertError } from '@/lib/swal';
import {
  createChatMessageId,
  dispatchRealtimeChatMessage,
  getOrCreateVisitorRoomId,
} from '@/lib/chat/storage';
import {
  MapPin,
  PhoneCall,
  Mail,
  Clock,
  MessageCircle,
  Send,
  ExternalLink,
  Building2,
  Loader2,
  Plane,
} from 'lucide-react';

const ADMIN_EMAIL = 'startdoing4you@gmail.com';

export default function CompanyContactAndMap() {
  const { t } = useLanguage();
  const [supabase] = useState(() => createClient());
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;

    setSending(true);
    try {
      await dispatchRealtimeChatMessage(supabase, {
        id: createChatMessageId(),
        room_id: getOrCreateVisitorRoomId(),
        sender_name: senderName,
        sender_phone: senderPhone,
        sender_email: senderEmail,
        sender_role: 'customer',
        message: `[ฟอร์มติดต่อด่วน] ${messageText}`,
        channel: 'quick_inquiry',
        created_at: new Date().toISOString(),
      });

      await alertSuccess(
        t(
          'ส่งข้อความไปยังอีเมล Admin สำเร็จ!',
          'Message Sent to Admin Successfully!'
        ),
        t(
          `ส่งข้อมูลของคุณ ${senderName} (เบอร์ ${senderPhone}) ไปยังอีเมลแอดมิน ${ADMIN_EMAIL} และระบบกล่องข้อความสาขาหาดใหญ่เรียบร้อยแล้วครับ`,
          `Your inquiry has been sent to Admin email (${ADMIN_EMAIL}) and our Hat Yai branch inbox. We will contact you at ${senderPhone} shortly.`
        )
      );

      setSenderName('');
      setSenderPhone('');
      setSenderEmail('');
      setMessageText('');
    } catch (err) {
      await alertError(
        t('ส่งข้อความไม่สำเร็จ', 'Failed to Send Message'),
        err instanceof Error ? err.message : 'กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contact-section"
      className="mt-14 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl scroll-mt-20"
    >
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 mb-2">
          <MapPin className="w-3.5 h-3.5" />
          {t(
            'สาขาหาดใหญ่ จ.สงขลา (Hat Yai, Songkhla Branch)',
            'Hat Yai, Songkhla Headquarters & Airport Pickup'
          )}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t(
            'ติดต่อเรา & แผนที่ตั้งบริษัท (หาดใหญ่ จ.สงขลา)',
            'Contact Us & Company Location (Hat Yai, Songkhla)'
          )}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {t(
            'บริการรับ-ส่งรถเช่าฟรีที่สนามบินนานาชาติหาดใหญ่ ม.อ. หาดใหญ่ และทั่วตัวเมืองหาดใหญ่ ตลอด 24 ชั่วโมง',
            'Free vehicle delivery at Hat Yai International Airport (HDY), PSU Hat Yai, and downtown Hat Yai 24/7.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ข้อมูลติดต่อบริษัท + ฟอร์มติดต่อด่วนส่งเข้า startdoing4you@gmail.com */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {t(
                    'บริษัท ชาริค ไดร์ฟเรนท์ จำกัด (สำนักงานใหญ่ หาดใหญ่)',
                    'charickDriveRent Co., Ltd. (Hat Yai Headquarters)'
                  )}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {t(
                    '99/88 ถนนกาญจนวนิช ตำบลคอหงส์ อำเภอหาดใหญ่ จังหวัดสงขลา 90110 (ใกล้ ม.อ. หาดใหญ่ และสนามบินนานาชาติหาดใหญ่)',
                    '99/88 Kanchanavanich Rd, Kho Hong, Hat Yai District, Songkhla 90110, Thailand (Near PSU & Hat Yai Airport)'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="text-slate-500 block">
                  {t(
                    'สายด่วนจองรถสาขาหาดใหญ่ / ฉุกเฉิน 24 ชม.',
                    '24/7 Hat Yai Booking & Hotline'
                  )}
                </span>
                <a
                  href="tel:0899998888"
                  className="font-extrabold text-slate-900 hover:text-blue-600 text-sm"
                >
                  074-234-567 , 089-999-8888
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="text-slate-500 block">
                  LINE Official / Live Chat 24 ชม.
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  @charickDriveRent
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="text-slate-500 block">
                  {t(
                    'อีเมลแอดมิน & ฝ่ายบริการลูกค้า (รับแจ้งเตือนโดยตรง)',
                    'Admin & Customer Support Email'
                  )}
                </span>
                <a
                  href={`mailto:${ADMIN_EMAIL}`}
                  className="font-bold text-blue-600 hover:underline"
                >
                  {ADMIN_EMAIL}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="text-slate-500 block">
                  {t('วันและเวลาทำการ', 'Business Hours')}
                </span>
                <span className="font-bold text-slate-900">
                  {t(
                    'เปิดบริการทุกวัน ตลอด 24 ชั่วโมง (รับ-ส่งรถทุกเที่ยวบิน)',
                    'Open Daily 24 Hours (All Flight Arrivals Supported)'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* ฟอร์มส่งข้อความติดต่อด่วน ส่งตรงไปที่อีเมล startdoing4you@gmail.com และกล่องแชทแอดมิน */}
          <form
            onSubmit={handleSendContact}
            className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/70 border border-blue-200/90 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                {t(
                  'ส่งข้อความติดต่อด่วนถึงแอดมิน (Quick Inquiry)',
                  'Quick Inquiry to Admin'
                )}
              </h4>
              <span className="text-[10px] font-semibold bg-white text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                📩 {ADMIN_EMAIL}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                required
                placeholder={t('ชื่อของคุณ *', 'Your Name *')}
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
              <input
                type="tel"
                required
                placeholder={t('เบอร์โทรศัพท์ติดต่อกลับ *', 'Phone Number *')}
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <input
              type="email"
              placeholder={t(
                'อีเมลของคุณ (ไม่บังคับ - เพื่อรับข้อความตอบกลับทางอีเมล)',
                'Your Email (Optional)'
              )}
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />

            <textarea
              required
              rows={2}
              placeholder={t(
                'ระบุรุ่นรถ ช่วงวันที่ต้องการเช่า เที่ยวบินสนามบินหาดใหญ่ หรือจุดรับ-ส่งรถ...',
                'Specify vehicle model, rental dates, Hat Yai flight number, or pickup point...'
              )}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />

            <button
              type="submit"
              disabled={sending}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer shadow-sm"
            >
              {sending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {t(
                'ส่งข้อความเข้าอีเมล Admin & ระบบแชทสาขาหาดใหญ่',
                'Send Message to Admin Email & Inbox'
              )}
            </button>
          </form>
        </div>

        {/* แผนที่ Google Maps ที่อยู่บริษัท อ.หาดใหญ่ จ.สงขลา */}
        <div className="lg:col-span-7 space-y-3">
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[450px] bg-slate-100 relative">
            <iframe
              title="charickDriveRent Hat Yai Songkhla Map"
              src="https://www.google.com/maps?q=7.0086,100.4747&hl=th&z=14&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-slate-50 px-4 py-3.5 rounded-2xl border border-slate-200">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <Plane className="w-4 h-4 text-blue-600 shrink-0" />
              {t(
                'จุดรับ-ส่งรถฟรี: สนามบินนานาชาติหาดใหญ่ (HDY) • ม.อ. หาดใหญ่ • สถานีรถไฟหาดใหญ่ • เซ็นทรัลเฟสติวัล หาดใหญ่',
                'Free Pickup Points: Hat Yai Airport (HDY) • PSU Hat Yai • Hat Yai Train Station • CentralFestival Hat Yai'
              )}
            </span>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Hat+Yai+Songkhla"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline shrink-0"
            >
              {t(
                'เปิดพิกัดหาดใหญ่ใน Google Maps',
                'Open Hat Yai in Google Maps'
              )}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
