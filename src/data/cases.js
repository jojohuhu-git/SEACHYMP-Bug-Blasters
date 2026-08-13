/**
 * cases.js — Level 3 clinical case cards.
 *
 * correctDecision maps to a weapon id from weapons.js.
 * rationale should be one concise sentence (teaching point).
 *
 * Teaching pattern:
 *   High-risk AmpC (Enterobacter, Citrobacter, K. aerogenes, Hafnia, Yersinia) →
 *     cefepime for any serious infection.
 *   Low-risk AmpC (Serratia, Aeromonas, Morganella, Providencia) →
 *     ceftriaxone often acceptable for routine infection, but cefepime for
 *     endovascular, prolonged, or high-inoculum infections.
 *   Carbapenems reserved for mutated AmpC organisms resistant to Cefepime, and for ESBL producers.
 *   Non-SEACHYMP distractors: release (colonizer/contaminant — don't treat).
 */

export const CASES = [
  // ── Serratia (low-risk AmpC) ─────────────────────────────────────────────

  {
    id: "case_serratia_pyelonephritis",
    organismId: "serratia",
    infection: "Pyelonephritis",
    sourceControl: "Achieved (no obstruction)",
    duration: "5 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Serratia is low-risk AmpC; for non-obstructed pyelonephritis a 5-day course of Ceftriaxone is clinically appropriate — the low induction risk supports a narrow, short regimen.",
  },
  {
    id: "case_serratia_endocarditis",
    organismId: "serratia",
    infection: "Native-valve endocarditis",
    sourceControl: "Not applicable",
    duration: "6 weeks",
    correctDecision: "cefepime",
    rationale:
      "Even for low-risk AmpC organisms, a 6-week endocarditis course raises the risk of de-repression under sustained cephalosporin pressure — Cefepime is safer for prolonged therapy.",
  },
  {
    id: "case_serratia_crbsi",
    organismId: "serratia",
    infection: "Catheter-related bloodstream infection",
    sourceControl: "Catheter removed",
    duration: "7 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Serratia bacteremia with catheter removal and no endovascular complication — low-risk AmpC with source control supports a 7-day Ceftriaxone course.",
  },

  // ── Enterobacter (high-risk AmpC) ────────────────────────────────────────

  {
    id: "case_enterobacter_bacteremia",
    organismId: "enterobacter",
    infection: "Bacteremia (line removed)",
    sourceControl: "Line removed",
    duration: "7 days",
    correctDecision: "cefepime",
    rationale:
      "Enterobacter is HIGH-risk AmpC; clinical failures with Ceftriaxone in Enterobacter bacteremia are well-documented — Cefepime is strongly preferred regardless of source control.",
  },
  {
    id: "case_enterobacter_pneumonia",
    organismId: "enterobacter",
    infection: "Hospital-acquired pneumonia",
    sourceControl: "N/A",
    duration: "5–7 days",
    correctDecision: "cefepime",
    rationale:
      "High-risk AmpC + pulmonary infection with high bacterial burden — Cefepime is indicated; de-repression under third-generation cephalosporins is a real risk here.",
  },
  {
    id: "case_enterobacter_uti",
    organismId: "enterobacter",
    infection: "Catheter-associated UTI",
    sourceControl: "Catheter removed",
    duration: "5 days",
    correctDecision: "cefepime",
    rationale:
      "Even for a short UTI course, Enterobacter's high-risk AmpC profile warrants Cefepime over Ceftriaxone to avoid selecting for resistance.",
  },

  // ── Citrobacter freundii (high-risk AmpC) ────────────────────────────────

  {
    id: "case_citrobacter_uti",
    organismId: "citrobacter",
    infection: "Uncomplicated UTI",
    sourceControl: "N/A",
    duration: "3–5 days",
    correctDecision: "cefepime",
    rationale:
      "Citrobacter freundii is HIGH-risk AmpC — Cefepime is the safer choice even for shorter courses to avoid selecting for AmpC de-repression.",
  },

  // ── Aeromonas (low-risk AmpC) ────────────────────────────────────────────

  {
    id: "case_aeromonas_wound",
    organismId: "aeromonas",
    infection: "Soft-tissue infection (freshwater exposure)",
    sourceControl: "Debridement done",
    duration: "5–7 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Aeromonas is low-risk AmpC; for a soft-tissue infection with adequate debridement, Ceftriaxone is appropriate — escalate to Cefepime only for serious high-inoculum infections.",
  },

  // ── Hafnia (high-risk AmpC) ───────────────────────────────────────────────

  {
    id: "case_hafnia_uti",
    organismId: "hafnia",
    infection: "Uncomplicated UTI",
    sourceControl: "N/A",
    duration: "3–5 days",
    correctDecision: "cefepime",
    rationale:
      "Hafnia is high-risk AmpC; even for a straightforward UTI, Cefepime is preferred over Ceftriaxone to avoid selecting for AmpC de-repression.",
  },
  {
    id: "case_hafnia_bacteremia",
    organismId: "hafnia",
    infection: "Intra-abdominal abscess (Hafnia)",
    sourceControl: "Abscess drained",
    duration: "4 days",
    correctDecision: "cefepime",
    rationale:
      "High-risk AmpC intra-abdominal abscess — even with source control achieved (drained), Cefepime is preferred over Ceftriaxone to avoid selecting for AmpC de-repression.",
  },

  // ── Morganella (low-risk AmpC) ────────────────────────────────────────────

  {
    id: "case_morganella_wound",
    organismId: "morganella",
    infection: "Surgical wound infection",
    sourceControl: "Debridement performed",
    duration: "5–7 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Morganella morganii is low induction risk; with adequate debridement, a 5–7-day Ceftriaxone course is clinically appropriate.",
  },
  {
    id: "case_morganella_uti",
    organismId: "morganella",
    infection: "Complicated UTI (obstructive uropathy, stent placed)",
    sourceControl: "Stent placed",
    duration: "5 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Low-risk AmpC UTI with source control achieved — a 5-day Ceftriaxone course is adequate; re-evaluate if clinical deterioration occurs.",
  },

  // ── Providencia (low-risk AmpC) ──────────────────────────────────────────

  {
    id: "case_providencia_uti",
    organismId: "providencia",
    infection: "Catheter-associated UTI (long-term care)",
    sourceControl: "Catheter changed",
    duration: "5–7 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Providencia is low-risk AmpC; a 5–7-day Ceftriaxone course following catheter exchange is appropriate for uncomplicated catheter-associated UTI.",
  },
  {
    id: "case_providencia_bacteremia",
    organismId: "providencia",
    infection: "Bacteremia (urinary source, catheter removed)",
    sourceControl: "Catheter removed",
    duration: "7 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Low-risk AmpC bacteremia with source control — a 7-day Ceftriaxone course is appropriate for urinary-source bacteremia; no indication for routine Cefepime escalation.",
  },

  // ── Klebsiella aerogenes (high-risk AmpC, bonus) ──────────────────────────

  {
    id: "case_klebsiella_aerogenes_bacteremia",
    organismId: "klebsiella_aerogenes",
    infection: "Bacteremia (biliary source, ERCP drainage)",
    sourceControl: "Biliary drainage achieved",
    duration: "7 days",
    correctDecision: "cefepime",
    rationale:
      "Klebsiella aerogenes shares the high-risk AmpC profile of Enterobacter — Cefepime is preferred for bacteremia even after source control.",
  },
  {
    id: "case_klebsiella_aerogenes_icu_pneumonia",
    organismId: "klebsiella_aerogenes",
    infection: "Ventilator-associated pneumonia",
    sourceControl: "N/A",
    duration: "7 days",
    correctDecision: "cefepime",
    rationale:
      "High-risk AmpC VAP — Cefepime is strongly preferred; empiric Ceftriaxone in this setting risks clinical failure due to de-repression.",
  },
];

export default CASES;
