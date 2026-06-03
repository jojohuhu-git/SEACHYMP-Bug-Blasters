/**
 * cases.js — Level 3 clinical case cards.
 *
 * Even though Level 3 is not fully built in this slice, the data
 * is defined here so it is ready. correctDecision maps to a weapon id.
 */

export const CASES = [
  {
    id: "case_serratia_pyelonephritis",
    organismId: "serratia",
    infection: "Pyelonephritis",
    sourceControl: "Achieved",
    duration: "7 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Serratia is a low-risk AmpC producer. For pyelonephritis with adequate source control and a short course, Ceftriaxone is clinically acceptable — the organism alone does not determine the antibiotic; context matters. High inoculum or clinical deterioration should prompt reassessment.",
  },
  {
    id: "case_serratia_endocarditis",
    organismId: "serratia",
    infection: "Endocarditis",
    sourceControl: "Not applicable",
    duration: "6 weeks",
    correctDecision: "cefepime",
    rationale:
      "Endocarditis requires a prolonged course with sustained high serum concentrations. Even for 'low-risk' AmpC organisms like Serratia, the risk of de-repression during a 6-week endocarditis course argues for Cefepime over Ceftriaxone. The infection type and duration shift the calculus.",
  },
  {
    id: "case_enterobacter_bacteremia",
    organismId: "enterobacter",
    infection: "Bacteremia",
    sourceControl: "Line removed",
    duration: "14 days",
    correctDecision: "cefepime",
    rationale:
      "Enterobacter cloacae is HIGH-risk AmpC. For bacteremia — even with source control — Cefepime is strongly preferred over 3rd-gen cephalosporins. Clinical failures with Ceftriaxone in Enterobacter bacteremia are well-documented due to AmpC de-repression.",
  },
  {
    id: "case_citrobacter_uti",
    organismId: "citrobacter",
    infection: "Uncomplicated UTI",
    sourceControl: "N/A",
    duration: "5 days",
    correctDecision: "cefepime",
    rationale:
      "Citrobacter freundii is HIGH-risk AmpC. Even for a shorter UTI course, Cefepime is the safer choice given the risk of selecting for resistance. Fluoroquinolones or TMP-SMX may be acceptable if susceptibilities confirm — but not 3rd-gen cephalosporins.",
  },
  {
    id: "case_morganella_wound",
    organismId: "morganella",
    infection: "Wound infection",
    sourceControl: "Debridement performed",
    duration: "10 days",
    correctDecision: "ceftriaxone",
    rationale:
      "Morganella morganii is considered low induction risk. With good source control (debridement) and a moderate-length course, Ceftriaxone is typically acceptable. Monitor for clinical response.",
  },
];

export default CASES;
