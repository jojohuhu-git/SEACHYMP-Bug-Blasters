/**
 * oceanLife.js — Shared ambient background life for each level's drawOcean:
 * drifting plankton, rippling light caustics, bubbles rising from the reef,
 * and an occasional fish shoal passing through. Purely decorative — drawn
 * over the gradient/light-rays/wave-lines and under the reef/organisms/player.
 *
 * Every level's drawOcean has its own palette (L1 deep blue, L2 teal/emerald,
 * L3 indigo violet) but identical ambient logic, so this is factored out
 * once instead of tripled.
 *
 * Under prefersReducedMotion() only the plankton stays, drawn as a static
 * field with no drift/twinkle — caustics, bubbles, and the fish shoal are all
 * continuous ambient motion and are skipped entirely.
 *
 * drawOceanLife(ctx, w, h, tick, palette)
 *   palette: { caustic, plankton, bubble, fish: [colors...] } — all plain
 *   6-digit hex (no alpha channel; alpha is appended internally).
 */

import { prefersReducedMotion } from "./organismSprites.js";

function rand(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const PLANKTON_COUNT = 26;
const CAUSTIC_COUNT = 4;
const BUBBLE_COUNT = 9;
const SHOAL_SIZE = 5;
const SHOAL_PERIOD = 900; // ticks between crossings (~15s at 60fps)
const SHOAL_WINDOW = 220; // ticks the shoal is actually on screen

function drawCaustics(ctx, w, h, tick, color) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < CAUSTIC_COUNT; i++) {
    const baseX = w * (0.15 + i * 0.22);
    const baseY = h * (0.2 + rand(i * 3.1) * 0.5);
    const sway = Math.sin(tick * 0.006 + i * 2) * 30;
    const pulse = 0.35 + Math.sin(tick * 0.01 + i) * 0.15;
    const r = 70 + rand(i * 5.3) * 40;
    const cx = baseX + sway;
    const grad = ctx.createRadialGradient(cx, baseY, 2, cx, baseY, r);
    const a = Math.max(0, Math.min(255, Math.round(pulse * 60)));
    grad.addColorStop(0, color + a.toString(16).padStart(2, "0"));
    grad.addColorStop(1, color + "00");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, baseY, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPlankton(ctx, w, h, tick, color, reduced) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < PLANKTON_COUNT; i++) {
    const seed = i * 13.7;
    const baseX = rand(seed) * w;
    const baseY = rand(seed + 1) * h;
    const size = 0.6 + rand(seed + 2) * 1.4;
    let x = baseX;
    let y = baseY;
    let alpha = 0.22 + rand(seed + 3) * 0.28;
    if (!reduced) {
      const drift = (tick * (0.12 + rand(seed + 4) * 0.14)) % h;
      y = (baseY - drift + h) % h;
      x = baseX + Math.sin(tick * 0.01 + seed) * 8;
      alpha *= 0.7 + Math.sin(tick * 0.02 + seed) * 0.3;
    }
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBubbles(ctx, w, h, tick, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    const seed = i * 31.3;
    const baseX = rand(seed) * w;
    const speed = 0.4 + rand(seed + 1) * 0.5;
    const cycle = h + 40;
    const y = h - ((tick * speed + rand(seed + 2) * cycle) % cycle);
    const x = baseX + Math.sin(tick * 0.02 + seed) * 10;
    const r = 1.4 + rand(seed + 3) * 2.4;
    ctx.globalAlpha = 0.28 * Math.min(1, (h - y) / 60);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFishShoal(ctx, w, h, tick, colors) {
  const cyclePos = tick % SHOAL_PERIOD;
  if (cyclePos > SHOAL_WINDOW) return;
  const dir = Math.floor(tick / SHOAL_PERIOD) % 2 === 0 ? 1 : -1;
  const p = cyclePos / SHOAL_WINDOW;
  const baseY = h * 0.28 + Math.sin(tick * 0.02) * h * 0.08;
  const span = w + 120;
  const cx = dir > 0 ? -60 + p * span : w + 60 - p * span;

  ctx.save();
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < SHOAL_SIZE; i++) {
    const fx = cx + dir * -i * 14 + Math.sin(tick * 0.05 + i) * 4;
    const fy = baseY + Math.sin(i * 1.7) * 10 + Math.sin(tick * 0.08 + i) * 3;
    ctx.save();
    ctx.translate(fx, fy);
    if (dir < 0) ctx.scale(-1, 1);
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.quadraticCurveTo(-2, -4, -8, 0);
    ctx.quadraticCurveTo(-2, 4, 6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(-13, -3);
    ctx.lineTo(-13, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

export function drawOceanLife(ctx, w, h, tick, palette) {
  const reduced = prefersReducedMotion();
  if (!reduced) drawCaustics(ctx, w, h, tick, palette.caustic);
  drawPlankton(ctx, w, h, tick, palette.plankton, reduced);
  if (!reduced) {
    drawBubbles(ctx, w, h, tick, palette.bubble);
    drawFishShoal(ctx, w, h, tick, palette.fish);
  }
}

export default drawOceanLife;
