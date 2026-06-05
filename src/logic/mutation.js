/**
 * mutation.js — Shared mutation engine.
 *
 * Rule: if the player mis-handles the SAME organism TYPE (by id / name)
 * MUTATION_THRESHOLD times across any number of floating instances,
 * that organism type "adapts".
 *
 * The counter is keyed on organism.id (the canonical type, e.g. "enterobacter"),
 * NOT on the floating instance. Clicking three different drifting Enterobacter
 * wrong is the same as clicking one three times.
 *
 * In mutated form:
 *   - Visual: darker tint, spikier placeholder, `mutated: true` flag
 *   - Ceftriaxone is flagged ineffective
 *   - Player must switch to Cefepime or a carbapenem
 *
 * This module is UI-agnostic — it manages state and returns decisions.
 * The caller (canvas scene / game engine) is responsible for showing
 * the "The organism has adapted." banner.
 */

// TODO: sound — play an ominous mutation sound here
export const MUTATION_THRESHOLD = 3; // incorrect handlings of SAME TYPE before mutation

/** Weapons that are INEFFECTIVE against a mutated organism */
export const INEFFECTIVE_ON_MUTATED = ["ceftriaxone"];

/**
 * MutationTracker — tracks per-organism-type mis-handle counts and mutation state.
 * Keyed on organism.id (canonical type, shared across all floating instances of
 * the same named organism).
 * Instantiate once per game session (or per level instance).
 */
export class MutationTracker {
  constructor() {
    // Maps organism.id (type) → { misHandleCount, mutated }
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
   * Record an incorrect handling event for an organism TYPE.
   * "Incorrect handling" means: wrong identify/ignore decision regardless of riskTier.
   * The mutation threshold is only crossed for high-risk organisms (riskTier === "high"),
   * but we count mis-handles for any type so callers can drive different visual cues later.
   *
   * Returns { didMutate: bool } — true if THIS event crossed the threshold.
   */
  recordMisHandle(organism) {
    if (!organism) return { didMutate: false };
    // Only high-risk organisms can mutate
    if (organism.riskTier !== "high") return { didMutate: false };

    // Key is organism.id — the TYPE, shared across all floating instances
    const typeId = organism.id;
    this._ensure(typeId);
    const entry = this._state[typeId];
    if (entry.mutated) return { didMutate: false }; // already mutated

    entry.misHandleCount += 1;
    if (entry.misHandleCount >= MUTATION_THRESHOLD) {
      entry.mutated = true;
      return { didMutate: true };
    }
    return { didMutate: false };
  }

  /**
   * Record an INAPPROPRIATE CEFTRIAXONE event for an organism TYPE.
   *
   * This is the Level 2 mutation driver: giving Ceftriaxone to a high-risk
   * AmpC organism selects for resistance. MUTATION_THRESHOLD such calls on the
   * same organism type (across any number of floating instances) trigger the
   * AmpC Mutation Form. Other wrong weapon choices do NOT breed resistance.
   *
   * Delegates to the same per-type counter as recordMisHandle (gated on
   * riskTier === "high"), so callers should only invoke this for an actual
   * inappropriate-Ceftriaxone event.
   *
   * Returns { didMutate: bool } — true if THIS event crossed the threshold.
   */
  recordInappropriateCeftriaxone(organism) {
    return this.recordMisHandle(organism);
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
