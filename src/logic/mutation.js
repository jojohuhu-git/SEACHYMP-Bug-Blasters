/**
 * mutation.js — Shared mutation engine.
 *
 * Rule: if the player mis-handles a HIGH-risk AmpC organism
 * MUTATION_THRESHOLD times (e.g., repeatedly tries to ignore or
 * misidentify it), the organism "adapts".
 *
 * In mutated form:
 *   - Visual: darker tint, spikier placeholder, `mutated: true` flag
 *   - Ceftriaxone / TMP-SMX / Fluoroquinolones are flagged ineffective
 *   - Player must switch to Cefepime or Carbapenem
 *
 * This module is UI-agnostic — it manages state and returns decisions.
 * The caller (canvas scene / game engine) is responsible for showing
 * the "The organism has adapted." banner.
 */

// TODO: sound — play an ominous mutation sound here
export const MUTATION_THRESHOLD = 3; // mis-handles before mutation triggers

/** Weapons that are INEFFECTIVE against a mutated organism */
export const INEFFECTIVE_ON_MUTATED = ["ceftriaxone", "tmp_smx", "fluoroquinolone"];

/**
 * MutationTracker — tracks per-organism mis-handle counts and mutation state.
 * Instantiate once per game session (or per level instance).
 */
export class MutationTracker {
  constructor() {
    // Maps organism id → { misHandleCount, mutated }
    this._state = {};
  }

  _ensure(organismId) {
    if (!this._state[organismId]) {
      this._state[organismId] = { misHandleCount: 0, mutated: false };
    }
  }

  isMutated(organismId) {
    this._ensure(organismId);
    return this._state[organismId].mutated;
  }

  getMisHandleCount(organismId) {
    this._ensure(organismId);
    return this._state[organismId].misHandleCount;
  }

  /**
   * Record a mis-handle event for a high-risk organism.
   * Returns { didMutate: bool } — true if THIS event crossed the threshold.
   */
  recordMisHandle(organism) {
    if (!organism || organism.riskTier !== "high") {
      return { didMutate: false };
    }
    this._ensure(organism.id);
    const entry = this._state[organism.id];
    if (entry.mutated) return { didMutate: false }; // already mutated

    entry.misHandleCount += 1;
    if (entry.misHandleCount >= MUTATION_THRESHOLD) {
      entry.mutated = true;
      return { didMutate: true };
    }
    return { didMutate: false };
  }

  /**
   * Check whether a weapon choice is effective against an organism
   * (taking mutation into account).
   * Returns { effective: bool, reason: string }
   */
  isWeaponEffective(weaponId, organism) {
    const mutated = this.isMutated(organism.id);
    if (mutated && INEFFECTIVE_ON_MUTATED.includes(weaponId)) {
      return {
        effective: false,
        reason: `This organism has adapted — ${weaponId} is no longer effective. Switch to Cefepime or a carbapenem.`,
      };
    }
    return { effective: true, reason: "" };
  }

  /** Get mutated visual modifier — caller applies to rendering */
  getMutationVisual(organism) {
    if (!this.isMutated(organism.id)) return null;
    return {
      colorTint: darkenHex(organism.color, 0.45),
      scale: 1.25,
      spiky: true,
      label: "MUTATED",
    };
  }

  /** Serialize for save/restore */
  serialize() {
    return JSON.stringify(this._state);
  }

  restore(json) {
    try {
      this._state = JSON.parse(json) || {};
    } catch {
      this._state = {};
    }
  }
}

/** Darken a hex color by `amount` (0–1). */
function darkenHex(hex, amount) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((n & 0xff) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
