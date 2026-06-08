// Blue Bubble Cannon — Ceftriaxone weapon icon
// Cartoon sub-style barrel with blue bubble clusters at the tip
export default function BlueBubbleCannon({ size = 64 }) {
  return (
    <span style={{ display: "inline-block", width: size, height: Math.round(size * 0.75) }}>
      <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Cannon barrel */}
        <rect x="8" y="22" width="44" height="16" rx="8" fill="#2563eb" />
        <rect x="8" y="22" width="44" height="7" rx="4" fill="#3b82f6" opacity="0.6" />

        {/* Barrel bands / rings */}
        <rect x="20" y="22" width="3" height="16" rx="1.5" fill="#1d4ed8" />
        <rect x="32" y="22" width="3" height="16" rx="1.5" fill="#1d4ed8" />

        {/* Muzzle ring */}
        <circle cx="52" cy="30" r="9" fill="#1d4ed8" />
        <circle cx="52" cy="30" r="6" fill="#2563eb" />

        {/* Handle / grip */}
        <rect x="12" y="36" width="16" height="14" rx="5" fill="#1e40af" />
        <rect x="14" y="38" width="12" height="6" rx="3" fill="#2563eb" opacity="0.5" />

        {/* Base / wheel stub */}
        <ellipse cx="20" cy="50" rx="8" ry="5" fill="#1e3a8a" />
        <circle cx="16" cy="51" r="3.5" fill="#2563eb" stroke="#60a5fa" strokeWidth="1" />
        <circle cx="24" cy="51" r="3.5" fill="#2563eb" stroke="#60a5fa" strokeWidth="1" />

        {/* Bubbles firing out */}
        <circle cx="64" cy="26" r="5" fill="#93c5fd" opacity="0.85" stroke="#60a5fa" strokeWidth="1" />
        <circle cx="72" cy="32" r="4" fill="#bfdbfe" opacity="0.8" stroke="#93c5fd" strokeWidth="1" />
        <circle cx="67" cy="38" r="3" fill="#dbeafe" opacity="0.75" stroke="#93c5fd" strokeWidth="0.8" />
        {/* bubble sheen */}
        <circle cx="62" cy="24" r="1.5" fill="#fff" opacity="0.6" />
        <circle cx="70" cy="30" r="1.2" fill="#fff" opacity="0.6" />

        {/* small decorative star on barrel */}
        <circle cx="8" cy="30" r="5" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.2" />
        <text x="8" y="33.5" fontSize="6" fill="#60a5fa" textAnchor="middle" fontWeight="bold">Cx</text>
      </svg>
    </span>
  );
}
