import React, { useState, useRef, useEffect } from 'react';
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
  CheckCircle2,
  Sliders,
  SlidersHorizontal,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Zap,
  BookmarkPlus,
  Palette,
  X
} from 'lucide-react';
import {
  calculateMaterialStats,
  loadDashboardConfig,
  saveDashboardConfig,
  DEFAULT_DASHBOARD_WIDGETS,
  loadAccentTheme,
  saveAccentTheme,
  ACCENT_PALETTES,
  loadErrorNotebook
} from '../utils/storage';

class WidgetErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn(`Widget "${this.props.widgetId}" error:`, err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '1rem',
          margin: '0.75rem 0',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#F87171',
          fontSize: '0.88rem'
        }}>
          <span>Ploki „{this.props.label || this.props.widgetId}” kuvamisel tekkis tõrge.</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => this.setState({ hasError: false })}
            style={{ color: '#F87171' }}
          >
            Proovi uuesti
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  onNavigateCalendar,
  onOpenQuickStudy,
  onOpenErrorNotebook,
  onOpenExplainModal
}) {
  const [isDragging, setIsDragging] = useState(false);
  const homeFileInputRef = useRef(null);

  // 6. Oma töölaud state (modular widgets & palette)
  const [widgets, setWidgets] = useState(() => loadDashboardConfig());
  const [currentPaletteId, setCurrentPaletteId] = useState(() => loadAccentTheme());
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [mistakes, setMistakes] = useState(() => loadErrorNotebook());

  useEffect(() => {
    setMistakes(loadErrorNotebook());
  }, []);

  const unresolvedMistakes = (mistakes || []).filter((m) => m && !m.resolved);

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
    ? calculateMaterialStats(resumeMaterial, progressMap?.[resumeMaterial.id])
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

  // Dashboard customization helpers
  function moveWidget(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= widgets.length) return;
    const next = [...widgets];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setWidgets(next);
    saveDashboardConfig(next);
  }

  function toggleWidgetVisibility(widgetId) {
    const next = widgets.map((w) =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    setWidgets(next);
    saveDashboardConfig(next);
  }

  function handleSelectPalette(id) {
    setCurrentPaletteId(id);
    saveAccentTheme(id);
  }

  function handleResetDashboard() {
    setWidgets(DEFAULT_DASHBOARD_WIDGETS);
    saveDashboardConfig(DEFAULT_DASHBOARD_WIDGETS);
    handleSelectPalette('sapphire');
  }

  const isWidgetVisible = (id) => {
    const found = widgets.find((w) => w.id === id);
    return found ? found.visible !== false : true;
  };

  return (
    <div className="home-view container">
      {/* Hero & Upload Dropzone Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge-row">
            <div className="hero-badge">
              <Sparkles size={15} />
              <span>{t.hero.badge}</span>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm customize-dashboard-btn"
              onClick={() => setIsCustomizerOpen(true)}
              title="Kohanda töölaua paigutust ja aktsentvärve"
            >
              <Palette size={14} className="accent-text" />
              <span>{uiLang === 'en' ? 'Customize Dashboard' : 'Oma töölaud'}</span>
            </button>
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

            {onOpenQuickStudy && (
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => onOpenQuickStudy(15)}
              >
                <Clock size={17} className="accent-text" />
                <span>{uiLang === 'en' ? '“I have 15 min”' : '„Mul on 15 minutit”'}</span>
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

      {/* RENDER CUSTOMIZED DASHBOARD WIDGETS IN USER-CONFIGURED ORDER */}
      <div className="dashboard-widgets-container">
        {widgets.map((widget, wIdx) => {
          if (!widget.visible) return null;

          const renderWidgetInner = () => {
            // 1. QUICK STUDY WIDGET: "Mul on aega" (5, 15, 30, 60 min)
            if (widget.id === 'quickStudy') {
            return (
              <section key="quickStudy" className="dashboard-widget-section quick-study-widget-section">
                <div className="quick-study-banner-card">
                  <div className="banner-left">
                    <div className="continue-banner-eyebrow">
                      <Clock size={15} className="accent-text" />
                      <span>{uiLang === 'en' ? 'Quick Micro-Sessions' : '1. „Mul on aega” kiirõpe'}</span>
                      <span className="badge badge-accent">
                        {uiLang === 'en' ? 'Focused' : 'Konkreetne õppimiskord'}
                      </span>
                    </div>
                    <h2 className="quick-study-headline">
                      {uiLang === 'en'
                        ? 'How much time do you have right now?'
                        : 'Kui palju sul praegu õppimiseks aega on?'}
                    </h2>
                    <p className="quick-study-desc">
                      {uiLang === 'en'
                        ? 'Revi curates an exact, timed session: recall questions, core explanations, and practice exercises with hints.'
                        : 'Revi koostab valitud ajaks konkreetse kava: kordamisküsimused, põhiselgitused ja harjutused koos vihjetega.'}
                    </p>
                  </div>

                  <div className="banner-right quick-time-buttons-grid">
                    {[
                      { mins: 5, label: '5 min', descET: '2 küsimust', descEN: '2 questions' },
                      { mins: 15, label: '15 min', descET: '2 kordamist + 3 harjutust', descEN: '2 recall + 3 exercises', primary: true },
                      { mins: 30, label: '30 min', descET: 'Põhjalikum tsükkel', descEN: 'In-depth cycle' },
                      { mins: 60, label: '60 min', descET: 'Täielik kordamiskord', descEN: 'Full master session' }
                    ].map((item) => (
                      <button
                        key={item.mins}
                        type="button"
                        className={`quick-time-card ${item.primary ? 'featured' : ''}`}
                        onClick={() => onOpenQuickStudy && onOpenQuickStudy(item.mins)}
                      >
                        <span className="time-badge">{item.label}</span>
                        <span className="time-meta">{uiLang === 'en' ? item.descEN : item.descET}</span>
                        <Play size={13} className="time-play-icon" />
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          // 2. ERROR NOTEBOOK WIDGET: "Vigade märkmik"
          if (widget.id === 'errorNotebook') {
            return (
              <section key="errorNotebook" className="dashboard-widget-section error-notebook-widget-section">
                <div className="error-notebook-banner-card">
                  <div className="error-banner-info">
                    <div className="continue-banner-eyebrow">
                      <BookmarkPlus size={15} className="accent-text" />
                      <span>{uiLang === 'en' ? 'Mistake Journal' : '2. Vigade märkmik'}</span>
                      <span className="badge badge-warning">
                        {unresolvedMistakes.length}{' '}
                        {uiLang === 'en' ? 'to review' : 'ootab kinnistamist'}
                      </span>
                    </div>
                    <h3 className="error-banner-title">
                      {uiLang === 'en'
                        ? 'Learn deeply from each incorrect attempt'
                        : 'Valede vastuste automaatne diagnostika'}
                    </h3>
                    <p className="error-banner-desc">
                      {uiLang === 'en'
                        ? 'Distinguishes formula selection slips from calculation errors, explains how to think correctly, and provides similar follow-up problems.'
                        : 'Revi eristab valemi valimise vea arvutusveast, selgitab õiget mõttekäiku ning pakub sarnast harjutust.'}
                    </p>

                    <div className="error-types-pills mt-2">
                      <span className="badge badge-neutral">📐 Valemi valik</span>
                      <span className="badge badge-neutral">🔢 Arvutusviga</span>
                      <span className="badge badge-neutral">💡 Mõisteline arusaam</span>
                    </div>
                  </div>

                  <div className="error-banner-actions">
                    {onOpenExplainModal && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onOpenExplainModal(null, null)}
                      >
                        <Sparkles size={15} />
                        <span>{uiLang === 'en' ? 'Explain in own words' : 'Selgita oma sõnadega'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={onOpenErrorNotebook}
                    >
                      <BookmarkPlus size={16} />
                      <span>{uiLang === 'en' ? 'Open Mistake Journal' : 'Ava vigade märkmik'}</span>
                    </button>
                  </div>
                </div>
              </section>
            );
          }

          // 3. UPCOMING DEADLINES WIDGET
          if (widget.id === 'deadlines') {
            return (
              <section key="deadlines" className="dashboard-widget-section deadlines-widget-section">
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
                    <div className="deadlines-mini-grid">
                      {upcomingEvents.map((ev) => (
                        <div key={ev.id} className="deadline-mini-card">
                          <div className="deadline-mini-top">
                            <div className="material-badges" style={{ marginBottom: 0 }}>
                              <span className="badge badge-violet">
                                {t.calendar?.types?.[ev.type] || ev.type}
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

                          {ev.topics && ev.topics.length > 0 && (
                            <p className="deadline-mini-topics">
                              {ev.topics.join(' • ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );
          }

          // 4. DUE TODAY (DAILY SPACED REPETITION)
          if (widget.id === 'dueToday') {
            return (
              <section key="dueToday" className="dashboard-widget-section due-today-widget-section">
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
                                ? item.card?.question || ''
                                : item.exercise?.question || ''}
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
              </section>
            );
          }

          // 5. CONTINUE STUDYING / ACTIVE SESSION
          if (widget.id === 'continueStudy' && resumeMaterial && resumeStats) {
            return (
              <section key="continueStudy" className="dashboard-widget-section continue-banner-section">
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
            );
          }

          // 6. SUBJECTS & RECENT MATERIALS OVERVIEW
          if (widget.id === 'subjectsOverview') {
            return (
              <section key="subjectsOverview" className="dashboard-widget-section recent-materials-section">
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
                    const stats = calculateMaterialStats(mat, progressMap?.[mat.id]) || {
                      totalCards: 0,
                      totalExercises: 0,
                      progressPercent: 0
                    };
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
            );
          }

          return null;
        };

        const content = renderWidgetInner();
        if (!content) return null;

        return (
          <WidgetErrorBoundary
            key={widget.id}
            widgetId={widget.id}
            label={uiLang === 'en' ? widget.labelEN : widget.labelET}
          >
            {content}
          </WidgetErrorBoundary>
        );
      })}
    </div>

      {/* 6. OMA TÖÖLAUD CUSTOMIZER MODAL */}
      {isCustomizerOpen && (
        <div
          className="modal-backdrop dashboard-customizer-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCustomizerOpen(false);
          }}
        >
          <div className="modal-card dashboard-customizer-card">
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="badge badge-primary">
                  <Palette size={13} />
                  <span>{uiLang === 'en' ? 'Personalize' : 'Isikupärastamine'}</span>
                </div>
                <h2 className="modal-title">
                  {uiLang === 'en' ? 'My Dashboard & Style' : 'Oma töölaud ja stiil'}
                </h2>
                <p className="modal-subtitle">
                  {uiLang === 'en'
                    ? 'Reorder or hide home page blocks. Customize your accent color while preserving Revi’s visual harmony.'
                    : 'Liiguta või peida avalehe plokke. Vali aktsentvärv, mis sobib sinu stiiliga.'}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon modal-close-btn"
                onClick={() => setIsCustomizerOpen(false)}
                aria-label="Sulge"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body dashboard-customizer-body">
              {/* Part 1: Accent Color Palette */}
              <div className="form-group mb-4">
                <label className="form-label font-bold flex items-center gap-1.5 mb-2">
                  <Palette size={16} className="accent-text" />
                  <span>{uiLang === 'en' ? 'Select Accent Color:' : 'Vali kujunduse aktsentvärv:'}</span>
                </label>
                <div className="palette-swatches-grid">
                  {ACCENT_PALETTES.map((pal) => (
                    <button
                      key={pal.id}
                      type="button"
                      className={`palette-swatch-btn ${currentPaletteId === pal.id ? 'active' : ''}`}
                      onClick={() => handleSelectPalette(pal.id)}
                    >
                      <span
                        className="palette-color-circle"
                        style={{ backgroundColor: pal.hex }}
                      />
                      <span className="palette-name">
                        {uiLang === 'en' ? pal.nameEN : pal.nameET}
                      </span>
                      {currentPaletteId === pal.id && (
                        <CheckCircle2 size={16} className="palette-check-icon" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Part 2: Reorder & Hide Dashboard Blocks */}
              <div className="form-group mb-3">
                <div className="flex-between items-center mb-2">
                  <label className="form-label font-bold flex items-center gap-1.5">
                    <SlidersHorizontal size={16} className="accent-text" />
                    <span>{uiLang === 'en' ? 'Dashboard Blocks (Order & Visibility):' : 'Avalehe plokid (järjekord ja nähtavus):'}</span>
                  </label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleResetDashboard}
                  >
                    <RotateCcw size={13} />
                    <span>{uiLang === 'en' ? 'Reset defaults' : 'Taasta algolek'}</span>
                  </button>
                </div>

                <div className="widget-config-list">
                  {widgets.map((w, idx) => (
                    <div
                      key={w.id}
                      className={`widget-config-item ${w.visible ? 'visible' : 'hidden-widget'}`}
                    >
                      <div className="widget-drag-info">
                        <span className="widget-num">{idx + 1}</span>
                        <span className="widget-label font-semibold">
                          {uiLang === 'en' ? w.labelEN : w.labelET}
                        </span>
                      </div>

                      <div className="widget-item-controls">
                        <button
                          type="button"
                          className="icon-btn-xs"
                          disabled={idx === 0}
                          onClick={() => moveWidget(idx, -1)}
                          title="Liiguta üles"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn-xs"
                          disabled={idx === widgets.length - 1}
                          onClick={() => moveWidget(idx, 1)}
                          title="Liiguta alla"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${w.visible ? 'btn-ghost' : 'btn-secondary'}`}
                          onClick={() => toggleWidgetVisibility(w.id)}
                          title={w.visible ? 'Peida plokk' : 'Näita plokki'}
                        >
                          {w.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                          <span>{w.visible ? (uiLang === 'en' ? 'Visible' : 'Nähtav') : (uiLang === 'en' ? 'Hidden' : 'Peidetud')}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsCustomizerOpen(false)}
              >
                {uiLang === 'en' ? 'Save & Close' : 'Salvesta ja sulge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
