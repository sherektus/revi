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
  RotateCcw
} from 'lucide-react';
import { calculateMaterialStats } from '../utils/storage';

export default function LibraryView({
  t,
  materials,
  progressMap,
  onOpenMaterial,
  onOpenSourceViewer,
  onDeleteMaterial,
  onOpenUploadModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent');

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

  return (
    <div className="library-view container">
      <div className="library-header">
        <div>
          <h1 className="page-title">{t.library.title}</h1>
          <p className="page-subtitle">{t.library.subtitle}</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onOpenUploadModal()}
        >
          <Plus size={18} />
          <span>{t.nav.addMaterial}</span>
        </button>
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
    </div>
  );
}
