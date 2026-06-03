import { useState, useCallback } from "react";
import { GameState } from "./logic/gameState.js";
import { SQUAD } from "./data/squad.js";

import TitleScreen from "./screens/TitleScreen.jsx";
import SquadSelect from "./screens/SquadSelect.jsx";
import HowToPlay from "./screens/HowToPlay.jsx";
import Level1Scene from "./screens/Level1Scene.jsx";
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
  SQUAD: "squad",
  HOW_TO_PLAY: "how_to_play",
  LEVEL1: "level1",
  IN_GAME_MENU: "in_game_menu",
  ENCYCLOPEDIA: "encyclopedia",
  REEF: "reef",
  WEAPONS: "weapons",
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.TITLE);
  // prevScreen is used to know where to return from sub-screens
  const [prevScreen, setPrevScreen] = useState(SCREENS.TITLE);

  // Resolved chymp — read from localStorage or pick default
  const [chymp, setChymp] = useState(() => {
    const saved = GameState.getSquad();
    return saved ? (SQUAD.find((c) => c.id === saved) || SQUAD[0]) : null;
  });

  const go = useCallback((nextScreen, savePrev = false) => {
    if (savePrev) setPrevScreen(screen);
    setScreen(nextScreen);
  }, [screen]);

  // ── From TITLE ────────────────────────────────────────────────────────────
  function handlePlay() {
    // If no chymp chosen yet, go to squad select; otherwise straight to Level1
    if (!chymp) {
      go(SCREENS.SQUAD);
    } else {
      go(SCREENS.LEVEL1);
    }
  }

  function handleSquadSelect(selectedChymp) {
    setChymp(selectedChymp);
    go(SCREENS.LEVEL1);
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
          onHowToPlay={() => { setPrevScreen(SCREENS.TITLE); go(SCREENS.HOW_TO_PLAY); }}
          onEncyclopedia={() => { setPrevScreen(SCREENS.TITLE); go(SCREENS.ENCYCLOPEDIA); }}
          onReef={() => { setPrevScreen(SCREENS.TITLE); go(SCREENS.REEF); }}
          onWeapons={() => { setPrevScreen(SCREENS.TITLE); go(SCREENS.WEAPONS); }}
        />
      );

    case SCREENS.SQUAD:
      return (
        <SquadSelect
          onSelect={handleSquadSelect}
          onBack={() => go(SCREENS.TITLE)}
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
