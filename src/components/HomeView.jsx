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
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { calculateMaterialStats } from '../utils/storage';

export default function HomeView({
  t,
  uiLang,
  materials,
  progressMap,
  lastSession,
  dueTodayQueue,
  calendarEvents,
  onStartDueToday,
  onOpenUploadModal,
  onOpenMaterial,
  onNavigateLibrary,
  onNavigateCalendar
}) {
  const [isDragging, setIsDragging] = useState(false);
  const homeFileInputRef = useRef(null);

  const sortedRecent = [...materials].sort((a, b) => {
    const tA = new Date(a.lastOpenedAt || a.createdAt || 0).getTime();
    const tB = new Date(b.lastOpenedAt || b.createdAt || 0).getTime();
    return tB - tA;
  });

  const resumeMaterial =
    (lastSession?.materialId &&
      materials.find((m) => m.id === lastSession.materialId)) ||
    sortedRecent.find((m) => m.contentLang === uiLang) ||
    sortedRecent[0];

  const resumeStats = resumeMaterial
    ? calculateMaterialStats(resumeMaterial, progressMap[resumeMaterial.id])
    : null;

  // Upcoming uncompleted deadlines sorted by date ascending
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingEvents = [...(calendarEvents || [])]
    .filter((ev) => !ev.completed && ev.date >= todayStr)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .slice(0, 4);

  function getDaysRemainingLabel(dateStr) {
    const [y, m, d] = (dateStr || '').split('-').map(Number);
    if (!y || !m || !d) return '';
    const now = new Date();
    const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const targetUTC = Date.UTC(y, m - 1, d);
    const diff = Math.round((targetUTC - todayUTC) / 86400000);
    if (diff === 0) return t.upcomingDeadlines.todayBadge;
    if (diff === 1) return t.upcomingDeadlines.tomorrowBadge;
    return `${diff} ${t.upcomingDeadlines.daysLeft}`;
  }

  function handleHomeDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) {
      onOpenUploadModal(files);
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
            multiple
            accept=".pdf,.pptx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            className="sr-only"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                onOpenUploadModal(files);
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

      {/* TWO-COLUMN DASHBOARD: "Täna korrata" & "Lähenevad tähtajad" */}
      <section className="home-dashboard-grid">
        {/* 1. "Täna korrata" (Due Today Spaced Repetition Card) */}
        <div className="dashboard-panel due-today-panel">
          <div className="panel-header">
            <div>
              <div className="continue-banner-eyebrow">
                <RefreshCw size={14} />
                <span>{t.dueToday.title}</span>
              </div>
              <h2 className="panel-title">{t.dueToday.title}</h2>
              <p className="panel-subtitle">{t.dueToday.subtitle}</p>
            </div>
          </div>

          {dueTodayQueue && dueTodayQueue.length > 0 ? (
            <div className="due-today-content">
              <div className="due-preview-list">
                {dueTodayQueue.slice(0, 3).map((item) => (
                  <div key={item.itemKey} className="due-preview-item">
                    <span
                      className={`badge ${
                        item.difficultyTag === 'hard'
                          ? 'badge-warning'
                          : 'badge-violet'
                      }`}
                    >
                      {item.difficultyTag === 'hard'
                        ? t.dueToday.tagHard
                        : item.difficultyTag === 'planned'
                        ? t.dueToday.tagPlanned
                        : t.dueToday.tagDue}
                    </span>
                    <p className="due-preview-question">
                      {item.itemType === 'flashcard'
                        ? item.card.question
                        : item.exercise.question}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg btn-full mt-3"
                onClick={onStartDueToday}
              >
                <Play size={17} />
                <span>
                  {t.dueToday.startBtnPrefix} ({dueTodayQueue.length}{' '}
                  {dueTodayQueue.length === 1
                    ? t.dueToday.questionSingular
                    : t.dueToday.questionPlural}
                  )
                </span>
              </button>
            </div>
          ) : (
            <div className="due-empty-box">
              <CheckCircle2 size={28} className="accent-text mb-2" />
              <h3>{t.dueToday.emptyTitle}</h3>
              <p>{t.dueToday.emptySubtitle}</p>
            </div>
          )}
        </div>

        {/* 2. "Lähenevad tähtajad" (Upcoming Deadlines from Calendar) */}
        <div className="dashboard-panel deadlines-panel">
          <div className="panel-header">
            <div>
              <div className="continue-banner-eyebrow">
                <Calendar size={14} />
                <span>{t.nav.calendar}</span>
              </div>
              <h2 className="panel-title">{t.upcomingDeadlines.title}</h2>
              <p className="panel-subtitle">{t.upcomingDeadlines.subtitle}</p>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onNavigateCalendar}
            >
              <span>{t.upcomingDeadlines.viewCalendarBtn}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="due-empty-box">
              <p>{t.upcomingDeadlines.emptyText}</p>
              <button
                type="button"
                className="btn btn-secondary btn-sm mt-2"
                onClick={onNavigateCalendar}
              >
                <Plus size={15} />
                <span>{t.upcomingDeadlines.addEventBtn}</span>
              </button>
            </div>
          ) : (
            <div className="deadlines-mini-list">
              {upcomingEvents.map((ev) => {
                const linkedMats = materials.filter((m) =>
                  (ev.linkedMaterialIds || []).includes(m.id)
                );
                return (
                  <div key={ev.id} className="deadline-mini-card">
                    <div className="deadline-mini-top">
                      <div className="material-badges" style={{ marginBottom: 0 }}>
                        <span className="badge badge-violet">
                          {t.calendar.types[ev.type] || ev.type}
                        </span>
                        <span className="badge badge-neutral">{ev.subject}</span>
                      </div>
                      <span className="badge badge-warning">
                        <Clock size={12} />
                        {getDaysRemainingLabel(ev.date)}
                      </span>
                    </div>

                    <h3
                      className="deadline-mini-title"
                      onClick={onNavigateCalendar}
                    >
                      {ev.title}
                    </h3>

                    <p className="deadline-mini-date">
                      {ev.date} {ev.time ? `• ${ev.time}` : ''}
                    </p>

                    {linkedMats.length > 0 && (
                      <div className="deadline-linked-pills">
                        {linkedMats.map((lm) => (
                          <button
                            key={lm.id}
                            type="button"
                            className="source-ref-btn"
                            onClick={() => onOpenMaterial(lm.id)}
                          >
                            <BookOpen size={12} />
                            <span>{lm.title.slice(0, 34)}...</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
                    {mat.isCollection && (
                      <span className="badge badge-sample">{t.library.collectionBadge}</span>
                    )}
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
