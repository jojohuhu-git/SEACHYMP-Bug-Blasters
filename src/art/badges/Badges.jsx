/**
 * Badges.jsx — SVG icons for the 6 progression badges.
 * ampC_apprentice / cefepime_commander / source_control_specialist /
 * stewardship_sailor / reef_protector / master_seachymp
 */

/** Shared hexagonal badge frame */
function BadgeHex({ fill, stroke, size, children }) {
  // Regular hexagon points for a 26-radius hex centred at 32,32
  const hex = "32,6 55,19 55,45 32,58 9,45 9,19";
  return (
    <span style={{ display: "inline-block", width: size, height: size }}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* shadow */}
        <polygon points={hex} fill="#000" opacity="0.15" transform="translate(2,3)" />
        {/* hex body */}
        <polygon points={hex} fill={fill} />
        {/* inner bevel */}
        <polygon points="32,10 51,21 51,43 32,54 13,43 13,21" fill={stroke} opacity="0.35" />
        <polygon points="32,14 48,23 48,41 32,50 16,41 16,23" fill={fill} />
        {/* rim */}
        <polygon points={hex} fill="none" stroke={stroke} strokeWidth="2" />
        {children}
      </svg>
    </span>
  );
}

/** AmpC Apprentice — medal ribbon + "A" letter */
export function AmpCApprenticeBadge({ size = 44 }) {
  return (
    <BadgeHex fill="#0d3b6e" stroke="#38b2e8" size={size}>
      <text x="32" y="38" fontSize="22" fontWeight="900" fill="#38b2e8" textAnchor="middle">A</text>
      <text x="32" y="20" fontSize="8" fill="#93c5fd" textAnchor="middle" fontWeight="600">AmpC</text>
    </BadgeHex>
  );
}

/** Cefepime Commander — lightning bolt */
export function CefepimeCommanderBadge({ size = 44 }) {
  return (
    <BadgeHex fill="#3b0764" stroke="#a78bfa" size={size}>
      {/* lightning bolt */}
      <polygon points="34,16 26,32 32,32 30,48 38,30 32,30" fill="#fde68a" />
    </BadgeHex>
  );
}

/** Source Control Specialist — target crosshair */
export function SourceControlSpecialistBadge({ size = 44 }) {
  return (
    <BadgeHex fill="#052e16" stroke="#22c55e" size={size}>
      <circle cx="32" cy="32" r="10" fill="none" stroke="#22c55e" strokeWidth="2" />
      <circle cx="32" cy="32" r="5" fill="none" stroke="#22c55e" strokeWidth="2" />
      <circle cx="32" cy="32" r="2" fill="#22c55e" />
      <line x1="32" y1="18" x2="32" y2="23" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="41" x2="32" y2="46" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="32" x2="23" y2="32" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="41" y1="32" x2="46" y2="32" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
    </BadgeHex>
  );
}

/** Stewardship Sailor — anchor */
export function StewardshipSailorBadge({ size = 44 }) {
  return (
    <BadgeHex fill="#0c2340" stroke="#fbbf24" size={size}>
      {/* anchor */}
      <circle cx="32" cy="20" r="4" fill="none" stroke="#fbbf24" strokeWidth="2" />
      <line x1="32" y1="24" x2="32" y2="44" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="30" x2="40" y2="30" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 42 Q20 47 24 48" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M40 42 Q44 47 40 48" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" />
    </BadgeHex>
  );
}

/** Reef Protector — coral branch silhouette */
export function ReefProtectorBadge({ size = 44 }) {
  return (
    <BadgeHex fill="#4a044e" stroke="#f472b6" size={size}>
      {/* coral */}
      <path d="M32 46 L32 28 M32 36 L25 28 M32 32 L39 24" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="28" r="3" fill="#fb7185" />
      <circle cx="25" cy="28" r="2.5" fill="#fda4af" />
      <circle cx="39" cy="24" r="2.5" fill="#fb7185" />
    </BadgeHex>
  );
}

/** Master of the SEACHYMP Seas — wave / crown */
export function MasterSeachympBadge({ size = 44 }) {
  return (
    <BadgeHex fill="#0c1445" stroke="#38b2e8" size={size}>
      {/* crown */}
      <path d="M20 38 L20 28 L24 34 L32 22 L40 34 L44 28 L44 38 Z" fill="#fbbf24" />
      {/* crown gems */}
      <circle cx="32" cy="24" r="2.5" fill="#ef4444" />
      <circle cx="24" cy="30" r="2" fill="#22c55e" />
      <circle cx="40" cy="30" r="2" fill="#3b82f6" />
      {/* wave below */}
      <path d="M20 42 Q24 39 28 42 Q32 45 36 42 Q40 39 44 42" stroke="#38b2e8" strokeWidth="2" fill="none" strokeLinecap="round" />
    </BadgeHex>
  );
}
