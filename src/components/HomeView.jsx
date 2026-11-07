import React, { useState, useRef } from 'react';
import {
  Plus,
  UploadCloud,
  Play,
  BookOpen,
  Layers,
  CheckSquare,
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { calculateMaterialStats } from '../utils/storage';

export default function HomeView({
  t,
  uiLang,
  materials,
  progressMap,
  lastSession,
  onOpenUploadModal,
  onOpenMaterial,
  onNavigateLibrary
}) {
  const [isDragging, setIsDragging] = useState(false);
  const homeFileInputRef = useRef(null);

  // Sort materials by lastOpenedAt descending
  const sortedRecent = [...materials].sort((a, b) => {
    const tA = new Date(a.lastOpenedAt || a.createdAt || 0).getTime();
    const tB = new Date(b.lastOpenedAt || b.createdAt || 0).getTime();
    return tB - tA;
  });

  // Determine the best material to resume when clicking "Jätka kordamist"
  const resumeMaterial =
    (lastSession?.materialId &&
      materials.find((m) => m.id === lastSession.materialId)) ||
    sortedRecent.find((m) => m.contentLang === uiLang) ||
    sortedRecent[0];

  const resumeStats = resumeMaterial
    ? calculateMaterialStats(resumeMaterial, progressMap[resumeMaterial.id])
    : null;

  function handleHomeDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      onOpenUploadModal(file);
    }
  }

  return (
    <div className="home-view container">
      {/* Hero & Upload Dropzone Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={15} />
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="hero-title">{t.hero.title}</h1>
          <p className="hero-subtitle">{t.hero.subtitle}</p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => onOpenUploadModal()}
            >
              <Plus size={19} strokeWidth={2.5} />
              <span>{t.hero.addBtn}</span>
            </button>

            {resumeMaterial && (
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() =>
                  onOpenMaterial(
                    resumeMaterial.id,
                    lastSession?.materialId === resumeMaterial.id
                      ? lastSession.activeTab
                      : undefined
                  )
                }
              >
                <Play size={17} />
                <span>{t.hero.continueBtn}</span>
              </button>
            )}
          </div>
        </div>

        {/* Drag & Drop Upload Zone on Home Page */}
        <div
          className={`hero-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleHomeDrop}
          onClick={() => homeFileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              homeFileInputRef.current?.click();
            }
          }}
          aria-label={t.hero.dropzoneTitle}
        >
          <input
            ref={homeFileInputRef}
            type="file"
            accept=".pdf,.pptx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onOpenUploadModal(file);
                e.target.value = '';
              }
            }}
          />
          <div className="dropzone-icon-large">
            <UploadCloud size={34} strokeWidth={1.9} />
          </div>
          <h2 className="dropzone-heading">{t.hero.dropzoneTitle}</h2>
          <p className="dropzone-caption">{t.hero.dropzoneSubtitle}</p>
          <div className="format-pills">
            <span className="format-pill">PDF</span>
            <span className="format-pill">PPTX</span>
            <span className="format-pill">TXT</span>
          </div>
          <p className="dropzone-footer-note">{t.hero.supportedFormats}</p>
        </div>
      </section>

      {/* Active Session / Continue Studying Banner */}
      {resumeMaterial && (
        <section className="continue-banner-section">
          <div className="continue-banner-card">
            <div className="continue-banner-info">
              <div className="continue-banner-eyebrow">
                <span className="pulse-dot" />
                <span>{t.home.continueBannerTitle}</span>
                <span className="badge badge-outline">
                  {resumeMaterial.subject}
                </span>
              </div>
              <h3 className="continue-banner-title">{resumeMaterial.title}</h3>
              <div className="continue-banner-meta">
                <span>
                  {resumeStats.totalCards} {t.home.cardsCount}
                </span>
                <span>•</span>
                <span>
                  {resumeStats.totalExercises} {t.home.exercisesCount}
                </span>
                <span>•</span>
                <span>
                  {t.home.progressLabel}: <strong>{resumeStats.progressPercent}%</strong>
                </span>
              </div>
            </div>

            <div className="continue-banner-right">
              <div className="continue-progress-mini">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${resumeStats.progressPercent}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  onOpenMaterial(
                    resumeMaterial.id,
                    lastSession?.materialId === resumeMaterial.id
                      ? lastSession.activeTab
                      : undefined
                  )
                }
              >
                <Play size={16} />
                <span>{t.home.continueAction}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Recently Opened Materials Section */}
      <section className="recent-materials-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">{t.home.recentTitle}</h2>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onNavigateLibrary}
          >
            <span>{t.home.viewAllLibrary}</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="materials-grid">
          {sortedRecent.slice(0, 6).map((mat) => {
            const stats = calculateMaterialStats(mat, progressMap[mat.id]);
            return (
              <article key={mat.id} className="material-card">
                <div className="material-card-top">
                  <div className="material-badges">
                    <span className="badge badge-violet">{mat.subject}</span>
                    <span className="badge badge-neutral">
                      {mat.fileType || 'DOC'} • {(mat.contentLang || 'et').toUpperCase()}
                    </span>
                    {mat.isSample && (
                      <span className="badge badge-sample">{t.home.sampleBadge}</span>
                    )}
                  </div>

                  <h3
                    className="material-card-title"
                    onClick={() => onOpenMaterial(mat.id)}
                  >
                    {mat.title}
                  </h3>

                  <div className="material-stats-row">
                    <span className="stat-pill">
                      <BookOpen size={14} />
                      {(mat.topics || []).length} {t.home.topicsCount}
                    </span>
                    <span className="stat-pill">
                      <Layers size={14} />
                      {stats.totalCards} {t.home.cardsCount}
                    </span>
                    <span className="stat-pill">
                      <CheckSquare size={14} />
                      {stats.totalExercises} {t.home.exercisesCount}
                    </span>
                  </div>
                </div>

                <div className="material-card-bottom">
                  <div className="progress-row">
                    <div className="progress-label-line">
                      <span>{t.home.progressLabel}</span>
                      <span className="progress-pct">{stats.progressPercent}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${stats.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="material-card-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-full"
                      onClick={() => onOpenMaterial(mat.id)}
                    >
                      <Play size={15} />
                      <span>{t.home.continueAction}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
