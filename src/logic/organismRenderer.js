/**
 * organismRenderer.js — Shared placeholder-art renderer for all three game levels.
 *
 * Art seam design:
 *   Each organism data object may carry an `artToken` string (e.g. "serratia",
 *   "enterobacter"). When real illustrated art is ready, register a renderer in
 *   ART_REGISTRY keyed by that token:
 *
 *     import { ART_REGISTRY } from "../logic/organismRenderer.js";
 *     ART_REGISTRY["serratia"] = (ctx, org, x, y, radius, mutated) => { ... };
 *
 *   Until a token has a registered renderer the function falls through to the
 *   colored-circle + monogram placeholder that was originally in every scene.
 *   No real art is registered here — the map starts empty so every organism
 *   still renders exactly as today. This is the single place to add art later.
 *
 * Signature matches all three original local copies:
 *   drawOrganism(ctx, org, x, y, radius, mutated)
 *
 * Level 1 note: Level 1 organisms are initialized without fading / mutateFlash /
 * pulseProgress fields. drawOrganismEffects is a safe no-op when none of those
 * fields are present (each guard checks for truthy / != null before acting), so
 * including the effects call here is harmless for Level 1 and correct for L2/L3.
 */

import { monogramOf } from "../data/organisms.js";
import { drawOrganismEffects } from "./shotAnimation.js";
import { drawCreatureSprite, drawKillExplosion, prefersReducedMotion } from "./organismSprites.js";

const _now = () => (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;

// Rising red/ember particles around a mutated creature (resistance cue).
// Deterministic from time + per-instance seed — no per-frame particle state.
function drawMutationParticles(ctx, x, y, radius, seed) {
  const t = _now();
  const N = 10;
  ctx.save();
  for (let i = 0; i < N; i++) {
    const phase = (t * 0.6 + i / N + (seed % 1)) % 1; // 0..1 lifecycle
    const px = x + Math.sin(t * 3 + i * 1.7 + seed) * radius * 0.6;
    const py = y + radius * 0.2 - phase * radius * 2.8; // drift upward
    ctx.globalAlpha = (1 - phase) * 0.75;
    ctx.fillStyle = i % 2 ? "#ef4444" : "#fb923c";
    ctx.beginPath();
    ctx.arc(px, py, 1.5 + (1 - phase) * 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  // Sparking crack lines — a second particle type, brief and jagged, closer
  // to the body than the drifting embers.
  const S = 4;
  ctx.strokeStyle = "#fca5a5";
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  for (let i = 0; i < S; i++) {
    const sphase = (t * 1.4 + i / S + (seed % 1) * 0.5) % 1;
    const ang = (i / S) * Math.PI * 2 + seed;
    const inner = radius * (0.9 + sphase * 0.3);
    const outer = radius * (1.1 + sphase * 0.7);
    ctx.globalAlpha = (1 - sphase) * 0.8;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(ang) * inner, y + Math.sin(ang) * inner);
    ctx.lineTo(x + Math.cos(ang) * outer, y + Math.sin(ang) * outer);
    ctx.stroke();
  }
  ctx.restore();
}

// ── Shared name + MUTATED labels (used by the sprite path) ────────────────────
// labelY is the top of the name text. Mirrors the placeholder's label styling.
function drawCreatureLabels(ctx, org, x, labelY, mutated) {
  ctx.save();
  ctx.font = "bold 10px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = mutated ? "#ef4444" : "#e8f4ff";
  ctx.globalAlpha = 0.85;
  ctx.fillText(org.name, x, labelY);
  ctx.restore();
  if (mutated) {
    ctx.save();
    ctx.font = "bold 9px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#ef4444";
    ctx.fillText("MUTATED", x, labelY + 12);
    ctx.restore();
  }
}

// ── Art registry — empty at boot; real art is registered by key here ──────────
// Keys match organism.artToken values from src/data/organisms.js.
export const ART_REGISTRY = {};

// ── Darken-hex color helper ────────────────────────────────────────────────────
export function darkenHex(hex, amount) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((n & 0xff) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ── Main entry point ───────────────────────────────────────────────────────────
/**
 * drawOrganism — draw one organism onto ctx.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} org   — organism data (color, name, artToken, fading, …)
 * @param {number} x
 * @param {number} y
 * @param {number} radius — base radius (ORG_RADIUS_BASE from the calling scene)
 * @param {boolean} mutated
 */
export function drawOrganism(ctx, org, x, y, radius, mutated) {
  // When the organism is fading out (kill-shot effect): if it has a decoded
  // sprite, play the sprite-based explosion; otherwise fall back to the legacy
  // circle shrink in drawOrganismEffects. No body/labels are drawn either way.
  if (org.fading) {
    if (!(org.artToken && drawKillExplosion(ctx, org, x, y, radius))) {
      drawOrganismEffects(ctx, org, x, y, radius);
    }
    return;
  }

  // ── Art seam: if a real renderer is registered for this token, use it ────────
  const artRenderer = org.artToken ? ART_REGISTRY[org.artToken] : null;
  if (artRenderer) {
    artRenderer(ctx, org, x, y, radius, mutated);
    // Still layer impact effects on top of custom art
    drawOrganismEffects(ctx, org, x, y, radius);
    return;
  }

  // ── Illustrated sprite path (default once the WebP is on disk) ────────────────
  // organismSprites resolves /public/art/organisms/<artToken>.webp. Until the
  // bitmap decodes, drawCreatureSprite returns false and we fall through to the
  // colored-circle placeholder below so nothing pops in blank.
  if (org.artToken) {
    let opts = {};
    if (mutated) {
      const reduce = prefersReducedMotion();
      // Stable per-instance seed so each mutated creature shakes/emits in its
      // own phase (persisted on the org object, like fadeProgress/mutateFlash).
      if (org._mutSeed == null) org._mutSeed = Math.random() * 1000;
      const seed = org._mutSeed;
      const t = _now();
      const pulse = reduce ? 0.5 : 0.5 + 0.5 * Math.sin(t * 4 + seed); // 0..1
      const dx = reduce ? 0 : Math.sin(t * 9 + seed) * 2.4;            // shake
      const dy = reduce ? 0 : Math.cos(t * 8 + seed) * 1.9;
      opts = { dx, dy, tintAlpha: 0.32 + 0.22 * pulse };

      // Pulsing red glow halo behind the (shaken) sprite.
      ctx.save();
      const glowR = radius * (2.0 + 0.3 * pulse);
      const ga = 0.4 + 0.3 * pulse;
      const g = ctx.createRadialGradient(x + dx, y + dy, radius * 0.3, x + dx, y + dy, glowR);
      g.addColorStop(0, `rgba(239,68,68,${ga})`);
      g.addColorStop(1, "rgba(239,68,68,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, glowR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (drawCreatureSprite(ctx, org, x, y, radius, mutated, opts)) {
      if (mutated && !prefersReducedMotion()) {
        drawMutationParticles(ctx, x, y, radius, org._mutSeed);
      }
      drawCreatureLabels(ctx, org, x, y + radius * (mutated ? 1.55 : 1.4), mutated);
      drawOrganismEffects(ctx, org, x, y, radius);
      return;
    }
  }

  // ── Placeholder: colored circle + monogram ────────────────────────────────────
  const col = mutated ? darkenHex(org.color, 0.45) : org.color;
  const r = mutated ? radius * 1.2 : radius;

  // Shadow / glow
  ctx.save();
  ctx.shadowColor = mutated ? "#ef4444" : col;
  ctx.shadowBlur = mutated ? 18 : 10;

  // Body circle
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = col + "44";
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = mutated ? 3 : 2;
  ctx.stroke();

  ctx.restore();

  // Spiky mutation effect
  if (mutated) {
    ctx.save();
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1.5;
    const spikes = 8;
    for (let i = 0; i < spikes; i++) {
      const angle = (i / spikes) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * (r + 4), y + Math.sin(angle) * (r + 4));
      ctx.lineTo(x + Math.cos(angle) * (r + 10), y + Math.sin(angle) * (r + 10));
      ctx.stroke();
    }
    ctx.restore();
  }

  // Monogram (1–2 chars derived from name)
  const monogram = monogramOf(org);
  ctx.save();
  ctx.font = `bold ${Math.round(r * 0.75)}px 'Segoe UI', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = col;
  ctx.globalAlpha = mutated ? 0.9 : 0.8;
  ctx.fillText(monogram, x, y);
  ctx.restore();

  // Name label below
  ctx.save();
  ctx.font = "bold 10px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = mutated ? "#ef4444" : "#e8f4ff";
  ctx.globalAlpha = 0.85;
  ctx.fillText(org.name, x, y + r + 5);
  ctx.restore();

  // MUTATED label
  if (mutated) {
    ctx.save();
    ctx.font = "bold 9px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#ef4444";
    ctx.fillText("MUTATED", x, y + r + 17);
    ctx.restore();
  }

  // Impact effects (mutation flash ring, neutral pulse ring, etc.)
  // Safe no-op when org has no active effects (Level 1 organisms never have them).
  drawOrganismEffects(ctx, org, x, y, r);
}
