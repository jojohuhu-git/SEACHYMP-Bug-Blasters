/**
 * reefRenderer.js — Canvas painter for the growing seabed reef.
 *
 * Drawn along the bottom of each level scene (after the ocean background,
 * before the organisms/player) so the reef visibly fills in as the player's
 * identified count crosses the reef-stage thresholds (2 / 5 / 8).
 *
 * As the stage climbs, the reef gains DENSITY and VARIETY: more coral, more
 * coral shapes (branching / fan / brain / tube / staghorn), a wider colour
 * range, plus stage-gated sea life — shells, starfish, anemones, crabs, kelp,
 * schooling fish, and a slow whale/shark silhouette drifting through the water
 * at a thriving reef. Pure procedural canvas art — no image assets required.
 *
 * `stageIdx` is the index into REEF_STAGES (0 barren … 3 thriving).
 *
 * drawReef(ctx, w, h, stageIdx, tick)
 */

// Deterministic pseudo-random in [0,1) from a numeric seed — keeps every clump
// stable frame to frame (no jitter) while varying across positions.
function rand(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const CORAL_PALETTES = [
  ["#f472b6", "#ec4899"], // pink
  ["#fb923c", "#f97316"], // orange
  ["#4ade80", "#22c55e"], // green
  ["#a78bfa", "#8b5cf6"], // violet
  ["#facc15", "#eab308"], // yellow
  ["#2dd4bf", "#14b8a6"], // teal
  ["#f87171", "#ef4444"], // coral red
  ["#38bdf8", "#0ea5e9"], // sky
];

// Per-stage tuning. Index 0 barren … 3 thriving.
const STAGE = [
  { reveal: 0.0,  sizeMax: 0.0, fishes: 0,  shells: 0,  starfish: 0, crabs: 0, anemones: 0, kelp: 0,  mega: false, seahorses: 0, jellies: 0, rays: 0, whales: 0, clams: 0 },
  { reveal: 0.4,  sizeMax: 1.1, fishes: 3,  shells: 4,  starfish: 0, crabs: 0, anemones: 2, kelp: 3,  mega: false, seahorses: 0, jellies: 0, rays: 0, whales: 0, clams: 0 },
  { reveal: 0.72, sizeMax: 1.4, fishes: 9,  shells: 8,  starfish: 2, crabs: 2, anemones: 4, kelp: 6,  mega: false, seahorses: 2, jellies: 1, rays: 0, whales: 1, clams: 2 },
  { reveal: 1.0,  sizeMax: 1.8, fishes: 18, shells: 14, starfish: 3, crabs: 3, anemones: 7, kelp: 10, mega: true,  seahorses: 4, jellies: 3, rays: 1, whales: 2, clams: 4 },
];

const FISH_COLORS = ["#fbbf24", "#fb7185", "#60a5fa", "#34d399", "#f472b6", "#fdba74"];

// ── Coral shapes ──────────────────────────────────────────────────────────────

function coralBranching(ctx, x, baseY, sz, seed, tick, pal) {
  const branches = 3 + Math.floor(rand(seed * 7.7) * 3);
  ctx.fillStyle = pal[1];
  ctx.beginPath();
  ctx.ellipse(x, baseY, sz * 0.8, sz * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineCap = "round";
  for (let b = 0; b < branches; b++) {
    const spread = (b / (branches - 1) - 0.5) * sz * 1.5;
    const hgt = sz * (1.1 + rand(seed + b) * 1.2);
    const sway = Math.sin(tick * 0.018 + seed + b) * sz * 0.18;
    const bx = x + spread;
    ctx.strokeStyle = b % 2 === 0 ? pal[0] : pal[1];
    ctx.lineWidth = sz * 0.32;
    ctx.beginPath();
    ctx.moveTo(bx, baseY);
    ctx.quadraticCurveTo(bx + sway * 0.5, baseY - hgt * 0.6, bx + sway, baseY - hgt);
    ctx.stroke();
    ctx.fillStyle = pal[0];
    ctx.beginPath();
    ctx.arc(bx + sway, baseY - hgt, sz * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function coralFan(ctx, x, baseY, sz, seed, tick, pal) {
  // Flat sea fan: radiating ribs inside a fan outline, swaying as a whole.
  const sway = Math.sin(tick * 0.02 + seed) * 0.12;
  ctx.save();
  ctx.translate(x, baseY);
  ctx.rotate(sway);
  const h = sz * 2.1, wd = sz * 1.7;
  ctx.fillStyle = pal[1] + "cc";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-wd, -h * 0.5, -wd * 0.4, -h);
  ctx.quadraticCurveTo(0, -h * 1.15, wd * 0.4, -h);
  ctx.quadraticCurveTo(wd, -h * 0.5, 0, 0);
  ctx.fill();
  ctx.strokeStyle = pal[0];
  ctx.lineWidth = sz * 0.12;
  for (let r = -2; r <= 2; r++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(r * wd * 0.25, -h * 0.55, r * wd * 0.32, -h * 0.95);
    ctx.stroke();
  }
  ctx.restore();
}

function coralBrain(ctx, x, baseY, sz, seed, _tick, pal) {
  // Rounded mound with wavy grooves.
  ctx.fillStyle = pal[1];
  ctx.beginPath();
  ctx.ellipse(x, baseY - sz * 0.5, sz * 1.1, sz * 0.85, 0, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = pal[0];
  ctx.lineWidth = sz * 0.16;
  for (let g = 0; g < 3; g++) {
    const gy = baseY - sz * (0.3 + g * 0.35);
    ctx.beginPath();
    for (let xi = -1; xi <= 1; xi += 0.1) {
      const px = x + xi * sz * 0.95;
      const py = gy + Math.sin(xi * 6 + seed + g) * sz * 0.1;
      if (xi === -1) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
}

function coralTube(ctx, x, baseY, sz, seed, tick, pal) {
  // Cluster of vertical tube polyps of varying height.
  const tubes = 3 + Math.floor(rand(seed * 5.1) * 3);
  for (let t = 0; t < tubes; t++) {
    const tx = x + (t - (tubes - 1) / 2) * sz * 0.5;
    const hgt = sz * (1 + rand(seed + t * 1.3) * 1.1);
    const sway = Math.sin(tick * 0.022 + seed + t) * sz * 0.1;
    ctx.strokeStyle = pal[1];
    ctx.lineWidth = sz * 0.42;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tx, baseY);
    ctx.lineTo(tx + sway, baseY - hgt);
    ctx.stroke();
    ctx.fillStyle = pal[0];
    ctx.beginPath();
    ctx.arc(tx + sway, baseY - hgt, sz * 0.24, 0, Math.PI * 2);
    ctx.fill();
  }
}

function coralStaghorn(ctx, x, baseY, sz, seed, tick, pal) {
  // Antler-like forked branches.
  ctx.strokeStyle = pal[1];
  ctx.lineCap = "round";
  const arms = 2 + Math.floor(rand(seed * 9.3) * 2);
  for (let a = 0; a < arms; a++) {
    const dir = (a / Math.max(1, arms - 1) - 0.5) * 1.4;
    const sway = Math.sin(tick * 0.02 + seed + a) * sz * 0.12;
    const tipX = x + dir * sz * 1.2 + sway;
    const tipY = baseY - sz * 1.6;
    ctx.lineWidth = sz * 0.26;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(x + dir * sz * 0.4, baseY - sz * 0.9, tipX, tipY);
    ctx.stroke();
    // fork
    ctx.lineWidth = sz * 0.18;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY + sz * 0.4);
    ctx.lineTo(tipX + sz * 0.4, tipY - sz * 0.1);
    ctx.moveTo(tipX, tipY + sz * 0.4);
    ctx.lineTo(tipX - sz * 0.3, tipY - sz * 0.2);
    ctx.stroke();
  }
}

const CORAL_TYPES = [coralBranching, coralFan, coralBrain, coralTube, coralStaghorn];

// ── Seabed decorations ────────────────────────────────────────────────────────

function drawRock(ctx, x, baseY, sz) {
  ctx.fillStyle = "#5b6b7a";
  ctx.beginPath();
  ctx.ellipse(x, baseY, sz * 0.9, sz * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6d7d8c";
  ctx.beginPath();
  ctx.ellipse(x - sz * 0.3, baseY - sz * 0.15, sz * 0.4, sz * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawKelp(ctx, x, baseY, h, seed, tick) {
  ctx.strokeStyle = "#2f8f5b";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i <= 1; i += 0.08) {
    const py = baseY - i * h;
    const px = x + Math.sin(i * 5 + tick * 0.03 + seed) * 7 * i;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
  // blades
  ctx.strokeStyle = "#3fae6e";
  ctx.lineWidth = 2;
  for (let i = 0.3; i < 1; i += 0.25) {
    const py = baseY - i * h;
    const px = x + Math.sin(i * 5 + tick * 0.03 + seed) * 7 * i;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + 8, py - 4);
    ctx.stroke();
  }
}

function drawShell(ctx, x, y, sz, seed) {
  const c = ["#fbcfe8", "#fde68a", "#e9d5ff"][Math.floor(rand(seed) * 3)];
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, sz, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#00000022";
  ctx.lineWidth = 1;
  for (let r = -2; r <= 2; r++) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos((r / 4) * Math.PI - Math.PI / 2 + Math.PI) * sz,
               y + Math.sin((r / 4) * Math.PI) * -sz);
    ctx.stroke();
  }
}

function drawStarfish(ctx, x, y, sz, seed) {
  ctx.fillStyle = ["#fb7185", "#fbbf24", "#f472b6"][Math.floor(rand(seed) * 3)];
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? sz : sz * 0.45;
    const px = x + Math.cos(ang) * r;
    const py = y + Math.sin(ang) * r * 0.85;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawAnemone(ctx, x, baseY, sz, seed, tick) {
  ctx.fillStyle = "#c084fc";
  ctx.beginPath();
  ctx.ellipse(x, baseY, sz * 0.7, sz * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e9a8ff";
  ctx.lineWidth = sz * 0.18;
  ctx.lineCap = "round";
  for (let t = 0; t < 7; t++) {
    const tx = x + (t - 3) * sz * 0.22;
    const sway = Math.sin(tick * 0.05 + seed + t) * sz * 0.25;
    ctx.beginPath();
    ctx.moveTo(tx, baseY);
    ctx.lineTo(tx + sway, baseY - sz * (0.8 + rand(seed + t) * 0.5));
    ctx.stroke();
  }
}

function drawCrab(ctx, x, baseY, sz, tick) {
  const scuttle = Math.sin(tick * 0.08) * sz * 0.15;
  const cx = x + scuttle;
  ctx.strokeStyle = "#e2603a";
  ctx.lineWidth = sz * 0.12;
  ctx.lineCap = "round";
  for (let s = -1; s <= 1; s += 2) {
    for (let l = 0; l < 3; l++) {
      const lx = cx + s * sz * (0.6 + l * 0.25);
      ctx.beginPath();
      ctx.moveTo(cx + s * sz * 0.4, baseY);
      ctx.lineTo(lx, baseY + (l === 1 ? sz * 0.1 : sz * 0.3) - Math.abs(scuttle) * 0.3);
      ctx.stroke();
    }
  }
  // body
  ctx.fillStyle = "#ef6b43";
  ctx.beginPath();
  ctx.ellipse(cx, baseY - sz * 0.2, sz * 0.7, sz * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // claws
  ctx.fillStyle = "#e2603a";
  for (let s = -1; s <= 1; s += 2) {
    ctx.beginPath();
    ctx.ellipse(cx + s * sz * 0.85, baseY - sz * 0.35, sz * 0.25, sz * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // eyes
  ctx.fillStyle = "#1f2937";
  ctx.beginPath(); ctx.arc(cx - sz * 0.2, baseY - sz * 0.45, sz * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + sz * 0.2, baseY - sz * 0.45, sz * 0.08, 0, Math.PI * 2); ctx.fill();
}

function drawFish(ctx, x, y, sz, color, dir, tick, seed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  const wig = Math.sin(tick * 0.2 + seed) * sz * 0.25;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, sz, sz * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // tail
  ctx.beginPath();
  ctx.moveTo(-sz * 0.9, 0);
  ctx.lineTo(-sz * 1.5, -sz * 0.5 + wig);
  ctx.lineTo(-sz * 1.5, sz * 0.5 + wig);
  ctx.closePath();
  ctx.fill();
  // eye
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(sz * 0.45, -sz * 0.1, sz * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1f2937";
  ctx.beginPath(); ctx.arc(sz * 0.5, -sz * 0.1, sz * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Slow whale or shark silhouette drifting through the mid-water (thriving only).
function drawMegafauna(ctx, w, h, tick) {
  // Alternate species over a long period so both appear over time.
  const era = Math.floor(tick / 1600) % 2;
  const speed = era === 0 ? 0.22 : 0.5; // whale slower than shark
  const span = w + 360;
  const x = ((tick * speed) % span) - 180;
  const y = h * (era === 0 ? 0.34 : 0.5) + Math.sin(tick * 0.01) * 10;
  const s = era === 0 ? h * 0.16 : h * 0.1;

  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = era === 0 ? "#1e3a5f" : "#26303f";
  ctx.translate(x, y);
  if (era === 0) {
    // Whale: big rounded body, tail fluke, pectoral fin.
    ctx.beginPath();
    ctx.moveTo(-s * 2.4, 0);
    ctx.quadraticCurveTo(-s * 0.5, -s * 0.9, s * 1.6, -s * 0.35);
    ctx.quadraticCurveTo(s * 2.4, 0, s * 1.6, s * 0.4);
    ctx.quadraticCurveTo(-s * 0.5, s * 0.9, -s * 2.4, 0);
    ctx.fill();
    // tail fluke
    ctx.beginPath();
    ctx.moveTo(-s * 2.2, 0);
    ctx.lineTo(-s * 3.1, -s * 0.7);
    ctx.lineTo(-s * 2.5, 0);
    ctx.lineTo(-s * 3.1, s * 0.7);
    ctx.closePath();
    ctx.fill();
    // pectoral fin
    ctx.beginPath();
    ctx.moveTo(s * 0.2, s * 0.5);
    ctx.lineTo(-s * 0.4, s * 1.2);
    ctx.lineTo(s * 0.6, s * 0.7);
    ctx.closePath();
    ctx.fill();
  } else {
    // Shark: sleeker body, dorsal + tail fin.
    ctx.beginPath();
    ctx.moveTo(-s * 2.6, 0);
    ctx.quadraticCurveTo(-s * 0.5, -s * 0.55, s * 1.9, -s * 0.12);
    ctx.quadraticCurveTo(s * 2.5, 0, s * 1.9, s * 0.14);
    ctx.quadraticCurveTo(-s * 0.5, s * 0.55, -s * 2.6, 0);
    ctx.fill();
    // dorsal fin
    ctx.beginPath();
    ctx.moveTo(s * 0.1, -s * 0.4);
    ctx.lineTo(s * 0.5, -s * 1.1);
    ctx.lineTo(s * 0.8, -s * 0.35);
    ctx.closePath();
    ctx.fill();
    // tail
    ctx.beginPath();
    ctx.moveTo(-s * 2.4, 0);
    ctx.lineTo(-s * 3.2, -s * 0.9);
    ctx.lineTo(-s * 2.6, 0);
    ctx.lineTo(-s * 3.0, s * 0.7);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// Dedicated humpback whale — distinct from the background megafauna silhouette:
// knobbly rostrum tubercles, a long trailing pectoral fin, a serrated fluke, and an
// occasional blow-spout. Drawn with a per-instance seed so 1-2 can drift independently.
function drawHumpbackWhale(ctx, w, h, tick, seed) {
  const speed = 0.16 + rand(seed * 3.1) * 0.1;
  const span = w + 420;
  const dir = rand(seed) < 0.5 ? 1 : -1;
  const raw = (tick * speed + rand(seed * 2) * span) % span;
  const x = dir > 0 ? raw - 210 : span - raw - 210;
  const y = h * (0.22 + rand(seed * 4) * 0.28) + Math.sin(tick * 0.008 + seed) * 12;
  const s = h * (0.13 + rand(seed * 5) * 0.03);

  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = "#0b1f33";
  ctx.translate(x, y);
  ctx.scale(dir, 1);

  // Body
  ctx.beginPath();
  ctx.moveTo(-s * 2.5, 0);
  ctx.quadraticCurveTo(-s * 0.4, -s * 1.0, s * 1.7, -s * 0.4);
  ctx.quadraticCurveTo(s * 2.5, 0, s * 1.7, s * 0.4);
  ctx.quadraticCurveTo(-s * 0.4, s * 0.95, -s * 2.5, 0);
  ctx.fill();

  // Rostrum tubercles (small bumps along the jaw — humpback signature)
  ctx.fillStyle = "#051220";
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(s * (1.35 + i * 0.18), -s * (0.22 - i * 0.02), s * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#0b1f33";

  // Tail fluke, serrated trailing edge
  ctx.beginPath();
  ctx.moveTo(-s * 2.3, 0);
  ctx.lineTo(-s * 3.3, -s * 0.85);
  ctx.lineTo(-s * 2.9, -s * 0.15);
  ctx.lineTo(-s * 2.6, 0);
  ctx.lineTo(-s * 2.9, s * 0.15);
  ctx.lineTo(-s * 3.3, s * 0.85);
  ctx.closePath();
  ctx.fill();

  // Long trailing pectoral fin — distinctively oversized on a humpback
  const finFlap = Math.sin(tick * 0.03 + seed) * 0.08;
  ctx.save();
  ctx.rotate(finFlap);
  ctx.beginPath();
  ctx.moveTo(s * 0.1, s * 0.5);
  ctx.quadraticCurveTo(-s * 0.3, s * 1.6, s * 0.3, s * 2.1);
  ctx.quadraticCurveTo(s * 0.6, s * 1.2, s * 0.7, s * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();

  // Blow-spout: a brief puff above the head, on a slow cycle.
  const blowPhase = (tick * 0.6 + seed * 300) % 400;
  if (blowPhase < 30) {
    const bp = blowPhase / 30;
    const headX = x + dir * s * 1.55;
    const headY = y - s * 0.55 - bp * s * 1.4;
    ctx.save();
    ctx.globalAlpha = (1 - bp) * 0.35;
    ctx.strokeStyle = "#e8f4ff";
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(headX + i * 3, headY + s * 0.3);
      ctx.lineTo(headX + i * (7 + bp * 6), headY);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// Small bivalve on the seabed that periodically opens to reveal a pearl-like
// interior, then closes — a "seashell creature" distinct from the flat static shells.
function drawClamCreature(ctx, x, baseY, sz, seed, tick) {
  const cycle = ((tick * 0.02 + seed * 7) % 100) / 100; // 0..1
  const openness = cycle < 0.5 ? Math.sin(cycle * Math.PI) : 0; // open then shut, rest closed
  const gape = openness * sz * 0.55;
  const shellCol = ["#fbcfe8", "#e9d5ff", "#fde68a"][Math.floor(rand(seed) * 3)];

  ctx.save();
  // Interior, only visible while open
  if (gape > 0.5) {
    ctx.fillStyle = "#fda4af";
    ctx.beginPath();
    ctx.ellipse(x, baseY - sz * 0.1, sz * 0.5, sz * 0.3, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.arc(x, baseY - sz * 0.15, sz * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }
  // Bottom valve
  ctx.fillStyle = shellCol;
  ctx.beginPath();
  ctx.ellipse(x, baseY + sz * 0.1, sz * 0.65, sz * 0.32, 0, 0, Math.PI);
  ctx.fill();
  // Top valve, hinged open by `gape`
  ctx.save();
  ctx.translate(x - sz * 0.6, baseY);
  ctx.rotate(-gape / sz);
  ctx.fillStyle = shellCol;
  ctx.beginPath();
  ctx.ellipse(sz * 0.6, 0, sz * 0.65, sz * 0.32, 0, Math.PI, 0);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

function drawBubbleColumn(ctx, x, h, baseY, tick, seed) {
  ctx.strokeStyle = "rgba(191,227,255,0.5)";
  ctx.lineWidth = 1;
  for (let b = 0; b < 4; b++) {
    const phase = (tick * 0.6 + b * 70 + seed * 50) % (h * 0.6);
    const by = baseY - phase;
    const bx = x + Math.sin((phase + seed) * 0.05) * 6;
    const r = 1.5 + (b % 2);
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Friendly seahorse hovering over a growing/thriving reef (decorative, not clickable).
function drawSeahorse(ctx, cx, cy, sz, seed, tick) {
  const sway = Math.sin(tick * 0.03 + seed) * 0.1;
  const bob = Math.sin(tick * 0.045 + seed) * sz * 0.18;
  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.rotate(sway);

  // Body (head up, snout right, curled tail bottom-left)
  ctx.fillStyle = "#f6b84b";
  ctx.beginPath();
  ctx.moveTo(-0.15 * sz, -1.15 * sz);
  ctx.quadraticCurveTo(0.45 * sz, -1.3 * sz, 0.5 * sz, -0.95 * sz);
  ctx.quadraticCurveTo(0.55 * sz, -0.85 * sz, 0.95 * sz, -0.7 * sz);
  ctx.quadraticCurveTo(0.6 * sz, -0.6 * sz, 0.4 * sz, -0.45 * sz);
  ctx.quadraticCurveTo(0.8 * sz, 0.0, 0.45 * sz, 0.5 * sz);
  ctx.quadraticCurveTo(0.2 * sz, 0.95 * sz, -0.4 * sz, 0.8 * sz);
  ctx.quadraticCurveTo(0.05 * sz, 0.7 * sz, 0.1 * sz, 0.35 * sz);
  ctx.quadraticCurveTo(-0.5 * sz, 0.0, -0.2 * sz, -0.6 * sz);
  ctx.quadraticCurveTo(-0.35 * sz, -0.95 * sz, -0.15 * sz, -1.15 * sz);
  ctx.closePath();
  ctx.fill();

  // Dorsal fin
  ctx.fillStyle = "rgba(224,154,46,0.8)";
  ctx.beginPath();
  ctx.moveTo(-0.22 * sz, -0.5 * sz);
  ctx.quadraticCurveTo(-0.6 * sz, -0.25 * sz, -0.28 * sz, 0.05 * sz);
  ctx.quadraticCurveTo(-0.18 * sz, -0.2 * sz, -0.22 * sz, -0.5 * sz);
  ctx.closePath();
  ctx.fill();

  // Snout line
  ctx.strokeStyle = "#e09a2e";
  ctx.lineWidth = Math.max(1, sz * 0.08);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0.5 * sz, -0.78 * sz);
  ctx.lineTo(0.9 * sz, -0.72 * sz);
  ctx.stroke();

  // Coronet bumps on the crown
  ctx.fillStyle = "#e09a2e";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc((-0.05 + i * 0.12) * sz, (-1.2 - (i === 1 ? 0.08 : 0)) * sz, sz * 0.07, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eye
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.arc(0.22 * sz, -0.86 * sz, sz * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(0.25 * sz, -0.89 * sz, sz * 0.035, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Drifting jellyfish: pulsing bell, trailing tentacles, semi-transparent.
function drawJellyfish(ctx, x, y, sz, seed, tick) {
  const pulse = 0.85 + 0.15 * Math.sin(tick * 0.05 + seed);
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = "#e9d5ff";
  ctx.beginPath();
  ctx.ellipse(0, 0, sz * pulse, sz * 0.7 * pulse, 0, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = "rgba(233,213,255,0.6)";
  ctx.lineWidth = Math.max(1, sz * 0.08);
  ctx.lineCap = "round";
  for (let t = -2; t <= 2; t++) {
    const tx = t * sz * 0.28;
    ctx.beginPath();
    ctx.moveTo(tx, 0);
    for (let i = 1; i <= 4; i++) {
      const ty = i * sz * 0.35;
      const sway = Math.sin(tick * 0.06 + seed + t + i) * sz * 0.15;
      ctx.lineTo(tx + sway, ty);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// Slow ray gliding through the water column, wings flapping.
function drawRay(ctx, x, y, sz, dir, tick, seed) {
  const flap = Math.sin(tick * 0.05 + seed) * sz * 0.3;
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  ctx.fillStyle = "#7dd3fc";
  ctx.beginPath();
  ctx.moveTo(0, -sz * 0.15);
  ctx.quadraticCurveTo(-sz * 0.6, -sz * 0.9 - flap, -sz * 1.5, -sz * 0.1);
  ctx.quadraticCurveTo(-sz * 0.5, sz * 0.15, 0, sz * 0.05);
  ctx.quadraticCurveTo(sz * 0.5, sz * 0.15, sz * 1.5, -sz * 0.1);
  ctx.quadraticCurveTo(sz * 0.6, -sz * 0.9 + flap, 0, -sz * 0.15);
  ctx.fill();
  // whip tail
  ctx.strokeStyle = "#7dd3fc";
  ctx.lineWidth = Math.max(1, sz * 0.06);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(sz * 0.8, sz * 0.3, sz * 1.9, sz * 0.15);
  ctx.stroke();
  ctx.restore();
}

// ── Main painter ──────────────────────────────────────────────────────────────

export function drawReef(ctx, w, h, stageIdx, tick) {
  const idx = Math.max(0, Math.min(3, stageIdx));
  const cfg = STAGE[idx];
  const bandH = Math.min(120, h * 0.22);
  const topY = h - bandH;

  ctx.save();

  // Background megafauna drifts behind everything else.
  if (cfg.mega) drawMegafauna(ctx, w, h, tick);

  // Dedicated humpback whale(s) — a denser reef gets 1-2 drifting independently.
  for (let wh = 0; wh < (cfg.whales || 0); wh++) {
    drawHumpbackWhale(ctx, w, h, tick, wh * 17.3 + 4);
  }

  // Schooling fish roam the water column above the reef (stage-gated count).
  for (let f = 0; f < cfg.fishes; f++) {
    const fseed = f * 4.13 + 1;
    const dir = rand(fseed) < 0.5 ? 1 : -1;
    const speed = 0.4 + rand(fseed * 2) * 0.7;
    const sz = 5 + rand(fseed * 3) * 5;
    const span = w + 120;
    // NOTE: `dir` must only pick which side baseX is measured from below — folding
    // it into this term made left-moving fish's baseX go deeply negative, and JS's
    // `%` doesn't wrap negatives the way this code assumed, so they sat parked
    // off-screen almost permanently. Every fish looked like it swam rightward.
    const baseX = (tick * speed + rand(fseed) * span) % span;
    const x = dir > 0 ? baseX - 60 : span - baseX - 60;
    const y = h * 0.22 + rand(fseed * 5) * (h * 0.45) + Math.sin(tick * 0.03 + f) * 6;
    drawFish(ctx, x, y, sz, FISH_COLORS[f % FISH_COLORS.length], dir, tick, fseed);
  }

  // Sand band
  const sand = ctx.createLinearGradient(0, topY, 0, h);
  sand.addColorStop(0, "rgba(40, 60, 80, 0)");
  sand.addColorStop(0.45, "rgba(120, 110, 85, 0.45)");
  sand.addColorStop(1, "rgba(150, 135, 100, 0.78)");
  ctx.fillStyle = sand;
  ctx.beginPath();
  ctx.moveTo(0, topY + 12);
  for (let xi = 0; xi <= w; xi += 16) {
    ctx.lineTo(xi, topY + 12 + Math.sin(xi / 80 + 1.3) * 6);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  const baseY = h - bandH * 0.3;

  // Kelp stands behind the coral.
  for (let k = 0; k < cfg.kelp; k++) {
    const kx = ((k + 0.5) / cfg.kelp) * w + (rand(k * 6.1) - 0.5) * 60;
    drawKelp(ctx, kx, baseY + 4, bandH * (0.7 + rand(k * 2.2) * 0.5), k * 3.7, tick);
  }

  // Coral / rock clumps — denser and more varied at higher stages. Slots are
  // closely spaced; `reveal` decides how many become living coral (vs bare rock).
  const slots = Math.max(8, Math.floor(w / 60));
  for (let i = 0; i < slots; i++) {
    const jitter = (rand(i * 1.7) - 0.5) * (w / slots) * 0.6;
    const x = ((i + 0.5) / slots) * w + jitter;
    const yOff = rand(i) * 8;
    if (rand(i * 3.7) < cfg.reveal) {
      const pal = CORAL_PALETTES[Math.floor(rand(i * 2.3) * CORAL_PALETTES.length)];
      const type = CORAL_TYPES[Math.floor(rand(i * 5.9) * CORAL_TYPES.length)];
      const sz = (8 + rand(i * 2.9) * 8) * (0.7 + cfg.sizeMax * 0.5);
      type(ctx, x, baseY + yOff, sz, i + 1, tick, pal);
      // Thriving reefs get small filler corals tucked between the big ones.
      if (idx === 3 && rand(i * 8.8) < 0.6) {
        const fp = CORAL_PALETTES[Math.floor(rand(i * 7.1) * CORAL_PALETTES.length)];
        coralBranching(ctx, x + (rand(i * 9) - 0.5) * 26, baseY + 6, 5 + rand(i) * 4, i * 13 + 2, tick, fp);
      }
    } else {
      drawRock(ctx, x, baseY + yOff, (7 + rand(i * 2.9) * 5) * 0.8);
    }
  }

  // Anemones scattered on the seabed.
  for (let a = 0; a < cfg.anemones; a++) {
    const ax = ((a + 0.3) / cfg.anemones) * w + (rand(a * 4.4) - 0.5) * 50;
    drawAnemone(ctx, ax, baseY + 6, 8 + rand(a * 2) * 5, a * 6.6, tick);
  }

  // Seahorses hover over the reef once it is growing/thriving (decorative).
  for (let sh = 0; sh < (cfg.seahorses || 0); sh++) {
    const shx = ((sh + 0.5) / Math.max(1, cfg.seahorses)) * w + (rand(sh * 12.7) - 0.5) * 110;
    const shy = baseY - bandH * 0.55 - rand(sh * 4.2) * 36;
    drawSeahorse(ctx, shx, shy, 12 + rand(sh * 2) * 5, sh * 5.3 + 1, tick);
  }

  // Jellyfish drift slowly through the upper water column once the reef is growing.
  for (let j = 0; j < (cfg.jellies || 0); j++) {
    const jseed = j * 8.4 + 3;
    const jx = ((j + 0.5) / Math.max(1, cfg.jellies)) * w + Math.sin(tick * 0.008 + jseed) * 40;
    const jy = h * 0.15 + rand(jseed * 3) * (h * 0.3);
    drawJellyfish(ctx, jx, jy, 10 + rand(jseed) * 6, jseed, tick);
  }

  // A ray glides slowly through the water on a thriving reef.
  for (let r = 0; r < (cfg.rays || 0); r++) {
    const rseed = r * 6.2 + 5;
    const dir = rand(rseed) < 0.5 ? 1 : -1;
    const span = w + 260;
    const rx = dir > 0 ? ((tick * 0.15) % span) - 130 : span - (((tick * 0.15) % span)) - 130;
    const ry = h * 0.28 + Math.sin(tick * 0.012 + rseed) * 20;
    drawRay(ctx, rx, ry, 22 + rand(rseed) * 6, dir, tick, rseed);
  }

  // Small static life on the sand.
  for (let s = 0; s < cfg.shells; s++) {
    const sx = ((s + 0.6) / cfg.shells) * w + (rand(s * 3.3) - 0.5) * 60;
    drawShell(ctx, sx, h - bandH * 0.12, 4 + rand(s * 2) * 3, s * 5.5);
  }
  for (let st = 0; st < cfg.starfish; st++) {
    const sx = ((st + 0.4) / Math.max(1, cfg.starfish)) * w + (rand(st * 7.7) - 0.5) * 80;
    drawStarfish(ctx, sx, h - bandH * 0.16, 7 + rand(st * 2) * 3, st * 9.1);
  }
  for (let c = 0; c < cfg.crabs; c++) {
    const cx = ((c + 0.5) / Math.max(1, cfg.crabs)) * w + (rand(c * 11.3) - 0.5) * 100;
    drawCrab(ctx, cx, h - bandH * 0.14, 9 + rand(c * 2) * 3, tick + c * 40);
  }
  for (let cl = 0; cl < (cfg.clams || 0); cl++) {
    const clx = ((cl + 0.5) / Math.max(1, cfg.clams)) * w + (rand(cl * 9.9) - 0.5) * 90;
    drawClamCreature(ctx, clx, h - bandH * 0.1, 7 + rand(cl * 3) * 3, cl * 4.4 + 2, tick);
  }

  // Bubble columns rise from a thriving reef.
  if (idx >= 2) {
    const cols = idx === 3 ? 4 : 2;
    for (let bcol = 0; bcol < cols; bcol++) {
      drawBubbleColumn(ctx, ((bcol + 0.5) / cols) * w + 20, h, baseY, tick, bcol + 1);
    }
  }

  ctx.restore();
}

export default drawReef;
