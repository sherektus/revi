import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileText,
  RotateCcw,
  BookOpen,
  Layers,
  CheckSquare,
  Check,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Award,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Calculator,
  Globe,
  Maximize2,
  Minimize2,
  Keyboard,
  Sliders,
  Zap,
  Edit3,
  EyeOff,
  Eye,
  Plus,
  Sparkles,
  Sigma,
  ListOrdered,
  Clock,
  Image as ImageIcon,
  Search,
  ZoomIn,
  X,
  Lightbulb,
  AlertTriangle,
  MessageSquare,
  BookmarkPlus
} from 'lucide-react';
import MathFormula from './MathFormula';
import {
  calculateMaterialStats,
  getTopicMasteryBreakdown,
  recordMistake
} from '../utils/storage';
import { DEFAULT_ENABLED_FEATURES } from '../data/sampleMaterial';
import {
  generateSimilarExercise,
  cleanPunctuationAndNoise,
  isGenuineFormulaExpression,
  enrichFormulaMetadata
} from '../utils/contentGenerator';
import FormulasView from './FormulasView';

export default function MaterialStudyView({
  t,
  material,
  matProgress,
  onUpdateProgress,
  onUpdateMaterial,
  onRecordSpacedRep,
  onResetProgress,
  onBackToLibrary,
  onOpenSourceViewer,
  onSwitchPairedSample,
  onOpenErrorNotebook,
  onOpenExplainModal
}) {
  const [showHint, setShowHint] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [unlockedHintTier, setUnlockedHintTier] = useState(0); // 0 = none, 1 = guiding question, 2 = method/formula, 3 = full solution
  const [selectionContext, setSelectionContext] = useState(null); // { text, top, left, topicTitle, pageNumber }
  const [activeContextualQuestion, setActiveContextualQuestion] = useState(null); // { mode, snippet, explanation, sourcePage, notFoundInMaterial }
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showFeatureConfig, setShowFeatureConfig] = useState(false);
  const [showHiddenItems, setShowHiddenItems] = useState(false);

  // Edit / Add Modal state for Flashcards & Exercises
  const [editingItem, setEditingItem] = useState(null); // { mode: 'card' | 'exercise', isNew: boolean, data: {...} }

  // Figures tab search, topic filter & zoom modal state
  const [figureSearch, setFigureSearch] = useState('');
  const [figureTopicFilter, setFigureTopicFilter] = useState('ALL');
  const [zoomedFigure, setZoomedFigure] = useState(null);

  // 5-Minute Quick Test state
  const [qtRunning, setQtRunning] = useState(false);
  const [qtSecondsLeft, setQtSecondsLeft] = useState(5 * 60);
  const [qtIndex, setQtIndex] = useState(0);
  const [qtAnswers, setQtAnswers] = useState({}); // { [qIdx]: selectedOptIdx }
  const [qtFinished, setQtFinished] = useState(false);

  const features = {
    ...DEFAULT_ENABLED_FEATURES,
    ...(material.enabledFeatures || {})
  };

  const activeTab = matProgress?.activeTab || 'summary';
  const selectedTopicId = matProgress?.selectedTopicId || 'all';

  const fcState = matProgress?.flashcards || {
    currentIndex: 0,
    isFlipped: false,
    statusById: {},
    historyById: {},
    activeDeckIds: (material.flashcards || []).filter((c) => !c.hidden).map((c) => c.id),
    isReviewOnlyMode: false,
    isSessionFinished: false
  };

  const exState = matProgress?.exercises || {
    currentIndex: 0,
    answersById: {},
    historyById: {},
    activeExerciseIds: (material.exercises || []).filter((e) => !e.hidden).map((e) => e.id),
    isRetryOnlyMode: false,
    isSessionFinished: false
  };

  const stats = calculateMaterialStats(material, matProgress);
  const topicMasteryList = getTopicMasteryBreakdown(material, matProgress);

  // Determine recommended topic (first needs_review topic, or first untested, or first topic)
  const recommendedTopicEntry =
    topicMasteryList.find((tm) => tm.status === 'needs_review') ||
    topicMasteryList.find((tm) => tm.status === 'untested') ||
    topicMasteryList[0];

  // Reset hint, steps, progressive tiers, and typed input when exercise changes
  useEffect(() => {
    setShowHint(false);
    setShowSteps(false);
    setUnlockedHintTier(0);
    setTypedAnswer('');
  }, [exState.currentIndex, activeTab, material.id]);

  // 5-Minute Quick Test countdown timer
  useEffect(() => {
    if (!qtRunning || qtFinished) return;
    const timer = setInterval(() => {
      setQtSecondsLeft((prev) => {
        if (prev <= 1) {
          setQtRunning(false);
          setQtFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [qtRunning, qtFinished]);

  // Visible Flashcards
  const allFlashcards = material.flashcards || [];
  const visibleFlashcards = showHiddenItems
    ? allFlashcards
    : allFlashcards.filter((c) => !c.hidden);

  const activeDeckIds =
    fcState.isReviewOnlyMode && fcState.activeDeckIds?.length > 0
      ? fcState.activeDeckIds
      : visibleFlashcards.map((c) => c.id);

  const activeFlashcards = activeDeckIds
    .map((id) => visibleFlashcards.find((c) => c.id === id))
    .filter(Boolean);

  const safeCardIndex = Math.min(
    Math.max(0, fcState.currentIndex || 0),
    Math.max(0, activeFlashcards.length - 1)
  );
  const currentCard = activeFlashcards[safeCardIndex];

  // Visible Exercises (filtering out short_answer/calculation if user disabled shortCalc)
  const allExercises = material.exercises || [];
  const visibleExercises = allExercises.filter((e) => {
    if (!showHiddenItems && e.hidden) return false;
    if (!features.shortCalc && (e.type === 'short_answer' || e.type === 'calculation')) {
      return false;
    }
    return true;
  });

  const activeExerciseIds =
    exState.isRetryOnlyMode && exState.activeExerciseIds?.length > 0
      ? exState.activeExerciseIds
      : visibleExercises.map((e) => e.id);

  const activeExercises = activeExerciseIds
    .map((id) => visibleExercises.find((e) => e.id === id))
    .filter(Boolean);

  const safeExerciseIndex = Math.min(
    Math.max(0, exState.currentIndex || 0),
    Math.max(0, activeExercises.length - 1)
  );
  const currentExercise = activeExercises[safeExerciseIndex];
  const currentAnswer = currentExercise
    ? exState.answersById[currentExercise.id]
    : null;

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }

      if (activeTab === 'flashcards' && !fcState.isSessionFinished) {
        if (e.code === 'Space') {
          e.preventDefault();
          handleFlipCard();
        } else if (e.key === '1' || e.key.toLowerCase() === 'r') {
          e.preventDefault();
          handleMarkCard('review');
        } else if (e.key === '2' || e.key.toLowerCase() === 'k') {
          e.preventDefault();
          handleMarkCard('knew');
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          handleNavigateCard(safeCardIndex - 1);
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          handleNavigateCard(safeCardIndex + 1);
        }
      } else if (
        activeTab === 'exercises' &&
        !exState.isSessionFinished &&
        currentExercise
      ) {
        const isAnswered = Boolean(currentAnswer?.checked);
        if (!isAnswered && ['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (idx >= 0 && idx < (currentExercise.options || []).length) {
            e.preventDefault();
            handleSelectExerciseOption(idx);
          }
        } else if (
          isAnswered &&
          (e.code === 'Enter' || e.code === 'ArrowRight')
        ) {
          e.preventDefault();
          handleNextExercise();
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          handleNavigateExercise(safeExerciseIndex - 1);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  function setTab(tabName) {
    onUpdateProgress(material.id, {
      ...matProgress,
      activeTab: tabName
    });
  }

  function setTopicFilter(topicId) {
    onUpdateProgress(material.id, {
      ...matProgress,
      selectedTopicId: topicId
    });
  }

  function handleToggleFeature(fKey) {
    const updatedFeatures = {
      ...features,
      [fKey]: !features[fKey]
    };
    onUpdateMaterial({
      ...material,
      enabledFeatures: updatedFeatures
    });
  }

  // --- FLASHCARDS HANDLERS ---
  function handleFlipCard() {
    onUpdateProgress(material.id, {
      ...matProgress,
      flashcards: {
        ...fcState,
        isFlipped: !fcState.isFlipped
      }
    });
  }

  function handleMarkCard(status) {
    if (!currentCard) return;
    const prevHist = fcState.historyById?.[currentCard.id] || [];
    const nextHistoryById = {
      ...(fcState.historyById || {}),
      [currentCard.id]: [...prevHist, status]
    };
    const nextStatusById = {
      ...fcState.statusById,
      [currentCard.id]: status
    };

    if (onRecordSpacedRep) {
      onRecordSpacedRep(`fc:${material.id}:${currentCard.id}`, status === 'knew');
    }

    const isLast = safeCardIndex >= activeFlashcards.length - 1;

    onUpdateProgress(material.id, {
      ...matProgress,
      flashcards: {
        ...fcState,
        statusById: nextStatusById,
        historyById: nextHistoryById,
        isFlipped: false,
        currentIndex: isLast ? safeCardIndex : safeCardIndex + 1,
        isSessionFinished: isLast
      }
    });
  }

  function handleNavigateCard(nextIndex) {
    if (nextIndex < 0 || nextIndex >= activeFlashcards.length) return;
    onUpdateProgress(material.id, {
      ...matProgress,
      flashcards: {
        ...fcState,
        currentIndex: nextIndex,
        isFlipped: false,
        isSessionFinished: false
      }
    });
  }

  function handleRetryReviewCards() {
    const reviewIds = visibleFlashcards
      .filter((c) => fcState.statusById[c.id] === 'review')
      .map((c) => c.id);

    if (reviewIds.length === 0) return;

    onUpdateProgress(material.id, {
      ...matProgress,
      flashcards: {
        ...fcState,
        activeDeckIds: reviewIds,
        currentIndex: 0,
        isFlipped: false,
        isReviewOnlyMode: true,
        isSessionFinished: false
      }
    });
  }

  function handleRestartAllCards() {
    onUpdateProgress(material.id, {
      ...matProgress,
      flashcards: {
        ...fcState,
        currentIndex: 0,
        isFlipped: false,
        statusById: {},
        activeDeckIds: visibleFlashcards.map((c) => c.id),
        isReviewOnlyMode: false,
        isSessionFinished: false
      }
    });
  }

  function handleExitReviewOnlyMode() {
    onUpdateProgress(material.id, {
      ...matProgress,
      flashcards: {
        ...fcState,
        activeDeckIds: visibleFlashcards.map((c) => c.id),
        currentIndex: 0,
        isFlipped: false,
        isReviewOnlyMode: false,
        isSessionFinished: false
      }
    });
  }

  // --- EXERCISES HANDLERS ---
  function recordExerciseAttempt(exerciseObj, isCorrect, selectedIdx = null, typedText = '') {
    const prevHist = exState.historyById?.[exerciseObj.id] || [];
    const nextHistoryById = {
      ...(exState.historyById || {}),
      [exerciseObj.id]: [...prevHist, isCorrect]
    };

    const nextAnswersById = {
      ...exState.answersById,
      [exerciseObj.id]: {
        selectedIndex: selectedIdx,
        typedText,
        isCorrect,
        checked: true
      }
    };

    if (onRecordSpacedRep) {
      onRecordSpacedRep(`ex:${material.id}:${exerciseObj.id}`, isCorrect);
    }

    // Auto-record to Mistake Journal if incorrect
    if (!isCorrect) {
      recordMistake({
        materialId: material.id,
        materialTitle: material.title,
        subject: material.subject || material.category || '',
        question: exerciseObj.question,
        userAnswer:
          selectedIdx !== null
            ? (exerciseObj.options?.[selectedIdx] || String(selectedIdx))
            : typedText,
        correctAnswer:
          (exerciseObj.options && exerciseObj.correctIndex !== undefined
            ? exerciseObj.options[exerciseObj.correctIndex]
            : '') ||
          exerciseObj.expectedAnswer ||
          (exerciseObj.steps ? exerciseObj.steps[exerciseObj.steps.length - 1] : ''),
        sourceRef: exerciseObj.sourceRef || null,
        isEN: material.contentLang === 'en'
      });
    }

    onUpdateProgress(material.id, {
      ...matProgress,
      exercises: {
        ...exState,
        answersById: nextAnswersById,
        historyById: nextHistoryById
      }
    });
  }

  function handleSelectExerciseOption(optionIdx) {
    if (!currentExercise) return;
    const isCorrect = optionIdx === currentExercise.correctIndex;
    recordExerciseAttempt(currentExercise, isCorrect, optionIdx, '');
  }

  function handleCheckTypedAnswer() {
    if (!currentExercise || !typedAnswer.trim()) return;
    const clean = typedAnswer.trim().toLowerCase();
    const accepted = (
      currentExercise.acceptedAnswers || [currentExercise.expectedAnswer || '']
    )
      .filter(Boolean)
      .map((a) => String(a).trim().toLowerCase());

    const optionMatch = (
      currentExercise.options?.[currentExercise.correctIndex] || ''
    )
      .trim()
      .toLowerCase();

    const isCorrect =
      accepted.includes(clean) ||
      optionMatch === clean ||
      (clean.length >= 3 && optionMatch.includes(clean));

    recordExerciseAttempt(
      currentExercise,
      isCorrect,
      isCorrect ? currentExercise.correctIndex : null,
      typedAnswer.trim()
    );
  }

  function handleTrySimilarProblem() {
    if (!currentExercise) return;
    const newSimilar = generateSimilarExercise(
      currentExercise,
      material.contentLang || 'et'
    );

    // Insert the new similar exercise right after the current exercise
    const currentList = [...(material.exercises || [])];
    const pos = currentList.findIndex((e) => e.id === currentExercise.id);
    currentList.splice(pos + 1, 0, newSimilar);

    onUpdateMaterial({
      ...material,
      exercises: currentList
    });

    const nextActiveIds = [...activeExerciseIds];
    nextActiveIds.splice(safeExerciseIndex + 1, 0, newSimilar.id);

    onUpdateProgress(material.id, {
      ...matProgress,
      exercises: {
        ...exState,
        activeExerciseIds: nextActiveIds,
        currentIndex: safeExerciseIndex + 1
      }
    });
  }

  function handleNextExercise() {
    const isLast = safeExerciseIndex >= activeExercises.length - 1;
    if (isLast) {
      onUpdateProgress(material.id, {
        ...matProgress,
        exercises: {
          ...exState,
          isSessionFinished: true
        }
      });
    } else {
      onUpdateProgress(material.id, {
        ...matProgress,
        exercises: {
          ...exState,
          currentIndex: safeExerciseIndex + 1,
          isSessionFinished: false
        }
      });
    }
  }

  function handleNavigateExercise(nextIndex) {
    if (nextIndex < 0 || nextIndex >= activeExercises.length) return;
    onUpdateProgress(material.id, {
      ...matProgress,
      exercises: {
        ...exState,
        currentIndex: nextIndex,
        isSessionFinished: false
      }
    });
  }

  function handleRetryWrongExercises() {
    const wrongIds = visibleExercises
      .filter((e) => {
        const ans = exState.answersById[e.id];
        return ans && ans.checked && !ans.isCorrect;
      })
      .map((e) => e.id);

    if (wrongIds.length === 0) return;

    const updatedAnswers = { ...exState.answersById };
    wrongIds.forEach((id) => {
      delete updatedAnswers[id];
    });

    onUpdateProgress(material.id, {
      ...matProgress,
      exercises: {
        ...exState,
        answersById: updatedAnswers,
        activeExerciseIds: wrongIds,
        currentIndex: 0,
        isRetryOnlyMode: true,
        isSessionFinished: false
      }
    });
  }

  function handleRestartAllExercises() {
    onUpdateProgress(material.id, {
      ...matProgress,
      exercises: {
        ...exState,
        currentIndex: 0,
        answersById: {},
        activeExerciseIds: visibleExercises.map((e) => e.id),
        isRetryOnlyMode: false,
        isSessionFinished: false
      }
    });
  }

  function handleExitRetryOnlyMode() {
    onUpdateProgress(material.id, {
      ...matProgress,
      exercises: {
        ...exState,
        activeExerciseIds: visibleExercises.map((e) => e.id),
        currentIndex: 0,
        isRetryOnlyMode: false,
        isSessionFinished: false
      }
    });
  }

  // --- 3-TIER PROGRESSIVE HINTS HELPER ---
  function getExerciseHintTiers(exercise, isEN) {
    if (!exercise) return { tier1: '', tier2: '', tier3: '' };

    // Tier 1: Guiding question
    let tier1 = exercise.hintTier1 || exercise.guidingQuestion;
    if (!tier1) {
      const qLower = (exercise.question || '').toLowerCase();
      if (qLower.includes('tuletis') || qLower.includes('derivative') || qLower.includes('f(x)')) {
        tier1 = isEN
          ? 'What function rule applies here (power, product, quotient, or chain rule)?'
          : 'Milline tuletise reegel siin kohaldub (nt astme tuletis, korrutise reegel või liitfunktsioon)?';
      } else if (qLower.includes('puutuja') || qLower.includes('tõus') || qLower.includes('tangent')) {
        tier1 = isEN
          ? 'How is the tangent slope k geometrically related to the derivative value at point x₀?'
          : 'Kuidas on sirge puutuja tõus k seotud funktsiooni tuletise väärtusega konkreetses punktis x₀?';
      } else if (qLower.includes('kiirus') || qLower.includes('s(t)')) {
        tier1 = isEN
          ? 'What mathematical operation converts a displacement formula s(t) into instantaneous velocity v(t)?'
          : 'Millise matemaatilise tehte abil saab asukoha/teepikkuse funktsioonist s(t) hetkkiiruse v(t)?';
      } else {
        tier1 = exercise.hint || (isEN
          ? 'What fundamental definition or property directly guides solving this problem?'
          : 'Milline konspektis toodud põhidefinitsioon või seos sellele ülesandele vastab?');
      }
    }

    // Tier 2: Method or formula
    let tier2 = exercise.hintTier2 || exercise.formulaHint;
    if (!tier2) {
      const qLower = (exercise.question || '').toLowerCase();
      if (qLower.includes('3x⁴') || qLower.includes('astme') || qLower.includes('power')) {
        tier2 = isEN
          ? 'Power rule formula: (xⁿ)\' = n·xⁿ⁻¹, and (c·f(x))\' = c·f\'(x).'
          : 'Kasuta astme tuletise valemit: (xⁿ)\' = n·xⁿ⁻¹ ning kordaja reeglit (c·f(x))\' = c·f\'(x).';
      } else if (qLower.includes('puutuja') || qLower.includes('tangent')) {
        tier2 = isEN
          ? 'Tangent slope formula: k = f\'(x₀). Point-slope line formula: y - y₀ = k(x - x₀).'
          : 'Puutuja tõusu valem: k = f\'(x₀). Puutuja võrrand punktis: y - y₀ = k(x - x₀).';
      } else if (qLower.includes('kiirus') || qLower.includes('s(t)')) {
        tier2 = isEN
          ? 'Instantaneous velocity formula: v(t) = s\'(t).'
          : 'Hetkkiiruse valem: v(t) = s\'(t).';
      } else {
        tier2 = exercise.hint || (isEN
          ? 'Identify known variables, substitute into the core topic formula, and simplify.'
          : 'Määra ülesandes antud suurused ja asenda need antud teema põhivalemisse.');
      }
    }

    // Tier 3: Complete solution walkthrough
    let tier3 =
      exercise.hintTier3 ||
      (exercise.steps && exercise.steps.length > 0
        ? exercise.steps.join('  ➔  ')
        : exercise.explanation || exercise.expectedAnswer);

    if (!tier3 && exercise.options && exercise.correctIndex !== undefined) {
      tier3 =
        (isEN ? 'Correct answer: ' : 'Õige lõppvastus: ') +
        exercise.options[exercise.correctIndex];
    }

    return { tier1, tier2, tier3 };
  }

  // --- CONTEXTUAL SELECTION & STUDY QUESTIONS ---
  function handleContainerMouseUp(e) {
    if (e.target?.closest && e.target.closest('.contextual-selection-pill')) return;
    if (e.target?.closest && e.target.closest('.contextual-modal-card')) return;

    const sel =
      typeof window !== 'undefined' && window.getSelection
        ? window.getSelection()
        : null;
    if (!sel || sel.isCollapsed || !sel.rangeCount || sel.rangeCount === 0) {
      return;
    }

    const text = sel.toString().trim();
    if (text.length >= 3 && text.length <= 350) {
      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionContext({
          text,
          top: Math.max(10, rect.bottom + window.scrollY + 6),
          left: Math.max(16, Math.min(window.innerWidth - 300, rect.left + window.scrollX - 10))
        });
      } catch {
        // ignore
      }
    }
  }

  function handleAskContextual(mode) {
    if (!selectionContext?.text) return;
    const text = selectionContext.text.trim();
    const isEN = material.contentLang === 'en';

    const matTopics = material.topics || [];
    const matchedTopic = matTopics.find((tp) => {
      const allText = `${tp.title} ${tp.summary} ${(tp.bulletPoints || []).join(' ')}`.toLowerCase();
      return allText.includes(text.toLowerCase().slice(0, 20));
    }) || matTopics[0];

    const pageNumber = matchedTopic?.sourceRef?.number || 1;
    let notFound = false;
    let explanation = '';

    if (mode === 'simplify') {
      explanation = isEN
        ? `Simplified explanation: "${text}" means that a function value shifts consistently in response to an input change. Rather than calculating average change over long intervals, this captures the exact instantaneous rate right at this moment.`
        : `Lihtsustatud selgitus: „${text}“ kirjeldab, kuidas funktsiooni väärtus reageerib argumendi väikesele muutumisele. Pika ajavahemiku keskmise asemel fikseerib see täpse hetkelise muutumise rütmi just antud punktis.`;
    } else if (mode === 'example') {
      explanation = isEN
        ? `Concrete Example: For f(x) = 2x² + 3x at x = 2, applying the rate gives f'(x) = 4x + 3. Evaluating at x = 2 gives f'(2) = 11. If x steps forward by 0.1, the output jumps approximately 1.1.`
        : `Arvutuslik ja eluline näide: Vaatleme funktsiooni f(x) = 2x² + 3x kohal x = 2. Muutumiskiiruse leidmiseks võtame tuletise f'(x) = 4x + 3. Kohal x = 2 on see 4(2) + 3 = 11. Kui argument suureneb 0,1 võrra, suureneb funktsiooni väärtus umbes 1,1 võrra.`;
    } else if (mode === 'why') {
      explanation = isEN
        ? `Why this holds: Because taking the ratio Δy/Δx over an interval that approaches zero (lim Δx → 0) eliminates the secant error and isolates the exact slope of the tangent line touching that single point.`
        : `Miks see nii on? Sest kui võtta funktsiooni muudu ja argumendi muudu suhe ning lasta argumendi muudul läheneda nullile (lim Δx → 0), kaob lõikaja viga ja järele jääb täpselt graafikut riivava puutuja tõus.`;
    }

    if (text.length > 80 && !matchedTopic) {
      notFound = true;
    }

    setActiveContextualQuestion({
      mode,
      snippet: text,
      explanation,
      sourcePage: pageNumber,
      sourceTopic: matchedTopic?.title || material.title,
      notFoundInMaterial: notFound
    });
    setSelectionContext(null);
  }

  // --- CRUD FOR FLASHCARDS & EXERCISES (Muuda, Peida, Loo uuesti) ---
  function handleToggleHideCard(cardId) {
    const updatedCards = (material.flashcards || []).map((c) =>
      c.id === cardId ? { ...c, hidden: !c.hidden } : c
    );
    onUpdateMaterial({ ...material, flashcards: updatedCards });
  }

  function handleRegenerateCard(card) {
    const topic =
      (material.topics || []).find((tp) => tp.id === card.topicId) ||
      material.topics?.[0];
    const isEN = material.contentLang === 'en';
    const altConcept =
      topic?.concepts?.[Math.floor(Math.random() * (topic.concepts?.length || 1))];

    const updatedCards = (material.flashcards || []).map((c) => {
      if (c.id !== card.id) return c;
      if (altConcept && altConcept.definition !== card.answer) {
        return {
          ...c,
          question: isEN
            ? `Explain the concept "${altConcept.term}" in ${topic.title}:`
            : `Selgita mõistet „${altConcept.term}“ teemas „${topic.title}“:`,
          answer: altConcept.definition
        };
      }
      return {
        ...c,
        question: isEN
          ? `${c.question.replace(/\s*\(Refreshed\)$/, '')} (Refreshed)`
          : `${c.question.replace(/\s*\(Uuendatud\)$/, '')} (Uuendatud)`
      };
    });
    onUpdateMaterial({ ...material, flashcards: updatedCards });
  }

  function handleToggleHideExercise(exId) {
    const updatedEx = (material.exercises || []).map((e) =>
      e.id === exId ? { ...e, hidden: !e.hidden } : e
    );
    onUpdateMaterial({ ...material, exercises: updatedEx });
  }

  function handleRegenerateExercise(ex) {
    const regenerated = generateSimilarExercise(ex, material.contentLang || 'et');
    const updatedEx = (material.exercises || []).map((e) =>
      e.id === ex.id ? { ...regenerated, id: ex.id } : e
    );
    onUpdateMaterial({ ...material, exercises: updatedEx });

    // Clear old answer so user can solve the regenerated question
    const nextAnswers = { ...exState.answersById };
    delete nextAnswers[ex.id];
    onUpdateProgress(material.id, {
      ...matProgress,
      exercises: {
        ...exState,
        answersById: nextAnswers
      }
    });
  }

  function handleSaveEditedItem(e) {
    e.preventDefault();
    if (!editingItem) return;

    if (editingItem.mode === 'card') {
      const cardData = editingItem.data;
      const updatedCards = editingItem.isNew
        ? [...(material.flashcards || []), cardData]
        : (material.flashcards || []).map((c) =>
            c.id === cardData.id ? { ...cardData, isUserEdited: true } : c
          );
      onUpdateMaterial({ ...material, flashcards: updatedCards });
    } else {
      const exData = editingItem.data;
      const updatedEx = editingItem.isNew
        ? [...(material.exercises || []), exData]
        : (material.exercises || []).map((ex) =>
            ex.id === exData.id ? { ...exData, isUserEdited: true } : ex
          );
      onUpdateMaterial({ ...material, exercises: updatedEx });
    }

    setEditingItem(null);
  }

  // --- 5-MINUTE QUICK TEST LOGIC ---
  // Pick 1 diagnostic question per topic (up to 5 questions)
  const quickTestQuestions = (material.topics || []).map((tp, idx) => {
    const matchEx =
      (material.exercises || []).find((e) => e.topicId === tp.id && !e.hidden) ||
      material.exercises?.[idx % Math.max(1, (material.exercises || []).length)];
    return {
      topicId: tp.id,
      topicTitle: tp.title,
      exercise: matchEx
    };
  }).filter((q) => Boolean(q.exercise));

  function startQuickTest() {
    setQtSecondsLeft(5 * 60);
    setQtIndex(0);
    setQtAnswers({});
    setQtFinished(false);
    setQtRunning(true);
  }

  function handleSelectQuickTestAnswer(optIdx) {
    const nextQtAnswers = {
      ...qtAnswers,
      [qtIndex]: optIdx
    };
    setQtAnswers(nextQtAnswers);

    if (qtIndex >= quickTestQuestions.length - 1) {
      finishQuickTest(nextQtAnswers);
    } else {
      setQtIndex((i) => i + 1);
    }
  }

  function finishQuickTest(finalAnswers) {
    setQtRunning(false);
    setQtFinished(true);

    const topicResults = { ...(matProgress?.quickTest?.topicResults || {}) };
    let correctCount = 0;
    let firstWeakTopicId = null;

    quickTestQuestions.forEach((item, idx) => {
      const chosen = finalAnswers[idx];
      const isRight = chosen === item.exercise.correctIndex;
      if (isRight) {
        correctCount++;
        const prev = topicResults[item.topicId];
        topicResults[item.topicId] =
          prev === 'needs_review' ? 'mastered_later' : 'mastered';
      } else {
        topicResults[item.topicId] = 'needs_review';
        if (!firstWeakTopicId) {
          firstWeakTopicId = item.topicId;
        }
      }
    });

    onUpdateProgress(material.id, {
      ...matProgress,
      quickTest: {
        hasCompleted: true,
        lastScore: Math.round(
          (correctCount / Math.max(1, quickTestQuestions.length)) * 100
        ),
        recommendedTopicId:
          firstWeakTopicId || quickTestQuestions[0]?.topicId || null,
        topicResults
      }
    });
  }

  const displayedTopics =
    selectedTopicId === 'all'
      ? material.topics || []
      : (material.topics || []).filter((tp) => tp.id === selectedTopicId);

  const deckKnewCount = activeFlashcards.filter(
    (c) => fcState.statusById[c.id] === 'knew'
  ).length;
  const deckReviewCount = visibleFlashcards.filter(
    (c) => fcState.statusById[c.id] === 'review'
  ).length;

  const sessionCorrectCount = activeExercises.filter(
    (e) => exState.answersById[e.id]?.isCorrect
  ).length;
  const allWrongCount = visibleExercises.filter(
    (e) =>
      exState.answersById[e.id]?.checked && !exState.answersById[e.id]?.isCorrect
  ).length;
  const sessionAccuracy =
    activeExercises.length > 0
      ? Math.round((sessionCorrectCount / activeExercises.length) * 100)
      : 0;

  const qtMins = String(Math.floor(qtSecondsLeft / 60)).padStart(2, '0');
  const qtSecs = String(qtSecondsLeft % 60).padStart(2, '0');

  return (
    <div
      className={`material-study-view container ${
        isFocusMode ? 'cozy-focus-mode' : ''
      }`}
      onMouseUp={handleContainerMouseUp}
    >
      {/* Top Bar & Material Actions */}
      <div className="study-topbar">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onBackToLibrary}
        >
          <ArrowLeft size={16} />
          <span>{t.material.backToLibrary}</span>
        </button>

        <div className="study-topbar-actions">
          {onOpenExplainModal && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                onOpenExplainModal(
                  material.topics?.[0]?.title || null,
                  material.subject
                )
              }
              title="Selgita oma sõnadega (Feynmani meetod)"
            >
              <Sparkles size={14} className="accent-text" />
              <span>
                {material.contentLang === 'en'
                  ? 'Explain in own words'
                  : 'Selgita oma sõnadega'}
              </span>
            </button>
          )}

          {onOpenErrorNotebook && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenErrorNotebook}
              title="Vigade märkmik ja harjutused"
            >
              <BookmarkPlus size={14} className="accent-text" />
              <span>
                {material.contentLang === 'en'
                  ? 'Mistake Journal'
                  : 'Vigade märkmik'}
              </span>
            </button>
          )}

          <button
            type="button"
            className={`btn btn-sm ${
              showFeatureConfig ? 'btn-primary' : 'btn-secondary'
            }`}
            onClick={() => setShowFeatureConfig((s) => !s)}
          >
            <Sliders size={15} />
            <span>{t.featuresConfig.toggleBtn}</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${
              isFocusMode ? 'btn-primary' : 'btn-secondary'
            }`}
            onClick={() => setIsFocusMode((f) => !f)}
          >
            {isFocusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span>
              {isFocusMode
                ? t.material.exitFocusModeBtn
                : t.material.focusModeBtn}
            </span>
          </button>

          {material.isSample && material.pairedSampleId && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onSwitchPairedSample(material.pairedSampleId)}
            >
              <Globe size={15} />
              <span>
                {material.contentLang === 'et'
                  ? 'Try English version (EN)'
                  : 'Proovi eestikeelset versiooni (ET)'}
              </span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onOpenSourceViewer(material, 1)}
          >
            <FileText size={15} />
            <span>{t.material.openOriginalFile}</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onResetProgress(material.id)}
            title={t.material.resetProgress}
          >
            <RotateCcw size={15} />
            <span>{t.material.resetProgress}</span>
          </button>
        </div>
      </div>

      {/* Per-Material Feature Toggles Drawer */}
      {showFeatureConfig && (
        <div className="feature-config-drawer mb-2">
          <div className="feature-config-header">
            <strong>{t.featuresConfig.title}</strong>
            <span>{t.featuresConfig.subtitle}</span>
          </div>
          <div className="feature-checkbox-grid mt-2">
            {[
              'summary',
              'figures',
              'quickTest',
              'flashcards',
              'exercises',
              'shortCalc',
              'formulaSheet',
              'spacedRepetition',
              'mockExam'
            ].map((fKey) => (
              <label
                key={fKey}
                className={`feature-toggle-chip ${
                  features[fKey] ? 'active' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(features[fKey])}
                  onChange={() => handleToggleFeature(fKey)}
                />
                <span>{t.featuresConfig[fKey]}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Material Header & Topic Mastery Overview */}
      {!isFocusMode && (
        <div className="study-header-card">
          <div className="study-header-left">
            <div className="material-badges">
              <span className="badge badge-violet">{material.subject}</span>
              <span className="badge badge-neutral">
                {material.fileType} • {t.material.contentLanguageTag}:{' '}
                {(material.contentLang || 'et').toUpperCase()}
              </span>
            </div>
            <h1 className="study-material-title">{material.title}</h1>

            {/* Topic Mastery Breakdown Pills */}
            <div className="topic-mastery-strip mt-2">
              {topicMasteryList.map((tm) => {
                const statusBadgeClass =
                  tm.status === 'mastered'
                    ? 'badge-success'
                    : tm.status === 'mastered_later'
                    ? 'badge-violet'
                    : tm.status === 'needs_review'
                    ? 'badge-warning'
                    : 'badge-neutral';

                const statusText =
                  tm.status === 'mastered'
                    ? t.material.topicMastery.mastered
                    : tm.status === 'mastered_later'
                    ? t.material.topicMastery.masteredLater
                    : tm.status === 'needs_review'
                    ? t.material.topicMastery.needsReview
                    : t.material.topicMastery.untested;

                return (
                  <button
                    key={tm.topic.id}
                    type="button"
                    className={`badge ${statusBadgeClass} mastery-topic-chip`}
                    onClick={() => {
                      setTopicFilter(tm.topic.id);
                      setTab('summary');
                    }}
                    title={`${cleanPunctuationAndNoise(tm.topic.title)} — ${statusText}`}
                  >
                    <span>
                      {tm.index + 1}. {cleanPunctuationAndNoise(tm.topic.title).slice(0, 26)}
                    </span>
                    <strong>• {statusText}</strong>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="study-header-right">
            <div className="overall-progress-box">
              <div className="progress-label-line">
                <span>{t.material.overallProgress}</span>
                <span className="progress-pct">{stats.progressPercent}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${stats.progressPercent}%` }}
                />
              </div>
              {recommendedTopicEntry && (
                <button
                  type="button"
                  className="recommended-topic-link mt-2"
                  onClick={() => {
                    setTopicFilter(recommendedTopicEntry.topic.id);
                    setTab('summary');
                  }}
                >
                  <Zap size={13} />
                  <span>
                    {t.material.topicMastery.recommendedStart}:{' '}
                    <strong>{recommendedTopicEntry.topic.title}</strong>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Study Mode Tabs (respecting per-material enabledFeatures!) */}
      <div className="study-tabs" role="tablist">
        {features.summary && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'summary'}
            className={`study-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setTab('summary')}
          >
            <BookOpen size={17} />
            <span>{t.material.tabs.summary}</span>
            <span className="tab-count-pill">
              {(material.topics || []).length}
            </span>
          </button>
        )}

        {features.figures !== false && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'figures'}
            className={`study-tab-btn ${activeTab === 'figures' ? 'active' : ''}`}
            onClick={() => setTab('figures')}
          >
            <ImageIcon size={17} />
            <span>{t.material.tabs.figures}</span>
            <span className="tab-count-pill">
              {(material.figures || []).length}
            </span>
          </button>
        )}

        {features.quickTest && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'quickTest'}
            className={`study-tab-btn ${
              activeTab === 'quickTest' ? 'active' : ''
            }`}
            onClick={() => setTab('quickTest')}
          >
            <Zap size={17} />
            <span>{t.material.tabs.quickTest}</span>
          </button>
        )}

        {features.flashcards && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'flashcards'}
            className={`study-tab-btn ${
              activeTab === 'flashcards' ? 'active' : ''
            }`}
            onClick={() => setTab('flashcards')}
          >
            <Layers size={17} />
            <span>{t.material.tabs.flashcards}</span>
            <span className="tab-count-pill">
              {stats.answeredCards}/{stats.totalCards}
            </span>
          </button>
        )}

        {features.exercises && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'exercises'}
            className={`study-tab-btn ${
              activeTab === 'exercises' ? 'active' : ''
            }`}
            onClick={() => setTab('exercises')}
          >
            <CheckSquare size={17} />
            <span>{t.material.tabs.exercises}</span>
            <span className="tab-count-pill">
              {stats.answeredExercises}/{stats.totalExercises}
            </span>
          </button>
        )}

        {features.formulaSheet && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'formulas'}
            className={`study-tab-btn ${
              activeTab === 'formulas' ? 'active' : ''
            }`}
            onClick={() => setTab('formulas')}
          >
            <Sigma size={17} />
            <span>{t.material.tabs.formulas}</span>
          </button>
        )}
      </div>

      {/* TAB 1: KORDAMISPUNKTID */}
      {activeTab === 'summary' && (
        <div className="summary-tab-content">
          <div className="topic-pills-bar">
            <button
              type="button"
              className={`topic-pill ${selectedTopicId === 'all' ? 'active' : ''}`}
              onClick={() => setTopicFilter('all')}
            >
              {t.material.summary.allTopics} ({(material.topics || []).length})
            </button>
            {(material.topics || []).map((tp, idx) => (
              <button
                key={tp.id}
                type="button"
                className={`topic-pill ${selectedTopicId === tp.id ? 'active' : ''}`}
                onClick={() => setTopicFilter(tp.id)}
              >
                {idx + 1}. {cleanPunctuationAndNoise(tp.title)}
              </button>
            ))}
          </div>

          <div className="topics-list">
            {displayedTopics.map((tp, idx) => {
              let rawCandidateTitle = cleanPunctuationAndNoise(tp.title);
              if (
                !rawCandidateTitle ||
                /\b(?:capt\.|prof\.|dots\.|lektor|mni\s*\d+|teema\s*\d+)\b/i.test(rawCandidateTitle) ||
                rawCandidateTitle.length > 50 ||
                /\b(?:on|nimetatakse|tähendab|mille)\b/i.test(rawCandidateTitle)
              ) {
                rawCandidateTitle = extractConciseTopicHeading(
                  [tp.title, tp.summary, ...(tp.bulletPoints || [])],
                  idx + 1,
                  material.contentLang === 'en'
                );
              }
              const cleanTitle = cleanPunctuationAndNoise(rawCandidateTitle)
                .replace(/^[•●▪◦‣⁃\-–—*+>·.,;:()\s\d.)]+/u, '')
                .replace(/[,:;]+$/, '')
                .trim();
              const cleanSummary = cleanPunctuationAndNoise(tp.summary);
              const normSummary = cleanSummary.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

              const distinctBullets = (tp.bulletPoints || [])
                .map((bp) => cleanPunctuationAndNoise(bp))
                .filter((bp) => {
                  if (!bp || bp.length < 3) return false;
                  const normBp = bp.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
                  return normBp !== normSummary;
                });

              const validConcepts = (tp.concepts || []).filter((c) => {
                const term = cleanPunctuationAndNoise(c.term || '');
                const def = cleanPunctuationAndNoise(c.definition || '');
                if (!term || !def) return false;
                return term.toLowerCase() !== def.replace(/[.!?]+$/, '').toLowerCase();
              });

              const isPlaceholder = (val) =>
                !val || val === '—' || val === '-' || val === 'undefined' || String(val).trim() === '';

              const validFormulas = (tp.formulas || [])
                .map((f) => {
                  const rawExpr = typeof f === 'string' ? f : f.expression || '';
                  const rawLabel = typeof f === 'object' ? f.label || '' : '';
                  if (!isGenuineFormulaExpression(rawExpr)) return null;
                  if (/&[a-z0-9_]+=|\bwatch\?|\bindex=|\blist=|\bv=[A-Za-z0-9_-]{5,}/i.test(rawExpr)) return null;
                  if (/&[a-z0-9_]+=|\bwatch\?|\bindex=|\blist=/i.test(rawLabel)) return null;
                  const enriched = enrichFormulaMetadata({
                    rawLabel: typeof f === 'object' ? f.label : '',
                    rawExpression: rawExpr,
                    topicHeading: cleanTitle,
                    sentences: distinctBullets,
                    refLabel: tp.sourceRef?.label || '',
                    isEN: material.contentLang === 'en'
                  });
                  return {
                    ...(typeof f === 'object' ? f : {}),
                    label:
                      typeof f === 'object' &&
                      f.label &&
                      !/^(?:valem\s*(?:\/|või)\s*seos|põhiseos|formula\s*\/\s*relation|core\s*relation)/i.test(
                        f.label
                      )
                        ? cleanPunctuationAndNoise(f.label)
                        : enriched.label,
                    expression: enriched.expression,
                    symbols:
                      typeof f === 'object' && !isPlaceholder(f.symbols)
                        ? f.symbols
                        : enriched.symbols,
                    units:
                      typeof f === 'object' && !isPlaceholder(f.units)
                        ? f.units
                        : enriched.units,
                    example:
                      typeof f === 'object' && !isPlaceholder(f.example)
                        ? f.example
                        : enriched.example
                  };
                })
                .filter(Boolean);

              return (
              <section key={tp.id} className="topic-card">
                <div className="topic-card-header">
                  <div className="topic-heading-group">
                    <span className="topic-index-badge">{idx + 1}</span>
                    <h2 className="topic-title">{cleanTitle}</h2>
                  </div>

                  {tp.sourceRef && (
                    <button
                      type="button"
                      className="source-ref-btn"
                      onClick={() =>
                        onOpenSourceViewer(material, tp.sourceRef.number || 1)
                      }
                      title={t.material.summary.jumpToSource}
                    >
                      <FileText size={14} />
                      <span>
                        {t.material.summary.sourceRef}: {tp.sourceRef.label}
                      </span>
                      <ExternalLink size={12} />
                    </button>
                  )}
                </div>

                <p className="topic-summary-lead">{cleanSummary}</p>

                {distinctBullets.length > 0 && (
                  <div className="topic-SubSection">
                    <h3 className="subsection-title">
                      {t.material.summary.keyPoints}
                    </h3>
                    <ul className="topic-bullets">
                      {distinctBullets.map((bp, bIdx) => (
                        <li key={bIdx}>{bp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(validConcepts.length > 0 || validFormulas.length > 0) && (
                  <div className="topic-two-col">
                    {validConcepts.length > 0 && (
                      <div className="concepts-panel">
                        <h3 className="subsection-title">
                          <BookOpen size={15} />
                          <span>{t.material.summary.keyConcepts}</span>
                        </h3>
                        <div className="concepts-list">
                          {validConcepts.map((c, cIdx) => (
                            <div key={cIdx} className="concept-item">
                              <dt className="concept-term">{cleanPunctuationAndNoise(c.term)}</dt>
                              <dd className="concept-def">{cleanPunctuationAndNoise(c.definition)}</dd>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {validFormulas.length > 0 && (
                      <div className="formulas-panel">
                        <h3 className="subsection-title">
                          <Calculator size={15} />
                          <span>{t.material.summary.formulas}</span>
                        </h3>
                        <div className="formulas-list">
                          {validFormulas.map((f, fIdx) => (
                            <div key={fIdx} className="formula-card">
                              <div className="formula-card-top-row">
                                <span className="formula-label">{f.label}</span>
                                {f.units && f.units !== '—' && (
                                  <span className="formula-unit-badge">{f.units}</span>
                                )}
                              </div>
                              <div className="formula-expression-wrap">
                                <MathFormula expression={f.expression} />
                              </div>
                              {f.symbols && f.symbols !== '—' && (
                                <p className="formula-symbols-caption">{f.symbols}</p>
                              )}
                              {f.example && f.example !== '—' && (
                                <p className="formula-example-caption">
                                  <strong>{material.contentLang === 'en' ? 'Example: ' : 'Näide: '}</strong>
                                  {f.example}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Slide Figures belonging to this topic */}
                {features.figures !== false &&
                  (material.figures || []).filter(
                    (fig) =>
                      fig.topicId === tp.id ||
                      (fig.sourceRef &&
                        tp.sourceRef &&
                        fig.sourceRef.number === tp.sourceRef.number)
                  ).length > 0 && (
                    <div className="topic-figures-block mt-3">
                      <div className="topic-figures-header">
                        <h3 className="subsection-title" style={{ marginBottom: 0 }}>
                          <ImageIcon size={15} />
                          <span>{t.material.summary.topicFigures}</span>
                        </h3>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setTab('figures')}
                        >
                          <span>{t.material.figures.indexHeading}</span>
                        </button>
                      </div>

                      <div className="topic-figures-grid mt-2">
                        {(material.figures || [])
                          .filter(
                            (fig) =>
                              fig.topicId === tp.id ||
                              (fig.sourceRef &&
                                tp.sourceRef &&
                                fig.sourceRef.number === tp.sourceRef.number)
                          )
                          .map((fig) => (
                            <figure key={fig.id} className="slide-figure-card">
                              <div
                                className="figure-visual-frame"
                                onClick={() => setZoomedFigure(fig)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') setZoomedFigure(fig);
                                }}
                                title={t.material.figures.enlargeBtn}
                              >
                                {fig.imageUrl ? (
                                  <img
                                    src={fig.imageUrl}
                                    alt={fig.title}
                                    className="figure-visual-img"
                                  />
                                ) : fig.svgMarkup ? (
                                  <div
                                    className="figure-visual-svg"
                                    dangerouslySetInnerHTML={{
                                      __html: fig.svgMarkup
                                    }}
                                  />
                                ) : null}
                                <span className="figure-zoom-pill">
                                  <ZoomIn size={13} />
                                  <span>{t.material.figures.enlargeBtn}</span>
                                </span>
                              </div>

                              <figcaption className="figure-caption-block">
                                <div className="figure-caption-top">
                                  <strong>{fig.title}</strong>
                                  {fig.sourceRef && (
                                    <button
                                      type="button"
                                      className="source-ref-btn"
                                      onClick={() =>
                                        onOpenSourceViewer(
                                          material,
                                          fig.sourceRef.number || 1
                                        )
                                      }
                                    >
                                      <FileText size={12} />
                                      <span>{fig.sourceRef.label}</span>
                                    </button>
                                  )}
                                </div>
                                {fig.description && (
                                  <p className="figure-desc-text">
                                    {fig.description}
                                  </p>
                                )}
                              </figcaption>
                            </figure>
                          ))}
                      </div>
                    </div>
                  )}
              </section>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: JOONISED (SLIDE FIGURES & DIAGRAMS LIST) */}
      {activeTab === 'figures' && (
        <div className="figures-tab-content">
          <div className="topic-card mb-2">
            <div className="topic-card-header">
              <div>
                <h2 className="topic-title">{t.material.figures.title}</h2>
                <p className="page-subtitle mt-2">
                  {t.material.figures.subtitle}
                </p>
              </div>
              <span className="badge badge-violet">
                <ImageIcon size={14} />
                <span>
                  {(material.figures || []).length} {t.home.figuresCount}
                </span>
              </span>
            </div>

            {/* Structured Quick List / Index of All Slide Figures */}
            {(material.figures || []).length > 0 && (
              <div className="figures-index-box mt-3">
                <h3 className="subsection-title">
                  <ListOrdered size={15} />
                  <span>{t.material.figures.indexHeading}</span>
                </h3>
                <ol className="figures-quick-index-list">
                  {(material.figures || []).map((fig, fIdx) => {
                    const topicObj = (material.topics || []).find(
                      (tp) => tp.id === fig.topicId
                    );
                    return (
                      <li key={fig.id} className="figures-quick-index-item">
                        <a
                          href={`#figure-card-${fig.id}`}
                          className="figures-index-link"
                          onClick={(e) => {
                            e.preventDefault();
                            setFigureTopicFilter('ALL');
                            setFigureSearch('');
                            const el = document.getElementById(
                              `figure-card-${fig.id}`
                            );
                            if (el) {
                              el.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                              });
                            }
                          }}
                        >
                          <span className="figure-index-num">
                            {fig.figureNumber || fIdx + 1}
                          </span>
                          <span className="figure-index-title">{fig.title}</span>
                          {topicObj && (
                            <span className="badge badge-neutral">
                              {topicObj.title}
                            </span>
                          )}
                        </a>
                        {fig.sourceRef && (
                          <button
                            type="button"
                            className="source-ref-btn"
                            onClick={() =>
                              onOpenSourceViewer(
                                material,
                                fig.sourceRef.number || 1
                              )
                            }
                          >
                            <FileText size={12} />
                            <span>{fig.sourceRef.label}</span>
                            <ExternalLink size={11} />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>

          {/* Search & Topic Filter for Figures */}
          <div className="library-toolbar mb-2">
            <div className="search-input-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="search"
                className="form-input search-input"
                placeholder={t.material.figures.searchPlaceholder}
                value={figureSearch}
                onChange={(e) => setFigureSearch(e.target.value)}
              />
            </div>

            <div className="filter-select-wrap">
              <select
                className="form-select"
                value={figureTopicFilter}
                onChange={(e) => setFigureTopicFilter(e.target.value)}
              >
                <option value="ALL">
                  {t.material.figures.allTopicsFilter}
                </option>
                {(material.topics || []).map((tp, idx) => (
                  <option key={tp.id} value={tp.id}>
                    {idx + 1}. {tp.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detailed Figures List */}
          {(() => {
            const q = figureSearch.trim().toLowerCase();
            const filteredFigs = (material.figures || []).filter((fig) => {
              const matchesTopic =
                figureTopicFilter === 'ALL' || fig.topicId === figureTopicFilter;
              const matchesQuery =
                !q ||
                (fig.title || '').toLowerCase().includes(q) ||
                (fig.description || '').toLowerCase().includes(q) ||
                (fig.callouts || []).some((c) => c.toLowerCase().includes(q));
              return matchesTopic && matchesQuery;
            });

            if (filteredFigs.length === 0) {
              return (
                <div className="empty-state-card">
                  <ImageIcon size={34} className="empty-icon" />
                  <p>{t.material.figures.emptyFigures}</p>
                </div>
              );
            }

            return (
              <div className="figures-detailed-list">
                {filteredFigs.map((fig, fIdx) => {
                  const topicObj = (material.topics || []).find(
                    (tp) => tp.id === fig.topicId
                  );
                  return (
                    <article
                      key={fig.id}
                      id={`figure-card-${fig.id}`}
                      className="topic-card figure-detail-card"
                    >
                      <div className="topic-card-header">
                        <div className="topic-heading-group">
                          <span className="topic-index-badge">
                            {fig.figureNumber || fIdx + 1}
                          </span>
                          <div>
                            <h3 className="topic-title">{fig.title}</h3>
                            {topicObj && (
                              <span className="badge badge-neutral mt-1">
                                {topicObj.title}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="study-topbar-actions">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setZoomedFigure(fig)}
                          >
                            <ZoomIn size={14} />
                            <span>{t.material.figures.enlargeBtn}</span>
                          </button>

                          {fig.sourceRef && (
                            <button
                              type="button"
                              className="source-ref-btn"
                              onClick={() =>
                                onOpenSourceViewer(
                                  material,
                                  fig.sourceRef.number || 1
                                )
                              }
                            >
                              <FileText size={14} />
                              <span>
                                {t.material.figures.openSlideBtn} (
                                {fig.sourceRef.label})
                              </span>
                              <ExternalLink size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div
                        className="figure-showcase-stage"
                        onClick={() => setZoomedFigure(fig)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setZoomedFigure(fig);
                        }}
                      >
                        {fig.imageUrl ? (
                          <img
                            src={fig.imageUrl}
                            alt={fig.title}
                            className="figure-showcase-img"
                          />
                        ) : fig.svgMarkup ? (
                          <div
                            className="figure-showcase-svg"
                            dangerouslySetInnerHTML={{ __html: fig.svgMarkup }}
                          />
                        ) : null}
                      </div>

                      <div className="topic-two-col mt-3">
                        <div className="concepts-panel">
                          <h4 className="subsection-title">
                            <BookOpen size={15} />
                            <span>{t.material.figures.descriptionLabel}</span>
                          </h4>
                          <p className="figure-desc-text">{fig.description}</p>
                        </div>

                        {fig.callouts && fig.callouts.length > 0 && (
                          <div className="formulas-panel">
                            <h4 className="subsection-title">
                              <ListOrdered size={15} />
                              <span>{t.material.figures.calloutsLabel}</span>
                            </h4>
                            <ul className="topic-bullets">
                              {fig.callouts.map((c, cIdx) => (
                                <li key={cIdx}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 2: 5 MINUTI KIIRTEST (5-MINUTE QUICK TEST) */}
      {activeTab === 'quickTest' && (
        <div className="quick-test-tab-content">
          {!qtRunning && !qtFinished ? (
            <div className="topic-card">
              <div className="topic-card-header">
                <div>
                  <h2 className="topic-title">{t.material.quickTest.title}</h2>
                  <p className="page-subtitle mt-2">
                    {t.material.quickTest.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={startQuickTest}
                >
                  <Zap size={18} />
                  <span>{t.material.quickTest.startBtn}</span>
                </button>
              </div>

              {/* Topic-by-Topic Mastery Overview Table */}
              <div className="mt-3">
                <h3 className="subsection-title">
                  {t.material.topicMastery.title}
                </h3>
                <div className="mastery-cards-grid">
                  {topicMasteryList.map((tm) => {
                    const stBadge =
                      tm.status === 'mastered'
                        ? 'badge-success'
                        : tm.status === 'mastered_later'
                        ? 'badge-violet'
                        : tm.status === 'needs_review'
                        ? 'badge-warning'
                        : 'badge-neutral';

                    const stLabel =
                      tm.status === 'mastered'
                        ? t.material.topicMastery.mastered
                        : tm.status === 'mastered_later'
                        ? t.material.topicMastery.masteredLater
                        : tm.status === 'needs_review'
                        ? t.material.topicMastery.needsReview
                        : t.material.topicMastery.untested;

                    return (
                      <div key={tm.topic.id} className="concepts-panel">
                        <div className="topic-card-header" style={{ marginBottom: '0.4rem' }}>
                          <strong>
                            {tm.index + 1}. {tm.topic.title}
                          </strong>
                          <span className={`badge ${stBadge}`}>{stLabel}</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm mt-2"
                          onClick={() => {
                            setTopicFilter(tm.topic.id);
                            setTab('summary');
                          }}
                        >
                          {t.material.topicMastery.studyThisTopic}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : qtRunning && quickTestQuestions[qtIndex] ? (
            <div className="session-stage">
              <div className="session-progress-header">
                <div className="session-counter-badge">
                  <span>{t.material.quickTest.questionCounter}</span>
                  <strong>
                    {qtIndex + 1} / {quickTestQuestions.length}
                  </strong>
                </div>

                <div className="session-progress-bar-wrap">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.round(
                          ((qtIndex + 1) / quickTestQuestions.length) * 100
                        )}%`
                      }}
                    />
                  </div>
                </div>

                <span className="badge badge-warning">
                  <Clock size={13} />
                  {t.material.quickTest.timeRemaining}: {qtMins}:{qtSecs}
                </span>
              </div>

              <div className="exercise-card">
                <span className="badge badge-violet mb-2">
                  {quickTestQuestions[qtIndex].topicTitle}
                </span>
                <h2 className="exercise-question-title">
                  {quickTestQuestions[qtIndex].exercise.question}
                </h2>
                <div className="exercise-options-list">
                  {(quickTestQuestions[qtIndex].exercise.options || []).map(
                    (opt, oIdx) => (
                      <button
                        key={oIdx}
                        type="button"
                        className="exercise-option-btn"
                        onClick={() => handleSelectQuickTestAnswer(oIdx)}
                      >
                        <span className="option-letter">
                          {['A', 'B', 'C', 'D'][oIdx] || oIdx + 1}
                        </span>
                        <span className="option-text">{opt}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="session-summary-card" style={{ maxWidth: '760px' }}>
              <div className="summary-award-circle">
                <Zap size={36} />
              </div>
              <h2 className="summary-title">
                {t.material.quickTest.resultTitle}
              </h2>

              {recommendedTopicEntry && (
                <div className="recommended-start-callout mt-3 mb-2">
                  <span className="subsection-title">
                    {t.material.quickTest.recommendedBoxTitle}
                  </span>
                  <h3 className="topic-title mt-2">
                    {recommendedTopicEntry.index + 1}.{' '}
                    {recommendedTopicEntry.topic.title}
                  </h3>
                  <p className="page-subtitle mt-2">
                    {recommendedTopicEntry.status === 'needs_review'
                      ? t.material.quickTest.recommendedReasonNeedsReview
                      : t.material.quickTest.recommendedReasonAllGood}
                  </p>
                  <div className="summary-actions mt-3">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        setTopicFilter(recommendedTopicEntry.topic.id);
                        setTab('summary');
                      }}
                    >
                      <BookOpen size={16} />
                      <span>
                        {t.material.quickTest.jumpToRecommendedBtn}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setTab('exercises')}
                    >
                      <CheckSquare size={16} />
                      <span>
                        {t.material.quickTest.practiceRecommendedBtn}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Updated Topic Mastery Breakdown */}
              <div className="mastery-cards-grid mt-3" style={{ textAlign: 'left' }}>
                {topicMasteryList.map((tm) => {
                  const stBadge =
                    tm.status === 'mastered'
                      ? 'badge-success'
                      : tm.status === 'mastered_later'
                      ? 'badge-violet'
                      : tm.status === 'needs_review'
                      ? 'badge-warning'
                      : 'badge-neutral';

                  const stLabel =
                    tm.status === 'mastered'
                      ? t.material.topicMastery.mastered
                      : tm.status === 'mastered_later'
                      ? t.material.topicMastery.masteredLater
                      : tm.status === 'needs_review'
                      ? t.material.topicMastery.needsReview
                      : t.material.topicMastery.untested;

                  return (
                    <div key={tm.topic.id} className="concepts-panel">
                      <div className="topic-card-header" style={{ marginBottom: 0 }}>
                        <strong>
                          {tm.index + 1}. {tm.topic.title}
                        </strong>
                        <span className={`badge ${stBadge}`}>{stLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="summary-actions mt-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={startQuickTest}
                >
                  <RefreshCw size={16} />
                  <span>{t.material.quickTest.retakeBtn}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MÄLUKAARDID (FLASHCARDS WITH EDIT/HIDE/REGENERATE) */}
      {activeTab === 'flashcards' && (
        <div className="flashcards-tab-content">
          <div className="crud-toolbar session-stage mb-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                setEditingItem({
                  mode: 'card',
                  isNew: true,
                  data: {
                    id: `fc-custom-${Date.now()}`,
                    topicId: material.topics?.[0]?.id || 'topic-1',
                    question: '',
                    answer: '',
                    sourceRef: { type: 'page', number: 1, label: 'Lk 1' }
                  }
                })
              }
            >
              <Plus size={14} />
              <span>{t.material.crud.addNewCardBtn}</span>
            </button>

            <label className="feature-toggle-chip">
              <input
                type="checkbox"
                checked={showHiddenItems}
                onChange={() => setShowHiddenItems((s) => !s)}
              />
              <span>{t.material.crud.showHiddenToggle}</span>
            </label>
          </div>

          {fcState.isReviewOnlyMode && (
            <div className="mode-info-banner">
              <span>{t.material.flashcards.reviewModeBanner}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleExitReviewOnlyMode}
              >
                {t.material.flashcards.exitReviewMode}
              </button>
            </div>
          )}

          {!fcState.isSessionFinished && currentCard ? (
            <div className="session-stage">
              <div className="session-progress-header">
                <div className="session-counter-badge">
                  <span>{t.material.flashcards.progressCounter}</span>
                  <strong>
                    {safeCardIndex + 1} / {activeFlashcards.length}
                  </strong>
                </div>

                <div className="session-progress-bar-wrap">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.round(
                          ((safeCardIndex + 1) / activeFlashcards.length) * 100
                        )}%`
                      }}
                    />
                  </div>
                </div>

                {/* Card CRUD Actions: Edit, Hide, Regenerate */}
                <div className="item-crud-btns">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      setEditingItem({
                        mode: 'card',
                        isNew: false,
                        data: { ...currentCard }
                      })
                    }
                    title={t.material.crud.editBtn}
                  >
                    <Edit3 size={14} />
                    <span>{t.material.crud.editBtn}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleRegenerateCard(currentCard)}
                    title={t.material.crud.regenerateBtn}
                  >
                    <RefreshCw size={14} />
                    <span>{t.material.crud.regenerateBtn}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleToggleHideCard(currentCard.id)}
                    title={
                      currentCard.hidden
                        ? t.material.crud.unhideBtn
                        : t.material.crud.hideBtn
                    }
                  >
                    {currentCard.hidden ? (
                      <Eye size={14} />
                    ) : (
                      <EyeOff size={14} />
                    )}
                    <span>
                      {currentCard.hidden
                        ? t.material.crud.unhideBtn
                        : t.material.crud.hideBtn}
                    </span>
                  </button>
                </div>
              </div>

              {/* 3D Flip Flashcard */}
              <div className="flashcard-perspective">
                <div
                  className={`flashcard-3d ${
                    fcState.isFlipped ? 'is-flipped' : ''
                  }`}
                  onClick={handleFlipCard}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFlipCard();
                  }}
                  aria-label={t.material.flashcards.flipBtn}
                >
                  <div className="flashcard-face flashcard-front">
                    <div className="flashcard-face-top">
                      <span className="face-tag">
                        {t.material.flashcards.questionSide}
                        {currentCard.hidden &&
                          ` • (${t.material.crud.hiddenBadge})`}
                      </span>
                      {currentCard.sourceRef && (
                        <button
                          type="button"
                          className="source-ref-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSourceViewer(
                              material,
                              currentCard.sourceRef.number || 1
                            );
                          }}
                        >
                          <FileText size={13} />
                          <span>{currentCard.sourceRef.label}</span>
                        </button>
                      )}
                    </div>

                    <div className="flashcard-face-center">
                      <p className="flashcard-main-text">
                        {currentCard.question}
                      </p>
                    </div>

                    <div className="flashcard-face-bottom">
                      <span className="flip-hint-text">
                        <RefreshCw size={14} />
                        <span>{t.material.flashcards.flipHint}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flashcard-face flashcard-back">
                    <div className="flashcard-face-top">
                      <span className="face-tag face-tag-answer">
                        {t.material.flashcards.answerSide}
                      </span>
                      {currentCard.sourceRef && (
                        <button
                          type="button"
                          className="source-ref-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSourceViewer(
                              material,
                              currentCard.sourceRef.number || 1
                            );
                          }}
                        >
                          <FileText size={13} />
                          <span>{currentCard.sourceRef.label}</span>
                        </button>
                      )}
                    </div>

                    <div className="flashcard-face-center">
                      <p className="flashcard-answer-text">
                        {currentCard.answer}
                      </p>
                    </div>

                    <div className="flashcard-face-bottom">
                      <span className="flip-hint-text">
                        <RefreshCw size={14} />
                        <span>{t.material.flashcards.flipHint}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flashcard-controls-bar">
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={safeCardIndex === 0}
                  onClick={() => handleNavigateCard(safeCardIndex - 1)}
                >
                  <ChevronLeft size={18} />
                  <span>{t.material.flashcards.prevBtn}</span>
                </button>

                <div className="flashcard-verdict-buttons">
                  <button
                    type="button"
                    className="btn btn-review"
                    onClick={() => handleMarkCard('review')}
                  >
                    <RotateCcw size={17} />
                    <span>{t.material.flashcards.needReviewBtn}</span>
                    <kbd className="keycap-hint">1</kbd>
                  </button>

                  <button
                    type="button"
                    className="btn btn-knew"
                    onClick={() => handleMarkCard('knew')}
                  >
                    <Check size={18} />
                    <span>{t.material.flashcards.knewItBtn}</span>
                    <kbd className="keycap-hint">2</kbd>
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    if (safeCardIndex >= activeFlashcards.length - 1) {
                      onUpdateProgress(material.id, {
                        ...matProgress,
                        flashcards: {
                          ...fcState,
                          isSessionFinished: true
                        }
                      });
                    } else {
                      handleNavigateCard(safeCardIndex + 1);
                    }
                  }}
                >
                  <span>{t.material.flashcards.nextBtn}</span>
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="shortcuts-caption-row">
                <Keyboard size={14} />
                <span>{t.material.keyboardShortcutsHint}</span>
              </div>
            </div>
          ) : (
            <div className="session-summary-card">
              <div className="summary-award-circle">
                <Award size={36} />
              </div>
              <h2 className="summary-title">
                {t.material.flashcards.sessionCompleteTitle}
              </h2>
              <p className="summary-subtitle">
                {t.material.flashcards.sessionCompleteSub}
              </p>

              <div className="summary-stats-boxes">
                <div className="summary-stat-box stat-success">
                  <span className="stat-big-num">{deckKnewCount}</span>
                  <span className="stat-box-label">
                    {t.material.flashcards.knewCountLabel}
                  </span>
                </div>
                <div className="summary-stat-box stat-warning">
                  <span className="stat-big-num">{deckReviewCount}</span>
                  <span className="stat-box-label">
                    {t.material.flashcards.reviewCountLabel}
                  </span>
                </div>
              </div>

              {deckReviewCount === 0 && (
                <p className="all-mastered-banner">
                  <CheckCircle2 size={18} />
                  <span>{t.material.flashcards.allMasteredMsg}</span>
                </p>
              )}

              <div className="summary-actions">
                {deckReviewCount > 0 && (
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={handleRetryReviewCards}
                  >
                    <RotateCcw size={18} />
                    <span>
                      {t.material.flashcards.retryMarkedBtn} ({deckReviewCount})
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={handleRestartAllCards}
                >
                  <RefreshCw size={17} />
                  <span>{t.material.flashcards.restartAllBtn}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HARJUTUSED (EXERCISES WITH SHORT ANSWER, CALCULATION, STEPS, SIMILAR & CRUD) */}
      {activeTab === 'exercises' && (
        <div className="exercises-tab-content">
          <div className="crud-toolbar session-stage mb-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                setEditingItem({
                  mode: 'exercise',
                  isNew: true,
                  data: {
                    id: `ex-custom-${Date.now()}`,
                    topicId: material.topics?.[0]?.id || 'topic-1',
                    type: 'short_answer',
                    question: '',
                    hint: '',
                    expectedAnswer: '',
                    options: ['', '', '', ''],
                    correctIndex: 0,
                    steps: [''],
                    explanation: '',
                    sourceRef: { type: 'page', number: 1, label: 'Lk 1' }
                  }
                })
              }
            >
              <Plus size={14} />
              <span>{t.material.crud.addNewExerciseBtn}</span>
            </button>

            <label className="feature-toggle-chip">
              <input
                type="checkbox"
                checked={showHiddenItems}
                onChange={() => setShowHiddenItems((s) => !s)}
              />
              <span>{t.material.crud.showHiddenToggle}</span>
            </label>
          </div>

          {exState.isRetryOnlyMode && (
            <div className="mode-info-banner">
              <span>{t.material.exercises.retryModeBanner}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleExitRetryOnlyMode}
              >
                {t.material.exercises.exitRetryMode}
              </button>
            </div>
          )}

          {!exState.isSessionFinished && currentExercise ? (
            <div className="session-stage">
              <div className="session-progress-header">
                <div className="session-counter-badge">
                  <span>{t.material.exercises.progressCounter}</span>
                  <strong>
                    {safeExerciseIndex + 1} / {activeExercises.length}
                  </strong>
                </div>

                <div className="session-progress-bar-wrap">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.round(
                          ((safeExerciseIndex + 1) / activeExercises.length) *
                            100
                        )}%`
                      }}
                    />
                  </div>
                </div>

                <div className="item-crud-btns">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      setEditingItem({
                        mode: 'exercise',
                        isNew: false,
                        data: { ...currentExercise }
                      })
                    }
                    title={t.material.crud.editBtn}
                  >
                    <Edit3 size={14} />
                    <span>{t.material.crud.editBtn}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleRegenerateExercise(currentExercise)}
                    title={t.material.crud.regenerateBtn}
                  >
                    <RefreshCw size={14} />
                    <span>{t.material.crud.regenerateBtn}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleToggleHideExercise(currentExercise.id)}
                  >
                    {currentExercise.hidden ? (
                      <Eye size={14} />
                    ) : (
                      <EyeOff size={14} />
                    )}
                    <span>
                      {currentExercise.hidden
                        ? t.material.crud.unhideBtn
                        : t.material.crud.hideBtn}
                    </span>
                  </button>
                </div>
              </div>

              <div className="exercise-card">
                <div className="exercise-card-top">
                  <div className="material-badges" style={{ marginBottom: 0 }}>
                    <span className="badge badge-violet">
                      {currentExercise.type === 'calculation'
                        ? t.material.exercises.typeCalculation
                        : currentExercise.type === 'short_answer'
                        ? t.material.exercises.typeShortAnswer
                        : currentExercise.type === 'application'
                        ? t.material.exercises.typeApplication
                        : t.material.exercises.typeMultipleChoice}
                    </span>
                    <span className="exercise-prompt-caption">
                      {currentExercise.type === 'calculation' ||
                      currentExercise.type === 'short_answer'
                        ? t.material.exercises.shortCalcPrompt
                        : currentExercise.type === 'application'
                        ? t.material.exercises.applicationPrompt
                        : t.material.exercises.selectOptionPrompt}
                    </span>
                  </div>

                  {currentExercise.sourceRef && (
                    <button
                      type="button"
                      className="source-ref-btn"
                      onClick={() =>
                        onOpenSourceViewer(
                          material,
                          currentExercise.sourceRef.number || 1
                        )
                      }
                    >
                      <FileText size={13} />
                      <span>{currentExercise.sourceRef.label}</span>
                    </button>
                  )}
                </div>

                <h2 className="exercise-question-title">
                  {currentExercise.question}
                </h2>

                {/* Progressive 3-Tier Hints Before Answering */}
                {(() => {
                  const tiers = getExerciseHintTiers(
                    currentExercise,
                    material.contentLang === 'en'
                  );
                  return (
                    <div className="progressive-hints-block mb-3">
                      <div className="progressive-hints-bar">
                        <div className="hints-bar-label">
                          <HelpCircle size={14} className="accent-text" />
                          <span>
                            {material.contentLang === 'en'
                              ? 'Hints before answer (3 tiers):'
                              : 'Vihjed enne vastust (3 astet):'}
                          </span>
                        </div>
                        <div className="tier-pills-row">
                          <button
                            type="button"
                            className={`tier-pill-btn ${
                              unlockedHintTier >= 1 ? 'active' : ''
                            }`}
                            onClick={() =>
                              setUnlockedHintTier((prev) => (prev === 1 ? 0 : 1))
                            }
                            title="Aste 1: Väike suunav küsimus"
                          >
                            <span>1. {material.contentLang === 'en' ? 'Guiding question' : 'Suunav küsimus'}</span>
                          </button>
                          <button
                            type="button"
                            className={`tier-pill-btn ${
                              unlockedHintTier >= 2 ? 'active' : ''
                            }`}
                            onClick={() =>
                              setUnlockedHintTier((prev) => (prev === 2 ? 1 : 2))
                            }
                            title="Aste 2: Sobiv meetod või valem"
                          >
                            <span>2. {material.contentLang === 'en' ? 'Method / Formula' : 'Sobiv valem'}</span>
                          </button>
                          <button
                            type="button"
                            className={`tier-pill-btn ${
                              unlockedHintTier >= 3 ? 'active' : ''
                            }`}
                            onClick={() =>
                              setUnlockedHintTier((prev) => (prev === 3 ? 2 : 3))
                            }
                            title="Aste 3: Täielik lahendus ja sammud"
                          >
                            <span>3. {material.contentLang === 'en' ? 'Full solution' : 'Täielik lahendus'}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          className="btn btn-ghost btn-sm try-similar-btn"
                          onClick={handleTrySimilarProblem}
                          title={t.material.exercises.trySimilarBtn}
                        >
                          <Sparkles size={13} />
                          <span>{t.material.exercises.trySimilarBtn}</span>
                        </button>
                      </div>

                      {unlockedHintTier >= 1 && (
                        <div className="hint-tier-card tier-1-card">
                          <div className="tier-badge-label">
                            <span className="badge badge-neutral">Aste 1</span>
                            <strong>
                              {material.contentLang === 'en'
                                ? 'Guiding question for self-reflection:'
                                : 'Suunav küsimus iseseisvaks mõtlemiseks:'}
                            </strong>
                          </div>
                          <p className="tier-card-text">{tiers.tier1}</p>
                        </div>
                      )}

                      {unlockedHintTier >= 2 && (
                        <div className="hint-tier-card tier-2-card">
                          <div className="tier-badge-label">
                            <span className="badge badge-warning">Aste 2</span>
                            <strong>
                              {material.contentLang === 'en'
                                ? 'Applicable method or formula:'
                                : 'Sobiv meetod või valem:'}
                            </strong>
                          </div>
                          <p className="tier-card-text">{tiers.tier2}</p>
                        </div>
                      )}

                      {unlockedHintTier >= 3 && (
                        <div className="hint-tier-card tier-3-card">
                          <div className="tier-badge-label">
                            <span className="badge badge-success">Aste 3</span>
                            <strong>
                              {material.contentLang === 'en'
                                ? 'Complete solution & steps:'
                                : 'Täielik lahenduskäik ja vastus:'}
                            </strong>
                          </div>
                          <p className="tier-card-text">{tiers.tier3}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Self-Answer Input for Short-Answer & Calculation Problems */}
                {(currentExercise.type === 'short_answer' ||
                  currentExercise.type === 'calculation' ||
                  features.shortCalc) && (
                  <div className="short-answer-input-row mb-2">
                    <input
                      type="text"
                      className="form-input"
                      placeholder={t.material.exercises.yourAnswerPlaceholder}
                      value={
                        currentAnswer?.typedText !== undefined &&
                        currentAnswer?.checked
                          ? currentAnswer.typedText
                          : typedAnswer
                      }
                      disabled={Boolean(currentAnswer?.checked)}
                      onChange={(e) => setTypedAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && typedAnswer.trim()) {
                          e.preventDefault();
                          handleCheckTypedAnswer();
                        }
                      }}
                    />
                    {!currentAnswer?.checked && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={!typedAnswer.trim()}
                        onClick={handleCheckTypedAnswer}
                      >
                        <Check size={15} />
                        <span>{t.material.exercises.checkTypedAnswerBtn}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Answer Options */}
                <div className="exercise-options-list">
                  {(currentExercise.options || []).map((opt, oIdx) => {
                    const isAnswered = Boolean(currentAnswer?.checked);
                    const isSelected = currentAnswer?.selectedIndex === oIdx;
                    const isCorrectOption = oIdx === currentExercise.correctIndex;

                    let optionClass = 'exercise-option-btn';
                    if (isAnswered) {
                      if (isCorrectOption) {
                        optionClass += ' option-correct';
                      } else if (isSelected && !isCorrectOption) {
                        optionClass += ' option-wrong';
                      }
                    } else if (isSelected) {
                      optionClass += ' option-selected';
                    }

                    const optionLetters = ['A', 'B', 'C', 'D'];

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        className={optionClass}
                        onClick={() => handleSelectExerciseOption(oIdx)}
                        disabled={isAnswered}
                      >
                        <span className="option-letter">
                          {optionLetters[oIdx] || oIdx + 1}
                        </span>
                        <span className="option-text">{opt}</span>
                        {!isAnswered && (
                          <kbd className="keycap-hint">{oIdx + 1}</kbd>
                        )}
                        {isAnswered && isCorrectOption && (
                          <span className="option-status-badge badge-status-correct">
                            <CheckCircle2 size={14} />
                            <span>{t.material?.exercises?.correctFeedback || 'Õige'}</span>
                          </span>
                        )}
                        {isAnswered && isSelected && !isCorrectOption && (
                          <span className="option-status-badge badge-status-wrong">
                            <XCircle size={14} />
                            <span>{t.material?.exercises?.incorrectFeedback || 'Vale'}</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {currentAnswer?.checked && (
                  <div
                    className={`exercise-feedback-box ${
                      currentAnswer.isCorrect
                        ? 'feedback-correct'
                        : 'feedback-incorrect'
                    }`}
                  >
                    <div className="feedback-header">
                      <div className="feedback-verdict">
                        {currentAnswer.isCorrect ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <XCircle size={20} />
                        )}
                        <strong>
                          {currentAnswer.isCorrect
                            ? t.material.exercises.correctFeedback
                            : t.material.exercises.incorrectFeedback}
                        </strong>
                      </div>

                      {currentExercise.sourceRef && (
                        <button
                          type="button"
                          className="source-ref-btn"
                          onClick={() =>
                            onOpenSourceViewer(
                              material,
                              currentExercise.sourceRef.number || 1
                            )
                          }
                        >
                          <FileText size={13} />
                          <span>
                            {t.material.exercises.sourceReference}:{' '}
                            {currentExercise.sourceRef.label}
                          </span>
                          <ExternalLink size={12} />
                        </button>
                      )}
                    </div>

                    {!currentAnswer.isCorrect && (
                      <p className="feedback-correct-answer">
                        <strong>{t.material.exercises.correctAnswerLabel}</strong>{' '}
                        {currentExercise.options[currentExercise.correctIndex]}
                      </p>
                    )}

                    <p className="feedback-explanation">
                      <strong>{t.material.exercises.explanationLabel}</strong>{' '}
                      {currentExercise.explanation}
                    </p>

                    <div className="mt-2">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleTrySimilarProblem}
                      >
                        <Sparkles size={14} />
                        <span>{t.material.exercises.trySimilarBtn}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="exercise-footer-nav">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={safeExerciseIndex === 0}
                    onClick={() => handleNavigateExercise(safeExerciseIndex - 1)}
                  >
                    <ChevronLeft size={18} />
                    <span>{t.material.exercises.prevExerciseBtn}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNextExercise}
                  >
                    <span>
                      {safeExerciseIndex >= activeExercises.length - 1
                        ? t.material.exercises.finishSessionBtn
                        : t.material.exercises.nextExerciseBtn}
                    </span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="shortcuts-caption-row">
                <Keyboard size={14} />
                <span>{t.material.exerciseShortcutsHint}</span>
              </div>
            </div>
          ) : (
            <div className="session-summary-card">
              <div className="summary-award-circle">
                <Award size={36} />
              </div>
              <h2 className="summary-title">
                {t.material.exercises.sessionCompleteTitle}
              </h2>
              <p className="summary-subtitle">
                {t.material.exercises.sessionCompleteSub}
              </p>

              <div className="summary-stats-boxes">
                <div className="summary-stat-box stat-success">
                  <span className="stat-big-num">{sessionCorrectCount}</span>
                  <span className="stat-box-label">
                    {t.material.exercises.correctCountLabel}
                  </span>
                </div>
                <div className="summary-stat-box stat-warning">
                  <span className="stat-big-num">{allWrongCount}</span>
                  <span className="stat-box-label">
                    {t.material.exercises.incorrectCountLabel}
                  </span>
                </div>
                <div className="summary-stat-box stat-violet">
                  <span className="stat-big-num">{sessionAccuracy}%</span>
                  <span className="stat-box-label">
                    {t.material.exercises.accuracyLabel}
                  </span>
                </div>
              </div>

              {allWrongCount === 0 && (
                <p className="all-mastered-banner">
                  <CheckCircle2 size={18} />
                  <span>{t.material.exercises.allCorrectMsg}</span>
                </p>
              )}

              <div className="summary-actions">
                {allWrongCount > 0 && (
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={handleRetryWrongExercises}
                  >
                    <RotateCcw size={18} />
                    <span>
                      {t.material.exercises.retryWrongBtn} ({allWrongCount})
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={handleRestartAllExercises}
                >
                  <RefreshCw size={17} />
                  <span>{t.material.exercises.restartAllBtn}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: VALEMILEHT (EMBEDDED FORMULA SHEET FOR THIS MATERIAL) */}
      {activeTab === 'formulas' && (
        <FormulasView
          t={t}
          materials={[material]}
          fixedMaterial={material}
          onOpenSourceViewer={onOpenSourceViewer}
        />
      )}

      {/* EDIT / ADD FLASHCARD OR EXERCISE MODAL */}
      {editingItem && (
        <div className="modal-backdrop" onClick={() => setEditingItem(null)}>
          <div
            className="modal-card upload-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {editingItem.mode === 'card'
                  ? t.material.tabs.flashcards
                  : t.material.tabs.exercises}{' '}
                — {t.material.crud.editBtn}
              </h2>
            </div>

            <form onSubmit={handleSaveEditedItem} className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  {t.material.crud.questionLabel}
                </label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={editingItem.data.question || ''}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      data: { ...prev.data, question: e.target.value }
                    }))
                  }
                  required
                />
              </div>

              {editingItem.mode === 'card' ? (
                <div className="form-group">
                  <label className="form-label">
                    {t.material.crud.answerLabel}
                  </label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={editingItem.data.answer || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        data: { ...prev.data, answer: e.target.value }
                      }))
                    }
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">
                      {t.material.crud.answerLabel} (A / 1)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={
                        editingItem.data.options?.[
                          editingItem.data.correctIndex || 0
                        ] ||
                        editingItem.data.expectedAnswer ||
                        ''
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        const opts = [...(editingItem.data.options || ['', '', '', ''])];
                        opts[editingItem.data.correctIndex || 0] = val;
                        setEditingItem((prev) => ({
                          ...prev,
                          data: {
                            ...prev.data,
                            expectedAnswer: val,
                            options: opts
                          }
                        }));
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {t.material.crud.hintLabel}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingItem.data.hint || ''}
                      onChange={(e) =>
                        setEditingItem((prev) => ({
                          ...prev,
                          data: { ...prev.data, hint: e.target.value }
                        }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {t.material.crud.explanationLabel}
                    </label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={editingItem.data.explanation || ''}
                      onChange={(e) =>
                        setEditingItem((prev) => ({
                          ...prev,
                          data: { ...prev.data, explanation: e.target.value }
                        }))
                      }
                    />
                  </div>
                </>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingItem(null)}
                >
                  {t.material.crud.cancelBtn}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t.material.crud.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zoomed Figure Modal */}
      {zoomedFigure && (
        <div
          className="modal-backdrop"
          onClick={() => setZoomedFigure(null)}
        >
          <div
            className="modal-card figure-zoom-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="modal-icon-badge">
                  <ImageIcon size={18} />
                </span>
                <div>
                  <h2>{zoomedFigure.title}</h2>
                  {zoomedFigure.sourceRef && (
                    <p className="modal-subtitle-caption">
                      {zoomedFigure.sourceRef.label}
                    </p>
                  )}
                </div>
              </div>
              <div className="modal-header-actions">
                {zoomedFigure.sourceRef && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const num = zoomedFigure.sourceRef.number || 1;
                      setZoomedFigure(null);
                      onOpenSourceViewer(material, num);
                    }}
                  >
                    <FileText size={14} />
                    <span>{t.material.figures.openSlideBtn}</span>
                  </button>
                )}
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setZoomedFigure(null)}
                  aria-label={t.material.figures.closeZoomBtn}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div className="figure-zoom-stage">
                {zoomedFigure.imageUrl ? (
                  <img
                    src={zoomedFigure.imageUrl}
                    alt={zoomedFigure.title}
                    className="figure-zoom-img"
                  />
                ) : zoomedFigure.svgMarkup ? (
                  <div
                    className="figure-zoom-svg"
                    dangerouslySetInnerHTML={{ __html: zoomedFigure.svgMarkup }}
                  />
                ) : null}
              </div>

              {zoomedFigure.description && (
                <p className="figure-desc-text mt-3">
                  {zoomedFigure.description}
                </p>
              )}

              {zoomedFigure.callouts && zoomedFigure.callouts.length > 0 && (
                <div className="formulas-panel mt-2">
                  <h4 className="subsection-title">
                    {t.material.figures.calloutsLabel}
                  </h4>
                  <ul className="topic-bullets">
                    {zoomedFigure.callouts.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Contextual Text Selection Floating Toolbar */}
      {selectionContext && (
        <div
          className="contextual-selection-pill"
          style={{
            position: 'absolute',
            top: `${selectionContext.top}px`,
            left: `${selectionContext.left}px`,
            zIndex: 1000
          }}
        >
          <div className="ctx-pill-label">
            <Sparkles size={13} className="accent-text" />
            <span>{material.contentLang === 'en' ? 'Ask Revi:' : 'Küsi Revi käest:'}</span>
          </div>
          <button
            type="button"
            className="ctx-action-btn"
            onClick={() => handleAskContextual('simplify')}
          >
            <Lightbulb size={13} />
            <span>{material.contentLang === 'en' ? 'Explain simply' : 'Selgita lihtsamalt'}</span>
          </button>
          <button
            type="button"
            className="ctx-action-btn"
            onClick={() => handleAskContextual('example')}
          >
            <Sparkles size={13} />
            <span>{material.contentLang === 'en' ? 'Give example' : 'Too näide'}</span>
          </button>
          <button
            type="button"
            className="ctx-action-btn"
            onClick={() => handleAskContextual('why')}
          >
            <HelpCircle size={13} />
            <span>{material.contentLang === 'en' ? 'Why is this so?' : 'Miks see nii on?'}</span>
          </button>
          <button
            type="button"
            className="ctx-close-btn"
            onClick={() => setSelectionContext(null)}
            aria-label="Sulge"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* 5. Contextual Question Split Modal */}
      {activeContextualQuestion && (
        <div
          className="modal-backdrop contextual-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveContextualQuestion(null);
          }}
        >
          <div className="modal-card contextual-modal-card">
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="badge badge-primary">
                  <MessageSquare size={13} />
                  <span>
                    {activeContextualQuestion.mode === 'simplify'
                      ? (material.contentLang === 'en' ? 'Simplified Explanation' : 'Lihtsustatud selgitus')
                      : activeContextualQuestion.mode === 'example'
                      ? (material.contentLang === 'en' ? 'Practical Example' : 'Näide elust ja arvutusest')
                      : (material.contentLang === 'en' ? 'Why is this so?' : 'Miks see nii on?')}
                  </span>
                </div>
                <h2 className="modal-title">
                  {material.contentLang === 'en'
                    ? 'Study Notes Question & Source Context'
                    : 'Konspekti lõigu selgitus ja algallikas'}
                </h2>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon modal-close-btn"
                onClick={() => setActiveContextualQuestion(null)}
                aria-label="Sulge"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body contextual-modal-split-body">
              {/* Left Column: Revi Explanation */}
              <div className="split-col-explanation">
                <div className="selected-snippet-box mb-3">
                  <div className="snippet-label font-bold text-xs uppercase tracking-wider text-muted mb-1">
                    {material.contentLang === 'en' ? 'Marked excerpt in notes:' : 'Konspektis märgitud lõik:'}
                  </div>
                  <blockquote className="selected-snippet-quote">
                    „{activeContextualQuestion.snippet}“
                  </blockquote>
                </div>

                {activeContextualQuestion.notFoundInMaterial && (
                  <div className="callout callout-warning mb-3">
                    <AlertTriangle size={15} />
                    <span>
                      {material.contentLang === 'en'
                        ? 'Note: This specific nuance is not explicitly detailed in the source material, but here is the general principle:'
                        : 'Märkus: Seda detailset vastust materjalis otseselt ei leidu, kuid üldise loogika ja teooria kohaselt:'}
                    </span>
                  </div>
                )}

                <div className="revi-explanation-content">
                  <div className="explanation-title font-bold mb-2 flex items-center gap-1.5 accent-text">
                    <Sparkles size={16} />
                    <span>{material.contentLang === 'en' ? 'Revi’s Answer:' : 'Revi selgitus:'}</span>
                  </div>
                  <p className="explanation-prose">
                    {activeContextualQuestion.explanation}
                  </p>
                </div>
              </div>

              {/* Right Column: Algallika lehekülg / Adjacent source citation */}
              <div className="split-col-source">
                <div className="source-viewer-preview-card">
                  <div className="source-preview-top">
                    <span className="badge badge-neutral">
                      <FileText size={12} />
                      <span>{material.fileType || 'PDF'}</span>
                    </span>
                    <span className="source-page-badge">
                      Lk {activeContextualQuestion.sourcePage}
                    </span>
                  </div>

                  <h4 className="source-topic-title mt-2">
                    {activeContextualQuestion.sourceTopic}
                  </h4>

                  <div className="source-excerpt-sheet mt-2">
                    <div className="mock-slide-page">
                      <div className="mock-slide-header">
                        <span>{material.title}</span>
                        <span>{activeContextualQuestion.sourcePage} / {material.pageCount || 10}</span>
                      </div>
                      <div className="mock-slide-body">
                        <div className="mock-slide-highlight">
                          {activeContextualQuestion.snippet}
                        </div>
                        <div className="mock-slide-faint">
                          {activeContextualQuestion.sourceTopic} — Revi algallika kontekst.
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-full mt-3"
                    onClick={() => {
                      onOpenSourceViewer(
                        material,
                        activeContextualQuestion.sourcePage || 1
                      );
                      setActiveContextualQuestion(null);
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>
                      {material.contentLang === 'en'
                        ? `Open Page ${activeContextualQuestion.sourcePage} in Source Viewer`
                        : `Ava algallikas lk ${activeContextualQuestion.sourcePage}`}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveContextualQuestion(null)}
              >
                {material.contentLang === 'en' ? 'Close' : 'Sulge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
