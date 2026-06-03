import { useEffect } from "react";
import { ORGANISMS, monogramFor } from "../data/organisms.js";
import { GameState } from "../logic/gameState.js";
import "./Encyclopedia.css";

export default function Encyclopedia({ onBack }) {
  const encyclopedia = GameState.getEncyclopedia();

  useEffect(() => {
    document.body.classList.add("scroll-mode");
    return () => document.body.classList.remove("scroll-mode");
  }, []);

  const collected = ORGANISMS.filter((o) => encyclopedia.has(o.id));
  const seachympCollected = collected.filter((o) => o.isSeachymp);
  const total = ORGANISMS.filter((o) => o.isSeachymp).length;

  return (
    <div className="enc-screen ocean-bg">
      <div className="enc-content">
        <button className="btn-back" onClick={onBack}>← Back</button>

        <h1 className="enc-title">Encyclopedia</h1>
        <p className="enc-sub">
          {seachympCollected.length} / {total} SEACHYMP organisms discovered
        </p>

        {collected.length === 0 ? (
          <div className="enc-empty card">
            <p>Your encyclopedia is empty. Swim out and capture some organisms!</p>
          </div>
        ) : (
          <>
            {collected.length > 0 && (
              <section className="enc-section">
                <h2 className="enc-section-title">Discovered Organisms</h2>
                <div className="enc-grid">
                  {collected.map((org) => (
                    <div key={org.id} className="enc-card card" style={{ borderTopColor: org.isSeachymp ? org.color : "#475569" }}>
                      <div className="enc-card-header">
                        {/* Colored shape placeholder art — no emoji */}
                        <div
                          className="enc-art-shape"
                          style={{
                            background: (org.color || "#38b2e8") + "22",
                            borderColor: org.color || "#38b2e8",
                            color: org.color || "#38b2e8",
                          }}
                        >
                          {monogramFor(org.name)}
                        </div>
                        <div>
                          <div className="enc-name">{org.name}</div>
                          <div className="enc-species">{org.species}</div>
                        </div>
                      </div>
                      <div className="enc-tags">
                        {org.riskTier === "high" && <span className="risk-high">HIGH RISK</span>}
                        {org.riskTier === "low" && <span className="risk-low">LOW RISK</span>}
                        {org.bonus && <span className="enc-badge enc-badge--bonus">BONUS</span>}
                      </div>
                      <p className="enc-blurb">
                        {org.blurb ? org.blurb.split(/\.\s+/)[0].replace(/\.$/, "") + "." : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Undiscovered SEACHYMP slots */}
            {seachympCollected.length < total && (
              <section className="enc-section">
                <h2 className="enc-section-title enc-section-title--dim">Undiscovered</h2>
                <div className="enc-grid">
                  {ORGANISMS.filter((o) => o.isSeachymp && !encyclopedia.has(o.id)).map((org) => (
                    <div key={org.id} className="enc-card enc-card--unknown card">
                      <div className="enc-card-header">
                        <div className="enc-art-shape enc-art-shape--unknown">?</div>
                        <div>
                          <div className="enc-name enc-name--unknown">???</div>
                          <div className="enc-species">Undiscovered organism</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
