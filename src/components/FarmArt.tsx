import { useId } from "react";
import type { Product } from "../data/products";
// Original vector artwork, composed locally. No game artwork or remote image requests.
export function FarmArt({
  variant = "meadow",
  hero = false,
}: {
  variant?: Product["art"];
  hero?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const sunset = variant === "sunset";
  const tree = (x: number, y: number, s = 1, fruit = false) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="12" rx="23" ry="9" fill="#204f31" opacity=".13" />
      <path d="M-3 8L0-46 5 8" fill="#8c633c" />
      <path d="M1-10L-13-26M2-22L16-39" stroke="#8c633c" strokeWidth="4" />
      <circle cx="-13" cy="-44" r="22" fill="#6d9f48" />
      <circle cx="15" cy="-47" r="24" fill="#83ad4d" />
      <circle cx="0" cy="-65" r="25" fill="#96ba57" />
      <circle cx="-9" cy="-71" r="14" fill="#a8c96b" />
      {fruit && (
        <g fill="#ef9b49">
          <circle cx="-21" cy="-48" r="4" />
          <circle cx="13" cy="-64" r="4" />
          <circle cx="22" cy="-37" r="4" />
          <circle cx="-2" cy="-80" r="4" />
        </g>
      )}
    </g>
  );
  const fence = (x: number, y: number) => (
    <g
      transform={`translate(${x} ${y})`}
      fill="#f6e7b5"
      stroke="#d6c599"
      strokeWidth="1"
    >
      <path d="M0 0L100 22V29L0 7ZM0 14L100 36V43L0 21Z" />
      {[0, 25, 50, 75, 100].map((n) => (
        <path key={n} d={`M${n} ${n * 0.22 - 7}l4 -4 4 6v39l-8 -2Z`} />
      ))}
    </g>
  );
  if (variant === "plan")
    return (
      <svg
        viewBox="0 0 640 480"
        className="farm-art"
        role="img"
        aria-label="مخطط أصلي من الأعلى لتوزيع مناطق المزرعة"
      >
        <defs>
          <pattern
            id={`${id}grid`}
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path d="M28 0H0V28" fill="none" stroke="#ccdac2" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="640" height="480" fill="#eaf0e1" />
        <rect width="640" height="480" fill={`url(#${id}grid)`} />
        <g transform="translate(115 55) rotate(-7 210 180)">
          <rect
            x="-10"
            y="-10"
            width="440"
            height="375"
            rx="25"
            fill="#dce5c9"
            stroke="#a3b78c"
            strokeWidth="3"
            strokeDasharray="7 7"
          />
          <path
            d="M130 0V355M280 0V355M0 155H420"
            stroke="#fdf5d9"
            strokeWidth="22"
          />
          <rect width="110" height="134" rx="12" fill="#a7bc77" />
          <rect x="152" width="108" height="134" rx="12" fill="#91ad68" />
          <rect x="302" width="108" height="134" rx="12" fill="#bbc687" />
          <rect y="180" width="110" height="163" rx="12" fill="#b5c78b" />
          <rect
            x="152"
            y="180"
            width="258"
            height="163"
            rx="12"
            fill="#95b780"
          />
          {[0, 1, 2, 3].map((row) => (
            <g key={row}>
              {[0, 1, 2].map((col) => (
                <g key={col}>
                  <circle
                    cx={20 + col * 34}
                    cy={24 + row * 29}
                    r="10"
                    fill="#d3da93"
                  />
                  <circle
                    cx={172 + col * 34}
                    cy={24 + row * 29}
                    r="9"
                    fill="#c7d78e"
                  />
                </g>
              ))}
            </g>
          ))}
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M15 ${201 + i * 34}h80`}
              stroke="#e5d28a"
              strokeWidth="12"
              strokeLinecap="round"
            />
          ))}
          <rect x="190" y="210" width="90" height="98" rx="5" fill="#e8c78e" />
          <path d="M179 216L235 170 292 216Z" fill="#47745a" />
          <rect x="221" y="259" width="28" height="49" fill="#a28153" />
          <rect x="200" y="236" width="19" height="19" fill="#f5e4ae" />
          <rect x="250" y="236" width="19" height="19" fill="#f5e4ae" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <circle cx="339" cy={215 + i * 43} r="18" fill="#6f9758" />
              <circle cx="380" cy={215 + i * 43} r="18" fill="#85a965" />
            </g>
          ))}
          <path d="M320 28h70v86h-70Z" fill="#ead29c" />
          <path
            d="M330 28v86M350 28v86M370 28v86"
            stroke="#b3975a"
            strokeWidth="4"
          />
        </g>
        <g fill="#7e9a69">
          <circle cx="66" cy="97" r="4" />
          <circle cx="582" cy="367" r="5" />
          <path d="M50 389h35m-17-17v34" stroke="#9aae7c" strokeWidth="2" />
        </g>
      </svg>
    );
  if (variant === "garden" || variant === "orchard")
    return (
      <svg
        viewBox="0 0 640 480"
        className="farm-art"
        role="img"
        aria-label={
          variant === "garden"
            ? "تصميم أصلي لحديقة زهور وبركة صغيرة"
            : "رسم أصلي لبستان أشجار مثمرة مع ممر ريفي"
        }
      >
        <rect
          width="640"
          height="480"
          fill={variant === "garden" ? "#eeeadd" : "#eaf0db"}
        />
        <ellipse cx="320" cy="307" rx="278" ry="130" fill="#d1dcac" />
        <path d="M55 305L325 158 596 296 331 449Z" fill="#a9bf7d" />
        <path
          d="M56 305L331 449V461L56 317ZM331 449L596 296V308L331 461"
          fill="#8da568"
        />
        <path
          d="M97 327Q261 204 517 354"
          fill="none"
          stroke="#f1e4bd"
          strokeWidth="26"
        />
        {variant === "garden" ? (
          <>
            <path
              d="M273 289Q265 243 328 242T389 292Q388 338 324 339T273 289"
              fill="#93bcb1"
              stroke="#e5e2bd"
              strokeWidth="12"
            />
            <path
              d="M294 282Q331 262 365 284M309 313q33 8 54-8"
              fill="none"
              stroke="#d6e8d2"
              strokeWidth="3"
            />
            {tree(169, 268, 1.05)}
            {tree(458, 265, 1.15)}
            {tree(531, 316, 0.6)}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <g
                key={i}
                transform={`translate(${125 + i * 60} ${340 + Math.sin(i) * 32})`}
              >
                <ellipse rx="23" ry="12" fill="#7e9e60" />
                {[0, 1, 2].map((j) => (
                  <g
                    key={j}
                    transform={`translate(${-14 + j * 13} ${(-j % 2) * 9})`}
                  >
                    <path d="M0 0V-18" stroke="#658651" strokeWidth="3" />
                    <circle
                      cy="-20"
                      r="8"
                      fill={i % 2 ? "#eab1a2" : "#f5dc8e"}
                    />
                    <circle cy="-20" r="3" fill="#ddae64" />
                  </g>
                ))}
              </g>
            ))}
            <g transform="translate(358 177)">
              <path d="M-40 0L0-28 42 0 0 21Z" fill="#d2b27c" />
              <path
                d="M-32 0V60M31 0V60M0 20V81"
                stroke="#f3e4be"
                strokeWidth="5"
              />
              <path
                d="M-37 63L0 84 36 64"
                fill="none"
                stroke="#f2deb0"
                strokeWidth="10"
              />
            </g>
          </>
        ) : (
          <>
            {[0, 1, 2].map((row) => (
              <g key={row}>
                {[0, 1, 2, 3].map((col) => (
                  <g key={col}>
                    {tree(
                      145 + col * 88 + row * 6,
                      220 + row * 64 - col * 8,
                      1 - row * 0.1,
                      true,
                    )}
                  </g>
                ))}
              </g>
            ))}
            <g transform="translate(316 353)">
              <ellipse cy="23" rx="55" ry="14" fill="#789456" />
              <path d="M-46-8L-35 28H35L46-8" fill="#be8f50" />
              <path
                d="M-38-10Q0-80 38-10"
                fill="none"
                stroke="#b38850"
                strokeWidth="6"
              />
              {[-24, 0, 24].map((n, i) => (
                <g key={n}>
                  <circle cx={n} cy={-8 - (i % 2) * 11} r="16" fill="#e9ba5c" />
                  <path
                    d={`M${n} ${-20 - (i % 2) * 11}q-5-11 7-10`}
                    fill="none"
                    stroke="#72914f"
                    strokeWidth="4"
                  />
                </g>
              ))}
              <path d="M-46-8L46-8 35 28H-35Z" fill="#c59c5e" />
              <path d="M-35 3H35M-31 15H31" stroke="#dfb97c" strokeWidth="3" />
            </g>
            {fence(410, 379)}
          </>
        )}
        <g fill="#fff7da">
          <circle cx="103" cy="366" r="4" />
          <circle cx="504" cy="404" r="5" />
          <circle cx="241" cy="412" r="3" />
        </g>
      </svg>
    );
  return (
    <svg
      viewBox="0 0 640 480"
      className={`farm-art ${hero ? "hero-art" : ""}`}
      role="img"
      aria-label={
        hero
          ? "رسم أصلي لمزرعة ريفية بين الأشجار والحقول الخضراء"
          : "رسم توضيحي أصلي لتصميم مزرعة افتراضية"
      }
    >
      <defs>
        <linearGradient id={`${id}sky`} x2="0" y2="1">
          <stop stopColor={sunset ? "#f6d4ad" : "#e7f0dd"} />
          <stop offset="1" stopColor="#f6f1d9" />
        </linearGradient>
        <linearGradient id={`${id}field`} x2="0.7" y2="1">
          <stop stopColor="#acbf6e" />
          <stop offset="1" stopColor="#789f4e" />
        </linearGradient>
        <pattern
          id={`${id}rows`}
          width="27"
          height="25"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-22)"
        >
          <path d="M4 0V25" stroke="#d0ce75" strokeWidth="11" />
          <path d="M9 0V25" stroke="#7d9e4c" strokeWidth="2" />
        </pattern>
        <filter id={`${id}shadow`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow
            dx="0"
            dy="14"
            stdDeviation="10"
            floodColor="#3a603a"
            floodOpacity=".16"
          />
        </filter>
      </defs>
      <rect
        width="640"
        height="480"
        rx={hero ? 0 : 8}
        fill={`url(#${id}sky)`}
        opacity={hero ? 0 : 1}
      />
      <circle cx="492" cy="85" r="43" fill="#f5d780" opacity=".8" />
      <g fill="#fffdf3" opacity=".8">
        <path d="M52 82q-4-18 16-18 7-26 29-12 19-5 22 15 23-5 27 15Z" />
        <path d="M384 48q2-13 16-13 14-20 27-2 20-3 21 15Z" />
        <path d="M525 144q1-17 21-18 12-27 34-9 23-6 29 27Z" />
      </g>
      <path d="M0 229Q89 115 222 195T440 185 640 211V480H0Z" fill="#c6d5a0" />
      <path d="M0 267Q145 150 309 253T640 224V480H0Z" fill="#b1c581" />
      <path
        d="M-40 342L306 164 683 328 328 514Z"
        fill={`url(#${id}field)`}
        filter={`url(#${id}shadow)`}
      />
      <path
        d="M-40 342L328 514V530L-40 359ZM328 514L683 328V345L328 530"
        fill="#76914a"
      />
      <path
        d="M-25 345L305 183 652 331 327 499Z"
        fill="none"
        stroke="#c5d394"
        strokeWidth="3"
      />
      <path d="M164 254L467 398 443 413 139 269Z" fill="#ecdfb4" />
      <path d="M77 380L371 232 396 243 100 392Z" fill="#ecdfb4" />
      <path d="M198 279L344 348 322 360 174 290Z" fill="#f7ebc6" />
      <path
        d="M66 320L141 282 265 342 189 381Z"
        fill="#728e43"
        stroke="#5c7b37"
        strokeWidth="3"
      />
      {[0, 1, 2, 3, 4].map((row) => (
        <g key={row}>
          {[0, 1, 2, 3, 4].map((col) => (
            <g
              key={col}
              transform={`translate(${84 + col * 15 + row * 22} ${322 - col * 7 + row * 11})`}
            >
              <ellipse cy="5" rx="7" ry="3" fill="#536f35" />
              <path d="M0 5Q-16-8-5-10L0 0Q4-18 10-11L3 5" fill="#adbf60" />
              <path d="M0 5V-4" stroke="#52753a" strokeWidth="2" />
            </g>
          ))}
        </g>
      ))}
      <path
        d="M359 318L450 273 563 324 475 371Z"
        fill={`url(#${id}rows)`}
        stroke="#9bb45e"
        strokeWidth="3"
      />
      <g transform="translate(255 185)">
        <ellipse
          cx="57"
          cy="102"
          rx="85"
          ry="22"
          fill="#3b653c"
          opacity=".13"
        />
        <path d="M0 34L70 8 119 43V100L53 128 0 94Z" fill="#e7b16d" />
        <path d="M53 68L119 43V100L53 128Z" fill="#d69a5d" />
        <path d="M0 34L35-10 94-34 70 8 119 43 53 68Z" fill="#b96448" />
        <path d="M35-10L94-34 137 27 70 54Z" fill="#49725a" />
        <path d="M35-10L70 54 53 68 -17 36Z" fill="#355d48" />
        <path
          d="M38 116V76L61 66V126"
          fill="#8a6140"
          stroke="#f4d6a2"
          strokeWidth="5"
        />
        <path
          d="M9 58L28 67V88L9 79Z"
          fill="#f8d88c"
          stroke="#fff0be"
          strokeWidth="4"
        />
        <path
          d="M80 71L100 63V83L80 91Z"
          fill="#517b64"
          stroke="#f8dfa8"
          strokeWidth="4"
        />
        <path d="M88 68V88M80 77L100 69" stroke="#f8dfa8" strokeWidth="2" />
        <path d="M65 13L65-18 79-23V8Z" fill="#e8c994" />
        <path d="M61-19L77-26 83-21 68-14Z" fill="#fff0bc" />
      </g>
      {tree(116, 256, 0.9, true)}
      {tree(160, 228, 0.75, true)}
      {tree(439, 244, 1.15, true)}
      {tree(493, 268, 0.85, true)}
      {tree(552, 307, 0.7)}
      {tree(72, 366, 0.8)}
      {tree(517, 393, 1.2)}
      {tree(450, 431, 0.75)}
      {fence(201, 393)}
      {fence(307, 443)}
      {fence(18, 314)}
      <g transform="translate(351 379)">
        <ellipse cx="0" cy="18" rx="30" ry="12" fill="#658741" opacity=".3" />
        <path d="M-22 0L0-12 24 0 0 12Z" fill="#b2c79a" />
        <path d="M-22 0V15L0 28 24 15V0L0 12Z" fill="#97b290" />
        <ellipse cy="-1" rx="20" ry="9" fill="#7ba8a5" />
        <path d="M-25-10L0-26 28-10 2 4Z" fill="#4b795b" />
        <path d="M-19-10V11M21-10V11" stroke="#a88e5c" strokeWidth="4" />
      </g>
      <g fill="#fbf1bf">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
          <g
            key={n}
            transform={`translate(${118 + n * 25} ${412 + (n % 3) * 10})`}
          >
            <path d="M0 5V-7" stroke="#73914a" strokeWidth="2" />
            <circle cy="-7" r="4" />
            <circle cx="3" cy="-5" r="3" fill="#ecc36c" />
          </g>
        ))}
      </g>

      <g transform="translate(246 408)">
        <ellipse rx="16" ry="5" fill="#476f3b" opacity=".15" />
        <path d="M-10-4q-6-12 5-15 14-4 14 11L5-3Z" fill="#fff7dc" />
        <path d="M2-16L4-23 8-22 10-16" fill="#d97c56" />
        <path d="M9-13L15-10 9-7" fill="#e6b554" />
        <circle cx="7" cy="-13" r="1.3" fill="#3f4931" />
        <path d="M-5 0V5M2 0V5" stroke="#c89e59" strokeWidth="2" />
      </g>
    </svg>
  );
}
