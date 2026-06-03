/**
 * cases.js — Level 3 clinical case cards.
 *
 * correctDecision maps to a weapon id from weapons.js.
 * rationale should be one concise sentence (teaching point).
 *
 * Teaching pattern:
 *   High-risk AmpC (Enterobacter, Citrobacter, K. aerogenes) → cefepime for any serious infection.
 *   Low-risk AmpC (Serratia, Aeromonas, Hafnia, Yersinia, Morganella, Providencia) →
 *     ceftriaxone often acceptable for routine infection, but cefepime for
 *     endovascular, prolonged, or high-inoculum infections.
 *   Carbapenems reserved; TMP-SMX/FQ acceptable for susceptible low-risk UTI/enteric.
 *   Non-SEACHYMP distractors: release (colonizer/contaminant — don't treat).
 */

export const CASES = [
  // ── Serratia (low-risk AmpC) ─────────────────────────────────────────────

  {
    id: "case_serratia_pyelonephritis",
    organismId: "serratia",
    infection: "Pyelonephritis",
    sourceControl: "Achieved (no obstruction)",
    duration: "7 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Serratia is low-risk AmpC; for non-obstructed pyelonephritis with a short course, Ceftriaxone is clinically acceptable — context shifts the calculus more than organism alone.",
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
    duration: "14 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Serratia bacteremia with catheter removal and no endovascular complication — low-risk AmpC + source control achieved makes a 14-day Ceftriaxone course reasonable.",
  },

  // ── Enterobacter (high-risk AmpC) ────────────────────────────────────────

  {
    id: "case_enterobacter_bacteremia",
    organismId: "enterobacter",
    infection: "Bacteremia (line removed)",
    sourceControl: "Line removed",
    duration: "14 days",
    correctDecision: "cefepime",
    rationale:
      "Enterobacter is HIGH-risk AmpC; clinical failures with Ceftriaxone in Enterobacter bacteremia are well-documented — Cefepime is strongly preferred regardless of source control.",
  },
  {
    id: "case_enterobacter_pneumonia",
    organismId: "enterobacter",
    infection: "Hospital-acquired pneumonia",
    sourceControl: "N/A",
    duration: "8 days",
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
    duration: "5 days",
    correctDecision: "cefepime",
    rationale:
      "Citrobacter freundii is HIGH-risk AmpC — Cefepime is the safer choice even for shorter courses; fluoroquinolones or TMP-SMX are alternatives if susceptibilities confirm.",
  },
  {
    id: "case_citrobacter_meningitis",
    organismId: "citrobacter",
    infection: "Post-neurosurgical meningitis",
    sourceControl: "Drain repositioned",
    duration: "21 days",
    correctDecision: "cefepime",
    rationale:
      "High-risk AmpC meningitis requires a prolonged, CNS-penetrating regimen — Cefepime (or a carbapenem) is standard; Ceftriaxone risks AmpC de-repression over weeks.",
  },

  // ── Aeromonas (low-risk AmpC) ────────────────────────────────────────────

  {
    id: "case_aeromonas_wound",
    organismId: "aeromonas",
    infection: "Soft-tissue infection (freshwater exposure)",
    sourceControl: "Debridement done",
    duration: "7 days",
    correctDecision: "fluoroquinolone",
    rationale:
      "Aeromonas wound infections following freshwater exposure respond well to fluoroquinolones or TMP-SMX; intrinsic ampicillin resistance makes these preferred over beta-lactams alone.",
  },
  {
    id: "case_aeromonas_gastroenteritis",
    organismId: "aeromonas",
    infection: "Severe gastroenteritis (immunocompromised host)",
    sourceControl: "N/A",
    duration: "5 days",
    correctDecision: "fluoroquinolone",
    rationale:
      "Aeromonas gastroenteritis in an immunocompromised patient warrants treatment; fluoroquinolones are first-line when therapy is indicated.",
  },

  // ── Hafnia (low-risk AmpC) ────────────────────────────────────────────────

  {
    id: "case_hafnia_uti",
    organismId: "hafnia",
    infection: "Uncomplicated UTI",
    sourceControl: "N/A",
    duration: "5 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Hafnia is low-risk AmpC; Ceftriaxone is appropriate for a straightforward UTI — the organism alone does not demand escalation.",
  },
  {
    id: "case_hafnia_bacteremia",
    organismId: "hafnia",
    infection: "Bacteremia (bowel source, surgically drained)",
    sourceControl: "Drainage achieved",
    duration: "14 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Low-risk AmpC bacteremia with source control; a 14-day Ceftriaxone course is reasonable — no strong evidence for routine escalation in Hafnia bacteremia.",
  },

  // ── Morganella (low-risk AmpC) ────────────────────────────────────────────

  {
    id: "case_morganella_wound",
    organismId: "morganella",
    infection: "Surgical wound infection",
    sourceControl: "Debridement performed",
    duration: "10 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Morganella morganii is low induction risk; with adequate debridement and a moderate course, Ceftriaxone is clinically appropriate.",
  },
  {
    id: "case_morganella_uti",
    organismId: "morganella",
    infection: "Complicated UTI (obstructive uropathy, stent placed)",
    sourceControl: "Stent placed",
    duration: "14 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Low-risk AmpC UTI with source control achieved — Ceftriaxone covers the prolonged course adequately; re-evaluate if clinical deterioration occurs.",
  },

  // ── Providencia (low-risk AmpC) ──────────────────────────────────────────

  {
    id: "case_providencia_uti",
    organismId: "providencia",
    infection: "Catheter-associated UTI (long-term care)",
    sourceControl: "Catheter changed",
    duration: "7 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Providencia is low-risk AmpC; a 7-day Ceftriaxone course following catheter exchange is appropriate for uncomplicated catheter-associated UTI.",
  },
  {
    id: "case_providencia_bacteremia",
    organismId: "providencia",
    infection: "Bacteremia (urinary source, catheter removed)",
    sourceControl: "Catheter removed",
    duration: "14 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Low-risk AmpC bacteremia with source control — Ceftriaxone is adequate for a 14-day urinary-source bacteremia; no indication for routine Cefepime escalation.",
  },

  // ── Yersinia (low-risk AmpC) ─────────────────────────────────────────────

  {
    id: "case_yersinia_enteritis",
    organismId: "yersinia",
    infection: "Invasive enteritis (immunocompromised)",
    sourceControl: "N/A",
    duration: "5 days",
    correctDecision: "fluoroquinolone",
    rationale:
      "Yersinia invasive infection in an immunocompromised host responds best to fluoroquinolones or TMP-SMX; Ceftriaxone is an alternative but FQs are preferred by most guidelines.",
  },
  {
    id: "case_yersinia_bacteremia",
    organismId: "yersinia",
    infection: "Bacteremia (contaminated blood product exposure)",
    sourceControl: "N/A",
    duration: "14 days",
    correctDecision: "fluoroquinolone",
    rationale:
      "Yersinia bacteremia from contaminated blood products is life-threatening; fluoroquinolone plus an aminoglycoside or third-generation cephalosporin is guideline-preferred — fluoroquinolone monotherapy is reasonable for step-down.",
  },

  // ── Klebsiella aerogenes (high-risk AmpC, bonus) ──────────────────────────

  {
    id: "case_klebsiella_aerogenes_bacteremia",
    organismId: "klebsiella_aerogenes",
    infection: "Bacteremia (biliary source, ERCP drainage)",
    sourceControl: "Biliary drainage achieved",
    duration: "14 days",
    correctDecision: "cefepime",
    rationale:
      "Klebsiella aerogenes shares the high-risk AmpC profile of Enterobacter — Cefepime is preferred for bacteremia even after source control.",
  },
  {
    id: "case_klebsiella_aerogenes_icu_pneumonia",
    organismId: "klebsiella_aerogenes",
    infection: "Ventilator-associated pneumonia",
    sourceControl: "N/A",
    duration: "8 days",
    correctDecision: "cefepime",
    rationale:
      "High-risk AmpC VAP — Cefepime is strongly preferred; empiric Ceftriaxone in this setting risks clinical failure due to de-repression.",
  },
];

export default CASES;
