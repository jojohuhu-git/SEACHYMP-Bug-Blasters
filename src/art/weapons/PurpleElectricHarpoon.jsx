// Purple Electric Harpoon — Cefepime weapon icon
// Sleek purple spear-gun with electric arcs and glowing tip
export default function PurpleElectricHarpoon({ size = 64 }) {
  return (
    <span style={{ display: "inline-block", width: size, height: Math.round(size * 0.75) }}>
      <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Harpoon shaft */}
        <rect x="4" y="27" width="58" height="6" rx="3" fill="#7c3aed" />
        {/* shaft highlight */}
        <rect x="4" y="27" width="58" height="2.5" rx="1.5" fill="#a78bfa" opacity="0.6" />

        {/* Grip wrapping */}
        {[10, 16, 22, 28].map((x) => (
          <rect key={x} x={x} y="27" width="2.5" height="6" rx="1" fill="#6d28d9" />
        ))}

        {/* Trigger guard */}
        <path d="M18 33 Q22 40 26 33" stroke="#6d28d9" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <rect x="20" y="33" width="4" height="8" rx="2" fill="#5b21b6" />

        {/* Harpoon head / tip */}
        <polygon points="62,30 76,22 72,30 76,38" fill="#8b5cf6" />
        <polygon points="62,30 76,22 68,30" fill="#c4b5fd" opacity="0.8" />

        {/* Electric arcs around tip */}
        <path d="M64 20 Q68 24 64 28 Q70 26 66 22 Z" fill="#fde68a" opacity="0.9" />
        <path d="M64 32 Q68 36 64 40 Q70 38 66 34 Z" fill="#fde68a" opacity="0.9" />

        {/* Glow aura at tip */}
        <circle cx="70" cy="30" r="7" fill="#8b5cf6" opacity="0.25" />
        <circle cx="70" cy="30" r="4" fill="#a78bfa" opacity="0.35" />

        {/* Small electric sparks along shaft */}
        <text x="36" y="26" fontSize="8" fill="#fde68a" opacity="0.9">⚡</text>
        <text x="46" y="26" fontSize="6" fill="#fde68a" opacity="0.75">⚡</text>

        {/* Label badge at butt end */}
        <circle cx="7" cy="30" r="5" fill="#5b21b6" stroke="#8b5cf6" strokeWidth="1.2" />
        <text x="7" y="33.5" fontSize="5.5" fill="#c4b5fd" textAnchor="middle" fontWeight="bold">FEP</text>
      </svg>
    </span>
  );
}
