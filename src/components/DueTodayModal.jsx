import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Check,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  Layers,
  CheckSquare
} from 'lucide-react';

export default function DueTodayModal({
  isOpen,
  t,
  queue,
  onClose,
  onRecordReview
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentItem = queue[currentIndex];

  function advanceNext() {
    setIsFlipped(false);
    setSelectedOption(null);
    setTypedAnswer('');
    setIsChecked(false);
    setIsCorrect(false);
    setCompletedCount((c) => c + 1);

    if (currentIndex >= queue.length - 1) {
      setIsFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleFlashcardVerdict(knewIt) {
    if (!currentItem) return;
    onRecordReview(currentItem, knewIt);
    advanceNext();
  }

  function handleCheckExercise(optIdx = null) {
    if (!currentItem || !currentItem.exercise) return;
    const ex = currentItem.exercise;
    let correct = false;

    if (optIdx !== null) {
      setSelectedOption(optIdx);
      correct = optIdx === ex.correctIndex;
    } else if (typedAnswer.trim()) {
      const clean = typedAnswer.trim().toLowerCase();
      const accepted = (ex.acceptedAnswers || [ex.expectedAnswer || ''])
        .filter(Boolean)
        .map((a) => a.toLowerCase());
      correct =
        accepted.includes(clean) ||
        (ex.options?.[ex.correctIndex] || '').toLowerCase() === clean;
    }

    setIsChecked(true);
    setIsCorrect(correct);
    onRecordReview(currentItem, correct);
  }

  function handleCloseAndReset() {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSelectedOption(null);
    setTypedAnswer('');
    setIsChecked(false);
    setIsFinished(false);
    setCompletedCount(0);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleCloseAndReset}>
      <div
        className="modal-card due-today-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge">
              <RefreshCw size={18} />
            </span>
            <div>
              <h2>{t.dueToday.modalTitle}</h2>
              {!isFinished && currentItem && (
                <p className="modal-subtitle-caption">
                  {currentItem.materialTitle} • {currentIndex + 1} / {queue.length}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={handleCloseAndReset}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {!isFinished && currentItem ? (
            <div className="due-session-body">
              <div className="due-item-meta-row">
                <span className="badge badge-violet">{currentItem.subject}</span>
                <span
                  className={`badge ${
                    currentItem.difficultyTag === 'hard'
                      ? 'badge-warning'
                      : 'badge-neutral'
                  }`}
                >
                  {currentItem.difficultyTag === 'hard'
                    ? t.dueToday.tagHard
                    : currentItem.difficultyTag === 'planned'
                    ? t.dueToday.tagPlanned
                    : t.dueToday.tagDue}
                </span>
                <span className="badge badge-outline">
                  {currentItem.itemType === 'flashcard' ? (
                    <>
                      <Layers size={12} /> {t.material.tabs.flashcards}
                    </>
                  ) : (
                    <>
                      <CheckSquare size={12} /> {t.material.tabs.exercises}
                    </>
                  )}
                </span>
              </div>

              <div className="progress-track mb-2">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.round(((currentIndex + 1) / queue.length) * 100)}%`
                  }}
                />
              </div>

              {currentItem.itemType === 'flashcard' ? (
                <div className="due-flashcard-box">
                  <div
                    className={`flashcard-3d ${isFlipped ? 'is-flipped' : ''}`}
                    style={{ minHeight: '250px' }}
                    onClick={() => setIsFlipped((f) => !f)}
                  >
                    <div className="flashcard-face flashcard-front">
                      <span className="face-tag">
                        {t.material.flashcards.questionSide}
                      </span>
                      <div className="flashcard-face-center">
                        <p className="flashcard-main-text">
                          {currentItem.card.question}
                        </p>
                      </div>
                      <span className="flip-hint-text">
                        {t.material.flashcards.flipHint}
                      </span>
                    </div>

                    <div className="flashcard-face flashcard-back">
                      <span className="face-tag face-tag-answer">
                        {t.material.flashcards.answerSide}
                      </span>
                      <div className="flashcard-face-center">
                        <p className="flashcard-answer-text">
                          {currentItem.card.answer}
                        </p>
                      </div>
                      <span className="flip-hint-text">
                        {t.material.flashcards.flipHint}
                      </span>
                    </div>
                  </div>

                  <div className="flashcard-verdict-buttons mt-3" style={{ justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-review"
                      onClick={() => handleFlashcardVerdict(false)}
                    >
                      <RotateCcw size={16} />
                      <span>{t.material.flashcards.needReviewBtn}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-knew"
                      onClick={() => handleFlashcardVerdict(true)}
                    >
                      <Check size={17} />
                      <span>{t.material.flashcards.knewItBtn}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="due-exercise-box">
                  <h3 className="exercise-question-title">
                    {currentItem.exercise.question}
                  </h3>

                  {(currentItem.exercise.type === 'short_answer' ||
                    currentItem.exercise.type === 'calculation') &&
                    !isChecked && (
                      <div className="short-answer-input-row mb-2">
                        <input
                          type="text"
                          className="form-input"
                          placeholder={t.material.exercises.yourAnswerPlaceholder}
                          value={typedAnswer}
                          onChange={(e) => setTypedAnswer(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && typedAnswer.trim()) {
                              e.preventDefault();
                              handleCheckExercise(null);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={!typedAnswer.trim()}
                          onClick={() => handleCheckExercise(null)}
                        >
                          {t.material.exercises.checkTypedAnswerBtn}
                        </button>
                      </div>
                    )}

                  <div className="exercise-options-list">
                    {(currentItem.exercise.options || []).map((opt, oIdx) => {
                      const isCorrectOption =
                        oIdx === currentItem.exercise.correctIndex;
                      let cls = 'exercise-option-btn';
                      if (isChecked) {
                        if (isCorrectOption) cls += ' option-correct';
                        else if (selectedOption === oIdx) cls += ' option-wrong';
                      }
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          className={cls}
                          disabled={isChecked}
                          onClick={() => handleCheckExercise(oIdx)}
                        >
                          <span className="option-letter">
                            {['A', 'B', 'C', 'D'][oIdx] || oIdx + 1}
                          </span>
                          <span className="option-text">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isChecked && (
                    <div
                      className={`exercise-feedback-box ${
                        isCorrect ? 'feedback-correct' : 'feedback-incorrect'
                      }`}
                    >
                      <div className="feedback-verdict mb-2">
                        {isCorrect ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <XCircle size={18} />
                        )}
                        <strong>
                          {isCorrect
                            ? t.material.exercises.correctFeedback
                            : t.material.exercises.incorrectFeedback}
                        </strong>
                      </div>
                      <p className="feedback-explanation">
                        {currentItem.exercise.explanation}
                      </p>
                      <div className="mt-3" style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={advanceNext}
                        >
                          {t.material.exercises.nextExerciseBtn}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="session-summary-card" style={{ boxShadow: 'none', padding: '1.5rem 1rem' }}>
              <div className="summary-award-circle">
                <Award size={34} />
              </div>
              <h3 className="summary-title">{t.dueToday.completedTitle}</h3>
              <p className="summary-subtitle">{t.dueToday.completedSub}</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCloseAndReset}
              >
                {t.dueToday.closeBtn}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
