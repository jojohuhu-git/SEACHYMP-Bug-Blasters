/**
 * organisms.js — All drifting organisms in Bug Blasters.
 *
 * artToken: a stable string key so real art can be swapped
 *   in without touching gameplay code. Placeholder rendering
 *   uses `emoji` + `color` from this file.
 */

export const ORGANISMS = [
  // ── SEACHYMP organisms ─────────────────────────────────────────────────────

  {
    id: "serratia",
    name: "Serratia",
    species: "Serratia marcescens",
    isSeachymp: true,
    bonus: false,
    riskTier: "low",
    artToken: "pirate-jellyfish",
    color: "#e85d8a",
    emoji: "🪼",
    difficulty: "easy",
    teachingPoint:
      "Serratia is an AmpC producer. For serious infections, 3rd-gen cephalosporins (e.g. Ceftriaxone) are often acceptable at low inoculum — but watch for inducible resistance.",
    blurb:
      "A rosy jellyfish who fancies itself a pirate — mischievous, showy, and prone to unexpected escapes. Clinically: an AmpC-producing gram-negative often found in healthcare settings; usually low induction risk.",
  },

  {
    id: "enterobacter",
    name: "Enterobacter",
    species: "Enterobacter cloacae",
    isSeachymp: true,
    bonus: false,
    riskTier: "high",
    artToken: "armored-puffer-beast",
    color: "#3a7a3a",
    emoji: "🐡",
    difficulty: "hard",
    teachingPoint:
      "Enterobacter cloacae is HIGH-risk AmpC. De-repression risk is significant. Cefepime (or a carbapenem) is preferred over 3rd-gen cephalosporins for serious infections.",
    blurb:
      "A deep-sea puffer beast armored in heavy plates, glowing eyes radiating defiance. Clinically: among the most clinically important AmpC producers — Cefepime preferred for serious infections.",
  },

  {
    id: "aeromonas",
    name: "Aeromonas",
    species: "Aeromonas hydrophila",
    isSeachymp: true,
    bonus: false,
    riskTier: "low",
    artToken: "leech-slug-hybrid",
    color: "#7ab8b8",
    emoji: "🐌",
    difficulty: "easy",
    teachingPoint:
      "Aeromonas has inducible AmpC. For most infections, Ceftriaxone or fluoroquinolones are acceptable. High-inoculum or serious infections warrant closer attention.",
    blurb:
      "A squishy sea-slug with a leech mouth — surprisingly docile until cornered. Clinically: a waterborne gram-negative with AmpC; fluoroquinolones or Ceftriaxone often work well.",
  },

  {
    id: "citrobacter",
    name: "Citrobacter",
    species: "Citrobacter freundii",
    isSeachymp: true,
    bonus: false,
    riskTier: "high",
    artToken: "armored-crab-tank",
    color: "#8b6914",
    emoji: "🦀",
    difficulty: "hard",
    teachingPoint:
      "Citrobacter freundii is HIGH-risk AmpC. Like Enterobacter, de-repression is a real clinical concern. Prefer Cefepime for serious infections.",
    blurb:
      "Massive claws, impenetrable shell — this armored crab tank will not yield easily. Clinically: one of the classic high-risk AmpC producers; Cefepime strongly preferred for serious infections.",
  },

  {
    id: "hafnia",
    name: "Hafnia",
    species: "Hafnia alvei",
    isSeachymp: true,
    bonus: false,
    riskTier: "low",
    artToken: "purple-blobfish",
    color: "#9370db",
    emoji: "🐟",
    difficulty: "easy",
    teachingPoint:
      "Hafnia alvei is a low-risk AmpC producer. Ceftriaxone is typically acceptable; clinical data for induction is limited.",
    blurb:
      "A purple blobfish with a perpetually sad face — ugly-cute and mostly harmless. Clinically: infrequent pathogen, low AmpC induction risk; Ceftriaxone often sufficient.",
  },

  {
    id: "yersinia",
    name: "Yersinia",
    species: "Yersinia enterocolitica",
    isSeachymp: true,
    bonus: false,
    riskTier: "low",
    artToken: "tiny-blue-hermit-crab",
    color: "#4a90d9",
    emoji: "🦀",
    difficulty: "easy",
    teachingPoint:
      "Yersinia enterocolitica produces AmpC but is generally low-risk for de-repression. Most infections are self-limited; invasive infections may require fluoroquinolones or TMP-SMX.",
    blurb:
      "A tiny blue hermit crab, curious and quick, scuttling between coral. Clinically: low induction risk; most invasive Yersinia infections are treated with fluoroquinolones or TMP-SMX.",
  },

  {
    id: "morganella",
    name: "Morganella",
    species: "Morganella morganii",
    isSeachymp: true,
    bonus: false,
    riskTier: "low",
    artToken: "sneaky-moray-eel",
    color: "#5a8a3a",
    emoji: "🐍",
    difficulty: "easy",
    teachingPoint:
      "Morganella morganii has inducible AmpC and is intrinsically resistant to many beta-lactams. For most infections Ceftriaxone is acceptable; watch serious/high-inoculum cases.",
    blurb:
      "A sneaky moray eel that peers from rocky crevices with narrow, calculating eyes. Clinically: intrinsic resistance to ampicillin; AmpC induction risk is modest; Ceftriaxone usually adequate.",
  },

  {
    id: "providencia",
    name: "Providencia",
    species: "Providencia stuartii",
    isSeachymp: true,
    bonus: false,
    riskTier: "low",
    artToken: "pink-spiny-sea-cucumber",
    color: "#e87aaa",
    emoji: "🌵",
    difficulty: "easy",
    teachingPoint:
      "Providencia species produce inducible AmpC. Usually low risk; carbapenems or fluoroquinolones may be needed for resistant strains.",
    blurb:
      "A pink sea cucumber covered in spines — looks menacing but is surprisingly cute up close. Clinically: low induction risk AmpC; serious infections may require broader coverage.",
  },

  // ── Bonus SEACHYMP organism ────────────────────────────────────────────────

  {
    id: "klebsiella_aerogenes",
    name: "Klebsiella aerogenes",
    species: "Klebsiella aerogenes (formerly Enterobacter aerogenes)",
    isSeachymp: true,
    bonus: true,
    riskTier: "high",
    artToken: "spiked-lionfish",
    color: "#e05a14",
    emoji: "🦁",
    difficulty: "hard",
    teachingPoint:
      "Klebsiella aerogenes (formerly Enterobacter aerogenes) is HIGH-risk AmpC. Cefepime preferred over 3rd-gen cephalosporins for serious infections. Bonus organism — not part of the classic SEACHYMP mnemonic.",
    blurb:
      "An orange spiked lionfish — beautiful but aggressive, with venom to match. Clinically: reclassified from Enterobacter; shares the high-risk AmpC profile; Cefepime strongly preferred.",
  },

  // ── Non-SEACHYMP distractor organisms ─────────────────────────────────────

  {
    id: "reef_clownfish",
    name: "Reef Clownfish",
    species: "E. coli (non-AmpC context)",
    isSeachymp: false,
    bonus: false,
    riskTier: null,
    artToken: "clownfish",
    color: "#ff8c00",
    emoji: "🐠",
    difficulty: "easy",
    teachingPoint:
      "Not an AmpC producer in this reef context. Leave it alone — good stewardship means NOT treating what doesn't need treating.",
    blurb:
      "A cheerful orange clownfish darting between sea anemones. Not a SEACHYMP target! Good stewardship = knowing when NOT to intervene.",
  },

  {
    id: "starfish",
    name: "Starfish",
    species: "Friendly reef starfish",
    isSeachymp: false,
    bonus: false,
    riskTier: null,
    artToken: "starfish",
    color: "#f4c430",
    emoji: "⭐",
    difficulty: "easy",
    teachingPoint:
      "Not a SEACHYMP organism. Part of a healthy reef ecosystem. Leave it be!",
    blurb:
      "A five-armed golden starfish slowly inching across the ocean floor. This one is totally harmless — and beautiful.",
  },

  {
    id: "seahorse",
    name: "Seahorse",
    species: "Friendly reef seahorse",
    isSeachymp: false,
    bonus: false,
    riskTier: null,
    artToken: "seahorse",
    color: "#7ec8e3",
    emoji: "🐴",
    difficulty: "easy",
    teachingPoint:
      "Not a SEACHYMP organism. Protecting reef life like this seahorse is the whole point of good stewardship.",
    blurb:
      "A delicate teal seahorse bobbing gently in the current. Absolutely not a threat — your goal is to PROTECT creatures like this.",
  },

  {
    id: "friendly_crab",
    name: "Friendly Crab",
    species: "Harmless reef crab",
    isSeachymp: false,
    bonus: false,
    riskTier: null,
    artToken: "friendly-crab",
    color: "#ff6b6b",
    emoji: "🦀",
    difficulty: "easy",
    teachingPoint:
      "Not a SEACHYMP target! Many crabs are harmless. Reserve interventions for the right organisms.",
    blurb:
      "A small, cheerful crab waving its claws in a friendly way. Not a SEACHYMP organism — don't treat what you don't need to.",
  },
];

export default ORGANISMS;
