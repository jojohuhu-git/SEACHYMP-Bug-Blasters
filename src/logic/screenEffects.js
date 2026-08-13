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

const SHAKE_DURATION = 16; // frames
const FLASH_DURATION = 12; // frames

const PRESETS = {
  kill: { intensity: 8, color: "#ffffff" },
  mutate: { intensity: 6, color: "#ef4444" },
};

/** Start a shake+flash pair for a kill or mutate moment. No-op in reduced-motion. */
export function triggerScreenEffect(state, { kind }) {
  if (prefersReducedMotion()) return;
  const preset = PRESETS[kind];
  if (!preset) return;
  state.screenShake = { t: 0, intensity: preset.intensity };
  state.screenFlash = { t: 0, color: preset.color };
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

/** Full-canvas color flash overlay, fading out over FLASH_DURATION. */
export function drawScreenFlash(ctx, w, h, state) {
  const fl = state.screenFlash;
  if (!fl) return;
  const alpha = (1 - fl.t / FLASH_DURATION) * 0.3;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fl.color;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
