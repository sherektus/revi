import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  X,
  CheckCircle2,
  Trash2,
  Search,
  BookOpen,
  Filter,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Calculator,
  Compass,
  FileText
} from 'lucide-react';
import {
  loadErrorNotebook,
  resolveMistake,
  deleteMistake
} from '../utils/storage';

export default function ErrorNotebookModal({
  isOpen,
  onClose,
  t,
  uiLang = 'et',
  onOpenMaterial
}) {
  const isEN = uiLang === 'en';
  const [errors, setErrors] = useState(() => loadErrorNotebook());
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'formula_selection' | 'calculation' | 'conceptual' | 'condition_missed'
  const [statusFilter, setStatusFilter] = useState('unresolved'); // 'unresolved' | 'resolved' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedSolutions, setRevealedSolutions] = useState({});

  function refreshList() {
    setErrors(loadErrorNotebook());
  }

  function handleToggleResolved(errId, currentStatus) {
    const updated = resolveMistake(errId, !currentStatus);
    setErrors(updated);
  }

  function handleDelete(errId) {
    const updated = deleteMistake(errId);
    setErrors(updated);
  }

  function toggleSolution(errId) {
    setRevealedSolutions((prev) => ({
      ...prev,
      [errId]: !prev[errId]
    }));
  }

  const filteredErrors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (errors || []).filter((err) => {
      if (!err || typeof err !== 'object') return false;
      const matchesType =
        activeFilter === 'ALL' || err.errorType === activeFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'unresolved' && !err.resolved) ||
        (statusFilter === 'resolved' && err.resolved);
      const matchesSearch =
        !q ||
        (err.question || '').toLowerCase().includes(q) ||
        (err.diagnosis || '').toLowerCase().includes(q) ||
        (err.subject || '').toLowerCase().includes(q) ||
        (err.materialTitle || '').toLowerCase().includes(q);

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [errors, activeFilter, statusFilter, searchQuery]);

  const unresolvedCount = useMemo(
    () => (errors || []).filter((e) => e && !e.resolved).length,
    [errors]
  );

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card error-notebook-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge badge-warning-tone">
              <AlertTriangle size={20} />
            </span>
            <div>
              <div className="flex-row items-center gap-2">
                <h2>{isEN ? 'Mistake Journal' : 'Vigade märkmik'}</h2>
                {unresolvedCount > 0 && (
                  <span className="badge badge-warning">
                    {unresolvedCount} {isEN ? 'to review' : 'vajab kinnistamist'}
                  </span>
                )}
              </div>
              <p className="modal-subtitle-caption">
                {isEN
                  ? 'Diagnosed errors, cognitive reasoning, and targeted follow-up practice problems.'
                  : 'Valed vastused koos põhjendusega: miks viga tekkis, kuidas õigesti mõelda ja sarnane ülesanne proovimiseks.'}
              </p>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Sulge">
            <X size={20} />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="error-notebook-toolbar">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="search"
              className="form-input search-input"
              placeholder={isEN ? 'Search mistakes, rules, or questions...' : 'Otsi vigade, reeglite või küsimuste seast...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="error-filters-row">
            {/* Error Type Chips */}
            <div className="filter-chips-group">
              <button
                type="button"
                className={`chip-btn ${activeFilter === 'ALL' ? 'chip-active' : ''}`}
                onClick={() => setActiveFilter('ALL')}
              >
                {isEN ? 'All Types' : 'Kõik vead'} ({errors.length})
              </button>
              <button
                type="button"
                className={`chip-btn ${activeFilter === 'formula_selection' ? 'chip-active' : ''}`}
                onClick={() => setActiveFilter('formula_selection')}
              >
                📐 {isEN ? 'Formula Choice' : 'Valemi valimise viga'}
              </button>
              <button
                type="button"
                className={`chip-btn ${activeFilter === 'calculation' ? 'chip-active' : ''}`}
                onClick={() => setActiveFilter('calculation')}
              >
                🔢 {isEN ? 'Calculation / Sign' : 'Arvutus- või märgierinevus'}
              </button>
              <button
                type="button"
                className={`chip-btn ${activeFilter === 'conceptual' ? 'chip-active' : ''}`}
                onClick={() => setActiveFilter('conceptual')}
              >
                💡 {isEN ? 'Conceptual' : 'Mõiste vääritimõistmine'}
              </button>
            </div>

            {/* Status Switcher */}
            <select
              className="form-select filter-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="unresolved">{isEN ? 'Needs Review (Active)' : 'Vajavad kordamist (aktiivsed)'}</option>
              <option value="resolved">{isEN ? 'Resolved / Mastered' : 'Mõistetud ja lahendatud'}</option>
              <option value="all">{isEN ? 'All Statuses' : 'Kõik staatused'}</option>
            </select>
          </div>
        </div>

        {/* Errors List */}
        <div className="modal-body error-notebook-body">
          {filteredErrors.length === 0 ? (
            <div className="empty-state-card py-5">
              <CheckCircle2 size={38} className="empty-icon text-success" />
              <h3>{isEN ? 'No mistakes here!' : 'Kõik vead on parandatud või loend tühi!'}</h3>
              <p>
                {isEN
                  ? 'Mistakes from exercises, quick tests, and study sessions are automatically diagnosed here.'
                  : 'Harjutuste ja kiirtestide käigus tekkinud vead analüüsitakse ja kogutakse siia automaatselt.'}
              </p>
            </div>
          ) : (
            <div className="errors-feed">
              {filteredErrors.map((err) => {
                const isSolRevealed = Boolean(revealedSolutions[err.id]);
                return (
                  <article
                    key={err.id}
                    className={`mistake-entry-card ${err.resolved ? 'mistake-resolved' : ''}`}
                  >
                    {/* Top Row */}
                    <div className="mistake-header-row">
                      <div className="mistake-meta-left">
                        {err.subject && <span className="badge badge-violet">{err.subject}</span>}
                        <span className={`badge ${err.errorType === 'calculation' ? 'badge-amber' : err.errorType === 'formula_selection' ? 'badge-coral' : 'badge-neutral'}`}>
                          {isEN ? err.errorTypeLabelEN || err.errorType : err.errorTypeLabelET || 'Analüüsitud viga'}
                        </span>
                        {err.materialTitle && (
                          <span className="mistake-mat-title" title={err.materialTitle}>
                            📚 {err.materialTitle}
                          </span>
                        )}
                      </div>

                      <div className="mistake-header-actions">
                        <button
                          type="button"
                          className={`btn btn-sm ${err.resolved ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => handleToggleResolved(err.id, err.resolved)}
                        >
                          <CheckCircle2 size={14} />
                          <span>
                            {err.resolved
                              ? (isEN ? 'Mark Unresolved' : 'Märgi uuesti kordamiseks')
                              : (isEN ? 'Mark Mastered' : 'Mõistetud ja parandatud')}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger-btn"
                          onClick={() => handleDelete(err.id)}
                          title={isEN ? 'Delete entry' : 'Kustuta märge'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Question text */}
                    <h3 className="mistake-question-title">{err.question}</h3>

                    {/* Comparison Callouts: Wrong vs Correct */}
                    <div className="mistake-comparison-grid">
                      <div className="comparison-card card-wrong">
                        <span className="comp-label label-wrong">❌ {isEN ? 'Your answer:' : 'Sinu antud vastus:'}</span>
                        <p className="comp-value">{err.userAnswer}</p>
                      </div>

                      <div className="comparison-card card-correct">
                        <span className="comp-label label-correct">✅ {isEN ? 'Correct answer:' : 'Õige vastus:'}</span>
                        <p className="comp-value">{err.correctAnswer}</p>
                      </div>
                    </div>

                    {/* Pedagogical Diagnosis & How to Think */}
                    <div className="mistake-pedagogy-box">
                      <div className="pedagogy-row">
                        <span className="pedagogy-tag tag-diagnosis">
                          🔍 {isEN ? 'Where the mistake occurred:' : 'Milles viga seisnes:'}
                        </span>
                        <p className="pedagogy-text">{err.diagnosis}</p>
                      </div>

                      <div className="pedagogy-row mt-2">
                        <span className="pedagogy-tag tag-thinking">
                          🧠 {isEN ? 'How to think correctly:' : 'Kuidas õigesti mõelda:'}
                        </span>
                        <p className="pedagogy-text">{err.howToThink}</p>
                      </div>
                    </div>

                    {/* Targeted Follow-up / Similar Problem */}
                    {err.similarTask && (
                      <div className="similar-task-box">
                        <div className="similar-task-header">
                          <span className="similar-task-badge">
                            <Sparkles size={13} />
                            <span>{isEN ? 'Targeted Follow-up Practice:' : 'Sarnane ülesanne proovimiseks:'}</span>
                          </span>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => toggleSolution(err.id)}
                          >
                            <span>{isSolRevealed ? (isEN ? 'Hide Solution' : 'Peida lahendus') : (isEN ? 'Show Solution' : 'Kontrolli lahendust')}</span>
                          </button>
                        </div>

                        <p className="similar-task-question">{err.similarTask.question}</p>

                        {isSolRevealed && (
                          <div className="similar-task-solution">
                            <strong>{isEN ? 'Solution & walkthrough:' : 'Lahenduskäik ja vastus:'}</strong>
                            <p>{err.similarTask.solution}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
