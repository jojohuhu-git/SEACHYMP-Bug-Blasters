# SEACHYMP: Bug Blasters — Drug/Bug Adjudication Sheet

> **How to use this file:** This is the code-accurate rule set the game currently enforces
> (pulled from `src/logic/weaponChoice.js`, `src/data/cases.js`, `src/logic/mutation.js`,
> and the risk tiers in `src/data/organisms.js`).
>
> For each rule, fill in the **Approved?** column (`Y` / `N`) and, if changing,
> write the desired behavior in **Change to / Notes**. Hand the file back and I'll
> apply every adjudication in one pass, then re-verify the build.

Last generated: 2026-06-03 · Cases: 20 · Source of truth: `src/data/`

---

## Organism risk tiers (input to every rule)

| Tier | Organisms | Approved? | Change to / Notes |
|---|---|---|---|
| **High-risk AmpC** | Enterobacter cloacae, Citrobacter freundii, Klebsiella aerogenes | | |
| **Low-risk AmpC** | Serratia marcescens, Aeromonas hydrophila, Hafnia alvei, Yersinia enterocolitica, Morganella morganii, Providencia stuartii | | |
| **Non-AmpC distractors** | E. coli, K. pneumoniae, K. oxytoca, C. koseri, P. mirabilis, P. penneri, E. faecalis, S. aureus, S. pneumoniae, E. faecium, + 4 reef critters | | |

---

## LEVEL 1 — Identify (no drugs)

| # | Rule | Correct? | Approved? | Change to / Notes |
|---|---|---|---|---|
| L1-1 | "Identify" a SEACHYMP organism (any high/low AmpC, incl. K. aerogenes bonus) | ✅ correct | | |
| L1-2 | "Ignore" a non-AmpC distractor | ✅ correct | | |
| L1-3 | "Identify" a distractor, or "ignore" a SEACHYMP organism | ❌ incorrect | | |

Notes: risk tier is hidden until after the decision.

---

## LEVEL 2 — Weapon Match (`classifyChoice`)

Fixed matrix of organism tier × weapon. ✅ = counts correct (advances reef), ❌ = incorrect.

| # | Organism tier | Weapon | Engine result | Correct? | Approved? | Change to / Notes |
|---|---|---|---|---|---|---|
| L2-1 | High-risk AmpC | Cefepime | preferred | ✅ | | |
| L2-2 | High-risk AmpC | Ceftriaxone | wrong (de-repression risk) | ❌ | | |
| L2-3 | High-risk AmpC | TMP-SMX | wrong (not first-line) | ❌ | | |
| L2-4 | High-risk AmpC | Fluoroquinolone | wrong (not first-line) | ❌ | | |
| L2-5 | High-risk AmpC | Carbapenem | reserve | ❌ | | |
| L2-6 | High-risk AmpC | Release | wrong (needed treatment) | ❌ | | |
| L2-7 | Low-risk AmpC | Ceftriaxone | preferred (narrow) | ✅ | | |
| L2-8 | Low-risk AmpC | Cefepime | acceptable (broader than needed) | ✅ | | |
| L2-9 | Low-risk AmpC | TMP-SMX | acceptable | ✅ | | |
| L2-10 | Low-risk AmpC | Fluoroquinolone | acceptable | ✅ | | |
| L2-11 | Low-risk AmpC | Carbapenem | reserve | ❌ | | |
| L2-12 | Low-risk AmpC | Release | wrong (needed treatment) | ❌ | | |
| L2-13 | Non-AmpC distractor | Release | release-correct | ✅ | | |
| L2-14 | Non-AmpC distractor | Any antibiotic | overtreatment | ❌ | | |
| L2-15 | Mutated form | Ceftriaxone / TMP-SMX / FQ | ineffective | ❌ | | |
| L2-16 | Mutated form | Cefepime | preferred | ✅ | | |
| L2-17 | Mutated form | Carbapenem | reserve | ❌ (see FLAG-1) | | |

---

## LEVEL 3 — Stewardship Challenge (case-driven)

Correctness = **exact match to `correctDecision`** (only the one listed drug counts correct;
all others are incorrect). Non-AmpC distractors that drift in → Release is correct.

| # | Organism | Infection | Source control | Duration | Correct drug | Approved? | Change to / Add acceptable alts |
|---|---|---|---|---|---|---|---|
| L3-1 | Serratia | Pyelonephritis | Achieved | 7 d | Ceftriaxone | | |
| L3-2 | Serratia | Native-valve endocarditis | N/A | 6 wk | Cefepime | | |
| L3-3 | Serratia | Catheter-related BSI | Catheter removed | 14 d | Ceftriaxone | | |
| L3-4 | Enterobacter | Bacteremia | Line removed | 14 d | Cefepime | | |
| L3-5 | Enterobacter | Hospital-acquired pneumonia | N/A | 8 d | Cefepime | | |
| L3-6 | Enterobacter | Catheter-assoc UTI | Catheter removed | 5 d | Cefepime | | |
| L3-7 | Citrobacter | Uncomplicated UTI | N/A | 5 d | Cefepime | | |
| L3-8 | Citrobacter | Post-neurosurgical meningitis | Drain repositioned | 21 d | Cefepime | | |
| L3-9 | Aeromonas | Soft-tissue (freshwater) | Debridement | 7 d | Fluoroquinolone | | |
| L3-10 | Aeromonas | Severe gastroenteritis (immunocomp) | N/A | 5 d | Fluoroquinolone | | |
| L3-11 | Hafnia | Uncomplicated UTI | N/A | 5 d | Ceftriaxone | | |
| L3-12 | Hafnia | Bacteremia (bowel, drained) | Drainage | 14 d | Ceftriaxone | | |
| L3-13 | Morganella | Surgical wound | Debridement | 10 d | Ceftriaxone | | |
| L3-14 | Morganella | Complicated UTI (stent) | Stent placed | 14 d | Ceftriaxone | | |
| L3-15 | Providencia | Catheter-assoc UTI | Catheter changed | 7 d | Ceftriaxone | | |
| L3-16 | Providencia | Bacteremia (urinary) | Catheter removed | 14 d | Ceftriaxone | | |
| L3-17 | Yersinia | Invasive enteritis (immunocomp) | N/A | 5 d | Fluoroquinolone | | |
| L3-18 | Yersinia | Bacteremia (blood product) | N/A | 14 d | Fluoroquinolone | | |
| L3-19 | K. aerogenes | Bacteremia (biliary) | ERCP drainage | 14 d | Cefepime | | |
| L3-20 | K. aerogenes | Ventilator-assoc pneumonia | N/A | 8 d | Cefepime | | |

### Per-case rationale (for reference while adjudicating)

- **L3-1** Serratia low-risk; non-obstructed pyelonephritis, short course → Ceftriaxone acceptable.
- **L3-2** 6-week endocarditis course → sustained cephalosporin pressure risks de-repression → Cefepime.
- **L3-3** Bacteremia + catheter removed, no endovascular complication → Ceftriaxone reasonable.
- **L3-4** Enterobacter high-risk; documented Ceftriaxone failures in bacteremia → Cefepime regardless of source control.
- **L3-5** High-risk + high-burden pulmonary infection → Cefepime.
- **L3-6** Short UTI course but high-risk profile → Cefepime to avoid selecting resistance.
- **L3-7** Citrobacter freundii high-risk → Cefepime even for shorter courses (FQ/TMP-SMX alternatives if susceptible).
- **L3-8** High-risk meningitis, prolonged CNS course → Cefepime (or carbapenem).
- **L3-9** Aeromonas freshwater wound; intrinsic ampicillin resistance → FQ or TMP-SMX preferred over beta-lactams.
- **L3-10** Aeromonas gastroenteritis in immunocompromised host → FQ first-line when treatment indicated.
- **L3-11** Hafnia low-risk; straightforward UTI → Ceftriaxone.
- **L3-12** Low-risk bacteremia with source control → 14-day Ceftriaxone reasonable.
- **L3-13** Morganella low induction risk + debridement → Ceftriaxone.
- **L3-14** Low-risk UTI with source control → Ceftriaxone covers prolonged course.
- **L3-15** Providencia low-risk; catheter-assoc UTI after exchange → Ceftriaxone.
- **L3-16** Low-risk urinary-source bacteremia with source control → Ceftriaxone.
- **L3-17** Yersinia invasive infection in immunocompromised host → FQ or TMP-SMX preferred.
- **L3-18** Yersinia bacteremia from blood products; guideline-preferred FQ + aminoglycoside or 3rd-gen ceph — FQ monotherapy reasonable for step-down.
- **L3-19** K. aerogenes shares Enterobacter high-risk profile → Cefepime even after source control.
- **L3-20** High-risk VAP → Cefepime; empiric Ceftriaxone risks failure via de-repression.

---

## Mutation rule (Levels 2 & 3)

| # | Rule | Current behavior | Approved? | Change to / Notes |
|---|---|---|---|---|
| MUT-1 | Trigger | 3 inappropriate Ceftriaxone calls on the SAME high-risk organism type (wrong + Ceftriaxone + riskTier "high") | | |
| MUT-2 | Threshold value | 3 (`MUTATION_THRESHOLD`) | | |
| MUT-3 | Effect | Type flips to AmpC Mutation Form; Ceftriaxone, TMP-SMX, Fluoroquinolone become ineffective; must use Cefepime or Carbapenem | | |
| MUT-4 | Scope | Only high-risk AmpC types can mutate; low-risk and distractors never mutate | | |

---

## Flagged design inconsistencies (please decide)

| Flag | Issue | Options | Decision |
|---|---|---|---|
| FLAG-1 | Carbapenem on a **mutated** organism is marked incorrect (L2-17), but the mutation feedback says "switch to Cefepime **or a carbapenem**." | (a) make carbapenem correct once mutated · (b) leave as-is | |
| FLAG-2 | Level 3 accepts only ONE correct drug per case, yet several rationales name alternatives (L3-9, L3-10, L3-17 mention "FQ **or TMP-SMX**"). | (a) let each case accept a SET of acceptable drugs · (b) keep single answer | |
| FLAG-3 | Low-risk AmpC + TMP-SMX/FQ: Level 2 counts these correct (L2-9/L2-10), but Level 3 only counts the single case answer — engines disagree. | (a) reconcile (define acceptable sets shared by both) · (b) accept the divergence | |
| FLAG-4 | Carbapenem is never "correct" in Level 2 for any organism (pure reserve). | (a) confirm intended · (b) allow correct in some scenario | |

---

## Global adjudication notes (free text)

> Add any cross-cutting changes, new cases to add, organisms to re-tier, or wording fixes here:

-
-
-
