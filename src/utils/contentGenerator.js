/**
 * Generates structured study views (Topics/Summary points, Flashcards, and Exercises)
 * from parsed file pages/slides in the user-selected language ('et' or 'en').
 */
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
  const allConcepts = [];
  const allFormulas = [];
  const allFacts = [];

  pages.forEach((page, idx) => {
    const pageNum = page.pageNumber || idx + 1;
    const refLabel = formatRefLabel(pageNum);
    const sourceRef = {
      type: unitType,
      number: pageNum,
      label: refLabel
    };

    const rawLines = page.content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 1);

    // Determine topic title from first heading-like line
    let rawHeading = rawLines[0] || (isEN ? `Topic ${idx + 1}` : `Teema ${idx + 1}`);
    rawHeading = rawHeading
      .replace(/^(?:Slaid|Slide|Lk|Page|Osa|Section)\s*\d+\s*[:.-]?\s*/i, '')
      .replace(/^#+\s*/, '')
      .trim();
    if (!rawHeading || rawHeading.length < 3) {
      rawHeading = isEN ? `${title || 'Material'} — Part ${idx + 1}` : `${title || 'Materjal'} — Osa ${idx + 1}`;
    }
    if (rawHeading.length > 75) {
      rawHeading = rawHeading.slice(0, 72) + '...';
    }

    // Extract sentences and bullet points
    const bodyLines = rawLines.length > 1 ? rawLines.slice(1) : rawLines;
    const bodyText = bodyLines.join(' ');
    const sentences = bodyText
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.replace(/^[•\-*]\s*/, '').trim())
      .filter((s) => s.length > 12);

    // Extract formulas (lines containing math/scientific operators)
    const formulaRegex = /[=≈≠≤≥±→∑∫√Δ]|(?:\b[fygvsa]\([xtu]\))|(?:\^[0-9n+-])/i;
    const extractedFormulas = [];
    for (const line of rawLines) {
      if (formulaRegex.test(line) && line.length <= 120) {
        const parts = line.split(/[:—–-]\s+(?=[^0-9])/);
        if (parts.length >= 2 && formulaRegex.test(parts.slice(1).join(' - '))) {
          extractedFormulas.push({
            label: parts[0].replace(/^[•\-*]\s*/, '').trim(),
            expression: parts.slice(1).join(' - ').trim(),
            sourceRef
          });
        } else {
          extractedFormulas.push({
            label: isEN ? `Key relation (${refLabel})` : `Valem / seos (${refLabel})`,
            expression: line.replace(/^[•\-*]\s*/, '').trim(),
            sourceRef
          });
        }
      }
    }

    // Extract key concepts (Term: Definition or Term - Definition or sentences with defining verbs)
    const extractedConcepts = [];
    for (const line of rawLines) {
      const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
      const colonMatch = cleaned.match(/^([A-ZÕÄÖÜŠŽa-zõäöüšž0-9\s()Δ]{3,42})\s*(?::|—|–|-)\s*(.{12,180})$/);
      if (colonMatch && !/^(?:Slaid|Slide|Lk|Page|Näide|Example|Loeng|Lecture)\b/i.test(colonMatch[1])) {
        extractedConcepts.push({
          term: colonMatch[1].trim(),
          definition: colonMatch[2].trim(),
          sourceRef
        });
        continue;
      }

      const defMatchET = cleaned.match(/^(.{3,45}?)\s+(?:nimetatakse|tähendab|on defineeritud kui|väljendab)\s+(.{12,160})$/i);
      if (defMatchET) {
        extractedConcepts.push({
          term: defMatchET[1].trim(),
          definition: defMatchET[2].trim(),
          sourceRef
        });
        continue;
      }

      const defMatchEN = cleaned.match(/^(.{3,45}?)\s+(?:is defined as|refers to|represents|denotes)\s+(.{12,160})$/i);
      if (defMatchEN) {
        extractedConcepts.push({
          term: defMatchEN[1].trim(),
          definition: defMatchEN[2].trim(),
          sourceRef
        });
      }
    }

    // If no explicit colon/definition pattern was found on this page, synthesize from key sentences
    if (extractedConcepts.length === 0 && sentences.length > 0) {
      sentences.slice(0, 2).forEach((sent, sIdx) => {
        const words = sent.split(/\s+/);
        const termWords = words.slice(0, Math.min(3, words.length)).join(' ').replace(/[,:;.]$/, '');
        extractedConcepts.push({
          term: termWords.length > 2 ? termWords : `${rawHeading} (${sIdx + 1})`,
          definition: sent,
          sourceRef
        });
      });
    }

    // If no explicit formula was detected, include core structural rule or relation
    if (extractedFormulas.length === 0 && sentences.length > 0) {
      const candidate = sentences.find((s) => /\d|[A-Z]{2,}|%/.test(s)) || sentences[0];
      extractedFormulas.push({
        label: isEN ? `Core principle (${refLabel})` : `Põhiseos (${refLabel})`,
        expression: candidate.length > 95 ? candidate.slice(0, 92) + '...' : candidate,
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

    const topicObj = {
      id: `topic-${idx + 1}`,
      title: rawHeading,
      sourceRef,
      summary: summaryText,
      bulletPoints,
      concepts: extractedConcepts.slice(0, 4),
      formulas: extractedFormulas.slice(0, 3)
    };

    topics.push(topicObj);
    allConcepts.push(...extractedConcepts.map((c) => ({ ...c, topicTitle: rawHeading })));
    allFormulas.push(...extractedFormulas.map((f) => ({ ...f, topicTitle: rawHeading })));
    bulletPoints.forEach((bp) => {
      allFacts.push({
        fact: bp,
        topicTitle: rawHeading,
        sourceRef
      });
    });
  });

  // Build Flashcards in selected contentLang
  const flashcards = [];

  for (const concept of allConcepts) {
    if (flashcards.length >= 12) break;
    const question = isEN
      ? `How is "${concept.term}" defined or explained in the context of ${concept.topicTitle}?`
      : `Kuidas on mõiste „${concept.term}“ selgitatud teema „${concept.topicTitle}“ juures?`;
    flashcards.push({
      id: `fc-${flashcards.length + 1}`,
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
      ? `Which formula or key relation describes "${formula.label}" (${formula.topicTitle})?`
      : `Milline valem või põhiseos kehtib seose „${formula.label}“ (${formula.topicTitle}) kohta?`;
    flashcards.push({
      id: `fc-${flashcards.length + 1}`,
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
      : `Milline oluline tähelepanek kehtib teema „${factItem.topicTitle}“ (${factItem.sourceRef.label}) kohta?`;
    flashcards.push({
      id: `fc-${flashcards.length + 1}`,
      question,
      answer: factItem.fact,
      sourceRef: factItem.sourceRef
    });
  }

  // Build Exercises (mix of multiple_choice and application) in selected contentLang
  const exercises = [];

  // Distractor pool from other definitions/facts/formulas
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
          'Väärtus jääb alati konstantseks sõltumata sisendparameetrite või argumendi muutumisest.',
          'See seos kehtib ainult juhul, kui funktsiooni väärtus läheneb lõpmatusele.',
          'Antud omadus kirjeldab üksnes pöördvõrdelist kahanemist negatiivsetel väärtustel.'
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

  // Create Multiple Choice & Application exercises
  flashcards.forEach((fc, idx) => {
    if (exercises.length >= 10) return;

    const isApplication = idx % 2 === 1;
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
        : `Alternatiivne väide #${wrongOptions.length + 1}, mis ei vasta allikale (${fc.sourceRef.label}).`;
      wrongOptions.push(fallback);
    }

    // Deterministic rotation of options so correct answer isn't always index 0
    const rawOptions = [correctAnswer, ...wrongOptions.slice(0, 3)];
    const shift = idx % 4;
    const rotatedOptions = rawOptions.map((_, i) => rawOptions[(i - shift + 4) % 4]);
    const correctIndex = shift;

    const questionText = isApplication
      ? isEN
        ? `Application Problem (${fc.sourceRef.label}): Apply the material to determine the right conclusion or formula for: ${fc.question}`
        : `Rakendusülesanne (${fc.sourceRef.label}): Rakenda õpitud materjali ja leia õige seos või järeldus küsimusele: ${fc.question}`
      : fc.question;

    const explanationText = isEN
      ? `Based on ${fc.sourceRef.label}, the accurate statement/formula is: "${correctAnswer}".`
      : `Vastavalt materjalile (${fc.sourceRef.label}) on õige seisukoht või valem: „${correctAnswer}“.`;

    const hintText = isEN
      ? `Review the section on ${fc.sourceRef.label} carefully.`
      : `Vaata meeldetuletuseks materjali kohta viitel ${fc.sourceRef.label}.`;

    exercises.push({
      id: `ex-${idx + 1}`,
      type: isApplication ? 'application' : 'multiple_choice',
      question: questionText,
      hint: hintText,
      options: rotatedOptions,
      correctIndex,
      explanation: explanationText,
      sourceRef: fc.sourceRef
    });
  });

  return {
    topics,
    flashcards,
    exercises
  };
}
