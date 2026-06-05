import { useEffect, useRef, useState, useCallback } from "react";
import { ORGANISMS, monogramOf } from "../data/organisms.js";
import { WEAPONS } from "../data/weapons.js";
import { CASES } from "../data/cases.js";
import { GameState } from "../logic/gameState.js";
import { MutationTracker } from "../logic/mutation.js";
import { getReefStage } from "../data/progression.js";
import {
  createShot,
  tickShots,
  drawShots,
  applyKillEffect,
  applyMutateFlash,
  applyPulseEffect,
  drawOrganismEffects,
} from "../logic/shotAnimation.js";
import HUD from "../components/HUD.jsx";
import "./Level3Scene.css";

// ── Canvas constants ───────────────────────────────────────────────────────────
const PLAYER_RADIUS = 22;
const PLAYER_SPEED = 3.2;
const ORG_RADIUS_BASE = 24;
const CAPTURE_DIST = 70;
const ORBIT_COUNT = 8;

// Only SEACHYMP organisms that have at least one case
const CASE_ORG_IDS = new Set(CASES.map((c) => c.organismId));
const SEACHYMP_IDS = ORGANISMS.filter((o) => o.isSeachymp).map((o) => o.id);

const LEVEL3_POOL = [
  ...ORGANISMS.filter((o) => o.isSeachymp),
  ...ORGANISMS.filter((o) => !o.isSeachymp).slice(0, 5),
];

// ── Ocean palette — Level 3 uses a deep indigo/violet twilight ────────────────
// Per-level palette convention:
//   Level 1: deep-blue (#001232 → #0d3b6e → #1a6fa0)
//   Level 2: teal/emerald (#04293a → #0a5a52 → #1a8f7a)
//   Level 3: indigo/violet twilight (#0e0730 → #2d1460 → #4c1d95)
function drawOcean(ctx, w, h, tick) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#0e0730");
  grad.addColorStop(0.5, "#2d1460");
  grad.addColorStop(1, "#4c1d95");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle volumetric beams in violet
  ctx.save();
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 5; i++) {
    const rx = (w * 0.1) + i * (w * 0.2);
    const spread = 35 + i * 8;
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.lineTo(rx - spread, h);
    ctx.lineTo(rx + spread, h);
    ctx.closePath();
    ctx.fillStyle = "#c4b5fd";
    ctx.fill();
  }
  ctx.restore();

  // Slow ripple lines in violet
  ctx.save();
  ctx.strokeStyle = "rgba(167, 139, 250, 0.12)";
  ctx.lineWidth = 1;
  for (let row = 0; row < 3; row++) {
    ctx.beginPath();
    const yBase = 20 + row * 14;
    for (let xi = 0; xi <= w; xi += 4) {
      const y = yBase + Math.sin((xi / 60) + tick * 0.018 + row * 1.2) * 4;
      if (xi === 0) ctx.moveTo(xi, y);
      else ctx.lineTo(xi, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// ── Colored-shape placeholder art (shared with Level2) ────────────────────────
function darkenHex(hex, amount) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((n & 0xff) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function drawOrganism(ctx, org, x, y, radius, mutated) {
  if (org.fading) {
    drawOrganismEffects(ctx, org, x, y, radius);
    return;
  }

  const col = mutated ? darkenHex(org.color, 0.45) : org.color;
  const r = mutated ? radius * 1.2 : radius;

  ctx.save();
  ctx.shadowColor = mutated ? "#ef4444" : col;
  ctx.shadowBlur = mutated ? 18 : 10;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = col + "44";
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = mutated ? 3 : 2;
  ctx.stroke();
  ctx.restore();

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

  const monogram = monogramOf(org);
  ctx.save();
  ctx.font = `bold ${Math.round(r * 0.75)}px 'Segoe UI', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = col;
  ctx.globalAlpha = mutated ? 0.9 : 0.8;
  ctx.fillText(monogram, x, y);
  ctx.restore();

  ctx.save();
  ctx.font = "bold 10px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = mutated ? "#ef4444" : "#e8f4ff";
  ctx.globalAlpha = 0.85;
  ctx.fillText(org.name, x, y + r + 5);
  ctx.restore();

  if (mutated) {
    ctx.save();
    ctx.font = "bold 9px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#ef4444";
    ctx.fillText("MUTATED", x, y + r + 17);
    ctx.restore();
  }

  drawOrganismEffects(ctx, org, x, y, r);
}

function drawPlayer(ctx, chymp, x, y) {
  const r = PLAYER_RADIUS;
  const color = chymp?.color || "#38b2e8";
  const mono = chymp?.name ? chymp.name.slice(0, 2).toUpperCase() : "CH";

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color + "55";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.font = `bold ${Math.round(r * 0.8)}px 'Segoe UI', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.fillText(mono, x, y);
  ctx.restore();
}

function randomOrganisms(canvasW, canvasH) {
  const pool = [...LEVEL3_POOL];
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
    id_instance: `${org.id}_${i}`,
    fading: false,
    fadeProgress: 0,
    mutateFlash: null,
    pulseProgress: null,
  }));
}

// Pick a random case for an organism id; undefined if no cases exist for it
function pickCase(orgId) {
  const matching = CASES.filter((c) => c.organismId === orgId);
  if (!matching.length) return undefined;
  return matching[Math.floor(Math.random() * matching.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// Case Card — shown after capturing an organism
// ─────────────────────────────────────────────────────────────────────────────
function CaseCard({ org, caseData, mutated, onWeaponChoice, onClose }) {
  const [result, setResult] = useState(null);

  const blurbFirst = org.blurb
    ? org.blurb.split(/\.\s+/)[0].replace(/\.$/, "") + "."
    : "";
  const artBg = (org.color || "#38b2e8") + "22";
  const monogram = monogramOf(org);

  function handleWeapon(weaponId) {
    let isCorrect;
    let heading;
    let rationale;

    if (!org.isSeachymp) {
      // Distractor: should always release
      isCorrect = false;
      heading = "Unnecessary treatment.";
      rationale =
        org.name +
        " is not an AmpC-producing SEACHYMP organism. Good stewardship = not treating colonizers or bystanders.";
    } else if (mutated && ["ceftriaxone"].includes(weaponId)) {
      isCorrect = false;
      heading = "Ineffective against mutated form.";
      rationale =
        "This organism has adapted — " +
        weaponId.replace("_", "-") +
        " is no longer effective. Switch to Cefepime or a carbapenem.";
    } else if (caseData && weaponId === caseData.correctDecision) {
      isCorrect = true;
      heading = "Correct choice for this case.";
      rationale = caseData.rationale;
    } else {
      isCorrect = false;
      const correct = WEAPONS.find((w) => w.id === caseData?.correctDecision);
      heading = "Not the best choice here.";
      rationale =
        (caseData?.rationale || "Consider the clinical context.") +
        (correct ? ` Preferred: ${correct.name}.` : "");
    }

    const r = { isCorrect, heading, rationale, weaponId };
    setResult(r);
    onWeaponChoice(org, weaponId, r, caseData);
  }

  function handleRelease() {
    let isCorrect;
    let heading;
    let rationale;

    if (!org.isSeachymp) {
      isCorrect = true;
      heading = "Good call — no treatment needed.";
      rationale =
        org.name +
        " is not an AmpC producer here. Releasing is correct — treat only what needs treating.";
    } else {
      isCorrect = false;
      heading = "This organism needed treatment.";
      rationale =
        org.name +
        " is an AmpC-producing organism that required an antibiotic for this infection.";
    }

    const r = { isCorrect, heading, rationale, weaponId: null };
    setResult(r);
    onWeaponChoice(org, null, r, caseData);
  }

  function resultClass() {
    if (!result) return "";
    if (result.isCorrect) return "l3-result--correct";
    // Release-correct for distractor
    if (result.weaponId === null && !org.isSeachymp) return "l3-result--correct";
    if (result.heading.includes("best")) return "l3-result--neutral";
    return "l3-result--incorrect";
  }

  function riskReveal() {
    if (!org.isSeachymp) {
      return <span className="l3-reveal l3-reveal--neutral">{org.name} — not an AmpC organism</span>;
    }
    if (org.bonus) {
      return <span className="l3-reveal l3-reveal--bonus">{org.name} — high-risk AmpC (bonus)</span>;
    }
    if (org.riskTier === "high") {
      return <span className="l3-reveal l3-reveal--high">{org.name} — high-risk AmpC</span>;
    }
    return <span className="l3-reveal l3-reveal--low">{org.name} — low-risk AmpC</span>;
  }

  const sourceControlMatters =
    caseData &&
    caseData.sourceControl &&
    caseData.sourceControl !== "N/A" &&
    caseData.sourceControl !== "Not applicable";

  return (
    <div className="l3-overlay" role="dialog" aria-modal="true" aria-label={`Case: ${org.name}`}>
      <div className="l3-card">
        {/* Header */}
        <div
          className="l3-header"
          style={{ borderTopColor: org.isSeachymp ? org.color : "#94a3b8" }}
        >
          <div
            className="l3-art"
            style={{ background: artBg, border: `2px solid ${org.color || "#38b2e8"}` }}
          >
            <span className="l3-art-mono" style={{ color: org.color || "#38b2e8" }}>
              {monogram}
            </span>
            {mutated && <span className="l3-mutated-tag">MUTATED</span>}
          </div>
          <div className="l3-title-block">
            <h2 className="l3-name">{org.name}</h2>
            <p className="l3-species">{org.species}</p>
          </div>
          <button className="l3-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Clinical context */}
        <div className="l3-context-block">
          <p className="l3-blurb">{blurbFirst}</p>

          {caseData && (
            <div className="l3-case-table">
              <div className="l3-case-row">
                <span className="l3-case-label">Infection:</span>
                <span className="l3-case-value">{caseData.infection}</span>
              </div>
              <div className="l3-case-row">
                <span className="l3-case-label">Source control:</span>
                <span className="l3-case-value">{caseData.sourceControl}</span>
              </div>
              <div className="l3-case-row">
                <span className="l3-case-label">Planned duration:</span>
                <span className="l3-case-value">{caseData.duration}</span>
              </div>
            </div>
          )}

          {!caseData && org.isSeachymp && (
            <div className="l3-case-table">
              <div className="l3-case-row">
                <span className="l3-case-label">Note:</span>
                <span className="l3-case-value">No case assigned. Consider release or standard therapy.</span>
              </div>
            </div>
          )}

          {mutated && (
            <div className="l3-mutation-warn">
              <strong>Mutated form.</strong> Ceftriaxone is no longer effective. Prefer Cefepime or a carbapenem.
            </div>
          )}
        </div>

        {/* Weapon selection or result */}
        {result === null ? (
          <div className="l3-weapons-section">
            <p className="l3-weapons-prompt">
              Select the best antibiotic for this clinical case — or release the organism:
            </p>
            <div className="l3-weapons-grid">
              {WEAPONS.map((w) => (
                <button
                  key={w.id}
                  className="l3-weapon-btn"
                  style={{ borderLeftColor: w.color }}
                  onClick={() => handleWeapon(w.id)}
                >
                  <div
                    className="l3-weapon-shape"
                    style={{
                      background: w.color + "22",
                      border: `1.5px solid ${w.color}`,
                      color: w.color,
                    }}
                    aria-hidden="true"
                  >
                    {w.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="l3-weapon-text">
                    <span className="l3-weapon-name">{w.name}</span>
                    <span className="l3-weapon-nick">{w.nickname}</span>
                    <span className="l3-weapon-cue">{w.cue}</span>
                  </div>
                </button>
              ))}
            </div>
            <button className="l3-release-btn" onClick={handleRelease}>
              Release — no antibiotic needed for this case
            </button>
          </div>
        ) : (
          <div className={`l3-result ${resultClass()}`}>
            <p className="l3-result-heading">{result.heading}</p>
            <p className="l3-result-rationale">{result.rationale}</p>
            {sourceControlMatters && result.isCorrect && (
              <p className="l3-result-rationale" style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
                Source control was a key factor in this case.
              </p>
            )}
            <p className="l3-result-reveal">{riskReveal()}</p>
            <button className="btn-secondary l3-continue-btn" onClick={onClose}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Level 3 Complete Overlay ──────────────────────────────────────────────────
function Level3CompleteOverlay({ onMenu }) {
  return (
    <div className="l3-complete-overlay" role="dialog" aria-modal="true" aria-label="Stewardship Challenge Complete">
      <div className="l3-complete-card">
        <div className="l3-complete-header" style={{ borderTopColor: "#8b5cf6" }}>
          <h2 className="l3-complete-title">Stewardship Challenge Complete</h2>
        </div>
        <div className="l3-complete-body">
          <p>
            You have correctly resolved a case for every SEACHYMP organism type.
          </p>
          <p>
            Key lesson: the organism alone does not dictate therapy. Infection type, source
            control, and planned duration all shift which antibiotic is safest.
          </p>
          <p>
            Keep practicing — context-driven prescribing is the core of good stewardship.
          </p>
        </div>
        <div className="l3-complete-actions">
          <button className="btn-primary" onClick={onMenu}>Return to Menu</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Level3Scene({ chymp, onMenu }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const trackerRef = useRef(new MutationTracker());
  const reducedMotionRef = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  // capturedOrg + activeCase are both set together when player clicks an organism
  const [capturedOrg, setCapturedOrg] = useState(null);
  const [activeCase, setActiveCase] = useState(null);
  // pendingResult is set right after weapon choice, before card closes, for animation
  const pendingResultRef = useRef(null);
  const [animatingShot, setAnimatingShot] = useState(false);
  // Ref mirror so the loop closure doesn't need animatingShot in its dep array
  const animatingShotRef = useRef(false);

  const [mutationBanner, setMutationBanner] = useState(null);
  const [identified, setIdentified] = useState(
    () => GameState.getProgress().identifiedCount
  );
  const [reefStage, setReefStage] = useState(
    () => getReefStage(GameState.getProgress().identifiedCount)
  );
  const [missionComplete, setMissionComplete] = useState(false);
  const pendingCompleteRef = useRef(false);

  // Which SEACHYMP types have been correctly resolved in L3 this session + ever
  const resolvedRef = useRef(GameState.getL3Resolved());

  function initState(w, h) {
    stateRef.current = {
      playerX: w / 2,
      playerY: h / 2,
      facingRight: true,
      organisms: randomOrganisms(w, h),
      keys: {},
      touch: { active: false, targetX: 0, targetY: 0 },
      tick: 0,
      w,
      h,
      shots: [],
    };
  }

  // After animation completes: reveal the card result and apply outcome to canvas
  function applyAnimationOutcome(shot) {
    const s = stateRef.current;
    if (!s) return;
    const org = s.organisms.find((o) => o.id_instance === shot.orgInstanceId);

    if (shot.outcome === "kill" && org) {
      org.fading = true;
      org.fadeProgress = 0;
    } else if (shot.outcome === "mutate" && org) {
      org.mutateFlash = 0;
    } else if (shot.outcome === "pulse" && org) {
      org.pulseProgress = 0;
    }
    // Reveal the card result
    animatingShotRef.current = false;
    setAnimatingShot(false);
  }

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;

    s.tick++;

    // Movement — paused during projectile animation (use ref to avoid loop restart)
    let dx = 0, dy = 0;
    if (!animatingShotRef.current) {
      if (s.keys["ArrowLeft"] || s.keys["a"] || s.keys["A"]) dx -= 1;
      if (s.keys["ArrowRight"] || s.keys["d"] || s.keys["D"]) dx += 1;
      if (s.keys["ArrowUp"] || s.keys["w"] || s.keys["W"]) dy -= 1;
      if (s.keys["ArrowDown"] || s.keys["s"] || s.keys["S"]) dy += 1;
    }

    if (s.touch?.active && !animatingShotRef.current) {
      dx = (s.touch.targetX - s.playerX) / 60;
      dy = (s.touch.targetY - s.playerY) / 60;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 1) { dx /= len; dy /= len; }
    }

    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      dx = (dx / len) * PLAYER_SPEED;
      dy = (dy / len) * PLAYER_SPEED;
      if (dx > 0) s.facingRight = true;
      if (dx < 0) s.facingRight = false;
    }

    s.playerX = Math.max(PLAYER_RADIUS, Math.min(s.w - PLAYER_RADIUS, s.playerX + dx));
    s.playerY = Math.max(PLAYER_RADIUS, Math.min(s.h - PLAYER_RADIUS, s.playerY + dy));

    // Advance organism drift + fading/flash effects
    s.organisms = s.organisms.filter((org) => {
      if (org.fading) {
        const done = applyKillEffect(org);
        return !done; // remove when fade completes
      }
      return true;
    });

    s.organisms.forEach((org) => {
      if (!org.fading) {
        org.x += org.vx;
        org.y += org.vy;
        org.y += Math.sin(s.tick * 0.025 + org.bobOffset) * 0.3;
        const margin = ORG_RADIUS_BASE + 10;
        if (org.x < -margin) org.x = s.w + margin;
        if (org.x > s.w + margin) org.x = -margin;
        if (org.y < -margin) org.y = s.h + margin;
        if (org.y > s.h + margin) org.y = -margin;
      }

      // Resolve flash/pulse effects
      if (org.mutateFlash != null) {
        const done = applyMutateFlash(org);
        if (done) org.mutateFlash = null;
      }
      if (org.pulseProgress != null) {
        const done = applyPulseEffect(org);
        if (done) org.pulseProgress = null;
      }
    });

    // Advance shots; apply outcomes when they land
    if (s.shots && s.shots.length > 0) {
      const completed = tickShots(s.shots);
      for (const shot of completed) {
        applyAnimationOutcome(shot);
      }
      // Remove completed shots
      s.shots = s.shots.filter((sh) => !sh.done);
    }

    // Draw
    drawOcean(ctx, s.w, s.h, s.tick);
    s.organisms.forEach((org) => {
      const mutated = trackerRef.current.isMutated(org.id);
      drawOrganism(ctx, org, org.x, org.y, ORG_RADIUS_BASE, mutated);
    });
    if (s.shots) drawShots(ctx, s.shots);
    drawPlayer(ctx, chymp, s.playerX, s.playerY);

    rafRef.current = requestAnimationFrame(loop);
  }, [chymp]);  

  // ── Canvas resize ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function resize() {
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      canvas.width = w;
      canvas.height = h;
      if (!stateRef.current) initState(w, h);
      else { stateRef.current.w = w; stateRef.current.h = h; }
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);  

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  // ── Keyboard input ────────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e) {
      if (!stateRef.current) return;
      stateRef.current.keys[e.key] = true;
      if ((e.key === " " || e.key === "e" || e.key === "E") && !capturedOrg && !animatingShot) {
        e.preventDefault();
        tryCapture();
      }
      if (e.key === "Escape") setCapturedOrg(null);
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
  }, [capturedOrg, animatingShot]);  

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
      if (capturedOrg || animatingShot) return;
      const pos = getPos(e);
      const s = stateRef.current;
      if (!s) return;
      const hit = s.organisms.find((org) => {
        const ddx = org.x - pos.x;
        const ddy = org.y - pos.y;
        return Math.sqrt(ddx * ddx + ddy * ddy) <= ORG_RADIUS_BASE + 14;
      });
      if (hit) {
        const cs = pickCase(hit.id);
        setCapturedOrg(hit);
        setActiveCase(cs || null);
      }
    }

    function onTouchStart(e) {
      e.preventDefault();
      const pos = getPos(e);
      const s = stateRef.current;
      if (!s) return;
      const hit = s.organisms.find((org) => {
        const ddx = org.x - pos.x;
        const ddy = org.y - pos.y;
        return Math.sqrt(ddx * ddx + ddy * ddy) <= ORG_RADIUS_BASE + 20;
      });
      if (hit && !capturedOrg && !animatingShot) {
        const cs = pickCase(hit.id);
        setCapturedOrg(hit);
        setActiveCase(cs || null);
        return;
      }
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
  }, [capturedOrg, animatingShot]);

  function tryCapture() {
    const s = stateRef.current;
    if (!s) return;
    const nearest = s.organisms.reduce((best, org) => {
      const ddx = org.x - s.playerX;
      const ddy = org.y - s.playerY;
      const dist = Math.sqrt(ddx * ddx + ddy * ddy);
      if (dist < CAPTURE_DIST && (!best || dist < best.dist)) return { org, dist };
      return best;
    }, null);
    if (nearest) {
      const cs = pickCase(nearest.org.id);
      setCapturedOrg(nearest.org);
      setActiveCase(cs || null);
    }
  }

  // ── Weapon choice result handler ──────────────────────────────────────────
  function handleWeaponChoice(org, weaponId, result, caseData) {
    const s = stateRef.current;
    if (!s) return;

    // Determine animation outcome
    const inappropriateCeftriaxone =
      org.isSeachymp && org.riskTier === "high" && weaponId === "ceftriaxone" && !result.isCorrect;

    let outcome;
    if (result.isCorrect && org.isSeachymp) outcome = "kill";
    else if (inappropriateCeftriaxone) outcome = "mutate";
    else outcome = "pulse";

    // Find the organism's canvas position
    const canvasOrg = s.organisms.find((o) => o.id_instance === org.id_instance);

    // Store pending result for after animation
    pendingResultRef.current = { org, weaponId, result, caseData, outcome };

    // Hide card during animation, then restore with result
    if (!reducedMotionRef.current && canvasOrg) {
      animatingShotRef.current = true;
      setAnimatingShot(true);
      // Fire projectile
      const weapon = WEAPONS.find((w) => w.id === weaponId) || { color: "#94a3b8" };
      createShot(s.shots, {
        fromX: s.playerX,
        fromY: s.playerY,
        toX: canvasOrg.x,
        toY: canvasOrg.y,
        color: weapon.color,
        outcome,
        orgInstanceId: org.id_instance,
        reducedMotion: false,
      });
      // Re-show card after animation (loop fires applyAnimationOutcome which calls setAnimatingShot(false))
    } else {
      // Reduced motion or no position: skip animation, apply immediately
      if (canvasOrg) {
        if (outcome === "kill") { canvasOrg.fading = true; canvasOrg.fadeProgress = 0; }
        else if (outcome === "mutate") { canvasOrg.mutateFlash = 0; }
        else { canvasOrg.pulseProgress = 0; }
      }
    }

    // Apply game-state updates
    if (result.isCorrect) {
      GameState.addToEncyclopedia(org.id);
      const prog = GameState.incrementIdentified();
      setIdentified(prog.identifiedCount);
      setReefStage(getReefStage(prog.identifiedCount));

      if (prog.identifiedCount === 1) GameState.awardBadge("ampC_apprentice");

      if (org.isSeachymp) {
        const newResolved = GameState.addL3Resolved(org.id);
        resolvedRef.current = new Set(newResolved);

        // Source Control Specialist badge
        const sourceControlMatters =
          caseData &&
          caseData.sourceControl &&
          caseData.sourceControl !== "N/A" &&
          caseData.sourceControl !== "Not applicable";
        if (sourceControlMatters) {
          GameState.incrementL3SourceCtrlCount();
          GameState.awardBadge("source_control_specialist");
        }

        // Check completion: all SEACHYMP ids that have cases resolved
        const caseOrgIds = [...CASE_ORG_IDS];
        const allDone = caseOrgIds.every((id) => newResolved.has(id));
        if (allDone) {
          pendingCompleteRef.current = true;
        }
      }
    } else {
      // Mutation from inappropriate ceftriaxone (high-risk AmpC only)
      if (inappropriateCeftriaxone) {
        const { didMutate } = trackerRef.current.recordInappropriateCeftriaxone(org);
        if (didMutate) {
          setMutationBanner(
            `${org.name} has adapted — repeated Ceftriaxone selected for resistance. Switch to Cefepime or a carbapenem.`
          );
          setTimeout(() => setMutationBanner(null), 5000);
        }
      }
    }
  }

  function handleClose() {
    setCapturedOrg(null);
    setActiveCase(null);
    animatingShotRef.current = false;
    setAnimatingShot(false);
    if (pendingCompleteRef.current) {
      pendingCompleteRef.current = false;
      setTimeout(() => setMissionComplete(true), 300);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="level3-wrap">
      <canvas ref={canvasRef} className="level3-canvas" />

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
        <div style={animatingShot ? { visibility: "hidden", pointerEvents: "none" } : {}}>
          <CaseCard
            org={capturedOrg}
            caseData={activeCase}
            mutated={trackerRef.current.isMutated(capturedOrg.id)}
            onWeaponChoice={handleWeaponChoice}
            onClose={handleClose}
          />
        </div>
      )}

      {missionComplete && (
        <Level3CompleteOverlay onMenu={onMenu} />
      )}
    </div>
  );
}
