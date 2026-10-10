import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  ensureDriveRentProfile,
  fetchUserProfile,
} from '@/lib/supabase/tables';
import { LanguageProvider } from '@/components/LanguageProvider';
import BrandLogo from '@/components/BrandLogo';
import NavbarAuth from '@/components/NavbarAuth';
import LiveChatWidget from '@/components/LiveChatWidget';
import type { Profile } from '@/types/database';
import './globals.css';

export const metadata: Metadata = {
  title: 'charickDriveRent (หาดใหญ่ สงขลา) | ระบบจองรถยนต์และมอเตอร์ไซค์เช่า ครบวงจร',
  description:
    'บริการเช่ารถยนต์และมอเตอร์ไซค์ออนไลน์สาขาหาดใหญ่ จ.สงขลา โดย charickDriveRent จองจ่ายมัดจำเพียง 30% ที่เหลือจ่ายวันรับรถ พร้อมรับ-ส่งฟรีสนามบินหาดใหญ่',
  other: {
    'darkreader-lock': 'true',
  },
};

const DARKREADER_CLEANUP_SCRIPT = `
(function() {
  try {
    function cleanElement(el) {
      if (!el || !el.attributes) return;
      for (var k = el.attributes.length - 1; k >= 0; k--) {
        var attr = el.attributes[k].name;
        if (attr && attr.indexOf('data-darkreader') === 0) {
          el.removeAttribute(attr);
        }
      }
      var styleAttr = el.getAttribute('style');
      if (styleAttr && styleAttr.indexOf('--darkreader-inline') !== -1) {
        var cleaned = styleAttr
          .split(';')
          .filter(function(part) {
            return part.trim() && part.indexOf('--darkreader-inline') === -1;
          })
          .join(';');
        if (cleaned.trim()) {
          el.setAttribute('style', cleaned);
        } else {
          el.removeAttribute('style');
        }
      }
    }
    function cleanDarkReader(root) {
      if (!root || !root.querySelectorAll) return;
      cleanElement(document.documentElement);
      cleanElement(document.body);
      var found = root.querySelectorAll('[data-darkreader-mode],[data-darkreader-scheme],[data-darkreader-proxy-injected],[data-darkreader-inline-stroke],[data-darkreader-inline-fill],[data-darkreader-inline-stopcolor],[data-darkreader-inline-color],[data-darkreader-inline-bgcolor],[style*="--darkreader-inline"]');
      for (var i = 0; i < found.length; i++) {
        cleanElement(found[i]);
      }
    }
    cleanDarkReader(document);
    if (!window.__driveRentDarkReaderObserver && typeof MutationObserver !== 'undefined') {
      var obs = new MutationObserver(function(mutations) {
        for (var m = 0; m < mutations.length; m++) {
          var mut = mutations[m];
          if (mut.type === 'attributes' && mut.target) {
            cleanElement(mut.target);
          } else if (mut.type === 'childList' && mut.addedNodes) {
            for (var n = 0; n < mut.addedNodes.length; n++) {
              var node = mut.addedNodes[n];
              if (node && node.nodeType === 1) {
                cleanElement(node);
                if (node.querySelectorAll) cleanDarkReader(node);
              }
            }
          }
        }
      });
      obs.observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: [
          'data-darkreader-mode',
          'data-darkreader-scheme',
          'data-darkreader-proxy-injected',
          'data-darkreader-inline-stroke',
          'data-darkreader-inline-fill',
          'data-darkreader-inline-stopcolor',
          'data-darkreader-inline-color',
          'data-darkreader-inline-bgcolor',
          'style'
        ]
      });
      window.__driveRentDarkReaderObserver = obs;
    }
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await fetchUserProfile(supabase, user.id);
    profile =
      (data as Profile) ||
      ((await ensureDriveRentProfile(supabase, user)) as Profile) ||
      null;
  }

  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" content="true" />
        <script
          dangerouslySetInnerHTML={{ __html: DARKREADER_CLEANUP_SCRIPT }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen text-slate-900 flex flex-col relative overflow-x-hidden"
      >
        <LanguageProvider>
          {/* พื้นหลังหน้าเพจเป็นรูปภาพเส้นทางท่องเที่ยวและยนตรกรรมที่เข้ากับเว็บไซต์เช่ารถ */}
          <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=85"
              alt="charickDriveRent Scenic Road Background"
              className="w-full h-full object-cover object-center scale-105"
            />
            {/* เลเยอร์กรองแสงเพื่อให้เนื้อหาการ์ดอ่านง่ายแต่ยังเห็นภาพพื้นหลังสวยงามชัดเจน */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/45 via-slate-100/80 to-slate-100/90 backdrop-blur-[2px]" />
          </div>

          {/* แถบเมนูด้านบนพร้อมโลโก้ charickDriveRent, ปุ่มสลับภาษา EN/TH และปุ่ม Login/Logout */}
          <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
              <Link href="/" className="shrink-0">
                <BrandLogo size="md" />
              </Link>

              <NavbarAuth
                userEmail={user?.email}
                fullName={profile?.full_name}
                role={profile?.role}
              />
            </div>
          </header>

          {/* เนื้อหาหลัก */}
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>

          {/* ระบบ Live Chat ลอยมุมขวาล่างสำหรับติดต่อแอดมินสาขาหาดใหญ่ (แยกห้องแชทส่วนตัวของแต่ละคน) */}
          <LiveChatWidget
            userId={user?.id || null}
            defaultName={profile?.full_name}
            defaultEmail={user?.email}
          />

          {/* ส่วนท้ายเว็บไซต์ */}
          <footer className="border-t border-slate-200/80 bg-white/90 backdrop-blur-md py-8 text-xs text-slate-500 mt-14">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <BrandLogo size="sm" />
              <div className="text-center sm:text-right">
                <p className="font-semibold text-slate-800">
                  © {new Date().getFullYear()} charickDriveRent Co., Ltd. (สาขาหาดใหญ่ จ.สงขลา) — Supabase Project: CharDB
                </p>
                <p className="text-slate-500 mt-0.5">
                  บริการเช่ารถยนต์และมอเตอร์ไซค์ หาดใหญ่-สงขลา • โทร 074-234-567 / 089-999-8888 • อีเมล startdoing4you@gmail.com
                </p>
              </div>
            </div>
          </footer>
        </LanguageProvider>
        <script
          dangerouslySetInnerHTML={{ __html: DARKREADER_CLEANUP_SCRIPT }}
        />
      </body>
    </html>
  );
}
