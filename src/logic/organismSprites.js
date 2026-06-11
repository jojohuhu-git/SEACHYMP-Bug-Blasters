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
 * drawKillExplosion — sprite-based kill burst driven by org.fadeProgress (0→1).
 * The creature flashes white and scales up while fading, throwing colored debris
 * shards and rising bubbles, with an expanding white burst ring. Reduced-motion
 * keeps just the scale-down fade.
 *
 * @returns {boolean} true if drawn (sprite ready), false to fall back to the
 *   legacy circle shrink in drawOrganismEffects.
 */
export function drawKillExplosion(ctx, org, x, y, radius) {
  const entry = getSprite(org.artToken);
  if (!entry || !entry.loaded) return false;

  const p = Math.min(1, org.fadeProgress || 0);

  if (_reduceMotion) {
    // Calm fallback: shrink + fade, no particles or flash.
    drawCreatureSprite(ctx, org, x, y, radius, false, { scale: 1 - p * 0.85, alpha: 1 - p });
    return true;
  }

  // Growing, fading sprite with an early white flash.
  const flash = p < 0.4 ? 0.85 * (1 - p / 0.4) : 0;
  drawCreatureSprite(ctx, org, x, y, radius, false, {
    scale: 1 + p * 0.6,
    alpha: Math.max(0, 1 - p * 1.05),
    tintColor: "#ffffff",
    tintAlpha: flash,
  });

  // Expanding white burst ring (early).
  if (p < 0.6) {
    ctx.save();
    ctx.globalAlpha = (1 - p / 0.6) * 0.6;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, radius * (1 + p * 2.2), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Debris shards flung outward (organism color), gravity-tugged downward.
  const N = 10;
  const col = org.color || "#94a3b8";
  ctx.save();
  for (let i = 0; i < N; i++) {
    const ang = (i / N) * Math.PI * 2 + (i % 2 ? 0.3 : 0);
    const dist = p * radius * 2.6;
    const px = x + Math.cos(ang) * dist;
    const py = y + Math.sin(ang) * dist + p * p * radius * 0.8; // slight fall
    ctx.globalAlpha = (1 - p) * 0.9;
    ctx.fillStyle = col;
    const sz = (1 - p) * 3 + 1;
    ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
  }
  ctx.restore();

  // Rising bubbles (treatment "cleared" cue).
  ctx.save();
  for (let i = 0; i < 6; i++) {
    const phase = Math.min(1, p + i * 0.04);
    const bx = x + Math.sin(i * 2.1) * radius * 0.7;
    const by = y - phase * radius * 2.4;
    ctx.globalAlpha = (1 - phase) * 0.5;
    ctx.strokeStyle = "#e8f4ff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(bx, by, 1.5 + (1 - phase) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  return true;
}

export default getSprite;
