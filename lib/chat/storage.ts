import type { SupabaseClient } from '@supabase/supabase-js';
import {
  DRIVERENT_REALTIME_CHANNELS,
  DRIVERENT_STORAGE_KEYS,
  DRIVERENT_TABLES,
  type ChatMessage,
} from '@/types/database';

const LOCAL_CHAT_STORAGE_KEY = DRIVERENT_STORAGE_KEYS.chatMessages;
const VISITOR_ROOM_STORAGE_KEY = DRIVERENT_STORAGE_KEYS.visitorRoomId;
const LAST_USER_ID_STORAGE_KEY = 'CharDB_DriveRent_last_user_id_v1';
const DELETED_CHAT_REGISTRY_KEY = 'CharDB_DriveRent_deleted_chat_registry_v1';
const BROADCAST_CHANNEL_NAME = DRIVERENT_REALTIME_CHANNELS.browserBroadcast;
export const ROOM_DELIMITER = '||room:';
export const DELETED_MARKER = '||deleted:true';

export interface DeletedChatRegistry {
  deletedRoomIds: string[];
  deletedMessageIds: string[];
  deletedRoomTimestamps: Record<string, number>;
}

export const INITIAL_WELCOME_MESSAGES: ChatMessage[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    room_id: 'welcome',
    sender_name: 'แอดมิน charickDriveRent (สาขาหาดใหญ่)',
    sender_phone: '089-999-8888',
    sender_email: 'startdoing4you@gmail.com',
    sender_role: 'admin',
    message:
      'สวัสดีครับ 👋 ยินดีต้อนรับสู่ charickDriveRent สาขาหาดใหญ่ จ.สงขลา! สอบถามคิวรถว่าง นัดรับรถสนามบินหาดใหญ่ หรือสอบถามการจองมัดจำ 30% พิมพ์คุยสดแบบ Real-time ได้เลยครับ',
    channel: 'live_chat',
    created_at: '2026-10-10T09:00:00.000Z',
    is_read: true,
  },
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * สร้างรหัสข้อความแบบ UUID v4 มาตรฐาน เพื่อให้ ID ใน LocalStorage, Server Cache และตาราง DriveRent_chat_messages ใน Supabase เป็นรหัสเดียวกัน 100%
 */
export function createChatMessageId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * ตรวจสอบว่าข้อความนี้ถูกสั่งลบไปแล้วหรือไม่ (ตรวจจากแท็ก ||deleted:true หรือข้อความ [DELETED])
 */
export function isMessageMarkedDeleted(raw?: Partial<ChatMessage> | null): boolean {
  if (!raw) return true;
  const email = raw.sender_email || '';
  const msg = (raw.message || '').trim();
  if (!msg || msg === '[DELETED]') return true;
  if (email.includes(DELETED_MARKER)) return true;
  return false;
}

/**
 * อ่านรายการห้องแชทและข้อความที่ถูกลบไปแล้วจาก LocalStorage (ป้องกันข้อความที่ติด RLS ใน Supabase เด้งกลับมา)
 */
export function getLocalDeletedRegistry(): DeletedChatRegistry {
  if (typeof window === 'undefined') {
    return {
      deletedRoomIds: [],
      deletedMessageIds: [],
      deletedRoomTimestamps: {},
    };
  }
  try {
    const raw = window.localStorage.getItem(DELETED_CHAT_REGISTRY_KEY);
    if (!raw) {
      return {
        deletedRoomIds: [],
        deletedMessageIds: [],
        deletedRoomTimestamps: {},
      };
    }
    const parsed = JSON.parse(raw) as Partial<DeletedChatRegistry>;
    return {
      deletedRoomIds: Array.isArray(parsed.deletedRoomIds)
        ? parsed.deletedRoomIds
        : [],
      deletedMessageIds: Array.isArray(parsed.deletedMessageIds)
        ? parsed.deletedMessageIds
        : [],
      deletedRoomTimestamps:
        parsed.deletedRoomTimestamps &&
        typeof parsed.deletedRoomTimestamps === 'object'
          ? parsed.deletedRoomTimestamps
          : {},
    };
  } catch {
    return {
      deletedRoomIds: [],
      deletedMessageIds: [],
      deletedRoomTimestamps: {},
    };
  }
}

export function recordLocalDeletedRoom(
  roomId: string,
  messageIds: string[] = [],
  deletedAtMs: number = Date.now()
): DeletedChatRegistry {
  const current = getLocalDeletedRegistry();
  const roomSet = new Set(current.deletedRoomIds);
  if (roomId && roomId !== 'welcome') {
    roomSet.add(roomId);
  }
  const msgSet = new Set(current.deletedMessageIds);
  for (const id of messageIds) {
    if (id && id !== INITIAL_WELCOME_MESSAGES[0].id) {
      msgSet.add(id);
    }
  }
  const updated: DeletedChatRegistry = {
    deletedRoomIds: Array.from(roomSet),
    deletedMessageIds: Array.from(msgSet).slice(-500),
    deletedRoomTimestamps: {
      ...current.deletedRoomTimestamps,
      ...(roomId ? { [roomId]: deletedAtMs } : {}),
    },
  };

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        DELETED_CHAT_REGISTRY_KEY,
        JSON.stringify(updated)
      );
    } catch {
      // ignore storage error
    }
  }
  return updated;
}

export function isMessageFilteredByRegistry(
  msg: ChatMessage,
  registry: DeletedChatRegistry
): boolean {
  if (isMessageMarkedDeleted(msg)) return true;
  if (msg.id === INITIAL_WELCOME_MESSAGES[0].id || msg.room_id === 'welcome') {
    return false;
  }
  if (registry.deletedMessageIds.includes(msg.id)) {
    return true;
  }
  const roomId = msg.room_id || '';
  if (roomId && registry.deletedRoomTimestamps[roomId]) {
    const deletedAt = registry.deletedRoomTimestamps[roomId];
    const msgTime = new Date(msg.created_at).getTime();
    // ลบเฉพาะข้อความที่เกิดก่อนหรือขณะกดลบห้องแชท (หากลูกค้าทักข้อความใหม่เข้ามาหลังกดลบ จะแสดงตามปกติ)
    if (!Number.isNaN(msgTime) && msgTime <= deletedAt + 2000) {
      return true;
    }
  }
  if (roomId.startsWith('legacy:') && registry.deletedRoomIds.includes(roomId)) {
    return true;
  }
  return false;
}

/**
 * แนบรหัสห้องแชทส่วนตัว (room_id) ลงในฟิลด์ sender_email สำหรับบันทึกลงตาราง DriveRent_chat_messages
 * เพื่อให้ทำงานร่วมกับฐานข้อมูล Supabase ปัจจุบันได้ทันทีโดยไม่ต้องรัน SQL เพิ่มคอลัมน์ใหม่
 */
export function packSenderEmailWithRoom(
  senderEmail?: string | null,
  roomId?: string | null
): string {
  const cleanEmail = (senderEmail || '')
    .split(ROOM_DELIMITER)[0]
    .split(DELETED_MARKER)[0]
    .trim();
  const cleanRoom = (roomId || '').trim();
  if (!cleanRoom || cleanRoom === 'welcome') {
    return cleanEmail;
  }
  return `${cleanEmail}${ROOM_DELIMITER}${cleanRoom}`;
}

/**
 * แยกข้อมูล room_id และ sender_email ออกจากแถวข้อมูลที่ดึงมาจากฐานข้อมูลหรือแคช
 * หากเป็นข้อความเก่าที่เคยส่งก่อนมีระบบแยกห้องแชท จะถูกจัดเข้าห้อง 'legacy:...' เพื่อไม่ให้ไปโผล่ในหน้าแชทของลูกค้าคนใหม่
 */
export function normalizeChatMessage(raw: ChatMessage): ChatMessage {
  if (!raw) return INITIAL_WELCOME_MESSAGES[0];

  const rawEmail = raw.sender_email || '';
  let cleanEmail = rawEmail;
  let extractedRoomId = raw.room_id || '';

  if (rawEmail.includes(ROOM_DELIMITER)) {
    const [emailPart, roomPart] = rawEmail.split(ROOM_DELIMITER);
    cleanEmail = (emailPart || '').split(DELETED_MARKER)[0].trim();
    if (roomPart && !extractedRoomId) {
      extractedRoomId = roomPart.split(DELETED_MARKER)[0].trim();
    }
  }

  const isWelcome =
    raw.id === '00000000-0000-4000-8000-000000000001' ||
    (raw.message || '').includes('ยินดีต้อนรับสู่ charickDriveRent สาขาหาดใหญ่');

  if (isWelcome) {
    extractedRoomId = 'welcome';
  } else if (!extractedRoomId) {
    // ข้อความเก่าก่อนมีระบบแยกห้องแชท ให้เก็บไว้แสดงเฉพาะในหน้า Admin Dashboard เท่านั้น
    const fallbackIdentity =
      cleanEmail ||
      (raw.sender_phone && raw.sender_phone !== '-' ? raw.sender_phone : '') ||
      (raw.sender_role === 'customer' ? raw.sender_name : '') ||
      'previous-session';
    extractedRoomId = `legacy:${fallbackIdentity}`;
  }

  return {
    ...raw,
    sender_email: cleanEmail,
    room_id: extractedRoomId,
  };
}

/**
 * สร้างหรือดึงรหัสห้องแชทส่วนตัว (Private Room ID) สำหรับผู้ใช้งานแต่ละคน
 */
export function getOrCreateVisitorRoomId(
  userId?: string | null,
  forceNewGuest = false
): string {
  if (typeof window === 'undefined') {
    return userId ? `user:${userId}` : 'guest:server';
  }

  try {
    if (userId && userId.trim()) {
      const cleanUserId = userId.trim();
      window.sessionStorage.setItem(LAST_USER_ID_STORAGE_KEY, cleanUserId);
      return `user:${cleanUserId}`;
    }

    const previousUserId = window.sessionStorage.getItem(LAST_USER_ID_STORAGE_KEY);
    if (previousUserId) {
      window.sessionStorage.removeItem(LAST_USER_ID_STORAGE_KEY);
      const freshAfterLogout = `guest:${createChatMessageId()}`;
      window.sessionStorage.setItem(VISITOR_ROOM_STORAGE_KEY, freshAfterLogout);
      return freshAfterLogout;
    }

    if (forceNewGuest) {
      const freshGuestId = `guest:${createChatMessageId()}`;
      window.sessionStorage.setItem(VISITOR_ROOM_STORAGE_KEY, freshGuestId);
      return freshGuestId;
    }

    const existingGuest = window.sessionStorage.getItem(VISITOR_ROOM_STORAGE_KEY);
    if (existingGuest && existingGuest.startsWith('guest:')) {
      return existingGuest;
    }

    const newGuestId = `guest:${createChatMessageId()}`;
    window.sessionStorage.setItem(VISITOR_ROOM_STORAGE_KEY, newGuestId);
    return newGuestId;
  } catch {
    return userId ? `user:${userId}` : `guest:${createChatMessageId()}`;
  }
}

export function sortChatMessages(
  list: ChatMessage[],
  customRegistry?: DeletedChatRegistry
): ChatMessage[] {
  const registry = customRegistry || getLocalDeletedRegistry();
  const byId = new Map<string, ChatMessage>();

  for (const rawItem of list) {
    if (!rawItem || !rawItem.id || !rawItem.message) continue;
    if (isMessageMarkedDeleted(rawItem)) continue;

    const item = normalizeChatMessage(rawItem);
    if (isMessageFilteredByRegistry(item, registry)) continue;

    const existing = byId.get(item.id);
    if (!existing || UUID_REGEX.test(item.id)) {
      byId.set(item.id, item);
    }
  }

  const chronological = Array.from(byId.values()).sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // กรองข้อความซ้ำภายในห้องแชทเดียวกัน
  const deduplicated: ChatMessage[] = [];
  for (const msg of chronological) {
    const normalizedText = msg.message.trim();
    const msgTime = new Date(msg.created_at).getTime();

    const duplicateIndex = deduplicated.findIndex((prev) => {
      if (prev.sender_role !== msg.sender_role) return false;
      if (prev.message.trim() !== normalizedText) return false;

      if (
        normalizedText.includes('ยินดีต้อนรับสู่ charickDriveRent สาขาหาดใหญ่')
      ) {
        return true;
      }

      if ((prev.room_id || '') !== (msg.room_id || '')) return false;

      const prevTime = new Date(prev.created_at).getTime();
      return Math.abs(msgTime - prevTime) <= 15000;
    });

    if (duplicateIndex === -1) {
      deduplicated.push(msg);
    } else if (
      UUID_REGEX.test(msg.id) &&
      !UUID_REGEX.test(deduplicated[duplicateIndex].id)
    ) {
      deduplicated[duplicateIndex] = msg;
    }
  }

  return deduplicated;
}

/**
 * กรองข้อความให้เหลือเฉพาะของห้องแชท (roomId) ของลูกค้าคนนั้นๆ เท่านั้น
 */
export function filterMessagesForRoom(
  messages: ChatMessage[],
  roomId?: string | null,
  customRegistry?: DeletedChatRegistry
): ChatMessage[] {
  if (!roomId) return INITIAL_WELCOME_MESSAGES;
  const sorted = sortChatMessages(messages, customRegistry);
  const roomMessages = sorted.filter(
    (m) => m.room_id === roomId && m.id !== INITIAL_WELCOME_MESSAGES[0].id
  );
  return [INITIAL_WELCOME_MESSAGES[0], ...roomMessages];
}

function getStorageKey(roomId?: string | null, isAdmin = false): string {
  if (isAdmin) return `${LOCAL_CHAT_STORAGE_KEY}_admin_all`;
  if (roomId) return `${LOCAL_CHAT_STORAGE_KEY}_room_${roomId}`;
  return LOCAL_CHAT_STORAGE_KEY;
}

export function getLocalChatMessages(
  roomId?: string | null,
  isAdmin = false
): ChatMessage[] {
  if (typeof window === 'undefined') return INITIAL_WELCOME_MESSAGES;
  try {
    const key = getStorageKey(roomId, isAdmin);
    const raw = window.localStorage.getItem(key);
    if (!raw) return INITIAL_WELCOME_MESSAGES;
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_WELCOME_MESSAGES;
    }
    const sorted = sortChatMessages(parsed);
    return isAdmin ? sorted : filterMessagesForRoom(sorted, roomId);
  } catch {
    return INITIAL_WELCOME_MESSAGES;
  }
}

export function saveLocalChatMessages(
  messages: ChatMessage[],
  broadcast = false,
  roomId?: string | null,
  isAdmin = false
): ChatMessage[] {
  if (typeof window === 'undefined') return messages;
  const sorted = sortChatMessages(messages);
  const toSave = isAdmin ? sorted : filterMessagesForRoom(sorted, roomId);

  try {
    const key = getStorageKey(roomId, isAdmin);
    window.localStorage.setItem(key, JSON.stringify(toSave));

    const existingAdminRaw = window.localStorage.getItem(
      getStorageKey(null, true)
    );
    const existingAdmin = existingAdminRaw
      ? (JSON.parse(existingAdminRaw) as ChatMessage[])
      : INITIAL_WELCOME_MESSAGES;
    const mergedAdmin = sortChatMessages([...existingAdmin, ...sorted]);
    window.localStorage.setItem(
      getStorageKey(null, true),
      JSON.stringify(mergedAdmin)
    );

    for (const m of sorted) {
      if (m.room_id && m.room_id !== 'welcome') {
        const roomKey = getStorageKey(m.room_id, false);
        const roomRaw = window.localStorage.getItem(roomKey);
        const roomExisting = roomRaw
          ? (JSON.parse(roomRaw) as ChatMessage[])
          : INITIAL_WELCOME_MESSAGES;
        const roomMerged = filterMessagesForRoom(
          [...roomExisting, m],
          m.room_id
        );
        window.localStorage.setItem(roomKey, JSON.stringify(roomMerged));
      }
    }

    window.dispatchEvent(new CustomEvent('driverent-chat-updated'));

    if (broadcast && typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage({ type: 'CHAT_SYNC', messages: mergedAdmin });
      bc.close();
    }
  } catch {
    // ignore storage errors
  }
  return toSave;
}

export function appendLocalChatMessage(
  msg: ChatMessage,
  broadcast = true
): ChatMessage[] {
  const normalized = normalizeChatMessage(msg);
  const adminAll = getLocalChatMessages(null, true);
  const merged = sortChatMessages([...adminAll, normalized]);
  saveLocalChatMessages(merged, broadcast, normalized.room_id, true);
  return merged;
}

export interface ChatSubscribeOptions {
  roomId?: string | null;
  isAdmin?: boolean;
}

/**
 * ดึงข้อความล่าสุดจากทั้ง Server API (/api/contact), Supabase (DriveRent_chat_messages) และ LocalStorage
 * พร้อมกรองข้อความหรือห้องแชทที่ถูกสั่งลบออกแล้ว (Tombstone Registry + ||deleted:true)
 */
export async function syncAllChatMessages(
  supabase: SupabaseClient,
  options?: ChatSubscribeOptions
): Promise<ChatMessage[]> {
  const isAdmin = Boolean(options?.isAdmin);
  const roomId = options?.roomId || null;
  let localRegistry = getLocalDeletedRegistry();

  const localMessages = getLocalChatMessages(roomId, isAdmin);
  const mergedMap = new Map<string, ChatMessage>();

  for (const m of localMessages) {
    if (isMessageMarkedDeleted(m)) continue;
    const norm = normalizeChatMessage(m);
    if (!isMessageFilteredByRegistry(norm, localRegistry)) {
      mergedMap.set(norm.id, norm);
    }
  }

  try {
    const queryUrl = isAdmin
      ? '/api/contact?mode=admin'
      : `/api/contact?roomId=${encodeURIComponent(roomId || '')}`;

    const apiRes = await fetch(queryUrl, {
      method: 'GET',
      cache: 'no-store',
    });
    if (apiRes.ok) {
      const json = await apiRes.json();
      // ซิงค์รายการห้องแชทที่ถูกลบจากฝั่ง Server มาเก็บใน LocalStorage ด้วย
      if (json.deletedRegistry) {
        const srvReg = json.deletedRegistry as Partial<DeletedChatRegistry>;
        if (Array.isArray(srvReg.deletedRoomIds)) {
          for (const rId of srvReg.deletedRoomIds) {
            const ts = srvReg.deletedRoomTimestamps?.[rId] || Date.now();
            localRegistry = recordLocalDeletedRoom(
              rId,
              srvReg.deletedMessageIds || [],
              ts
            );
          }
        }
      }

      if (Array.isArray(json.messages)) {
        for (const raw of json.messages as ChatMessage[]) {
          if (isMessageMarkedDeleted(raw)) continue;
          const norm = normalizeChatMessage(raw);
          if (!isMessageFilteredByRegistry(norm, localRegistry)) {
            mergedMap.set(norm.id, norm);
          }
        }
      }
    }
  } catch {
    // ignore network error
  }

  try {
    let query = supabase
      .from(DRIVERENT_TABLES.chatMessages)
      .select('*')
      .order('created_at', { ascending: true })
      .limit(150);

    if (!isAdmin && roomId) {
      query = query.ilike('sender_email', `%${ROOM_DELIMITER}${roomId}%`);
    }

    const { data, error } = await query;

    if (!error && Array.isArray(data)) {
      for (const raw of data as ChatMessage[]) {
        if (isMessageMarkedDeleted(raw)) {
          // หากแถวใน DB ถูกทำเครื่องหมายว่าลบแล้ว ให้จำ ID ไว้ใน Registry ทันที
          recordLocalDeletedRoom('', [raw.id]);
          mergedMap.delete(raw.id);
          continue;
        }
        const norm = normalizeChatMessage(raw);
        if (!isMessageFilteredByRegistry(norm, localRegistry)) {
          mergedMap.set(norm.id, norm);
        } else {
          mergedMap.delete(norm.id);
        }
      }
    }
  } catch {
    // ignore missing table error
  }

  const allSorted = sortChatMessages(
    Array.from(mergedMap.values()),
    localRegistry
  );
  saveLocalChatMessages(allSorted, false, roomId, isAdmin);

  return isAdmin
    ? allSorted
    : filterMessagesForRoom(allSorted, roomId, localRegistry);
}

interface SubscriberEntry {
  callback: (messages: ChatMessage[]) => void;
  roomId?: string | null;
  isAdmin?: boolean;
}

const inMemorySubscribers = new Set<SubscriberEntry>();
let sharedBroadcastChannel: ReturnType<SupabaseClient['channel']> | null = null;
let isBroadcastSubscribed = false;

function notifyInMemorySubscribers(allMessages: ChatMessage[]) {
  const sorted = sortChatMessages(allMessages);
  for (const sub of inMemorySubscribers) {
    try {
      if (sub.isAdmin) {
        sub.callback(sorted);
      } else {
        sub.callback(filterMessagesForRoom(sorted, sub.roomId));
      }
    } catch {
      // ignore subscriber callback error
    }
  }
}

function removeRoomFromLocalCaches(
  roomId: string,
  deletedIds: string[] = [],
  deletedAtMs: number = Date.now()
): ChatMessage[] {
  const registry = recordLocalDeletedRoom(roomId, deletedIds, deletedAtMs);
  if (typeof window === 'undefined') return INITIAL_WELCOME_MESSAGES;

  try {
    window.localStorage.removeItem(getStorageKey(roomId, false));
    const currentAdmin = getLocalChatMessages(null, true);
    const filteredAdmin = currentAdmin.filter(
      (m) =>
        m.room_id !== roomId &&
        !deletedIds.includes(m.id) &&
        !isMessageFilteredByRegistry(m, registry)
    );
    window.localStorage.setItem(
      getStorageKey(null, true),
      JSON.stringify(filteredAdmin)
    );
    window.dispatchEvent(new CustomEvent('driverent-chat-updated'));
    return filteredAdmin;
  } catch {
    return INITIAL_WELCOME_MESSAGES;
  }
}

function removeMessagesByIdsFromLocalCaches(
  deletedIds: string[],
  roomId?: string | null
): ChatMessage[] {
  const registry = recordLocalDeletedRoom('', deletedIds);
  if (typeof window === 'undefined') return INITIAL_WELCOME_MESSAGES;

  try {
    if (roomId) {
      const roomKey = getStorageKey(roomId, false);
      const roomExisting = getLocalChatMessages(roomId, false).filter(
        (m) =>
          !deletedIds.includes(m.id) && !isMessageFilteredByRegistry(m, registry)
      );
      window.localStorage.setItem(roomKey, JSON.stringify(roomExisting));
    }

    const currentAdmin = getLocalChatMessages(null, true);
    const filteredAdmin = currentAdmin.filter(
      (m) =>
        !deletedIds.includes(m.id) && !isMessageFilteredByRegistry(m, registry)
    );
    window.localStorage.setItem(
      getStorageKey(null, true),
      JSON.stringify(filteredAdmin)
    );
    window.dispatchEvent(new CustomEvent('driverent-chat-updated'));
    return filteredAdmin;
  } catch {
    return INITIAL_WELCOME_MESSAGES;
  }
}

function ensureSharedBroadcastChannel(supabase: SupabaseClient) {
  if (typeof window === 'undefined') return null;
  if (sharedBroadcastChannel) return sharedBroadcastChannel;

  try {
    const channel = supabase.channel(DRIVERENT_REALTIME_CHANNELS.broadcastRoom);
    channel
      .on('broadcast', { event: 'new-chat-message' }, (payload) => {
        if (!payload?.payload) return;
        const incoming = normalizeChatMessage(payload.payload as ChatMessage);
        const updated = appendLocalChatMessage(incoming, false);
        notifyInMemorySubscribers(updated);
      })
      .on('broadcast', { event: 'delete-chat-room' }, (payload) => {
        const targetRoomId = payload?.payload?.roomId as string | undefined;
        const targetIds = (payload?.payload?.deletedIds || []) as string[];
        const deletedAtMs =
          (payload?.payload?.deletedAtMs as number) || Date.now();
        if (!targetRoomId) return;
        const remaining = removeRoomFromLocalCaches(
          targetRoomId,
          targetIds,
          deletedAtMs
        );
        notifyInMemorySubscribers(remaining);
      })
      .on('broadcast', { event: 'delete-chat-messages' }, (payload) => {
        const targetIds = (payload?.payload?.deletedIds || []) as string[];
        const targetRoomId = payload?.payload?.roomId as string | undefined;
        if (targetIds.length === 0) return;
        const remaining = removeMessagesByIdsFromLocalCaches(
          targetIds,
          targetRoomId
        );
        notifyInMemorySubscribers(remaining);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isBroadcastSubscribed = true;
        }
      });

    sharedBroadcastChannel = channel;
    return channel;
  } catch {
    return null;
  }
}

/**
 * ส่งข้อความใหม่แบบ Real-time ทันทีไปยังห้องแชทของลูกค้าคนนั้นและหน้า Admin Dashboard
 */
export async function dispatchRealtimeChatMessage(
  supabase: SupabaseClient,
  msg: ChatMessage
): Promise<ChatMessage[]> {
  const normalized = normalizeChatMessage(msg);

  // 1. อัปเดตและกระจายสัญญาณผ่าน BroadcastChannel + In-Memory Subscribers ทันที (< 5ms)
  const updatedAll = appendLocalChatMessage(normalized, true);
  notifyInMemorySubscribers(updatedAll);

  // 2. ส่งผ่าน Shared Supabase Realtime Broadcast
  try {
    const bcastChannel = ensureSharedBroadcastChannel(supabase);
    if (bcastChannel && isBroadcastSubscribed) {
      await bcastChannel.send({
        type: 'broadcast',
        event: 'new-chat-message',
        payload: normalized,
      });
    }
  } catch {
    // ignore realtime broadcast error
  }

  // 3. บันทึกลง Server API (/api/contact) และฐานข้อมูล DriveRent_chat_messages พร้อม roomId
  try {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: normalized.id,
        roomId: normalized.room_id,
        senderName: normalized.sender_name,
        senderPhone: normalized.sender_phone,
        senderEmail: normalized.sender_email || '',
        message: normalized.message,
        channel: normalized.channel,
        senderRole: normalized.sender_role,
      }),
    });
  } catch {
    // ignore network error
  }

  return normalized.room_id && normalized.room_id !== 'welcome'
    ? filterMessagesForRoom(updatedAll, normalized.room_id)
    : updatedAll;
}

/**
 * ลบเฉพาะข้อความที่เลือก (Select before delete) โดยไม่จำเป็นต้องลบทั้งห้อง
 */
export async function deleteSpecificChatMessages(
  messageIds: string[],
  roomId?: string | null,
  supabaseClient?: SupabaseClient
): Promise<ChatMessage[]> {
  const cleanIds = messageIds.filter(
    (id) => id && id !== INITIAL_WELCOME_MESSAGES[0].id
  );
  if (cleanIds.length === 0) {
    return getLocalChatMessages(roomId, !roomId);
  }

  const remainingLocal = removeMessagesByIdsFromLocalCaches(cleanIds, roomId);
  notifyInMemorySubscribers(remainingLocal);

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage({
        type: 'CHAT_DELETE_MESSAGES',
        deletedIds: cleanIds,
        roomId: roomId || undefined,
      });
      bc.close();
    } catch {
      // ignore broadcast error
    }
  }

  if (supabaseClient) {
    try {
      const bcastChannel = ensureSharedBroadcastChannel(supabaseClient);
      if (bcastChannel && isBroadcastSubscribed) {
        await bcastChannel.send({
          type: 'broadcast',
          event: 'delete-chat-messages',
          payload: { deletedIds: cleanIds, roomId: roomId || undefined },
        });
      }
    } catch {
      // ignore error
    }

    try {
      await supabaseClient
        .from(DRIVERENT_TABLES.chatMessages)
        .update({
          sender_email: DELETED_MARKER,
          message: '[DELETED]',
          is_read: true,
        })
        .in('id', cleanIds);

      await supabaseClient
        .from(DRIVERENT_TABLES.chatMessages)
        .delete()
        .in('id', cleanIds);
    } catch {
      // ignore db error
    }
  }

  try {
    await fetch('/api/contact', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageIds: cleanIds,
        roomId: roomId || '',
      }),
    });
  } catch {
    // ignore network error
  }

  return remainingLocal;
}

/**
 * ลบหลายห้องแชทพร้อมกัน หรือลบทุกห้องแชททั้งหมดในคลิกเดียว
 */
export async function deleteMultipleChatRooms(
  roomIds: string[],
  supabaseClient?: SupabaseClient
): Promise<ChatMessage[]> {
  let latest = getLocalChatMessages(null, true);
  for (const rId of roomIds) {
    if (!rId || rId === 'welcome') continue;
    latest = await deleteChatRoomMessages(rId, supabaseClient);
  }
  return latest;
}

/**
 * ลบประวัติข้อความของห้องแชทที่เลือกแบบถาวร 100%
 */
export async function deleteChatRoomMessages(
  roomId: string,
  supabaseClient?: SupabaseClient
): Promise<ChatMessage[]> {
  const deletedAtMs = Date.now();
  const currentAdminMessages = getLocalChatMessages(null, true);
  const targetMessages = currentAdminMessages.filter(
    (m) => m.room_id === roomId && m.id !== INITIAL_WELCOME_MESSAGES[0].id
  );
  const targetIds = targetMessages.map((m) => m.id);

  // 1. ลบออกจาก LocalStorage + บันทึกเข้า Tombstone Registry ทันที
  const remainingLocal = removeRoomFromLocalCaches(
    roomId,
    targetIds,
    deletedAtMs
  );
  notifyInMemorySubscribers(remainingLocal);

  // 2. แจ้งทุกแท็บผ่าน BroadcastChannel ทันที
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage({
        type: 'CHAT_DELETE_ROOM',
        roomId,
        deletedIds: targetIds,
        deletedAtMs,
      });
      bc.close();
    } catch {
      // ignore broadcast error
    }
  }

  // 3. แจ้งผ่าน Supabase Realtime Broadcast
  if (supabaseClient) {
    try {
      const bcastChannel = ensureSharedBroadcastChannel(supabaseClient);
      if (bcastChannel && isBroadcastSubscribed) {
        await bcastChannel.send({
          type: 'broadcast',
          event: 'delete-chat-room',
          payload: { roomId, deletedIds: targetIds, deletedAtMs },
        });
      }
    } catch {
      // ignore error
    }

    // 4. ทำ Soft-Delete (UPDATE sender_email = '||deleted:true') + Hard-Delete บนตาราง DriveRent_chat_messages โดยตรง
    try {
      if (targetIds.length > 0) {
        await supabaseClient
          .from(DRIVERENT_TABLES.chatMessages)
          .update({
            sender_email: DELETED_MARKER,
            message: '[DELETED]',
            is_read: true,
          })
          .in('id', targetIds);

        await supabaseClient
          .from(DRIVERENT_TABLES.chatMessages)
          .delete()
          .in('id', targetIds);
      }
    } catch {
      // ignore db error
    }
  }

  // 5. เรียก DELETE /api/contact เพื่อให้ฝั่ง Server ลบออกจากไฟล์แคชและฐานข้อมูล Supabase ด้วย
  try {
    await fetch(`/api/contact?roomId=${encodeURIComponent(roomId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        messageIds: targetIds,
        deletedAtMs,
      }),
    });
  } catch {
    // ignore network error
  }

  return remainingLocal;
}

/**
 * ติดตั้งตัวรับสัญญาณ Real-time ครบทุกช่องทาง พร้อมแยกห้องแชทส่วนตัว (Room Isolation)
 */
export function subscribeToRealtimeChat(
  supabase: SupabaseClient,
  onUpdate: (messages: ChatMessage[]) => void,
  options?: ChatSubscribeOptions
): () => void {
  let isMounted = true;
  const isAdmin = Boolean(options?.isAdmin);
  const roomId = options?.roomId || null;

  const subscriberEntry: SubscriberEntry = {
    callback: (messages: ChatMessage[]) => {
      if (isMounted) {
        onUpdate(messages);
      }
    },
    roomId,
    isAdmin,
  };

  inMemorySubscribers.add(subscriberEntry);

  const triggerSync = async () => {
    if (!isMounted) return;
    const latest = await syncAllChatMessages(supabase, { roomId, isAdmin });
    if (isMounted) {
      onUpdate(latest);
    }
  };

  triggerSync();

  const handleCustomEvent = () => {
    if (!isMounted) return;
    onUpdate(getLocalChatMessages(roomId, isAdmin));
  };
  window.addEventListener('driverent-chat-updated', handleCustomEvent);

  const handleStorageEvent = () => {
    if (!isMounted) return;
    onUpdate(getLocalChatMessages(roomId, isAdmin));
  };
  window.addEventListener('storage', handleStorageEvent);

  let bc: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (!isMounted) return;
        if (event.data?.type === 'CHAT_DELETE_ROOM' && event.data.roomId) {
          const remaining = removeRoomFromLocalCaches(
            event.data.roomId,
            event.data.deletedIds || [],
            event.data.deletedAtMs || Date.now()
          );
          onUpdate(
            isAdmin ? remaining : filterMessagesForRoom(remaining, roomId)
          );
          return;
        }
        if (
          event.data?.type === 'CHAT_DELETE_MESSAGES' &&
          Array.isArray(event.data.deletedIds)
        ) {
          const remaining = removeMessagesByIdsFromLocalCaches(
            event.data.deletedIds,
            event.data.roomId
          );
          onUpdate(
            isAdmin ? remaining : filterMessagesForRoom(remaining, roomId)
          );
          return;
        }
        if (
          event.data?.type === 'CHAT_SYNC' &&
          Array.isArray(event.data.messages)
        ) {
          const merged = sortChatMessages([
            ...getLocalChatMessages(null, true),
            ...event.data.messages,
          ]);
          saveLocalChatMessages(merged, false, roomId, isAdmin);
          onUpdate(isAdmin ? merged : filterMessagesForRoom(merged, roomId));
        }
      };
    } catch {
      bc = null;
    }
  }

  ensureSharedBroadcastChannel(supabase);

  let pgChannel: ReturnType<SupabaseClient['channel']> | null = null;
  try {
    const uniqueChannelName = `${DRIVERENT_REALTIME_CHANNELS.postgresPrefix}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    pgChannel = supabase
      .channel(uniqueChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: DRIVERENT_TABLES.chatMessages,
        },
        () => {
          triggerSync();
        }
      )
      .subscribe();
  } catch {
    pgChannel = null;
  }

  const intervalId = window.setInterval(() => {
    triggerSync();
  }, 1500);

  return () => {
    isMounted = false;
    inMemorySubscribers.delete(subscriberEntry);
    window.removeEventListener('driverent-chat-updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    if (bc) {
      try {
        bc.close();
      } catch {
        // ignore close error
      }
    }
    window.clearInterval(intervalId);
    if (pgChannel) {
      try {
        supabase.removeChannel(pgChannel);
      } catch {
        // ignore removeChannel error
      }
    }
  };
}

/**
 * สร้างคำตอบอัตโนมัติอัจฉริยะเบื้องต้นระหว่างรอแอดมินตัวจริงตอบกลับ
 */
export function buildSmartAutoReply(
  customerMessage: string,
  lang: 'th' | 'en'
): string {
  const lower = customerMessage.toLowerCase();

  if (
    lower.includes('สนามบิน') ||
    lower.includes('หาดใหญ่') ||
    lower.includes('airport') ||
    lower.includes('hat yai')
  ) {
    return lang === 'th'
      ? '✈️ บริการรับ-ส่งรถฟรีที่สนามบินนานาชาติหาดใหญ่ (Hat Yai Airport), ม.อ. หาดใหญ่, บขส. และในเขตตัวเมืองหาดใหญ่ครับ! เพียงแจ้งเที่ยวบินและเวลาลงเครื่อง เจ้าหน้าที่ของเราจะไปรอรับพร้อมส่งมอบรถทันทีครับ'
      : '✈️ We provide FREE vehicle pickup & drop-off at Hat Yai International Airport (HDY), PSU Hat Yai, and downtown Hat Yai! Just share your flight number and arrival time.';
  }

  if (
    lower.includes('30%') ||
    lower.includes('มัดจำ') ||
    lower.includes('จ่าย') ||
    lower.includes('deposit') ||
    lower.includes('payment')
  ) {
    return lang === 'th'
      ? '💳 ระบบจองมาตรฐานของ charickDriveRent: ชำระเงินมัดจำล่วงหน้าเพียง 30% ตอนกดจองผ่านเว็บเพื่อล็อกคิวรถทันที ส่วนที่เหลืออีก 70% สามารถชำระในวันมารับรถที่หาดใหญ่ได้เลยครับ (รับโอน QR / เงินสด / บัตรเครดิต)'
      : '💳 Easy 30% Deposit Booking: Pay only 30% deposit online to lock your vehicle immediately, and pay the remaining 70% upon picking up the vehicle in Hat Yai!';
  }

  if (
    lower.includes('เอกสาร') ||
    lower.includes('document') ||
    lower.includes('บัตร') ||
    lower.includes('ใบขับขี่')
  ) {
    return lang === 'th'
      ? '🪪 เอกสารที่ใช้รับรถง่ายมากครับ: 1) บัตรประชาชนตัวจริง (หรือ Passport) และ 2) ใบอนุญาตขับขี่ที่ยังไม่หมดอายุ (ผู้เช่าอายุ 20 ปีขึ้นไป) ฟรีประกันภัยชั้น 1 ทุกคันครับ!'
      : '🪪 Required documents at pickup: 1) Original National ID Card or Passport, and 2) Valid Driver License (minimum age 20). Free 1st-class insurance included!';
  }

  return lang === 'th'
    ? '✅ ระบบได้ส่งข้อความของคุณไปยังแอดมินสาขาหาดใหญ่แบบ Real-time เรียบร้อยแล้วครับ แอดมินสามารถพิมพ์ตอบกลับคุณในหน้าต่างนี้ได้ทันทีโดยไม่ต้องรีเฟรชหน้าเว็บ!'
    : '✅ Your message has been sent in real-time to our Hat Yai branch Admin! Admin replies will appear here automatically without refreshing.';
}
