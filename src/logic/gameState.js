/**
 * gameState.js — localStorage persistence for Bug Blasters.
 *
 * Keys stored in localStorage:
 *   bugblasters_squad      — chosen Chymp id
 *   bugblasters_encyclopedia — Set of identified organism ids (JSON array)
 *   bugblasters_badges     — object { badgeId: bool }
 *   bugblasters_progress   — { identifiedCount, ignoredCount }
 */

const KEYS = {
  SQUAD: "bugblasters_squad",
  ENCYCLOPEDIA: "bugblasters_encyclopedia",
  BADGES: "bugblasters_badges",
  PROGRESS: "bugblasters_progress",
  IDENTIFIED_TARGETS: "bugblasters_identified_targets",
  L2_TREATED: "bugblasters_l2_treated",        // Set of organism type ids correctly treated in L2
  L2_CEFEPIME_COUNT: "bugblasters_l2_cefepime", // number of correct Cefepime choices
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export const GameState = {
  // ── Squad ────────────────────────────────────────────────────────────────
  getSquad() {
    return load(KEYS.SQUAD, null);
  },
  setSquad(chympId) {
    save(KEYS.SQUAD, chympId);
  },

  // ── Encyclopedia ─────────────────────────────────────────────────────────
  getEncyclopedia() {
    const arr = load(KEYS.ENCYCLOPEDIA, []);
    return new Set(arr);
  },
  addToEncyclopedia(organismId) {
    const enc = GameState.getEncyclopedia();
    enc.add(organismId);
    save(KEYS.ENCYCLOPEDIA, [...enc]);
  },
  hasInEncyclopedia(organismId) {
    return GameState.getEncyclopedia().has(organismId);
  },

  // ── Badges ───────────────────────────────────────────────────────────────
  getBadges() {
    return load(KEYS.BADGES, {});
  },
  awardBadge(badgeId) {
    const badges = GameState.getBadges();
    if (!badges[badgeId]) {
      badges[badgeId] = true;
      save(KEYS.BADGES, badges);
      return true; // newly awarded
    }
    return false;
  },
  hasBadge(badgeId) {
    return !!GameState.getBadges()[badgeId];
  },

  // ── Progress ─────────────────────────────────────────────────────────────
  getProgress() {
    return load(KEYS.PROGRESS, { identifiedCount: 0, ignoredCount: 0 });
  },
  incrementIdentified() {
    const p = GameState.getProgress();
    p.identifiedCount += 1;
    save(KEYS.PROGRESS, p);
    return p;
  },
  incrementIgnored() {
    const p = GameState.getProgress();
    p.ignoredCount += 1;
    save(KEYS.PROGRESS, p);
    return p;
  },

  // ── Identified Targets (per-patrol completion tracking) ──────────────────
  getIdentifiedTargets() {
    const arr = load(KEYS.IDENTIFIED_TARGETS, []);
    return new Set(arr);
  },
  addIdentifiedTarget(organismId) {
    const set = GameState.getIdentifiedTargets();
    set.add(organismId);
    save(KEYS.IDENTIFIED_TARGETS, [...set]);
    return set;
  },
  hasIdentifiedTarget(organismId) {
    return GameState.getIdentifiedTargets().has(organismId);
  },
  resetIdentifiedTargets() {
    save(KEYS.IDENTIFIED_TARGETS, []);
  },

  // ── Level 2 — correctly treated organism types ───────────────────────────
  getL2Treated() {
    const arr = load(KEYS.L2_TREATED, []);
    return new Set(arr);
  },
  addL2Treated(organismId) {
    const set = GameState.getL2Treated();
    set.add(organismId);
    save(KEYS.L2_TREATED, [...set]);
    return set;
  },
  hasL2Treated(organismId) {
    return GameState.getL2Treated().has(organismId);
  },

  // ── Level 2 — Cefepime Commander badge tracking ──────────────────────────
  getL2CefepimeCount() {
    return load(KEYS.L2_CEFEPIME_COUNT, 0);
  },
  incrementL2CefepimeCount() {
    const n = GameState.getL2CefepimeCount() + 1;
    save(KEYS.L2_CEFEPIME_COUNT, n);
    return n;
  },

  // ── Full reset ────────────────────────────────────────────────────────────
  reset() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

export default GameState;
