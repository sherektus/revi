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
  Globe
} from 'lucide-react';
import { calculateMaterialStats } from '../utils/storage';

export default function MaterialStudyView({
  t,
  material,
  matProgress,
  onUpdateProgress,
  onResetProgress,
  onBackToLibrary,
  onOpenSourceViewer,
  onSwitchPairedSample
}) {
  const [showHint, setShowHint] = useState(false);

  const activeTab = matProgress?.activeTab || 'summary';
  const selectedTopicId = matProgress?.selectedTopicId || 'all';
  const fcState = matProgress?.flashcards || {
    currentIndex: 0,
    isFlipped: false,
    statusById: {},
    activeDeckIds: (material.flashcards || []).map((c) => c.id),
    isReviewOnlyMode: false,
    isSessionFinished: false
  };
  const exState = matProgress?.exercises || {
    currentIndex: 0,
    answersById: {},
    activeExerciseIds: (material.exercises || []).map((e) => e.id),
    isRetryOnlyMode: false,
    isSessionFinished: false
  };

  const stats = calculateMaterialStats(material, matProgress);

  // Reset hint visibility when exercise changes
  useEffect(() => {
    setShowHint(false);
  }, [exState.currentIndex, activeTab, material.id]);

  // Keyboard support for Flashcard flipping & navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (activeTab !== 'flashcards' || fcState.isSessionFinished) return;
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlipCard();
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

  // --- FLASHCARDS LOGIC ---
  const allFlashcards = material.flashcards || [];
  const activeDeckIds =
    fcState.activeDeckIds && fcState.activeDeckIds.length > 0
      ? fcState.activeDeckIds
      : allFlashcards.map((c) => c.id);

  const activeFlashcards = activeDeckIds
    .map((id) => allFlashcards.find((c) => c.id === id))
    .filter(Boolean);

  const safeCardIndex = Math.min(
    Math.max(0, fcState.currentIndex || 0),
    Math.max(0, activeFlashcards.length - 1)
  );
  const currentCard = activeFlashcards[safeCardIndex];

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
    const nextStatusById = {
      ...fcState.statusById,
      [currentCard.id]: status
    };

    const isLast = safeCardIndex >= activeFlashcards.length - 1;

    onUpdateProgress(material.id, {
      ...matProgress,
      flashcards: {
        ...fcState,
        statusById: nextStatusById,
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
    const reviewIds = allFlashcards
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
        currentIndex: 0,
        isFlipped: false,
        statusById: {},
        activeDeckIds: allFlashcards.map((c) => c.id),
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
        activeDeckIds: allFlashcards.map((c) => c.id),
        currentIndex: 0,
        isFlipped: false,
        isReviewOnlyMode: false,
        isSessionFinished: false
      }
    });
  }

  // --- EXERCISES LOGIC ---
  const allExercises = material.exercises || [];
  const activeExerciseIds =
    exState.activeExerciseIds && exState.activeExerciseIds.length > 0
      ? exState.activeExerciseIds
      : allExercises.map((e) => e.id);

  const activeExercises = activeExerciseIds
    .map((id) => allExercises.find((e) => e.id === id))
    .filter(Boolean);

  const safeExerciseIndex = Math.min(
    Math.max(0, exState.currentIndex || 0),
    Math.max(0, activeExercises.length - 1)
  );
  const currentExercise = activeExercises[safeExerciseIndex];
  const currentAnswer = currentExercise
    ? exState.answersById[currentExercise.id]
    : null;

  function handleSelectExerciseOption(optionIdx) {
    if (!currentExercise) return;
    // Immediately check & reveal answer + explanation upon selecting an option
    const isCorrect = optionIdx === currentExercise.correctIndex;
    const nextAnswersById = {
      ...exState.answersById,
      [currentExercise.id]: {
        selectedIndex: optionIdx,
        isCorrect,
        checked: true
      }
    };

    onUpdateProgress(material.id, {
      ...matProgress,
      exercises: {
        ...exState,
        answersById: nextAnswersById
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
    const wrongIds = allExercises
      .filter((e) => {
        const ans = exState.answersById[e.id];
        return ans && ans.checked && !ans.isCorrect;
      })
      .map((e) => e.id);

    if (wrongIds.length === 0) return;

    // Clear previous answers for those wrong exercises so the user can answer them fresh
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
        currentIndex: 0,
        answersById: {},
        activeExerciseIds: allExercises.map((e) => e.id),
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
        activeExerciseIds: allExercises.map((e) => e.id),
        currentIndex: 0,
        isRetryOnlyMode: false,
        isSessionFinished: false
      }
    });
  }

  // Filtered topics in Summary view
  const displayedTopics =
    selectedTopicId === 'all'
      ? material.topics || []
      : (material.topics || []).filter((tp) => tp.id === selectedTopicId);

  // Flashcards session summary numbers
  const deckKnewCount = activeFlashcards.filter(
    (c) => fcState.statusById[c.id] === 'knew'
  ).length;
  const deckReviewCount = allFlashcards.filter(
    (c) => fcState.statusById[c.id] === 'review'
  ).length;

  // Exercises session summary numbers
  const sessionCorrectCount = activeExercises.filter(
    (e) => exState.answersById[e.id]?.isCorrect
  ).length;
  const allWrongCount = allExercises.filter(
    (e) => exState.answersById[e.id]?.checked && !exState.answersById[e.id]?.isCorrect
  ).length;
  const sessionAccuracy =
    activeExercises.length > 0
      ? Math.round((sessionCorrectCount / activeExercises.length) * 100)
      : 0;

  return (
    <div className="material-study-view container">
      {/* Top Bar & Material Info */}
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

      {/* Material Header Card */}
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
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs: 1. Kordamispunktid, 2. Mälukaardid, 3. Harjutused */}
      <div className="study-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'summary'}
          className={`study-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setTab('summary')}
        >
          <BookOpen size={18} />
          <span>{t.material.tabs.summary}</span>
          <span className="tab-count-pill">{(material.topics || []).length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'flashcards'}
          className={`study-tab-btn ${activeTab === 'flashcards' ? 'active' : ''}`}
          onClick={() => setTab('flashcards')}
        >
          <Layers size={18} />
          <span>{t.material.tabs.flashcards}</span>
          <span className="tab-count-pill">
            {stats.answeredCards}/{stats.totalCards}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'exercises'}
          className={`study-tab-btn ${activeTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setTab('exercises')}
        >
          <CheckSquare size={18} />
          <span>{t.material.tabs.exercises}</span>
          <span className="tab-count-pill">
            {stats.answeredExercises}/{stats.totalExercises}
          </span>
        </button>
      </div>

      {/* TAB 1: KORDAMISPUNKTID (STUDY POINTS) */}
      {activeTab === 'summary' && (
        <div className="summary-tab-content">
          {/* Topic Selector Pills */}
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
                {idx + 1}. {tp.title}
              </button>
            ))}
          </div>

          <div className="topics-list">
            {displayedTopics.map((tp, idx) => (
              <section key={tp.id} className="topic-card">
                <div className="topic-card-header">
                  <div className="topic-heading-group">
                    <span className="topic-index-badge">{idx + 1}</span>
                    <h2 className="topic-title">{tp.title}</h2>
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

                <p className="topic-summary-lead">{tp.summary}</p>

                {tp.bulletPoints && tp.bulletPoints.length > 0 && (
                  <div className="topic-SubSection">
                    <h3 className="subsection-title">
                      {t.material.summary.keyPoints}
                    </h3>
                    <ul className="topic-bullets">
                      {tp.bulletPoints.map((bp, bIdx) => (
                        <li key={bIdx}>{bp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="topic-two-col">
                  {/* Key Concepts */}
                  {tp.concepts && tp.concepts.length > 0 && (
                    <div className="concepts-panel">
                      <h3 className="subsection-title">
                        <BookOpen size={15} />
                        <span>{t.material.summary.keyConcepts}</span>
                      </h3>
                      <div className="concepts-list">
                        {tp.concepts.map((c, cIdx) => (
                          <div key={cIdx} className="concept-item">
                            <dt className="concept-term">{c.term}</dt>
                            <dd className="concept-def">{c.definition}</dd>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formulas & Relations */}
                  {tp.formulas && tp.formulas.length > 0 && (
                    <div className="formulas-panel">
                      <h3 className="subsection-title">
                        <Calculator size={15} />
                        <span>{t.material.summary.formulas}</span>
                      </h3>
                      <div className="formulas-list">
                        {tp.formulas.map((f, fIdx) => (
                          <div key={fIdx} className="formula-card">
                            <span className="formula-label">{f.label}</span>
                            <code className="formula-code">{f.expression}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MÄLUKAARDID (FLASHCARDS) */}
      {activeTab === 'flashcards' && (
        <div className="flashcards-tab-content">
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
              {/* Session Progress Bar: e.g. 4/8 */}
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

                {fcState.statusById[currentCard.id] && (
                  <span
                    className={`badge ${
                      fcState.statusById[currentCard.id] === 'knew'
                        ? 'badge-success'
                        : 'badge-warning'
                    }`}
                  >
                    {fcState.statusById[currentCard.id] === 'knew'
                      ? t.material.flashcards.statusKnew
                      : t.material.flashcards.statusReview}
                  </span>
                )}
              </div>

              {/* 3D Flip Flashcard */}
              <div className="flashcard-perspective">
                <div
                  className={`flashcard-3d ${fcState.isFlipped ? 'is-flipped' : ''}`}
                  onClick={handleFlipCard}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFlipCard();
                  }}
                  aria-label={t.material.flashcards.flipBtn}
                >
                  {/* Front: Question */}
                  <div className="flashcard-face flashcard-front">
                    <div className="flashcard-face-top">
                      <span className="face-tag">
                        {t.material.flashcards.questionSide}
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
                      <p className="flashcard-main-text">{currentCard.question}</p>
                    </div>

                    <div className="flashcard-face-bottom">
                      <span className="flip-hint-text">
                        <RefreshCw size={14} />
                        <span>{t.material.flashcards.flipHint}</span>
                      </span>
                    </div>
                  </div>

                  {/* Back: Answer */}
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
                      <p className="flashcard-answer-text">{currentCard.answer}</p>
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

              {/* Flashcard Action Controls */}
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
                  </button>

                  <button
                    type="button"
                    className="btn btn-knew"
                    onClick={() => handleMarkCard('knew')}
                  >
                    <Check size={18} />
                    <span>{t.material.flashcards.knewItBtn}</span>
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
            </div>
          ) : (
            /* Flashcard Session Complete Summary */
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

      {/* TAB 3: HARJUTUSED (EXERCISES) */}
      {activeTab === 'exercises' && (
        <div className="exercises-tab-content">
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
              {/* Exercise Progress Bar: e.g. 4/8 */}
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
                          ((safeExerciseIndex + 1) / activeExercises.length) * 100
                        )}%`
                      }}
                    />
                  </div>
                </div>

                <span
                  className={`badge ${
                    currentExercise.type === 'application'
                      ? 'badge-violet'
                      : 'badge-neutral'
                  }`}
                >
                  {currentExercise.type === 'application'
                    ? t.material.exercises.typeApplication
                    : t.material.exercises.typeMultipleChoice}
                </span>
              </div>

              {/* Exercise Card */}
              <div className="exercise-card">
                <div className="exercise-card-top">
                  <span className="exercise-prompt-caption">
                    {currentExercise.type === 'application'
                      ? t.material.exercises.applicationPrompt
                      : t.material.exercises.selectOptionPrompt}
                  </span>

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

                {currentExercise.hint && (
                  <div className="exercise-hint-area">
                    {!showHint ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowHint(true)}
                      >
                        <HelpCircle size={15} />
                        <span>{t.material.exercises.showHintBtn}</span>
                      </button>
                    ) : (
                      <div className="hint-callout">
                        <HelpCircle size={16} />
                        <span>{currentExercise.hint}</span>
                      </div>
                    )}
                  </div>
                )}

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
                        {isAnswered && isCorrectOption && (
                          <CheckCircle2 size={19} className="option-status-icon" />
                        )}
                        {isAnswered && isSelected && !isCorrectOption && (
                          <XCircle size={19} className="option-status-icon" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation & Correct Answer Feedback Box */}
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
            </div>
          ) : (
            /* Exercise Session Complete Summary */
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
    </div>
  );
}
