// Golden Anchor Launcher — Carbapenems weapon icon
// Massive chunky launcher with a glowing golden anchor projectile
export default function GoldenAnchorLauncher({ size = 64 }) {
  return (
    <span style={{ display: "inline-block", width: size, height: Math.round(size * 0.75) }}>
      <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Main barrel — chunky, wide */}
        <rect x="4" y="18" width="48" height="22" rx="10" fill="#b45309" />
        <rect x="4" y="18" width="48" height="10" rx="6" fill="#d97706" opacity="0.7" />

        {/* Barrel rings */}
        <rect x="18" y="18" width="4" height="22" rx="2" fill="#92400e" />
        <rect x="30" y="18" width="4" height="22" rx="2" fill="#92400e" />

        {/* Muzzle — wide flared end */}
        <ellipse cx="52" cy="29" rx="10" ry="12" fill="#92400e" />
        <ellipse cx="52" cy="29" rx="7" ry="9" fill="#b45309" />

        {/* Handle */}
        <rect x="10" y="38" width="18" height="14" rx="6" fill="#78350f" />
        <rect x="12" y="40" width="14" height="7" rx="3.5" fill="#92400e" opacity="0.5" />

        {/* Wheels */}
        <ellipse cx="22" cy="52" rx="9" ry="6" fill="#78350f" />
        <circle cx="17" cy="53" r="4.5" fill="#b45309" stroke="#fbbf24" strokeWidth="1.2" />
        <circle cx="27" cy="53" r="4.5" fill="#b45309" stroke="#fbbf24" strokeWidth="1.2" />

        {/* Anchor projectile flying out */}
        {/* anchor ring */}
        <circle cx="70" cy="22" r="6" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
        {/* anchor shaft */}
        <line x1="70" y1="28" x2="70" y2="40" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
        {/* anchor crossbar */}
        <line x1="64" y1="32" x2="76" y2="32" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
        {/* anchor flukes */}
        <path d="M64 38 Q62 42 65 43" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M76 38 Q78 42 75 43" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* anchor glow */}
        <circle cx="70" cy="33" r="10" fill="#fbbf24" opacity="0.12" />

        {/* Label badge */}
        <circle cx="7" cy="29" r="5.5" fill="#78350f" stroke="#fbbf24" strokeWidth="1.2" />
        <text x="7" y="32.5" fontSize="5" fill="#fbbf24" textAnchor="middle" fontWeight="bold">CBP</text>
      </svg>
    </span>
  );
}
