import ArtToken from "../art/ArtToken.jsx";
import "./HUD.css";

export default function HUD({ chymp, identified, reefStage, onMenu }) {
  return (
    <div className="hud">
      {/* Left: Chymp avatar + name */}
      <div className="hud-left">
        <div
          className="hud-avatar"
          style={{ borderColor: chymp?.color || "#38b2e8" }}
          aria-label={`Playing as ${chymp?.name || "Chymp"}`}
        >
          <ArtToken
            token={chymp?.id}
            size={34}
            fallback={
              <span
                className="hud-avatar-mono"
                style={{
                  background: (chymp?.color || "#38b2e8") + "22",
                  color: chymp?.color || "#38b2e8",
                }}
              >
                {chymp?.name ? chymp.name.slice(0, 2).toUpperCase() : "CH"}
              </span>
            }
          />
        </div>
        <span className="hud-chymp-name">{chymp?.name || "Chymp"}</span>
      </div>

      {/* Center: identified count + reef stage */}
      <div className="hud-center">
        <div className="hud-stat">
          <span className="hud-stat-value">{identified}</span>
          <span className="hud-stat-label">identified</span>
        </div>
        <div className="hud-reef">
          <span className="hud-reef-label">{reefStage.label}</span>
        </div>
      </div>

      {/* Right: Menu button */}
      <div className="hud-right">
        <button className="hud-menu-btn" onClick={onMenu} aria-label="Open menu">
          Menu
        </button>
      </div>
    </div>
  );
}
