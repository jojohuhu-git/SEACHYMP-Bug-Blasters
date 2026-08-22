# SEACHYMP: Bug Blasters — Rules & Comments Review Sheet

> **How to use this file.** This is the code-accurate rule set **and** the editable text
> the game shows the player — pulled live from `src/logic/weaponChoice.js`,
> `src/data/cases.js`, `src/logic/mutation.js`, `src/data/organisms.js`, and the scene
> banners. It now covers three things you can review and change:
>
> 1. **The rules** — what counts correct in Levels 1–3 and how mutation works.
> 2. **Per-organism comments** — the blurb shown when a bug is **caught**, plus its teaching point.
> 3. **Pop-up feedback** — the message shown when a bug is **shot** with an antibiotic.
>
> To request a change: write the desired text/behavior on the **✎ Change:** line (or in the
> **Change to / Notes** column). Hand the file back and I'll apply every edit in one pass
> across all code surfaces, then rebuild, re-verify, and redeploy.

Last generated: **2026-08-22** · Organisms: **22** · Level 3 cases: **17** · Source of truth: `src/`

---

## Source-of-truth map (where each editable string lives)

| What | File |
|---|---|
| Organism risk tiers, **catch blurbs**, teaching points | `src/data/organisms.js` |
| **Shot feedback** — Level 2 (headings + sentences) | `src/logic/weaponChoice.js` (`classifyChoice`) |
| **Shot feedback** — Level 3 (case-driven) | `src/screens/Level3Scene.jsx` (`CaseCard`) + `src/data/cases.js` rationales |
| Mutation banners | `Level2Scene.jsx`, `Level3Scene.jsx`, `InfoCard.jsx`, `Level1Scene.jsx`, `HowToPlay.jsx` |
| Mutation rule (threshold, ineffective drug) | `src/logic/mutation.js` |
| Weapon names/descriptions | `src/data/weapons.js` |
| Release button label (L2/L3) | `Level2Scene.jsx`, `Level3Scene.jsx` |
| Per-level intro card (goal + controls) | `src/data/levelIntros.js`, `LevelIntro.jsx` |

> ⚠ **Note on blurbs:** several catch blurbs still describe the *previous* placeholder
> creature, not the new sea-creature art (e.g. Hafnia reads "purple blobfish" but the art is
> a **cowfish**; Providencia reads "sea cucumber" but the art is a **sea urchin**; the
> gram-positives read "anemone/coral/shells"). Rewrite any you want to match the art in the
> per-organism section below.

---

## Organism risk tiers (input to every rule)

| Tier | Organisms | Approved? | Change to / Notes |
|---|---|---|---|
| **High-risk AmpC** | Enterobacter cloacae, Citrobacter freundii, Klebsiella aerogenes (bonus), Hafnia alvei, Yersinia enterocolitica | ✅ applied | |
| **Low-risk AmpC** | Serratia marcescens, Aeromonas hydrophila, Morganella morganii, Providencia stuartii | | |
| **Non-AmpC distractors** | E. coli, K. pneumoniae, K. oxytoca, C. koseri, P. mirabilis, P. penneri, E. faecalis, S. aureus, S. pneumoniae, E. faecium, Dumbo Octopus, Coral, Friendly Clam | | |

Arsenal (3 weapons): **Ceftriaxone**, **Cefepime**, **Carbapenems**. Carbapenem's
"Appropriate for" tag on the Weapons screen is now **HIGH RISK only** (2026-08-22) —
it was previously flagged low-risk too, which contradicted the low-risk scoring rule
below (L2-7: carbapenem is reserve/incorrect for low-risk).

---

## LEVEL 1 — Identify (no drugs)

| # | Rule | Correct? | Approved? | Change to / Notes |
|---|---|---|---|---|
| L1-1 | "Identify" a SEACHYMP organism (any high/low AmpC, incl. K. aerogenes bonus) | ✅ correct | | |
| L1-2 | "Ignore" a non-AmpC distractor | ✅ correct | | |
| L1-3 | "Identify" a distractor, or "ignore" a SEACHYMP organism | ❌ incorrect | | |

Risk tier is hidden until after the decision.

---

## LEVEL 2 — Weapon Match (`classifyChoice`)

Fixed matrix of organism state × weapon. ✅ = counts correct (advances reef), ❌ = incorrect.

| # | Organism state | Weapon | Engine result | Correct? | Approved? | Change to / Notes |
|---|---|---|---|---|---|---|
| L2-1 | High-risk AmpC | Cefepime | preferred | ✅ | | |
| L2-2 | High-risk AmpC | Ceftriaxone | wrong (de-repression risk) | ❌ | | |
| L2-3 | High-risk AmpC | Carbapenem | acceptable — reserve it | ✅ | | |
| L2-4 | High-risk AmpC | Release | wrong (needed treatment) | ❌ | | |
| L2-5 | Low-risk AmpC | Ceftriaxone | preferred (narrow) | ✅ | | |
| L2-6 | Low-risk AmpC | Cefepime | acceptable (broader than needed) | ✅ | | |
| L2-7 | Low-risk AmpC | Carbapenem | reserve (incorrect) | ❌ | | |
| L2-8 | Low-risk AmpC | Release | wrong (needed treatment) | ❌ | | |
| L2-9 | Non-AmpC distractor | Release | release-correct | ✅ | | |
| L2-10 | Non-AmpC distractor | Any antibiotic | overtreatment | ❌ | | |
| L2-11 | **Mutated** form | Ceftriaxone | ineffective | ❌ | | |
| L2-12 | **Mutated** form | Cefepime | correct (co-equal w/ carbapenem) | ✅ | | |
| L2-13 | **Mutated** form | Carbapenem | correct (co-equal w/ Cefepime) | ✅ | | |

**Mutated rule (current):** once an organism de-represses, Ceftriaxone is ineffective and
**Cefepime and a carbapenem are co-equal** correct choices (neither is "preferred" over the other).

---

## LEVEL 3 — Stewardship Challenge (case-driven)

Correctness = **exact match to `correctDecision`** (only the listed drug counts correct);
non-AmpC distractors → Release is correct. **If an organism is mutated, Cefepime OR a carbapenem
are both accepted** (override of the case answer; Ceftriaxone ineffective).

| # | Organism | Infection | Source control | Duration | Correct drug | Approved? | Change to / Notes |
|---|---|---|---|---|---|---|---|
| L3-1 | Serratia | Pyelonephritis | Achieved (no obstruction) | 5 days | Ceftriaxone | | |
| L3-2 | Serratia | Native-valve endocarditis | N/A | 6 weeks | Cefepime | | |
| L3-3 | Serratia | Catheter-related BSI | Catheter removed | 7 days | Ceftriaxone | | |
| L3-4 | Enterobacter | Bacteremia | Line removed | 7 days | Cefepime | | |
| L3-5 | Enterobacter | Hospital-acquired pneumonia | N/A | 5–7 days | Cefepime | | |
| L3-6 | Enterobacter | Catheter-associated UTI | Catheter removed | 5 days | Cefepime | | |
| L3-7 | Citrobacter | Uncomplicated UTI | N/A | 3–5 days | Cefepime | | |
| L3-8 | Aeromonas | Soft-tissue (freshwater) | Debridement done | 5–7 days | Ceftriaxone | | |
| L3-9 | Hafnia | Uncomplicated UTI | N/A | 3–5 days | Cefepime | ✅ applied | |
| L3-10 | Hafnia | Intra-abdominal abscess | Abscess drained | 4 days | Cefepime | ✅ applied | |
| L3-11 | Morganella | Surgical wound | Debridement performed | 5–7 days | Ceftriaxone | | |
| L3-12 | Morganella | Complicated UTI (stent) | Stent placed | 5 days | Ceftriaxone | ✅ applied | |
| L3-13 | Providencia | Catheter-associated UTI | Catheter changed | 5 days | Ceftriaxone | | |
| L3-14 | Providencia | Bacteremia (urinary) | Catheter removed | 7 days | Ceftriaxone | | |
| L3-15 | K. aerogenes | Bacteremia (biliary, ERCP) | Biliary drainage | 7 days | Cefepime | | |
| L3-16 | K. aerogenes | Ventilator-assoc pneumonia | N/A | 7 days | Cefepime | | |
| L3-17 | Morganella | Diabetic foot infection with osteomyelitis | Amputation declined by patient — no surgical source control | 6 weeks | Cefepime | ✅ applied 2026-08-22 | |

### Per-case rationale (the "correct choice" pop-up text — edit on the ✎ line)

- **L3-1** "Serratia is low-risk AmpC; for non-obstructed pyelonephritis a 5-day course of Ceftriaxone is clinically appropriate — the low induction risk supports a narrow, short regimen." ✎ Change:
- **L3-2** "Even for low-risk AmpC organisms, a 6-week endocarditis course raises the risk of de-repression under sustained cephalosporin pressure — Cefepime is safer for prolonged therapy. A carbapenem may also be reasonable to reserve for situations where Cefepime is not a good option for the patient." ✎ Change:
- **L3-3** "Serratia bacteremia with catheter removal and no endovascular complication — low-risk AmpC with source control supports a 7-day Ceftriaxone course." ✎ Change:
- **L3-4** "Enterobacter is HIGH-risk AmpC; clinical failures with Ceftriaxone in Enterobacter bacteremia are well-documented — Cefepime is strongly preferred regardless of source control." ✎ Change:
- **L3-5** "High-risk AmpC + pulmonary infection with high bacterial burden — Cefepime is indicated; de-repression under third-generation cephalosporins is a real risk here." ✎ Change:
- **L3-6** "Even for a short UTI course, Enterobacter's high-risk AmpC profile warrants Cefepime over Ceftriaxone to avoid selecting for resistance." ✎ Change:
- **L3-7** "Citrobacter freundii is HIGH-risk AmpC — Cefepime is the safer choice even for shorter courses to avoid selecting for AmpC de-repression." ✎ Change:
- **L3-8** "Aeromonas is low-risk AmpC; for a soft-tissue infection with adequate debridement, Ceftriaxone is appropriate — escalate to Cefepime only for serious high-inoculum infections." ✎ Change:
- **L3-9** "Hafnia is high-risk AmpC; even for a straightforward UTI, Cefepime is preferred over Ceftriaxone to avoid selecting for AmpC de-repression." ✎ Change:
- **L3-10** "High-risk AmpC intra-abdominal abscess — even with source control achieved (drained), Cefepime is preferred over Ceftriaxone to avoid selecting for AmpC de-repression." ✎ Change:
- **L3-11** "Morganella morganii is low induction risk; with adequate debridement, a 5–7-day Ceftriaxone course is clinically appropriate." ✎ Change:
- **L3-12** "Low-risk AmpC UTI with source control achieved — a 5-day Ceftriaxone course is adequate; re-evaluate if clinical deterioration occurs." ✎ Change:
- **L3-13** "Providencia is low-risk AmpC; a 5–7-day Ceftriaxone course following catheter exchange is appropriate for uncomplicated catheter-associated UTI." ✎ Change:
- **L3-14** "Low-risk AmpC bacteremia with source control — a 7-day Ceftriaxone course is appropriate for urinary-source bacteremia; no indication for routine Cefepime escalation." ✎ Change:
- **L3-15** "Klebsiella aerogenes shares the high-risk AmpC profile of Enterobacter — Cefepime is preferred for bacteremia even after source control." ✎ Change:
- **L3-16** "High-risk AmpC VAP — Cefepime is strongly preferred; empiric Ceftriaxone in this setting risks clinical failure due to de-repression." ✎ Change:
- **L3-17** "Morganella is low-risk AmpC, but a prolonged 6-week course with no surgical source control (amputation declined) raises the risk of AmpC de-repression under sustained cephalosporin pressure — Cefepime is the safer choice for extended therapy. A carbapenem may also be reasonable to reserve for situations where Cefepime is not a good option for the patient." ✎ Change:

---

## Mutation rule (Levels 2 & 3)

| # | Rule | Current behavior | Approved? | Change to / Notes |
|---|---|---|---|---|
| MUT-1 | Trigger | 2 inappropriate Ceftriaxone calls on the SAME high-risk organism type | ✅ applied 2026-08-22 | |
| MUT-2 | Threshold | 2 (`MUTATION_THRESHOLD`) | ✅ applied 2026-08-22 | |
| MUT-3 | Effect | Type flips to mutated form; **Ceftriaxone becomes ineffective**; Cefepime and a carbapenem are co-equal correct | | |
| MUT-4 | Scope | Only high-risk AmpC types mutate; low-risk and distractors never mutate | | |

---

## Pop-up feedback — LEVEL 2 (when a bug is SHOT)

Each row is the exact heading + sentence shown after the shot. `{name}` = organism name.
Edit on the **✎ Change:** line.

- **Distractor + Release** → "Good call." / "This organism is not an AmpC producer — releasing it is the right stewardship move. Treat only what needs treating." ✎ Change:
- **Distractor + any antibiotic** → "Unnecessary treatment." / "While {name} can cause infections, it is not an AmpC producer and not the target of this game." ✎ Change: (updated 2026-08-22)
- **SEACHYMP + Release** → "This one needed treatment." / "{name} is an AmpC-producing organism that required an antibiotic. Releasing it was not the right call here." ✎ Change:
- **Mutated + Ceftriaxone** → "Ineffective against mutated form." / "This organism has adapted — ceftriaxone is no longer effective. Switch to Cefepime or a carbapenem." ✎ Change:
- **Mutated + Cefepime _or_ Carbapenem** → "Correct — effective against the mutated form." / "{name} has de-repressed its AmpC. Cefepime and a carbapenem are both appropriate now — Ceftriaxone is no longer effective." ✎ Change:
- **High-risk + Cefepime** → "Correct — preferred choice." / "{name} is a high-risk AmpC producer. Cefepime is the preferred agent — it is stable against AmpC de-repression." ✎ Change:
- **High-risk + Ceftriaxone** → "Risk of clinical failure." / "{name} is a high-risk AmpC producer. Ceftriaxone risks AmpC de-repression and clinical failure in serious infections. Prefer Cefepime. (In practice, short courses for mild, uncomplicated infections are sometimes considered acceptable — but this app teaches the conservative default.)" ✎ Change:
- **High-risk + Carbapenem** → "Acceptable — but reserve it." / "Carbapenems work against high-risk AmpC organisms, but Cefepime is preferred first-line for {name}. Reserve carbapenems for mutated AmpC organisms that are resistant to Cefepime, and for ESBL producers." ✎ Change:
- **Low-risk + Ceftriaxone** → "Correct — good stewardship." / "{name} is low-risk AmpC. Ceftriaxone is an appropriate, narrow choice for most serious infections with this organism." ✎ Change:
- **Low-risk + Cefepime** → "Effective, but broader than needed." / "{name} is low-risk AmpC. Cefepime works, but Ceftriaxone is often sufficient here. Good stewardship means narrowing when you can." ✎ Change: Effective, but broader than needed." / "{name} is low-risk AmpC. Cefepime is preferred for prolonged courses or deep seated infections, but Ceftriaxone is often sufficient here. Good stewardship means narrowing when you can
- **Low-risk + Carbapenem** → "Works, but reserve it." / "Carbapenems are effective here, but they should be reserved for mutated AmpC organisms resistant to Cefepime and for ESBL producers. Ceftriaxone or Cefepime is preferred for this low-risk organism." ✎ Change:

---

## Pop-up feedback — LEVEL 3 (when a bug is SHOT in a case)

- **Distractor + any antibiotic** → "Unnecessary treatment." / "While {name} can cause infections, it is not an AmpC producer and not the target of this game." ✎ Change: (updated 2026-08-22)
- **Distractor + Release** → "Good call — no treatment needed." / "{name} is not an AmpC producer here. Releasing is correct — treat only what needs treating." ✎ Change:
- **SEACHYMP + Release** → "This organism needed treatment." / "{name} is an AmpC-producing organism that required an antibiotic for this infection." ✎ Change:
- **Mutated + Ceftriaxone** → "Ineffective against mutated form." / "This organism has adapted — ceftriaxone is no longer effective. Switch to Cefepime or a carbapenem." ✎ Change:
- **Mutated + Cefepime _or_ Carbapenem** → "Correct — effective against the mutated form." / "{name} has de-repressed its AmpC. Cefepime and a carbapenem are both appropriate now; Ceftriaxone is no longer effective." ✎ Change:
- **Correct drug for the case** → "Correct choice for this case." / _(the case rationale — see L3 table above)_ ✎ Change:
- **Wrong drug** → "Not the best choice here." / _(case rationale)_ + " Preferred: {correct drug}." ✎ Change:

---

## Mutation banners (shown on the mutated form)

- **Level 2 / Level 3 capture card** → "**Mutated form.** Ceftriaxone is no longer effective — Cefepime and a carbapenem are both appropriate." ✎ Change:
- **Level 1 info card** → "**Mutated form detected.** Ceftriaxone is now flagged ineffective — Cefepime and a carbapenem are both appropriate." ✎ Change:
- **Level 1 mutation toast** → "{name} has adapted — resistance selected! Cefepime and a carbapenem are both appropriate." ✎ Change:
- **Level 2 / Level 3 mutation toast** → "{name} has adapted — repeated Ceftriaxone selected for resistance. Switch to Cefepime or a carbapenem." ✎ Change:
- **How to Play** → "The organism has adapted. Resistance selected!" / "In mutated form, Ceftriaxone is flagged ineffective. You must switch to **Cefepime or a carbapenem**." ✎ Change:

---

## Per-organism comments (CATCH blurb + teaching point)

For each organism: **art** = the sea-creature sprite now shown; **catch blurb** = the line shown
when the bug is caught (capture card); **teaching point** = the clinical note. Edit on the ✎ lines.
(⚠ = blurb still describes the old placeholder creature, not the current art.)

### SEACHYMP — high-risk AmpC

**Enterobacter cloacae** — `enterobacter` · art: spiky-pufferfish
- Catch blurb: "A deep-sea puffer beast armored in heavy plates, glowing eyes radiating defiance. Clinically: among the most clinically important AmpC producers — Cefepime preferred for serious infections." — ✎ Change:
- Teaching: "Enterobacter cloacae is HIGH-risk AmpC. De-repression risk is significant. Cefepime (or a carbapenem) is preferred over 3rd-gen cephalosporins for serious infections — though short courses for mild, uncomplicated infections may reasonably use Ceftriaxone in some cases." — ✎ Change:

**Citrobacter freundii** — `citrobacter` · art: coconut-crab
- Catch blurb: "Massive claws, impenetrable shell — this armored crab tank will not yield easily. Clinically: one of the classic high-risk AmpC producers; Cefepime strongly preferred for serious infections." — ✎ Change:
- Teaching: "Citrobacter freundii is HIGH-risk AmpC. Like Enterobacter, de-repression is a real clinical concern. Prefer Cefepime for serious infections — though short courses for mild, uncomplicated infections may reasonably use Ceftriaxone in some cases." — ✎ Change:

**Klebsiella aerogenes** (bonus) — `klebsiella_aerogenes` · art: lionfish
- Catch blurb: "An orange spiked lionfish — beautiful but aggressive, with venom to match. Clinically: reclassified from Enterobacter; shares the high-risk AmpC profile; Cefepime strongly preferred." — ✎ Change:
- Teaching: "Klebsiella aerogenes (formerly Enterobacter aerogenes) is HIGH-risk AmpC. Cefepime preferred over 3rd-gen cephalosporins for serious infections — though short courses for mild, uncomplicated infections may reasonably use Ceftriaxone in some cases. Bonus organism — not part of the classic SEACHYMP mnemonic." — ✎ Change:

**Hafnia alvei** — `hafnia` · art: cowfish ⚠ blurb says "blobfish"
- Catch blurb: "A purple blobfish with a perpetually sad face — ugly-cute, but not to be underestimated. Clinically: infrequent pathogen, but AmpC induction risk is variable enough to warrant Cefepime for serious infections." — ✎ Change: (2026-08-22: removed "mostly harmless" — contradicted its HIGH-risk tier; the "blobfish vs. cowfish art" mismatch above is unchanged, still open)
- Teaching: "Hafnia alvei is a HIGH-risk AmpC producer with variable induction risk. Cefepime is preferred over 3rd-gen cephalosporins for serious infections — though short courses for mild, uncomplicated infections may reasonably use Ceftriaxone in some cases." — ✎ Change:

**Yersinia enterocolitica** — `yersinia` · art: hermit-crab
- Catch blurb: "A tiny blue hermit crab, curious and quick, scuttling between coral. Clinically: most invasive Yersinia infections are self-limited, but AmpC induction risk is high enough to prefer Cefepime when treatment is needed." — ✎ Change:
- Teaching: "Yersinia enterocolitica is a HIGH-risk AmpC producer. Most invasive infections are self-limited, but when treatment is indicated, Cefepime is preferred over 3rd-gen cephalosporins — though short courses for mild, uncomplicated infections may reasonably use Ceftriaxone in some cases." — ✎ Change:

### SEACHYMP — low-risk AmpC

**Serratia marcescens** — `serratia` · art: base-jellyfish
- Catch blurb: "A rosy jellyfish who fancies itself a pirate — mischievous, showy, and prone to unexpected escapes. Clinically: an AmpC-producing gram-negative often found in healthcare settings; usually low induction risk." — ✎ Change:
- Teaching: "Serratia is an AmpC producer. For serious infections, 3rd-gen cephalosporins (e.g. Ceftriaxone) are often acceptable at low inoculum — but watch for inducible resistance." — ✎ Change:

**Aeromonas hydrophila** — `aeromonas` · art: blue-dragon-nudibranch
- Catch blurb: "A squishy sea-slug with a leech mouth — surprisingly docile until cornered. Clinically: a waterborne gram-negative with low-risk AmpC; Ceftriaxone usually works well." — ✎ Change:
- Teaching: "Aeromonas has inducible AmpC but is generally low-risk for de-repression. Ceftriaxone is appropriate for most infections; escalate to Cefepime for serious or high-inoculum cases." — ✎ Change:

**Morganella morganii** — `morganella` · art: moray-eel
- Catch blurb: "A sneaky moray eel that peers from rocky crevices with narrow, calculating eyes. Clinically: intrinsic resistance to ampicillin; AmpC induction risk is modest; Ceftriaxone usually adequate." — ✎ Change:
- Teaching: "Morganella morganii has inducible AmpC and is intrinsically resistant to many beta-lactams. For most infections Ceftriaxone is acceptable; watch serious/high-inoculum cases." — ✎ Change:

**Providencia stuartii** — `providencia` · art: sea-urchin ⚠ blurb says "sea cucumber"
- Catch blurb: "A pink sea cucumber covered in spines — looks menacing but is surprisingly cute up close. Clinically: low induction risk AmpC; serious infections may require broader coverage." — ✎ Change:
- Teaching: "Providencia species produce inducible AmpC. Usually low risk; carbapenems may be needed for resistant strains." — ✎ Change:

### Non-AmpC distractors — friendly reef life (Release / don't treat)

**Dumbo Octopus** (E. coli context) — `reef_clownfish` (id kept for save-compat) · art: dumbo-octopus
- Renamed 2026-08-12 from "Reef Clownfish" — the art was always a dumbo octopus, not a clownfish; renamed to match the art rather than force in fish art that doesn't exist in the library (same fix pattern as `starfish`→"Coral" and `friendly_crab`→"Friendly Clam").
- Catch blurb: "A round-eyed dumbo octopus, ear-like fins flared, drifting gently over the sand. Not a SEACHYMP target! Good stewardship = knowing when NOT to intervene." — ✎ Change:
- Teaching: "Not an AmpC producer in this reef context. Leave it alone — good stewardship means NOT treating what doesn't need treating." — ✎ Change:

**Coral** — `starfish` · art: christmas-tree-worm
- Catch blurb: "A burst of colorful coral, feathery fronds swaying in the current. Totally harmless reef life — protect it, don't treat it." — ✎ Change:
- Teaching: "Not a SEACHYMP organism — just healthy reef coral. Part of a thriving ecosystem; leave it be!" — ✎ Change:

**Friendly Clam** — `friendly_crab` · art: pearl-oyster
- Catch blurb: "A pearly clam resting half-open on the sand, a glimpse of pearl inside. Not a SEACHYMP organism — don't treat what you don't need to." — ✎ Change:
- Teaching: "Not a SEACHYMP target! A harmless reef clam. Reserve interventions for the organisms that need them." — ✎ Change:

### Non-AmpC gram-negative distractors (look-alikes)

**E. coli** — `ecoli` · art: cuttlefish ⚠ blurb says "reef minnow"
- Catch blurb: "A quick little reef minnow flitting through the shallows. A common gram-negative — but not one of the inducible-AmpC group you're patrolling for." — ✎ Change:
- Teaching: "Escherichia coli is not a chromosomal AmpC producer of the SEACHYMP type. Treat per susceptibilities; it does not carry the inducible-AmpC de-repression concern." — ✎ Change:

**Klebsiella pneumoniae** — `kpneumoniae` · art: nautilus ⚠ blurb says "blue reef fish"
- Catch blurb: "A plump blue reef fish drifting calmly past the coral. Not part of the inducible-AmpC group — don't confuse it with its cousin K. aerogenes." — ✎ Change:
- Teaching: "Klebsiella pneumoniae is not an inducible chromosomal AmpC producer (distinct from K. aerogenes). Resistance concerns are ESBL/carbapenemase, not de-repression." — ✎ Change:

**Klebsiella oxytoca** — `koxytoca` · art: ribbon-eel ⚠ blurb says "ribbon-fish"
- Catch blurb: "A slender teal ribbon-fish weaving lazily through the water. A look-alike that is not one of your inducible-AmpC targets." — ✎ Change:
- Teaching: "Klebsiella oxytoca is not an inducible chromosomal AmpC producer of the SEACHYMP type. It carries a chromosomal class A beta-lactamase, not the AmpC de-repression risk." — ✎ Change:

**Citrobacter koseri** — `ckoseri` · art: stingray ⚠ blurb says "spotted goby"
- Catch blurb: "A sandy spotted goby resting on a ledge, watching the current. Despite the Citrobacter name, this one is not a high-risk AmpC organism like C. freundii." — ✎ Change:
- Teaching: "Citrobacter koseri is NOT a high-risk inducible-AmpC producer (unlike C. freundii). An easy trap — the genus matters less than the species here." — ✎ Change:

**Proteus mirabilis** — `pmirabilis` · art: mimic-octopus ⚠ blurb says "wrasse"
- Catch blurb: "A pink wrasse darting in restless zig-zags across the reef. Not an inducible-AmpC organism — leave it to swim." — ✎ Change:
- Teaching: "Proteus mirabilis does not carry inducible chromosomal AmpC. It is intrinsically resistant to a few agents but is not part of the de-repression group." — ✎ Change:

**Proteus penneri** — `ppenneri` · art: sand-dollar ⚠ blurb says "sand-eel"
- Catch blurb: "A tan sand-eel half-buried in the seabed, barely stirring. Another Proteus that is not one of your inducible-AmpC targets." — ✎ Change:
- Teaching: "Proteus penneri is not an inducible chromosomal AmpC producer of the SEACHYMP type. Treat per susceptibilities." — ✎ Change:

### Non-AmpC gram-positive distractors (wrong kingdom)

**Enterococcus faecalis** — `efaecalis` · art: crown-jellyfish ⚠ blurb says "anemone"
- Catch blurb: "A round rosy anemone swaying gently on a rock. A gram-positive bystander — AmpC stewardship doesn't apply here at all." — ✎ Change:
- Teaching: "Enterococcus faecalis is a gram-POSITIVE organism — AmpC has nothing to do with it. A pure distractor." — ✎ Change:

**Staphylococcus aureus** — `saureus` · art: nomad-jellyfish
- Swapped 2026-08-12 with Streptococcus pneumoniae's art (was tiger-cowrie, a shell — a much better fit for "S. pneumoniae... shells" below than for "coral polyps" here). Neither art option is a perfect match for "coral polyps"; this is a lateral move that fixed the other side.
- Catch blurb: "A pale blue jellyfish drifting with a gently domed bell. Gram-positive and entirely off your AmpC patrol list." — ✎ Change:
- Teaching: "Staphylococcus aureus is a gram-POSITIVE coccus in clusters — no AmpC involvement. A pure distractor." — ✎ Change:

**Streptococcus pneumoniae** — `spneumoniae` · art: tiger-cowrie
- Swapped 2026-08-12 from nomad-jellyfish (a jellyfish, not a shell) to the actual shell art, matching this blurb's "shells" description.
- Catch blurb: "A leopard-spotted cowrie shell resting alone on the sand. Gram-positive — nothing to do with the inducible-AmpC creatures you're after." — ✎ Change:
- Teaching: "Streptococcus pneumoniae is a gram-POSITIVE diplococcus — no AmpC involvement. A pure distractor." — ✎ Change:

**Enterococcus faecium** — `efaecium` · art: manta-ray ⚠ blurb says "anemone"
- Catch blurb: "A violet anemone with slow, drifting tendrils. Another gram-positive bystander outside your AmpC stewardship scope." — ✎ Change:
- Teaching: "Enterococcus faecium is a gram-POSITIVE organism — no AmpC relevance. A pure distractor." — ✎ Change:

---

## Global notes (free text — anything cross-cutting)

- **2026-08-22 — "bonus organism" swap declined.** Owner considered moving the
  "bonus" (9th, outside-the-mnemonic) designation from Klebsiella aerogenes to
  Hafnia alvei, but Hafnia is one of the 8 core SEACHYMP letters (H = Hafnia) —
  moving it out would leave letter H unrepresented. Owner chose to leave this as-is.
  Klebsiella aerogenes remains the sole bonus organism. Do not re-litigate without
  a new owner decision.
- **2026-08-22 — per-level intro cards added.** Each level button on the Title
  screen now opens a short goal + controls card (`LevelIntro.jsx`) before the level
  starts, instead of going straight into gameplay. This is in addition to, not a
  replacement for, the full How to Play page (still reachable from the Title screen
  and the pause menu).
- **2026-08-22 — controls simplified everywhere.** Clicking (computer) or tapping
  (phone) an organism directly captures/shoots it in all three levels — swimming
  there first was never required (`onClick`/`onTouchStart` hit-test the organism's
  position directly, not the player's proximity). Removed all keyboard-swim
  (arrow keys/WASD) and space-bar-capture instructions from `LevelIntro.jsx` and
  `HowToPlay.jsx` since they describe an optional flourish, not the actual
  mechanic. The keyboard/drag movement code itself was left in place — only the
  instructions changed.
- **2026-08-22 — `App.css` was never imported.** `main.jsx` only imported
  `index.css`; the shared `.btn-back` style in `App.css` had zero effect on any
  screen, so every "← Back" button across the app (Weapons, How to Play,
  Encyclopedia, My Reef) was rendering as a bare, unstyled browser button — this
  was the "back bar hard to click" bug. Fixed by adding `import "./App.css"` to
  `main.jsx`, plus restyling `.btn-back` to a clearly clickable pill matching the
  rest of the UI.
- **2026-08-22 — Level 2/3 Menu button now pauses instead of instant-quitting.**
  Previously only Level 1's HUD "Menu" button opened the "Paused" overlay
  (Resume/How to Play/Encyclopedia/My Reef/Weapons/Main Menu); the identical-looking
  button in Level 2 and 3 jumped straight to the Title screen with no confirmation
  and no way back into the round. `App.jsx` now tracks which level opened the pause
  menu (`pausedLevel`) so all three levels share the same pause/resume behavior.
- **2026-08-22 — 9 organism sprites had a crop artifact.** A hard 2-4px fully-opaque
  line along one edge (left or right) on `coconut-crab`, `hermit-crab`, `lionfish`,
  `sand-dollar`, `sea-urchin`, `blue-dragon-nudibranch`, `manta-ray`, `pearl-oyster`,
  `stingray` — a flood-fill leftover from the original master sheet crop. Cleaned
  by clearing those columns to transparent in `public/art/organisms/*.webp`
  (lossless re-save, same dimensions).
