import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  Play,
  RotateCcw,
  BookOpen,
  Layers,
  CheckSquare,
  HelpCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  Flame,
  ArrowRight
} from 'lucide-react';
import MathFormula from './MathFormula';
import { recordMistake } from '../utils/storage';

export const QUICK_TIME_OPTIONS = [
  { minutes: 5, labelET: '5 minutit', labelEN: '5 minutes', tagET: 'Kiirkordamine', tagEN: 'Quick Recall', planET: '2 kordamisküsimust • 1 põhimõte • 1 harjutus' },
  { minutes: 15, labelET: '15 minutit', labelEN: '15 minutes', tagET: 'Fookussessioon (Soovitatav)', tagEN: 'Focus Session (Recommended)', planET: '2 kordamisküsimust • 1 selgitus • 3 harjutust' },
  { minutes: 30, labelET: '30 minutit', labelEN: '30 minutes', tagET: 'Süvaõppe tsükkel', tagEN: 'Deep Study Cycle', planET: '4 kordamisküsimust • 2 selgitust • 5 harjutust' },
  { minutes: 60, labelET: '60 minutit', labelEN: '60 minutes', tagET: 'Täielik materjali läbitöötamine', tagEN: 'Comprehensive Review', planET: '8 küsimust • 3 selgitust • 8 harjutust' }
];

export default function QuickStudyModal({
  isOpen,
  onClose,
  materials = [],
  t,
  uiLang = 'et',
  onOpenMaterial
}) {
  const isEN = uiLang === 'en';
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [selectedMaterialId, setSelectedMaterialId] = useState('ALL');
  const [sessionState, setSessionState] = useState('config'); // 'config' | 'running' | 'completed'

  // Running session state
  const [sessionSteps, setSessionSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Active step interactive states
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [exerciseSelectedOption, setExerciseSelectedOption] = useState(null);
  const [hintTier, setHintTier] = useState(0); // 0 = none, 1 = guiding question, 2 = method/formula, 3 = full steps
  const [sessionStats, setSessionStats] = useState({
    cardsLearned: 0,
    exercisesCorrect: 0,
    exercisesMistakes: 0
  });

  // Countdown timer
  useEffect(() => {
    if (sessionState !== 'running' || !isTimerRunning) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSessionState('completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionState, isTimerRunning]);

  // Reset interactive sub-states on step change
  useEffect(() => {
    setIsCardFlipped(false);
    setExerciseSelectedOption(null);
    setHintTier(0);
  }, [currentStepIdx]);

  function handleStartSession() {
    // Collect candidate materials
    const eligibleMats =
      selectedMaterialId === 'ALL'
        ? materials
        : materials.filter((m) => m.id === selectedMaterialId);

    if (eligibleMats.length === 0) return;

    // Collect all flashcards, topics, and exercises across eligible materials
    const poolCards = [];
    const poolTopics = [];
    const poolExercises = [];

    eligibleMats.forEach((m) => {
      (m.flashcards || []).forEach((c) => poolCards.push({ ...c, materialTitle: m.title, materialId: m.id, subject: m.subject }));
      (m.topics || []).forEach((t) => poolTopics.push({ ...t, materialTitle: m.title, materialId: m.id, subject: m.subject }));
      (m.exercises || []).forEach((e) => poolExercises.push({ ...e, materialTitle: m.title, materialId: m.id, subject: m.subject }));
    });

    // Shuffle helper
    const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());
    const shuffledCards = shuffle(poolCards);
    const shuffledTopics = shuffle(poolTopics);
    const shuffledExercises = shuffle(poolExercises);

    // Build steps based on chosen duration
    let numCards = 2;
    let numTopics = 1;
    let numExercises = 3;

    if (selectedMinutes === 5) {
      numCards = 2;
      numTopics = 1;
      numExercises = 1;
    } else if (selectedMinutes === 15) {
      numCards = 2;
      numTopics = 1;
      numExercises = 3;
    } else if (selectedMinutes === 30) {
      numCards = 4;
      numTopics = 2;
      numExercises = 5;
    } else if (selectedMinutes === 60) {
      numCards = 8;
      numTopics = 3;
      numExercises = 8;
    }

    const steps = [];

    // Add cards
    shuffledCards.slice(0, numCards).forEach((fc) => {
      steps.push({
        type: 'card',
        data: fc,
        title: isEN ? 'Active Recall Question' : 'Kordamisküsimus',
        materialTitle: fc.materialTitle
      });
    });

    // Add topic explanations
    shuffledTopics.slice(0, numTopics).forEach((tp) => {
      steps.push({
        type: 'explanation',
        data: tp,
        title: isEN ? 'Key Concept & Principle' : 'Põhimõiste ja selgitus',
        materialTitle: tp.materialTitle
      });
    });

    // Add exercises
    shuffledExercises.slice(0, numExercises).forEach((ex) => {
      steps.push({
        type: 'exercise',
        data: ex,
        title: isEN ? 'Practice Exercise' : 'Harjutusülesanne',
        materialTitle: ex.materialTitle
      });
    });

    // Final interleave: shuffle so learning is varied
    const interleaved = shuffle(steps);
    setSessionSteps(interleaved);
    setCurrentStepIdx(0);
    setSecondsRemaining(selectedMinutes * 60);
    setIsTimerRunning(true);
    setSessionStats({ cardsLearned: 0, exercisesCorrect: 0, exercisesMistakes: 0 });
    setSessionState('running');
  }

  function handleAnswerExercise(optionIndex) {
    if (exerciseSelectedOption !== null) return;
    setExerciseSelectedOption(optionIndex);

    const step = sessionSteps[currentStepIdx];
    const isCorrect = optionIndex === step.data.correctIndex;

    if (isCorrect) {
      setSessionStats((prev) => ({ ...prev, exercisesCorrect: prev.exercisesCorrect + 1 }));
    } else {
      setSessionStats((prev) => ({ ...prev, exercisesMistakes: prev.exercisesMistakes + 1 }));
      // Automatically record in Vigade märkmik!
      recordMistake({
        materialId: step.data.materialId || '',
        materialTitle: step.data.materialTitle || '',
        subject: step.data.subject || '',
        question: step.data.question || '',
        userAnswer: step.data.options?.[optionIndex] || `Valik ${optionIndex + 1}`,
        correctAnswer: step.data.options?.[step.data.correctIndex] || step.data.expectedAnswer || 'Õige vastus',
        sourceRef: step.data.sourceRef || null,
        isEN
      });
    }
  }

  function handleNextStep() {
    if (currentStepIdx < sessionSteps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      setSessionState('completed');
    }
  }

  if (!isOpen) return null;

  const currentStep = sessionSteps[currentStepIdx];
  const minutesLeft = Math.floor(secondsRemaining / 60);
  const secondsLeft = String(secondsRemaining % 60).padStart(2, '0');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card quick-study-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge">
              <Clock size={20} />
            </span>
            <div>
              <h2>{isEN ? 'Quick Study: "I have X minutes"' : 'Kiirõpe: „Mul on 15 minutit“'}</h2>
              <p className="modal-subtitle-caption">
                {isEN
                  ? 'Tell Revi how much time you have — get a curated micro-study session.'
                  : 'Vali vaba aeg – Revi koostab selleks ajaks täpse, vaheldusrikka õppekorra.'}
              </p>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Sulge">
            <X size={20} />
          </button>
        </div>

        {/* 1. CONFIGURATION VIEW */}
        {sessionState === 'config' && (
          <div className="modal-body quick-study-config">
            <div className="quick-time-grid">
              {QUICK_TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.minutes}
                  type="button"
                  className={`quick-time-card ${selectedMinutes === opt.minutes ? 'active' : ''}`}
                  onClick={() => setSelectedMinutes(opt.minutes)}
                >
                  <div className="time-card-top">
                    <span className="time-minutes-number">{opt.minutes}</span>
                    <span className="time-minutes-unit">min</span>
                  </div>
                  <strong className="time-card-title">{isEN ? opt.labelEN : opt.labelET}</strong>
                  <span className="time-tag-badge">{isEN ? opt.tagEN : opt.tagET}</span>
                  <p className="time-plan-desc">{opt.planET}</p>
                </button>
              ))}
            </div>

            <div className="form-group mt-3">
              <label className="form-label">
                <BookOpen size={15} />
                <span>{isEN ? 'Focus Subject / Material:' : 'Õppeaine või materjal:'}</span>
              </label>
              <select
                className="form-select"
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
              >
                <option value="ALL">{isEN ? 'All Library Materials (Smart Mixed Mix)' : 'Kõik teegi materjalid (segatud kordamine)'}</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.subject ? `[${m.subject}] ` : ''}{m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-footer mt-4">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                {isEN ? 'Cancel' : 'Loobu'}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleStartSession}
                disabled={materials.length === 0}
              >
                <Play size={17} />
                <span>{isEN ? `Start ${selectedMinutes} min Session` : `Alusta ${selectedMinutes} min õppesessiooni`}</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. RUNNING SESSION VIEW */}
        {sessionState === 'running' && currentStep && (
          <div className="modal-body quick-study-running">
            {/* Session HUD bar */}
            <div className="session-hud-bar">
              <div className="hud-step-indicator">
                <span className="hud-step-pill">
                  {isEN ? `Step ${currentStepIdx + 1} of ${sessionSteps.length}` : `Samm ${currentStepIdx + 1} / ${sessionSteps.length}`}
                </span>
                <span className="hud-material-tag" title={currentStep.materialTitle}>
                  {currentStep.materialTitle}
                </span>
              </div>

              <div className="hud-clock-box">
                <Clock size={16} />
                <span className="hud-clock-digits">{minutesLeft}:{secondsLeft}</span>
              </div>
            </div>

            <div className="hud-progress-track">
              <div
                className="progress-fill"
                style={{ width: `${((currentStepIdx + 1) / sessionSteps.length) * 100}%` }}
              />
            </div>

            {/* STEP TYPE: FLASHCARD */}
            {currentStep.type === 'card' && (
              <div className="quick-step-content card-step">
                <div className="step-type-header">
                  <Layers size={16} />
                  <span>{currentStep.title}</span>
                </div>

                <div
                  className={`flashcard-interactive-card ${isCardFlipped ? 'flipped' : ''}`}
                  onClick={() => setIsCardFlipped((prev) => !prev)}
                >
                  {!isCardFlipped ? (
                    <div className="quick-card-side question-side">
                      <span className="card-hint-badge">{isEN ? 'Question' : 'Küsimus'}</span>
                      <p className="quick-card-text">{currentStep.data.question}</p>
                      <span className="quick-flip-hint">
                        <RotateCcw size={14} />
                        <span>{isEN ? 'Click to flip and reveal answer' : 'Klõpsa vastuse nägemiseks'}</span>
                      </span>
                    </div>
                  ) : (
                    <div className="quick-card-side answer-side">
                      <span className="card-hint-badge badge-green">{isEN ? 'Answer' : 'Õige vastus'}</span>
                      <p className="quick-card-text">{currentStep.data.answer}</p>
                      <span className="quick-flip-hint">
                        <CheckCircle2 size={14} />
                        <span>{isEN ? 'Understood! Proceed to next step' : 'Selge! Liigu järgmise sammu juurde'}</span>
                      </span>
                    </div>
                  )}
                </div>

                {isCardFlipped && (
                  <div className="quick-card-verdict-row">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSessionStats((p) => ({ ...p, cardsLearned: p.cardsLearned + 1 }));
                        handleNextStep();
                      }}
                    >
                      <span>{isEN ? 'Need review later' : 'Vajab veel kordamist'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setSessionStats((p) => ({ ...p, cardsLearned: p.cardsLearned + 1 }));
                        handleNextStep();
                      }}
                    >
                      <CheckCircle2 size={15} />
                      <span>{isEN ? 'I knew this!' : 'Teadsin seda!'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP TYPE: TOPIC EXPLANATION */}
            {currentStep.type === 'explanation' && (
              <div className="quick-step-content explanation-step">
                <div className="step-type-header">
                  <BookOpen size={16} />
                  <span>{currentStep.title}</span>
                </div>

                <div className="explanation-display-box">
                  <h3 className="explanation-title">{currentStep.data.title}</h3>
                  {currentStep.data.summary && (
                    <p className="explanation-summary">{currentStep.data.summary}</p>
                  )}

                  {currentStep.data.bulletPoints?.length > 0 && (
                    <ul className="explanation-bullet-list">
                      {currentStep.data.bulletPoints.map((bp, bIdx) => (
                        <li key={bIdx}>{bp}</li>
                      ))}
                    </ul>
                  )}

                  {currentStep.data.formulas?.[0] && (
                    <div className="explanation-formula-wrap mt-2">
                      <MathFormula expression={currentStep.data.formulas[0].expression || currentStep.data.formulas[0]} />
                    </div>
                  )}
                </div>

                <div className="step-actions-footer">
                  <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                    <span>{isEN ? 'Continue to next step' : 'Loetud ja mõistetud – edasi'}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP TYPE: EXERCISE WITH 3-TIER HINTS */}
            {currentStep.type === 'exercise' && (
              <div className="quick-step-content exercise-step">
                <div className="step-type-header">
                  <CheckSquare size={16} />
                  <span>{currentStep.title}</span>
                </div>

                <div className="exercise-question-box">
                  <h3 className="exercise-question-text">{currentStep.data.question}</h3>

                  {/* 3-Tier Progressive Hints */}
                  <div className="progressive-hints-block">
                    <div className="hints-stepper-buttons">
                      <button
                        type="button"
                        className={`hint-tier-btn ${hintTier >= 1 ? 'active' : ''}`}
                        onClick={() => setHintTier((prev) => (prev === 1 ? 0 : 1))}
                      >
                        <HelpCircle size={13} />
                        <span>{isEN ? 'Hint 1: Guiding Question' : 'Vihje 1: Suunav küsimus'}</span>
                      </button>

                      <button
                        type="button"
                        className={`hint-tier-btn ${hintTier >= 2 ? 'active' : ''}`}
                        onClick={() => setHintTier((prev) => (prev === 2 ? 0 : 2))}
                      >
                        <Sparkles size={13} />
                        <span>{isEN ? 'Hint 2: Method & Formula' : 'Vihje 2: Meetod ja valem'}</span>
                      </button>

                      <button
                        type="button"
                        className={`hint-tier-btn ${hintTier >= 3 ? 'active' : ''}`}
                        onClick={() => setHintTier((prev) => (prev === 3 ? 0 : 3))}
                      >
                        <span>{isEN ? 'Hint 3: Full Solution' : 'Vihje 3: Täislahendus'}</span>
                      </button>
                    </div>

                    {hintTier === 1 && (
                      <div className="hint-tier-card tier-1">
                        <strong>💡 {isEN ? 'Guiding Question:' : 'Suunav küsimus:'}</strong>
                        <p>{currentStep.data.hint || (isEN ? 'What physical or mathematical quantity changes here, and what is its rate of change?' : 'Milline seos või reegel kirjeldab antud funktsiooni muutumist selles punktis?')}</p>
                      </div>
                    )}

                    {hintTier === 2 && (
                      <div className="hint-tier-card tier-2">
                        <strong>📐 {isEN ? 'Applicable Formula / Rule:' : 'Sobiv valem või meetod:'}</strong>
                        <p>{currentStep.data.steps?.[0] || currentStep.data.hint || (isEN ? 'Apply the general power/product rule term-by-term.' : 'Kasuta diferentseerimise põhireegleid või tuletise geomeetrilist seost k = f\'(x₀).')}</p>
                      </div>
                    )}

                    {hintTier === 3 && (
                      <div className="hint-tier-card tier-3">
                        <strong>📝 {isEN ? 'Step-by-step Solution:' : 'Täielik lahenduskäik:'}</strong>
                        {currentStep.data.steps?.length > 0 ? (
                          <ol className="hint-steps-list">
                            {currentStep.data.steps.map((st, sIdx) => (
                              <li key={sIdx}>{st}</li>
                            ))}
                          </ol>
                        ) : (
                          <p>{currentStep.data.expectedAnswer ? `Õige vastus: ${currentStep.data.expectedAnswer}` : 'Vaata õiget vastusevarianti valikute seast.'}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Options */}
                  <div className="exercise-options-grid">
                    {currentStep.data.options?.map((opt, oIdx) => {
                      const isSelected = exerciseSelectedOption === oIdx;
                      const isCorrect = oIdx === currentStep.data.correctIndex;
                      let btnCls = 'quick-option-btn';
                      if (exerciseSelectedOption !== null) {
                        if (isCorrect) btnCls += ' option-correct';
                        else if (isSelected && !isCorrect) btnCls += ' option-wrong';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          className={btnCls}
                          onClick={() => handleAnswerExercise(oIdx)}
                          disabled={exerciseSelectedOption !== null}
                        >
                          <span className="option-num-badge">{oIdx + 1}</span>
                          <span className="option-text">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {exerciseSelectedOption !== null && (
                  <div className="step-actions-footer">
                    <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                      <span>{currentStepIdx < sessionSteps.length - 1 ? (isEN ? 'Next Step' : 'Järgmine samm') : (isEN ? 'Finish Session' : 'Lõpeta sessioon')}</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. COMPLETED SUMMARY VIEW */}
        {sessionState === 'completed' && (
          <div className="modal-body quick-study-completed">
            <div className="completion-badge-circle">
              <Award size={42} />
            </div>
            <h2 className="completion-heading">
              {isEN ? 'Session Completed!' : 'Kiirõpe edukalt läbitud!'}
            </h2>
            <p className="completion-sub">
              {isEN
                ? `You dedicated ${selectedMinutes} minutes to focused, high-retention learning.`
                : `Pühendasid ${selectedMinutes} minutit süsteemsele kordamisele.`}
            </p>

            <div className="completion-stats-grid">
              <div className="c-stat-card">
                <span className="c-stat-num">{sessionSteps.length}</span>
                <span className="c-stat-label">
                  {sessionSteps.length === 1
                    ? (isEN ? 'Step' : 'Õppesamm')
                    : (isEN ? 'Total Steps' : 'Õppesammu')}
                </span>
              </div>
              <div className="c-stat-card">
                <span className="c-stat-num accent-text">{sessionStats.exercisesCorrect}</span>
                <span className="c-stat-label">
                  {sessionStats.exercisesCorrect === 1
                    ? (isEN ? 'Correct Exercise' : 'Õige harjutus')
                    : (isEN ? 'Correct Exercises' : 'Õiget harjutust')}
                </span>
              </div>
              <div className="c-stat-card">
                <span className="c-stat-num">{sessionStats.exercisesMistakes}</span>
                <span className="c-stat-label">
                  {sessionStats.exercisesMistakes === 1
                    ? (isEN ? 'Mistake Logged' : 'Viga märgitud')
                    : (isEN ? 'Mistakes Logged' : 'Viga märgitud')}
                </span>
              </div>
            </div>

            <div className="modal-footer justify-center mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSessionState('config')}
              >
                <RotateCcw size={16} />
                <span>{isEN ? 'New Session' : 'Uus kiirõpe'}</span>
              </button>
              <button type="button" className="btn btn-primary" onClick={onClose}>
                <span>{isEN ? 'Back to Revi' : 'Tagasi töölauale'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
