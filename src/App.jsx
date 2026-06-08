import { useState, useCallback } from "react";
import { SQUAD } from "./data/squad.js";

import TitleScreen from "./screens/TitleScreen.jsx";
import HowToPlay from "./screens/HowToPlay.jsx";
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

  // Player character is always Captain Chymp (squad selection was removed).
  const chymp = SQUAD[0];

  const go = useCallback((nextScreen, savePrev = false) => {
    if (savePrev) setPrevScreen(screen);
    setScreen(nextScreen);
  }, [screen]);

  // ── From TITLE ────────────────────────────────────────────────────────────
  function handlePlay() {
    go(SCREENS.LEVEL1);
  }

  function handlePlayLevel2() {
    go(SCREENS.LEVEL2);
  }

  function handlePlayLevel3() {
    go(SCREENS.LEVEL3);
  }

  // ── In-game menu helpers ──────────────────────────────────────────────────
  function openInGameMenu() {
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

    case SCREENS.LEVEL1:
      return (
        <>
          <Level1Scene chymp={chymp} onMenu={openInGameMenu} />
        </>
      );

    case SCREENS.LEVEL2:
      return (
        <>
          <Level2Scene chymp={chymp} onMenu={() => go(SCREENS.TITLE)} />
        </>
      );

    case SCREENS.LEVEL3:
      return (
        <>
          <Level3Scene chymp={chymp} onMenu={() => go(SCREENS.TITLE)} />
        </>
      );

    case SCREENS.IN_GAME_MENU:
      return (
        <>
          {/* Level1 still renders underneath (paused visually) */}
          <Level1Scene chymp={chymp} onMenu={() => {}} />
          <InGameMenu
            chymp={chymp}
            onResume={() => go(SCREENS.LEVEL1)}
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
