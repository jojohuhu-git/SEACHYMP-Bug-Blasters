/**
 * playerRenderer.js — Shared canvas renderer for the player (Captain Chymp).
 *
 * The illustrated Captain sprite (transparent WebP) is a single fixed pose, so
 * action "poses" are sold with procedural overlays drawn in front of it:
 *   - "gun"  — the actual weapon just chosen (Blue Bubble Cannon / Purple
 *              Electric Harpoon / Golden Anchor Launcher), aimed at the target
 *              with a matching muzzle effect (bubbles / electric arc / heavy
 *              burst) and a recoil kick sized to that weapon's weight.
 *   - "net"  — a four-phase capture net: the Captain holds a gathered bundle,
 *              winds it back, throws it (spinning open along an arc), and it
 *              drapes over the creature and settles. Slow enough to follow.
 *
 * Trigger a pose from a scene with triggerPose(stateRef.current, kind, tx, ty)
 * and pass the stored pose to drawPlayer(..., state.pose). Poses auto-expire
 * after their duration, after which drawPlayer renders the plain idle sprite.
 *
 * The image lives in /public and is resolved through Vite's base path so it
 * works under the GitHub Pages subpath (base: '/SEACHYMP-Bug-Blasters/').
 */

import { prefersReducedMotion } from "./organismSprites.js";

const SPRITE_SRC = `${import.meta.env.BASE_URL}art/chymps/captain.webp`;

const sprite = new Image();
let loaded = false;
sprite.onload = () => { loaded = true; };
sprite.src = SPRITE_SRC;

const ASPECT = 553 / 734;
const SPRITE_H = 78;

const GUN_DUR = 1.0; // seconds — long enough to read the weapon + muzzle effect
const NET_DUR = 1.5; // seconds — long enough to read hold → windup → throw → drape

/** Net pose length in milliseconds — scenes use this to time the capture card. */
export const NET_POSE_MS = NET_DUR * 1000;

const _now = () => (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;

/**
 * triggerPose — start an action pose on a scene's stateRef.
 * @param {object} state  stateRef.current (mutated in place)
 * @param {"gun"|"net"} kind
 * @param {number} tx,ty  target canvas coords (e.g. the organism position)
 * @param {string} [weaponId]  which weapon art to draw for a "gun" pose
 *   ("ceftriaxone" | "cefepime" | "carbapenem"); falls back to a generic gun.
 * @param {object} [opts]
 *   orgInstanceId — target's id_instance, so a "net" pose can track a drifting
 *     creature via updatePoseTarget()
 *   targetR — the creature's radius, so the draped net is sized to fit over it
 */
export function triggerPose(state, kind, tx, ty, weaponId, opts = {}) {
  if (!state) return;
  state.pose = { kind, t0: _now(), tx, ty, weaponId, ...opts };
}

/**
 * updatePoseTarget — keep an in-flight net aimed at its creature as it drifts.
 * Call once per frame from the scene loop, before drawing. No-op for other poses.
 */
export function updatePoseTarget(state, organisms) {
  const pose = state?.pose;
  if (!pose || pose.kind !== "net" || !pose.orgInstanceId || !organisms) return;
  const org = organisms.find((o) => o.id_instance === pose.orgInstanceId);
  if (org) {
    pose.tx = org.x;
    pose.ty = org.y;
  }
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

// ── Capture net ───────────────────────────────────────────────────────────────
// The throw is split into four readable phases so a player can actually follow
// what the Captain is doing, rather than seeing a ring blink onto the creature:
//   hold   — a gathered bundle of net sits in his hand and lifts as he sets up
//   windup — he draws the bundle back behind him
//   flight — it leaves his hand, spins open into a full circle and arcs across
//            to the creature with the rope trailing from his hand
//   drape  — it lands over the creature, sags under its own weight, and shakes
//            as the creature struggles inside before settling
// Values are fractions of the pose duration (NET_DUR), each the phase's END.
const NET_PHASES = { hold: 0.18, windup: 0.34, flight: 0.62 };

const NET_ROPE = "#cbb88f";
const NET_MESH = "#eef0e0";
const NET_WEIGHT = "#9a8b63";

// Rope from the Captain's hand to the net, bowed by `slack` so it hangs rather
// than reading as a laser-straight line.
function drawRope(ctx, x1, y1, x2, y2, slack) {
  ctx.save();
  ctx.strokeStyle = NET_ROPE;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + slack, x2, y2);
  ctx.stroke();
  ctx.restore();
}

// The gathered net before it is thrown: a bunched oval of mesh with a couple of
// loose strands and weighted beads hanging off it.
function drawNetBundle(ctx, cx, cy, size, rot) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.strokeStyle = NET_MESH;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.72, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 0.8;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.9, i * size * 0.36);
    ctx.lineTo(size * 0.9, i * size * 0.36);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i * size * 0.5, -size * 0.68);
    ctx.lineTo(i * size * 0.5, size * 0.68);
    ctx.stroke();
  }
  // loose strand hanging out of the bundle
  ctx.strokeStyle = NET_ROPE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.4, size * 0.6);
  ctx.quadraticCurveTo(-size * 0.1, size * 1.5, size * 0.35, size * 1.25);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = NET_WEIGHT;
  for (let i = 0; i < 4; i++) {
    const wa = rot + i * 1.6;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(wa) * size, cy + Math.sin(wa) * size * 0.72, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// The opened net: a rim with bowed mesh chords (so it reads as cloth, not a
// wheel) and weighted beads around the edge. `squash` flattens it vertically —
// oscillating it during flight sells the tumble; a fixed value during the drape
// makes it read as lying flat over the creature.
function drawNetMesh(ctx, cx, cy, R, squash, rot, sag) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.scale(1, squash);
  ctx.strokeStyle = NET_MESH;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 0.9;
  for (const f of [-0.62, -0.31, 0, 0.31, 0.62]) {
    const off = f * R;
    const half = Math.sqrt(Math.max(0, R * R - off * off));
    ctx.beginPath();
    ctx.moveTo(-half, off);
    ctx.quadraticCurveTo(0, off + sag * R, half, off);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(off, -half);
    ctx.quadraticCurveTo(off + sag * R * 0.4, 0, off, half);
    ctx.stroke();
  }
  ctx.restore();

  // Rim weights drawn outside the scale() so they stay round beads.
  ctx.save();
  ctx.fillStyle = NET_WEIGHT;
  for (let i = 0; i < 8; i++) {
    const wa = rot + (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(wa) * R, cy + Math.sin(wa) * R * squash, 1.7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawNet(ctx, hx, hy, a) {
  const p = a.p;
  const aim = a.aim;
  const back = aim + Math.PI; // behind the Captain, for the windup
  const R_DRAPED = (a.targetR || 24) * 1.6; // a little wider than the creature

  // HOLD — bundle in hand, lifting slightly as he sets up the throw.
  if (p < NET_PHASES.hold) {
    const q = p / NET_PHASES.hold;
    const lift = Math.sin(q * Math.PI) * 3;
    drawNetBundle(ctx, hx + Math.cos(aim) * 3, hy - lift + 2, 7, q * 0.6);
    return;
  }

  // WINDUP — drawn back behind him, rope going taut.
  if (p < NET_PHASES.windup) {
    const q = (p - NET_PHASES.hold) / (NET_PHASES.windup - NET_PHASES.hold);
    const pull = 15 * Math.sin(q * Math.PI * 0.5);
    const bx = hx + Math.cos(back) * pull;
    const by = hy + Math.sin(back) * pull - 4 * q;
    drawRope(ctx, hx, hy, bx, by, 3);
    drawNetBundle(ctx, bx, by, 7 + q * 1.5, 0.6 + q * 1.2);
    return;
  }

  // FLIGHT — released, spinning open, arcing across to the creature.
  if (p < NET_PHASES.flight) {
    const q = (p - NET_PHASES.windup) / (NET_PHASES.flight - NET_PHASES.windup);
    const ease = 1 - Math.pow(1 - q, 2); // easeOutQuad — quick release, slowing arrival
    const sx = hx + Math.cos(back) * 15;
    const sy = hy + Math.sin(back) * 15;
    const cx = sx + (a.tx - sx) * ease;
    const cy = sy + (a.ty - sy) * ease - Math.sin(ease * Math.PI) * 26; // throw arc
    const spin = q * Math.PI * 2.4; // a bit over one full tumble
    const R = 5 + ease * (R_DRAPED - 5); // bundle opens out into a full net
    const squash = 0.35 + 0.65 * Math.abs(Math.cos(spin));
    drawRope(ctx, hx, hy, cx, cy, 9 * (1 - q));
    drawNetMesh(ctx, cx, cy, R, squash, spin, 0.06 + q * 0.1);
    return;
  }

  // DRAPE — settled over the creature, wobbling as it struggles, then still.
  const q = (p - NET_PHASES.flight) / (1 - NET_PHASES.flight);
  const damp = Math.exp(-q * 4.5);
  const wobble = Math.sin(q * 26) * damp;
  const cx = a.tx + Math.sin(q * 34 + 1.1) * damp * 2.4;
  const cy = a.ty + Math.cos(q * 41) * damp * 1.7;
  const R = R_DRAPED * (1 + wobble * 0.08);
  const squash = 0.62 + wobble * 0.06;

  // Bubbles puffed out from under the rim as it lands.
  if (q < 0.5) {
    const bf = 1 - q / 0.5;
    ctx.save();
    ctx.strokeStyle = "#e8f4ff";
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const ba = (i / 6) * Math.PI * 2 + 0.4;
      const bd = R * (0.9 + (1 - bf) * 0.5);
      ctx.globalAlpha = bf * 0.7;
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(ba) * bd,
        cy + Math.sin(ba) * bd * squash - (1 - bf) * 10,
        1.4 + bf * 1.6,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = p > 0.95 ? Math.max(0, 1 - (p - 0.95) / 0.05) : 1;
  drawRope(ctx, hx, hy, cx - Math.cos(aim) * R * 0.6, cy - Math.sin(aim) * R * 0.6 * squash, 11);
  drawNetMesh(ctx, cx, cy, R, squash, 0.2, 0.24);
  ctx.restore();
}

// Idle/swim motion tuning (skipped entirely under prefersReducedMotion()).
const BOB_IDLE_AMP = 1.6;
const BOB_IDLE_FREQ = 0.045;
const BOB_SWIM_AMP = 3.2;
const BOB_SWIM_FREQ = 0.16;
const LEAN_MAX = 0.16; // radians
const MOVE_EPS = 0.05;

/**
 * drawCaptainBubbles — a short trail of small bubbles released from behind
 * the Captain while swimming, drifting up and fading. Purely decorative.
 */
function drawCaptainBubbles(ctx, px, py, facingRight, tick) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1;
  const behind = facingRight ? -1 : 1;
  for (let i = 0; i < 4; i++) {
    const seed = i * 17.3;
    const life = ((tick * 1.3 + seed * 9) % 50) / 50;
    const bx = px + behind * (8 + life * 16) + Math.sin(tick * 0.1 + seed) * 2.5;
    const by = py + SPRITE_H * 0.06 - life * 20;
    const r = 1 + life * 2;
    ctx.globalAlpha = 0.5 * (1 - life);
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * drawPlayer(ctx, chymp, x, y, facingRight, pose, motion) — (x, y) is the
 * player CENTER. `pose` is the scene's state.pose object (or null/undefined
 * for idle). `motion` is optional `{ tick, vx, vy }` — the current frame's
 * tick counter and movement delta — used for the idle swim bob, a lean into
 * the direction of travel, and a bubble stream while moving. Omit it (or
 * leave vx/vy at 0) for a still, unbobbed Captain. All of it is skipped
 * under prefersReducedMotion(), matching every other animated flourish here.
 */
export function drawPlayer(ctx, chymp, x, y, facingRight = true, pose = null, motion = null) {
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

  // Idle swim motion — a gentle bob at rest, a stronger one while moving,
  // plus a lean into the direction of travel. Suppressed during an active
  // pose (the throw/shot already reads as motion on its own) and under
  // prefersReducedMotion().
  const tick = motion?.tick ?? 0;
  const vx = motion?.vx ?? 0;
  const vy = motion?.vy ?? 0;
  const moving = Math.abs(vx) > MOVE_EPS || Math.abs(vy) > MOVE_EPS;
  const reduced = prefersReducedMotion();
  let bob = 0, lean = 0;
  if (!reduced && !active && motion) {
    bob = moving
      ? Math.sin(tick * BOB_SWIM_FREQ) * BOB_SWIM_AMP
      : Math.sin(tick * BOB_IDLE_FREQ) * BOB_IDLE_AMP;
    if (moving) lean = Math.max(-LEAN_MAX, Math.min(LEAN_MAX, vx * 0.05));
  }

  const px = x + rx;
  const py = y + ry + bob;

  // Bubble stream trails behind while swimming.
  if (!reduced && !active && moving) {
    drawCaptainBubbles(ctx, px, py, facingRight, tick);
  }

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
    ctx.rotate(facingRight ? lean : -lean);
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
