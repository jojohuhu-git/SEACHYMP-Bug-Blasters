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
 * TODO: real weapon-specific art (bubble/harpoon/anchor/torpedo/beam) for each weaponId.
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
 *   reducedMotion — if true, shot is pre-completed
 */
export function createShot(shots, { fromX, fromY, toX, toY, color, outcome, orgInstanceId, reducedMotion }) {
  const shot = {
    fromX, fromY, toX, toY,
    color,
    outcome,
    orgInstanceId,
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

/**
 * drawShots — render all active shots onto the canvas context.
 * Call after drawing the ocean and organisms, before drawing the player.
 */
export function drawShots(ctx, shots) {
  for (const shot of shots) {
    if (shot.progress <= 0 || shot.progress > 1) continue;

    const t = shot.progress;
    const x = shot.fromX + (shot.toX - shot.fromX) * t;
    const y = shot.fromY + (shot.toY - shot.fromY) * t;

    // Projectile: a weapon-colored glowing circle
    // TODO: real weapon-specific art (bubble/harpoon/anchor/torpedo/beam)
    const r = 7;
    ctx.save();
    ctx.shadowColor = shot.color;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = shot.color;
    ctx.globalAlpha = 0.9 * (1 - Math.max(0, t - 0.8) / 0.2); // fade on arrival
    ctx.fill();
    ctx.restore();

    // Trailing line (motion cue)
    if (t > 0.05) {
      const prevT = Math.max(0, t - 0.18);
      const px = shot.fromX + (shot.toX - shot.fromX) * prevT;
      const py = shot.fromY + (shot.toY - shot.fromY) * prevT;
      ctx.save();
      ctx.strokeStyle = shot.color;
      ctx.globalAlpha = 0.25 * (1 - t);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    }
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
  org.fadeProgress = (org.fadeProgress || 0) + 0.03; // ~33 frames, longer burst
  return org.fadeProgress >= 1;
}

/**
 * applyMutateFlash — drives a brief red flash on a mutating organism.
 * Store `org.mutateFlash = 0` on mutation trigger, then call each frame.
 * Returns true when flash is complete (caller marks organism as mutated).
 */
export function applyMutateFlash(org) {
  if (org.mutateFlash == null) return false;
  org.mutateFlash += 0.045; // ~22 frames, longer burst
  return org.mutateFlash >= 1;
}

/**
 * applyPulseEffect — drives a brief neutral ring pulse.
 * Store `org.pulseProgress = 0` on wrong-but-no-mutate, call each frame.
 * Returns true when pulse is done.
 */
export function applyPulseEffect(org) {
  if (org.pulseProgress == null) return false;
  org.pulseProgress += 0.06;
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

  // Mutation flash: red pulsing ring expanding outward, trailed by a wider
  // fainter orange ring for a bigger, more layered burst.
  if (org.mutateFlash != null) {
    const p = Math.min(1, org.mutateFlash);
    ctx.save();
    ctx.globalAlpha = (1 - p) * 0.75;
    ctx.beginPath();
    ctx.arc(x, y, radius + p * 34, 0, Math.PI * 2);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.globalAlpha = (1 - p) * 0.4;
    ctx.beginPath();
    ctx.arc(x, y, radius + p * 48, 0, Math.PI * 2);
    ctx.strokeStyle = "#fb923c";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Neutral pulse: brief white/gray expanding ring
  if (org.pulseProgress != null) {
    const p = Math.min(1, org.pulseProgress);
    const expandR = radius + p * 18;
    ctx.save();
    ctx.globalAlpha = (1 - p) * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, expandR, 0, Math.PI * 2);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}
