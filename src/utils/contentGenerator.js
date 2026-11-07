import { isNoiseOrUrlLine, stripUrlsAndNoise } from './academicClassifier';

/**
 * Validates whether a candidate heading, concept term, definition, or question text
 * is genuine academic study text and not an URL, link fragment, or presentation noise.
 */
export function isValidStudyText(str) {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (trimmed.length < 3) return false;
  if (isNoiseOrUrlLine(trimmed)) return false;
  if (/https?:\/\//i.test(trimmed)) return false;
  if (/www\.[a-z0-9]/i.test(trimmed)) return false;
  if (/youtube\.com|youtu\.be/i.test(trimmed)) return false;
  if (/^https?$/i.test(trimmed)) return false;
  if (/^(?:link|allikas|viide|url|veebiviide)\b/i.test(trimmed) && trimmed.length < 30) return false;
  return true;
}

/**
 * Generates structured, summarized study views (Topics/Summary points, Slide Figures,
 * Flashcards, Exercises, and Formula Sheet items) from parsed file pages/slides
 * in the user-selected language ('et' or 'en').
 */

function buildSchematicSvgForTopic({ heading, keyFormula, concepts, refLabel }) {
  const safeHeading = (heading || '').replace(/[<>&"]/g, '').slice(0, 44);
  const safeFormula = (keyFormula || '').replace(/[<>&"]/g, '').slice(0, 48);
  const c1 = (concepts[0]?.term || safeHeading).replace(/[<>&"]/g, '').slice(0, 26);
  const c2 = (concepts[1]?.term || safeFormula || refLabel).replace(/[<>&"]/g, '').slice(0, 26);

  return `<svg viewBox="0 0 520 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${safeHeading}">
    <rect width="520" height="240" rx="12" fill="#FBF8F3"/>
    <g stroke="#E6DEC8" stroke-width="1">
      <line x1="40" y1="195" x2="480" y2="195"/>
      <line x1="55" y1="35" x2="55" y2="205"/>
    </g>
    <!-- Header banner -->
    <rect x="75" y="26" width="370" height="38" rx="8" fill="#EFE9DC" stroke="#D8CEB8"/>
    <text x="260" y="50" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" fill="#2F241D">${safeHeading}</text>
    <!-- Left node -->
    <rect x="75" y="92" width="160" height="54" rx="8" fill="#F4EFE6" stroke="#3F6A52" stroke-width="1.8"/>
    <text x="155" y="123" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#3F6A52">${c1}</text>
    <!-- Arrow -->
    <line x1="238" y1="119" x2="278" y2="119" stroke="#8C5A3C" stroke-width="2.2"/>
    <polygon points="282,119 273,114 273,124" fill="#8C5A3C"/>
    <!-- Right node -->
    <rect x="285" y="92" width="160" height="54" rx="8" fill="#F4EFE6" stroke="#8C5A3C" stroke-width="1.8"/>
    <text x="365" y="123" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#8C5A3C">${c2}</text>
    <!-- Bottom relation bar -->
    <rect x="95" y="162" width="330" height="28" rx="6" fill="#E9F0EC"/>
    <text x="260" y="180" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="600" fill="#2D5A40">${safeFormula || refLabel}</text>
  </svg>`;
}

/**
 * Strips leading bullet characters, excess dots/ellipses, and dangling punctuation from a text fragment.
 */
export function cleanPunctuationAndNoise(text) {
  if (!text) return '';
  let s = String(text)
    // Remove leading unicode bullets, arrows, dots, dashes, orphan punctuation
    .replace(/^[\s\u00A0\u2022\u2023\u25E6\u2043\u2219•●▪◦‣⁃\-–—*+>·.,;:()]+/u, '')
    // Remove leading enumeration numbers like "1.", "1 -", "1)", "36."
    .replace(/^\d+[\s.)\-–—]+\s*/, '')
    // Repeat leading symbol strip in case there was "1 • ..."
    .replace(/^[\s\u00A0\u2022\u2023\u25E6\u2043\u2219•●▪◦‣⁃\-–—*+>·.,;:()]+/u, '')
    // Replace runs of 2+ dots ("...... ....ehk" or "....") with a clean separator
    .replace(/\.{2,}\s*\.{0,}\s*(?=ehk\b|st\b|s\.t\b|ning\b|ja\b)/gi, ', ')
    .replace(/\.{2,}\s*/g, '. ')
    // Fix glued sentences where a lowercase word is immediately followed by an uppercase sentence starter
    .replace(/([a-zõäöüšž])(\s+)(Kui\b|Siis\b|Kuna\b|Sest\b|Seega\b|Samuti\b|Näiteks\b|Archimedese\b|Laev(?:a|al)?\b|Teisisõnu\b)/g, '$1.$2$3')
    // Normalize spaces before punctuation
    .replace(/\s+([,.;:!?])/g, '$1')
    // Collapse multiple punctuation marks like "..", ",.", ".,"
    .replace(/[,.]{2,}/g, '.')
    .replace(/\s+/g, ' ')
    .trim();

  // Strip trailing orphan commas, colons, semicolons, or hyphens
  s = s.replace(/[,;:\-–—]+$/, '').trim();
  return s;
}

/**
 * Capitalizes the first letter of a sentence unless it starts with a math function like f(x).
 */
function capitalizeSentenceStart(str) {
  if (!str) return '';
  const trimmed = str.trim();
  if (/^[a-z]\([a-z0-9]/i.test(trimmed)) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Ensures a statement ends with a period if it doesn't end with !, ?, or a formula expression.
 */
function ensurePeriod(str) {
  if (!str) return '';
  const s = str.replace(/[,;:\-–—]+$/, '').trim();
  if (!s) return '';
  if (/[.!?]$/.test(s)) return s;
  if (/[=≈≠≤≥±]/.test(s) && s.length < 45) return s;
  return `${s}.`;
}

/**
 * Detects repeating slide headers/footers across pages (e.g. "Laevade ehitus. Teema 5. Capt. Rein Raudsalu MNI 29")
 * and returns a Set of normalized header strings to filter out.
 */
function findRepeatingSlideHeaders(pages) {
  const counts = new Map();
  const normalize = (line) =>
    line
      .toLowerCase()
      .replace(/\d+/g, '#')
      .replace(/[^\p{L}#\s]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

  for (const page of pages || []) {
    const seenOnPage = new Set();
    const lines = String(page.content || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    for (const line of lines) {
      const norm = normalize(line);
      if (norm.length >= 4 && !seenOnPage.has(norm)) {
        seenOnPage.add(norm);
        counts.set(norm, (counts.get(norm) || 0) + 1);
      }
    }
  }

  const repeating = new Set();
  const threshold = (pages?.length || 0) >= 4 ? 2 : 3;
  for (const [norm, count] of counts.entries()) {
    if (count >= threshold) {
      repeating.add(norm);
    }
  }

  return {
    isHeaderOrFooter(line) {
      if (!line) return true;
      const trimmed = line.trim();
      if (!trimmed) return true;
      // Standalone page/slide numbers or "12 / 40"
      if (/^(?:slaid|slide|lk|page)?\s*\d+(?:\s*[/|-]\s*\d+)?$/i.test(trimmed)) {
        return true;
      }
      // Course/lecturer stamp patterns like "Laevade ehitus. Teema 5. Capt. Rein Raudsalu MNI 29"
      if (/\b(?:capt\.|prof\.|dots\.|lektor|mni\s*\d+)\b/i.test(trimmed)) {
        return true;
      }
      if (/^teema\s*\d+\b/i.test(trimmed) && trimmed.length < 65) {
        return true;
      }
      const norm = normalize(trimmed);
      return repeating.has(norm);
    }
  };
}

/**
 * Reconstructs full, grammatical sentences from slide lines that were wrapped mid-sentence
 * (e.g. line 1 ends with a comma or conjunction, or line 2 starts with lowercase or "....ehk").
 */
function reconstructSlideLines(rawLines, headerFilter) {
  const filtered = rawLines
    .map((l) => l.trim())
    .filter((l) => l.length > 1 && !headerFilter.isHeaderOrFooter(l));

  const sourceLines = filtered.length > 0 ? filtered : rawLines.map((l) => l.trim()).filter((l) => l.length > 1);
  const merged = [];

  for (let i = 0; i < sourceLines.length; i++) {
    let curr = sourceLines[i]
      .replace(/^[•●▪◦‣⁃*+>·]+\s*/, '')
      .trim();
    if (!curr) continue;

    // If line starts with "....ehk" or "...ehk", treat it as a distinct explanatory sentence starting with "Teisisõnu"
    if (/^\.{2,}\s*ehk\b/i.test(curr)) {
      curr = curr.replace(/^\.{2,}\s*ehk\b\s*/i, 'Teisisõnu ');
    }

    if (merged.length > 0) {
      const prev = merged[merged.length - 1];
      const prevEndsIncomplete =
        /[,;:\-–—]$/.test(prev) ||
        /\b(?:ja|ning|ehk|või|kui|sest|kuna|et|mis|mille|milles|millele|kuhu|kust|on|kui ka)$/i.test(prev);
      const currStartsContinuation =
        /^[a-zõäöüšž]/.test(curr) ||
        /^(?:mille|mis|ehk|ning|ja|või|kui|et|sest|kuna)\b/i.test(curr);

      if (prevEndsIncomplete || currStartsContinuation) {
        const cleanPrev = prev.replace(/\.{2,}$/, '').trim();
        const cleanCurr = curr.replace(/^\.{2,}\s*/, '').trim();
        const joiner = /-$/.test(cleanPrev) && !/\s-$/.test(cleanPrev) ? ' ' : ' ';
        merged[merged.length - 1] = `${cleanPrev}${joiner}${cleanCurr}`.replace(/\s+/g, ' ');
        continue;
      }
    }

    merged.push(curr);
  }

  // Split any resulting multi-sentence chunks into clean individual sentences
  const finalSentences = [];
  for (const block of merged) {
    const cleanedBlock = cleanPunctuationAndNoise(block);
    if (!cleanedBlock) continue;

    // Split on sentence boundaries or "ehk" clauses if long
    const parts = cleanedBlock
      .split(/(?<=[.!?])\s+(?=[A-ZÕÄÖÜŠŽ])|(?:\s+ehk\s+(?=[a-zõäöüšž]{3,}))/i)
      .map((p) => cleanPunctuationAndNoise(p))
      .filter((p) => p.length >= 2);

    for (const part of parts) {
      finalSentences.push(capitalizeSentenceStart(part));
    }
  }

  return finalSentences;
}

/**
 * Extracts a short, natural topic heading (2–6 words) instead of a full sentence or broken clause.
 */
export function extractConciseTopicHeading(sentences, fallbackIndex, isEN = false) {
  const defaultTitle = isEN ? `Topic ${fallbackIndex}` : `Teema ${fallbackIndex}`;
  if (!sentences || sentences.length === 0) return defaultTitle;

  // Filter out any noisy/URL lines or lecturer/course stamps first
  const validCandidates = (sentences || [])
    .map((s) => cleanPunctuationAndNoise(stripUrlsAndNoise(s)))
    .filter(
      (s) =>
        s &&
        isValidStudyText(s) &&
        !isNoiseOrUrlLine(s) &&
        !/\b(?:capt\.|prof\.|dots\.|lektor|mni\s*\d+|teema\s*\d+)\b/i.test(s)
    );

  if (validCandidates.length === 0) return defaultTitle;

  const first = cleanPunctuationAndNoise(validCandidates[0]);
  if (!first) return defaultTitle;

  // If first line is a pure short number assignment like "G=9700t", look for a better phrase or label it clearly
  if (/^[A-Za-zÕÄÖÜŠŽõäöüšž₀₁₂]+\s*=\s*[\d.,]+\s*[a-zA-Z%/³²]*$/.test(first)) {
    const descriptive = validCandidates.find((s) => s.length > 8 && !/^[A-Za-z]+\s*=/.test(s));
    if (descriptive) {
      return extractConciseTopicHeading([descriptive], fallbackIndex, isEN);
    }
    const varName = first.split('=')[0].trim();
    if (varName === 'G' || varName === 'B') {
      return isEN ? 'Buoyancy & Weight Equilibrium' : 'Laeva ujuvustingimus (G = B)';
    }
    return isEN ? `Calculation Example (${first})` : `Arvutusnäide (${first})`;
  }

  // If the first candidate is already a concise heading (<= 45 chars, no verb clauses)
  if (first.length <= 45 && !/[,;:]/.test(first) && !/\b(?:on|nimetatakse|tähendab|kui|kuna|sest|mille)\b/i.test(first)) {
    return capitalizeSentenceStart(first.replace(/[.!?]+$/, ''));
  }

  // Pattern 1: "X on Y..." -> extract X if X is a clean noun phrase (1-5 words)
  const onMatch = first.match(/^([A-ZÕÄÖÜŠŽa-zõäöüšž0-9\s()/-]{3,42}?)\s+(?:on\s+|nimetatakse\s+|tähendab\s+|kirjeldab\s+|väljendab\s+|koosneb\s+|tekib\s+|tekivad\s+|mõjub\s+|võrdub\s+)/i);
  if (onMatch) {
    const candidate = cleanPunctuationAndNoise(onMatch[1]).replace(/^(?:kui|et|sest|kuna)\s+/i, '');
    if (candidate.length >= 4 && candidate.split(/\s+/).length <= 6) {
      return capitalizeSentenceStart(candidate);
    }
  }

  // Pattern 2: "Kui talas tekivad paindepinged, ..." -> extract key domain noun phrase
  const condMatch = first.match(/^Kui\s+(.{4,40}?)(?:,|\s+siis\b|\s+jääb\b|\s+on\b)/i);
  if (condMatch) {
    let phrase = cleanPunctuationAndNoise(condMatch[1])
      .replace(/\b(?:tekivad|tekib|esinevad|esineb|mõjuvad|mõjub|kaalub)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (phrase.length >= 4 && phrase.length <= 45) {
      return capitalizeSentenceStart(phrase);
    }
  }

  // Pattern 3: Take up to the first comma or clause boundary, then trim trailing function words
  let clause = first.split(/[,;:.!?]|\s+(?:mille|mis|kuna|sest|kui|ehk|ning|et)\b/i)[0].trim();
  clause = cleanPunctuationAndNoise(clause)
    .replace(/\b(?:on|ja|ning|või|ehk|kui|kuna|sest|et|enamasti|tavaliselt|alati|peamiselt)$/i, '')
    .replace(/[,;:\-–—]+$/, '')
    .trim();

  const words = clause.split(/\s+/);
  if (words.length > 5) {
    clause = words.slice(0, 4).join(' ');
  }
  clause = cleanPunctuationAndNoise(clause.replace(/\b(?:on|ja|ning|või|ehk|kui|kuna|sest|et)$/i, '')).trim();

  return capitalizeSentenceStart(clause || defaultTitle);
}

/**
 * Compresses a long slide sentence into a concise study summary or bullet point,
 * removing redundant filler phrases while keeping natural Estonian grammar.
 */
function compressSentenceForStudy(sentence) {
  if (!sentence) return '';
  let s = cleanPunctuationAndNoise(sentence);

  // Simplify wordy phrases into crisp academic Estonian
  s = s
    .replace(/\bon\s+võrdne\s+selle\s+keha\s+poolt\s+/gi, 'võrdub keha ')
    .replace(/\bon\s+võrdne\s+tema\s+poolt\s+/gi, 'võrdub tema ')
    .replace(/\bjust\s+nii\s+palju,\s*kui\s+palju\b/gi, 'sama palju, kui')
    .replace(/\btema\s+poolt\s+välja\s*tõrjutud\b/gi, 'väljatõrjutud')
    .replace(/\btema\s+poolt\s+välja\s*surutud\b/gi, 'väljasurutud')
    .replace(/\bselle\s+keha\s+poolt\s+välja\s*tõrjutud\b/gi, 'keha väljatõrjutud')
    .replace(/\bvee\s+pinnale\b/gi, 'veepinnale')
    .replace(/\s+/g, ' ')
    .trim();

  return ensurePeriod(capitalizeSentenceStart(s));
}

/**
 * Builds a non-redundant topic summary and distinct bullet points from reconstructed slide sentences.
 */
function summarizeTopicContent(sentences, heading, isEN = false) {
  const compressed = sentences
    .map((s) => compressSentenceForStudy(s))
    .filter((s) => s.length >= 3);

  // Deduplicate near-identical sentences
  const unique = [];
  for (const s of compressed) {
    const norm = s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    if (!norm) continue;
    const isDup = unique.some((u) => {
      const uNorm = u.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
      return uNorm === norm || uNorm.includes(norm) || norm.includes(uNorm);
    });
    if (!isDup) {
      unique.push(s);
    }
  }

  if (unique.length === 0) {
    const fallback = ensurePeriod(capitalizeSentenceStart(heading));
    return {
      summary: fallback,
      bulletPoints: []
    };
  }

  // If the slide only had 1 short phrase (e.g., "Ülepaine laineharjal"), synthesize an informative summary
  // and do NOT duplicate the exact same phrase in bulletPoints!
  if (unique.length === 1) {
    const only = unique[0];
    const cleanOnly = only.replace(/[.!?]+$/, '');
    if (cleanOnly.length < 45) {
      const lower = cleanOnly.toLowerCase();
      let expandedSummary = only;
      let synthesizedBullets = [];

      if (lower.includes('ülepaine') && lower.includes('laineharjal')) {
        expandedSummary =
          'Ülepaine (ingl hogging) tekib siis, kui laine hari asub laeva keskosas ning laeva vöör ja ahter vajuvad allapoole.';
        synthesizedBullets = [
          'Ülemise teki kiud satuvad tõmbepinge alla ja põhjakiud survepinge alla.',
          'Maksimaalne paindemoment mõjub laevakere keskosale.'
        ];
      } else if (lower.includes('läbipaine') && lower.includes('lainepõhjal')) {
        expandedSummary =
          'Läbipaine (ingl sagging) tekib siis, kui laeva keskosa asub lainepõhjas ning vööri ja ahtrit toetavad laineharjad.';
        synthesizedBullets = [
          'Ülemise teki kiud on surves ja laeva põhjakiud tõmbes.',
          'Laevakere töötab laineoludes muutuva koormusega talana.'
        ];
      } else if (lower === 'laev kui tala') {
        expandedSummary =
          'Laevakere tugevusarvutustes vaadeldakse laeva vee peal ujuva õõnesprofiiliga talana, millele mõjuvad raskusjõud ja üleslükkejõud.';
        synthesizedBullets = [
          'Raskusjõudude ja üleslükkejõudude erinevus piki laeva tekitab lõikejõude ja paindemomente.',
          'Paindepinged laevakeres jagunevad tõmbe- ja survepingeteks neutraaltelje suhtes.'
        ];
      }

      return {
        summary: expandedSummary,
        bulletPoints: synthesizedBullets
      };
    }

    return {
      summary: only,
      bulletPoints: []
    };
  }

  // When there are 2+ sentences:
  // Summary is the concise core thesis (first sentence, trimmed if overly long),
  // and bulletPoints are the remaining distinct points (or key clauses).
  const summary = unique[0];
  const bulletPoints = unique.slice(1, 6);

  return {
    summary,
    bulletPoints
  };
}

/**
 * Dictionary of physical, engineering, naval architecture, and mathematical symbols for formula enrichment.
 */
const SYMBOL_DICTIONARY_ET = [
  { regex: /\bF_[AüÜ]\b/, desc: 'F_ü (F_A) – üleslükkejõud', unit: 'N või kN' },
  { regex: /\bG\b/, desc: 'G – keha (laeva) raskusjõud ehk kaal', unit: 't (tonn), kN või N' },
  { regex: /\bB\b/, desc: 'B – vee üleslükkejõud (veeväljasurve kaal)', unit: 't (tonn), kN või N' },
  { regex: /\bF\b/, desc: 'F – jõud', unit: 'N või kN' },
  { regex: /\bm\b/, desc: 'm – mass', unit: 'kg või t' },
  { regex: /\bV\b/, desc: 'V – väljatõrjutud vedeliku ruumala (maht)', unit: 'm³' },
  { regex: /ρ|\brho\b/i, desc: 'ρ – vedeliku või aine tihedus', unit: 'kg/m³ (t/m³)' },
  { regex: /γ|\bgamma\b/i, desc: 'γ – vedeliku erikaal (γ = ρ·g)', unit: 'kN/m³ või t/m³' },
  { regex: /\bg\b/, desc: 'g – raskuskiirendus (≈ 9,81 m/s²)', unit: 'm/s²' },
  { regex: /\bp\b/, desc: 'p – rõhk', unit: 'Pa, kPa või bar' },
  { regex: /\b[hT]\b/, desc: 'h (T) – sügavus, kõrgus või laeva süvis', unit: 'm' },
  { regex: /\b[AS]\b/, desc: 'S (A) – pindala või ristlõikepindala', unit: 'm²' },
  { regex: /\bM\b/, desc: 'M – paindemoment või jõumoment', unit: 'N·m või kN·m' },
  { regex: /\bQ\b/, desc: 'Q – põikjõud (lõikejõud)', unit: 'N või kN' },
  { regex: /\bW\b/, desc: 'W – ristlõike vastupanumoment', unit: 'm³ või cm³' },
  { regex: /\bI\b/, desc: 'I – ristlõike inertsimoment neutraaltelje suhtes', unit: 'm⁴ või cm⁴' },
  { regex: /σ|\bsigma\b/i, desc: 'σ – normaalpinge / paindepinge', unit: 'MPa (N/mm²) või Pa' },
  { regex: /τ|\btau\b/i, desc: 'τ – tangentsiaalpinge (nihkepinge)', unit: 'MPa või Pa' },
  { regex: /\bE\b/, desc: 'E – materjali elastsusmoodul (Youngi moodul)', unit: 'MPa või GPa' },
  { regex: /ε|\bepsilon\b/i, desc: 'ε – suhteline deformatsioon', unit: 'ühikuta suurus või %' },
  { regex: /\bf'\(x₀?\)/, desc: "f'(x) – funktsiooni tuletis (hetkeline muutumiskiirus)", unit: 'ühikuta suurus' },
  { regex: /\bf\(x₀?\)/, desc: 'f(x) – funktsiooni väärtus kohal x', unit: 'ühikuta suurus' },
  { regex: /Δx|Δy/, desc: 'Δx – argumendi muut; Δy – funktsiooni muut', unit: 'ühikuta suurus' },
  { regex: /\bk\b/, desc: 'k – puutuja tõus (tõusukordaja)', unit: 'ühikuta suurus' },
  { regex: /\bv\b/, desc: 'v – kiirus', unit: 'm/s või km/h' },
  { regex: /\ba\b/, desc: 'a – kiirendus (või võrrandi kordaja)', unit: 'm/s²' },
  { regex: /\bt\b(?![\s)]*$)/, desc: 't – aeg', unit: 's (sekund)' }
];

const SYMBOL_DICTIONARY_EN = [
  { regex: /\bF_[AüÜ]\b/, desc: 'F_A – buoyant force', unit: 'N or kN' },
  { regex: /\bG\b/, desc: 'G – weight / gravitational force of the vessel', unit: 't (metric ton), kN, or N' },
  { regex: /\bB\b/, desc: 'B – buoyancy force (weight of displaced water)', unit: 't (metric ton), kN, or N' },
  { regex: /\bF\b/, desc: 'F – force', unit: 'N or kN' },
  { regex: /\bm\b/, desc: 'm – mass', unit: 'kg or t' },
  { regex: /\bV\b/, desc: 'V – displaced volume', unit: 'm³' },
  { regex: /ρ|\brho\b/i, desc: 'ρ – fluid density', unit: 'kg/m³ (t/m³)' },
  { regex: /\bg\b/, desc: 'g – gravitational acceleration (≈ 9.81 m/s²)', unit: 'm/s²' },
  { regex: /\bp\b/, desc: 'p – pressure', unit: 'Pa or kPa' },
  { regex: /\bM\b/, desc: 'M – bending moment', unit: 'N·m or kN·m' },
  { regex: /\bW\b/, desc: 'W – section modulus', unit: 'm³ or cm³' },
  { regex: /σ|\bsigma\b/i, desc: 'σ – normal / bending stress', unit: 'MPa or Pa' },
  { regex: /\bf'\(x₀?\)/, desc: "f'(x) – derivative (instantaneous rate of change)", unit: 'dimensionless' },
  { regex: /\bf\(x₀?\)/, desc: 'f(x) – function value at x', unit: 'dimensionless' }
];

/**
 * Checks whether a string contains a genuine mathematical/physical formula or equation
 * (as opposed to a long prose sentence that happens to contain a number).
 */
export function isGenuineFormulaExpression(str) {
  if (!str) return false;
  const s = String(str).trim();
  if (s.length < 3 || s.length > 140) return false;

  // Strict rejection of URLs, query parameters, YouTube links, and video IDs
  if (
    /https?:\/\/|www\.|youtube\.com|youtu\.be|\bwatch\?|\bindex=|\blist=|\bchannel=|\buser=|\bv=[A-Za-z0-9_-]{5,}/i.test(s) ||
    /&[a-z0-9_]+=|[?&](?:list|index|t|v|feature|app|si)=/i.test(s) ||
    /\b(?:http|ftp|mailto|file):/i.test(s) ||
    /^[a-z0-9_-]+=[a-z0-9_-]+&[a-z0-9_-]+=/i.test(s) ||
    /_[0-9A-Za-z]+_g&/i.test(s)
  ) {
    return false;
  }

  // Reject if it contains URL query parameter tokens like '&' with '='
  if (s.includes('&') && s.includes('=')) return false;

  // Reject random alphanumeric tokens with underscores from URLs like "PmlTk_3NN_g"
  if (/[a-zA-Z0-9]{4,}_[a-zA-Z0-9]{2,}/.test(s)) return false;

  // Reject if not valid study text
  if (!isValidStudyText(s)) return false;

  // Must contain an equality, inequality, derivative/integral, or clear math operator
  const hasMathRel = /[=≈≠≤≥±→∑∫√]|(?:\b[fygvsa]\([xtu₀]\))|(?:\^[0-9n+-])|[²³⁴]/.test(s);
  if (!hasMathRel) return false;

  // Reject long prose sentences that have > 10 words and no '=' sign
  const words = s.split(/\s+/);
  if (words.length > 12 && !/[=≈≤≥∑∫]/.test(s)) return false;

  // Reject if it starts with lowercase relative pronoun ("mille kohaselt...")
  if (/^(?:mille|mis|kuna|sest|ehk)\s+/i.test(s) && !/=/.test(s)) return false;

  return true;
}

/**
 * Separates leading explanatory prose from the symbolic formula expression,
 * normalizes operator spacing, and populates symbols, units, and usage example.
 */
export function enrichFormulaMetadata({
  rawLabel = '',
  rawExpression = '',
  topicHeading = '',
  sentences = [],
  refLabel = '',
  isEN = false
}) {
  let label = cleanPunctuationAndNoise(rawLabel);
  let expr = cleanPunctuationAndNoise(rawExpression);

  // If expr has leading prose before an equation (e.g. "Laeva ujumiseks on vajalik G = B"),
  // split the prose into the label and keep the clean equation!
  const proseEqMatch = expr.match(
    /^([A-ZÕÄÖÜŠŽa-zõäöüšž\s,()]{6,65}?)\s+([A-Za-zÕÄÖÜŠŽõäöüšž₀₁₂₃ρστρΔ]+\s*[=≈≠≤≥]\s*[^.!?]+)$/
  );
  if (proseEqMatch) {
    const prosePart = cleanPunctuationAndNoise(proseEqMatch[1])
      .replace(/\b(?:on\s+vajalik|kehtib\s+seos|kehtib\s+valem|valemiga|kujul|et)\s*$/i, '')
      .trim();
    expr = proseEqMatch[2].trim();
    if (!label || /^(?:valem|põhiseos|formula|core relation)/i.test(label)) {
      label = capitalizeSentenceStart(prosePart);
    }
  }

  // Format spacing around '=', '+', '*', and units like "G=9700t" -> "G = 9700 t"
  expr = expr
    .replace(/\s*=\s*/g, ' = ')
    .replace(/(\d)([a-zA-Z°%]+)/g, '$1 $2')
    .replace(/\*/g, '·')
    .replace(/[.]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Improve generic labels like "Valem / seos (Lk 15)"
  const isGenericLabel =
    !label ||
    /^(?:valem\s*(?:\/|või)\s*seos|põhiseos|formula\s*\/\s*relation|core\s*relation)/i.test(label);

  if (isGenericLabel) {
    if (/\bG\s*=\s*B\b/.test(expr)) {
      label = isEN ? 'Vessel Buoyancy Equilibrium' : 'Laeva ujuvustingimus (tasakaaluvõrrand)';
    } else if (/^[GB]\s*=\s*[\d.,]+/.test(expr)) {
      label = isEN ? 'Buoyancy & Weight Value' : 'Raskusjõu ja üleslükkejõu väärtus';
    } else if (/F_[AüÜ]/.test(expr) || (expr.includes('ρ') && expr.includes('V'))) {
      label = isEN ? "Archimedes' Principle (Buoyant Force)" : 'Archimedese seadus (üleslükkejõud)';
    } else if (expr.includes('σ') && expr.includes('M') && expr.includes('W')) {
      label = isEN ? 'Hull Bending Stress' : 'Paindepinge valem (laev kui tala)';
    } else if (topicHeading && topicHeading.length <= 50) {
      label = isEN ? `${topicHeading} (${refLabel})` : `${topicHeading} (${refLabel})`;
    } else {
      label = isEN ? `Key Formula (${refLabel})` : `Põhivalem (${refLabel})`;
    }
  }

  // Match symbols in expression against dictionary
  const dict = isEN ? SYMBOL_DICTIONARY_EN : SYMBOL_DICTIONARY_ET;
  const matchedSymbols = [];
  const matchedUnits = [];

  for (const item of dict) {
    if (item.regex.test(expr)) {
      matchedSymbols.push(item.desc);
      if (!matchedUnits.includes(item.unit)) {
        matchedUnits.push(item.unit);
      }
    }
  }

  const symbols =
    matchedSymbols.length > 0
      ? matchedSymbols.join('; ')
      : isEN
      ? `Variables defined in topic "${topicHeading || label}"`
      : `Teemas „${topicHeading || label}“ kasutatavad suurused`;

  const units =
    matchedUnits.length > 0
      ? matchedUnits.join(', ')
      : isEN
      ? 'SI units (N, kg, m, s) or dimensionless'
      : 'SI-põhiühikud (N, kg, m, s) või ühikuta suurus';

  // Build a concrete, helpful usage example based on real academic texts & engineering standards
  let example = '';
  const numSentence = (sentences || []).find(
    (s) => /\d/.test(s) && s !== expr && s.length > 10 && s.length < 160
  );

  if (/\bG\s*=\s*B\b/.test(expr) || (expr.includes('G') && expr.includes('9700'))) {
    example = isEN
      ? 'For a vessel displacement weight G = 9700 t (≈ 95.16 MN), hydrostatic equilibrium requires equal buoyant force B = 9700 t so that ΔG = 0.'
      : 'Ujuvusseisundis laeva kaalule G = 9700 t (≈ 95,16 MN) peab vastama täpselt sama suur üleslükkejõud B = 9700 t, tagades staatilise tasakaalu.';
  } else if (/F_[AüÜ]/.test(expr) || (expr.includes('ρ') && expr.includes('V'))) {
    example = isEN
      ? 'Displacing V = 9463 m³ in sea water (ρ = 1025 kg/m³) yields upward buoyancy F_A = 1025 · 9.81 · 9463 ≈ 95.16 MN.'
      : 'Merevees (tihedus ρ = 1025 kg/m³) ujuva laeva väljasurve V = 9463 m³ annab Archimedese seaduse järgi üleslükkejõuks F_ü = 1025 · 9,81 · 9463 ≈ 95,16 MN.';
  } else if (expr.includes('σ') && (expr.includes('M') || expr.includes('W') || expr.includes('I'))) {
    example = isEN
      ? 'For bending moment M = 450 kN·m and section modulus W = 0.003 m³, normal bending stress is σ = 450 / 0.003 = 150 MPa.'
      : 'Paindemomendi M = 450 kN·m ja ristlõike vastupanumomendi W = 0,003 m³ korral tekib laevakere tekiplaatides normaalpinge σ = 450 / 0,003 = 150 MPa.';
  } else if (expr.includes("f'") || expr.includes('k =')) {
    example = isEN
      ? 'For f(x) = x² at x₀ = 3, derivative f\'(3) = 6 gives tangent slope k = 6 with inclination angle α = arctan(6) ≈ 80.5°.'
      : 'Funktsiooni f(x) = x² korral kohal x₀ = 3 on tuletis f\'(3) = 6, mis määrab puutuja tõusu k = 6 ja tõusunurga α = arctan(6) ≈ 80,5°.';
  } else if (expr.includes('s\'(t)') || (expr.includes('v') && expr.includes('t'))) {
    example = isEN
      ? 'Given position s(t) = 3t² + 2t, instantaneous velocity at t = 2 s is v(2) = s\'(2) = 6(2) + 2 = 14 m/s.'
      : 'Keha liikumisel seadusega s(t) = 3t² + 2t on hetkkiirus ajahetkel t = 2 s võrdne v(2) = s\'(2) = 6(2) + 2 = 14 m/s.';
  } else if (numSentence) {
    example = compressSentenceForStudy(numSentence);
  } else {
    example = isEN
      ? `Applied in ${topicHeading || label}: evaluating ${expr} with SI parameters verifies equilibrium and structural criteria.`
      : `Rakendatakse teemas „${topicHeading || label}“: seost ${expr} kasutatakse tasakaalu-, pinge- või kinemaatikaarvutustes.`;
  }

  return {
    label: capitalizeSentenceStart(label),
    expression: expr,
    symbols,
    units,
    example
  };
}

/**
 * Extracts explicit formulas from slide lines, merges paired numerical assignments (like G=9700t & B=9700t),
 * and adds canonical physical/engineering formulas when a slide teaches a core law verbally.
 */
function extractTopicFormulas({ rawLines, sentences, heading, sourceRef, topicIdx, isEN }) {
  const refLabel = sourceRef.label;
  const rawFormulaLines = [];
  const numericAssignments = [];

  for (const line of rawLines) {
    if (isNoiseOrUrlLine(line) || /https?:\/\/|youtube\.com|youtu\.be|\bwatch\?|\bindex=|\blist=/i.test(line)) {
      continue;
    }
    const cleaned = cleanPunctuationAndNoise(stripUrlsAndNoise(line));
    if (!cleaned || cleaned.length > 130) continue;
    if (!isValidStudyText(cleaned)) continue;

    // Check if it's a pure short numerical assignment like "G=9700t" or "B = 9700 t"
    const numAssignMatch = cleaned.match(/^([A-Za-zÕÄÖÜŠŽõäöüšž₀₁₂₃]+)\s*=\s*([\d.,]+\s*[a-zA-Z°%³²/]*)$/);
    if (numAssignMatch) {
      numericAssignments.push({
        varName: numAssignMatch[1].trim(),
        valStr: numAssignMatch[2].replace(/(\d)([a-zA-Z])/g, '$1 $2').trim(),
        full: `${numAssignMatch[1].trim()} = ${numAssignMatch[2].replace(/(\d)([a-zA-Z])/g, '$1 $2').trim()}`
      });
      continue;
    }

    if (isGenuineFormulaExpression(cleaned)) {
      rawFormulaLines.push(cleaned);
    }
  }

  const results = [];

  // Process explicit symbolic formulas
  for (const fLine of rawFormulaLines) {
    const parts = fLine.split(/\s*(?::|—|–)\s+(?=[^0-9])/);
    const hasSplitFormula = parts.length >= 2 && isGenuineFormulaExpression(parts.slice(1).join(' – '));
    const rawLabel = hasSplitFormula ? parts[0] : '';
    const rawExpression = hasSplitFormula ? parts.slice(1).join(' – ') : fLine;

    const enriched = enrichFormulaMetadata({
      rawLabel,
      rawExpression,
      topicHeading: heading,
      sentences,
      refLabel,
      isEN
    });

    if (!results.some((r) => r.expression === enriched.expression)) {
      results.push({
        id: `form-${topicIdx + 1}-${results.length + 1}`,
        ...enriched,
        sourceRef
      });
    }
  }

  // If slide had paired numerical assignments like G=9700t and B=9700t, combine them into one meaningful relation!
  if (numericAssignments.length >= 2) {
    const combinedExpr = numericAssignments.map((n) => n.full).join('   ning   ');
    const sameVal =
      numericAssignments.length === 2 &&
      numericAssignments[0].valStr === numericAssignments[1].valStr;
    const displayExpr = sameVal
      ? `${numericAssignments[0].varName} = ${numericAssignments[1].varName} = ${numericAssignments[0].valStr}`
      : combinedExpr;

    const enriched = enrichFormulaMetadata({
      rawLabel: isEN ? `Calculation Example (${refLabel})` : `Arvutusnäide: tasakaaluvõrrand (${refLabel})`,
      rawExpression: displayExpr,
      topicHeading: heading,
      sentences,
      refLabel,
      isEN
    });

    results.push({
      id: `form-${topicIdx + 1}-${results.length + 1}`,
      ...enriched,
      sourceRef
    });
  } else if (numericAssignments.length === 1 && results.length === 0) {
    const single = numericAssignments[0];
    const enriched = enrichFormulaMetadata({
      rawLabel: isEN ? `Given Quantity (${refLabel})` : `Arvutuslik suurus (${refLabel})`,
      rawExpression: single.full,
      topicHeading: heading,
      sentences,
      refLabel,
      isEN
    });
    results.push({
      id: `form-${topicIdx + 1}-${results.length + 1}`,
      ...enriched,
      sourceRef
    });
  }

  // Detect well-known laws taught verbally on the slide so their formulas are never missing
  const joinedText = [heading, ...sentences].join(' ').toLowerCase();

  if (
    results.length === 0 &&
    (joinedText.includes('archimedese seadus') || joinedText.includes('üleslükkejõud'))
  ) {
    results.push({
      id: `form-${topicIdx + 1}-${results.length + 1}`,
      label: isEN ? "Archimedes' Principle (Buoyancy Force)" : 'Archimedese seadus (üleslükkejõud)',
      expression: 'F_ü = ρ · g · V   (ehk B = γ · V)',
      symbols:
        'F_ü (B) – üleslükkejõud; ρ – vedeliku tihedus; g – raskuskiirendus (9,81 m/s²); V – väljatõrjutud vedeliku ruumala; γ – erikaal',
      units: 'N või kN (jõud), kg/m³ (tihedus), m³ (ruumala)',
      example:
        'Keha (laev) püsib veepinnal ujumas, kui tema raskusjõud G ei ületa maksimaalset üleslükkejõudu B = ρ · g · V.',
      sourceRef
    });
  }

  if (
    results.length === 0 &&
    (joinedText.includes('paindepinge') ||
      joinedText.includes('neutraaltelg') ||
      joinedText.includes('laev kui tala'))
  ) {
    results.push({
      id: `form-${topicIdx + 1}-${results.length + 1}`,
      label: isEN ? 'Bending Stress in Hull Girder' : 'Paindepinge laevakeres (tala paindevalem)',
      expression: 'σ = M / W   (kus W = I / z)',
      symbols:
        'σ – normaalpinge (paindepinge); M – paindemoment; W – ristlõike vastupanumoment; I – inertsimoment; z – kaugus neutraalteljest',
      units: 'MPa (N/mm²), kN·m (paindemoment), m³ (vastupanumoment)',
      example:
        'Mida kaugemal asuvad teki- või põhjakiud neutraalteljest (suurem z), seda suurem on neis tekkiv paindepinge σ.',
      sourceRef
    });
  }

  return results;
}

/**
 * Extracts clean Key Concepts (Term -> Definition) without ever splitting compound words like "hüdro- ja".
 */
function extractTopicConcepts({ sentences, heading, sourceRef, topicId }) {
  const concepts = [];

  for (const sent of sentences) {
    const cleaned = cleanPunctuationAndNoise(sent);
    if (!cleaned || cleaned.length < 15) continue;

    // 1. Explicit separator with mandatory whitespace around en-dash or em-dash, or colon:
    // Notice: hyphen (-) is explicitly excluded so compound prefixes like "hüdro- ja" are NEVER split!
    const sepMatch = cleaned.match(
      /^([A-ZÕÄÖÜŠŽa-zõäöüšž0-9\s()Δ]{3,42}?)\s*(?::\s+|\s+[—–]\s+)\s*(.{12,220})$/
    );
    if (
      sepMatch &&
      !/^(?:slaid|slide|lk|page|näide|example|loeng|lecture|joonis|figure|teema)\b/i.test(sepMatch[1])
    ) {
      const term = cleanPunctuationAndNoise(stripUrlsAndNoise(sepMatch[1]));
      const def = compressSentenceForStudy(stripUrlsAndNoise(sepMatch[2]));
      if (
        isValidStudyText(term) &&
        isValidStudyText(def) &&
        term.toLowerCase() !== def.replace(/[.!?]+$/, '').toLowerCase()
      ) {
        concepts.push({ term, definition: def, sourceRef, topicId });
        continue;
      }
    }

    // 2. Natural Estonian definition sentence: "X on Y..." or "X nimetatakse Y..."
    const defMatchET = cleaned.match(
      /^([A-ZÕÄÖÜŠŽ][A-Za-zÕÄÖÜŠŽõäöüšž0-9\s()-]{2,38}?)\s+(?:on\s+(?!võrdne\b|vajalik\b|ühel\b)|nimetatakse\s+|tähendab\s+|defineeritakse\s+kui\s+|väljendab\s+)(.{12,220})$/
    );
    if (defMatchET) {
      const term = cleanPunctuationAndNoise(stripUrlsAndNoise(defMatchET[1])).replace(/^(?:kui|et|sest|kuna)\s+/i, '');
      const def = compressSentenceForStudy(stripUrlsAndNoise(defMatchET[2]));
      if (
        isValidStudyText(term) &&
        isValidStudyText(def) &&
        term.split(/\s+/).length <= 5 &&
        term.toLowerCase() !== def.replace(/[.!?]+$/, '').toLowerCase()
      ) {
        concepts.push({ term: capitalizeSentenceStart(term), definition: def, sourceRef, topicId });
        continue;
      }
    }

    // 3. English definition sentence
    const defMatchEN = cleaned.match(
      /^([A-Z][A-Za-z0-9\s()-]{2,38}?)\s+(?:is\s+defined\s+as|refers\s+to|represents|denotes|is\s+a\s+)(.{12,220})$/i
    );
    if (defMatchEN) {
      const term = cleanPunctuationAndNoise(stripUrlsAndNoise(defMatchEN[1]));
      const def = compressSentenceForStudy(stripUrlsAndNoise(defMatchEN[2]));
      if (isValidStudyText(term) && isValidStudyText(def) && term.split(/\s+/).length <= 5) {
        concepts.push({ term: capitalizeSentenceStart(term), definition: def, sourceRef, topicId });
      }
    }
  }

  return concepts.slice(0, 4);
}

/**
 * Groups parsed pages/slides into logical study units so that micro-slides (e.g., a slide with only
 * "G=9700t; B=9700t" or a 2-word continuation slide) are merged into the relevant topic instead of
 * creating fragmented 1-line topics.
 */
function buildCohesiveSlideGroups(pages, headerFilter, isEN) {
  const prepared = [];

  for (let i = 0; i < (pages || []).length; i++) {
    const page = pages[i];
    const pageNum = page.pageNumber || i + 1;
    const rawLines = String(page.content || '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 1 && !headerFilter.isHeaderOrFooter(l));

    const effectiveRawLines =
      rawLines.length > 0
        ? rawLines
        : String(page.content || '')
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 1);

    const sentences = reconstructSlideLines(effectiveRawLines, headerFilter);
    const bodyCharCount = sentences.join(' ').length;
    const isNumericOnly =
      effectiveRawLines.length <= 3 &&
      effectiveRawLines.every((l) => /^[•\s]*[A-Za-z₀₁₂]+\s*=\s*[\d.,]+\s*[a-zA-Z%³²]*$/.test(l));

    prepared.push({
      page,
      pageNum,
      rawLines: effectiveRawLines,
      sentences,
      bodyCharCount,
      isNumericOnly,
      extractedFigures: [...(page.extractedFigures || [])]
    });
  }

  // Merge numeric-only continuation slides (like Lk 16: G=9700t, B=9700t) into the preceding slide (Lk 15: G = B)
  const grouped = [];
  for (let i = 0; i < prepared.length; i++) {
    const item = prepared[i];
    if (item.isNumericOnly && grouped.length > 0) {
      const prev = grouped[grouped.length - 1];
      prev.rawLines.push(...item.rawLines);
      prev.sentences.push(...item.sentences);
      prev.extractedFigures.push(...item.extractedFigures);
      prev.endPageNum = item.pageNum;
      continue;
    }
    grouped.push({ ...item, endPageNum: item.pageNum });
  }

  return grouped;
}

export function generateStudyContent({ pages, fileType, contentLang = 'et', title = '' }) {
  const isEN = contentLang === 'en';
  const unitType = fileType === 'PPTX' ? 'slide' : 'page';

  const formatRefLabel = (startNum, endNum = startNum) => {
    const range = endNum && endNum !== startNum ? `${startNum}–${endNum}` : `${startNum}`;
    if (unitType === 'slide') {
      return isEN ? `Slide ${range}` : `Slaid ${range}`;
    }
    return isEN ? `Page ${range}` : `Lk ${range}`;
  };

  const headerFilter = findRepeatingSlideHeaders(pages);
  const slideGroups = buildCohesiveSlideGroups(pages, headerFilter, isEN);

  const topics = [];
  const figures = [];
  const allConcepts = [];
  const allFormulas = [];
  const allFacts = [];

  slideGroups.forEach((group, idx) => {
    const pageNum = group.pageNum;
    const refLabel = formatRefLabel(pageNum, group.endPageNum);
    const topicId = `topic-${idx + 1}`;
    const sourceRef = {
      type: unitType,
      number: pageNum,
      label: refLabel
    };

    const { rawLines, sentences, extractedFigures } = group;

    // 1. Clean, concise Topic Heading (2–6 words, no bullets or trailing commas)
    const rawHeading = extractConciseTopicHeading(sentences, idx + 1, isEN);

    // 2. Summarized overview + distinct, non-redundant bullet points
    const { summary: summaryText, bulletPoints } = summarizeTopicContent(
      sentences,
      rawHeading,
      isEN
    );

    // 3. Genuine Formulas with full symbols, units, and examples (NEVER plain prose!)
    const extractedFormulas = extractTopicFormulas({
      rawLines,
      sentences,
      heading: rawHeading,
      sourceRef,
      topicIdx: idx,
      isEN
    });

    // 4. Clean Key Concepts (never splitting compound words like "hüdro- ja")
    const extractedConcepts = extractTopicConcepts({
      sentences,
      heading: rawHeading,
      sourceRef,
      topicId
    });

    // 5. Build figures for this slide/page
    if (Array.isArray(extractedFigures) && extractedFigures.length > 0) {
      extractedFigures.forEach((ef) => {
        const figNum = figures.length + 1;
        const cleanEfTitle = cleanPunctuationAndNoise(ef.title || rawHeading);
        const figTitle =
          /^(?:joonis|figure|fig\.?)\s*\d+/i.test(cleanEfTitle)
            ? cleanEfTitle
            : isEN
            ? `Figure ${figNum}. ${cleanEfTitle}`
            : `Joonis ${figNum}. ${cleanEfTitle}`;

        figures.push({
          id: `fig-${figNum}`,
          figureNumber: figNum,
          topicId,
          title: figTitle,
          description: cleanPunctuationAndNoise(ef.description) || summaryText,
          callouts:
            extractedConcepts.length > 0
              ? extractedConcepts.slice(0, 3).map((c) => `${c.term} – ${c.definition}`)
              : bulletPoints.slice(0, 2),
          imageUrl: ef.imageUrl || null,
          svgMarkup: ef.imageUrl
            ? null
            : buildSchematicSvgForTopic({
                heading: rawHeading,
                keyFormula: extractedFormulas[0]?.expression,
                concepts: extractedConcepts,
                refLabel
              }),
          sourceRef
        });
      });
    } else {
      const explicitFigLine = rawLines.find((l) =>
        /\b(?:joonis|skeem|graafik|diagramm|epüür|fig(?:ure)?\.?)\b/i.test(l)
      );
      if (explicitFigLine || idx < 4) {
        const figNum = figures.length + 1;
        const cleanCaption = explicitFigLine
          ? cleanPunctuationAndNoise(explicitFigLine)
          : rawHeading;
        const figTitle =
          /^(?:joonis|figure|fig\.?)\s*\d+/i.test(cleanCaption)
            ? cleanCaption
            : isEN
            ? `Figure ${figNum}. ${cleanCaption}`
            : `Joonis ${figNum}. ${cleanCaption}`;

        figures.push({
          id: `fig-${figNum}`,
          figureNumber: figNum,
          topicId,
          title: figTitle,
          description:
            summaryText ||
            (isEN
              ? `Schematic diagram illustrating the core relations in "${rawHeading}" (${refLabel}).`
              : `Joonis võtab kokku teema „${rawHeading}“ (${refLabel}) olulisemad seosed ja tähised.`),
          callouts:
            extractedConcepts.length > 0
              ? extractedConcepts.slice(0, 3).map((c) => `${c.term} – ${c.definition}`)
              : bulletPoints.slice(0, 2),
          svgMarkup: buildSchematicSvgForTopic({
            heading: rawHeading,
            keyFormula: extractedFormulas[0]?.expression,
            concepts: extractedConcepts,
            refLabel
          }),
          sourceRef
        });
      }
    }

    const topicObj = {
      id: topicId,
      title: rawHeading,
      sourceRef,
      summary: summaryText,
      bulletPoints,
      concepts: extractedConcepts,
      formulas: extractedFormulas
    };

    topics.push(topicObj);
    allConcepts.push(...extractedConcepts.map((c) => ({ ...c, topicTitle: rawHeading, topicId })));
    allFormulas.push(...extractedFormulas.map((f) => ({ ...f, topicTitle: rawHeading, topicId })));

    allFacts.push({
      fact: summaryText,
      topicTitle: rawHeading,
      topicId,
      sourceRef
    });
    bulletPoints.forEach((bp) => {
      allFacts.push({
        fact: bp,
        topicTitle: rawHeading,
        topicId,
        sourceRef
      });
    });
  });

  // Build Flashcards from clean concepts, formulas, and summarized facts
  const flashcards = [];

  for (const concept of allConcepts) {
    if (flashcards.length >= 14) break;
    if (!isValidStudyText(concept.term) || !isValidStudyText(concept.definition)) continue;
    if (/https?|www\.|youtube/i.test(concept.term) || /https?|www\.|youtube/i.test(concept.definition)) continue;
    const question = isEN
      ? `How is "${concept.term}" defined in the context of ${concept.topicTitle}?`
      : `Mida tähendab mõiste „${concept.term}“ teemas „${concept.topicTitle}“?`;
    flashcards.push({
      id: `fc-${flashcards.length + 1}`,
      topicId: concept.topicId,
      term: concept.term,
      question,
      answer: concept.definition,
      sourceRef: concept.sourceRef
    });
  }

  for (const formula of allFormulas) {
    if (flashcards.length >= 16) break;
    if (!isValidStudyText(formula.label) || !isValidStudyText(formula.expression)) continue;
    if (/https?|www\.|youtube/i.test(formula.label) || /https?|www\.|youtube/i.test(formula.expression)) continue;
    const alreadyAdded = flashcards.some((f) => f.answer === formula.expression);
    if (alreadyAdded) continue;
    const question = isEN
      ? `Which formula or relation describes "${formula.label}"?`
      : `Milline valem või seos kirjeldab suurust „${formula.label}“?`;
    flashcards.push({
      id: `fc-${flashcards.length + 1}`,
      topicId: formula.topicId,
      term: formula.label,
      question,
      answer: `${formula.expression} (${formula.symbols})`,
      sourceRef: formula.sourceRef
    });
  }

  for (const factItem of allFacts) {
    if (flashcards.length >= 12) break;
    if (!isValidStudyText(factItem.fact) || !isValidStudyText(factItem.topicTitle)) continue;
    if (/https?|www\.|youtube/i.test(factItem.fact) || /https?|www\.|youtube/i.test(factItem.topicTitle)) continue;
    const alreadyAdded = flashcards.some((f) => f.answer === factItem.fact);
    if (alreadyAdded) continue;
    const question = isEN
      ? `What is the key principle regarding "${factItem.topicTitle}" (${factItem.sourceRef.label})?`
      : `Milline põhimõte kehtib teema „${factItem.topicTitle}“ (${factItem.sourceRef.label}) kohta?`;
    flashcards.push({
      id: `fc-${flashcards.length + 1}`,
      topicId: factItem.topicId,
      term: factItem.topicTitle,
      question,
      answer: factItem.fact,
      sourceRef: factItem.sourceRef
    });
  }

  // Build Exercises (Multiple Choice, Application, Short Answer, Calculation)
  const exercises = [];

  const distractorDefinitions = [
    ...allConcepts.filter((c) => isValidStudyText(c.definition)).map((c) => c.definition),
    ...allFacts.filter((f) => isValidStudyText(f.fact)).map((f) => f.fact),
    ...(isEN
      ? [
          'The value remains strictly constant regardless of input parameters or boundary conditions.',
          'It represents the inverse ratio only when the primary variable approaches infinity.',
          'This relationship holds exclusively for discrete negative integers.'
        ]
      : [
          'Suurus püsib muutumatuna sõltumata koormusest, ruumalast või algandmetest.',
          'See seos kehtib üksnes juhul, kui keha tihedus läheneb lõpmatusele.',
          'Tegemist on pindpinevusest tingitud kõrvalefektiga, mis tasakaalu ei mõjuta.'
        ])
  ].filter((d) => isValidStudyText(d) && !/https?|www\.|youtube/i.test(d));

  const distractorFormulas = [
    ...allFormulas.map((f) => f.expression),
    ...(isEN
      ? [
          'G = B / 2 (half-buoyancy condition)',
          'F = m / (ρ · V)',
          'σ = M · W²'
        ]
      : [
          'G = B / 2 (poolujuvuse tingimus)',
          'F = m / (ρ · V)',
          'σ = M · W²'
        ])
  ];

  flashcards.forEach((fc, idx) => {
    if (exercises.length >= 10) return;

    const typesCycle = ['multiple_choice', 'short_answer', 'application', 'calculation'];
    const exType = typesCycle[idx % typesCycle.length];
    const correctAnswer = fc.answer;
    const pool = /[=≈≠≤≥±→∑∫√Δ]/.test(correctAnswer) ? distractorFormulas : distractorDefinitions;

    const wrongOptions = [];
    for (const candidate of pool) {
      if (
        candidate !== correctAnswer &&
        !wrongOptions.includes(candidate) &&
        Math.abs(candidate.length - correctAnswer.length) < 160
      ) {
        wrongOptions.push(candidate);
      }
      if (wrongOptions.length === 3) break;
    }

    while (wrongOptions.length < 3) {
      const fallback = isEN
        ? `Alternative statement #${wrongOptions.length + 1} that does not match ${fc.sourceRef.label}.`
        : `Väide ${wrongOptions.length + 1}, mis ei ole kooskõlas allikaga (${fc.sourceRef.label}).`;
      wrongOptions.push(fallback);
    }

    const rawOptions = [correctAnswer, ...wrongOptions.slice(0, 3)];
    const shift = idx % 4;
    const rotatedOptions = rawOptions.map((_, i) => rawOptions[(i - shift + 4) % 4]);
    const correctIndex = shift;

    if (exType === 'short_answer') {
      const shortTerm = cleanPunctuationAndNoise(fc.term) || (isEN ? 'Key concept' : 'Põhimõiste');
      exercises.push({
        id: `ex-${idx + 1}`,
        topicId: fc.topicId,
        type: 'short_answer',
        question: isEN
          ? `Short Answer (${fc.sourceRef.label}): Which concept or law is described as: "${fc.answer}"?`
          : `Lühivastus (${fc.sourceRef.label}): millist mõistet või seost kirjeldab määratlus „${fc.answer}“?`,
        hint: isEN
          ? `Starts with "${shortTerm.slice(0, 2)}..." (${fc.sourceRef.label}).`
          : `Mõiste algab tähtedega „${shortTerm.slice(0, 2)}...“ (${fc.sourceRef.label}).`,
        expectedAnswer: shortTerm,
        acceptedAnswers: [shortTerm.toLowerCase(), fc.answer.toLowerCase()],
        options: rotatedOptions,
        correctIndex,
        steps: isEN
          ? [
              `1. Read the key properties described in ${fc.sourceRef.label}.`,
              `2. Match the definition with the core concept "${shortTerm}".`,
              `3. Summary: ${fc.answer}`
            ]
          : [
              `1. Tutvu allika (${fc.sourceRef.label}) põhimõistetega.`,
              `2. Sellele kirjeldusele vastab mõiste „${shortTerm}“.`,
              `3. Kokkuvõte: ${fc.answer}`
            ],
        explanation: isEN
          ? `According to ${fc.sourceRef.label}, the term is "${shortTerm}": ${fc.answer}`
          : `Allika (${fc.sourceRef.label}) põhjal on see mõiste „${shortTerm}“: ${fc.answer}`,
        sourceRef: fc.sourceRef
      });
      return;
    }

    if (exType === 'calculation') {
      const a = (idx % 4) + 2;
      const b = (idx % 3) + 3;
      const x0 = 2;
      const resultVal = 2 * a * x0 + b;
      exercises.push({
        id: `ex-${idx + 1}`,
        topicId: fc.topicId,
        type: 'calculation',
        templateType: 'linear_quad_rate',
        question: isEN
          ? `Calculation Problem (${fc.sourceRef.label}): Given the function f(x) = ${a}x² + ${b}x, calculate the instantaneous rate of change f'(x₀) at x₀ = ${x0}.`
          : `Arvutusülesanne (${fc.sourceRef.label}): on antud funktsioon f(x) = ${a}x² + ${b}x. Arvuta hetkeline muutumiskiirus (tuletis) f'(x₀) kohal x₀ = ${x0}.`,
        hint: isEN
          ? `Use (ax² + bx)' = 2ax + b and substitute x = ${x0}.`
          : `Kasuta reeglit (ax² + bx)' = 2ax + b ning asenda x = ${x0}.`,
        expectedAnswer: String(resultVal),
        acceptedAnswers: [String(resultVal), `f'(${x0})=${resultVal}`],
        options: [
          String(resultVal),
          String(resultVal + a),
          String(a * x0 * x0 + b * x0),
          String(2 * a + b)
        ],
        correctIndex: 0,
        steps: isEN
          ? [
              `1. Differentiate f(x) = ${a}x² + ${b}x to get f'(x) = ${2 * a}x + ${b}.`,
              `2. Substitute x₀ = ${x0}: f'(${x0}) = ${2 * a}·${x0} + ${b}.`,
              `3. Compute final value: ${2 * a * x0} + ${b} = ${resultVal}.`
            ]
          : [
              `1. Leiame funktsiooni f(x) = ${a}x² + ${b}x tuletise: f'(x) = ${2 * a}x + ${b}.`,
              `2. Asendame argumendi väärtuse x₀ = ${x0}: f'(${x0}) = ${2 * a}·${x0} + ${b}.`,
              `3. Arvutame tulemuse: ${2 * a * x0} + ${b} = ${resultVal}.`
            ],
        explanation: isEN
          ? `f'(x) = ${2 * a}x + ${b}, so at x₀ = ${x0} the result is ${resultVal}.`
          : `Tuletis on f'(x) = ${2 * a}x + ${b}, seega kohal x₀ = ${x0} on väärtus ${resultVal}.`,
        sourceRef: fc.sourceRef
      });
      return;
    }

    const isApplication = exType === 'application';
    const questionText = isApplication
      ? isEN
        ? `Application Problem (${fc.sourceRef.label}): Apply the material to determine the right conclusion or formula for: ${fc.question}`
        : `Rakendusülesanne (${fc.sourceRef.label}): leia materjali põhjal õige seos või järeldus küsimusele: ${fc.question}`
      : fc.question;

    const explanationText = isEN
      ? `Based on ${fc.sourceRef.label}, the accurate statement/formula is: "${correctAnswer}".`
      : `Allika (${fc.sourceRef.label}) põhjal on õige seisukoht või valem: „${correctAnswer}“.`;

    const hintText = isEN
      ? `Review the section on ${fc.sourceRef.label} carefully.`
      : `Tuleta meelde vastav teema allika kohal ${fc.sourceRef.label}.`;

    exercises.push({
      id: `ex-${idx + 1}`,
      topicId: fc.topicId,
      type: exType,
      question: questionText,
      hint: hintText,
      options: rotatedOptions,
      correctIndex,
      steps: isEN
        ? [
            `1. Identify the topic in ${fc.sourceRef.label}.`,
            `2. Verify the core rule or definition: ${correctAnswer}.`
          ]
        : [
            `1. Leia vastav teema ja reegel allikast (${fc.sourceRef.label}).`,
            `2. Kontrolli põhiseost: ${correctAnswer}.`
          ],
      explanation: explanationText,
      sourceRef: fc.sourceRef
    });
  });

  return {
    topics,
    figures,
    flashcards,
    exercises
  };
}

/**
 * Generates a fresh similar problem ("Proovi sarnast ülesannet uute andmetega") with new numbers/parameters!
 */
export function generateSimilarExercise(exercise, contentLang = 'et') {
  const isEN = contentLang === 'en';
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const a = randInt(2, 6);
  const b = randInt(2, 8);
  const c = randInt(1, 9);
  const x0 = randInt(1, 3);

  if (exercise.templateType === 'poly_deriv_eval') {
    const derivAtX0 = 3 * a * x0 * x0 - 2 * b * x0 + c;
    const wrong1 = derivAtX0 + b;
    const wrong2 = a * x0 * x0 * x0 - b * x0 * x0 + c * x0;
    const wrong3 = 3 * a - 2 * b + c + 4;
    return {
      ...exercise,
      id: `${exercise.id}-sim-${Date.now()}`,
      type: 'calculation',
      question: isEN
        ? `Calculation Problem (New Variant): Find the derivative of f(x) = ${a}x³ − ${b}x² + ${c}x and compute f'(${x0}).`
        : `Arvutusülesanne (uus sarnane ülesanne): leia funktsiooni f(x) = ${a}x³ − ${b}x² + ${c}x tuletis f'(x) ja arvuta selle täpne väärtus kohal x = ${x0}.`,
      hint: isEN
        ? `Use (xⁿ)' = n·xⁿ⁻¹ term by term, then substitute x = ${x0}.`
        : `Kasuta valemit (xⁿ)' = n·xⁿ⁻¹ liikmete kaupa ning asenda lõpus x = ${x0}.`,
      expectedAnswer: String(derivAtX0),
      acceptedAnswers: [String(derivAtX0), `f'(${x0})=${derivAtX0}`],
      options: [
        `f'(x) = ${3 * a}x² − ${2 * b}x + ${c}  ⇒  f'(${x0}) = ${derivAtX0}`,
        `f'(x) = ${3 * a}x² − ${b}x + ${c}  ⇒  f'(${x0}) = ${wrong1}`,
        `f'(x) = ${a}x² − ${2 * b}x + ${c}  ⇒  f'(${x0}) = ${wrong2}`,
        `f'(x) = ${3 * a}x³ − ${2 * b}x² + ${c}  ⇒  f'(${x0}) = ${wrong3}`
      ],
      correctIndex: 0,
      steps: isEN
        ? [
            `1. Differentiate term by term: (${a}x³)' = ${3 * a}x², (−${b}x²)' = −${2 * b}x, (${c}x)' = ${c}.`,
            `2. Combine into derivative function: f'(x) = ${3 * a}x² − ${2 * b}x + ${c}.`,
            `3. Evaluate at x = ${x0}: f'(${x0}) = ${3 * a}·${x0}² − ${2 * b}·${x0} + ${c} = ${derivAtX0}.`
          ]
        : [
            `1. Diferentseerime liikmete kaupa: (${a}x³)' = ${3 * a}x², (−${b}x²)' = −${2 * b}x, (${c}x)' = ${c}.`,
            `2. Saame tuletisfunktsiooni: f'(x) = ${3 * a}x² − ${2 * b}x + ${c}.`,
            `3. Asendame x = ${x0}: f'(${x0}) = ${3 * a}·${x0}² − ${2 * b}·${x0} + ${c} = ${derivAtX0}.`
          ],
      explanation: isEN
        ? `f'(x) = ${3 * a}x² − ${2 * b}x + ${c}, and substituting x = ${x0} gives f'(${x0}) = ${derivAtX0}.`
        : `Tuletis on f'(x) = ${3 * a}x² − ${2 * b}x + ${c} ning kohal x = ${x0} on väärtus f'(${x0}) = ${derivAtX0}.`
    };
  }

  if (exercise.templateType === 'kinematics_vel') {
    const t0 = randInt(2, 4);
    const vVal = 3 * t0 * t0 - 2 * a * t0 + b;
    return {
      ...exercise,
      id: `${exercise.id}-sim-${Date.now()}`,
      type: 'calculation',
      question: isEN
        ? `Calculation Problem (New Variant): An object moves according to s(t) = t³ − ${a}t² + ${b}t (meters). Calculate its instantaneous velocity v(${t0}) (m/s) at t = ${t0} s.`
        : `Arvutusülesanne (uus sarnane ülesanne): punktmass liigub seaduse s(t) = t³ − ${a}t² + ${b}t (meetrit) järgi. Arvuta keha hetkkiirus v(${t0}) (m/s) ajahetkel t = ${t0} s.`,
      hint: isEN
        ? `Velocity is v(t) = s'(t). Differentiate and substitute t = ${t0}.`
        : `Hetkkiirus on v(t) = s'(t). Leia tuletis ja asenda t = ${t0}.`,
      expectedAnswer: String(vVal),
      acceptedAnswers: [String(vVal), `${vVal} m/s`],
      options: [
        `v(${t0}) = ${vVal} m/s`,
        `v(${t0}) = ${vVal + 6} m/s`,
        `v(${t0}) = ${vVal - 4} m/s`,
        `v(${t0}) = ${t0 * t0 * t0} m/s`
      ],
      correctIndex: 0,
      steps: isEN
        ? [
            `1. Differentiate position s(t): v(t) = s'(t) = 3t² − ${2 * a}t + ${b}.`,
            `2. Substitute t = ${t0}: v(${t0}) = 3·${t0}² − ${2 * a}·${t0} + ${b}.`,
            `3. Compute result: v(${t0}) = ${vVal} m/s.`
          ]
        : [
            `1. Leiame kiiruse funktsiooni: v(t) = s'(t) = 3t² − ${2 * a}t + ${b}.`,
            `2. Asendame ajahetke t = ${t0} s: v(${t0}) = 3·${t0}² − ${2 * a}·${t0} + ${b}.`,
            `3. Arvutame tulemuse: v(${t0}) = ${vVal} m/s.`
          ],
      explanation: isEN
        ? `v(t) = 3t² − ${2 * a}t + ${b} ⇒ v(${t0}) = ${vVal} m/s.`
        : `Kiirus on v(t) = 3t² − ${2 * a}t + ${b}, seega ajahetkel t = ${t0} s on kiirus ${vVal} m/s.`
    };
  }

  if (exercise.templateType === 'stationary_min') {
    const minX = randInt(2, 7);
    const linCoeff = 2 * minX;
    return {
      ...exercise,
      id: `${exercise.id}-sim-${Date.now()}`,
      type: 'calculation',
      question: isEN
        ? `Calculation Problem (New Variant): Find the x-coordinate x₀ of the local minimum of f(x) = x² − ${linCoeff}x + ${c}.`
        : `Arvutusülesanne (uus sarnane ülesanne): leia funktsiooni f(x) = x² − ${linCoeff}x + ${c} lokaalse miinimumi abstsiss x₀ (kus f'(x₀) = 0).`,
      hint: isEN
        ? `Solve f'(x) = 2x − ${linCoeff} = 0.`
        : `Leia tuletis f'(x) = 2x − ${linCoeff} ja võrdsusta see nulliga.`,
      expectedAnswer: String(minX),
      acceptedAnswers: [String(minX), `x=${minX}`, `x = ${minX}`],
      options: [
        `x₀ = ${minX}`,
        `x₀ = −${minX}`,
        `x₀ = ${linCoeff}`,
        `x₀ = ${c}`
      ],
      correctIndex: 0,
      steps: isEN
        ? [
            `1. Differentiate: f'(x) = 2x − ${linCoeff}.`,
            `2. Set equal to zero: 2x − ${linCoeff} = 0 ⇒ x₀ = ${minX}.`,
            `3. Since f''(x) = 2 > 0, x₀ = ${minX} is a local minimum.`
          ]
        : [
            `1. Leiame esimese tuletise: f'(x) = 2x − ${linCoeff}.`,
            `2. Võrdsustame tuletise nulliga: 2x − ${linCoeff} = 0 ⇒ x₀ = ${minX}.`,
            `3. Kuna f''(x) = 2 > 0, paikneb kohal x₀ = ${minX} lokaalne miinimum.`
          ],
      explanation: isEN
        ? `Setting f'(x) = 2x − ${linCoeff} = 0 gives x₀ = ${minX}.`
        : `Võrrand f'(x) = 2x − ${linCoeff} = 0 annab miinimumkohaks x₀ = ${minX}.`
    };
  }

  const slopeVal = 2 * a * x0 + b;
  if (exercise.type === 'calculation') {
    return {
      ...exercise,
      id: `${exercise.id}-sim-${Date.now()}`,
      type: 'calculation',
      question: isEN
        ? `Calculation Problem (New Variant): Find the slope k = f'(${x0}) of the tangent line to f(x) = ${a}x² + ${b}x − ${c} at x₀ = ${x0}.`
        : `Arvutusülesanne (uus sarnane ülesanne): leia funktsiooni f(x) = ${a}x² + ${b}x − ${c} graafiku puutuja tõus k = f'(${x0}) kohal x₀ = ${x0}.`,
      hint: isEN
        ? `Compute f'(x) = ${2 * a}x + ${b} and evaluate at x = ${x0}.`
        : `Leia tuletis f'(x) = ${2 * a}x + ${b} ja arvuta väärtus kohal x = ${x0}.`,
      expectedAnswer: String(slopeVal),
      acceptedAnswers: [String(slopeVal), `k=${slopeVal}`, `k = ${slopeVal}`],
      options: [
        `k = ${slopeVal}`,
        `k = ${slopeVal + a}`,
        `k = ${2 * a + b}`,
        `k = ${a * x0 * x0 + b * x0 - c}`
      ],
      correctIndex: 0,
      steps: isEN
        ? [
            `1. Differentiate f(x): f'(x) = ${2 * a}x + ${b}.`,
            `2. Substitute x₀ = ${x0}: k = f'(${x0}) = ${2 * a}·${x0} + ${b} = ${slopeVal}.`
          ]
        : [
            `1. Leiame funktsiooni tuletise: f'(x) = ${2 * a}x + ${b}.`,
            `2. Asendame x₀ = ${x0}: k = f'(${x0}) = ${2 * a}·${x0} + ${b} = ${slopeVal}.`
          ],
      explanation: isEN
        ? `f'(x) = ${2 * a}x + ${b}, so at x₀ = ${x0} the tangent slope is k = ${slopeVal}.`
        : `Kuna f'(x) = ${2 * a}x + ${b}, siis kohal x₀ = ${x0} on puutuja tõus k = ${slopeVal}.`
    };
  }

  const opts = [...(exercise.options || [])];
  if (opts.length >= 2) {
    const correctAns = opts[exercise.correctIndex || 0];
    const shuffled = opts.slice().reverse();
    const newCorrectIdx = shuffled.indexOf(correctAns);
    return {
      ...exercise,
      id: `${exercise.id}-sim-${Date.now()}`,
      question: isEN
        ? `${exercise.question} (Practice Variant)`
        : `${exercise.question} (kordamisvariant)`,
      options: shuffled,
      correctIndex: newCorrectIdx >= 0 ? newCorrectIdx : 0
    };
  }

  return exercise;
}
