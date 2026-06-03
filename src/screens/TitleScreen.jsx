import { useEffect } from "react";
import "./TitleScreen.css";

export default function TitleScreen({ onPlay, onPlayLevel2, onHowToPlay, onEncyclopedia, onReef, onWeapons }) {
  useEffect(() => {
    document.body.classList.remove("scroll-mode");
  }, []);

  return (
    <div className="title-screen ocean-bg">
      {/* Animated bubbles */}
      <div className="bubbles" aria-hidden="true">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`bubble bubble-${(i % 4) + 1}`} />
        ))}
      </div>

      <div className="title-content">
        {/* Logo / title */}
        <div className="title-logo" aria-label="SEACHYMP Bug Blasters game logo">
          <h1 className="title-name">
            <span className="title-seachymp">SEACHYMP</span>
            <span className="title-subtitle-inline"> Bug Blasters</span>
          </h1>
          <p className="title-tagline">Master the Ocean of Antimicrobial Stewardship</p>
        </div>

        {/* SEACHYMP mnemonic preview */}
        <div className="title-mnemonic" aria-label="SEACHYMP mnemonic letters">
          {[
            { letter: "S", name: "Serratia" },
            { letter: "E", name: "Enterobacter" },
            { letter: "A", name: "Aeromonas" },
            { letter: "C", name: "Citrobacter" },
            { letter: "H", name: "Hafnia" },
            { letter: "Y", name: "Yersinia" },
            { letter: "M", name: "Morganella" },
            { letter: "P", name: "Providencia" },
          ].map(({ letter, name }) => (
            <div key={letter} className="mnemonic-letter">
              <span className="mnemonic-char">{letter}</span>
              <span className="mnemonic-name">{name}</span>
            </div>
          ))}
        </div>

        {/* Menu buttons */}
        <div className="title-buttons">
          <button className="btn-primary title-btn-play" onClick={onPlay}>
            Level 1 — Identify SEACHYMP
          </button>
          <button className="btn-primary title-btn-level2" onClick={onPlayLevel2}>
            Level 2 — Weapon Match
          </button>
          <button className="btn-secondary" onClick={onHowToPlay}>
            How to Play
          </button>
          <div className="title-btn-row">
            <button className="btn-secondary btn-sm" onClick={onEncyclopedia}>
              Encyclopedia
            </button>
            <button className="btn-secondary btn-sm" onClick={onReef}>
              My Reef
            </button>
            <button className="btn-secondary btn-sm" onClick={onWeapons}>
              Weapons
            </button>
          </div>
        </div>

        <p className="title-footer">
          A no-fail, calm learning game for clinicians and learners.
        </p>
      </div>
    </div>
  );
}
