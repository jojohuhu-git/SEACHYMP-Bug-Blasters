/**
 * weaponChoice.js — classifyChoice() for Level 2 Weapon Match.
 *
 * Teaching axis: Cefepime (high-risk) vs Ceftriaxone (low-risk).
 *
 * Returns:
 *   {
 *     status: "preferred" | "acceptable" | "reserve" | "wrong"
 *             | "overtreatment" | "release-correct",
 *     heading: string,         // short result headline
 *     feedback: string,        // one-sentence educational note
 *     isCorrect: boolean,      // advances reef progress
 *   }
 */

import { INEFFECTIVE_ON_MUTATED } from "./mutation.js";

/**
 * classifyChoice(org, weaponId, mutated)
 *
 * @param {object} org        — organism data from organisms.js
 * @param {string|null} weaponId — weapon id, or null for "release"
 * @param {boolean} mutated   — whether this organism type has mutated
 */
export function classifyChoice(org, weaponId, mutated) {
  // Non-AmpC distractors: correct action is to release, not treat
  if (!org.isSeachymp) {
    if (weaponId === null) {
      return {
        status: "release-correct",
        heading: "Good call.",
        feedback:
          "This organism is not an AmpC producer — releasing it is the right stewardship move. Treat only what needs treating.",
        isCorrect: true,
      };
    }
    return {
      status: "overtreatment",
      heading: "Unnecessary treatment.",
      feedback:
        "This reef organism did not need antibiotics. Good stewardship means not treating what you do not have to. " +
        org.name + " is not an AmpC producer.",
      isCorrect: false,
    };
  }

  // SEACHYMP organism — a weapon is required
  if (weaponId === null) {
    return {
      status: "wrong",
      heading: "This one needed treatment.",
      feedback:
        org.name +
        " is an AmpC-producing organism that required an antibiotic. Releasing it was not the right call here.",
      isCorrect: false,
    };
  }

  // Mutated form: Ceftriaxone, TMP-SMX, and Fluoroquinolones are ineffective
  if (mutated && INEFFECTIVE_ON_MUTATED.includes(weaponId)) {
    return {
      status: "wrong",
      heading: "Ineffective against mutated form.",
      feedback:
        "This organism has adapted — " +
        weaponId.replace("_", "-") +
        " is no longer effective. Switch to Cefepime or a carbapenem.",
      isCorrect: false,
    };
  }

  const tier = org.riskTier; // "high" | "low"

  if (weaponId === "cefepime") {
    // Always effective for both tiers
    if (tier === "high") {
      return {
        status: "preferred",
        heading: "Correct — preferred choice.",
        feedback:
          org.name +
          " is a high-risk AmpC producer. Cefepime is the preferred agent — it is stable against AmpC de-repression.",
        isCorrect: true,
      };
    }
    // low-risk: works but broader than needed
    return {
      status: "acceptable",
      heading: "Effective, but broader than needed.",
      feedback:
        org.name +
        " is low-risk AmpC. Cefepime works, but Ceftriaxone is often sufficient here. Good stewardship means narrowing when you can.",
      isCorrect: true,
    };
  }

  if (weaponId === "ceftriaxone") {
    if (tier === "high") {
      return {
        status: "wrong",
        heading: "Risk of clinical failure.",
        feedback:
          org.name +
          " is a high-risk AmpC producer. Ceftriaxone risks AmpC de-repression and clinical failure in serious infections. Prefer Cefepime.",
        isCorrect: false,
      };
    }
    // low-risk: correct
    return {
      status: "preferred",
      heading: "Correct — good stewardship.",
      feedback:
        org.name +
        " is low-risk AmpC. Ceftriaxone is an appropriate, narrow choice for most serious infections with this organism.",
      isCorrect: true,
    };
  }

  if (weaponId === "carbapenem") {
    return {
      status: "reserve",
      heading: "Works, but reserve it.",
      feedback:
        "Carbapenems are effective here, but they should be reserved for confirmed resistance, ESBL/carbapenemase producers, or when all else fails. " +
        (tier === "high"
          ? "Cefepime is the first-line choice for this organism."
          : "Ceftriaxone or Cefepime is preferred."),
      isCorrect: false,
    };
  }

  if (weaponId === "tmp_smx" || weaponId === "fluoroquinolone") {
    if (tier === "high") {
      return {
        status: "wrong",
        heading: "Not first-line for serious high-risk AmpC.",
        feedback:
          org.name +
          " is a high-risk AmpC producer. " +
          (weaponId === "tmp_smx" ? "TMP-SMX" : "Fluoroquinolones") +
          " are not first-line empiric therapy for serious infections with this organism. Prefer Cefepime.",
        isCorrect: false,
      };
    }
    // low-risk: acceptable in select situations
    return {
      status: "acceptable",
      heading: "Acceptable in select situations.",
      feedback:
        (weaponId === "tmp_smx" ? "TMP-SMX" : "Fluoroquinolones") +
        " can be appropriate for susceptible low-risk AmpC organisms. Confirm susceptibilities and ensure this matches the clinical scenario.",
      isCorrect: true,
    };
  }

  // Fallback (unknown weapon)
  return {
    status: "wrong",
    heading: "Unclear choice.",
    feedback: "That weapon was not matched to a known antibiotic class.",
    isCorrect: false,
  };
}
