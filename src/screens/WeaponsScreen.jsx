import { useEffect } from "react";
import { WEAPONS } from "../data/weapons.js";
import ArtToken from "../art/ArtToken.jsx";
import "./WeaponsScreen.css";

export default function WeaponsScreen({ onBack }) {
  useEffect(() => {
    document.body.classList.add("scroll-mode");
    return () => document.body.classList.remove("scroll-mode");
  }, []);

  return (
    <div className="weapons-screen ocean-bg">
      <div className="weapons-content">
        <button className="btn-back" onClick={onBack}>← Back</button>

        <h1 className="weapons-title">Antibiotic Arsenal</h1>
        <p className="weapons-sub">
          Reference guide — weapons are used in Level 2+ gameplay.
          Choosing the right antibiotic for the right organism is the whole game.
        </p>

        <div className="weapons-grid">
          {WEAPONS.map((w) => (
            <div
              key={w.id}
              className="weapon-card card"
              style={{ borderLeftColor: w.color }}
            >
              <div className="weapon-header">
                {/* Weapon art — SVG when available, monogram placeholder otherwise */}
                <ArtToken
                  token={w.artToken}
                  size={64}
                  fallback={
                    <div
                      className="weapon-shape"
                      style={{ background: (w.color || "#38b2e8") + "22", borderColor: w.color || "#38b2e8", color: w.color || "#38b2e8" }}
                      aria-hidden="true"
                    >
                      {w.name.slice(0, 2).toUpperCase()}
                    </div>
                  }
                />
                <div>
                  <div className="weapon-name">{w.name}</div>
                  <div className="weapon-nickname">&ldquo;{w.nickname}&rdquo;</div>
                </div>
              </div>
              <p className="weapon-cue">{w.cue}</p>
              <p className="weapon-desc">{w.description}</p>
              <div className="weapon-appropriate">
                <span className="weapon-label">Appropriate for: </span>
                {w.appropriateFor.map((tier) => (
                  <span key={tier} className={tier === "high" ? "risk-high" : "risk-low"}>
                    {tier === "high" ? "HIGH RISK" : "LOW RISK"}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="weapons-note card">
          <p>
            <strong>Remember:</strong> Organism alone doesn&apos;t decide the antibiotic.
            Infection type, source control, and duration all matter.
            See the clinical cases in Level 3 for scenario-based practice.
          </p>
        </div>
      </div>
    </div>
  );
}
