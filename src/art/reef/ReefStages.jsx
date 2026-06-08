/**
 * ReefStages.jsx — SVG icons for the 4 reef growth stages.
 * barren / sprouting / growing / thriving
 *
 * 2026-06-05: enriched for more detail, colour and variety of growth —
 * each stage layers progressively more coral types, sea life and bubbles.
 */

// Shared soft sand mound + floor shadow
function SandBase({ sand = "#cdb38b", shade = "#94a3b8" }) {
  return (
    <>
      <ellipse cx="32" cy="54" rx="27" ry="7" fill={shade} opacity="0.35" />
      <path d="M6 54 Q20 46 32 50 Q46 46 58 54 Z" fill={sand} opacity="0.75" />
    </>
  );
}

// A drifting bubble
function Bubble({ cx, cy, r = 2 }) {
  return <circle cx={cx} cy={cy} r={r} fill="none" stroke="#bfe3ff" strokeWidth="1" opacity="0.7" />;
}

// A little fish (orientation: faces right by default)
function Fish({ cx, cy, color, flip = false }) {
  const t = flip ? `scale(-1,1) translate(${-2 * cx},0)` : undefined;
  return (
    <g transform={t}>
      <ellipse cx={cx} cy={cy} rx="4.5" ry="2.8" fill={color} />
      <polygon points={`${cx + 4},${cy} ${cx + 8},${cy - 3} ${cx + 8},${cy + 3}`} fill={color} />
      <circle cx={cx - 1.5} cy={cy - 0.5} r="0.9" fill="#10243a" />
    </g>
  );
}

/** Barren Reef — bleached rocky seabed, almost no life */
export function BarrenReef({ size = 56 }) {
  return (
    <span style={{ display: "inline-block", width: size, height: size }}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <SandBase sand="#cbd5e1" shade="#9ca3af" />
        {/* bleached rocks (varied greys) */}
        <ellipse cx="19" cy="47" rx="12" ry="7" fill="#d1d5db" />
        <ellipse cx="40" cy="49" rx="11" ry="6" fill="#e5e7eb" />
        <ellipse cx="51" cy="45" rx="8" ry="5" fill="#cbd5e1" />
        {/* cracks */}
        <path d="M16 45 L21 49" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" />
        <path d="M37 47 L42 51" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" />
        {/* dead coral stumps */}
        <rect x="29" y="31" width="6" height="15" rx="3" fill="#eef0f2" />
        <rect x="23" y="36" width="5" height="11" rx="2.5" fill="#d8dce1" />
        <rect x="36" y="34" width="4" height="13" rx="2" fill="#e5e7eb" />
        {/* bleached, lifeless sea star */}
        <g opacity="0.85">
          <polygon
            points="49,40 51,44 55,44 52,47 53,51 49,48.5 45,51 46,47 43,44 47,44"
            fill="#c4c9d2"
          />
        </g>
        {/* one lonely bubble */}
        <Bubble cx={24} cy={18} r={1.5} />
      </svg>
    </span>
  );
}

/** Sprouting Reef — first polyps + a touch of colour and a baby fish */
export function SproutingReef({ size = 56 }) {
  return (
    <span style={{ display: "inline-block", width: size, height: size }}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <SandBase sand="#d6c39a" shade="#6b7280" />
        {/* base rock */}
        <ellipse cx="32" cy="49" rx="22" ry="8" fill="#7c848f" />
        {/* green sprouts of varied height */}
        <ellipse cx="21" cy="41" rx="3.5" ry="7" fill="#4ade80" />
        <ellipse cx="32" cy="36" rx="4.5" ry="10" fill="#22c55e" />
        <ellipse cx="41" cy="43" rx="3.5" ry="6" fill="#4ade80" />
        {/* first hints of colour */}
        <circle cx="16" cy="43" r="3" fill="#86efac" />
        <ellipse cx="47" cy="42" rx="2.6" ry="4.5" fill="#c084fc" />
        <circle cx="26" cy="45" r="2.2" fill="#fdba74" />
        {/* highlight on tallest sprout */}
        <ellipse cx="31" cy="33" rx="1.6" ry="3" fill="#ffffff" opacity="0.3" />
        {/* curious baby fish */}
        <Fish cx={50} cy={24} color="#fb923c" />
        <Bubble cx={22} cy={16} r={1.6} />
        <Bubble cx={28} cy={20} r={1.1} />
      </svg>
    </span>
  );
}

/** Growing Reef — branching corals, a fan, a sponge, an anemone and fish */
export function GrowingReef({ size = 56 }) {
  return (
    <span style={{ display: "inline-block", width: size, height: size }}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <SandBase sand="#d8c59b" shade="#374151" />
        {/* rocky base */}
        <ellipse cx="32" cy="50" rx="24" ry="7" fill="#3f4858" />
        {/* purple sea-fan (left) */}
        <path
          d="M12 50 Q9 38 12 30 M12 38 Q7 34 6 30 M12 36 Q11 30 12 26 M12 38 Q16 33 18 29"
          stroke="#a855f7"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* green branching coral (center, tall) */}
        <path
          d="M32 50 L32 24 M32 38 L24 28 M32 32 L40 22 M32 28 L26 20"
          stroke="#4ade80"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* orange tube sponge cluster (right) */}
        <rect x="46" y="34" width="4" height="16" rx="2" fill="#fb923c" />
        <rect x="51" y="38" width="3.5" height="12" rx="1.8" fill="#f97316" />
        <ellipse cx="48" cy="34" rx="2" ry="1.2" fill="#fdba74" />
        <ellipse cx="52.7" cy="38" rx="1.7" ry="1" fill="#fdba74" />
        {/* little anemone */}
        <g>
          {[-6, -3, 0, 3, 6].map((dx, i) => (
            <line key={i} x1={22 + dx} y1="50" x2={22 + dx * 1.4} y2="42" stroke="#f472b6" strokeWidth="1.6" strokeLinecap="round" />
          ))}
          <ellipse cx="22" cy="50" rx="6" ry="2.5" fill="#ec4899" opacity="0.7" />
        </g>
        {/* coral buds at tips (multicolour) */}
        {[[32, 24], [24, 28], [40, 22], [26, 20], [12, 30], [18, 29]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.4" fill={["#f472b6", "#fbbf24", "#34d399", "#60a5fa"][i % 4]} />
        ))}
        <Fish cx={50} cy={20} color="#60a5fa" />
        <Fish cx={16} cy={16} color="#f97316" flip />
        <Bubble cx={36} cy={14} r={1.8} />
        <Bubble cx={40} cy={18} r={1.1} />
      </svg>
    </span>
  );
}

/** Thriving Reef — vibrant full reef: brain coral, kelp, anemone, fish, star */
export function ThrivingReef({ size = 56 }) {
  return (
    <span style={{ display: "inline-block", width: size, height: size }}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <SandBase sand="#d8c59b" shade="#1e293b" />
        {/* rocky base */}
        <ellipse cx="32" cy="52" rx="26" ry="6" fill="#22304a" />
        {/* swaying kelp strands (back layer) */}
        <path d="M9 52 Q12 40 9 30 Q7 22 10 14" stroke="#16a34a" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M55 52 Q52 40 55 31 Q57 23 54 16" stroke="#15803d" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.85" />
        {/* large pink brain coral */}
        <circle cx="32" cy="43" r="10" fill="#f472b6" />
        <path
          d="M26 39 Q32 43 38 39 M24 43 Q32 48 40 43 M26 47 Q32 51 38 47"
          stroke="#ec4899"
          strokeWidth="1.2"
          fill="none"
          opacity="0.6"
        />
        {/* orange + violet coral stalks */}
        <path d="M14 52 L14 32 M14 44 L8 34 M14 38 L20 30" stroke="#fb923c" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 52 L50 34 M50 44 L56 36 M50 40 L44 30" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
        {/* purple anemone */}
        <g>
          {[-7, -4, -1, 2, 5, 8].map((dx, i) => (
            <line key={i} x1={42 + dx * 0.6} y1="52" x2={42 + dx} y2="44" stroke="#c084fc" strokeWidth="1.6" strokeLinecap="round" />
          ))}
          <ellipse cx="42" cy="52" rx="6" ry="2.5" fill="#9333ea" opacity="0.75" />
        </g>
        {/* coral buds */}
        {[[14, 32], [8, 34], [20, 30], [50, 34], [56, 36], [44, 30]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.8" fill={["#fbbf24", "#f472b6", "#34d399", "#60a5fa"][i % 4]} />
        ))}
        {/* yellow sea star on the rock */}
        <polygon
          points="24,48 25.6,51.4 29.3,51.6 26.4,54 27.4,57.6 24,55.5 20.6,57.6 21.6,54 18.7,51.6 22.4,51.4"
          fill="#facc15"
        />
        {/* fish: a clownfish and a blue tang */}
        <g>
          <Fish cx={49} cy={18} color="#f97316" />
          <rect x="46.5" y="15.4" width="1.4" height="5.2" rx="0.6" fill="#fff" opacity="0.85" />
        </g>
        <Fish cx={16} cy={14} color="#38bdf8" flip />
        <Bubble cx={34} cy={12} r={2} />
        <Bubble cx={38} cy={16} r={1.2} />
        <Bubble cx={30} cy={9} r={1} />
      </svg>
    </span>
  );
}
