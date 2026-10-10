import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@/lib/supabase/server';
import {
  DELETED_MARKER,
  type DeletedChatRegistry,
  filterMessagesForRoom,
  isMessageFilteredByRegistry,
  isMessageMarkedDeleted,
  normalizeChatMessage,
  packSenderEmailWithRoom,
  sortChatMessages,
} from '@/lib/chat/storage';
import { DRIVERENT_TABLES, type ChatMessage } from '@/types/database';

const ADMIN_EMAIL = 'startdoing4you@gmail.com';
const CHAT_STORE_DIR = path.join(process.cwd(), '.next', 'cache');
const CHAT_STORE_FILE = path.join(
  CHAT_STORE_DIR,
  'driverent-realtime-chat.json'
);
const DELETED_REGISTRY_FILE = path.join(
  CHAT_STORE_DIR,
  'driverent-realtime-chat-deleted.json'
);
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: '00000000-0000-4000-8000-000000000001',
  room_id: 'welcome',
  sender_name: 'แอดมิน charickDriveRent (สาขาหาดใหญ่)',
  sender_phone: '089-999-8888',
  sender_email: ADMIN_EMAIL,
  sender_role: 'admin',
  message:
    'สวัสดีครับ 👋 ยินดีต้อนรับสู่ charickDriveRent สาขาหาดใหญ่ จ.สงขลา! สอบถามคิวรถว่าง นัดรับรถสนามบินหาดใหญ่ หรือสอบถามการจองมัดจำ 30% พิมพ์คุยสดแบบ Real-time ได้เลยครับ',
  channel: 'live_chat',
  created_at: '2026-10-10T09:00:00.000Z',
  is_read: true,
};

function readServerDeletedRegistry(): DeletedChatRegistry {
  try {
    if (!fs.existsSync(DELETED_REGISTRY_FILE)) {
      return {
        deletedRoomIds: [],
        deletedMessageIds: [],
        deletedRoomTimestamps: {},
      };
    }
    const raw = fs.readFileSync(DELETED_REGISTRY_FILE, 'utf-8');
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

function writeServerDeletedRegistry(registry: DeletedChatRegistry) {
  try {
    if (!fs.existsSync(CHAT_STORE_DIR)) {
      fs.mkdirSync(CHAT_STORE_DIR, { recursive: true });
    }
    const trimmed: DeletedChatRegistry = {
      deletedRoomIds: Array.from(new Set(registry.deletedRoomIds)),
      deletedMessageIds: Array.from(new Set(registry.deletedMessageIds)).slice(
        -500
      ),
      deletedRoomTimestamps: registry.deletedRoomTimestamps || {},
    };
    fs.writeFileSync(
      DELETED_REGISTRY_FILE,
      JSON.stringify(trimmed, null, 2),
      'utf-8'
    );
  } catch {
    // ignore file system errors on read-only environments
  }
}

function readServerChatStore(registry?: DeletedChatRegistry): ChatMessage[] {
  const activeReg = registry || readServerDeletedRegistry();
  try {
    if (!fs.existsSync(CHAT_STORE_FILE)) {
      return [DEFAULT_WELCOME_MESSAGE];
    }
    const raw = fs.readFileSync(CHAT_STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) && parsed.length > 0
      ? sortChatMessages(parsed, activeReg)
      : [DEFAULT_WELCOME_MESSAGE];
  } catch {
    return [DEFAULT_WELCOME_MESSAGE];
  }
}

function writeServerChatStore(
  messages: ChatMessage[],
  registry?: DeletedChatRegistry
) {
  const activeReg = registry || readServerDeletedRegistry();
  try {
    if (!fs.existsSync(CHAT_STORE_DIR)) {
      fs.mkdirSync(CHAT_STORE_DIR, { recursive: true });
    }
    const clean = sortChatMessages(messages, activeReg).slice(-200);
    fs.writeFileSync(CHAT_STORE_FILE, JSON.stringify(clean, null, 2), 'utf-8');
  } catch {
    // ignore file system errors on read-only environments
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');
  const roomId = searchParams.get('roomId');
  const isAdminMode = mode === 'admin';
  const deletedRegistry = readServerDeletedRegistry();

  try {
    const serverMessages = readServerChatStore(deletedRegistry);
    const supabase = await createClient();

    const { data: dbMessages, error } = await supabase
      .from(DRIVERENT_TABLES.chatMessages)
      .select('*')
      .order('created_at', { ascending: true })
      .limit(150);

    const validDbMessages: ChatMessage[] = [];
    if (!error && Array.isArray(dbMessages)) {
      for (const raw of dbMessages as ChatMessage[]) {
        if (isMessageMarkedDeleted(raw)) continue;
        const norm = normalizeChatMessage(raw);
        if (!isMessageFilteredByRegistry(norm, deletedRegistry)) {
          validDbMessages.push(norm);
        }
      }
    }

    const combined: ChatMessage[] = [...serverMessages, ...validDbMessages];
    const sortedAll = sortChatMessages(combined, deletedRegistry);
    writeServerChatStore(sortedAll, deletedRegistry);

    const responseMessages = isAdminMode
      ? sortedAll
      : filterMessagesForRoom(sortedAll, roomId, deletedRegistry);

    return NextResponse.json(
      {
        ok: true,
        messages: responseMessages,
        deletedRegistry,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch {
    const fallbackAll = readServerChatStore(deletedRegistry);
    return NextResponse.json(
      {
        ok: true,
        messages: isAdminMode
          ? fallbackAll
          : filterMessagesForRoom(fallbackAll, roomId, deletedRegistry),
        deletedRegistry,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      roomId = '',
      senderName = 'ลูกค้าทั่วไป',
      senderPhone = '-',
      senderEmail = '',
      message = '',
      channel = 'quick_inquiry',
      senderRole = 'customer',
    } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { ok: false, error: 'กรุณาระบุข้อความ' },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    const recordId =
      typeof id === 'string' && UUID_REGEX.test(id)
        ? id
        : crypto.randomUUID();

    const effectiveRoomId =
      typeof roomId === 'string' && roomId.trim()
        ? roomId.trim()
        : `guest:${crypto.randomUUID()}`;

    const packedEmailForDb = packSenderEmailWithRoom(
      senderEmail,
      effectiveRoomId
    );

    const newRecord: ChatMessage = normalizeChatMessage({
      id: recordId,
      room_id: effectiveRoomId,
      sender_name: senderName,
      sender_phone: senderPhone,
      sender_email: senderEmail,
      sender_role: senderRole,
      message: message.trim(),
      channel,
      created_at: nowIso,
      is_read: senderRole === 'admin',
    });

    // 1. บันทึกลงตาราง DriveRent_chat_messages ในโปรเจกต์ CharDB พร้อมแนบรหัสห้องแชทส่วนตัว (roomId)
    const supabase = await createClient();
    const { data: savedRow } = await supabase
      .from(DRIVERENT_TABLES.chatMessages)
      .upsert(
        {
          id: newRecord.id,
          sender_name: newRecord.sender_name,
          sender_phone: newRecord.sender_phone,
          sender_email: packedEmailForDb,
          sender_role: newRecord.sender_role,
          message: newRecord.message,
          channel: newRecord.channel,
          is_read: newRecord.is_read,
          created_at: newRecord.created_at,
        },
        { onConflict: 'id' }
      )
      .select('*')
      .maybeSingle();

    if (savedRow && savedRow.id) {
      newRecord.id = savedRow.id;
      newRecord.created_at = savedRow.created_at || newRecord.created_at;
    }

    // 2. บันทึกลง Server Store ด้วย ID และ room_id เดียวกัน
    const deletedRegistry = readServerDeletedRegistry();
    const currentStore = readServerChatStore(deletedRegistry);
    writeServerChatStore([...currentStore, newRecord], deletedRegistry);

    // 3. ส่งอีเมลแจ้งเตือนไปยัง Admin (startdoing4you@gmail.com) เฉพาะข้อความจากลูกค้า
    let emailDispatched = false;
    if (senderRole === 'customer') {
      try {
        const emailResponse = await fetch(
          `https://formsubmit.co/ajax/${ADMIN_EMAIL}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              _subject: `[charickDriveRent หาดใหญ่] ข้อความใหม่จากคุณ ${senderName} (${
                channel === 'live_chat' ? 'Live Chat' : 'ฟอร์มติดต่อด่วน'
              })`,
              ชื่อลูกค้า_Name: senderName,
              เบอร์โทรศัพท์_Phone: senderPhone,
              อีเมลลูกค้า_Email: senderEmail || 'ไม่ได้ระบุ',
              รหัสห้องแชท_Room: effectiveRoomId,
              ช่องทางที่ติดต่อ_Channel:
                channel === 'live_chat'
                  ? 'ระบบแชทสดหน้าเว็บ (Live Chat)'
                  : 'ฟอร์มส่งข้อความติดต่อด่วน (Quick Inquiry)',
              ข้อความ_Message: message.trim(),
              สาขา_Branch: 'charickDriveRent หาดใหญ่ จ.สงขลา',
              _template: 'table',
            }),
          }
        );
        emailDispatched = emailResponse.ok;
      } catch {
        emailDispatched = false;
      }
    }

    return NextResponse.json({
      ok: true,
      adminEmail: ADMIN_EMAIL,
      emailDispatched,
      record: newRecord,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : 'เกิดข้อผิดพลาดในการส่งข้อความ',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let roomId = searchParams.get('roomId') || '';
    let clientMessageIds: string[] = [];
    let deletedAtMs = Date.now();

    try {
      const body = await request.json();
      if (body?.roomId && !roomId) {
        roomId = String(body.roomId);
      }
      if (Array.isArray(body?.messageIds)) {
        clientMessageIds = body.messageIds.map(String);
      }
      if (typeof body?.deletedAtMs === 'number') {
        deletedAtMs = body.deletedAtMs;
      }
    } catch {
      // ignore if no body
    }

    if (!roomId && clientMessageIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'กรุณาระบุ roomId หรือ messageIds ที่ต้องการลบ' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. ค้นหารายการข้อความทั้งหมดในตาราง DriveRent_chat_messages ที่อยู่ในห้องแชทนี้ (กรณีลบทั้งห้อง)
    const dbIdsToDelete: string[] = [];
    if (roomId) {
      const allDb = await supabase
        .from(DRIVERENT_TABLES.chatMessages)
        .select('*');

      if (Array.isArray(allDb.data)) {
        for (const raw of allDb.data as ChatMessage[]) {
          const normalized = normalizeChatMessage(raw);
          if (normalized.room_id === roomId) {
            dbIdsToDelete.push(raw.id);
          }
        }
      }
    }

    const currentStore = readServerChatStore();
    const storeIdsToDelete = roomId
      ? currentStore.filter((m) => m.room_id === roomId).map((m) => m.id)
      : [];

    const allTargetIds = Array.from(
      new Set([...clientMessageIds, ...dbIdsToDelete, ...storeIdsToDelete])
    ).filter((id) => id && id !== DEFAULT_WELCOME_MESSAGE.id);

    // 2. บันทึกลง Server Tombstone Registry ทันทีเพื่อป้องกันข้อความเด้งกลับมาอีก 100%
    const currentReg = readServerDeletedRegistry();
    const updatedReg: DeletedChatRegistry = {
      deletedRoomIds: roomId
        ? Array.from(new Set([...currentReg.deletedRoomIds, roomId]))
        : currentReg.deletedRoomIds,
      deletedMessageIds: Array.from(
        new Set([...currentReg.deletedMessageIds, ...allTargetIds])
      ).slice(-500),
      deletedRoomTimestamps: roomId
        ? {
            ...currentReg.deletedRoomTimestamps,
            [roomId]: deletedAtMs,
          }
        : currentReg.deletedRoomTimestamps,
    };
    writeServerDeletedRegistry(updatedReg);

    // 3. ลบออกจาก Server Store
    const remaining = currentStore.filter(
      (m) =>
        (!roomId || m.room_id !== roomId) && !allTargetIds.includes(m.id)
    );
    writeServerChatStore(remaining, updatedReg);

    // 4. ลบในฐานข้อมูล Supabase ทั้งแบบ Soft-Delete (UPDATE sender_email = '||deleted:true' ซึ่งผ่าน RLS UPDATE 100%) และ Hard-Delete (DELETE)
    if (allTargetIds.length > 0) {
      await supabase
        .from(DRIVERENT_TABLES.chatMessages)
        .update({
          sender_email: DELETED_MARKER,
          message: '[DELETED]',
          is_read: true,
        })
        .in('id', allTargetIds);

      await supabase
        .from(DRIVERENT_TABLES.chatMessages)
        .delete()
        .in('id', allTargetIds);
    }

    return NextResponse.json({
      ok: true,
      deletedRoomId: roomId,
      deletedCount: allTargetIds.length,
      deletedRegistry: updatedReg,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'ลบห้องแชทไม่สำเร็จ',
      },
      { status: 500 }
    );
  }
}
