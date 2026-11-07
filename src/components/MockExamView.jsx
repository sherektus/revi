import React, { useState } from 'react';
import {
  ClipboardCheck,
  Play,
  CheckCircle2,
  XCircle,
  Award,
  RefreshCw,
  FileText,
  ExternalLink
} from 'lucide-react';
import { DEFAULT_ENABLED_FEATURES } from '../data/sampleMaterial';

export default function MockExamView({
  t,
  materials,
  onOpenSourceViewer
}) {
  // Default select materials that have mockExam enabled
  const eligibleMaterials = materials.filter((m) => {
    const f = { ...DEFAULT_ENABLED_FEATURES, ...(m.enabledFeatures || {}) };
    return f.mockExam !== false;
  });

  const [selectedMaterialIds, setSelectedMaterialIds] = useState(() =>
    eligibleMaterials.map((m) => m.id)
  );
  const [questionLimit, setQuestionLimit] = useState(8);
  const [examQuestions, setExamQuestions] = useState([]);
  const [examState, setExamState] = useState('setup'); // 'setup' | 'in_progress' | 'results'
  const [answersByIndex, setAnswersByIndex] = useState({}); // { [qIdx]: { selectedIndex, typedText } }

  function toggleMaterialSelection(matId) {
    setSelectedMaterialIds((prev) =>
      prev.includes(matId)
        ? prev.filter((id) => id !== matId)
        : [...prev, matId]
    );
  }

  function handleStartExam() {
    const chosenMats = materials.filter((m) =>
      selectedMaterialIds.includes(m.id)
    );
    if (chosenMats.length === 0) return;

    const pool = [];
    for (const mat of chosenMats) {
      for (const ex of mat.exercises || []) {
        if (ex.hidden) continue;
        pool.push({
          ...ex,
          examItemId: `${mat.id}-${ex.id}`,
          materialId: mat.id,
          materialTitle: mat.title,
          subject: mat.subject,
          materialObj: mat
        });
      }
    }

    // Interleave questions from different selected materials
    const selected = pool.slice(0, Math.min(pool.length, Number(questionLimit) || 8));
    setExamQuestions(selected);
    setAnswersByIndex({});
    setExamState('in_progress');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSelectOption(qIdx, optIdx) {
    setAnswersByIndex((prev) => ({
      ...prev,
      [qIdx]: {
        ...(prev[qIdx] || {}),
        selectedIndex: optIdx
      }
    }));
  }

  function handleSubmitExam() {
    setExamState('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Compute results
  const evaluated = examQuestions.map((q, idx) => {
    const userAns = answersByIndex[idx];
    const isCorrect =
      userAns && userAns.selectedIndex === q.correctIndex;
    return {
      ...q,
      userSelectedIndex: userAns?.selectedIndex ?? null,
      isCorrect: Boolean(isCorrect)
    };
  });

  const correctTotal = evaluated.filter((e) => e.isCorrect).length;
  const accuracyPct =
    evaluated.length > 0
      ? Math.round((correctTotal / evaluated.length) * 100)
      : 0;

  // Breakdown by material
  const byMaterialStats = selectedMaterialIds
    .map((mId) => {
      const mat = materials.find((m) => m.id === mId);
      const qs = evaluated.filter((q) => q.materialId === mId);
      if (!mat || qs.length === 0) return null;
      const corr = qs.filter((q) => q.isCorrect).length;
      return {
        materialId: mId,
        title: mat.title,
        subject: mat.subject,
        total: qs.length,
        correct: corr,
        pct: Math.round((corr / qs.length) * 100)
      };
    })
    .filter(Boolean);

  return (
    <div className="mock-exam-view container">
      <div className="library-header">
        <div>
          <h1 className="page-title">{t.mockExam.title}</h1>
          <p className="page-subtitle">{t.mockExam.subtitle}</p>
        </div>
      </div>

      {examState === 'setup' && (
        <div className="topic-card">
          <h2 className="topic-title mb-2">
            {t.mockExam.selectMaterialsLabel}
          </h2>

          <div className="feature-checkbox-grid mb-2">
            {materials.map((mat) => {
              const isSelected = selectedMaterialIds.includes(mat.id);
              const exCount = (mat.exercises || []).filter((e) => !e.hidden).length;
              return (
                <label
                  key={mat.id}
                  className={`feature-toggle-chip ${isSelected ? 'active' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleMaterialSelection(mat.id)}
                  />
                  <span>
                    {mat.title} ({exCount})
                  </span>
                </label>
              );
            })}
          </div>

          <div className="form-group mt-3" style={{ maxWidth: '280px' }}>
            <label className="form-label">{t.mockExam.questionCountLabel}</label>
            <select
              className="form-select"
              value={questionLimit}
              onChange={(e) => setQuestionLimit(Number(e.target.value))}
            >
              <option value={4}>4</option>
              <option value={6}>6</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={20}>{t.mockExam.allQuestionsOption || 'Kõik küsimused'}</option>
            </select>
          </div>

          <div className="mt-3">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={selectedMaterialIds.length === 0}
              onClick={handleStartExam}
            >
              <Play size={18} />
              <span>{t.mockExam.startExamBtn}</span>
            </button>
          </div>
        </div>
      )}

      {examState === 'in_progress' && (
        <div className="mock-exam-questions-stack">
          {examQuestions.map((q, qIdx) => {
            const selectedIdx = answersByIndex[qIdx]?.selectedIndex;
            return (
              <div key={q.examItemId} className="exercise-card mb-2">
                <div className="exercise-card-top">
                  <div className="material-badges" style={{ marginBottom: 0 }}>
                    <span className="badge badge-violet">
                      {qIdx + 1} / {examQuestions.length}
                    </span>
                    <span className="badge badge-neutral">
                      {q.materialTitle}
                    </span>
                  </div>
                </div>

                <h3 className="exercise-question-title">{q.question}</h3>

                <div className="exercise-options-list">
                  {(q.options || []).map((opt, oIdx) => {
                    const isChosen = selectedIdx === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        className={`exercise-option-btn ${
                          isChosen ? 'option-selected' : ''
                        }`}
                        onClick={() => handleSelectOption(qIdx, oIdx)}
                      >
                        <span className="option-letter">
                          {['A', 'B', 'C', 'D'][oIdx] || oIdx + 1}
                        </span>
                        <span className="option-text">{opt}</span>
                        {isChosen && (
                          <span className="option-status-badge badge-status-selected">
                            <span>Valitud</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="topic-card" style={{ textAlign: 'center' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleSubmitExam}
            >
              <ClipboardCheck size={19} />
              <span>{t.mockExam.submitExamBtn}</span>
            </button>
          </div>
        </div>
      )}

      {examState === 'results' && (
        <div className="mock-exam-results-wrap">
          <div className="session-summary-card mb-2" style={{ maxWidth: '100%' }}>
            <div className="summary-award-circle">
              <Award size={36} />
            </div>
            <h2 className="summary-title">{t.mockExam.resultsTitle}</h2>

            <div className="summary-stats-boxes mt-3">
              <div className="summary-stat-box stat-success">
                <span className="stat-big-num">
                  {correctTotal} / {evaluated.length}
                </span>
                <span className="stat-box-label">{t.mockExam.scoreLabel}</span>
              </div>
              <div className="summary-stat-box stat-violet">
                <span className="stat-big-num">{accuracyPct}%</span>
                <span className="stat-box-label">
                  {t.material.exercises.accuracyLabel}
                </span>
              </div>
            </div>

            {/* Breakdown by material */}
            <div className="mt-3" style={{ textAlign: 'left' }}>
              <h3 className="subsection-title">{t.mockExam.byMaterialHeader}</h3>
              <div className="topics-list">
                {byMaterialStats.map((bm) => (
                  <div key={bm.materialId} className="concepts-panel">
                    <div className="progress-label-line">
                      <strong>{bm.title}</strong>
                      <span>
                        {bm.correct}/{bm.total} ({bm.pct}%)
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${bm.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="summary-actions mt-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setExamState('setup')}
              >
                <RefreshCw size={16} />
                <span>{t.mockExam.newMockExamBtn}</span>
              </button>
            </div>
          </div>

          <h3 className="section-title mb-2">
            {t.mockExam.reviewQuestionsHeader}
          </h3>

          <div className="topics-list">
            {evaluated.map((item, idx) => (
              <div key={item.examItemId} className="topic-card">
                <div className="topic-card-header">
                  <div className="material-badges" style={{ marginBottom: 0 }}>
                    <span
                      className={`badge ${
                        item.isCorrect ? 'badge-success' : 'badge-danger'
                      }`}
                    >
                      {item.isCorrect ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <XCircle size={13} />
                      )}
                      <span>
                        {idx + 1}.{' '}
                        {item.isCorrect
                          ? t.material.exercises.correctFeedback
                          : t.material.exercises.incorrectFeedback}
                      </span>
                    </span>
                    <span className="badge badge-neutral">
                      {item.materialTitle}
                    </span>
                  </div>

                  {item.sourceRef && (
                    <button
                      type="button"
                      className="source-ref-btn"
                      onClick={() =>
                        onOpenSourceViewer(
                          item.materialObj,
                          item.sourceRef.number || 1
                        )
                      }
                    >
                      <FileText size={13} />
                      <span>{item.sourceRef.label}</span>
                      <ExternalLink size={12} />
                    </button>
                  )}
                </div>

                <h4 className="exercise-question-title">{item.question}</h4>

                <p className="feedback-correct-answer">
                  <strong>{t.mockExam.yourAnswer}</strong>{' '}
                  {item.userSelectedIndex !== null
                    ? item.options[item.userSelectedIndex]
                    : t.mockExam.notAnswered}
                </p>

                {!item.isCorrect && (
                  <p className="feedback-correct-answer">
                    <strong>{t.material.exercises.correctAnswerLabel}</strong>{' '}
                    {item.options[item.correctIndex]}
                  </p>
                )}

                <p className="feedback-explanation mt-2">
                  <strong>{t.material.exercises.explanationLabel}</strong>{' '}
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
