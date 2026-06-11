/**
 * playerRenderer.js — Shared canvas renderer for the player (Captain Chymp).
 *
 * The illustrated Captain sprite (transparent WebP) is a single fixed pose, so
 * action "poses" are sold with procedural overlays drawn in front of it:
 *   - "gun"  — an antibiotic gun barrel + muzzle flash aimed at the target, plus
 *              a brief recoil kick that nudges the whole diver backward.
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

const GUN_DUR = 0.35; // seconds
const NET_DUR = 0.55;

const _now = () => (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;

/**
 * triggerPose — start an action pose on a scene's stateRef.
 * @param {object} state  stateRef.current (mutated in place)
 * @param {"gun"|"net"} kind
 * @param {number} tx,ty  target canvas coords (e.g. the organism position)
 */
export function triggerPose(state, kind, tx, ty) {
  if (!state) return;
  state.pose = { kind, t0: _now(), tx, ty };
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

// Antibiotic gun + muzzle flash, anchored at the hand, rotated toward the target.
function drawGun(ctx, hx, hy, a) {
  const ang = a.aim;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(ang);
  // barrel (amber, matching the Captain palette)
  ctx.fillStyle = "#D4915A";
  ctx.strokeStyle = "#9c6b3f";
  ctx.lineWidth = 1;
  roundRect(ctx, 0, -4, 22, 8, 3);
  ctx.fill();
  ctx.stroke();
  // plunger / grip detail behind the barrel
  ctx.fillStyle = "#f0c89a";
  ctx.fillRect(-6, -3, 6, 6);
  ctx.restore();

  // muzzle flash at the barrel tip (early in the pose)
  if (a.p < 0.4) {
    const fade = 1 - a.p / 0.4;
    const tx = hx + Math.cos(ang) * 24;
    const ty = hy + Math.sin(ang) * 24;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.strokeStyle = "#fff4c2";
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const sa = ang + (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + Math.cos(sa) * (5 + fade * 6), ty + Math.sin(sa) * (5 + fade * 6));
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,244,194,0.9)";
    ctx.beginPath();
    ctx.arc(tx, ty, 3 + fade * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
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
  let rx = 0, ry = 0;
  if (active && active.kind === "gun") {
    const kick = Math.max(0, 1 - active.p * 3) * 5;
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
    if (active.kind === "gun") drawGun(ctx, handX, handY, active);
    else drawNet(ctx, handX, handY, active);
  }
}

export default drawPlayer;
