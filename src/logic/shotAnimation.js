/**
 * shotAnimation.js — Shared weapon-fire animation helpers for Level 2 + Level 3.
 *
 * Usage: maintain `s.shots` array in the scene's stateRef.
 * Each frame: advance shots via `tickShots`, then draw via `drawShots`.
 * When a shot reaches progress === 1, `shot.done === true` is set — the caller
 * reads `shot.outcome` and applies it (fade org, mutate, pulse, etc.).
 *
 * Outcomes:
 *   "kill"    — organism shrinks + fades, removed from scene
 *   "mutate"  — organism flashes then converts to mutated form
 *   "pulse"   — brief neutral impact; organism stays
 *
 * Reduced-motion: callers pass `reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches`
 * When true, shots are instantly completed (progress jumps to 1 immediately)
 * so the result panel appears without the animation delay.
 *
 * Each weapon has its own projectile art (see SHOT_RENDERERS below) and its own
 * flight arc, so which antibiotic is in the air is readable without the label.
 */

const SHOT_DURATION = 50; // frames at ~60fps ≈ 0.83s

/**
 * createShot — add a new projectile to the scene's shots array.
 * @param {object[]} shots — the stateRef.shots array (mutated in place)
 * @param {object} params
 *   fromX, fromY  — player center position
 *   toX, toY      — target organism center
 *   color         — weapon color hex string
 *   outcome       — "kill" | "mutate" | "pulse"
 *   orgInstanceId — id_instance of the target organism
 *   weaponId      — which projectile art to draw ("ceftriaxone" | "cefepime" |
 *                   "carbapenem"); falls back to a plain glowing bolt
 *   reducedMotion — if true, shot is pre-completed
 */
export function createShot(shots, { fromX, fromY, toX, toY, color, outcome, orgInstanceId, weaponId, reducedMotion }) {
  const shot = {
    fromX, fromY, toX, toY,
    color,
    outcome,
    orgInstanceId,
    weaponId,
    progress: reducedMotion ? 1 : 0,
    done: reducedMotion,
  };
  shots.push(shot);
}

/**
 * tickShots — advance each in-progress shot by one frame.
 * Returns the list of shots that completed this tick (for the caller to act on).
 */
export function tickShots(shots) {
  const completed = [];
  for (const shot of shots) {
    if (shot.done) continue;
    shot.progress = Math.min(1, shot.progress + 1 / SHOT_DURATION);
    if (shot.progress >= 1) {
      shot.done = true;
      completed.push(shot);
    }
  }
  return completed;
}

// ── Projectiles ───────────────────────────────────────────────────────────────
// Flight arc per weapon, in pixels of deviation at the midpoint. Bubbles are
// buoyant so they rise above the straight line; the anchor is heavy so it sags
// below it; the harpoon flies flat.
const SHOT_ARC = { ceftriaxone: -16, cefepime: 0, carbapenem: 20 };

/** Position along a shot's path at any point t (0–1), including its arc. */
function shotPos(shot, t) {
  const arc = SHOT_ARC[shot.weaponId] ?? 0;
  return {
    x: shot.fromX + (shot.toX - shot.fromX) * t,
    y: shot.fromY + (shot.toY - shot.fromY) * t + arc * Math.sin(Math.PI * t),
  };
}

// Ceftriaxone — a wobbling cluster of bubbles leaving a trail that drifts up.
function drawBubbleShot(ctx, shot, t, x, y, ang, a) {
  ctx.save();
  ctx.strokeStyle = "#dff1ff";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 5; i++) {
    const pt = t - i * 0.07;
    if (pt <= 0) continue;
    const p = shotPos(shot, pt);
    ctx.globalAlpha = a * 0.5 * (1 - i / 6);
    ctx.beginPath();
    ctx.arc(p.x + Math.sin(i * 2 + t * 10) * 2, p.y - i * 2.2, 1.5 + i * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  const wob = Math.sin(t * 22) * 1.6;
  ctx.save();
  ctx.globalAlpha = a * 0.9;
  ctx.fillStyle = "rgba(122,200,246,0.35)";
  ctx.strokeStyle = "#dff1ff";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y + wob, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - 2.4, y + wob - 2.4, 1.8, 0, Math.PI * 2); // highlight
  ctx.fill();
  ctx.strokeStyle = "#bfe4ff";
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = a * 0.8;
  for (let i = 0; i < 3; i++) {
    const oa = t * 9 + i * 2.1;
    ctx.beginPath();
    ctx.arc(x + Math.cos(oa) * 9, y + wob + Math.sin(oa) * 6, 2.4, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// Cefepime — a barbed spear on a crackling electric tether back to the gun.
function drawHarpoonShot(ctx, shot, t, x, y, ang, a) {
  const back = shotPos(shot, Math.max(0, t - 0.35));
  ctx.save();
  ctx.globalAlpha = a * 0.55;
  ctx.strokeStyle = "#c4b5fd";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(back.x, back.y);
  for (let i = 1; i <= 5; i++) {
    const f = i / 5;
    ctx.lineTo(
      back.x + (x - back.x) * f + Math.sin(t * 40 + i * 2) * 3,
      back.y + (y - back.y) * f + Math.cos(t * 37 + i * 3) * 3
    );
  }
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.scale(1, 0.6 + 0.4 * Math.abs(Math.cos(t * 12))); // barrel-roll
  ctx.strokeStyle = "#7c3aed";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-11, 0);
  ctx.lineTo(7, 0);
  ctx.stroke();
  ctx.fillStyle = "#c4a2ff";
  ctx.beginPath();
  ctx.moveTo(13, 0);
  ctx.lineTo(4, -4.5);
  ctx.lineTo(7, 0);
  ctx.lineTo(4, 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#a855f7";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-11, 0); ctx.lineTo(-14, -3.5);
  ctx.moveTo(-11, 0); ctx.lineTo(-14, 3.5);
  ctx.stroke();
  ctx.restore();

  // Arcs crackling off the tip.
  ctx.save();
  ctx.globalAlpha = a * 0.85;
  ctx.strokeStyle = "#e9d5ff";
  ctx.lineWidth = 1.3;
  const tipX = x + Math.cos(ang) * 12;
  const tipY = y + Math.sin(ang) * 12;
  for (let i = 0; i < 3; i++) {
    const sa = ang + Math.sin(t * 30 + i * 2) * 1.4;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX + Math.cos(sa) * 6, tipY + Math.sin(sa) * 6);
    ctx.stroke();
  }
  ctx.restore();
}

// Carbapenem — a tumbling anchor dragging a chain, sagging under its own weight.
function drawAnchorShot(ctx, shot, t, x, y, ang, a) {
  ctx.save();
  ctx.strokeStyle = "#c9840f";
  ctx.lineWidth = 1.4;
  for (let i = 1; i <= 6; i++) {
    const pt = t - i * 0.055;
    if (pt <= 0) continue;
    const p = shotPos(shot, pt);
    ctx.globalAlpha = a * 0.75 * (1 - i / 7);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 2.6, 1.7, (i % 2) * Math.PI / 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x, y);
  ctx.rotate(t * 7); // tumbling end over end
  ctx.strokeStyle = "#fde68a";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -8); ctx.lineTo(0, 6);                   // shank
  ctx.moveTo(-5, -5); ctx.lineTo(5, -5);                 // stock
  ctx.moveTo(-6, 3); ctx.quadraticCurveTo(-6, 8, 0, 8);  // arms
  ctx.moveTo(6, 3); ctx.quadraticCurveTo(6, 8, 0, 8);
  ctx.stroke();
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, -9.5, 2.2, 0, Math.PI * 2);                 // ring
  ctx.stroke();
  ctx.restore();
}

// Fallback for any weapon without its own art: the original glowing bolt.
function drawGenericShot(ctx, shot, t, x, y, ang, a) {
  ctx.save();
  ctx.shadowColor = shot.color;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fillStyle = shot.color;
  ctx.globalAlpha = a * 0.9;
  ctx.fill();
  ctx.restore();

  if (t > 0.05) {
    const p = shotPos(shot, Math.max(0, t - 0.18));
    ctx.save();
    ctx.strokeStyle = shot.color;
    ctx.globalAlpha = a * 0.25;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
  }
}

const SHOT_RENDERERS = {
  ceftriaxone: drawBubbleShot,
  cefepime: drawHarpoonShot,
  carbapenem: drawAnchorShot,
};

/**
 * drawShots — render all active shots onto the canvas context.
 * Call after drawing the ocean and organisms, before drawing the player.
 */
export function drawShots(ctx, shots) {
  for (const shot of shots) {
    if (shot.progress <= 0 || shot.progress > 1) continue;

    const t = shot.progress;
    const { x, y } = shotPos(shot, t);
    const ang = Math.atan2(shot.toY - shot.fromY, shot.toX - shot.fromX);
    const alpha = 1 - Math.max(0, t - 0.85) / 0.15; // fade out on arrival

    const draw = SHOT_RENDERERS[shot.weaponId] || drawGenericShot;
    draw(ctx, shot, t, x, y, ang, Math.max(0, alpha));
  }
}

/**
 * applyKillEffect — apply a shrink+fade effect to an organism on canvas.
 * Drives a per-organism `fadeProgress` float from 0 → 1.
 * Returns true when the effect is complete (organism should be removed).
 *
 * Usage: store `org.fadeProgress = 0; org.fading = true` on kill,
 * then call this each frame if `org.fading`.
 */
export function applyKillEffect(org) {
  if (!org.fading) return false;
  // ~55 frames (≈0.9s) — the burst has a lot more to show than it used to, and
  // at the old 0.03 (~0.55s) the debris and embers were cut off mid-flight.
  org.fadeProgress = (org.fadeProgress || 0) + 0.018;
  return org.fadeProgress >= 1;
}

/**
 * applyMutateFlash — drives a brief red flash on a mutating organism.
 * Store `org.mutateFlash = 0` on mutation trigger, then call each frame.
 * Returns true when flash is complete (caller marks organism as mutated).
 */
export function applyMutateFlash(org) {
  if (org.mutateFlash == null) return false;
  // ~50 frames (≈0.85s). Resistance being selected is the whole point of the
  // game, so it gets room to build, burst and settle rather than a quick blink.
  org.mutateFlash += 0.02;
  return org.mutateFlash >= 1;
}

/**
 * applyPulseEffect — drives a brief neutral ring pulse.
 * Store `org.pulseProgress = 0` on wrong-but-no-mutate, call each frame.
 * Returns true when pulse is done.
 */
export function applyPulseEffect(org) {
  if (org.pulseProgress == null) return false;
  org.pulseProgress += 0.03; // ~33 frames (≈0.55s) — long enough to read the fizzle
  return org.pulseProgress >= 1;
}

/**
 * drawOrganismEffects — draw impact effects on top of an organism.
 * Call AFTER drawOrganism for any organism that has an active effect.
 */
export function drawOrganismEffects(ctx, org, x, y, radius) {
  // Shrink+fade kill effect
  if (org.fading) {
    const p = Math.min(1, org.fadeProgress || 0);
    const r = radius * (1 - p * 0.85);
    const alpha = 1 - p;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = org.color + "44";
    ctx.fill();
    ctx.strokeStyle = org.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // ── Mutation: the creature develops resistance ──────────────────────────
  // Three beats over the effect: pressure builds inside it and red fissures
  // crack open, then it bursts outward in shockwaves and embers, then armour
  // plates lock into place around it.
  if (org.mutateFlash != null) {
    const p = Math.min(1, org.mutateFlash);
    if (org._mutSeed == null) org._mutSeed = Math.random() * 1000;
    const seed = org._mutSeed;

    // 1. Pressure — a hot core swelling inside the creature.
    if (p < 0.65) {
      const bp = 1 - p / 0.65;
      const R = radius * (0.3 + p * 1.5);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, "#fff1f1");
      g.addColorStop(0.4, "#ff6b3d");
      g.addColorStop(1, "rgba(239,68,68,0)");
      ctx.globalAlpha = (p < 0.35 ? p / 0.35 : bp) * 0.9;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Fissures — jagged cracks spreading outward, glowing from within.
    const crackP = Math.min(1, p / 0.55);
    if (crackP > 0) {
      ctx.save();
      // Normal blending, not additive: red drawn additively over Level 2's teal
      // water comes out pale green. The colours here are already bright enough.
      ctx.lineCap = "round";
      for (let i = 0; i < 9; i++) {
        const a = seed + (i / 9) * Math.PI * 2;
        const len = radius * (0.25 + crackP * 1.25);
        ctx.globalAlpha = (1 - p * 0.5) * 0.95;
        ctx.strokeStyle = i % 2 ? "#ffd0a8" : "#ff4d4d";
        ctx.lineWidth = 2.6 * (1 - p * 0.4);
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * radius * 0.15, y + Math.sin(a) * radius * 0.15);
        // three kinked segments so it reads as a crack, not a spoke
        for (let k = 1; k <= 3; k++) {
          const f = k / 3;
          const ja = a + Math.sin(i * 5.1 + k * 2.3) * 0.35;
          ctx.lineTo(x + Math.cos(ja) * len * f, y + Math.sin(ja) * len * f);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Shockwaves — the moment it bursts.
    const WAVES = [
      { start: 0.3, span: 0.5, reach: 3.4, w: 5, col: "#ef4444", a: 0.9 },
      { start: 0.38, span: 0.55, reach: 2.6, w: 3.5, col: "#fb923c", a: 0.7 },
      { start: 0.46, span: 0.6, reach: 1.9, w: 2.5, col: "#fde68a", a: 0.5 },
    ];
    ctx.save();
    for (const w of WAVES) {
      if (p < w.start || p > w.start + w.span) continue;
      const rp = (p - w.start) / w.span;
      ctx.globalAlpha = (1 - rp) * w.a;
      ctx.strokeStyle = w.col;
      ctx.lineWidth = w.w * (1 - rp * 0.6);
      ctx.beginPath();
      ctx.arc(x, y, radius * (1 + rp * w.reach), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Embers thrown off by the burst.
    if (p > 0.3) {
      const ep = (p - 0.3) / 0.7;
      ctx.save();
      for (let i = 0; i < 12; i++) {
        const a = seed * 1.3 + i * 2.399;
        const d = radius * (0.6 + ep * 2.4) * (0.5 + ((i * 3) % 7) / 7);
        ctx.globalAlpha = (1 - ep) * 0.8;
        ctx.fillStyle = i % 3 ? "#ff8c42" : "#ffd166";
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d - ep * radius * 1.2, 1 + (1 - ep) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 5. Armour — angular plates growing in around the rim as it settles.
    if (p > 0.5) {
      const ap = Math.min(1, (p - 0.5) / 0.4);
      ctx.save();
      for (let i = 0; i < 7; i++) {
        const a = seed * 0.7 + (i / 7) * Math.PI * 2;
        const rr = radius * (1.05 + 0.12 * ap);
        const px = x + Math.cos(a) * rr;
        const py = y + Math.sin(a) * rr;
        ctx.globalAlpha = ap * 0.85;
        ctx.translate(px, py);
        ctx.rotate(a + Math.PI / 2);
        ctx.fillStyle = "#7f1d1d";
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 1.2;
        const s = 5 * ap;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.9, s * 0.7);
        ctx.lineTo(-s * 0.9, s * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      ctx.restore();
    }
  }

  // ── Wrong drug: the dose fizzles out and the creature shrugs it off ──────
  // Replaces the old neutral grey ring, which read as "something happened" —
  // an ineffective antibiotic should visibly fail to do anything.
  if (org.pulseProgress != null) {
    const p = Math.min(1, org.pulseProgress);
    const drug = org.pulseColor || "#94a3b8";

    // The dose spatters, slows, and turns into harmless bubbles that drift up.
    ctx.save();
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.4;
      const ease = 1 - Math.pow(1 - p, 3); // flung out fast, then stalls
      const d = radius * (0.4 + ease * 0.9);
      const bx = x + Math.cos(a) * d;
      const by = y + Math.sin(a) * d - Math.max(0, p - 0.4) * radius * 1.6;
      if (p < 0.45) {
        // still a droplet of the drug
        ctx.globalAlpha = 0.85 * (1 - p / 0.45);
        ctx.fillStyle = drug;
        ctx.beginPath();
        ctx.arc(bx, by, 2.6 * (1 - p), 0, Math.PI * 2);
        ctx.fill();
      } else {
        // dissolved into a bubble
        const bp = (p - 0.45) / 0.55;
        ctx.globalAlpha = (1 - bp) * 0.8;
        ctx.strokeStyle = "#e8f4ff";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(bx, by, 2.2 + bp * 3.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();

    // A shimmer sweeping down the creature — the hit lands, nothing changes.
    if (p < 0.75) {
      const sp = p / 0.75;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = (1 - sp) * 0.5;
      const sy = y - radius + sp * radius * 2;
      const g = ctx.createLinearGradient(0, sy - 6, 0, sy + 6);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.5, "#ffffff");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - radius, sy - 6, radius * 2, 12);
      ctx.restore();
    }

    // A ring that collapses inward and dies, rather than expanding outward —
    // the dose is absorbed, not delivered.
    ctx.save();
    ctx.globalAlpha = (1 - p) * 0.45;
    ctx.strokeStyle = drug;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius * (1.6 - p * 0.7), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
