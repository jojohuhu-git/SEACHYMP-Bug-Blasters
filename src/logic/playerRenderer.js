/**
 * playerRenderer.js — Shared canvas renderer for the player (Captain Chymp).
 *
 * The illustrated Captain sprite (transparent WebP) is a single fixed pose, so
 * action "poses" are sold with procedural overlays drawn in front of it:
 *   - "gun"  — the actual weapon just chosen (Blue Bubble Cannon / Purple
 *              Electric Harpoon / Golden Anchor Launcher), aimed at the target
 *              with a matching muzzle effect (bubbles / electric arc / heavy
 *              burst) and a recoil kick sized to that weapon's weight.
 *   - "net"  — a thrown net (rope + expanding mesh ring) that travels from the
 *              Captain's hand toward the target.
 *
 * Trigger a pose from a scene with triggerPose(stateRef.current, kind, tx, ty)
 * and pass the stored pose to drawPlayer(..., state.pose). Poses auto-expire
 * after their duration, after which drawPlayer renders the plain idle sprite.
 *
 * The image lives in /public and is resolved through Vite's base path so it
 * works under the GitHub Pages subpath (base: '/SEACHYMP-Bug-Blasters/').
 */

const SPRITE_SRC = `${import.meta.env.BASE_URL}art/chymps/captain.webp`;

const sprite = new Image();
let loaded = false;
sprite.onload = () => { loaded = true; };
sprite.src = SPRITE_SRC;

const ASPECT = 553 / 734;
const SPRITE_H = 78;

const GUN_DUR = 1.0; // seconds — long enough to read the weapon + muzzle effect
const NET_DUR = 0.55;

const _now = () => (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;

/**
 * triggerPose — start an action pose on a scene's stateRef.
 * @param {object} state  stateRef.current (mutated in place)
 * @param {"gun"|"net"} kind
 * @param {number} tx,ty  target canvas coords (e.g. the organism position)
 * @param {string} [weaponId]  which weapon art to draw for a "gun" pose
 *   ("ceftriaxone" | "cefepime" | "carbapenem"); falls back to a generic gun.
 */
export function triggerPose(state, kind, tx, ty, weaponId) {
  if (!state) return;
  state.pose = { kind, t0: _now(), tx, ty, weaponId };
}

function roundRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Generic antibiotic gun — fallback when no weaponId is known (e.g. old saves).
function drawGenericGun(ctx, hx, hy, a) {
  const ang = a.aim;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(ang);
  ctx.fillStyle = "#D4915A";
  ctx.strokeStyle = "#9c6b3f";
  ctx.lineWidth = 1;
  roundRect(ctx, 0, -4, 22, 8, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f0c89a";
  ctx.fillRect(-6, -3, 6, 6);
  ctx.restore();
  drawStarburstFlash(ctx, hx, hy, ang, a, "#fff4c2");
}

// Shared radiating-line muzzle flash used by the generic gun.
function drawStarburstFlash(ctx, hx, hy, ang, a, tint) {
  if (a.p >= 0.4) return;
  const fade = 1 - a.p / 0.4;
  const tx = hx + Math.cos(ang) * 24;
  const ty = hy + Math.sin(ang) * 24;
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.strokeStyle = tint;
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const sa = ang + (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + Math.cos(sa) * (5 + fade * 6), ty + Math.sin(sa) * (5 + fade * 6));
    ctx.stroke();
  }
  ctx.fillStyle = tint;
  ctx.beginPath();
  ctx.arc(tx, ty, 3 + fade * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Ceftriaxone — "Blue Bubble Cannon": a stubby rounded barrel that puffs a
// cluster of rising bubbles instead of a spark flash.
function drawBubbleCannon(ctx, hx, hy, a) {
  const ang = a.aim;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(ang);
  ctx.fillStyle = "#5aa3ec";
  ctx.strokeStyle = "#2f6bb0";
  ctx.lineWidth = 1;
  roundRect(ctx, -4, -6, 20, 12, 5);
  ctx.fill();
  ctx.stroke();
  // barrel rim (bell mouth)
  ctx.fillStyle = "#8ec3f4";
  ctx.beginPath();
  ctx.arc(16, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2f6bb0";
  ctx.stroke();
  // grip
  ctx.fillStyle = "#cfe6fb";
  ctx.fillRect(-8, -3, 5, 8);
  ctx.restore();

  // Muzzle puff: a small cluster of bubbles drifting up and out.
  if (a.p < 0.55) {
    const fade = 1 - a.p / 0.55;
    const tx = hx + Math.cos(ang) * 22;
    const ty = hy + Math.sin(ang) * 22;
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const bp = Math.min(1, a.p * 1.8 + i * 0.08);
      const bx = tx + Math.cos(ang) * bp * 10 + Math.sin(i * 2.1) * 4;
      const by = ty + Math.sin(ang) * bp * 10 - bp * 6;
      ctx.globalAlpha = fade * 0.85;
      ctx.strokeStyle = "#dff1ff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bx, by, 1.5 + i * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// Cefepime — "Purple Electric Harpoon": a long pointed barbed shaft with a
// jagged electric-arc discharge instead of a soft flash.
function drawElectricHarpoon(ctx, hx, hy, a) {
  const ang = a.aim;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(ang);
  // shaft
  ctx.strokeStyle = "#6d28d9";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.lineTo(20, 0);
  ctx.stroke();
  // barbed tip
  ctx.fillStyle = "#a78bfa";
  ctx.beginPath();
  ctx.moveTo(28, 0);
  ctx.lineTo(18, -5);
  ctx.lineTo(21, 0);
  ctx.lineTo(18, 5);
  ctx.closePath();
  ctx.fill();
  // grip coil
  ctx.strokeStyle = "#c4b5fd";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(-4 + i * 3, 0, 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Electric discharge: jagged bolts crackling from the tip.
  if (a.p < 0.4) {
    const fade = 1 - a.p / 0.4;
    const tx = hx + Math.cos(ang) * 28;
    const ty = hy + Math.sin(ang) * 28;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.strokeStyle = "#e9d5ff";
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) {
      const sa = ang + (i / 3 - 0.33) * Math.PI * 1.1 + (Math.random() - 0.5) * 0.2;
      const len = 6 + fade * 7;
      const midA = sa + (Math.random() - 0.5) * 0.6;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + Math.cos(midA) * len * 0.5, ty + Math.sin(midA) * len * 0.5);
      ctx.lineTo(tx + Math.cos(sa) * len, ty + Math.sin(sa) * len);
      ctx.stroke();
    }
    ctx.fillStyle = "#e9d5ff";
    ctx.beginPath();
    ctx.arc(tx, ty, 2 + fade * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Carbapenem — "Golden Anchor Launcher": a heavy chunky launcher tube tipped
// with a small anchor, and a bigger, slower golden muzzle burst to match its
// "heaviest weapon in the arsenal" flavor.
function drawAnchorLauncher(ctx, hx, hy, a) {
  const ang = a.aim;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(ang);
  // heavy barrel
  ctx.fillStyle = "#c9840f";
  ctx.strokeStyle = "#8a5a08";
  ctx.lineWidth = 1.2;
  roundRect(ctx, -6, -6, 26, 12, 3);
  ctx.fill();
  ctx.stroke();
  // banding
  ctx.strokeStyle = "#8a5a08";
  ctx.lineWidth = 1;
  for (const bx of [-1, 6, 13]) {
    ctx.beginPath();
    ctx.moveTo(bx, -6);
    ctx.lineTo(bx, 6);
    ctx.stroke();
  }
  // small anchor icon at the muzzle
  ctx.strokeStyle = "#fde68a";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(22, -4);
  ctx.lineTo(22, 3);
  ctx.moveTo(19, -4);
  ctx.lineTo(25, -4);
  ctx.moveTo(19, 3);
  ctx.quadraticCurveTo(19, 6, 22, 6);
  ctx.moveTo(25, 3);
  ctx.quadraticCurveTo(25, 6, 22, 6);
  ctx.stroke();
  ctx.restore();

  // Muzzle burst: bigger, slower, golden — matches the heavier recoil.
  if (a.p < 0.5) {
    const fade = 1 - a.p / 0.5;
    const tx = hx + Math.cos(ang) * 26;
    const ty = hy + Math.sin(ang) * 26;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.strokeStyle = "#fde68a";
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 8; i++) {
      const sa = ang + (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + Math.cos(sa) * (6 + fade * 9), ty + Math.sin(sa) * (6 + fade * 9));
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(253,230,138,0.9)";
    ctx.beginPath();
    ctx.arc(tx, ty, 4 + fade * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const WEAPON_RENDERERS = {
  ceftriaxone: drawBubbleCannon,
  cefepime: drawElectricHarpoon,
  carbapenem: drawAnchorLauncher,
};

// Heavier weapons kick the diver back further — part of "as natural as possible".
const WEAPON_RECOIL = {
  ceftriaxone: 3,
  cefepime: 5,
  carbapenem: 8,
};

function drawWeapon(ctx, hx, hy, a) {
  const renderer = WEAPON_RENDERERS[a.weaponId] || drawGenericGun;
  renderer(ctx, hx, hy, a);
}

// Thrown net: rope from the hand to an expanding mesh ring traveling to the target.
function drawNet(ctx, hx, hy, a) {
  const ease = 1 - Math.pow(1 - a.p, 2); // easeOutQuad
  const cx = hx + (a.tx - hx) * ease;
  const cy = hy + (a.ty - hy) * ease;
  const R = 4 + ease * 16;
  const alpha = a.p < 0.85 ? 0.9 : 0.9 * (1 - (a.p - 0.85) / 0.15);

  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  // rope
  ctx.strokeStyle = "#cbb88f";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(cx, cy);
  ctx.stroke();
  // net ring
  ctx.strokeStyle = "#eef0e0";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  // mesh crosshatch (chords across the ring)
  for (const f of [-0.5, 0, 0.5]) {
    const off = f * R;
    const half = Math.sqrt(Math.max(0, R * R - off * off));
    ctx.beginPath();
    ctx.moveTo(cx - half, cy + off);
    ctx.lineTo(cx + half, cy + off);
    ctx.moveTo(cx + off, cy - half);
    ctx.lineTo(cx + off, cy + half);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * drawPlayer(ctx, chymp, x, y, facingRight, pose) — (x, y) is the player CENTER.
 * `pose` is the scene's state.pose object (or null/undefined for idle).
 */
export function drawPlayer(ctx, chymp, x, y, facingRight = true, pose = null) {
  const color = chymp?.color || "#38b2e8";

  // Resolve an active (non-expired) pose.
  let active = null;
  if (pose) {
    const e = _now() - pose.t0;
    const dur = pose.kind === "net" ? NET_DUR : GUN_DUR;
    if (e >= 0 && e <= dur) {
      active = { ...pose, e, p: e / dur, aim: Math.atan2(pose.ty - y, pose.tx - x), dur };
      facingRight = pose.tx >= x; // face the target while posing
    }
  }

  // Recoil kick (gun only) nudges the whole diver backward at the shot start.
  // Heavier weapons (the anchor launcher) kick harder than the bubble cannon.
  let rx = 0, ry = 0;
  if (active && active.kind === "gun") {
    const kickMax = WEAPON_RECOIL[active.weaponId] ?? 5;
    const kick = Math.max(0, 1 - active.p * 3) * kickMax;
    rx = -Math.cos(active.aim) * kick;
    ry = -Math.sin(active.aim) * kick;
  }
  const px = x + rx;
  const py = y + ry;

  // Soft glow / shadow puddle under the diver.
  ctx.save();
  const glow = ctx.createRadialGradient(px, py + SPRITE_H * 0.34, 2, px, py + SPRITE_H * 0.34, SPRITE_H * 0.42);
  glow.addColorStop(0, color + "44");
  glow.addColorStop(1, color + "00");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(px, py + SPRITE_H * 0.34, SPRITE_H * 0.42, SPRITE_H * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const h = SPRITE_H;
  const w = h * ASPECT;

  if (!loaded) {
    // Fallback disc while the sprite decodes.
    ctx.save();
    ctx.fillStyle = color + "55";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(px, py, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.save();
    ctx.translate(px, py);
    if (!facingRight) ctx.scale(-1, 1);
    ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // Pose overlays in front of the sprite, anchored at a hand point.
  if (active) {
    const handX = px + (facingRight ? 1 : -1) * (w * 0.18);
    const handY = py + h * 0.08;
    if (active.kind === "gun") drawWeapon(ctx, handX, handY, active);
    else drawNet(ctx, handX, handY, active);
  }
}

export default drawPlayer;
