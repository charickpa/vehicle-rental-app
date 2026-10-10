import {
  DRIVERENT_STORAGE_KEYS,
  type Vehicle,
} from '@/types/database';

export interface VehicleExtraDetails {
  gallery: string[];
  specs: {
    engine: string;
    transmission: string;
    seats: string;
    fuel: string;
    consumption: string;
  };
  highlights: string[];
  description: string;
}

export interface CatalogVehicle extends Vehicle {
  details: VehicleExtraDetails;
}

/**
 * ข้อมูลตัวอย่างรถยนต์ 10 คัน และมอเตอร์ไซค์ 10 คัน (รวม 20 คัน)
 * พร้อมรูปภาพเพิ่มเติม (Gallery) และสเปกโดยละเอียดสำหรับหน้าต่างดูรายละเอียดรถ
 */
export const SAMPLE_VEHICLES_CATALOG: CatalogVehicle[] = [
  // ==========================================================================
  // 🚗 รถยนต์ (CARS) - 10 คัน
  // ==========================================================================
  {
    id: 'car-01',
    name: 'Yaris Ativ 1.2 Smart',
    type: 'car',
    brand: 'Toyota',
    license_plate: 'กข 1234 กรุงเทพมหานคร',
    price_per_day: 1200,
    image_url:
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:00:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '1,197 ซีซี Dual VVT-iE',
        transmission: 'อัตโนมัติ Super CVT-i',
        seats: '5 ที่นั่ง',
        fuel: 'เบนซิน / แก๊สโซฮอล์ E20',
        consumption: '23.3 กม./ลิตร',
      },
      highlights: [
        'กล้องมองรอบคัน 360 องศา',
        'หน้าจอสัมผัส 9 นิ้ว รองรับ Apple CarPlay',
        'ระบบความปลอดภัย Toyota Safety Sense',
        'เบาะหนังสังเคราะห์พรีเมียม นั่งสบาย',
      ],
      description:
        'อีโคคาร์ซีดานยอดนิยม ขับขี่คล่องตัวในเมือง ประหยัดน้ำมันสูงสุด พร้อมระบบความปลอดภัยครบครัน เหมาะสำหรับเดินทางท่องเที่ยวและทำงาน',
    },
  },
  {
    id: 'car-02',
    name: 'Civic e:HEV RS',
    type: 'car',
    brand: 'Honda',
    license_plate: 'ขค 5678 กรุงเทพมหานคร',
    price_per_day: 1800,
    image_url:
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:01:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '2.0 ลิตร Full Hybrid e:HEV',
        transmission: 'อัตโนมัติ E-CVT',
        seats: '5 ที่นั่ง',
        fuel: 'เบนซิน / E20 (ประหยัดพิเศษ)',
        consumption: '25.0 กม./ลิตร',
      },
      highlights: [
        'ขุมพลังฟูลไฮบริด แรงและประหยัดน้ำมัน',
        'ระบบ Honda SENSING เต็มรูปแบบ',
        'เครื่องเสียง BOSE 12 ตำแหน่ง',
        'ดีไซน์สปอร์ต RS รอบคัน',
      ],
      description:
        'สปอร์ตซีดานระดับพรีเมียม สมรรถนะอัตราเร่งดีเยี่ยมด้วยมอเตอร์ไฟฟ้าคู่ ขับสนุก นุ่มนวล และประหยัดน้ำมันเป็นเลิศ',
    },
  },
  {
    id: 'car-03',
    name: 'Corolla Cross HEV GR Sport',
    type: 'car',
    brand: 'Toyota',
    license_plate: 'กท 2468 กรุงเทพมหานคร',
    price_per_day: 1900,
    image_url:
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:02:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '1.8 ลิตร Hybrid รุ่นที่ 4',
        transmission: 'อัตโนมัติ E-CVT',
        seats: '5 ที่นั่ง (SUV)',
        fuel: 'เบนซิน / แก๊สโซฮอล์ E20',
        consumption: '23.3 กม./ลิตร',
      },
      highlights: [
        'หลังคา Panoramic Roof แบบไร้คานกลาง',
        'ฝาท้ายเปิด-ปิดไฟฟ้าพร้อมเซนเซอร์เท้า',
        'ช่วงล่างปรับจูนพิเศษเฉพาะรุ่น GR Sport',
        'พื้นที่เก็บสัมภาระด้านท้ายขนาดใหญ่',
      ],
      description:
        'รถอเนกประสงค์ SUV ไฮบริดยอดฮิต ยกสูงทัศนวิสัยชัดเจน ห้องโดยสารกว้างขวาง บรรทุกกระเป๋าเดินทางใบใหญ่ได้สบาย',
    },
  },
  {
    id: 'car-04',
    name: 'HR-V e:HEV RS',
    type: 'car',
    brand: 'Honda',
    license_plate: 'ญญ 3579 เชียงใหม่',
    price_per_day: 1750,
    image_url:
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:03:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '1.5 ลิตร e:HEV Hybrid',
        transmission: 'อัตโนมัติ E-CVT',
        seats: '5 ที่นั่ง (SUV)',
        fuel: 'เบนซิน / E20',
        consumption: '25.6 กม./ลิตร',
      },
      highlights: [
        'หลังคากระจกพาโนรามา (Panoramic Glass Roof)',
        'เบาะหลังพับได้อเนกประสงค์ 3 รูปแบบ',
        'แท่นชาร์จสมาร์ทโฟนไร้สาย Wireless Charger',
        'ระบบควบคุมความเร็วขณะลงทางลาดชัน',
      ],
      description:
        'สปอร์ตครอสโอเวอร์ดีไซน์โฉบเฉี่ยว ขับขึ้นดอยหรือทางไกลมั่นใจด้วยแรงบิดมอเตอร์ไฟฟ้า พร้อมห้องโดยสารโปร่งโล่ง',
    },
  },
  {
    id: 'car-05',
    name: 'Fortuner 2.8 Legender 4WD',
    type: 'car',
    brand: 'Toyota',
    license_plate: 'รม 8899 กรุงเทพมหานคร',
    price_per_day: 2800,
    image_url:
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:04:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '2.8 ลิตร ดีเซลเทอร์โบ 204 แรงม้า',
        transmission: 'อัตโนมัติ 6 สปีด พร้อมขับเคลื่อน 4 ล้อ',
        seats: '7 ที่นั่ง (PPV SUV)',
        fuel: 'ดีเซล B7',
        consumption: '14.5 กม./ลิตร',
      },
      highlights: [
        'ห้องโดยสารขนาดใหญ่ 7 ที่นั่งสำหรับครอบครัว',
        'ระบบขับเคลื่อน 4 ล้อ Sigma4 ลุยได้ทุกเส้นทาง',
        'ชุดเครื่องเสียง JBL Premium Audio',
        'กล้องมองรอบคัน 3 มิติ (Panoramic View)',
      ],
      description:
        'รถ PPV อเนกประสงค์ 7 ที่นั่งระดับท็อป พละกำลังสูง ลุยขึ้นเขาและเดินทางเป็นกลุ่มใหญ่ได้อย่างสะดวกสบายและปลอดภัย',
    },
  },
  {
    id: 'car-06',
    name: 'Camry 2.5 HEV Premium Luxury',
    type: 'car',
    brand: 'Toyota',
    license_plate: 'ธน 9999 กรุงเทพมหานคร',
    price_per_day: 2500,
    image_url:
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:05:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '2.5 ลิตร Dynamic Force Hybrid',
        transmission: 'อัตโนมัติ E-CVT',
        seats: '5 ที่นั่ง (Executive Sedan)',
        fuel: 'เบนซิน / E20',
        consumption: '21.5 กม./ลิตร',
      },
      highlights: [
        'เบาะหลังปรับเอนไฟฟ้าพร้อมแผงควบคุมดิจิทัล',
        'ม่านบังแดดไฟฟ้าสำหรับผู้โดยสารตอนหลัง',
        'หน้าจอแสดงผลบนกระจกหน้า HUD',
        'ความเงียบห้องโดยสารระดับผู้บริหาร',
      ],
      description:
        'ยนตรกรรมซีดานหรูระดับผู้บริหาร มอบความนุ่มนวล เงียบสงบ และภาพลักษณ์เหนือระดับ เหมาะสำหรับงานรับรองแขก VIP หรือทริปพิเศษ',
    },
  },
  {
    id: 'car-07',
    name: 'Mazda 3 2.0 SP Fastback',
    type: 'car',
    brand: 'Mazda',
    license_plate: 'ฆง 4321 ภูเก็ต',
    price_per_day: 1600,
    image_url:
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:06:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '2.0 ลิตร Skyactiv-G 165 แรงม้า',
        transmission: 'อัตโนมัติ 6 สปีด พร้อม Paddle Shift',
        seats: '5 ที่นั่ง (Hatchback 5 ประตู)',
        fuel: 'เบนซิน / E20',
        consumption: '15.9 กม./ลิตร',
      },
      highlights: [
        'ดีไซน์ KODO Design สปอร์ตหรูระดับยุโรป',
        'ระบบควบคุมสมรรถนะการขับขี่ G-Vectoring Control Plus',
        'หลังคาซันรูฟไฟฟ้า',
        'ระบบเสียงรอบทิศทาง BOSE 12 ลำโพง',
      ],
      description:
        'แฮทช์แบ็ก 5 ประตูดีไซน์สปอร์ตพรีเมียม เกาะถนนดีเยี่ยม เข้าโค้งแม่นยำ ตอบโจทย์คนรักการขับขี่และถ่ายรูปสวยทุกมุมมอง',
    },
  },
  {
    id: 'car-08',
    name: 'BYD Atto 3 Extended Range',
    type: 'car',
    brand: 'BYD',
    license_plate: 'อว 1001 กรุงเทพมหานคร',
    price_per_day: 1650,
    image_url:
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:07:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: 'มอเตอร์ไฟฟ้า 204 แรงม้า (EV 100%)',
        transmission: 'อัตโนมัติ Single Speed EV',
        seats: '5 ที่นั่ง (Electric SUV)',
        fuel: 'ไฟฟ้า 100% (วิ่งได้ 480 กม./ชาร์จ)',
        consumption: 'ชาร์จเร็ว DC 30-80% ใน 30 นาที',
      },
      highlights: [
        'รถยนต์ไฟฟ้า 100% ประหยัดค่าพลังงานสูงสุด',
        'หน้าจอกลางหมุนได้ด้วยไฟฟ้าขนาด 15.6 นิ้ว',
        'หลังคา Panoramic Sunroof ขนาดใหญ่',
        'อัตราเร่ง 0-100 กม./ชม. เพียง 7.3 วินาที',
      ],
      description:
        'SUV ไฟฟ้า 100% ขับขี่เงียบสนิท อัตราเร่งทันใจ รองรับหัวชาร์จ Fast Charge ทั่วประเทศ ประหยัดค่าใช้จ่ายในการเดินทาง',
    },
  },
  {
    id: 'car-09',
    name: 'Tesla Model 3 Long Range',
    type: 'car',
    brand: 'Tesla',
    license_plate: 'ทล 3333 กรุงเทพมหานคร',
    price_per_day: 3200,
    image_url:
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:08:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: 'Dual Motor All-Wheel Drive (EV)',
        transmission: 'อัตโนมัติ EV',
        seats: '5 ที่นั่ง',
        fuel: 'ไฟฟ้า 100% (วิ่งไกลสุด 629 กม./ชาร์จ)',
        consumption: 'อัตราเร่ง 0-100 ใน 4.4 วินาที',
      },
      highlights: [
        'ระบบช่วยขับขี่ Autopilot อัจฉริยะ',
        'หลังคากระจกเต็มบานกรองแสง UV 100%',
        'จอผู้โดยสารตอนหลังขนาด 8 นิ้ว ดู Netflix/YouTube ได้',
        'เบาะระบายอากาศคู่หน้า นั่งสบายไม่ร้อน',
      ],
      description:
        'รถยนต์ไฟฟ้าระดับโลกโฉมใหม่ (Highland) ช่วงล่างนุ่มหนึบ เงียบกริบด้วยกระจก Acoustic รอบคัน พร้อมเทคโนโลยีล้ำสมัยที่สุด',
    },
  },
  {
    id: 'car-10',
    name: 'BMW 320d M Sport',
    type: 'car',
    brand: 'BMW',
    license_plate: 'บม 5555 กรุงเทพมหานคร',
    price_per_day: 3900,
    image_url:
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:09:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '2.0 ลิตร TwinPower Turbo ดีเซล 190 แรงม้า',
        transmission: 'อัตโนมัติ 8 สปีด Steptronic Sport',
        seats: '5 ที่นั่ง (Luxury Sport Sedan)',
        fuel: 'ดีเซล B7 (ประหยัดและแรงบิดสูง)',
        consumption: '20.4 กม./ลิตร',
      },
      highlights: [
        'หน้าจอโค้ง BMW Curved Display เต็มตา',
        'ชุดแต่ง M Sport แท้จากโรงงานรอบคัน',
        'ระบบช่วยนำรถเข้าที่จอดอัตโนมัติ Parking Assistant',
        'ช่วงล่าง M Sport เกาะถนนระดับซูเปอร์คาร์',
      ],
      description:
        'สปอร์ตซีดานยุโรปสุดหรู มอบประสบการณ์การขับขี่ที่เร้าใจ แรงบิดสูงแต่ประหยัดน้ำมันเป็นเยี่ยม เหมาะสำหรับวันพิเศษของคุณ',
    },
  },

  // ==========================================================================
  // 🏍️ มอเตอร์ไซค์ (MOTORCYCLES) - 10 คัน
  // ==========================================================================
  {
    id: 'moto-01',
    name: 'PCX 160 ABS',
    type: 'motorcycle',
    brand: 'Honda',
    license_plate: '1กข 9999 เชียงใหม่',
    price_per_day: 350,
    image_url:
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:10:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '157 ซีซี eSP+ 4 วาล์ว',
        transmission: 'ออโตเมติก V-Matic',
        seats: '2 ที่นั่ง',
        fuel: 'แก๊สโซฮอล์ 91 / 95 / E20',
        consumption: '52.6 กม./ลิตร',
      },
      highlights: [
        'ระบบเบรก ABS ล้อหน้า ป้องกันล้อล็อก',
        'ระบบป้องกันล้อหมุนฟรี HSTC',
        'กุญแจรีโมทอัจฉริยะ Honda SMART Key',
        'กล่องเก็บของใต้เบาะขนาดใหญ่ 30 ลิตร + ช่องชาร์จ USB Type-C',
      ],
      description:
        'พรีเมียมสกู๊ตเตอร์ยอดนิยม ขี่นุ่มสบาย เบาะกว้างนั่งซ้อนท้ายไม่เมื่อย มีช่องชาร์จมือถือและเก็บหมวกกันน็อคใต้เบาะได้เต็มใบ',
    },
  },
  {
    id: 'moto-02',
    name: 'XMAX 300 Connected',
    type: 'motorcycle',
    brand: 'Yamaha',
    license_plate: '2ขค 8888 ภูเก็ต',
    price_per_day: 600,
    image_url:
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:11:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '292 ซีซี Blue Core ระบายความร้อนด้วยน้ำ',
        transmission: 'ออโตเมติก CVT',
        seats: '2 ที่นั่ง (Big Scooter)',
        fuel: 'แก๊สโซฮอล์ 95 / E20',
        consumption: '32.0 กม./ลิตร',
      },
      highlights: [
        'เรือนไมล์ดิจิทัล 2 จอ พร้อมระบบนำทาง Garmin',
        'ระบบเบรก ABS หน้า-หลัง และ Traction Control',
        'ใต้เบาะเก็บหมวกกันน็อคเต็มใบได้ถึง 2 ใบ',
        'กำลังเครื่องยนต์สูง ขับขี่ออกทริปขึ้นเขาได้สบาย',
      ],
      description:
        'บิ๊กสกู๊ตเตอร์คลาส 300 ซีซี ยอดฮิต ทรงพลัง ขับขี่ทางไกลและขึ้นดอยได้มั่นใจ พร้อมพื้นที่เก็บสัมภาระใต้เบาะขนาดใหญ่พิเศษ',
    },
  },
  {
    id: 'moto-03',
    name: 'Click 160 ABS',
    type: 'motorcycle',
    brand: 'Honda',
    license_plate: '1กง 1122 เชียงใหม่',
    price_per_day: 300,
    image_url:
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:12:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '157 ซีซี eSP+ 4 วาล์ว',
        transmission: 'ออโตเมติก V-Matic',
        seats: '2 ที่นั่ง',
        fuel: 'แก๊สโซฮอล์ 91 / 95 / E20',
        consumption: '50.0 กม./ลิตร',
      },
      highlights: [
        'ตัวรถกะทัดรัด คล่องตัว แต่ได้เครื่องยนต์ 160 ซีซี',
        'พื้นวางเท้าแบบเรียบ วางกระเป๋าหรือของใช้สะดวก',
        'ดิสก์เบรกหน้า-หลัง พร้อมระบบ ABS',
        'กุญแจรีโมทอัจฉริยะ Smart Key',
      ],
      description:
        'สปอร์ตออโตเมติกขนาดคล่องตัว น้ำหนักเบา เลี้ยวง่าย แต่อัตราเร่งจัดจ้านด้วยเครื่อง 160 ซีซี เหมาะกับทั้งในเมืองและขึ้นเนินชัน',
    },
  },
  {
    id: 'moto-04',
    name: 'Grand Filano Hybrid ABS',
    type: 'motorcycle',
    brand: 'Yamaha',
    license_plate: '3กท 2233 กรุงเทพมหานคร',
    price_per_day: 320,
    image_url:
      'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:13:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '125 ซีซี Blue Core Hybrid',
        transmission: 'ออโตเมติกสายพาน',
        seats: '2 ที่นั่ง',
        fuel: 'แก๊สโซฮอล์ 91 / 95 / E20',
        consumption: '62.5 กม./ลิตร',
      },
      highlights: [
        'ดีไซน์โมเดิร์นคลาสสิก ถ่ายรูปคาเฟ่สวยทุกมุม',
        'ช่องเติมน้ำมันด้านหน้า ไม่ต้องลงจากรถตอนเติม',
        'ประหยัดน้ำมันสูงสุดถึง 62.5 กม./ลิตร',
        'เรือนไมล์ดิจิทัลสี TFT ทันสมัย',
      ],
      description:
        'สกู๊ตเตอร์ทรงคลาสสิกสุดฮิต ขี่ง่าย เบาะไม่สูง น้ำหนักเบา และประหยัดน้ำมันที่สุด เหมาะสำหรับสายเที่ยวคาเฟ่และขี่ชิลล์',
    },
  },
  {
    id: 'moto-05',
    name: 'Forza 350 Roadsync',
    type: 'motorcycle',
    brand: 'Honda',
    license_plate: '4ขค 3344 ภูเก็ต',
    price_per_day: 650,
    image_url:
      'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:14:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '330 ซีซี eSP+ 4 วาล์ว',
        transmission: 'ออโตเมติก CVT',
        seats: '2 ที่นั่ง (Premium Big Scooter)',
        fuel: 'แก๊สโซฮอล์ 95 / E20',
        consumption: '30.0 กม./ลิตร',
      },
      highlights: [
        'กระจกบังลมหน้าปรับระดับด้วยระบบไฟฟ้า 180 มม.',
        'หน้าจอ TFT ใหม่พร้อมระบบสั่งงานด้วยเสียง Honda RoadSync',
        'ช่วงล่างนุ่มหนึบ นั่งซ้อนท้ายทางไกลสบายที่สุด',
        'ระบบเบรก ABS หน้า-หลัง และ Traction Control',
      ],
      description:
        'บิ๊กสกู๊ตเตอร์ 350 ซีซี ระดับเรือธง มาพร้อมชิลด์หน้าปรับไฟฟ้าตัดลมได้ดีเยี่ยม ขี่ทางไกลสบายเหมือนนั่งเฟิร์สคลาส',
    },
  },
  {
    id: 'moto-06',
    name: 'NMAX 155 Connected',
    type: 'motorcycle',
    brand: 'Yamaha',
    license_plate: '5กง 4455 เชียงใหม่',
    price_per_day: 350,
    image_url:
      'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:15:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '155 ซีซี Blue Core VVA (วาล์วแปรผัน)',
        transmission: 'ออโตเมติก CVT',
        seats: '2 ที่นั่ง',
        fuel: 'แก๊สโซฮอล์ 91 / 95 / E20',
        consumption: '45.0 กม./ลิตร',
      },
      highlights: [
        'ระบบวาล์วแปรผัน VVA เร่งแซงทันใจทุกย่านความเร็ว',
        'ดิสก์เบรกหน้า-หลัง พร้อมระบบ ABS ทั้ง 2 ล้อ',
        'ระบบป้องกันล้อหมุนฟรี Traction Control',
        'ท่านั่งเหยียดขาได้สบาย ลดความเมื่อยล้า',
      ],
      description:
        'พรีเมียมสกู๊ตเตอร์ 155 ซีซี ที่ให้ความมั่นใจสูงสุดด้วยระบบเบรก ABS ทั้งล้อหน้าและล้อหลัง พร้อมเครื่องยนต์ VVA ขับสนุก',
    },
  },
  {
    id: 'moto-07',
    name: 'ADV 160 ABS',
    type: 'motorcycle',
    brand: 'Honda',
    license_plate: '6ขค 5566 เชียงราย',
    price_per_day: 400,
    image_url:
      'https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:16:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '157 ซีซี eSP+ 4 วาล์ว',
        transmission: 'ออโตเมติก V-Matic',
        seats: '2 ที่นั่ง (SUV Scooter)',
        fuel: 'แก๊สโซฮอล์ 91 / 95 / E20',
        consumption: '48.0 กม./ลิตร',
      },
      highlights: [
        'โช้คหลังคู่ SHOWA แบบมีซับแทงค์ ซับแรงกระแทกดีเยี่ยม',
        'ยางกึ่งลุย Dual Purpose เกาะถนนทุกสภาพผิว',
        'แฮนด์บาร์ทรงกว้างควบคุมรถง่ายและมั่นคง',
        'ชิลด์บังลมหน้าปรับระดับความสูงได้ 2 ระดับ',
      ],
      description:
        'สกู๊ตเตอร์สายลุยสไตล์ SUV ช่วงล่างแน่นหนึบด้วยโช้คซับแทงค์ ขี่ผ่านถนนขรุขระหรือทางขึ้นเขาได้อย่างนุ่มนวลและปลอดภัย',
    },
  },
  {
    id: 'moto-08',
    name: 'Vespa Sprint 150 i-Get ABS',
    type: 'motorcycle',
    brand: 'Vespa',
    license_plate: '7กท 6677 กรุงเทพมหานคร',
    price_per_day: 550,
    image_url:
      'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:17:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '154.8 ซีซี i-Get 3 วาล์ว',
        transmission: 'ออโตเมติก CVT',
        seats: '2 ที่นั่ง (Italian Classic Scooter)',
        fuel: 'แก๊สโซฮอล์ 95',
        consumption: '40.0 กม./ลิตร',
      },
      highlights: [
        'เอกลักษณ์ไฟหน้าทรงหกเหลี่ยมสไตล์สปอร์ตอิตาเลียน',
        'โครงสร้างตัวถังเหล็กกล้าแข็งแรงและสมดุลดีเยี่ยม',
        'ระบบเบรก ABS ล้อหน้า พร้อมช่องชาร์จ USB',
        'โดดเด่นมีสไตล์สำหรับการถ่ายรูปและท่องเที่ยวในเมือง',
      ],
      description:
        'สกู๊ตเตอร์พรีเมียมระดับตำนานจากอิตาลี ดีไซน์สวยคลาสสิกเหนือกาลเวลา ขับขี่นุ่มนวลและมีเอกลักษณ์ไม่เหมือนใคร',
    },
  },
  {
    id: 'moto-09',
    name: 'CB500X Adventure',
    type: 'motorcycle',
    brand: 'Honda',
    license_plate: '8ขค 7788 เชียงใหม่',
    price_per_day: 950,
    image_url:
      'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:18:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558981359-219d6364c9c8?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '471 ซีซี 2 สูบเรียง DOHC',
        transmission: 'เกียร์ธรรมดา 6 สปีด พร้อม Assist/Slipper Clutch',
        seats: '2 ที่นั่ง (Touring Adventure)',
        fuel: 'แก๊สโซฮอล์ 95 / E20',
        consumption: '28.5 กม./ลิตร',
      },
      highlights: [
        'โช้คหน้าหัวกลับ Upside-Down SHOWA SFF-BP',
        'ดิสก์เบรกหน้าคู่ พร้อมระบบ ABS หน้า-หลัง',
        'คลัตช์นิ่มพิเศษด้วยระบบ Assist & Slipper Clutch',
        'พร้อมกล่องท้ายอลูมิเนียมเก็บสัมภาระออกทริป',
      ],
      description:
        'บิ๊กไบค์ทัวริ่งแอดเวนเจอร์ 500 ซีซี ยอดนิยม ท่านั่งหลังตรงไม่ปวดหลัง กำลังเครื่องยนต์เหลือเฟือสำหรับการพิชิตโค้งและภูเขาสูง',
    },
  },
  {
    id: 'moto-10',
    name: 'Aerox 155 ABS',
    type: 'motorcycle',
    brand: 'Yamaha',
    license_plate: '9กง 8899 ภูเก็ต',
    price_per_day: 340,
    image_url:
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80',
    status: 'available',
    created_at: '2026-10-10T09:19:00Z',
    details: {
      gallery: [
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80',
      ],
      specs: {
        engine: '155 ซีซี Blue Core VVA',
        transmission: 'ออโตเมติกสายพาน CVT',
        seats: '2 ที่นั่ง (Sport Automatic)',
        fuel: 'แก๊สโซฮอล์ 91 / 95 / E20',
        consumption: '46.0 กม./ลิตร',
      },
      highlights: [
        'ยางหลังหน้ากว้างพิเศษ 140 มม. เกาะโค้งมั่นใจ',
        'อัตราเร่งดีที่สุดในคลาสออโตเมติก 155 ซีซี',
        'ระบบเบรก ABS และกุญแจ Smart Key',
        'ดีไซน์สปอร์ตโฉบเฉี่ยวสายพันธุ์ R-Series',
      ],
      description:
        'สปอร์ตออโตเมติกสายพันธุ์แรง รูปทรงโฉบเฉี่ยว ยางหน้ากว้างเกาะถนนเป็นเยี่ยม ขับสนุกและคล่องตัวในทุกเส้นทาง',
    },
  },
];

const CUSTOM_DETAILS_STORAGE_KEY = DRIVERENT_STORAGE_KEYS.customVehicles;
const META_HASH_PREFIX = '#driverent_meta=';

/**
 * ตัดข้อมูล Metadata (#driverent_meta=...) ออกจากลิงก์รูปภาพ เพื่อใช้แสดงในช่อง Input URL ตอนแก้ไข
 */
export function stripVehicleMetaFromUrl(url?: string | null): string {
  if (!url) return '';
  return url.split(META_HASH_PREFIX)[0].trim();
}

/**
 * แนบข้อมูลสเปก รายละเอียด และรูป Gallery ทั้ง 4 มุมมองไว้ใน Hash Fragment ของ image_url
 * เพื่อบันทึกลงคอลัมน์ image_url ในตาราง DriveRent_vehicles บน Supabase ได้ทันทีโดยไม่ต้องเพิ่มคอลัมน์ใหม่
 * และเบราว์เซอร์ยังคงโหลดรูปภาพจาก URL ได้ตามปกติ 100%
 */
export function packImageUrlWithDetails(
  mainImageUrl: string,
  details: VehicleExtraDetails
): string {
  const cleanMain = stripVehicleMetaFromUrl(mainImageUrl);
  const cleanGallery = (details.gallery || [])
    .map((u) => stripVehicleMetaFromUrl(u))
    .filter(Boolean);

  const payload: VehicleExtraDetails = {
    gallery: cleanGallery.length > 0 ? cleanGallery : [cleanMain],
    specs: details.specs,
    highlights: details.highlights,
    description: details.description,
  };

  try {
    return `${cleanMain}${META_HASH_PREFIX}${encodeURIComponent(
      JSON.stringify(payload)
    )}`;
  } catch {
    return cleanMain;
  }
}

export function extractDetailsFromImageUrl(
  url?: string | null
): VehicleExtraDetails | null {
  if (!url || !url.includes(META_HASH_PREFIX)) return null;
  try {
    const encoded = url.split(META_HASH_PREFIX)[1];
    if (!encoded) return null;
    const parsed = JSON.parse(
      decodeURIComponent(encoded)
    ) as VehicleExtraDetails;
    if (parsed && parsed.specs && Array.isArray(parsed.gallery)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveCustomVehicleDetails(
  licensePlate: string,
  details: VehicleExtraDetails,
  vehicleId?: string
) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(CUSTOM_DETAILS_STORAGE_KEY);
    const map: Record<string, VehicleExtraDetails> = raw ? JSON.parse(raw) : {};
    if (licensePlate && licensePlate.trim()) {
      map[licensePlate.trim()] = details;
    }
    if (vehicleId && vehicleId.trim()) {
      map[`id:${vehicleId.trim()}`] = details;
    }
    localStorage.setItem(CUSTOM_DETAILS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage errors
  }
}

/**
 * ดึงรายละเอียดเพิ่มเติมและแกลเลอรีรูปภาพของรถแต่ละคัน
 * ลำดับการดึง: 1) ข้อมูลที่แนบมาใน image_url จาก Supabase (#driverent_meta=...) -> 2) LocalStorage -> 3) SAMPLE_VEHICLES_CATALOG -> 4) ค่าเริ่มต้น
 */
export function getVehicleExtraDetails(vehicle: Vehicle): VehicleExtraDetails {
  const cleanMainImage =
    stripVehicleMetaFromUrl(vehicle.image_url) ||
    (vehicle.type === 'car'
      ? 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80'
      : 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80');

  // 1. ตรวจสอบข้อมูลที่บันทึกไว้ใน image_url บนฐานข้อมูล Supabase (เมื่อแอดมินกดแก้ไขหรือเพิ่มรถ)
  const embeddedDetails = extractDetailsFromImageUrl(vehicle.image_url);
  if (embeddedDetails) {
    const gallery =
      embeddedDetails.gallery.length > 0
        ? embeddedDetails.gallery
        : [cleanMainImage];
    return {
      ...embeddedDetails,
      gallery,
    };
  }

  // 2. ตรวจสอบข้อมูลจาก LocalStorage (ค้นหาทั้งจาก vehicle.id และป้ายทะเบียน)
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CUSTOM_DETAILS_STORAGE_KEY);
      if (raw) {
        const map: Record<string, VehicleExtraDetails> = JSON.parse(raw);
        const byId = vehicle.id ? map[`id:${vehicle.id.trim()}`] : undefined;
        const byPlate = vehicle.license_plate
          ? map[vehicle.license_plate.trim()]
          : undefined;
        const custom = byId || byPlate;
        if (custom) {
          return custom;
        }
      }
    } catch {
      // Ignore parse error
    }
  }

  // 3. ตรวจสอบจากคลังข้อมูลรถตัวอย่าง 20 รุ่น (เทียบป้ายทะเบียนหรือชื่อรุ่น)
  const matched = SAMPLE_VEHICLES_CATALOG.find(
    (item) =>
      item.license_plate === vehicle.license_plate ||
      item.name.toLowerCase() === vehicle.name.toLowerCase()
  );

  if (matched) {
    const gallery = [...matched.details.gallery];
    if (cleanMainImage && gallery[0] !== cleanMainImage) {
      gallery[0] = cleanMainImage;
    }
    return {
      ...matched.details,
      gallery,
    };
  }

  // 4. ค่าเริ่มต้นสำหรับรถทั่วไป
  return {
    gallery:
      vehicle.type === 'car'
        ? [
            cleanMainImage,
            'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
          ]
        : [
            cleanMainImage,
            'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=900&q=80',
          ],
    specs: {
      engine: vehicle.type === 'car' ? 'เบนซิน / ไฮบริด' : '150 - 300 ซีซี หัวฉีด',
      transmission: 'อัตโนมัติ (Automatic)',
      seats: vehicle.type === 'car' ? '5 ที่นั่ง' : '2 ที่นั่ง',
      fuel: 'แก๊สโซฮอล์ 95 / E20',
      consumption: vehicle.type === 'car' ? '20 กม./ลิตร' : '45 กม./ลิตร',
    },
    highlights: [
      'ตรวจเช็คสภาพมาตรฐาน 25 จุดก่อนส่งมอบ',
      'ฟรีประกันภัยคุ้มครองตลอดการเช่า',
      'ไม่จำกัดระยะทางวิ่งต่อวัน',
      'บริการช่วยเหลือฉุกเฉิน 24 ชั่วโมง',
    ],
    description: `${vehicle.brand} ${vehicle.name} สภาพใหม่พร้อมใช้งาน ขับขี่ปลอดภัย ประหยัดน้ำมัน ทำความสะอาดและฆ่าเชื้อก่อนส่งมอบทุกครั้ง`,
  };
}
