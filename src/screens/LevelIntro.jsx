import { useEffect } from "react";
import { LEVEL_INTROS } from "../data/levelIntros.js";
import { ORGANISMS } from "../data/organisms.js";
import { WEAPONS } from "../data/weapons.js";
import ArtToken from "../art/ArtToken.jsx";
import { TitleMascot } from "../art/ART_COMPONENTS.js";
import OrganismImage from "../components/OrganismImage.jsx";
import "./LevelIntro.css";

/**
 * LevelIntro — short goal + controls card shown before a level starts.
 * Reachable directly from the Title screen for every level, so instructions
 * are visible up front rather than only inside the pause-menu How to Play page.
 */
export default function LevelIntro({ level, onStart, onBack }) {
  const content = LEVEL_INTROS[level];

  useEffect(() => {
    document.body.classList.add("scroll-mode");
    return () => document.body.classList.remove("scroll-mode");
  }, []);

  if (!content) return null;

  const exampleOrganisms = (content.exampleOrganismIds || [])
    .map((id) => ORGANISMS.find((o) => o.id === id))
    .filter(Boolean);

  const weapons = (content.weaponTokens || [])
    .map((token) => WEAPONS.find((w) => w.artToken === token))
    .filter(Boolean);

  return (
    <div className="li-screen ocean-bg">
      <div className="li-content">
        <button className="btn-back" onClick={onBack}>← Back</button>

        <div className="li-card card">
          <h1 className="li-title">{content.title}</h1>
          <p className="li-goal">{content.goal}</p>

          {exampleOrganisms.length > 0 && (
            <div className="li-art-row">
              <div className="li-mascot">
                <TitleMascot size={64} />
              </div>
              {exampleOrganisms.map((org) => (
                <div key={org.id} className="li-example">
                  <div className="li-example-art" style={{ borderColor: org.isSeachymp ? org.color : "#94a3b8" }}>
                    <OrganismImage org={org} size={48} />
                  </div>
                  <span className={org.isSeachymp ? "risk-high" : "risk-low"}>
                    {org.isSeachymp ? "Target" : "Leave alone"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {weapons.length > 0 && (
            <div className="li-weapon-row">
              {weapons.map((w) => (
                <div key={w.id} className="li-weapon">
                  <ArtToken
                    token={w.artToken}
                    size={48}
                    fallback={<div className="li-weapon-fallback" style={{ borderColor: w.color, color: w.color }}>{w.name.slice(0, 2).toUpperCase()}</div>}
                  />
                  <span className="li-weapon-name">{w.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="li-controls">
            <h2>Controls</h2>
            <p><strong>Click</strong> (computer) or <strong>tap</strong> (phone) an organism to catch it.</p>
          </div>

          <button className="btn-primary li-start" onClick={onStart}>
            Start Level {level}
          </button>
        </div>
      </div>
    </div>
  );
}
