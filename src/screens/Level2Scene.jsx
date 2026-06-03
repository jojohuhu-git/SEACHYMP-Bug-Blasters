import { useEffect, useRef, useState, useCallback } from "react";
import { ORGANISMS, monogramOf } from "../data/organisms.js";
import { WEAPONS } from "../data/weapons.js";
import { GameState } from "../logic/gameState.js";
import { MutationTracker } from "../logic/mutation.js";
import { classifyChoice } from "../logic/weaponChoice.js";
import { getReefStage } from "../data/progression.js";
import HUD from "../components/HUD.jsx";
import "./Level2Scene.css";

// ── Canvas constants ───────────────────────────────────────────────────────────
const PLAYER_RADIUS = 22;
const PLAYER_SPEED = 3.2;
const ORG_RADIUS_BASE = 24;
const CAPTURE_DIST = 70;
const ORBIT_COUNT = 8;

// All 9 SEACHYMP types (isSeachymp=true), mix with distractors for the pool
const SEACHYMP_IDS = ORGANISMS.filter((o) => o.isSeachymp).map((o) => o.id);

const LEVEL2_POOL = [
  ...ORGANISMS.filter((o) => o.isSeachymp),
  ...ORGANISMS.filter((o) => !o.isSeachymp).slice(0, 6),
];

function randomOrganisms(canvasW, canvasH) {
  const pool = [...LEVEL2_POOL];
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
  }));
}

// ── Colored-shape placeholder art ─────────────────────────────────────────────
function darkenHex(hex, amount) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((n & 0xff) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function drawOrganism(ctx, org, x, y, radius, mutated) {
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

// Level 2 uses a distinct teal/emerald reef palette so it reads differently
// from Level 1's deep-blue water. (Level 3 will get its own palette when built.)
function drawOcean(ctx, w, h, tick) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#04293a");
  grad.addColorStop(0.5, "#0a5a52");
  grad.addColorStop(1, "#1a8f7a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

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
    ctx.fillStyle = "#c8f5e8";
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(45, 212, 191, 0.15)";
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

// ─────────────────────────────────────────────────────────────────────────────
// Weapon Choice Card — shown after capturing an organism
// ─────────────────────────────────────────────────────────────────────────────
function WeaponChoiceCard({ org, mutated, onWeaponChoice, onClose }) {
  const [result, setResult] = useState(null); // classification result after choice

  const blurbFirst = org.blurb
    ? org.blurb.split(/\.\s+/)[0].replace(/\.$/, "") + "."
    : "";
  const artBg = (org.color || "#38b2e8") + "22";
  const monogram = monogramOf(org);

  function handleWeapon(weaponId) {
    const r = classifyChoice(org, weaponId, mutated);
    setResult(r);
    onWeaponChoice(org, weaponId, r);
  }

  function handleRelease() {
    const r = classifyChoice(org, null, mutated);
    setResult(r);
    onWeaponChoice(org, null, r);
  }

  // Result border color by status
  function resultBorderColor(status) {
    if (status === "preferred" || status === "release-correct") return "var(--low-risk)";
    if (status === "acceptable") return "var(--bonus)";
    return "var(--high-risk)";
  }

  // Risk reveal for post-decision panel
  function riskReveal() {
    if (!org.isSeachymp) {
      return <span className="l2-reveal l2-reveal--neutral">{org.name} — not an AmpC organism</span>;
    }
    if (org.riskTier === "high") {
      return <span className="l2-reveal l2-reveal--high">{org.name} — high-risk AmpC</span>;
    }
    return <span className="l2-reveal l2-reveal--low">{org.name} — low-risk AmpC</span>;
  }

  return (
    <div className="l2-overlay" role="dialog" aria-modal="true" aria-label={`Weapon choice: ${org.name}`}>
      <div className="l2-card">
        {/* Header */}
        <div
          className="l2-header"
          style={{ borderTopColor: org.isSeachymp ? org.color : "#94a3b8" }}
        >
          <div
            className="l2-art"
            style={{ background: artBg, border: `2px solid ${org.color || "#38b2e8"}` }}
          >
            <span className="l2-art-mono" style={{ color: org.color || "#38b2e8" }}>
              {monogram}
            </span>
            {mutated && <span className="l2-mutated-tag">MUTATED</span>}
          </div>
          <div className="l2-title-block">
            <h2 className="l2-name">{org.name}</h2>
            <p className="l2-species">{org.species}</p>
          </div>
          <button className="l2-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Blurb */}
        <div className="l2-blurb-block">
          <p className="l2-blurb">{blurbFirst}</p>
          {mutated && (
            <div className="l2-mutation-warn">
              <strong>Mutated form.</strong> Ceftriaxone, TMP-SMX, and fluoroquinolones
              are no longer effective. Prefer Cefepime or a carbapenem.
            </div>
          )}
        </div>

        {/* Weapon selection or result */}
        {result === null ? (
          <div className="l2-weapons-section">
            <p className="l2-weapons-prompt">Select an antibiotic — or release the organism:</p>
            <div className="l2-weapons-grid">
              {WEAPONS.map((w) => (
                <button
                  key={w.id}
                  className="l2-weapon-btn"
                  style={{ borderLeftColor: w.color }}
                  onClick={() => handleWeapon(w.id)}
                >
                  <div
                    className="l2-weapon-shape"
                    style={{
                      background: w.color + "22",
                      border: `1.5px solid ${w.color}`,
                      color: w.color,
                    }}
                    aria-hidden="true"
                  >
                    {w.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="l2-weapon-text">
                    <span className="l2-weapon-name">{w.name}</span>
                    <span className="l2-weapon-nick">{w.nickname}</span>
                    <span className="l2-weapon-cue">{w.cue}</span>
                  </div>
                </button>
              ))}
            </div>
            <button className="l2-release-btn" onClick={handleRelease}>
              Release — this organism does not need treatment
            </button>
          </div>
        ) : (
          <div
            className="l2-result"
            style={{ borderColor: resultBorderColor(result.status) }}
          >
            <p className="l2-result-heading">{result.heading}</p>
            <p className="l2-result-feedback">{result.feedback}</p>
            <p className="l2-result-reveal">{riskReveal()}</p>
            <button className="btn-secondary l2-continue-btn" onClick={onClose}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Level 2 Complete Overlay ──────────────────────────────────────────────────
function Level2CompleteOverlay({ onMenu }) {
  return (
    <div className="patrol-overlay" role="dialog" aria-modal="true" aria-label="Weapon Match Complete">
      <div className="patrol-card info-card">
        <div className="patrol-header" style={{ borderTopColor: "var(--low-risk)" }}>
          <div
            className="patrol-icon"
            style={{
              background: "var(--low-risk-bg)",
              border: "2px solid var(--low-risk)",
            }}
            aria-hidden="true"
          />
          <h2 className="patrol-title">Weapon Match Complete</h2>
        </div>
        <div className="patrol-body">
          <p className="patrol-message">
            You have matched weapons to all 9 SEACHYMP organism types. High-risk
            organisms need Cefepime; low-risk organisms are often manageable with
            Ceftriaxone. Carbapenems should be reserved.
          </p>
          <p className="patrol-sub">
            Keep practicing — the more encounters you complete, the more confident
            your clinical reasoning will become.
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

// ─────────────────────────────────────────────────────────────────────────────
export default function Level2Scene({ chymp, onMenu }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const trackerRef = useRef(new MutationTracker());

  const [capturedOrg, setCapturedOrg] = useState(null);
  const [mutationBanner, setMutationBanner] = useState(null);
  const [identified, setIdentified] = useState(
    () => GameState.getProgress().identifiedCount
  );
  const [reefStage, setReefStage] = useState(
    () => getReefStage(GameState.getProgress().identifiedCount)
  );
  const [missionComplete, setMissionComplete] = useState(false);
  const pendingCompleteRef = useRef(false);

  // Tracks which SEACHYMP types have been correctly treated this session
  const treatedRef = useRef(GameState.getL2Treated());

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
    };
  }

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;

    s.tick++;

    let dx = 0, dy = 0;
    if (s.keys["ArrowLeft"] || s.keys["a"] || s.keys["A"]) dx -= 1;
    if (s.keys["ArrowRight"] || s.keys["d"] || s.keys["D"]) dx += 1;
    if (s.keys["ArrowUp"] || s.keys["w"] || s.keys["W"]) dy -= 1;
    if (s.keys["ArrowDown"] || s.keys["s"] || s.keys["S"]) dy += 1;

    if (s.touch.active) {
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

    s.organisms.forEach((org) => {
      org.x += org.vx;
      org.y += org.vy;
      org.y += Math.sin(s.tick * 0.025 + org.bobOffset) * 0.3;
      const margin = ORG_RADIUS_BASE + 10;
      if (org.x < -margin) org.x = s.w + margin;
      if (org.x > s.w + margin) org.x = -margin;
      if (org.y < -margin) org.y = s.h + margin;
      if (org.y > s.h + margin) org.y = -margin;
    });

    drawOcean(ctx, s.w, s.h, s.tick);
    s.organisms.forEach((org) => {
      const mutated = trackerRef.current.isMutated(org.id);
      drawOrganism(ctx, org, org.x, org.y, ORG_RADIUS_BASE, mutated);
    });
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  // ── Keyboard input ────────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e) {
      if (!stateRef.current) return;
      stateRef.current.keys[e.key] = true;
      if ((e.key === " " || e.key === "e" || e.key === "E") && !capturedOrg) {
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
      const s = stateRef.current;
      if (!s) return;
      const hit = s.organisms.find((org) => {
        const dx = org.x - pos.x;
        const dy = org.y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) <= ORG_RADIUS_BASE + 14;
      });
      if (hit) setCapturedOrg(hit);
    }

    function onTouchStart(e) {
      e.preventDefault();
      const pos = getPos(e);
      const s = stateRef.current;
      if (!s) return;
      const hit = s.organisms.find((org) => {
        const dx = org.x - pos.x;
        const dy = org.y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) <= ORG_RADIUS_BASE + 20;
      });
      if (hit && !capturedOrg) { setCapturedOrg(hit); return; }
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

  // ── Weapon choice result handler ──────────────────────────────────────────
  // Called immediately when weapon is chosen (before card closes).
  function handleWeaponChoice(org, weaponId, result) {
    if (result.isCorrect) {
      // Add to encyclopedia + reef progress
      GameState.addToEncyclopedia(org.id);
      const prog = GameState.incrementIdentified();
      setIdentified(prog.identifiedCount);
      setReefStage(getReefStage(prog.identifiedCount));

      // AmpC Apprentice: first correct choice
      if (prog.identifiedCount === 1) GameState.awardBadge("ampC_apprentice");

      // Cefepime Commander: correct cefepime use on high-risk organism
      if (org.isSeachymp && weaponId === "cefepime" && org.riskTier === "high") {
        const n = GameState.incrementL2CefepimeCount();
        // Award badge after correctly treating all 3 high-risk types with Cefepime (threshold = 3)
        const highRiskIds = SEACHYMP_IDS.filter((id) => {
          const o = ORGANISMS.find((x) => x.id === id);
          return o && o.riskTier === "high";
        });
        if (n >= highRiskIds.length) {
          GameState.awardBadge("cefepime_commander");
        }
      }

      // Track which SEACHYMP types have been correctly treated
      if (org.isSeachymp) {
        const newTreated = GameState.addL2Treated(org.id);
        treatedRef.current = new Set(newTreated);
        const allDone = SEACHYMP_IDS.every((id) => newTreated.has(id));
        if (allDone) {
          pendingCompleteRef.current = true;
        }
      }
    } else {
      // Mutation is driven specifically by INAPPROPRIATE CEFTRIAXONE: giving
      // Ceftriaxone to a high-risk AmpC organism. Three such calls on the same
      // organism type select for resistance and trigger the AmpC Mutation Form.
      // Other wrong choices (TMP-SMX/FQ on high-risk, carbapenem overuse) give
      // corrective feedback but do not breed resistance here.
      const inappropriateCeftriaxone =
        org.isSeachymp && org.riskTier === "high" && weaponId === "ceftriaxone";
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
    // Card stays open to show result; handleClose fires when player clicks Continue.
  }

  function handleClose() {
    setCapturedOrg(null);
    if (pendingCompleteRef.current) {
      pendingCompleteRef.current = false;
      setTimeout(() => setMissionComplete(true), 300);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="level2-wrap">
      <canvas ref={canvasRef} className="level2-canvas" />

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
        <WeaponChoiceCard
          org={capturedOrg}
          mutated={trackerRef.current.isMutated(capturedOrg.id)}
          onWeaponChoice={handleWeaponChoice}
          onClose={handleClose}
        />
      )}

      {missionComplete && (
        <Level2CompleteOverlay onMenu={onMenu} />
      )}
    </div>
  );
}
