'use client';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  lightText?: boolean;
}

export default function BrandLogo({
  size = 'md',
  lightText = false,
}: BrandLogoProps) {
  const iconBoxSize =
    size === 'lg' ? 'w-12 h-12' : size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const textSize =
    size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl';

  return (
    <div className="inline-flex items-center gap-2.5 select-none group">
      {/* ไอคอนโลโก้ SVG ดีไซน์พิเศษสำหรับ charickDriveRent */}
      <div
        className={`${iconBoxSize} relative rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md group-hover:shadow-blue-500/30 group-hover:scale-105 transition-all duration-300`}
      >
        <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-cyan-400/30 blur-xs" />
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7"
            suppressHydrationWarning
          >
            {/* วงแหวนความเร็วตัว C (charick) */}
            <path
              d="M27 10.5C24.8 8.9 22 8 19 8C11.8 8 6 13.4 6 20C6 26.6 11.8 32 19 32C22.4 32 25.5 30.8 27.8 28.8"
              stroke="url(#charickGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              suppressHydrationWarning
            />
            {/* เงารูปทรงรถสปอร์ตและแฮนด์มอเตอร์ไซค์ */}
            <path
              d="M12 22.5L15.2 16.5C15.8 15.5 16.8 15 18 15H26.5C27.8 15 28.9 15.7 29.4 16.8L31.5 21H33C33.8 21 34.5 21.7 34.5 22.5V24.5C34.5 25.3 33.8 26 33 26H12V22.5Z"
              fill="url(#charickGrad)"
              suppressHydrationWarning
            />
            {/* ล้อหน้า-หลัง */}
            <circle cx="16.5" cy="26" r="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" suppressHydrationWarning />
            <circle cx="28.5" cy="26" r="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" suppressHydrationWarning />
            <defs suppressHydrationWarning>
              <linearGradient
                id="charickGrad"
                x1="6"
                y1="8"
                x2="35"
                y2="32"
                gradientUnits="userSpaceOnUse"
                suppressHydrationWarning
              >
                <stop stopColor="#38BDF8" suppressHydrationWarning />
                <stop offset="0.5" stopColor="#60A5FA" suppressHydrationWarning />
                <stop offset="1" stopColor="#818CF8" suppressHydrationWarning />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ตัวอักษรโลโก้ charickDriveRent */}
      <div className="flex flex-col leading-none">
        <div className={`${textSize} font-black tracking-tight flex items-baseline`}>
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent italic pr-0.5">
            charick
          </span>
          <span className={lightText ? 'text-white' : 'text-slate-900'}>
            Drive
          </span>
          <span className="text-blue-600">Rent</span>
        </div>
        <span
          className={`text-[9px] font-bold uppercase tracking-[0.18em] mt-0.5 ${
            lightText ? 'text-slate-300' : 'text-slate-400'
          }`}
        >
          Car &amp; Moto Rental
        </span>
      </div>
    </div>
  );
}
