/**
 * playerRenderer.js — Shared canvas renderer for the player character (Captain Chymp).
 *
 * Replaces the per-scene circle+monogram `drawPlayer()` that used to live in
 * Level1/2/3Scene.jsx. The illustrated Captain sprite (transparent WebP) is
 * preloaded once at module load and drawn on the canvas, flipped horizontally
 * to match the facing direction.
 *
 * The image lives in /public and is resolved through Vite's base path so it
 * works under the GitHub Pages subpath (base: '/SEACHYMP-Bug-Blasters/').
 *
 * drawPlayer(ctx, chymp, x, y, facingRight) — (x, y) is the player CENTER.
 */

const SPRITE_SRC = `${import.meta.env.BASE_URL}art/chymps/captain.webp`;

// Module-level preload. `loaded` gates drawing until the bitmap is ready so we
// never call drawImage on a half-decoded image (which throws/no-ops).
const sprite = new Image();
let loaded = false;
sprite.onload = () => { loaded = true; };
sprite.src = SPRITE_SRC;

// Native aspect ratio of captain.webp (553 x 734, portrait).
const ASPECT = 553 / 734;

// Display height of the sprite on the board, in px. Tuned so the character
// reads at roughly the same footprint as the old PLAYER_RADIUS(22) avatar but
// with a taller illustrated silhouette.
const SPRITE_H = 78;

export function drawPlayer(ctx, chymp, x, y, facingRight = true) {
  const color = chymp?.color || "#38b2e8";

  // Soft glow / shadow puddle under the diver so he sits in the scene.
  ctx.save();
  const glow = ctx.createRadialGradient(x, y + SPRITE_H * 0.34, 2, x, y + SPRITE_H * 0.34, SPRITE_H * 0.42);
  glow.addColorStop(0, color + "44");
  glow.addColorStop(1, color + "00");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(x, y + SPRITE_H * 0.34, SPRITE_H * 0.42, SPRITE_H * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (!loaded) {
    // Fallback while the sprite decodes: a simple soft disc (no monogram).
    ctx.save();
    ctx.fillStyle = color + "55";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  const h = SPRITE_H;
  const w = h * ASPECT;

  ctx.save();
  ctx.translate(x, y);
  // The source art faces forward/slightly right; mirror it when swimming left.
  if (!facingRight) ctx.scale(-1, 1);
  ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
  ctx.restore();
}

export default drawPlayer;
