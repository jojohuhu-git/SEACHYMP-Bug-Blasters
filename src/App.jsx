import { useState, useCallback } from "react";
import { SQUAD } from "./data/squad.js";

import TitleScreen from "./screens/TitleScreen.jsx";
import HowToPlay from "./screens/HowToPlay.jsx";
import LevelIntro from "./screens/LevelIntro.jsx";
import Level1Scene from "./screens/Level1Scene.jsx";
import Level2Scene from "./screens/Level2Scene.jsx";
import Level3Scene from "./screens/Level3Scene.jsx";
import InGameMenu from "./screens/InGameMenu.jsx";
import Encyclopedia from "./screens/Encyclopedia.jsx";
import MyReef from "./screens/MyReef.jsx";
import WeaponsScreen from "./screens/WeaponsScreen.jsx";

/**
 * Screen names — all navigation state lives here.
 * No react-router needed for this single-page game.
 */
const SCREENS = {
  TITLE: "title",
  HOW_TO_PLAY: "how_to_play",
  LEVEL1_INTRO: "level1_intro",
  LEVEL2_INTRO: "level2_intro",
  LEVEL3_INTRO: "level3_intro",
  LEVEL1: "level1",
  LEVEL2: "level2",
  LEVEL3: "level3",
  IN_GAME_MENU: "in_game_menu",
  ENCYCLOPEDIA: "encyclopedia",
  REEF: "reef",
  WEAPONS: "weapons",
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.TITLE);
  // prevScreen is used to know where to return from sub-screens
  const [prevScreen, setPrevScreen] = useState(SCREENS.TITLE);
  // pausedLevel tracks which level's pause menu is open, so IN_GAME_MENU
  // can render the right scene underneath and resume to the right place.
  const [pausedLevel, setPausedLevel] = useState(SCREENS.LEVEL1);

  // Player character is always Captain Chymp (squad selection was removed).
  const chymp = SQUAD[0];

  const go = useCallback((nextScreen, savePrev = false) => {
    if (savePrev) setPrevScreen(screen);
    setScreen(nextScreen);
  }, [screen]);

  // ── From TITLE — each level's button opens its intro card first ────────────
  function handlePlay() {
    go(SCREENS.LEVEL1_INTRO);
  }

  function handlePlayLevel2() {
    go(SCREENS.LEVEL2_INTRO);
  }

  function handlePlayLevel3() {
    go(SCREENS.LEVEL3_INTRO);
  }

  // ── In-game menu helpers ──────────────────────────────────────────────────
  // Pause whichever level called this, so IN_GAME_MENU knows what to resume.
  function openInGameMenu(level) {
    setPausedLevel(level);
    go(SCREENS.IN_GAME_MENU);
  }

  function handleInGameSub(subScreen) {
    // Sub-screens from in-game menu return to in-game menu
    setPrevScreen(SCREENS.IN_GAME_MENU);
    setScreen(subScreen);
  }

  // Determine back target: if opened from in-game menu, go back to game
  function handleSubBack() {
    if (prevScreen === SCREENS.IN_GAME_MENU) {
      go(SCREENS.IN_GAME_MENU);
    } else {
      go(SCREENS.TITLE);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  switch (screen) {
    case SCREENS.TITLE:
      return (
        <TitleScreen
          onPlay={handlePlay}
          onPlayLevel2={handlePlayLevel2}
          onPlayLevel3={handlePlayLevel3}
          onHowToPlay={() => { setPrevScreen(SCREENS.TITLE); go(SCREENS.HOW_TO_PLAY); }}
          onEncyclopedia={() => { setPrevScreen(SCREENS.TITLE); go(SCREENS.ENCYCLOPEDIA); }}
          onReef={() => { setPrevScreen(SCREENS.TITLE); go(SCREENS.REEF); }}
          onWeapons={() => { setPrevScreen(SCREENS.TITLE); go(SCREENS.WEAPONS); }}
        />
      );

    case SCREENS.HOW_TO_PLAY:
      return (
        <HowToPlay
          onBack={handleSubBack}
        />
      );

    case SCREENS.LEVEL1_INTRO:
      return <LevelIntro level={1} onStart={() => go(SCREENS.LEVEL1)} onBack={() => go(SCREENS.TITLE)} />;

    case SCREENS.LEVEL2_INTRO:
      return <LevelIntro level={2} onStart={() => go(SCREENS.LEVEL2)} onBack={() => go(SCREENS.TITLE)} />;

    case SCREENS.LEVEL3_INTRO:
      return <LevelIntro level={3} onStart={() => go(SCREENS.LEVEL3)} onBack={() => go(SCREENS.TITLE)} />;

    case SCREENS.LEVEL1:
      return (
        <>
          <Level1Scene chymp={chymp} onMenu={() => openInGameMenu(SCREENS.LEVEL1)} />
        </>
      );

    case SCREENS.LEVEL2:
      return (
        <>
          <Level2Scene chymp={chymp} onMenu={() => openInGameMenu(SCREENS.LEVEL2)} />
        </>
      );

    case SCREENS.LEVEL3:
      return (
        <>
          <Level3Scene chymp={chymp} onMenu={() => openInGameMenu(SCREENS.LEVEL3)} />
        </>
      );

    case SCREENS.IN_GAME_MENU:
      return (
        <>
          {/* The paused level still renders underneath (paused visually) */}
          {pausedLevel === SCREENS.LEVEL1 && <Level1Scene chymp={chymp} onMenu={() => {}} />}
          {pausedLevel === SCREENS.LEVEL2 && <Level2Scene chymp={chymp} onMenu={() => {}} />}
          {pausedLevel === SCREENS.LEVEL3 && <Level3Scene chymp={chymp} onMenu={() => {}} />}
          <InGameMenu
            chymp={chymp}
            onResume={() => go(pausedLevel)}
            onHowToPlay={() => handleInGameSub(SCREENS.HOW_TO_PLAY)}
            onQuit={() => go(SCREENS.TITLE)}
            onEncyclopedia={() => handleInGameSub(SCREENS.ENCYCLOPEDIA)}
            onReef={() => handleInGameSub(SCREENS.REEF)}
            onWeapons={() => handleInGameSub(SCREENS.WEAPONS)}
          />
        </>
      );

    case SCREENS.ENCYCLOPEDIA:
      return <Encyclopedia onBack={handleSubBack} />;

    case SCREENS.REEF:
      return <MyReef onBack={handleSubBack} />;

    case SCREENS.WEAPONS:
      return <WeaponsScreen onBack={handleSubBack} />;

    default:
      return <TitleScreen onPlay={handlePlay} />;
  }
}
