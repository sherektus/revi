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
  Sliders,
  GraduationCap,
  Sigma,
  FolderTree,
  LayoutGrid
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
  const [viewMode, setViewMode] = useState('categories'); // 'categories' | 'grid'
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
      const matchesTopic =
        !q ||
        (mat.topics || []).some(
          (tp) =>
            (tp.title || '').toLowerCase().includes(q) ||
            (tp.summary || '').toLowerCase().includes(q)
        );
      return (matchesTitle || matchesTopic) && matchesSubject;
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

  // Subject Categories grouping with distinct Topic Areas
  const subjectGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const groupsMap = new Map();

    for (const mat of filteredMaterials) {
      const subj = mat.subject || 'Üldised õppematerjalid';
      if (!groupsMap.has(subj)) {
        groupsMap.set(subj, {
          subject: subj,
          materials: [],
          topics: [],
          totalCards: 0,
          answeredCards: 0,
          totalExercises: 0,
          answeredExercises: 0
        });
      }
      const grp = groupsMap.get(subj);
      grp.materials.push(mat);

      const stats = calculateMaterialStats(mat, progressMap[mat.id]);
      grp.totalCards += stats.totalCards;
      grp.answeredCards += stats.answeredCards;
      grp.totalExercises += stats.totalExercises;
      grp.answeredExercises += stats.answeredExercises;

      for (const tp of mat.topics || []) {
        const matchesTopic =
          !q ||
          (tp.title || '').toLowerCase().includes(q) ||
          (tp.summary || '').toLowerCase().includes(q) ||
          (mat.title || '').toLowerCase().includes(q) ||
          (subj || '').toLowerCase().includes(q);

        if (!matchesTopic) continue;

        const topicCards = (mat.flashcards || []).filter(
          (fc) => fc.topicId === tp.id
        );
        const topicExercises = (mat.exercises || []).filter(
          (ex) => ex.topicId === tp.id
        );
        const topicFormulas = tp.formulas || [];

        grp.topics.push({
          ...tp,
          materialId: mat.id,
          materialTitle: mat.title,
          materialLang: mat.contentLang || 'et',
          cardsCount: topicCards.length,
          exercisesCount: topicExercises.length,
          formulasCount: topicFormulas.length,
          bulletPointsCount: (tp.bulletPoints || []).length,
          sourceRef: tp.sourceRef
        });
      }
    }

    return Array.from(groupsMap.values()).map((grp) => {
      const totalItems = grp.totalCards + grp.totalExercises;
      const answeredItems = grp.answeredCards + grp.answeredExercises;
      const progressPercent =
        totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0;
      return {
        ...grp,
        progressPercent
      };
    });
  }, [filteredMaterials, progressMap, searchQuery]);

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
          chosenMats.map((m) => m.title.split(/[—–]/)[0].trim()).join(' + ')
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
    'figures',
    'flashcards',
    'exercises',
    'quickTest',
    'shortCalc',
    'formulaSheet',
    'spacedRepetition',
    'mockExam'
  ];

  function renderMaterialCard(mat) {
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

          <h3
            className="library-card-title"
            onClick={() => onOpenMaterial(mat.id)}
          >
            {mat.title}
          </h3>

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
  }

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

      {/* Search, Filter and View Mode Toolbar */}
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
          {/* View Mode Toggle: Categories vs Grid */}
          <div className="view-mode-toggle" role="group" aria-label="Vaate valik">
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'categories' ? 'active' : ''}`}
              onClick={() => setViewMode('categories')}
              title={t.library.viewModeCategories || 'Õppeained ja teemad'}
            >
              <FolderTree size={15} />
              <span className="view-mode-label">{t.library.viewModeCategories || 'Õppeained ja teemad'}</span>
            </button>
            <button
              type="button"
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title={t.library.viewModeGrid || 'Kõik materjalid'}
            >
              <LayoutGrid size={15} />
              <span className="view-mode-label">{t.library.viewModeGrid || 'Kõik materjalid'}</span>
            </button>
          </div>

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

      {/* Main Content Area */}
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
      ) : viewMode === 'categories' ? (
        /* Categorized View: Õppeainete kategooriad ja nende alla eraldi teemade alad */
        <div className="subject-categories-container">
          {subjectGroups.map((grp) => (
            <section key={grp.subject} className="subject-category-block">
              {/* Subject Category Header Card */}
              <div className="subject-category-header">
                <div className="subject-category-left">
                  <div className="subject-icon-avatar">
                    <GraduationCap size={22} />
                  </div>
                  <div className="subject-title-box">
                    <div className="subject-title-row">
                      <h2 className="subject-category-name">{grp.subject}</h2>
                      <span className="badge badge-neutral">
                        {grp.materials.length}{' '}
                        {grp.materials.length === 1
                          ? t.library.materialsInSubjectSingular || 'materjal'
                          : t.library.materialsInSubject || 'materjali'}
                      </span>
                      <span className="badge badge-violet">
                        {grp.topics.length}{' '}
                        {grp.topics.length === 1
                          ? t.library.topicsInSubjectSingular || 'teema'
                          : t.library.topicsInSubject || 'teemat'}
                      </span>
                    </div>

                    <div className="subject-mastery-wrap">
                      <span className="subject-mastery-label">
                        {t.library.subjectMasteryLabel || 'Aine omandatus'}:
                      </span>
                      <div className="subject-progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${grp.progressPercent}%` }}
                        />
                      </div>
                      <span className="subject-mastery-val">{grp.progressPercent}%</span>
                    </div>
                  </div>
                </div>

                <div className="subject-category-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onOpenUploadModal(grp.subject)}
                  >
                    <Plus size={14} />
                    <span>{t.library.addMaterialToSubject || 'Lisa materjal siia ainesse'}</span>
                  </button>
                </div>
              </div>

              {/* Eraldi teemade alad (Topic Areas Grid) */}
              <div className="subject-topics-section">
                <div className="section-mini-heading">
                  <Layers size={15} />
                  <span>
                    {t.library.topicAreasTitle || 'Selle aine teemade alad'} ({grp.topics.length})
                  </span>
                </div>

                {grp.topics.length === 0 ? (
                  <p className="empty-topics-text">
                    {t.library.emptyTopicsInSubject || 'Teemasid ei leitud.'}
                  </p>
                ) : (
                  <div className="subject-topics-grid">
                    {grp.topics.map((tp, tpIdx) => (
                      <article
                        key={`${tp.materialId}-${tp.id || tpIdx}`}
                        className="topic-area-card"
                      >
                        <div className="topic-area-top">
                          <div className="topic-area-badge-row">
                            <span className="topic-source-pill">
                              <FileText size={11} />
                              <span>{tp.sourceRef?.label || `Teema ${tpIdx + 1}`}</span>
                            </span>
                            <span className="topic-material-tag" title={tp.materialTitle}>
                              {tp.materialTitle}
                            </span>
                          </div>
                          <h3
                            className="topic-area-title"
                            onClick={() => onOpenMaterial(tp.materialId, 'summary')}
                          >
                            {tp.title}
                          </h3>
                        </div>

                        {tp.summary && (
                          <p className="topic-area-summary">
                            {tp.summary}
                          </p>
                        )}

                        <div className="topic-area-features-pills">
                          {tp.bulletPointsCount > 0 && (
                            <span className="feature-count-tag" title="Kordamispunktid">
                              <BookOpen size={12} />
                              <span>
                                {tp.bulletPointsCount}{' '}
                                {tp.bulletPointsCount === 1
                                  ? t.library.pointsTagSingular || 'punkt'
                                  : t.library.pointsTag || 'punkti'}
                              </span>
                            </span>
                          )}
                          {tp.formulasCount > 0 && (
                            <span className="feature-count-tag formula-tag" title="Valemid">
                              <Sigma size={12} />
                              <span>
                                {tp.formulasCount}{' '}
                                {tp.formulasCount === 1
                                  ? t.library.formulasTagSingular || 'valem'
                                  : t.library.formulasTag || 'valemit'}
                              </span>
                            </span>
                          )}
                          {tp.cardsCount > 0 && (
                            <span className="feature-count-tag" title="Mälukaardid">
                              <Layers size={12} />
                              <span>
                                {tp.cardsCount}{' '}
                                {tp.cardsCount === 1
                                  ? t.library.cardsTagSingular || 'kaart'
                                  : t.library.cardsTag || 'kaarti'}
                              </span>
                            </span>
                          )}
                          {tp.exercisesCount > 0 && (
                            <span className="feature-count-tag" title="Harjutused">
                              <CheckSquare size={12} />
                              <span>
                                {tp.exercisesCount}{' '}
                                {tp.exercisesCount === 1
                                  ? t.library.exercisesTagSingular || 'ülesanne'
                                  : t.library.exercisesTag || 'ülesannet'}
                              </span>
                            </span>
                          )}
                        </div>

                        <div className="topic-area-footer">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm topic-study-btn"
                            onClick={() => onOpenMaterial(tp.materialId, 'summary')}
                          >
                            <Play size={13} />
                            <span>{t.library.reviewTopicBtn || 'Korda teemat'}</span>
                          </button>

                          <div className="topic-quick-shortcuts">
                            {tp.cardsCount > 0 && (
                              <button
                                type="button"
                                className="topic-shortcut-chip"
                                onClick={() => onOpenMaterial(tp.materialId, 'flashcards')}
                                title={t.library.practiceCardsBtn || 'Mälukaardid'}
                              >
                                <Layers size={12} />
                                <span>{t.library.practiceCardsBtn || 'Kaardid'}</span>
                              </button>
                            )}
                            {tp.formulasCount > 0 && (
                              <button
                                type="button"
                                className="topic-shortcut-chip"
                                onClick={() => onOpenMaterial(tp.materialId, 'formulas')}
                                title={t.library.formulasBtn || 'Valemid'}
                              >
                                <Sigma size={12} />
                                <span>{t.library.formulasBtn || 'Valemid'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {/* Selle aine materjalid (Material Shelf) */}
              <div className="subject-materials-shelf mt-4">
                <div className="section-mini-heading">
                  <BookOpen size={15} />
                  <span>
                    {t.home.recentTitle || 'Õppematerjalid'} ({grp.materials.length})
                  </span>
                </div>
                <div className="subject-materials-grid">
                  {grp.materials.map((mat) => renderMaterialCard(mat))}
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* Classic Flat Grid View */
        <div className="library-grid">
          {filteredMaterials.map((mat) => renderMaterialCard(mat))}
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
                            {(mat.topics || []).length === 1
                              ? t.home.topicsCountSingular || 'teema'
                              : t.home.topicsCount || 'teemat'}{' '}
                            • {(mat.flashcards || []).length}{' '}
                            {(mat.flashcards || []).length === 1
                              ? t.home.cardsCountSingular || 'mälukaart'
                              : t.home.cardsCount || 'mälukaarti'}{' '}
                            • {(mat.exercises || []).length}{' '}
                            {(mat.exercises || []).length === 1
                              ? t.home.exercisesCountSingular || 'harjutus'
                              : t.home.exercisesCount || 'harjutust'}
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
