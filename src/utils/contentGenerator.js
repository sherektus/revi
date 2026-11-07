/**
 * Generates structured study views (Topics/Summary points, Slide Figures, Flashcards, Exercises, and Formula Sheet items)
 * from parsed file pages/slides in the user-selected language ('et' or 'en').
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

export function generateStudyContent({ pages, fileType, contentLang = 'et', title = '' }) {
  const isEN = contentLang === 'en';
  const unitType = fileType === 'PPTX' ? 'slide' : 'page';

  const formatRefLabel = (pageNumber) => {
    if (unitType === 'slide') {
      return isEN ? `Slide ${pageNumber}` : `Slaid ${pageNumber}`;
    }
    return isEN ? `Page ${pageNumber}` : `Lk ${pageNumber}`;
  };

  const topics = [];
  const figures = [];
  const allConcepts = [];
  const allFormulas = [];
  const allFacts = [];

  pages.forEach((page, idx) => {
    const pageNum = page.pageNumber || idx + 1;
    const refLabel = formatRefLabel(pageNum);
    const topicId = `topic-${idx + 1}`;
    const sourceRef = {
      type: unitType,
      number: pageNum,
      label: refLabel
    };

    const rawLines = page.content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 1);

    let rawHeading = rawLines[0] || (isEN ? `Topic ${idx + 1}` : `Teema ${idx + 1}`);
    rawHeading = rawHeading
      .replace(/^(?:Slaid|Slide|Lk|Page|Osa|Section)\s*\d+\s*[:.-]?\s*/i, '')
      .replace(/^#+\s*/, '')
      .trim();
    if (!rawHeading || rawHeading.length < 3) {
      rawHeading = isEN ? `${title || 'Material'} – Part ${idx + 1}` : `${title || 'Materjal'} – ${idx + 1}. osa`;
    }
    if (rawHeading.length > 75) {
      rawHeading = rawHeading.slice(0, 72) + '...';
    }

    const bodyLines = rawLines.length > 1 ? rawLines.slice(1) : rawLines;
    const bodyText = bodyLines.join(' ');
    const sentences = bodyText
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.replace(/^[•\-*]\s*/, '').trim())
      .filter((s) => s.length > 12);

    // Extract formulas with symbols, units, and examples for Formula Sheet
    const formulaRegex = /[=≈≠≤≥±→∑∫√Δ]|(?:\b[fygvsa]\([xtu]\))|(?:\^[0-9n+-])/i;
    const extractedFormulas = [];
    for (const line of rawLines) {
      if (formulaRegex.test(line) && line.length <= 130) {
        const parts = line.split(/[:—–-]\s+(?=[^0-9])/);
        const label =
          parts.length >= 2 && formulaRegex.test(parts.slice(1).join(' – '))
            ? parts[0].replace(/^[•\-*]\s*/, '').trim()
            : isEN
            ? `Formula / Relation (${refLabel})`
            : `Valem või seos (${refLabel})`;
        const expression =
          parts.length >= 2 && formulaRegex.test(parts.slice(1).join(' – '))
            ? parts.slice(1).join(' – ').trim()
            : line.replace(/^[•\-*]\s*/, '').trim();

        extractedFormulas.push({
          id: `form-${idx + 1}-${extractedFormulas.length + 1}`,
          label,
          expression,
          symbols: isEN
            ? `Variables and quantities defined in "${rawHeading}"`
            : `Teemas „${rawHeading}“ esinevad suurused ja tähised`,
          units: isEN ? 'Standard SI / dimensionless' : 'SI-ühikud või ühikuta suurus',
          example:
            sentences.find((s) => /näide|example|nt\b|kui\b|if\b/i.test(s)) ||
            (isEN
              ? `Application of ${expression} in "${rawHeading}".`
              : `Seose ${expression} rakendamine teema „${rawHeading}“ ülesannetes.`),
          sourceRef
        });
      }
    }

    // Extract key concepts
    const extractedConcepts = [];
    for (const line of rawLines) {
      const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
      const colonMatch = cleaned.match(/^([A-ZÕÄÖÜŠŽa-zõäöüšž0-9\s()Δ]{3,42})\s*(?::|—|–|-)\s*(.{12,180})$/);
      if (colonMatch && !/^(?:Slaid|Slide|Lk|Page|Näide|Example|Loeng|Lecture|Joonis|Figure)\b/i.test(colonMatch[1])) {
        extractedConcepts.push({
          term: colonMatch[1].trim(),
          definition: colonMatch[2].trim(),
          sourceRef,
          topicId
        });
        continue;
      }

      const defMatchET = cleaned.match(/^(.{3,45}?)\s+(?:nimetatakse|tähendab|defineeritakse kui|väljendab)\s+(.{12,160})$/i);
      if (defMatchET) {
        extractedConcepts.push({
          term: defMatchET[1].trim(),
          definition: defMatchET[2].trim(),
          sourceRef,
          topicId
        });
        continue;
      }

      const defMatchEN = cleaned.match(/^(.{3,45}?)\s+(?:is defined as|refers to|represents|denotes)\s+(.{12,160})$/i);
      if (defMatchEN) {
        extractedConcepts.push({
          term: defMatchEN[1].trim(),
          definition: defMatchEN[2].trim(),
          sourceRef,
          topicId
        });
      }
    }

    if (extractedConcepts.length === 0 && sentences.length > 0) {
      sentences.slice(0, 2).forEach((sent, sIdx) => {
        const words = sent.split(/\s+/);
        const termWords = words.slice(0, Math.min(3, words.length)).join(' ').replace(/[,:;.]$/, '');
        extractedConcepts.push({
          term: termWords.length > 2 ? termWords : `${rawHeading} (${sIdx + 1})`,
          definition: sent,
          sourceRef,
          topicId
        });
      });
    }

    if (extractedFormulas.length === 0 && sentences.length > 0) {
      const candidate = sentences.find((s) => /\d|[A-Z]{2,}|%/.test(s)) || sentences[0];
      extractedFormulas.push({
        id: `form-${idx + 1}-1`,
        label: isEN ? `Core relation (${refLabel})` : `Põhiseos (${refLabel})`,
        expression: candidate.length > 95 ? candidate.slice(0, 92) + '...' : candidate,
        symbols: isEN ? `Key terms from ${rawHeading}` : `Olulised tähised teemast „${rawHeading}“`,
        units: isEN ? 'Context-dependent' : 'Sõltub ülesande kontekstist',
        example: sentences[1] || candidate,
        sourceRef
      });
    }

    const bulletPoints =
      sentences.length > 0
        ? sentences.slice(0, 4)
        : [page.content.trim().slice(0, 180)];

    const summaryText =
      sentences.slice(0, 2).join(' ') ||
      page.content.trim().slice(0, 220);

    // Build figures for this slide/page:
    // 1. Any embedded images extracted directly from PPTX/PDF
    if (Array.isArray(page.extractedFigures) && page.extractedFigures.length > 0) {
      page.extractedFigures.forEach((ef) => {
        const figNum = figures.length + 1;
        const figTitle = ef.title
          ? ef.title.startsWith('Joonis') || ef.title.startsWith('Figure')
            ? ef.title
            : isEN
            ? `Figure ${figNum}. ${ef.title}`
            : `Joonis ${figNum}. ${ef.title}`
          : isEN
          ? `Figure ${figNum}. ${rawHeading}`
          : `Joonis ${figNum}. ${rawHeading}`;

        figures.push({
          id: `fig-${figNum}`,
          figureNumber: figNum,
          topicId,
          title: figTitle,
          description: ef.description || summaryText,
          callouts: extractedConcepts.slice(0, 3).map((c) => `${c.term} – ${c.definition.slice(0, 80)}`),
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
      // 2. Check if text explicitly mentions a figure/diagram/graph OR generate a schematic overview figure for key slides
      const explicitFigLine = rawLines.find((l) =>
        /\b(?:joonis|skeem|graafik|diagramm|fig(?:ure)?\.?)\b/i.test(l)
      );
      if (explicitFigLine || idx < 4) {
        const figNum = figures.length + 1;
        const cleanCaption = explicitFigLine
          ? explicitFigLine.replace(/^[•\-*]\s*/, '').trim()
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
          callouts: extractedConcepts
            .slice(0, 3)
            .map((c) => `${c.term} – ${c.definition.slice(0, 85)}`),
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
      concepts: extractedConcepts.slice(0, 4),
      formulas: extractedFormulas.slice(0, 3)
    };

    topics.push(topicObj);
    allConcepts.push(...extractedConcepts.map((c) => ({ ...c, topicTitle: rawHeading, topicId })));
    allFormulas.push(...extractedFormulas.map((f) => ({ ...f, topicTitle: rawHeading, topicId })));
    bulletPoints.forEach((bp) => {
      allFacts.push({
        fact: bp,
        topicTitle: rawHeading,
        topicId,
        sourceRef
      });
    });
  });

  // Build Flashcards
  const flashcards = [];

  for (const concept of allConcepts) {
    if (flashcards.length >= 12) break;
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
    if (flashcards.length >= 12) break;
    const alreadyAdded = flashcards.some((f) => f.answer === formula.expression);
    if (alreadyAdded) continue;
    const question = isEN
      ? `Which formula or relation describes "${formula.label}" (${formula.topicTitle})?`
      : `Milline valem või seos kirjeldab suurust „${formula.label}“ (${formula.topicTitle})?`;
    flashcards.push({
      id: `fc-${flashcards.length + 1}`,
      topicId: formula.topicId,
      term: formula.label,
      question,
      answer: formula.expression,
      sourceRef: formula.sourceRef
    });
  }

  for (const factItem of allFacts) {
    if (flashcards.length >= 8) break;
    const alreadyAdded = flashcards.some((f) => f.answer === factItem.fact);
    if (alreadyAdded) continue;
    const question = isEN
      ? `What is the key takeaway regarding "${factItem.topicTitle}" (${factItem.sourceRef.label})?`
      : `Milline põhiväide kehtib teema „${factItem.topicTitle}“ (${factItem.sourceRef.label}) kohta?`;
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
    ...allConcepts.map((c) => c.definition),
    ...allFacts.map((f) => f.fact),
    ...(isEN
      ? [
          'The value remains strictly constant regardless of input parameters or boundary conditions.',
          'It represents the inverse ratio only when the primary variable approaches infinity.',
          'This relationship holds exclusively for discrete negative integers.'
        ]
      : [
          'Väärtus püsib muutumatuna sõltumata algandmetest või argumendi väärtusest.',
          'See seos kehtib üksnes juhul, kui argument läheneb lõpmatusele.',
          'See omadus kirjeldab vaid pöördvõrdelist kahanemist negatiivsete täisarvude korral.'
        ])
  ];

  const distractorFormulas = [
    ...allFormulas.map((f) => f.expression),
    ...(isEN
      ? [
          'f(x) = C · x⁰ = 1 (constant identity)',
          'Δy · Δx = f(x₀) + f(0)',
          'y = −1 / (x² + 1)'
        ]
      : [
          'f(x) = C · x⁰ = 1 (konstantne samasus)',
          'Δy · Δx = f(x₀) + f(0)',
          'y = −1 / (x² + 1)'
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
        ? `Alternative interpretation #${wrongOptions.length + 1} that does not match ${fc.sourceRef.label}.`
        : `Väide ${wrongOptions.length + 1}, mis ei ole kooskõlas allikaga (${fc.sourceRef.label}).`;
      wrongOptions.push(fallback);
    }

    const rawOptions = [correctAnswer, ...wrongOptions.slice(0, 3)];
    const shift = idx % 4;
    const rotatedOptions = rawOptions.map((_, i) => rawOptions[(i - shift + 4) % 4]);
    const correctIndex = shift;

    if (exType === 'short_answer') {
      const shortTerm = fc.term || (isEN ? 'Key concept' : 'Põhimõiste');
      exercises.push({
        id: `ex-${idx + 1}`,
        topicId: fc.topicId,
        type: 'short_answer',
        question: isEN
          ? `Short Answer (${fc.sourceRef.label}): Which concept or term is defined as: "${fc.answer}"?`
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
              `3. Full explanation: ${fc.answer}`
            ]
          : [
              `1. Tutvu allika (${fc.sourceRef.label}) põhimõistetega.`,
              `2. Sellele kirjeldusele vastab mõiste „${shortTerm}“.`,
              `3. Täpne selgitus: ${fc.answer}`
            ],
        explanation: isEN
          ? `According to ${fc.sourceRef.label}, the term is "${shortTerm}": ${fc.answer}`
          : `Allika (${fc.sourceRef.label}) põhjal on see mõiste „${shortTerm}“: ${fc.answer}`,
        sourceRef: fc.sourceRef
      });
      return;
    }

    if (exType === 'calculation') {
      const a = (idx % 4) + 2; // 2..5
      const b = (idx % 3) + 3; // 3..5
      const x0 = 2;
      const resultVal = 2 * a * x0 + b;
      exercises.push({
        id: `ex-${idx + 1}`,
        topicId: fc.topicId,
        type: 'calculation',
        templateType: 'linear_quad_rate',
        question: isEN
          ? `Calculation Problem (${fc.sourceRef.label}): Given the function f(x) = ${a}x² + ${b}x, calculate the instantaneous rate of change f'(x₀) at x₀ = ${x0}.`
          : `Arvutusülesanne (${fc.sourceRef.label}): on teada funktsioon f(x) = ${a}x² + ${b}x. Arvuta hetkeline muutumiskiirus (tuletis) f'(x₀) kohal x₀ = ${x0}.`,
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

  // Default calculation / tangent slope / general variant generator
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

  // For multiple_choice / application / short_answer: rotate options and rephrase prompt slightly
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
