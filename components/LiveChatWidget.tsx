'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/components/LanguageProvider';
import {
  INITIAL_WELCOME_MESSAGES,
  buildSmartAutoReply,
  createChatMessageId,
  deleteChatRoomMessages,
  deleteSpecificChatMessages,
  dispatchRealtimeChatMessage,
  getOrCreateVisitorRoomId,
  subscribeToRealtimeChat,
} from '@/lib/chat/storage';
import { confirmAction, Toast } from '@/lib/swal';
import type { ChatMessage } from '@/types/database';
import {
  MessageCircle,
  X,
  Send,
  PhoneCall,
  Mail,
  Sparkles,
  Headphones,
  CheckCheck,
  Loader2,
  MapPin,
  Lock,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';

interface LiveChatWidgetProps {
  userId?: string | null;
  defaultName?: string | null;
  defaultEmail?: string | null;
}

export default function LiveChatWidget({
  userId,
  defaultName,
  defaultEmail,
}: LiveChatWidgetProps) {
  const { lang, t } = useLanguage();
  const [supabase] = useState(() => createClient());

  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>(
    INITIAL_WELCOME_MESSAGES
  );
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [senderName, setSenderName] = useState(defaultName || '');
  const [senderPhone, setSenderPhone] = useState('');
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const prevCountRef = useRef<number>(1);
  const isOpenRef = useRef<boolean>(false);
  const sendingLockRef = useRef<boolean>(false);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // เมื่อผู้ใช้ Login / Logout หรือเปลี่ยนบัญชี ให้สลับรหัสห้องแชทส่วนตัว (roomId) และชื่อผู้ส่งทันที
  useEffect(() => {
    const activeRoom = getOrCreateVisitorRoomId(userId);
    setRoomId(activeRoom);
    setMessages(INITIAL_WELCOME_MESSAGES);
    setSelectMode(false);
    setSelectedMsgIds([]);
    prevCountRef.current = 1;
    setUnreadCount(0);

    if (defaultName) {
      setSenderName(defaultName);
    } else if (!userId) {
      setSenderName('');
    }
  }, [userId, defaultName]);

  // เชื่อมต่อระบบ Real-time Sync เฉพาะห้องแชทส่วนตัวของลูกค้าคนนี้เท่านั้น (ไม่เห็นแชทคนอื่น)
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRealtimeChat(
      supabase,
      (latestRoomMessages) => {
        setMessages((prev) => {
          if (
            prev.length > 0 &&
            latestRoomMessages.length > prevCountRef.current &&
            !isOpenRef.current
          ) {
            const added = latestRoomMessages.slice(prevCountRef.current);
            const adminAdded = added.filter(
              (m) => m.sender_role === 'admin'
            ).length;
            if (adminAdded > 0) {
              setUnreadCount((c) => c + adminAdded);
            }
          }
          prevCountRef.current = latestRoomMessages.length;
          return latestRoomMessages;
        });
      },
      { roomId, isAdmin: false }
    );

    return () => {
      unsubscribe();
    };
  }, [supabase, roomId]);

  // เลื่อนลงล่างสุดอัตโนมัติเมื่อมีข้อความใหม่เข้ามาแบบ Real-time
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  }, [messages.length, isOpen]);

  const deletableMessages = messages.filter(
    (m) => m.id !== INITIAL_WELCOME_MESSAGES[0].id
  );

  const toggleSelectMessage = (id: string) => {
    if (id === INITIAL_WELCOME_MESSAGES[0].id) return;
    setSelectedMsgIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllMessages = () => {
    if (selectedMsgIds.length === deletableMessages.length) {
      setSelectedMsgIds([]);
    } else {
      setSelectedMsgIds(deletableMessages.map((m) => m.id));
    }
  };

  const handleDeleteSelectedMessages = async () => {
    if (selectedMsgIds.length === 0) return;
    const activeRoom = roomId || getOrCreateVisitorRoomId(userId);

    const confirmed = await confirmAction({
      title: t(
        `ลบข้อความที่เลือก (${selectedMsgIds.length} ข้อความ)?`,
        `Delete selected messages (${selectedMsgIds.length})?`
      ),
      text: t(
        'เฉพาะข้อความที่คุณติ๊กเลือกไว้จะถูกลบออกจากห้องสนทนาทันที',
        'Only your selected messages will be permanently removed.'
      ),
      confirmText: t(
        `ลบที่เลือก (${selectedMsgIds.length})`,
        `Delete (${selectedMsgIds.length})`
      ),
      cancelText: t('ยกเลิก', 'Cancel'),
      icon: 'warning',
    });

    if (!confirmed) return;

    await deleteSpecificChatMessages(selectedMsgIds, activeRoom, supabase);
    setSelectedMsgIds([]);
    setSelectMode(false);

    await Toast.fire({
      icon: 'success',
      title: t('ลบข้อความที่เลือกเรียบร้อยแล้ว', 'Selected messages deleted'),
    });
  };

  const handleClearMyChat = async () => {
    const activeRoom = roomId || getOrCreateVisitorRoomId(userId);
    const confirmed = await confirmAction({
      title: t(
        'ลบประวัติแชทของคุณทั้งหมด?',
        'Clear all your private chat history?'
      ),
      text: t(
        'ข้อความทั้งหมดในห้องสนทนาของคุณจะถูกลบออกทันที',
        'All messages in your current private chat session will be removed.'
      ),
      confirmText: t('ใช่, ลบทั้งหมด', 'Yes, Clear All'),
      cancelText: t('ยกเลิก', 'Cancel'),
      icon: 'warning',
    });

    if (!confirmed) return;

    await deleteChatRoomMessages(activeRoom, supabase);
    if (!userId) {
      const newGuestRoom = getOrCreateVisitorRoomId(null, true);
      setRoomId(newGuestRoom);
    }
    setMessages(INITIAL_WELCOME_MESSAGES);
    setSelectedMsgIds([]);
    setSelectMode(false);
    prevCountRef.current = 1;
    setUnreadCount(0);

    await Toast.fire({
      icon: 'success',
      title: t('ลบประวัติแชททั้งหมดเรียบร้อยแล้ว', 'All chat history cleared'),
    });
  };

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || sending || sendingLockRef.current) return;

    sendingLockRef.current = true;
    const activeRoomId = roomId || getOrCreateVisitorRoomId(userId);
    if (!roomId) {
      setRoomId(activeRoomId);
    }

    const customerName =
      senderName.trim() ||
      defaultName ||
      t('ลูกค้าหน้าเว็บ', 'Web Visitor');
    const customerPhone = senderPhone.trim() || '-';

    setSending(true);
    setInputText('');

    const customerMsg: ChatMessage = {
      id: createChatMessageId(),
      room_id: activeRoomId,
      sender_name: customerName,
      sender_phone: customerPhone,
      sender_email: defaultEmail || '',
      sender_role: 'customer',
      message: trimmed,
      channel: 'live_chat',
      created_at: new Date().toISOString(),
    };

    const nextList = await dispatchRealtimeChatMessage(supabase, customerMsg);
    setMessages(nextList);

    // ตอบกลับอัตโนมัติเฉพาะกรณีเป็นคำถามด่วนเรื่องสนามบิน/มัดจำ 30%/เอกสาร
    const lower = trimmed.toLowerCase();
    const isFaqKeyword =
      lower.includes('สนามบิน') ||
      lower.includes('30%') ||
      lower.includes('มัดจำ') ||
      lower.includes('เอกสาร') ||
      lower.includes('airport') ||
      lower.includes('deposit') ||
      lower.includes('document');

    if (isFaqKeyword) {
      setTimeout(async () => {
        const autoReplyText = buildSmartAutoReply(trimmed, lang);
        const replyMsg: ChatMessage = {
          id: createChatMessageId(),
          room_id: activeRoomId,
          sender_name: t(
            'ผู้ช่วยอัตโนมัติ (สาขาหาดใหญ่)',
            'Hat Yai Auto-Assistant'
          ),
          sender_phone: '089-999-8888',
          sender_email: 'startdoing4you@gmail.com',
          sender_role: 'admin',
          message: autoReplyText,
          channel: 'live_chat',
          created_at: new Date().toISOString(),
        };
        const updated = await dispatchRealtimeChatMessage(supabase, replyMsg);
        setMessages(updated);
        setSending(false);
        sendingLockRef.current = false;
      }, 450);
    } else {
      setSending(false);
      sendingLockRef.current = false;
    }
  };

  const quickQuestions = [
    {
      label: t(
        '✈️ รับรถสนามบินหาดใหญ่ฟรีไหม?',
        '✈️ Free Hat Yai Airport pickup?'
      ),
      text: t(
        'มีบริการรับ-ส่งรถที่สนามบินหาดใหญ่ฟรีไหมครับ?',
        'Do you offer free pickup at Hat Yai Airport?'
      ),
    },
    {
      label: t(
        '💳 จองจ่ายมัดจำ 30% อย่างไร?',
        '💳 How does 30% deposit work?'
      ),
      text: t(
        'ระบบจองจ่ายมัดจำก่อน 30% ที่เหลือจ่ายตอนรับรถใช่ไหมครับ?',
        'How does the 30% deposit and 70% payment at pickup work?'
      ),
    },
    {
      label: t('🪪 ใช้เอกสารอะไรบ้าง?', '🪪 Required documents?'),
      text: t(
        'เช่ารถที่สาขาหาดใหญ่ต้องใช้เอกสารอะไรบ้างครับ?',
        'What documents are required to rent a vehicle?'
      ),
    },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* หน้าต่างแชทสดส่วนตัว (Private 1-on-1 Live Chat Window) */}
      {isOpen && (
        <div className="mb-3 w-[350px] sm:w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* ส่วนหัวหน้าต่างแชท */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-md">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold">
                    charickDriveRent Live Chat
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                    <Lock className="w-2.5 h-2.5" />
                    {t('แชทส่วนตัว', 'Private')}
                  </span>
                </div>
                <p className="text-[11px] text-blue-200 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-cyan-300" />
                  {t(
                    'ห้องสนทนาส่วนตัวกับแอดมินหาดใหญ่ • Real-time',
                    'Private 1-on-1 Chat with Hat Yai Admin'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {deletableMessages.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectMode((prev) => !prev);
                      setSelectedMsgIds([]);
                    }}
                    title={t(
                      'เลือกข้อความก่อนลบ',
                      'Select messages to delete'
                    )}
                    className={`px-2 py-1 rounded-xl text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer ${
                      selectMode
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white'
                    }`}
                  >
                    <CheckSquare className="w-3 h-3" />
                    <span>{t('เลือกลบ', 'Select')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearMyChat}
                    title={t(
                      'ลบประวัติแชททั้งหมด',
                      'Clear all chat history'
                    )}
                    className="px-2 py-1 rounded-xl text-[10px] font-bold inline-flex items-center gap-1 bg-rose-500/80 hover:bg-rose-600 text-white transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t('ลบทั้งหมด', 'Clear All')}</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* แถบจัดการเมื่อเปิดโหมด "เลือกลบ" (Select Before Delete Toolbar) */}
          {selectMode && deletableMessages.length > 0 && (
            <div className="bg-rose-50 px-3.5 py-2 border-b border-rose-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={toggleSelectAllMessages}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-blue-700 cursor-pointer"
              >
                {selectedMsgIds.length === deletableMessages.length ? (
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>
                  {selectedMsgIds.length === deletableMessages.length
                    ? t('ยกเลิกเลือกทั้งหมด', 'Unselect All')
                    : t('เลือกทั้งหมด', 'Select All')}
                </span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={selectedMsgIds.length === 0}
                  onClick={handleDeleteSelectedMessages}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>
                    {t(
                      `ลบที่เลือก (${selectedMsgIds.length})`,
                      `Delete (${selectedMsgIds.length})`
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleClearMyChat}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-white hover:bg-rose-100 border border-rose-300 px-2 py-1 rounded-lg transition cursor-pointer"
                >
                  <span>{t('ลบทั้งหมด', 'Clear All')}</span>
                </button>
              </div>
            </div>
          )}

          {/* ช่องระบุชื่อและเบอร์โทร */}
          <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder={t('ชื่อของคุณ (ไม่บังคับ)', 'Your Name (Optional)')}
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] text-slate-800 focus:border-blue-600 focus:outline-none"
            />
            <input
              type="tel"
              placeholder={t('เบอร์โทรติดต่อกลับ', 'Phone Number')}
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] text-slate-800 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* รายการข้อความแชทส่วนตัวแบบ Real-time */}
          <div className="h-72 overflow-y-auto p-3.5 space-y-3 bg-gradient-to-b from-slate-50/80 to-white">
            {messages.map((msg) => {
              const isCustomer = msg.sender_role === 'customer';
              const isWelcome = msg.id === INITIAL_WELCOME_MESSAGES[0].id;
              const isSelected = selectedMsgIds.includes(msg.id);

              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    if (selectMode && !isWelcome) {
                      toggleSelectMessage(msg.id);
                    }
                  }}
                  className={`flex flex-col rounded-xl p-1 transition ${
                    isCustomer ? 'items-end' : 'items-start'
                  } ${
                    selectMode && !isWelcome ? 'cursor-pointer' : ''
                  } ${
                    isSelected ? 'bg-rose-50 ring-1 ring-rose-300' : ''
                  }`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium inline-flex items-center gap-1">
                    {selectMode && !isWelcome && (
                      <span
                        className={
                          isSelected ? 'text-rose-600' : 'text-slate-400'
                        }
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                    {isCustomer
                      ? `${msg.sender_name} ${
                          msg.sender_phone && msg.sender_phone !== '-'
                            ? `(${msg.sender_phone})`
                            : ''
                        }`
                      : `🛡️ ${msg.sender_name}`}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                      isCustomer
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs'
                        : 'bg-white border border-blue-200 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 px-1 inline-flex items-center gap-1">
                    {new Date(msg.created_at).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                    {isCustomer && (
                      <CheckCheck className="w-3 h-3 text-blue-500" />
                    )}
                  </span>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* ปุ่มคำถามยอดฮิต (Quick Replies) */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(q.text)}
                className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 transition cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* ฟอร์มพิมพ์ข้อความ */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputText);
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t(
                'พิมพ์ข้อความคุยส่วนตัวกับแอดมินสาขาหาดใหญ่...',
                'Type your private message to Hat Yai Admin...'
              )}
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 text-white transition cursor-pointer"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          {/* แถบช่องทางติดต่อด่วน */}
          <div className="bg-slate-900 text-slate-300 px-3.5 py-2 text-[11px] flex items-center justify-between">
            <a
              href="tel:0899998888"
              className="inline-flex items-center gap-1 hover:text-white font-semibold"
            >
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span>074-234-567 / 089-999-8888</span>
            </a>
            <a
              href="mailto:startdoing4you@gmail.com"
              className="inline-flex items-center gap-1 hover:text-white font-semibold text-cyan-300"
            >
              <Mail className="w-3 h-3" />
              <span>startdoing4you@gmail.com</span>
            </a>
          </div>
        </div>
      )}

      {/* ปุ่มลอยเปิด-ปิด Live Chat มุมขวาล่าง */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-3.5 rounded-full shadow-xl shadow-blue-900/30 border border-white/20 transition-all hover:scale-105 cursor-pointer"
      >
        {unreadCount > 0 && (
          <span className="absolute -top-2 -left-2 min-w-6 h-6 px-1.5 rounded-full bg-rose-500 text-white text-xs font-black flex items-center justify-center shadow-md animate-bounce">
            {unreadCount}
          </span>
        )}
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-blue-700 animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-blue-700" />
        </div>
        <div className="text-left leading-tight">
          <span className="block text-xs font-extrabold">
            {t('แชทสดกับเรา (Live Chat)', 'Live Chat Support')}
          </span>
          <span className="block text-[10px] text-blue-100">
            {t('สาขาหาดใหญ่ • Real-time 24 ชม.', 'Hat Yai Branch • Real-time 24/7')}
          </span>
        </div>
      </button>
    </div>
  );
}
