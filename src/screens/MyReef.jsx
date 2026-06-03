import { useEffect } from "react";
import { REEF_STAGES, BADGES, getReefStage } from "../data/progression.js";
import { GameState } from "../logic/gameState.js";
import "./MyReef.css";

// Short label initials for reef stages (no emoji)
const STAGE_INITIALS = {
  barren: "BR",
  sprouting: "SP",
  growing: "GR",
  thriving: "TH",
};

export default function MyReef({ onBack }) {
  const progress = GameState.getProgress();
  const earnedBadges = GameState.getBadges();
  const stage = getReefStage(progress.identifiedCount);

  useEffect(() => {
    document.body.classList.add("scroll-mode");
    return () => document.body.classList.remove("scroll-mode");
  }, []);

  return (
    <div className="reef-screen ocean-bg">
      <div className="reef-content">
        <button className="btn-back" onClick={onBack}>← Back</button>

        <h1 className="reef-title">My Reef</h1>

        {/* Current stage */}
        <div className="reef-stage-card card">
          <div
            className="reef-stage-shape"
            style={{ background: (stage.color || "#94a3b8") + "22", borderColor: stage.color || "#94a3b8", color: stage.color || "#94a3b8" }}
            aria-hidden="true"
          >
            {STAGE_INITIALS[stage.id] || stage.label.slice(0, 2).toUpperCase()}
          </div>
          <div className="reef-stage-info">
            <div className="reef-stage-name">{stage.label}</div>
            <p className="reef-stage-desc">{stage.description}</p>
          </div>
        </div>

        {/* Progress bar through stages */}
        <div className="reef-stages">
          {REEF_STAGES.map((s, i) => {
            const reached = progress.identifiedCount >= s.minCount;
            const isCurrent = s.id === stage.id;
            return (
              <div key={s.id} className={`reef-stage-step ${reached ? "reef-stage-step--reached" : ""} ${isCurrent ? "reef-stage-step--current" : ""}`}>
                <span
                  className="reef-step-shape"
                  style={reached ? { background: (s.color || "#94a3b8") + "33", borderColor: s.color || "#94a3b8", color: s.color || "#94a3b8" } : {}}
                  aria-hidden="true"
                >
                  {STAGE_INITIALS[s.id] || s.label.slice(0, 2).toUpperCase()}
                </span>
                <span className="reef-step-label">{s.label}</span>
                <span className="reef-step-req">
                  {i === 0 ? "Start" : `${s.minCount}+ identified`}
                </span>
                {isCurrent && <span className="reef-step-you">← You are here</span>}
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="reef-stats">
          <div className="reef-stat card">
            <div className="reef-stat-val">{progress.identifiedCount}</div>
            <div className="reef-stat-lbl">SEACHYMP identified</div>
          </div>
          <div className="reef-stat card">
            <div className="reef-stat-val">{progress.ignoredCount}</div>
            <div className="reef-stat-lbl">Non-targets ignored</div>
          </div>
        </div>

        {/* Badges */}
        <h2 className="reef-badges-title">Badges</h2>
        <div className="reef-badges-grid">
          {BADGES.map((badge) => {
            const earned = !!earnedBadges[badge.id];
            return (
              <div key={badge.id} className={`reef-badge card ${earned ? "reef-badge--earned" : "reef-badge--locked"}`}>
                <div
                  className="reef-badge-shape"
                  aria-hidden="true"
                >
                  {earned ? badge.id.slice(0, 2).toUpperCase() : "—"}
                </div>
                <div className="reef-badge-name">{badge.name}</div>
                <div className="reef-badge-desc">{badge.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
