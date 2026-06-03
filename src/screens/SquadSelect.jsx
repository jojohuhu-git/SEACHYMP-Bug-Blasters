import { useState, useEffect } from "react";
import { SQUAD } from "../data/squad.js";
import { GameState } from "../logic/gameState.js";
import "./SquadSelect.css";

export default function SquadSelect({ onSelect, onBack }) {
  const [chosen, setChosen] = useState(() => GameState.getSquad() || null);

  useEffect(() => {
    document.body.classList.remove("scroll-mode");
  }, []);

  function handleConfirm() {
    if (!chosen) return;
    GameState.setSquad(chosen);
    const chymp = SQUAD.find((c) => c.id === chosen);
    onSelect(chymp);
  }

  return (
    <div className="squad-screen ocean-bg">
      <div className="squad-content">
        <button className="btn-back" onClick={onBack} aria-label="Back to title">
          ← Back
        </button>

        <h2 className="squad-heading">Choose Your Chymp</h2>
        <p className="squad-sub">Purely cosmetic — all Chymps play the same.</p>

        <div className="squad-grid">
          {SQUAD.map((chymp) => (
            <button
              key={chymp.id}
              className={`squad-card ${chosen === chymp.id ? "squad-card--chosen" : ""}`}
              onClick={() => setChosen(chymp.id)}
              aria-pressed={chosen === chymp.id}
              aria-label={`Select ${chymp.name}`}
              style={{ "--chymp-color": chymp.color }}
            >
              <div className="squad-emoji">{chymp.emoji}</div>
              <div className="squad-name">{chymp.name}</div>
              <div className="squad-tagline">{chymp.tagline}</div>
              {chosen === chymp.id && (
                <div className="squad-check" aria-hidden="true">✓</div>
              )}
            </button>
          ))}
        </div>

        <button
          className="btn-primary squad-confirm"
          onClick={handleConfirm}
          disabled={!chosen}
        >
          {chosen
            ? `Play as ${SQUAD.find((c) => c.id === chosen)?.name} →`
            : "Select a Chymp to continue"}
        </button>
      </div>
    </div>
  );
}
