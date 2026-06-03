import { useEffect, useRef, useState, useCallback } from "react";
import { ORGANISMS, monogramOf } from "../data/organisms.js";
import { GameState } from "../logic/gameState.js";
import { MutationTracker } from "../logic/mutation.js";
import { getReefStage } from "../data/progression.js";
import InfoCard from "../components/InfoCard.jsx";
import HUD from "../components/HUD.jsx";
import "./Level1Scene.css";

// ── Canvas constants ──────────────────────────────────────────────────────────
const PLAYER_RADIUS = 22;
const PLAYER_SPEED = 3.2;
const ORG_RADIUS_BASE = 24;
const CAPTURE_DIST = 70;   // pixels — proximity for keyboard capture
const ORBIT_COUNT = 8;     // drift organisms to show at once (mix of SEACHYMP + distractors)

// The complete set of SEACHYMP targets that must be correctly identified
// to complete the patrol (all isSeachymp organisms, including the bonus).
const SEACHYMP_TARGET_IDS = ORGANISMS
  .filter((o) => o.isSeachymp)
  .map((o) => o.id);

// Mix of SEACHYMP + distractor organisms for Level 1 pool
const LEVEL1_POOL = [
  ...ORGANISMS.filter((o) => o.isSeachymp).slice(0, 8), // core SEACHYMP
  ORGANISMS.find((o) => o.id === "klebsiella_aerogenes"),  // bonus
  ...ORGANISMS.filter((o) => !o.isSeachymp),              // distractors
].filter(Boolean);

function randomOrganisms(canvasW, canvasH) {
  const pool = [...LEVEL1_POOL];
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, ORBIT_COUNT).map((org, i) => ({
    ...org,
    x: 80 + Math.random() * (canvasW - 160),
    y: 80 + Math.random() * (canvasH - 160),
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    bobOffset: Math.random() * Math.PI * 2,
    captureAnim: 0,
    id_instance: `${org.id}_${i}`,
    mutated: false,
  }));
}

// ── Colored-shape placeholder art renderer ────────────────────────────────────
// Uses organism.color and organism.name initial(s) — no emoji.
// Real SVG art can be swapped in later via organism.artToken.
function drawOrganism(ctx, org, x, y, radius, mutated) {
  const col = mutated ? darkenHex(org.color, 0.45) : org.color;
  const r = mutated ? radius * 1.2 : radius;

  // Shadow / glow
  ctx.save();
  ctx.shadowColor = mutated ? "#ef4444" : col;
  ctx.shadowBlur = mutated ? 18 : 10;

  // Body circle (colored shape)
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
      const inner = r + 4;
      const outer = r + 10;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
      ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Monogram label (1–2 chars derived from name — no emoji)
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
}

function drawPlayer(ctx, chymp, x, y, _facingRight) {
  const r = PLAYER_RADIUS;
  const color = chymp?.color || "#38b2e8";
  // Monogram from chymp name
  const mono = chymp?.name ? chymp.name.slice(0, 2).toUpperCase() : "CH";

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;

  // Body circle
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color + "55";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.restore();

  // Monogram
  ctx.save();
  ctx.font = `bold ${Math.round(r * 0.8)}px 'Segoe UI', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.fillText(mono, x, y);
  ctx.restore();
}

// ── Ocean background painter ──────────────────────────────────────────────────
function drawOcean(ctx, w, h, tick) {
  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#0c1445");
  grad.addColorStop(0.5, "#0d3b6e");
  grad.addColorStop(1, "#1a6fa0");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Light rays
  ctx.save();
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 5; i++) {
    const rx = (w * 0.1) + i * (w * 0.2);
    const spread = 40 + i * 10;
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.lineTo(rx - spread, h);
    ctx.lineTo(rx + spread, h);
    ctx.closePath();
    ctx.fillStyle = "#b3e5fc";
    ctx.fill();
  }
  ctx.restore();

  // Subtle wave lines at top
  ctx.save();
  ctx.strokeStyle = "rgba(56, 178, 232, 0.15)";
  ctx.lineWidth = 1;
  for (let row = 0; row < 3; row++) {
    ctx.beginPath();
    const yBase = 20 + row * 14;
    for (let xi = 0; xi <= w; xi += 4) {
      const y = yBase + Math.sin((xi / 60) + tick * 0.02 + row) * 4;
      if (xi === 0) ctx.moveTo(xi, y);
      else ctx.lineTo(xi, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// ── Darken hex helper ─────────────────────────────────────────────────────────
function darkenHex(hex, amount) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((n & 0xff) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Level1Scene({ chymp, onMenu }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null); // mutable game state, not React state
  const rafRef = useRef(null);
  const trackerRef = useRef(new MutationTracker());

  const [capturedOrg, setCapturedOrg] = useState(null);   // info card open
  const [mutationBanner, setMutationBanner] = useState(null); // banner text
  const [identified, setIdentified] = useState(() => GameState.getProgress().identifiedCount);
  const [reefStage, setReefStage] = useState(() => getReefStage(GameState.getProgress().identifiedCount));
  // Track which SEACHYMP target ids have been correctly identified this patrol
  const [identifiedTargets, setIdentifiedTargets] = useState(
    () => GameState.getIdentifiedTargets()
  );
  const [patrolComplete, setPatrolComplete] = useState(false);
  // Pending completion: set after the completing capture is dismissed
  const pendingCompleteRef = useRef(false);

  // ── Initialize game state ──────────────────────────────────────────────────
  function initState(w, h) {
    stateRef.current = {
      playerX: w / 2,
      playerY: h / 2,
      facingRight: true,
      organisms: randomOrganisms(w, h),
      keys: {},
      touch: { active: false, lastX: 0, lastY: 0 },
      tick: 0,
      w,
      h,
    };
  }

  // ── Game loop ──────────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;

    s.tick++;

    // Player movement
    let dx = 0, dy = 0;
    if (s.keys["ArrowLeft"] || s.keys["a"] || s.keys["A"]) dx -= 1;
    if (s.keys["ArrowRight"] || s.keys["d"] || s.keys["D"]) dx += 1;
    if (s.keys["ArrowUp"] || s.keys["w"] || s.keys["W"]) dy -= 1;
    if (s.keys["ArrowDown"] || s.keys["s"] || s.keys["S"]) dy += 1;

    // Touch drag
    if (s.touch.active) {
      dx = (s.touch.targetX - s.playerX) / 60;
      dy = (s.touch.targetY - s.playerY) / 60;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 1) { dx /= len; dy /= len; }
    }

    // Normalize diagonal
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      dx = (dx / len) * PLAYER_SPEED;
      dy = (dy / len) * PLAYER_SPEED;
      if (dx > 0) s.facingRight = true;
      if (dx < 0) s.facingRight = false;
    }

    s.playerX = Math.max(PLAYER_RADIUS, Math.min(s.w - PLAYER_RADIUS, s.playerX + dx));
    s.playerY = Math.max(PLAYER_RADIUS, Math.min(s.h - PLAYER_RADIUS, s.playerY + dy));

    // Drift organisms
    s.organisms.forEach((org) => {
      org.x += org.vx;
      org.y += org.vy;
      // Gentle bob
      org.y += Math.sin(s.tick * 0.025 + org.bobOffset) * 0.3;
      // Wrap around edges
      const margin = ORG_RADIUS_BASE + 10;
      if (org.x < -margin) org.x = s.w + margin;
      if (org.x > s.w + margin) org.x = -margin;
      if (org.y < -margin) org.y = s.h + margin;
      if (org.y > s.h + margin) org.y = -margin;
    });

    // Draw
    drawOcean(ctx, s.w, s.h, s.tick);
    s.organisms.forEach((org) => {
      const mutated = trackerRef.current.isMutated(org.id);
      drawOrganism(ctx, org, org.x, org.y, ORG_RADIUS_BASE, mutated);
    });
    drawPlayer(ctx, chymp, s.playerX, s.playerY, s.facingRight);

    rafRef.current = requestAnimationFrame(loop);
  }, [chymp]);

  // ── Canvas resize handler ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      canvas.width = w;
      canvas.height = h;
      if (!stateRef.current) {
        initState(w, h);
      } else {
        stateRef.current.w = w;
        stateRef.current.h = h;
      }
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Start loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  // ── Keyboard input ────────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e) {
      if (!stateRef.current) return;
      stateRef.current.keys[e.key] = true;

      // Capture key
      if ((e.key === " " || e.key === "e" || e.key === "E") && !capturedOrg) {
        e.preventDefault();
        tryCapture();
      }
      if (e.key === "Escape") {
        setCapturedOrg(null);
      }
    }
    function onKeyUp(e) {
      if (!stateRef.current) return;
      stateRef.current.keys[e.key] = false;
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [capturedOrg]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mouse/touch events ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] : e;
      return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height),
      };
    }

    function onClick(e) {
      if (capturedOrg) return;
      const pos = getPos(e);
      // Check if clicked on an organism
      const s = stateRef.current;
      if (!s) return;
      const hit = s.organisms.find((org) => {
        const dx = org.x - pos.x;
        const dy = org.y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) <= ORG_RADIUS_BASE + 14;
      });
      if (hit) {
        setCapturedOrg(hit);
      }
    }

    function onTouchStart(e) {
      e.preventDefault();
      const pos = getPos(e);
      if (!stateRef.current) return;
      // Check organism hit first
      const s = stateRef.current;
      const hit = s.organisms.find((org) => {
        const dx = org.x - pos.x;
        const dy = org.y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) <= ORG_RADIUS_BASE + 20;
      });
      if (hit && !capturedOrg) {
        setCapturedOrg(hit);
        return;
      }
      // Otherwise start swimming
      s.touch.active = true;
      s.touch.targetX = pos.x;
      s.touch.targetY = pos.y;
    }

    function onTouchMove(e) {
      e.preventDefault();
      const pos = getPos(e);
      if (!stateRef.current) return;
      stateRef.current.touch.active = true;
      stateRef.current.touch.targetX = pos.x;
      stateRef.current.touch.targetY = pos.y;
    }

    function onTouchEnd() {
      if (stateRef.current) stateRef.current.touch.active = false;
    }

    canvas.addEventListener("click", onClick);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    return () => {
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [capturedOrg]);

  // ── Keyboard capture helper ───────────────────────────────────────────────
  function tryCapture() {
    const s = stateRef.current;
    if (!s) return;
    const nearest = s.organisms.reduce((best, org) => {
      const dx = org.x - s.playerX;
      const dy = org.y - s.playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CAPTURE_DIST && (!best || dist < best.dist)) return { org, dist };
      return best;
    }, null);
    if (nearest) setCapturedOrg(nearest.org);
  }

  // ── Info card decision handler ────────────────────────────────────────────
  function handleDecision(org, decision) {
    // decision: "identify" (claims SEACHYMP) | "ignore" (claims non-target)
    const correct =
      (decision === "identify" && org.isSeachymp) ||
      (decision === "ignore" && !org.isSeachymp);

    if (correct) {
      GameState.addToEncyclopedia(org.id);
      const prog = org.isSeachymp
        ? GameState.incrementIdentified()
        : GameState.incrementIgnored();
      setIdentified(prog.identifiedCount);
      setReefStage(getReefStage(prog.identifiedCount));

      // Badge checks
      if (prog.identifiedCount === 1) GameState.awardBadge("ampC_apprentice");
      if (org.riskTier === "high") GameState.awardBadge("cefepime_commander");
      if (prog.ignoredCount >= 3) GameState.awardBadge("stewardship_sailor");

      // Track patrol completion for SEACHYMP targets
      if (org.isSeachymp) {
        const newTargets = GameState.addIdentifiedTarget(org.id);
        setIdentifiedTargets(new Set(newTargets));
        // Check if all targets have been identified
        const allDone = SEACHYMP_TARGET_IDS.every((id) => newTargets.has(id));
        if (allDone) {
          GameState.awardBadge("master_seachymp");
          // Signal patrol complete AFTER this card is dismissed
          pendingCompleteRef.current = true;
        }
      }
    } else {
      // Incorrect handling — record against the organism TYPE (shared across instances)
      const { didMutate } = trackerRef.current.recordMisHandle(org);
      if (didMutate) {
        // TODO: sound — play mutation alarm sound
        setMutationBanner(`${org.name} has adapted — resistance selected! Switch to Cefepime.`);
        setTimeout(() => setMutationBanner(null), 5000);
      }
    }

    // Dismiss the card; then check if patrol is now complete
    setCapturedOrg(null);
    if (pendingCompleteRef.current) {
      pendingCompleteRef.current = false;
      // Small delay so the dismiss animation finishes before showing the overlay
      setTimeout(() => setPatrolComplete(true), 300);
    }
  }

  // ── Close info card without deciding ─────────────────────────────────────
  function handleClose() {
    setCapturedOrg(null);
    if (pendingCompleteRef.current) {
      pendingCompleteRef.current = false;
      setTimeout(() => setPatrolComplete(true), 300);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="level1-wrap">
      <canvas ref={canvasRef} className="level1-canvas" />

      <HUD
        chymp={chymp}
        identified={identified}
        reefStage={reefStage}
        onMenu={onMenu}
      />

      {mutationBanner && (
        <div className="mutation-banner" role="alert">
          {mutationBanner}
        </div>
      )}

      {capturedOrg && (
        <InfoCard
          org={capturedOrg}
          mutated={trackerRef.current.isMutated(capturedOrg.id)}
          onDecide={handleDecision}
          onClose={handleClose}
          alreadyInEncyclopedia={GameState.hasInEncyclopedia(capturedOrg.id)}
        />
      )}

      {patrolComplete && (
        <PatrolCompleteOverlay
          onMenu={onMenu}
          onViewReef={() => onMenu("reef")}
          onViewEncyclopedia={() => onMenu("encyclopedia")}
        />
      )}
    </div>
  );
}

// ── Patrol Complete Overlay ───────────────────────────────────────────────────
function PatrolCompleteOverlay({ onMenu }) {
  return (
    <div className="patrol-overlay" role="dialog" aria-modal="true" aria-label="Reef Patrol Complete">
      <div className="patrol-card info-card">
        <div className="patrol-header">
          <div className="patrol-icon" aria-hidden="true" />
          <h2 className="patrol-title">Reef Patrol Complete</h2>
        </div>
        <div className="patrol-body">
          <p className="patrol-message">
            Outstanding work. You identified every SEACHYMP target organism — including
            the bonus Klebsiella aerogenes. The reef thanks you.
          </p>
          <p className="patrol-sub">
            Your knowledge of AmpC producers is now logged in the encyclopedia. Keep
            revisiting to reinforce the patterns.
          </p>
        </div>
        <div className="patrol-actions">
          <button className="btn-primary patrol-btn" onClick={onMenu}>
            Return to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
