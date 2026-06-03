import "./InGameMenu.css";

export default function InGameMenu({ chymp, onResume, onHowToPlay, onQuit, onEncyclopedia, onReef, onWeapons }) {
  return (
    <div className="igm-overlay">
      <div className="igm-panel card">
        <h2 className="igm-title">⏸ Paused</h2>

        <div className="igm-chymp">
          <span>{chymp?.emoji || "🐵"}</span>
          <span>{chymp?.name || "Chymp"}</span>
        </div>

        <div className="igm-buttons">
          <button className="btn-primary igm-btn" onClick={onResume}>
            ▶ Resume
          </button>
          <button className="btn-secondary igm-btn" onClick={onHowToPlay}>
            📖 How to Play
          </button>
          <button className="btn-secondary igm-btn" onClick={onEncyclopedia}>
            📚 Encyclopedia
          </button>
          <button className="btn-secondary igm-btn" onClick={onReef}>
            🪸 My Reef
          </button>
          <button className="btn-secondary igm-btn" onClick={onWeapons}>
            ⚡ Weapons
          </button>
          <button className="btn-secondary igm-btn igm-btn--quit" onClick={onQuit}>
            ← Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
