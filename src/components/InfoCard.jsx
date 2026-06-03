import "./InfoCard.css";

export default function InfoCard({ org, mutated, onDecide, onClose, alreadyInEncyclopedia }) {
  const riskLabel = org.riskTier === "high"
    ? <span className="risk-high">HIGH RISK AmpC</span>
    : org.riskTier === "low"
    ? <span className="risk-low">LOW RISK AmpC</span>
    : <span className="info-no-risk">Not an AmpC organism</span>;

  // First sentence of blurb only
  const blurbFirst = org.blurb ? org.blurb.split(/\.\s+/)[0].replace(/\.$/, "") + "." : "";

  // Colored shape placeholder art — no emoji
  const artBg = (org.color || "#38b2e8") + "22";
  const monogram = org.name.slice(0, 2).toUpperCase();

  return (
    <div className="info-overlay" role="dialog" aria-modal="true" aria-label={`Info card: ${org.name}`}>
      <div className="info-card">
        {/* Header */}
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
              {riskLabel}
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
              <strong>Mutated form detected.</strong> Ceftriaxone, TMP-SMX, and
              fluoroquinolones are now flagged ineffective. Prefer Cefepime or a carbapenem.
            </div>
          )}
        </div>

        {/* Decision buttons */}
        {!alreadyInEncyclopedia ? (
          <div className="info-actions">
            <p className="info-actions-prompt">Is this a SEACHYMP target?</p>
            <div className="info-btn-row">
              <button
                className="btn-decide btn-decide--identify"
                onClick={() => onDecide(org, "identify")}
              >
                Yes — SEACHYMP target
              </button>
              <button
                className="btn-decide btn-decide--ignore"
                onClick={() => onDecide(org, "ignore")}
              >
                No — leave it alone
              </button>
            </div>
          </div>
        ) : (
          <div className="info-actions info-actions--done">
            <button className="btn-secondary info-close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
