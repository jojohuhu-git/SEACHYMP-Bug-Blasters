import { useState } from "react";
import { monogramOf } from "../data/organisms.js";
import "./InfoCard.css";

/**
 * InfoCard — shown after capturing an organism in Level 1.
 *
 * Pre-decision view: name, species, art, first blurb sentence.
 * NO risk/AmpC classification shown before the player decides.
 *
 * Post-decision result panel: reveals whether they were right,
 * and states the risk tier as a short answer line.
 */
export default function InfoCard({ org, mutated, onDecide, onClose, alreadyInEncyclopedia }) {
  const [decision, setDecision] = useState(null); // null | "identify" | "ignore"

  // First sentence of blurb only
  const blurbFirst = org.blurb ? org.blurb.split(/\.\s+/)[0].replace(/\.$/, "") + "." : "";

  // Colored shape placeholder art — no emoji
  const artBg = (org.color || "#38b2e8") + "22";
  const monogram = monogramOf(org);

  function handleDecide(d) {
    setDecision(d);
    // Notify parent (for scoring/state) but don't close yet — we show result first
    onDecide(org, d);
  }

  // Risk reveal line for post-decision panel
  function riskReveal() {
    if (!org.isSeachymp) {
      return (
        <span className="info-reveal info-reveal--neutral">
          {org.name} — not an AmpC organism
        </span>
      );
    }
    if (org.riskTier === "high") {
      return (
        <span className="info-reveal info-reveal--high">
          {org.name} — high-risk AmpC (Cefepime preferred)
        </span>
      );
    }
    return (
      <span className="info-reveal info-reveal--low">
        {org.name} — low-risk AmpC (Ceftriaxone often acceptable)
      </span>
    );
  }

  // Correctness for result panel
  const correct = decision !== null && (
    (decision === "identify" && org.isSeachymp) ||
    (decision === "ignore" && !org.isSeachymp)
  );

  return (
    <div className="info-overlay" role="dialog" aria-modal="true" aria-label={`Info card: ${org.name}`}>
      <div className="info-card">
        {/* Header — same for both views */}
        <div className="info-header" style={{ borderTopColor: org.isSeachymp ? org.color : "#94a3b8" }}>
          <div className="info-art" style={{ background: artBg, border: `2px solid ${org.color || "#38b2e8"}` }}>
            <span
              className="info-art-mono"
              style={{ color: org.color || "#38b2e8" }}
            >
              {monogram}
            </span>
            {mutated && <span className="info-mutated-tag">MUTATED</span>}
          </div>
          <div className="info-title-block">
            <h2 className="info-name">{org.name}</h2>
            <p className="info-species">{org.species}</p>
            <div className="info-tags">
              {alreadyInEncyclopedia && (
                <span className="info-already">In Encyclopedia</span>
              )}
            </div>
          </div>
          <button className="info-close" onClick={onClose} aria-label="Close info card">×</button>
        </div>

        {/* Body */}
        <div className="info-body">
          <p className="info-blurb">{blurbFirst}</p>

          {mutated && (
            <div className="info-mutation-warn">
              <strong>Mutated form detected.</strong> Ceftriaxone is now flagged ineffective. Prefer Cefepime; a carbapenem is acceptable when needed.
            </div>
          )}

          {/* Post-decision result block */}
          {decision !== null && (
            <div className={`info-result ${correct ? "info-result--correct" : "info-result--wrong"}`}>
              <p className="info-result-verdict">
                {correct ? "Correct." : "Not quite."}
              </p>
              <p className="info-result-reveal">{riskReveal()}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {alreadyInEncyclopedia || decision !== null ? (
          <div className="info-actions info-actions--done">
            <button className="btn-secondary info-close-btn" onClick={onClose}>
              Continue
            </button>
          </div>
        ) : (
          <div className="info-actions">
            <p className="info-actions-prompt">Is this a SEACHYMP target?</p>
            <div className="info-btn-row">
              <button
                className="btn-decide btn-decide--identify"
                onClick={() => handleDecide("identify")}
              >
                Yes — SEACHYMP target
              </button>
              <button
                className="btn-decide btn-decide--ignore"
                onClick={() => handleDecide("ignore")}
              >
                No — leave it alone
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
