/**
 * organisms.js — All drifting organisms in Bug Blasters.
 *
 * artToken: a stable string key so real art can be swapped
 *   in without touching gameplay code. Placeholder rendering
 *   uses `emoji` + `color` from this file.
 */

/**
 * monogramFor — derive a short placeholder-art monogram from an organism name.
 * Uses the first letter of the first two words (genus + species) so binomial
 * names stay distinct ("Klebsiella pneumoniae" -> "KP", "Klebsiella oxytoca"
 * -> "KO"). Falls back to the first two letters for single-word names.
 */
export function monogramFor(name) {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  const letters = words
    .map((w) => (w.match(/[A-Za-z]/) || [""])[0])
    .filter(Boolean);
  if (letters.length >= 2) return (letters[0] + letters[1]).toUpperCase();
  return (String(name).replace(/[^A-Za-z]/g, "").slice(0, 2) || "??").toUpperCase();
}

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

  // ── Non-AmpC gram-negative distractors (Enterobacterales, not the SEACHYMP group) ──

  {
    id: "ecoli",
    name: "E. coli",
    species: "Escherichia coli",
    isSeachymp: false,
    bonus: false,
    riskTier: null,
    artToken: "reef-minnow",
    color: "#6fae6f",
    emoji: "🐟",
    difficulty: "easy",
    teachingPoint:
      "Escherichia coli is not a chromosomal AmpC producer of the SEACHYMP type. Treat per susceptibilities; it does not carry the inducible-AmpC de-repression concern.",
    blurb:
      "A quick little reef minnow flitting through the shallows. A common gram-negative — but not one of the inducible-AmpC group you're patrolling for.",
  },

  {
    id: "kpneumoniae",
    name: "Klebsiella pneumoniae",
    species: "Klebsiella pneumoniae",
    isSeachymp: false,
    bonus: false,
    riskTier: null,
    artToken: "puffer-minnow",
    color: "#5a9bd4",
    emoji: "🐡",
    difficulty: "easy",
    teachingPoint:
      "Klebsiella pneumoniae is not an inducible chromosomal AmpC producer (distinct from K. aerogenes). Resistance concerns are ESBL/carbapenemase, not de-repression.",
    blurb:
      "A plump blue reef fish drifting calmly past the coral. Not part of the inducible-AmpC group — don't confuse it with its cousin K. aerogenes.",
  },

  {
    id: "koxytoca",
    name: "Klebsiella oxytoca",
    species: "Klebsiella oxytoca",
    isSeachymp: false,
    bonus: false,
    riskTier: null,
    artToken: "ribbon-fish",
    color: "#5ac4c4",
    emoji: "🐟",
    difficulty: "easy",
    teachingPoint:
      "Klebsiella oxytoca is not an inducible chromosomal AmpC producer of the SEACHYMP type. It carries a chromosomal class A beta-lactamase, not the AmpC de-repression risk.",
    blurb:
      "A slender teal ribbon-fish weaving lazily through the water. A look-alike that is not one of your inducible-AmpC targets.",
  },

  {
    id: "ckoseri",
    name: "Citrobacter koseri",
    species: "Citrobacter koseri",
    isSeachymp: false,
    bonus: false,
    riskTier: null,
    artToken: "spotted-goby",
    color: "#c49a6c",
    emoji: "🐠",
    difficulty: "easy",
    teachingPoint:
      "Citrobacter koseri is NOT a high-risk inducible-AmpC producer (unlike C. freundii). An easy trap — the genus matters less than the species here.",
    blurb:
      "A sandy spotted goby resting on a ledge, watching the current. Despite the Citrobacter name, this one is not a high-risk AmpC organism like C. freundii.",
  },

  {
    id: "pmirabilis",
    name: "Proteus mirabilis",
    species: "Proteus mirabilis",
    isSeachymp: false,
    bonus: false,
    riskTier: null,
    artToken: "darting-wrasse",
    color: "#d98cb3",
    emoji: "🐟",
    difficulty: "easy",
    teachingPoint:
      "Proteus mirabilis does not carry inducible chromosomal AmpC. It is intrinsically resistant to a few agents but is not part of the de-repression group.",
    blurb:
      "A pink wrasse darting in restless zig-zags across the reef. Not an inducible-AmpC organism — leave it to swim.",
  },

  {
    id: "ppenneri",
    name: "Proteus penneri",
    species: "Proteus penneri",
    isSeachymp: false,
    bonus: false,
    riskTier: null,
    artToken: "sand-eel",
    color: "#b08a5a",
    emoji: "🐍",
    difficulty: "easy",
    teachingPoint:
      "Proteus penneri is not an inducible chromosomal AmpC producer of the SEACHYMP type. Treat per susceptibilities.",
    blurb:
      "A tan sand-eel half-buried in the seabed, barely stirring. Another Proteus that is not one of your inducible-AmpC targets.",
  },

  // ── Gram-positive distractors (wrong kingdom entirely) ────────────────────

  {
    id: "efaecalis",
    name: "Enterococcus faecalis",
    species: "Enterococcus faecalis",
    isSeachymp: false,
    bonus: false,
    riskTier: null,
    artToken: "round-anemone",
    color: "#cf5a8a",
    emoji: "🌸",
    difficulty: "easy",
    teachingPoint:
      "Enterococcus faecalis is a gram-POSITIVE organism — AmpC has nothing to do with it. A pure distractor.",
    blurb:
      "A round rosy anemone swaying gently on a rock. A gram-positive bystander — AmpC stewardship doesn't apply here at all.",
  },

  {
    id: "saureus",
    name: "Staphylococcus aureus",
    species: "Staphylococcus aureus",
    isSeachymp: false,
    bonus: false,
    riskTier: null,
    artToken: "golden-cluster-coral",
    color: "#e0b020",
    emoji: "🪸",
    difficulty: "easy",
    teachingPoint:
      "Staphylococcus aureus is a gram-POSITIVE coccus in clusters — no AmpC involvement. A pure distractor.",
    blurb:
      "A cluster of golden coral polyps catching the light. Gram-positive and entirely off your AmpC patrol list.",
  },

  {
    id: "spneumoniae",
    name: "Streptococcus pneumoniae",
    species: "Streptococcus pneumoniae",
    isSeachymp: false,
    bonus: false,
    riskTier: null,
    artToken: "twin-shell-mollusk",
    color: "#7a6fc4",
    emoji: "🐚",
    difficulty: "easy",
    teachingPoint:
      "Streptococcus pneumoniae is a gram-POSITIVE diplococcus — no AmpC involvement. A pure distractor.",
    blurb:
      "A pair of violet shells nestled together on the sand. Gram-positive — nothing to do with the inducible-AmpC creatures you're after.",
  },

  {
    id: "efaecium",
    name: "Enterococcus faecium",
    species: "Enterococcus faecium",
    isSeachymp: false,
    bonus: false,
    riskTier: null,
    artToken: "round-anemone-violet",
    color: "#a05ac4",
    emoji: "🌸",
    difficulty: "easy",
    teachingPoint:
      "Enterococcus faecium is a gram-POSITIVE organism — no AmpC relevance. A pure distractor.",
    blurb:
      "A violet anemone with slow, drifting tendrils. Another gram-positive bystander outside your AmpC stewardship scope.",
  },
];

export default ORGANISMS;
