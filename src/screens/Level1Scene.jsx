import { useEffect, useRef, useState, useCallback } from "react";
import { ORGANISMS } from "../data/organisms.js";
import { GameState } from "../logic/gameState.js";
import { MutationTracker } from "../logic/mutation.js";
import { getReefStage, REEF_STAGES } from "../data/progression.js";
import { drawOrganism } from "../logic/organismRenderer.js";
import { drawPlayer, triggerPose, updatePoseTarget, NET_POSE_MS } from "../logic/playerRenderer.js";
import { prefersReducedMotion } from "../logic/organismSprites.js";
import { drawReef, triggerReefBloom, isReefBloomDone } from "../logic/reefRenderer.js";
import { drawOceanLife } from "../logic/oceanLife.js";
import InfoCard from "../components/InfoCard.jsx";
import HUD from "../components/HUD.jsx";
import "./Level1Scene.css";

// ── Canvas constants ──────────────────────────────────────────────────────────
const PLAYER_RADIUS = 22;
const PLAYER_SPEED = 3.2;
const ORG_RADIUS_BASE = 24;
const CAPTURE_DIST = 70;   // pixels — proximity for keyboard capture
const DISTRACTOR_COUNT = 4; // random non-SEACHYMP organisms mixed in each round

// The complete set of SEACHYMP targets that must be correctly identified
// to complete the patrol (all isSeachymp organisms, including the bonus).
const SEACHYMP_ORGANISMS = ORGANISMS.filter((o) => o.isSeachymp);
const SEACHYMP_TARGET_IDS = SEACHYMP_ORGANISMS.map((o) => o.id);
const DISTRACTOR_POOL = ORGANISMS.filter((o) => !o.isSeachymp);

// Reef-stage index (0 barren … 3 thriving) from the identified count.
const reefStageIdxFor = (count) =>
  Math.max(0, REEF_STAGES.findIndex((s) => s.id === getReefStage(count).id));

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomOrganisms(canvasW, canvasH) {
  // Every round contains ALL 9 SEACHYMP targets plus a few random distractors,
  // so a single playthrough can identify them all and complete the patrol.
  const distractors = shuffle(DISTRACTOR_POOL).slice(0, DISTRACTOR_COUNT);
  const chosen = shuffle([...SEACHYMP_ORGANISMS, ...distractors]);
  return chosen.map((org, i) => ({
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

// ── Ocean background painter ──────────────────────────────────────────────────
const OCEAN_LIFE_PALETTE = {
  caustic: "#8ecfff",
  plankton: "#bfe8ff",
  bubble: "#cdeeff",
  fish: ["#fbbf24", "#fb7185", "#60a5fa"],
};

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

  drawOceanLife(ctx, w, h, tick, OCEAN_LIFE_PALETTE);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Level1Scene({ chymp, onMenu }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null); // mutable game state, not React state
  const rafRef = useRef(null);
  const loopRef = useRef(null); // holds latest loop fn so callback can self-schedule
  const trackerRef = useRef(new MutationTracker());
  const captureTimerRef = useRef(null); // delays the info card so the net throw is visible
  const roundIdentifiedRef = useRef(new Set()); // SEACHYMP ids identified THIS round

  const [capturedOrg, setCapturedOrg] = useState(null);   // info card open
  const [capturedOrgMutated, setCapturedOrgMutated] = useState(false); // mutated snapshot at capture time
  const [mutationBanner, setMutationBanner] = useState(null); // banner text
  const [identified, setIdentified] = useState(() => GameState.getProgress().identifiedCount);
  const [reefStage, setReefStage] = useState(() => getReefStage(GameState.getProgress().identifiedCount));
  // Track which SEACHYMP target ids have been correctly identified this patrol
  // (stored via GameState; no React re-render needed for this set)
  const identifiedTargetsRef = useRef(GameState.getIdentifiedTargets());
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
      pose: null, // active Captain pose (the capture net) — see playerRenderer.js
      reefStageIdx: reefStageIdxFor(GameState.getProgress().identifiedCount),
      reefBloom: null, // reef stage-advance flourish — see reefRenderer.js
      w,
      h,
    };
  }

  // ── Game loop ──────────────────────────────────────────────────────────────
  // loopRef holds the latest loop fn so the callback can self-schedule without
  // capturing itself in a closure (avoids react-hooks/immutability error).
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

    // Drift organisms. A netted creature is pinned in place so the net that
    // lands on it stays draped over it instead of sliding off.
    s.organisms.forEach((org) => {
      if (org._netted) return;
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

    // Keep an in-flight net aimed at its creature (a no-op once it has landed,
    // since netted creatures stop drifting).
    updatePoseTarget(s, s.organisms);

    // Draw
    drawOcean(ctx, s.w, s.h, s.tick);
    if (isReefBloomDone(s)) s.reefBloom = null;
    drawReef(ctx, s.w, s.h, s.reefStageIdx, s.tick, s.reefBloom);
    s.organisms.forEach((org) => {
      const mutated = trackerRef.current.isMutated(org.id);
      drawOrganism(ctx, org, org.x, org.y, ORG_RADIUS_BASE, mutated);
    });
    // Drawn last so the thrown net lands on top of the creature it catches.
    drawPlayer(ctx, chymp, s.playerX, s.playerY, s.facingRight, s.pose, { tick: s.tick, vx: dx, vy: dy });

    rafRef.current = requestAnimationFrame(loopRef.current);
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
  }, []);  

  // ── Start loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    loopRef.current = loop; // sync ref before scheduling
    rafRef.current = requestAnimationFrame(loopRef.current);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  // Keep the canvas reef in sync with the identified count (drives stage 0–3).
  useEffect(() => {
    const s = stateRef.current;
    if (!s) return;
    const next = reefStageIdxFor(identified);
    if (next > s.reefStageIdx) triggerReefBloom(s);
    s.reefStageIdx = next;
  }, [identified]);

  // ── Capture: throw the net, then open the info card a beat later ───────────
  const beginCapture = useCallback((org) => {
    const s = stateRef.current;
    if (!s || captureTimerRef.current) return; // ignore while a throw is in flight
    const mutated = trackerRef.current.isMutated(org.id);

    // Reduced motion: skip the throw entirely and go straight to the card.
    if (prefersReducedMotion()) {
      setCapturedOrg(org);
      setCapturedOrgMutated(mutated);
      return;
    }

    org._netted = true; // pin it so the net drapes over it, not past it
    triggerPose(s, "net", org.x, org.y, null, {
      orgInstanceId: org.id_instance,
      targetR: ORG_RADIUS_BASE,
    });
    // Hold the card back for the whole throw so the net is actually visible.
    captureTimerRef.current = setTimeout(() => {
      captureTimerRef.current = null;
      setCapturedOrg(org);
      setCapturedOrgMutated(mutated);
    }, NET_POSE_MS);
  }, []);

  // Clear any pending capture timer on unmount.
  useEffect(() => () => clearTimeout(captureTimerRef.current), []);

  // ── Keyboard capture helper ───────────────────────────────────────────────
  const tryCapture = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const nearest = s.organisms.reduce((best, org) => {
      const dx = org.x - s.playerX;
      const dy = org.y - s.playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CAPTURE_DIST && (!best || dist < best.dist)) return { org, dist };
      return best;
    }, null);
    if (nearest) beginCapture(nearest.org);
  }, [beginCapture]);

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
  }, [capturedOrg, tryCapture]);

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
      if (hit) beginCapture(hit);
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
        beginCapture(hit);
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
  }, [capturedOrg, beginCapture]);

  // ── Info card decision handler ────────────────────────────────────────────
  // Called by InfoCard when the player makes their identify/ignore choice.
  // InfoCard will stay open to show the result — it calls onClose when the
  // player dismisses. We do NOT close the card here.
  function handleDecision(org, decision) {
    // decision: "identify" (claims SEACHYMP) | "ignore" (claims non-target)
    const correct =
      (decision === "identify" && org.isSeachymp) ||
      (decision === "ignore" && !org.isSeachymp);

    if (correct) {
      // Remove the correctly-handled organism from the board (it's "caught").
      const s = stateRef.current;
      if (s) s.organisms = s.organisms.filter((o) => o.id_instance !== org.id_instance);

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

      // Track patrol completion for SEACHYMP targets — based on THIS round so a
      // returning player with saved progress still plays a full round.
      if (org.isSeachymp) {
        GameState.addIdentifiedTarget(org.id); // persisted (drives master badge)
        roundIdentifiedRef.current.add(org.id);
        identifiedTargetsRef.current = new Set(roundIdentifiedRef.current);
        const allDone = SEACHYMP_TARGET_IDS.every((id) => roundIdentifiedRef.current.has(id));
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
        setMutationBanner(`${org.name} has adapted — resistance selected! Cefepime and a carbapenem are both appropriate.`);
        setTimeout(() => setMutationBanner(null), 5000);
      }
    }
    // Card stays open — InfoCard shows post-decision result and calls onClose when done.
  }

  // ── Close info card (called when player dismisses result or × button) ─────
  function handleClose() {
    setCapturedOrg(null);
    // Release anything still pinned under a net so it resumes drifting.
    const s = stateRef.current;
    if (s) s.organisms.forEach((o) => { delete o._netted; });
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
          mutated={capturedOrgMutated}
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
