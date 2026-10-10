export type VehicleType = 'car' | 'motorcycle';
export type VehicleStatus = 'available' | 'maintenance' | 'rented';
export type UserRole = 'customer' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentOption = 'deposit_30' | 'full_100';

// ============================================================================
// การตั้งค่า Namespace สำหรับโปรเจกต์ Supabase "CharDB"
// แยกส่วนของเว็บเช่ารถ "DriveRent" ออกจากเว็บไซต์อื่นที่จะมาใช้ CharDB ร่วมกันในอนาคต
// ============================================================================
export const SUPABASE_PROJECT_NAME = 'CharDB';
export const DRIVERENT_APP_ID = 'DriveRent';
export const DRIVERENT_NAMESPACE_PREFIX = 'DriveRent_';

// 1. ชื่อตารางในฐานข้อมูล (ทุกตารางนำหน้าด้วย DriveRent_)
export const DRIVERENT_TABLES = {
  profiles: 'DriveRent_profiles',
  vehicles: 'DriveRent_vehicles',
  bookings: 'DriveRent_bookings',
  reviews: 'DriveRent_reviews',
  chatMessages: 'DriveRent_chat_messages',
} as const;

// 2. ชื่อ Storage Buckets สำหรับเก็บไฟล์แยกเฉพาะของเว็บ DriveRent (พร้อมชื่อเดิมสำหรับ Fallback)
export const DRIVERENT_STORAGE_BUCKETS = {
  vehicles: 'DriveRent-vehicles',
  vehiclesFallback: 'vehicles',
  paymentSlips: 'DriveRent-payment-slips',
  paymentSlipsFallback: 'payment-slips',
} as const;

// 3. ชื่อ Channel สำหรับ Supabase Realtime & BroadcastChannel แยกเฉพาะของเว็บ DriveRent
export const DRIVERENT_REALTIME_CHANNELS = {
  broadcastRoom: 'CharDB_DriveRent_live_chat_bcast_v2',
  postgresPrefix: 'CharDB_DriveRent_pg_chat',
  browserBroadcast: 'CharDB_DriveRent_browser_channel_v2',
} as const;

// 4. ชื่อคีย์ LocalStorage แยกเฉพาะของเว็บ DriveRent (ไม่ชนกับเว็บอื่นแม้รันบน localhost เดียวกัน)
export const DRIVERENT_STORAGE_KEYS = {
  chatMessages: 'CharDB_DriveRent_chat_messages_v3',
  visitorRoomId: 'CharDB_DriveRent_visitor_room_id_v1',
  customerReviews: 'CharDB_DriveRent_customer_reviews_v1',
  customVehicles: 'CharDB_DriveRent_custom_vehicles_v1',
  language: 'CharDB_DriveRent_lang',
} as const;

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  brand: string;
  license_plate: string;
  price_per_day: number;
  image_url: string | null;
  status: VehicleStatus;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone_number: string | null;
  role: UserRole;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  vehicle_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  total_price: number;
  deposit_amount?: number;     // ยอดมัดจำล่วงหน้า 30%
  remaining_amount?: number;   // ยอดคงเหลือชำระวันรับรถ 70%
  payment_option?: PaymentOption;
  payment_slip_url: string | null;
  pickup_location?: string;    // สถานที่นัดรับ-คืนรถในหาดใหญ่
  pickup_time?: string;        // เวลานัดรับรถ
  flight_or_note?: string;     // เลขเที่ยวบิน / ชื่อโรงแรม / หมายเหตุเพิ่มเติม
  status: BookingStatus;
  created_at: string;
  vehicles?: Vehicle;          // Joined relation (legacy alias)
  DriveRent_vehicles?: Vehicle; // Joined relation (CharDB DriveRent_ prefix)
  profiles?: Profile;          // Joined customer profile
  DriveRent_profiles?: Profile;
}

export interface ChatMessage {
  id: string;
  room_id?: string; // รหัสห้องแชทส่วนตัวของลูกค้าแต่ละราย (ป้องกันไม่ให้ลูกค้าคนอื่นเห็นแชทของกันและกัน)
  sender_name: string;
  sender_phone: string;
  sender_email?: string;
  sender_role: 'customer' | 'admin' | 'system';
  message: string;
  channel: 'live_chat' | 'quick_inquiry';
  created_at: string;
  is_read?: boolean;
}
