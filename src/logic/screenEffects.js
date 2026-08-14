/**
 * screenEffects.js — Level-wide camera shake + color flash for kill/mutate
 * moments, shared by Level2Scene and Level3Scene (the two scenes with weapon
 * fire; Level 1 has no shooting animation).
 *
 * Fully skipped under the OS reduced-motion preference — reduced-motion keeps
 * only the existing calm per-organism tint/fade (see organismSprites.js).
 *
 * Usage per scene loop:
 *   triggerScreenEffect(state, { kind: "kill" | "mutate" })   // on outcome
 *   tickScreenEffects(state)                                  // once per frame
 *   const { dx, dy } = getShakeOffset(state)                  // before drawing world
 *   ctx.translate(dx, dy); ...draw world...; ctx.translate(-dx, -dy);
 *   drawScreenFlash(ctx, w, h, state)                         // after world, before HUD
 */

import { prefersReducedMotion } from "./organismSprites.js";

const SHAKE_DURATION = 24; // frames
const FLASH_DURATION = 18; // frames
const WASH_DURATION = 70; // frames — the slow red darkening after a mutation

const PRESETS = {
  // A kill now lands much harder: a longer, stronger shake and a warm flash
  // sized to match the bigger, multi-coloured burst on the creature itself.
  kill: { intensity: 14, color: "#fff3c4", flash: 0.45 },
  // A mutation is the game's worst outcome, so it hits hardest of all: the
  // biggest shake, a red flash, and the water going dark red for a beat after.
  mutate: { intensity: 18, color: "#ef4444", flash: 0.55, wash: true },
};

/** Start a shake+flash pair for a kill or mutate moment. No-op in reduced-motion. */
export function triggerScreenEffect(state, { kind }) {
  if (prefersReducedMotion()) return;
  const preset = PRESETS[kind];
  if (!preset) return;
  state.screenShake = { t: 0, intensity: preset.intensity };
  state.screenFlash = { t: 0, color: preset.color, peak: preset.flash ?? 0.3 };
  if (preset.wash) state.screenWash = { t: 0 };
}

/** Advance shake/flash timers by one frame. Call once per loop tick. */
export function tickScreenEffects(state) {
  if (state.screenShake) {
    state.screenShake.t++;
    if (state.screenShake.t >= SHAKE_DURATION) state.screenShake = null;
  }
  if (state.screenFlash) {
    state.screenFlash.t++;
    if (state.screenFlash.t >= FLASH_DURATION) state.screenFlash = null;
  }
  if (state.screenWash) {
    state.screenWash.t++;
    if (state.screenWash.t >= WASH_DURATION) state.screenWash = null;
  }
}

/** Current camera-shake translation offset, decaying to 0 over the shake. */
export function getShakeOffset(state) {
  const sh = state.screenShake;
  if (!sh) return { dx: 0, dy: 0 };
  const falloff = 1 - sh.t / SHAKE_DURATION;
  const phase = sh.t * 3.1;
  return {
    dx: Math.sin(phase * 1.7) * sh.intensity * falloff,
    dy: Math.cos(phase * 2.3) * sh.intensity * falloff,
  };
}

/**
 * Full-canvas overlays, drawn after the world and before the HUD:
 *   - the bright flash of a kill or mutation, gone in a few frames
 *   - the slow dark-red wash after a mutation: the water dims from the edges
 *     in and recovers over about a second, so the whole reef reacts to it
 */
export function drawScreenFlash(ctx, w, h, state) {
  const wash = state.screenWash;
  if (wash) {
    // Ramp in over the first fifth, then ease back out.
    const wp = wash.t / WASH_DURATION;
    const strength = wp < 0.2 ? wp / 0.2 : 1 - (wp - 0.2) / 0.8;
    ctx.save();
    ctx.globalAlpha = Math.max(0, strength) * 0.5;
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.15, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, "rgba(80,0,0,0)");
    g.addColorStop(0.55, "rgba(90,10,10,0.55)");
    g.addColorStop(1, "rgba(50,0,0,0.95)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  const fl = state.screenFlash;
  if (!fl) return;
  const alpha = (1 - fl.t / FLASH_DURATION) * (fl.peak ?? 0.3);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fl.color;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
