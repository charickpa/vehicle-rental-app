'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  INITIAL_WELCOME_MESSAGES,
  createChatMessageId,
  deleteChatRoomMessages,
  deleteMultipleChatRooms,
  deleteSpecificChatMessages,
  dispatchRealtimeChatMessage,
  subscribeToRealtimeChat,
} from '@/lib/chat/storage';
import { Toast, confirmAction } from '@/lib/swal';
import type { ChatMessage } from '@/types/database';
import {
  MessageSquareMore,
  Send,
  Phone,
  Mail,
  User,
  Clock,
  Loader2,
  Radio,
  Sparkles,
  CheckCheck,
  Users,
  Trash2,
  Lock,
  CheckSquare,
  Square,
} from 'lucide-react';

interface CustomerRoomSummary {
  roomId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  lastMessage: string;
  lastAt: string;
  totalMessages: number;
  customerMessagesCount: number;
  channel: 'live_chat' | 'quick_inquiry';
}

export default function AdminChatInbox() {
  const [supabase] = useState(() => createClient());
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [checkedRoomIds, setCheckedRoomIds] = useState<string[]>([]);
  const [checkedMessageIds, setCheckedMessageIds] = useState<string[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const chatStreamBottomRef = useRef<HTMLDivElement | null>(null);
  const prevLenRef = useRef<number>(0);
  const sendingLockRef = useRef<boolean>(false);

  // เชื่อมต่อระบบ Real-time Sync สำหรับ Admin (isAdmin: true จะดึงข้อความของลูกค้าทุกห้องมารวมใน Dashboard แห่งเดียว)
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeChat(
      supabase,
      (latestMessages) => {
        setAllMessages(latestMessages);
        setLastSyncTime(
          new Date().toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );
      },
      { isAdmin: true }
    );

    return () => {
      unsubscribe();
    };
  }, [supabase]);

  // จัดกลุ่มข้อความแยกตามห้องแชทส่วนตัวของลูกค้าแต่ละคน (room_id)
  const customerRooms = useMemo<CustomerRoomSummary[]>(() => {
    const roomMap = new Map<string, ChatMessage[]>();

    for (const msg of allMessages) {
      const rId = msg.room_id || 'legacy:previous-session';
      if (rId === 'welcome' || msg.id === INITIAL_WELCOME_MESSAGES[0].id) {
        continue;
      }
      const list = roomMap.get(rId) || [];
      list.push(msg);
      roomMap.set(rId, list);
    }

    const summaries: CustomerRoomSummary[] = [];

    for (const [roomId, list] of roomMap.entries()) {
      const customerMsgs = list.filter((m) => m.sender_role === 'customer');
      if (list.length === 0) continue;

      const latestCustomerMsg =
        customerMsgs[customerMsgs.length - 1] || list[0];
      const latestAnyMsg = list[list.length - 1];

      summaries.push({
        roomId,
        customerName:
          latestCustomerMsg.sender_name &&
          !latestCustomerMsg.sender_name.includes('charickDriveRent')
            ? latestCustomerMsg.sender_name
            : 'ลูกค้าผู้เยี่ยมชม',
        customerPhone: latestCustomerMsg.sender_phone || '-',
        customerEmail:
          latestCustomerMsg.sender_email &&
          latestCustomerMsg.sender_email !== 'startdoing4you@gmail.com'
            ? latestCustomerMsg.sender_email
            : '',
        lastMessage: latestAnyMsg.message,
        lastAt: latestAnyMsg.created_at,
        totalMessages: list.length,
        customerMessagesCount: customerMsgs.length,
        channel: latestCustomerMsg.channel || 'live_chat',
      });
    }

    return summaries.sort(
      (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
    );
  }, [allMessages]);

  // เลือกห้องแชทล่าสุดอัตโนมัติหากยังไม่ได้เลือกห้อง และล้างรายการที่ติ๊กไว้หากห้องถูกลบไปแล้ว
  useEffect(() => {
    const validRoomIds = new Set(customerRooms.map((r) => r.roomId));
    setCheckedRoomIds((prev) => prev.filter((id) => validRoomIds.has(id)));

    if (customerRooms.length === 0) {
      if (selectedRoomId) setSelectedRoomId('');
      return;
    }
    const stillExists = customerRooms.some((r) => r.roomId === selectedRoomId);
    if (!selectedRoomId || !stillExists) {
      setSelectedRoomId(customerRooms[0].roomId);
    }
  }, [customerRooms, selectedRoomId]);

  // เมื่อเปลี่ยนห้องแชทที่เปิดดู ให้ล้างการติ๊กเลือกข้อความรายบรรทัด
  useEffect(() => {
    setCheckedMessageIds([]);
  }, [selectedRoomId]);

  // ข้อความเฉพาะของห้องลูกค้าที่แอดมินกำลังเลือกดูอยู่
  const activeRoomMessages = useMemo(() => {
    if (!selectedRoomId) return [];
    return allMessages.filter(
      (m) =>
        m.room_id === selectedRoomId &&
        m.id !== INITIAL_WELCOME_MESSAGES[0].id
    );
  }, [allMessages, selectedRoomId]);

  const activeRoomSummary = useMemo(
    () => customerRooms.find((r) => r.roomId === selectedRoomId) || null,
    [customerRooms, selectedRoomId]
  );

  useEffect(() => {
    if (activeRoomMessages.length !== prevLenRef.current) {
      prevLenRef.current = activeRoomMessages.length;
      setTimeout(() => {
        chatStreamBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  }, [activeRoomMessages.length, selectedRoomId]);

  // สลับการติ๊กเลือกห้องแชททางซ้าย
  const toggleCheckRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedRoomIds((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  // เลือก/ยกเลิกเลือกห้องแชททั้งหมดทางซ้าย
  const toggleSelectAllRooms = () => {
    if (checkedRoomIds.length === customerRooms.length) {
      setCheckedRoomIds([]);
    } else {
      setCheckedRoomIds(customerRooms.map((r) => r.roomId));
    }
  };

  // สลับการติ๊กเลือกข้อความรายบรรทัดทางขวา
  const toggleCheckMessage = (msgId: string) => {
    setCheckedMessageIds((prev) =>
      prev.includes(msgId)
        ? prev.filter((id) => id !== msgId)
        : [...prev, msgId]
    );
  };

  // เลือก/ยกเลิกเลือกข้อความทั้งหมดในห้องที่กำลังเปิดดู
  const toggleSelectAllMessagesInRoom = () => {
    if (checkedMessageIds.length === activeRoomMessages.length) {
      setCheckedMessageIds([]);
    } else {
      setCheckedMessageIds(activeRoomMessages.map((m) => m.id));
    }
  };

  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed || !selectedRoomId || sending || sendingLockRef.current) {
      return;
    }

    sendingLockRef.current = true;
    setSending(true);
    setReplyText('');

    const adminMsg: ChatMessage = {
      id: createChatMessageId(),
      room_id: selectedRoomId,
      sender_name: 'แอดมิน charickDriveRent (สาขาหาดใหญ่)',
      sender_phone: '089-999-8888',
      sender_email: 'startdoing4you@gmail.com',
      sender_role: 'admin',
      message: trimmed,
      channel: 'live_chat',
      created_at: new Date().toISOString(),
      is_read: true,
    };

    try {
      await dispatchRealtimeChatMessage(supabase, adminMsg);
    } finally {
      setSending(false);
      sendingLockRef.current = false;
    }

    await Toast.fire({
      icon: 'success',
      title: `ส่งข้อความตอบกลับคุณ ${
        activeRoomSummary?.customerName || 'ลูกค้า'
      } สำเร็จ!`,
    });
  };

  // 1. ลบห้องแชทห้องเดียว (ห้องที่กำลังเปิดดู)
  const handleDeleteRoom = async (roomToDelete: CustomerRoomSummary) => {
    const confirmed = await confirmAction({
      title: `ลบประวัติแชทของคุณ "${roomToDelete.customerName}"?`,
      text: 'เมื่อลบแล้ว ข้อความของห้องแชทนี้จะถูกลบออกจากทั้งหน้า Admin Dashboard และฐานข้อมูลทันทีโดยไม่เด้งกลับมาอีก',
      confirmText: 'ใช่, ลบห้องแชทนี้ทันที',
      icon: 'warning',
    });
    if (!confirmed) return;

    setDeletingRoom(true);
    try {
      const updated = await deleteChatRoomMessages(
        roomToDelete.roomId,
        supabase
      );
      setAllMessages(updated);
      setCheckedRoomIds((prev) =>
        prev.filter((id) => id !== roomToDelete.roomId)
      );
      setCheckedMessageIds([]);
      await Toast.fire({
        icon: 'success',
        title: `ลบประวัติแชทของคุณ "${roomToDelete.customerName}" เรียบร้อยแล้ว`,
      });
    } finally {
      setDeletingRoom(false);
    }
  };

  // 2. ลบเฉพาะห้องแชทที่ติ๊กเลือกไว้ (Select Rooms Before Delete)
  const handleDeleteSelectedRooms = async () => {
    if (checkedRoomIds.length === 0) return;

    const selectedNames = customerRooms
      .filter((r) => checkedRoomIds.includes(r.roomId))
      .map((r) => r.customerName)
      .join(', ');

    const confirmed = await confirmAction({
      title: `ยืนยันลบห้องแชทที่เลือก (${checkedRoomIds.length} ห้อง)?`,
      text: `ต้องการลบประวัติแชทของ: ${selectedNames} ออกจากระบบอย่างถาวรใช่หรือไม่?`,
      confirmText: `ใช่, ลบ ${checkedRoomIds.length} ห้องที่เลือก`,
      icon: 'warning',
    });
    if (!confirmed) return;

    setDeletingRoom(true);
    try {
      const updated = await deleteMultipleChatRooms(checkedRoomIds, supabase);
      setAllMessages(updated);
      setCheckedRoomIds([]);
      setCheckedMessageIds([]);
      await Toast.fire({
        icon: 'success',
        title: `ลบห้องแชทที่เลือก (${checkedRoomIds.length} ห้อง) เรียบร้อยแล้ว`,
      });
    } finally {
      setDeletingRoom(false);
    }
  };

  // 3. ปุ่มลบทั้งหมด (ลบทุกห้องแชทในระบบพร้อมกัน)
  const handleDeleteAllRooms = async () => {
    if (customerRooms.length === 0) return;

    const allRoomIds = customerRooms.map((r) => r.roomId);
    const confirmed = await confirmAction({
      title: `ยืนยันลบประวัติแชททั้งหมด (${allRoomIds.length} ห้อง)?`,
      text: 'ข้อความสนทนาของลูกค้าทุกห้องในระบบจะถูกล้างออกจากหน้า Admin Dashboard และฐานข้อมูลทั้งหมดทันที',
      confirmText: `ใช่, ลบแชททั้งหมด (${allRoomIds.length} ห้อง)`,
      icon: 'warning',
    });
    if (!confirmed) return;

    setDeletingRoom(true);
    try {
      const updated = await deleteMultipleChatRooms(allRoomIds, supabase);
      setAllMessages(updated);
      setCheckedRoomIds([]);
      setCheckedMessageIds([]);
      await Toast.fire({
        icon: 'success',
        title: 'ล้างประวัติแชททั้งหมดในระบบเรียบร้อยแล้ว',
      });
    } finally {
      setDeletingRoom(false);
    }
  };

  // 4. ลบเฉพาะข้อความที่ติ๊กเลือกในห้องสนทนาปัจจุบัน (Select Messages Before Delete)
  const handleDeleteSelectedMessages = async () => {
    if (checkedMessageIds.length === 0 || !selectedRoomId) return;

    const confirmed = await confirmAction({
      title: `ลบข้อความที่เลือก (${checkedMessageIds.length} ข้อความ)?`,
      text: 'เฉพาะข้อความที่คุณติ๊กเลือกไว้จะถูกลบออกจากห้องสนทนานี้ทันที',
      confirmText: `ใช่, ลบ ${checkedMessageIds.length} ข้อความที่เลือก`,
      icon: 'warning',
    });
    if (!confirmed) return;

    setDeletingRoom(true);
    try {
      const updated = await deleteSpecificChatMessages(
        checkedMessageIds,
        selectedRoomId,
        supabase
      );
      setAllMessages(updated);
      const count = checkedMessageIds.length;
      setCheckedMessageIds([]);
      await Toast.fire({
        icon: 'success',
        title: `ลบข้อความที่เลือก (${count} ข้อความ) เรียบร้อยแล้ว`,
      });
    } finally {
      setDeletingRoom(false);
    }
  };

  const quickAdminReplies = [
    'สวัสดีครับ แอดมินสาขาหาดใหญ่ยินดีให้บริการครับ สนใจเช่ารถรุ่นไหนและรับรถวันไหนดีครับ?',
    'คิวรถรุ่นนี้ยังว่างครับ สามารถกดจองและโอนมัดจำ 30% หน้าเว็บเพื่อล็อกคิวรถได้เลยครับ',
    'รับ-ส่งรถฟรีที่สนามบินหาดใหญ่ครับ แจ้งไฟล์ทบินและเวลาลงเครื่องไว้ได้เลยครับ',
  ];

  const totalCustomerMessages = allMessages.filter(
    (m) => m.sender_role === 'customer'
  ).length;

  const isAllRoomsChecked =
    customerRooms.length > 0 && checkedRoomIds.length === customerRooms.length;
  const isAllMessagesInRoomChecked =
    activeRoomMessages.length > 0 &&
    checkedMessageIds.length === activeRoomMessages.length;

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      {/* ส่วนหัวกล่องแชทแอดมิน พร้อมปุ่มเลือกก่อนลบและปุ่มลบทั้งหมด */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquareMore className="w-5 h-5 text-blue-600" />
              ระบบแชทแอดมิน (แยกห้องสนทนาส่วนตัวตามลูกค้าแต่ละราย)
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Real-time 1-on-1 Rooms
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            สามารถติ๊ก ☑️ เลือกห้องแชทหรือเลือกข้อความที่ต้องการลบก่อนกดลบ หรือกดปุ่ม &ldquo;ลบแชททั้งหมด&rdquo; ได้ทันที
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end shrink-0">
          <div className="text-left sm:text-right mr-1">
            <span className="text-xs font-bold text-slate-700 block">
              ห้องแชททั้งหมด: {customerRooms.length} ห้อง ({totalCustomerMessages}{' '}
              ข้อความลูกค้า)
            </span>
            {lastSyncTime && (
              <span className="text-[11px] text-emerald-600 font-medium">
                ซิงค์ล่าสุดอัตโนมัติ: {lastSyncTime}
              </span>
            )}
          </div>

          {customerRooms.length > 0 && (
            <button
              type="button"
              disabled={deletingRoom}
              onClick={handleDeleteAllRooms}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ลบแชททั้งหมด ({customerRooms.length} ห้อง)</span>
            </button>
          )}
        </div>
      </div>

      {/* โครงสร้าง 2 คอลัมน์: ซ้าย = รายชื่อห้องแชทลูกค้าแต่ละคน | ขวา = หน้าต่างสนทนาของคนที่เลือก */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* คอลัมน์ซ้าย: รายชื่อห้องแชทลูกค้าแยกตามรายบุคคล + Checkbox เลือกก่อนลบ */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 flex flex-col h-[460px]">
          <div className="flex flex-col gap-2 px-1 pb-2.5 mb-2 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 inline-flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                รายชื่อห้องแชท ({customerRooms.length})
              </span>
              {customerRooms.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAllRooms}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-lg transition cursor-pointer"
                >
                  {isAllRoomsChecked ? (
                    <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>
                    {isAllRoomsChecked ? 'ยกเลิกเลือกทั้งหมด' : 'เลือกทั้งหมด'}
                  </span>
                </button>
              )}
            </div>

            {/* แถบปุ่มลบห้องที่ติ๊กเลือก + ปุ่มลบทั้งหมด */}
            {customerRooms.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={checkedRoomIds.length === 0 || deletingRoom}
                  onClick={handleDeleteSelectedRooms}
                  className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>
                    ลบห้องที่เลือก ({checkedRoomIds.length})
                  </span>
                </button>

                <button
                  type="button"
                  disabled={deletingRoom}
                  onClick={handleDeleteAllRooms}
                  className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>ลบทั้งหมด</span>
                </button>
              </div>
            )}
          </div>

          {customerRooms.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-slate-400">
              <MessageSquareMore className="w-8 h-8 mb-2 stroke-1" />
              <p className="text-xs font-semibold text-slate-600">
                ยังไม่มีลูกค้าทักแชทเข้ามา
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                เมื่อลูกค้าพิมพ์แชทมาจากหน้าเว็บ ห้องแชทส่วนตัวของลูกค้าจะเด้งขึ้นที่นี่ทันที
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {customerRooms.map((room) => {
                const isSelected = room.roomId === selectedRoomId;
                const isRoomChecked = checkedRoomIds.includes(room.roomId);
                const isLoggedUser = room.roomId.startsWith('user:');
                return (
                  <div
                    key={room.roomId}
                    onClick={() => setSelectedRoomId(room.roomId)}
                    className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : isRoomChecked
                        ? 'bg-rose-50/70 text-slate-800 border-rose-300'
                        : 'bg-white hover:bg-blue-50/60 text-slate-800 border-slate-200'
                    }`}
                  >
                    {/* Checkbox สำหรับติ๊กเลือกห้องแชทก่อนลบ */}
                    <button
                      type="button"
                      onClick={(e) => toggleCheckRoom(room.roomId, e)}
                      title="ติ๊กเพื่อเลือกห้องแชทนี้สำหรับลบ"
                      className={`mt-0.5 p-0.5 rounded-md transition cursor-pointer shrink-0 ${
                        isSelected
                          ? 'text-white hover:bg-white/20'
                          : isRoomChecked
                          ? 'text-rose-600'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {isRoomChecked ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-extrabold text-xs truncate flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{room.customerName}</span>
                        </div>
                        <span
                          className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : isLoggedUser
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isLoggedUser ? 'สมาชิก' : 'ผู้เยี่ยมชม'}
                        </span>
                      </div>

                      {(room.customerPhone !== '-' || room.customerEmail) && (
                        <div
                          className={`text-[10px] mt-1 truncate ${
                            isSelected ? 'text-blue-100' : 'text-slate-500'
                          }`}
                        >
                          {room.customerPhone !== '-' &&
                            `📞 ${room.customerPhone} `}
                          {room.customerEmail && `• ✉️ ${room.customerEmail}`}
                        </div>
                      )}

                      <p
                        className={`text-[11px] mt-1.5 line-clamp-1 font-medium ${
                          isSelected ? 'text-white/95' : 'text-slate-600'
                        }`}
                      >
                        {room.lastMessage}
                      </p>

                      <div
                        className={`flex items-center justify-between text-[10px] mt-1.5 pt-1 border-t ${
                          isSelected
                            ? 'border-white/15 text-blue-100'
                            : 'border-slate-100 text-slate-400'
                        }`}
                      >
                        <span>
                          {new Date(room.lastAt).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="font-bold">
                          {room.totalMessages} ข้อความ
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* คอลัมน์ขวา: หน้าต่างสนทนาเฉพาะห้องลูกค้าที่เลือก + เลือกข้อความก่อนลบ */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white flex flex-col h-[460px] overflow-hidden">
          {activeRoomSummary ? (
            <>
              {/* แถบข้อมูลลูกค้าของห้องที่กำลังเปิดดู + ปุ่มเลือกข้อความก่อนลบ */}
              <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold bg-blue-100 text-blue-800">
                    <Lock className="w-3 h-3" />
                    ห้องแชทส่วนตัว: {activeRoomSummary.customerName}
                  </span>
                  {activeRoomSummary.customerPhone &&
                    activeRoomSummary.customerPhone !== '-' && (
                      <a
                        href={`tel:${activeRoomSummary.customerPhone}`}
                        className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {activeRoomSummary.customerPhone}
                      </a>
                    )}
                  {activeRoomSummary.customerEmail && (
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                      {activeRoomSummary.customerEmail}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {activeRoomMessages.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleSelectAllMessagesInRoom}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      {isAllMessagesInRoomChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>
                        {isAllMessagesInRoomChecked
                          ? 'ยกเลิกเลือกข้อความ'
                          : 'เลือกข้อความทั้งหมด'}
                      </span>
                    </button>
                  )}

                  {checkedMessageIds.length > 0 && (
                    <button
                      type="button"
                      disabled={deletingRoom}
                      onClick={handleDeleteSelectedMessages}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-2.5 py-1 rounded-lg transition cursor-pointer shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>
                        ลบข้อความที่เลือก ({checkedMessageIds.length})
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={deletingRoom}
                    onClick={() => handleDeleteRoom(activeRoomSummary)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบทั้งห้องนี้</span>
                  </button>
                </div>
              </div>

              {/* รายการข้อความสนทนาเฉพาะของลูกค้าคนนี้ (คลิกติ๊กเลือกแต่ละข้อความได้) */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {activeRoomMessages.map((m) => {
                  const isAdmin = m.sender_role === 'admin';
                  const isMsgChecked = checkedMessageIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleCheckMessage(m.id)}
                      className={`group flex flex-col cursor-pointer rounded-2xl p-1.5 transition ${
                        isAdmin ? 'items-end' : 'items-start'
                      } ${
                        isMsgChecked
                          ? 'bg-rose-50/80 ring-1 ring-rose-300'
                          : 'hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-1.5 mb-1 px-1 text-[11px]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCheckMessage(m.id);
                          }}
                          className={`inline-flex items-center gap-1 font-bold ${
                            isMsgChecked
                              ? 'text-rose-600'
                              : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        >
                          {isMsgChecked ? (
                            <CheckSquare className="w-3.5 h-3.5" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isAdmin
                              ? 'bg-indigo-100 text-indigo-700'
                              : m.channel === 'quick_inquiry'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isAdmin
                            ? '🛡️ แอดมินตอบกลับ'
                            : m.channel === 'quick_inquiry'
                            ? '📩 ฟอร์มติดต่อด่วน'
                            : '💬 ลูกค้าทักแชทสด'}
                        </span>
                        <span className="font-bold text-slate-800">
                          {m.sender_name}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                          isAdmin
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-xs'
                            : 'bg-white border-2 border-blue-200 text-slate-900 rounded-bl-xs'
                        }`}
                      >
                        {m.message}
                      </div>

                      <span className="text-[10px] text-slate-400 mt-1 px-1 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(m.created_at).toLocaleString('th-TH', {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                        })}
                        {isAdmin && (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        )}
                      </span>
                    </div>
                  );
                })}
                <div ref={chatStreamBottomRef} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MessageSquareMore className="w-10 h-10 mb-2 stroke-1" />
              <p className="text-sm font-bold text-slate-600">
                เลือกห้องแชทลูกค้าจากรายการทางซ้ายเพื่อดูข้อความและตอบกลับ
              </p>
              <p className="text-xs text-slate-400 mt-1">
                ข้อความที่คุณตอบกลับจะถูกส่งไปยังห้องแชทส่วนตัวของลูกค้ารายนั้นเพียงคนเดียวเท่านั้น
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ปุ่มข้อความตอบกลับด่วนสำหรับแอดมิน */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-bold text-slate-600 inline-flex items-center gap-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          ตอบด่วน:
        </span>
        {quickAdminReplies.map((txt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={!selectedRoomId}
            onClick={() => setReplyText(txt)}
            className="text-[11px] font-semibold bg-slate-100 hover:bg-blue-50 disabled:opacity-50 text-slate-700 hover:text-blue-700 border border-slate-200 px-2.5 py-1 rounded-full transition cursor-pointer"
          >
            {txt.slice(0, 42)}...
          </button>
        ))}
      </div>

      {/* ฟอร์มให้ Admin พิมพ์ตอบกลับเข้าห้องแชทส่วนตัวของลูกค้าที่เลือก */}
      <form
        onSubmit={handleAdminReply}
        className="flex flex-col sm:flex-row gap-2.5 bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200"
      >
        <input
          type="text"
          value={replyText}
          disabled={!selectedRoomId}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={
            activeRoomSummary
              ? `พิมพ์ข้อความตอบกลับส่วนตัวถึงคุณ "${activeRoomSummary.customerName}"...`
              : 'กรุณาเลือกห้องแชทลูกค้าทางซ้ายก่อนพิมพ์ตอบกลับ...'
          }
          className="flex-1 rounded-xl border border-slate-300 bg-white disabled:bg-slate-100 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !selectedRoomId || !replyText.trim()}
          className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shrink-0 shadow-xs"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>
            {activeRoomSummary
              ? `ส่งตอบกลับคุณ ${activeRoomSummary.customerName}`
              : 'ส่งข้อความตอบกลับ'}
          </span>
        </button>
      </form>
    </div>
  );
}
