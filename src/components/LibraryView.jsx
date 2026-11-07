import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Play,
  FileText,
  Trash2,
  Layers,
  CheckSquare,
  BookOpen,
  RotateCcw,
  Sparkles,
  X,
  Sliders
} from 'lucide-react';
import {
  calculateMaterialStats,
  combineMaterialsIntoCollection
} from '../utils/storage';
import { DEFAULT_ENABLED_FEATURES } from '../data/sampleMaterial';

export default function LibraryView({
  t,
  materials,
  progressMap,
  onOpenMaterial,
  onOpenSourceViewer,
  onDeleteMaterial,
  onOpenUploadModal,
  onCombineMaterials
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent');

  // Combine modal state ("Loo ühine kogum")
  const [isCombineOpen, setIsCombineOpen] = useState(false);
  const [selectedCombineIds, setSelectedCombineIds] = useState([]);
  const [combineTitle, setCombineTitle] = useState('');
  const [combineSubject, setCombineSubject] = useState('Matemaatiline analüüs');
  const [combineFeatures, setCombineFeatures] = useState({
    ...DEFAULT_ENABLED_FEATURES
  });

  // Unique subjects present in library
  const allSubjects = useMemo(() => {
    const set = new Set();
    materials.forEach((m) => {
      if (m.subject) set.add(m.subject);
    });
    return Array.from(set);
  }, [materials]);

  // Filtered and sorted materials
  const filteredMaterials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = materials.filter((mat) => {
      const matchesTitle = !q || (mat.title || '').toLowerCase().includes(q);
      const matchesSubject =
        selectedSubject === 'ALL' || mat.subject === selectedSubject;
      return matchesTitle && matchesSubject;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'progress') {
        const pA = calculateMaterialStats(a, progressMap[a.id]).progressPercent;
        const pB = calculateMaterialStats(b, progressMap[b.id]).progressPercent;
        return pB - pA;
      }
      const tA = new Date(a.lastOpenedAt || a.createdAt || 0).getTime();
      const tB = new Date(b.lastOpenedAt || b.createdAt || 0).getTime();
      return tB - tA;
    });
  }, [materials, searchQuery, selectedSubject, sortBy, progressMap]);

  function handleOpenCombineModal() {
    setSelectedCombineIds([]);
    setCombineTitle('');
    setCombineSubject(allSubjects[0] || 'Matemaatiline analüüs');
    setCombineFeatures({ ...DEFAULT_ENABLED_FEATURES });
    setIsCombineOpen(true);
  }

  function toggleCombineMaterial(matId) {
    setSelectedCombineIds((prev) => {
      const next = prev.includes(matId)
        ? prev.filter((id) => id !== matId)
        : [...prev, matId];

      const chosenMats = materials.filter((m) => next.includes(m.id));
      if (chosenMats.length >= 2) {
        setCombineTitle(
          chosenMats.map((m) => m.title.split('—')[0].trim()).join(' + ')
        );
        if (chosenMats[0]?.subject) {
          setCombineSubject(chosenMats[0].subject);
        }
      }
      return next;
    });
  }

  function toggleCombineFeature(key) {
    setCombineFeatures((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  function handleCreateCombinedCollection(e) {
    e.preventDefault();
    const chosenMats = materials.filter((m) =>
      selectedCombineIds.includes(m.id)
    );
    if (chosenMats.length < 2) return;

    const newCol = combineMaterialsIntoCollection({
      materialsToCombine: chosenMats,
      title:
        combineTitle.trim() ||
        chosenMats.map((m) => m.title).join(' + '),
      subject: combineSubject || chosenMats[0]?.subject,
      contentLang: chosenMats[0]?.contentLang || 'et',
      enabledFeatures: combineFeatures
    });

    setIsCombineOpen(false);
    if (onCombineMaterials) {
      onCombineMaterials(newCol);
    }
  }

  const featureKeys = [
    'summary',
    'flashcards',
    'exercises',
    'quickTest',
    'shortCalc',
    'formulaSheet',
    'spacedRepetition',
    'mockExam'
  ];

  return (
    <div className="library-view container">
      <div className="library-header">
        <div>
          <h1 className="page-title">{t.library.title}</h1>
          <p className="page-subtitle">{t.library.subtitle}</p>
        </div>

        <div className="library-header-actions">
          {materials.length >= 2 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleOpenCombineModal}
            >
              <Layers size={17} />
              <span>{t.library.combineBtn}</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onOpenUploadModal()}
          >
            <Plus size={18} />
            <span>{t.nav.addMaterial}</span>
          </button>
        </div>
      </div>

      {/* Search and Subject Filter Controls */}
      <div className="library-toolbar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="search"
            className="form-input search-input"
            placeholder={t.library.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t.library.searchPlaceholder}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-select-wrap">
            <Filter size={16} className="filter-icon" />
            <select
              className="form-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              aria-label={t.library.subjectFilterAll}
            >
              <option value="ALL">{t.library.subjectFilterAll}</option>
              {allSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <select
            className="form-select sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort"
          >
            <option value="recent">{t.library.sortRecent}</option>
            <option value="progress">{t.library.sortProgress}</option>
            <option value="title">{t.library.sortTitle}</option>
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="empty-state-card">
          <BookOpen size={36} className="empty-icon" />
          <h3>{t.library.emptyStateTitle}</h3>
          <p>{t.library.emptyStateDesc}</p>
          <div className="empty-actions">
            {(searchQuery || selectedSubject !== 'ALL') && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('ALL');
                }}
              >
                <RotateCcw size={16} />
                <span>{t.library.resetFilters}</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onOpenUploadModal()}
            >
              <Plus size={16} />
              <span>{t.nav.addMaterial}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="library-grid">
          {filteredMaterials.map((mat) => {
            const stats = calculateMaterialStats(mat, progressMap[mat.id]);
            return (
              <article key={mat.id} className="library-card">
                <div className="library-card-main">
                  <div className="material-badges">
                    <span className="badge badge-violet">{mat.subject}</span>
                    <span className="badge badge-neutral">
                      {mat.fileType || 'DOC'} • {(mat.contentLang || 'et').toUpperCase()}
                    </span>
                    {mat.isCollection && (
                      <span className="badge badge-sample">{t.library.collectionBadge}</span>
                    )}
                    {mat.isSample && (
                      <span className="badge badge-sample">{t.home.sampleBadge}</span>
                    )}
                  </div>

                  <h2
                    className="library-card-title"
                    onClick={() => onOpenMaterial(mat.id)}
                  >
                    {mat.title}
                  </h2>

                  <p className="library-file-meta">
                    <FileText size={14} />
                    <span>{mat.fileName}</span>
                  </p>

                  <div className="library-metrics-grid">
                    <div className="metric-box">
                      <span className="metric-label">
                        <Layers size={14} />
                        {t.library.statsCards}
                      </span>
                      <span className="metric-value">
                        {stats.answeredCards}/{stats.totalCards}
                      </span>
                    </div>

                    <div className="metric-box">
                      <span className="metric-label">
                        <CheckSquare size={14} />
                        {t.library.statsExercises}
                      </span>
                      <span className="metric-value">
                        {stats.answeredExercises}/{stats.totalExercises}
                      </span>
                    </div>

                    <div className="metric-box">
                      <span className="metric-label">
                        {t.library.statsProgress}
                      </span>
                      <span className="metric-value accent-text">
                        {stats.progressPercent}%
                      </span>
                    </div>
                  </div>

                  <div className="progress-track mt-3">
                    <div
                      className="progress-fill"
                      style={{ width: `${stats.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="library-card-footer">
                  <button
                    type="button"
                    className="btn btn-primary library-study-btn"
                    onClick={() => onOpenMaterial(mat.id)}
                  >
                    <Play size={15} />
                    <span>
                      {stats.hasStarted
                        ? t.library.continueStudy
                        : t.library.startStudy}
                    </span>
                  </button>

                  <div className="library-secondary-btns">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onOpenSourceViewer(mat, 1)}
                      title={t.material.openOriginalFile}
                    >
                      <FileText size={15} />
                      <span>{t.library.openSource}</span>
                    </button>

                    <button
                      type="button"
                      className="icon-btn danger-btn"
                      onClick={() => onDeleteMaterial(mat.id)}
                      title={t.library.deleteBtn}
                      aria-label={t.library.deleteBtn}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Combine Existing Materials into Unified Collection Modal */}
      {isCombineOpen && (
        <div className="modal-backdrop" onClick={() => setIsCombineOpen(false)}>
          <div
            className="modal-card upload-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="modal-icon-badge">
                  <Layers size={18} />
                </span>
                <div>
                  <h2>{t.library.combineModalTitle}</h2>
                  <p className="modal-subtitle-caption">
                    {t.library.combineModalSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setIsCombineOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCombinedCollection} className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  {t.library.combineSelectLabel} ({selectedCombineIds.length})
                </label>
                <div className="combine-materials-checklist">
                  {materials.map((mat) => {
                    const checked = selectedCombineIds.includes(mat.id);
                    return (
                      <label
                        key={mat.id}
                        className={`feature-toggle-chip combine-material-item ${
                          checked ? 'active' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCombineMaterial(mat.id)}
                        />
                        <div className="combine-mat-info">
                          <strong>{mat.title}</strong>
                          <span className="combine-mat-meta">
                            {mat.subject} • {(mat.topics || []).length}{' '}
                            {t.home.topicsCount} • {(mat.flashcards || []).length}{' '}
                            {t.home.cardsCount} • {(mat.exercises || []).length}{' '}
                            {t.home.exercisesCount}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {t.library.combineTitleLabel}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t.library.combineTitlePlaceholder}
                  value={combineTitle}
                  onChange={(e) => setCombineTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <BookOpen size={15} />
                  <span>{t.upload.subjectLabel}</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={combineSubject}
                  onChange={(e) => setCombineSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Sliders size={15} />
                  <span>{t.featuresConfig.title}</span>
                </label>
                <div className="feature-checkbox-grid">
                  {featureKeys.map((fKey) => (
                    <label
                      key={fKey}
                      className={`feature-toggle-chip ${
                        combineFeatures[fKey] ? 'active' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(combineFeatures[fKey])}
                        onChange={() => toggleCombineFeature(fKey)}
                      />
                      <span>{t.featuresConfig[fKey]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCombineOpen(false)}
                >
                  {t.upload.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={selectedCombineIds.length < 2}
                >
                  <Sparkles size={16} />
                  <span>{t.library.combineCreateBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
