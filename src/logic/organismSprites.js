/**
 * organismSprites.js — Preloaded illustrated creature sprites for the canvas.
 *
 * Each organism in src/data/organisms.js carries an `artToken` (e.g. "lionfish",
 * "base-jellyfish") that matches a transparent WebP at
 *   /public/art/organisms/<artToken>.webp
 *
 * Sprites are resolved through Vite's base path so they work under the GitHub
 * Pages subpath (base: '/SEACHYMP-Bug-Blasters/'). They are lazily preloaded on
 * first request and cached for the session; until a sprite finishes decoding,
 * getSprite() reports loaded:false and the renderer falls back to the original
 * colored-circle placeholder.
 *
 * drawCreatureSprite() centers the sprite on (x, y) and scales it so its larger
 * dimension is ~2.4× the organism radius — matching the old circle footprint so
 * the scene hit-testing (ORG_RADIUS_BASE + N) still lines up with the art.
 */

// Display size: max sprite dimension as a multiple of organism radius.
// ~2.4 keeps the illustrated footprint close to the old 2*radius circle so the
// click/tap hit-test in the scenes still covers the creature.
const SIZE_MULT = 2.4;

const _cache = new Map();      // artToken -> { img, loaded }
const _tintCache = new Map();  // artToken -> offscreen canvas (red-tinted silhouette)

// Honor the OS reduced-motion preference (read once). Callers use this to drop
// the shake + particle animation while keeping the static mutation tint/glow.
let _reduceMotion = false;
try { _reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* SSR/test */ }
export function prefersReducedMotion() { return _reduceMotion; }

function spriteUrl(token) {
  return `${import.meta.env.BASE_URL}art/organisms/${token}.webp`;
}

/**
 * getTintedSprite — a red-tinted copy of the sprite, built once and cached.
 * Drawn with 'source-atop' so the red fills only the opaque creature pixels
 * (the transparent background stays transparent). Used to overlay the mutation
 * tint at a pulsing alpha without re-compositing every frame.
 */
function getTintedSprite(token, color = "#ef4444") {
  const entry = _cache.get(token);
  if (!entry || !entry.loaded) return null;
  const key = `${token}|${color}`;
  let canvas = _tintCache.get(key);
  if (!canvas) {
    const img = entry.img;
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return null;
    canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const c = canvas.getContext("2d");
    c.drawImage(img, 0, 0);
    c.globalCompositeOperation = "source-atop";
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    _tintCache.set(key, canvas);
  }
  return canvas;
}

/**
 * getSprite — return the cached entry for a token, kicking off a preload on the
 * first request. Returns { img, loaded } where `loaded` flips true once decoded.
 */
export function getSprite(token) {
  if (!token) return null;
  let entry = _cache.get(token);
  if (!entry) {
    const img = new Image();
    entry = { img, loaded: false };
    img.onload = () => { entry.loaded = true; };
    img.onerror = () => { entry.loaded = false; entry.errored = true; };
    img.src = spriteUrl(token);
    _cache.set(token, entry);
  }
  return entry;
}

/** Preload every known token up front (call once at scene mount). */
export function preloadSprites(tokens) {
  for (const t of tokens) getSprite(t);
}

/**
 * drawCreatureSprite — draw the creature centered on (x, y).
 *
 * @returns {boolean} true if the sprite was drawn, false if not ready (caller
 *   should fall back to the placeholder).
 *
 * Mutation visuals (tint / glow / shake) are layered by the caller in
 * organismRenderer.js — this function only handles the base sprite + scale.
 */
export function drawCreatureSprite(ctx, org, x, y, radius, mutated, opts = {}) {
  const entry = getSprite(org.artToken);
  if (!entry || !entry.loaded) return false;

  const img = entry.img;
  const natW = img.naturalWidth || img.width;
  const natH = img.naturalHeight || img.height;
  if (!natW || !natH) return false;

  const { dx = 0, dy = 0, tintAlpha = 0, tintColor = "#ef4444", scale = 1, alpha = 1 } = opts;
  const cx = x + dx;
  const cy = y + dy;

  const target = radius * SIZE_MULT * (mutated ? 1.2 : 1) * scale;
  const s = target / Math.max(natW, natH);
  const w = natW * s;
  const h = natH * s;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);

  // Tint overlay: cached colored silhouette at a given alpha (mutation = red,
  // kill flash = white). Multiplied by the base alpha so it fades together.
  if (tintAlpha > 0) {
    const tinted = getTintedSprite(org.artToken, tintColor);
    if (tinted) {
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha * tintAlpha));
      ctx.drawImage(tinted, cx - w / 2, cy - h / 2, w, h);
    }
  }
  ctx.restore();
  return true;
}

/**
 * KILL_PALETTE — the colours a kill burst is built from. Ordered hot-to-cool so
 * slices of it read as a coherent fireball rather than a random rainbow: the
 * first entries drive the core and fireball, the later ones the debris, embers
 * and outer rings.
 */
export const KILL_PALETTE = [
  "#fffbe6", // near-white core
  "#ffe066", // yellow
  "#ffa733", // orange
  "#ff5d5d", // red
  "#ff5ec4", // magenta
  "#8b5cf6", // violet
  "#3ab7ff", // cyan
  "#3ce6b0", // aqua-green
];

/**
 * WEAPON_KILL_PALETTES — the blast takes the colour of the antibiotic that
 * fired it, so which drug you chose is readable at a glance from the explosion
 * alone. Each is ordered the same way as KILL_PALETTE (core first, outer last).
 * Keyed by weapon id from src/data/weapons.js.
 */
export const WEAPON_KILL_PALETTES = {
  // Blue Bubble Cannon — a foaming burst of seawater and bubbles.
  ceftriaxone: [
    "#ffffff", "#dff1ff", "#8ed8ff", "#38a8f0",
    "#2f6bb0", "#7ff0dd", "#bfe9ff", "#5aa3ec",
  ],
  // Purple Electric Harpoon — a violet discharge shot through with magenta.
  cefepime: [
    "#ffffff", "#efe0ff", "#c4a2ff", "#a855f7",
    "#7c3aed", "#ff5ec4", "#e9d5ff", "#8b5cf6",
  ],
  // Golden Anchor Launcher — a heavy, molten gold concussion.
  carbapenem: [
    "#fffbe6", "#ffe9a8", "#ffc94d", "#f59e0b",
    "#d97706", "#ff8c42", "#ffd166", "#c9840f",
  ],
};

/**
 * A stable 0–1 seed per organism instance, so two creatures exploding at once
 * don't throw identical debris, while a single explosion stays steady frame to
 * frame (no Math.random per frame — that makes particles jitter).
 */
function killSeed(org) {
  if (org._killSeed == null) {
    const s = String(org.id_instance || org.id || "");
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997;
    org._killSeed = h / 997;
  }
  return org._killSeed;
}

/**
 * drawKillExplosion — sprite-based kill burst driven by org.fadeProgress (0→1).
 *
 * Built in layers, back to front: a soft coloured glow, the creature itself
 * flashing white and scaling up as it fades, three expanding shockwave rings in
 * different colours, radial light spikes, tumbling debris shards, fast sparks,
 * slow drifting embers, and rising bubbles. Reduced-motion keeps just a calm
 * shrink-and-fade with none of it.
 *
 * @param {object} [opts]
 *   palette — colours to build the burst from (defaults to KILL_PALETTE); the
 *     weapon-specific bursts pass their own.
 * @returns {boolean} true if drawn (sprite ready), false to fall back to the
 *   legacy circle shrink in drawOrganismEffects.
 */
export function drawKillExplosion(ctx, org, x, y, radius, opts = {}) {
  const entry = getSprite(org.artToken);
  if (!entry || !entry.loaded) return false;

  const p = Math.min(1, org.fadeProgress || 0);

  if (_reduceMotion) {
    // Calm fallback: shrink + fade, no particles or flash.
    drawCreatureSprite(ctx, org, x, y, radius, false, { scale: 1 - p * 0.85, alpha: 1 - p });
    return true;
  }

  // Colour the blast for the weapon that fired it (set on the organism when the
  // shot lands); fall back to the generic palette for kills with no weapon.
  const pal =
    (opts.palette && opts.palette.length && opts.palette) ||
    WEAPON_KILL_PALETTES[org.killWeaponId] ||
    KILL_PALETTE;
  const hue = (i) => pal[i % pal.length];
  const seed = killSeed(org);
  const spin = seed * Math.PI * 2;

  // ── Soft fireball glow behind everything ────────────────────────────────
  // Two stacked radial gradients (hot core, cooler halo) give the burst mass,
  // so it reads as an explosion rather than a ring of loose particles.
  if (p < 0.7) {
    const gp = 1 - p / 0.7;
    // Tight and hot: a concentrated core that burns down fast. A wide, faint
    // gradient here just reads as a milky bubble over the ocean, not a blast.
    const R = radius * (0.7 + p * 2.0);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(x, y, 0, x, y, R);
    g.addColorStop(0, hue(0));
    g.addColorStop(0.35, hue(1));
    g.addColorStop(0.7, hue(2));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = gp * gp * 0.95;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.fill();

    // A soft warm bloom just outside the core — enough to give the blast some
    // mass without hazing over the whole area.
    const R2 = radius * (1 + p * 3.4);
    const g2 = ctx.createRadialGradient(x, y, R2 * 0.4, x, y, R2);
    g2.addColorStop(0, "rgba(0,0,0,0)");
    g2.addColorStop(0.6, hue(3));
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = gp * 0.28;
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.arc(x, y, R2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── The creature: flashes white, swells, fades out ──────────────────────
  const flash = p < 0.45 ? 0.95 * (1 - p / 0.45) : 0;
  drawCreatureSprite(ctx, org, x, y, radius, false, {
    scale: 1 + p * 1.1,
    alpha: Math.max(0, 1 - p * 1.05),
    tintColor: "#ffffff",
    tintAlpha: flash,
  });

  // ── Hot core drawn OVER the creature ────────────────────────────────────
  // The glow behind it is hidden by the sprite while the sprite is still
  // opaque, so the creature has to burn from the inside out as well.
  if (p < 0.5) {
    const cp = 1 - p / 0.5;
    const R = radius * (0.45 + p * 1.3);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(x, y, 0, x, y, R);
    g.addColorStop(0, hue(0));
    g.addColorStop(0.45, hue(1));
    g.addColorStop(0.8, hue(2));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = cp * 0.95;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Radial light spikes — a hard, fast starburst at the moment of impact ─
  if (p < 0.3) {
    const sp = 1 - p / 0.3;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = hue(0);
    ctx.lineCap = "round";
    for (let i = 0; i < 12; i++) {
      const a = spin + (i / 12) * Math.PI * 2;
      const inner = radius * 0.5;
      const outer = radius * (1 + p * 7) * (i % 2 ? 0.65 : 1);
      ctx.globalAlpha = sp * 0.8;
      ctx.lineWidth = (i % 2 ? 1.5 : 3) * sp;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * inner, y + Math.sin(a) * inner);
      ctx.lineTo(x + Math.cos(a) * outer, y + Math.sin(a) * outer);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Three shockwave rings, each a different colour and speed ────────────
  const RINGS = [
    { start: 0.0, span: 0.55, reach: 5.5, width: 7, col: hue(0), alpha: 0.9 },
    { start: 0.08, span: 0.7, reach: 4.2, width: 5, col: hue(3), alpha: 0.75 },
    { start: 0.18, span: 0.85, reach: 3.0, width: 3.5, col: hue(6), alpha: 0.6 },
  ];
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const r of RINGS) {
    if (p < r.start || p > r.start + r.span) continue;
    const rp = (p - r.start) / r.span;
    ctx.globalAlpha = (1 - rp) * r.alpha;
    ctx.strokeStyle = r.col;
    ctx.lineWidth = r.width * (1 - rp * 0.7);
    ctx.beginPath();
    ctx.arc(x, y, radius * (1 + rp * r.reach), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // ── Debris: tumbling coloured shards, flung out and pulled down ─────────
  // Shards are stretched along their own direction of travel (with a little
  // tumble on top) so they read as fragments being thrown outward. Square
  // pieces at this size just look like confetti.
  const N = 30;
  ctx.save();
  for (let i = 0; i < N; i++) {
    const a = spin + (i / N) * Math.PI * 2 + Math.sin(i * 3.7) * 0.25;
    const speed = 0.6 + ((i * 7) % 10) / 10 * 0.8; // varied throw distance
    const dist = p * radius * 6 * speed;
    const px = x + Math.cos(a) * dist;
    const py = y + Math.sin(a) * dist + p * p * radius * 2.2; // gravity
    ctx.globalAlpha = Math.max(0, 1 - p * 1.15);
    // Mostly hot colours plus the creature's own, with an occasional cool
    // accent — a full even spread of the palette looks like party confetti.
    ctx.fillStyle =
      i % 4 === 0 ? (org.color || hue(3)) :
      i % 7 === 0 ? hue(6) :
      hue(1 + (i % 3));
    const sz = (1 - p) * 6 + 1.4;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(a + Math.sin(i + p * 7) * 0.5); // aligned to travel, slight tumble
    ctx.fillRect(-sz * 0.9, -sz * 0.28, sz * 1.8, sz * 0.56);
    ctx.restore();
  }
  ctx.restore();

  // ── Sparks: thin bright streaks, faster than the debris and gone early ──
  if (p < 0.5) {
    const SP = 18;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (let i = 0; i < SP; i++) {
      const a = spin * 1.7 + (i / SP) * Math.PI * 2;
      const dist = p * radius * 7.5 * (0.7 + ((i * 3) % 7) / 7 * 0.6);
      ctx.globalAlpha = (1 - p / 0.5) * 0.9;
      ctx.strokeStyle = hue(i + 1);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * dist * 0.62, y + Math.sin(a) * dist * 0.62);
      ctx.lineTo(x + Math.cos(a) * dist, y + Math.sin(a) * dist);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Embers: slow glowing motes that drift up and linger after the bang ──
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 14; i++) {
    const a = spin + i * 2.399; // golden-angle spread, no clumping
    const dist = radius * (0.5 + p * 2.6) * (0.5 + ((i * 5) % 9) / 9);
    const ex = x + Math.cos(a) * dist + Math.sin(p * 6 + i) * 3;
    const ey = y + Math.sin(a) * dist - p * radius * 1.6;
    ctx.globalAlpha = Math.max(0, 1 - p) * 0.75;
    ctx.fillStyle = hue(i + 2);
    ctx.beginPath();
    ctx.arc(ex, ey, 1 + (1 - p) * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // ── Rising bubbles (the "cleared" cue that keeps it underwater) ─────────
  ctx.save();
  for (let i = 0; i < 16; i++) {
    const phase = Math.min(1, p + i * 0.02);
    const bx = x + Math.sin(i * 2.1 + spin) * radius * 1.4;
    const by = y - phase * radius * 3.6;
    ctx.globalAlpha = (1 - phase) * 0.55;
    ctx.strokeStyle = "#e8f4ff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(bx, by, 1.5 + (1 - phase) * 2.6, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  return true;
}

export default getSprite;
