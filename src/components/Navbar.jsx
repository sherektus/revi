import React, { useState, useEffect, useRef } from 'react';
import ReviLogo from './ReviLogo';
import {
  BookOpen,
  Library,
  Calendar,
  ClipboardCheck,
  Sigma,
  Plus,
  Minus,
  Sun,
  Moon,
  Layers,
  Coffee,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Type,
  Eye,
  SlidersHorizontal,
  Keyboard,
  BookmarkPlus,
  Zap,
  Info
} from 'lucide-react';
import { loadTimerSettings, saveTimerSettings } from '../utils/storage';

export default function Navbar({
  t,
  uiLang,
  onChangeLang,
  theme,
  onToggleTheme,
  fontSize = 'normal',
  onChangeFontSize,
  highContrast = false,
  onToggleHighContrast,
  currentView,
  onNavigate,
  onOpenUploadModal,
  activeProfileName,
  onOpenPrivacyModal,
  onOpenShortcutsModal,
  onOpenQuickStudy,
  onOpenErrorNotebook
}) {
  const [timerSettings, setTimerSettings] = useState(() => loadTimerSettings());
  const [isTimerSettingsOpen, setIsTimerSettingsOpen] = useState(false);
  const timerSettingsRef = useRef(null);
  const clockBtnRef = useRef(null);

  const focusDuration = timerSettings.focusMinutes || 25;
  const breakDuration = timerSettings.breakMinutes || 5;

  const [timerMode, setTimerMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        timerSettingsRef.current &&
        !timerSettingsRef.current.contains(event.target)
      ) {
        setIsTimerSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const nextMode = timerMode === 'focus' ? 'break' : 'focus';
          setTimerMode(nextMode);
          setIsRunning(false);
          const nextMins =
            nextMode === 'focus'
              ? timerSettings.focusMinutes
              : timerSettings.breakMinutes;
          return nextMins * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, timerMode, timerSettings]);

  function toggleTimerMode() {
    const nextMode = timerMode === 'focus' ? 'break' : 'focus';
    setTimerMode(nextMode);
    setIsRunning(false);
    const nextMins =
      nextMode === 'focus'
        ? timerSettings.focusMinutes
        : timerSettings.breakMinutes;
    setSecondsLeft(nextMins * 60);
  }

  function resetTimer() {
    setIsRunning(false);
    const minsVal =
      timerMode === 'focus'
        ? timerSettings.focusMinutes
        : timerSettings.breakMinutes;
    setSecondsLeft(minsVal * 60);
  }

  function updateDurations(newFocus, newBreak) {
    const updated = {
      focusMinutes: Math.min(180, Math.max(1, Number(newFocus) || 25)),
      breakMinutes: Math.min(60, Math.max(1, Number(newBreak) || 5))
    };
    setTimerSettings(updated);
    saveTimerSettings(updated);
    if (!isRunning) {
      const activeMins =
        timerMode === 'focus' ? updated.focusMinutes : updated.breakMinutes;
      setSecondsLeft(activeMins * 60);
    }
  }

  function stepFocus(delta) {
    const next = Math.min(180, Math.max(5, timerSettings.focusMinutes + delta));
    updateDurations(next, timerSettings.breakMinutes);
  }

  function stepBreak(delta) {
    const next = Math.min(60, Math.max(1, timerSettings.breakMinutes + delta));
    updateDurations(timerSettings.focusMinutes, next);
  }

  useEffect(() => {
    const el = clockBtnRef.current;
    if (!el) return;

    function handleWheel(e) {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY < 0 ? 5 : -5;
      if (timerMode === 'focus') {
        const next = Math.min(180, Math.max(5, timerSettings.focusMinutes + delta));
        updateDurations(next, timerSettings.breakMinutes);
      } else {
        const next = Math.min(60, Math.max(1, timerSettings.breakMinutes + (e.deltaY < 0 ? 1 : -1)));
        updateDurations(timerSettings.focusMinutes, next);
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [timerMode, timerSettings, isRunning]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  // Font size steps: 80% (xsmall), 90% (small), 100% (normal), 115% (large), 130% (xlarge), 145% (xxlarge)
  const FONT_SIZE_STEPS = [80, 90, 100, 115, 130, 145];

  const currentPercent = (() => {
    if (fontSize === 'normal' || fontSize === 100 || fontSize === '100') return 100;
    if (fontSize === 'large' || fontSize === 115 || fontSize === '115') return 115;
    if (fontSize === 'xlarge' || fontSize === 130 || fontSize === '130') return 130;
    if (fontSize === 'small' || fontSize === 90 || fontSize === '90') return 90;
    if (fontSize === 'xsmall' || fontSize === 80 || fontSize === '80') return 80;
    const num = Number(fontSize);
    return !isNaN(num) && num > 0 ? num : 100;
  })();

  const currentStepIndex = (() => {
    const directIdx = FONT_SIZE_STEPS.indexOf(currentPercent);
    if (directIdx !== -1) return directIdx;
    return FONT_SIZE_STEPS.reduce(
      (prevIdx, currVal, idx) =>
        Math.abs(currVal - currentPercent) <
        Math.abs(FONT_SIZE_STEPS[prevIdx] - currentPercent)
          ? idx
          : prevIdx,
      2
    );
  })();

  function handleDecreaseFontSize() {
    if (currentStepIndex > 0) {
      onChangeFontSize?.(FONT_SIZE_STEPS[currentStepIndex - 1]);
    }
  }

  function handleIncreaseFontSize() {
    if (currentStepIndex < FONT_SIZE_STEPS.length - 1) {
      onChangeFontSize?.(FONT_SIZE_STEPS[currentStepIndex + 1]);
    }
  }

  return (
    <>
      <a href="#main-content" className="skip-to-content-link">
        {t.nav.skipToContent}
      </a>
      <header className="navbar">
        <div className="navbar-inner container">
          <div className="navbar-brand-section">
            <button
              type="button"
              className="brand-btn"
              onClick={() => onNavigate('home')}
              aria-label={t.appName}
            >
              <span className="brand-icon">
                <ReviLogo size={36} />
              </span>
              <span className="brand-text">{t.appName}</span>
            </button>
          </div>

          <nav className="nav-links" aria-label="Primary Navigation">
            <button
              type="button"
              className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate('home')}
            >
              <BookOpen size={16} />
              <span className="nav-link-label">{t.nav.home}</span>
            </button>
            <button
              type="button"
              className={`nav-link ${currentView === 'library' ? 'active' : ''}`}
              onClick={() => onNavigate('library')}
            >
              <Library size={16} />
              <span className="nav-link-label">{t.nav.library}</span>
            </button>
            <button
              type="button"
              className={`nav-link ${currentView === 'calendar' ? 'active' : ''}`}
              onClick={() => onNavigate('calendar')}
            >
              <Calendar size={16} />
              <span className="nav-link-label">{t.nav.calendar}</span>
            </button>
            <button
              type="button"
              className={`nav-link ${currentView === 'mockExam' ? 'active' : ''}`}
              onClick={() => onNavigate('mockExam')}
            >
              <ClipboardCheck size={16} />
              <span className="nav-link-label">{t.nav.mockExam}</span>
            </button>
            <button
              type="button"
              className={`nav-link ${currentView === 'formulas' ? 'active' : ''}`}
              onClick={() => onNavigate('formulas')}
            >
              <Sigma size={16} />
              <span className="nav-link-label">{t.nav.formulas}</span>
            </button>
          </nav>

        <div className="navbar-right">
          {/* Primary Action Zone: Timer & Add Material */}
          <div className="navbar-actions-group">
            {/* Cozy Focus / Break Study Timer with Custom Duration */}
            <div className="cozy-timer-wrapper" ref={timerSettingsRef}>
            <div className={`cozy-timer-pill ${isRunning ? 'timer-active' : ''}`}>
              <button
                type="button"
                className="timer-mode-tag"
                onClick={toggleTimerMode}
                title={timerMode === 'focus' ? t.nav.timerFocus : t.nav.timerBreak}
              >
                <Coffee size={13} />
                <span className="timer-mode-label">
                  {timerMode === 'focus' ? t.nav.timerFocus : t.nav.timerBreak}
                </span>
              </button>

              <button
                ref={clockBtnRef}
                type="button"
                className="timer-clock-btn"
                onClick={() => setIsTimerSettingsOpen((prev) => !prev)}
                title={`${t.nav.timerSettingsTitle || (uiLang === 'en' ? 'Study Rhythm' : 'Õpirütm')}: ${timerSettings.focusMinutes}m / ${timerSettings.breakMinutes}m (${uiLang === 'en' ? 'Click to configure or scroll with wheel' : 'Klõpsa või keri hiirerulliga'})`}
              >
                <span className="timer-clock">
                  {mins}:{secs}
                </span>
              </button>

              <button
                type="button"
                className="timer-ctrl-btn"
                onClick={() => setIsRunning((r) => !r)}
                title={isRunning ? t.nav.timerPause : t.nav.timerStart}
                aria-label={isRunning ? t.nav.timerPause : t.nav.timerStart}
              >
                {isRunning ? <Pause size={12} /> : <Play size={12} />}
              </button>

              <button
                type="button"
                className={`timer-ctrl-btn timer-cfg-btn ${
                  isTimerSettingsOpen ? 'active' : ''
                }`}
                onClick={() => setIsTimerSettingsOpen((prev) => !prev)}
                title={t.nav.timerSettingsTitle || (uiLang === 'en' ? 'Study rhythm settings' : 'Õpirütmi seaded')}
                aria-label={t.nav.timerSettingsTitle || (uiLang === 'en' ? 'Study rhythm settings' : 'Õpirütmi seaded')}
                aria-expanded={isTimerSettingsOpen}
              >
                <SlidersHorizontal size={12} />
              </button>

              {(isRunning ||
                secondsLeft !==
                  (timerMode === 'focus'
                    ? timerSettings.focusMinutes
                    : timerSettings.breakMinutes) *
                    60) && (
                <button
                  type="button"
                  className="timer-ctrl-btn"
                  onClick={resetTimer}
                  title={t.nav.timerReset}
                  aria-label={t.nav.timerReset}
                >
                  <RotateCcw size={12} />
                </button>
              )}
            </div>

            {/* Revi akadeemiline õpirütmi paneel */}
            {isTimerSettingsOpen && (
              <div
                className="timer-settings-popover"
                role="dialog"
                aria-label={uiLang === 'en' ? 'Study rhythm settings' : 'Õpirütmi seaded'}
              >
                <div className="timer-settings-header">
                  <div className="timer-header-title-box">
                    <span className="timer-settings-title">
                      {uiLang === 'en' ? 'Study Rhythm' : 'Õpirütm'}
                    </span>
                    <span className="timer-settings-sub">
                      {uiLang === 'en' ? 'Choose your pacing or customize freely' : 'Vali sobiv tempo või kohanda vabalt'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="icon-btn-xs"
                    onClick={() => setIsTimerSettingsOpen(false)}
                    aria-label={uiLang === 'en' ? 'Close' : 'Sulge'}
                  >
                    ✕
                  </button>
                </div>

                {/* 3 Akadeemilist põhirütmi */}
                <div className="timer-rhythm-presets">
                  <button
                    type="button"
                    className={`timer-rhythm-card ${
                      timerSettings.focusMinutes === 25 &&
                      timerSettings.breakMinutes === 5
                        ? 'active'
                        : ''
                    }`}
                    onClick={() => updateDurations(25, 5)}
                  >
                    <div className="rhythm-card-header">
                      <strong>{uiLang === 'en' ? 'Classic' : 'Klassikaline'}</strong>
                      <span className="rhythm-tag">25 / 5 min</span>
                    </div>
                    <span className="rhythm-desc">
                      {uiLang === 'en'
                        ? 'Great for quick reviews and holding focus'
                        : 'Hea lühikeseks kordamiseks ja fookuse hoidmiseks'}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`timer-rhythm-card ${
                      timerSettings.focusMinutes === 50 &&
                      timerSettings.breakMinutes === 10
                        ? 'active'
                        : ''
                    }`}
                    onClick={() => updateDurations(50, 10)}
                  >
                    <div className="rhythm-card-header">
                      <strong>{uiLang === 'en' ? 'Deep Study' : 'Süvaõpe'}</strong>
                      <span className="rhythm-tag">50 / 10 min</span>
                    </div>
                    <span className="rhythm-desc">
                      {uiLang === 'en'
                        ? 'For longer chapters and problem solving'
                        : 'Pikemate peatükkide ja ülesannete lahendamiseks'}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`timer-rhythm-card ${
                      timerSettings.focusMinutes === 90 &&
                      timerSettings.breakMinutes === 15
                        ? 'active'
                        : ''
                    }`}
                    onClick={() => updateDurations(90, 15)}
                  >
                    <div className="rhythm-card-header">
                      <strong>{uiLang === 'en' ? 'Lecture Rhythm' : 'Loengurütm'}</strong>
                      <span className="rhythm-tag">90 / 15 min</span>
                    </div>
                    <span className="rhythm-desc">
                      {uiLang === 'en'
                        ? 'Academic double block for extensive materials'
                        : 'Akadeemiline paaristund mahukate materjalide läbitöötamiseks'}
                    </span>
                  </button>
                </div>

                {/* Kohanda minutid */}
                <div className="timer-stepper-section">
                  <div className="timer-stepper-row">
                    <div className="stepper-label-box">
                      <span className="stepper-title">{uiLang === 'en' ? 'Focus time' : 'Õppimine'}</span>
                      <span className="stepper-meta">{uiLang === 'en' ? 'Study session' : 'Fookusaeg'}</span>
                    </div>
                    <div className="stepper-controls">
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => stepFocus(-5)}
                        aria-label={uiLang === 'en' ? 'Decrease 5 minutes' : 'Vähenda 5 minutit'}
                      >
                        −5m
                      </button>
                      <span className="stepper-value">{timerSettings.focusMinutes}m</span>
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => stepFocus(5)}
                        aria-label={uiLang === 'en' ? 'Increase 5 minutes' : 'Suurenda 5 minutit'}
                      >
                        +5m
                      </button>
                    </div>
                  </div>

                  <div className="timer-stepper-row">
                    <div className="stepper-label-box">
                      <span className="stepper-title">{uiLang === 'en' ? 'Break' : 'Paus'}</span>
                      <span className="stepper-meta">{uiLang === 'en' ? 'Rest time' : 'Puhkehetk'}</span>
                    </div>
                    <div className="stepper-controls">
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => stepBreak(-1)}
                        aria-label={uiLang === 'en' ? 'Decrease 1 minute' : 'Vähenda 1 minut'}
                      >
                        −1m
                      </button>
                      <span className="stepper-value">{timerSettings.breakMinutes}m</span>
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => stepBreak(1)}
                        aria-label={uiLang === 'en' ? 'Increase 1 minute' : 'Suurenda 1 minut'}
                      >
                        +1m
                      </button>
                    </div>
                  </div>
                </div>

                <div className="timer-hint-caption">
                  <Info size={12} className="inline-icon" />
                  <span>
                    {uiLang === 'en'
                      ? 'Tip: scroll with the mouse wheel on the clock to adjust time directly.'
                      : 'Nipp: kellaajal hiirerulliga kerides saab aega muuta otse päisest.'}
                  </span>
                </div>

                {onOpenQuickStudy && (
                  <div className="timer-quick-study-action mt-2">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm btn-full"
                      onClick={() => {
                        setIsTimerSettingsOpen(false);
                        onOpenQuickStudy(15);
                      }}
                    >
                      <Zap size={13} />
                      <span>{uiLang === 'en' ? 'Start 15-min Quick Study' : 'Alusta 15 min kiirõpet'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {onOpenErrorNotebook && (
            <button
              type="button"
              className="nav-error-notebook-btn"
              onClick={onOpenErrorNotebook}
              title={uiLang === 'en' ? 'Mistake Journal' : 'Vigade märkmik'}
              aria-label={uiLang === 'en' ? 'Mistake Journal' : 'Vigade märkmik'}
            >
              <BookmarkPlus size={15} />
              <span className="nav-tool-label">{uiLang === 'en' ? 'Mistakes' : 'Vead'}</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary nav-add-btn"
            onClick={() => onOpenUploadModal()}
            title={t.nav.addMaterial}
            aria-label={t.nav.addMaterial}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="nav-add-label">{t.nav.addMaterial}</span>
          </button>
        </div>

        {/* Utilities & Preferences Hub */}
        <div className="navbar-tools-group">
          <button
            type="button"
            className="privacy-device-pill"
            onClick={onOpenPrivacyModal}
            title={t.privacy?.modalTitle}
          >
            <ShieldCheck size={15} className="privacy-shield-icon" />
            <span className="privacy-device-label">
              {activeProfileName || t.privacy?.navBadge || 'Privaatne'}
            </span>
          </button>

          <div className="nav-pref-hub" role="region" aria-label="Eelistused ja ligipääsetavus">
            <div
              className="lang-switcher"
              role="group"
              aria-label={t.nav.langSwitch}
            >
              <button
                type="button"
                className={`lang-btn ${uiLang === 'et' ? 'active' : ''}`}
                onClick={() => onChangeLang('et')}
                aria-pressed={uiLang === 'et'}
              >
                ET
              </button>
              <button
                type="button"
                className={`lang-btn ${uiLang === 'en' ? 'active' : ''}`}
                onClick={() => onChangeLang('en')}
                aria-pressed={uiLang === 'en'}
              >
                EN
              </button>
            </div>

            <div className="nav-pref-divider" aria-hidden="true" />

            <button
              type="button"
              className="theme-toggle-btn"
              onClick={onToggleTheme}
              title={theme === 'light' ? t.nav.darkMode : t.nav.lightMode}
              aria-label={theme === 'light' ? t.nav.darkMode : t.nav.lightMode}
            >
              <Sun
                size={16}
                className={`theme-icon sun-icon ${theme === 'light' ? 'active' : ''}`}
              />
              <Moon
                size={16}
                className={`theme-icon moon-icon ${theme === 'dark' ? 'active' : ''}`}
              />
            </button>

            <div className="nav-pref-divider" aria-hidden="true" />

            {/* Teksti suurendamise ja vähendamise stepper vaevnägijatele ja kohandamiseks */}
            <div
              className="font-size-stepper"
              role="group"
              aria-label={t.nav?.textSize || 'Teksti suurus'}
            >
              <button
                type="button"
                className="font-step-btn"
                onClick={handleDecreaseFontSize}
                disabled={currentStepIndex <= 0}
                title={
                  uiLang === 'en'
                    ? 'Make text smaller (−)'
                    : 'Tee tekst väiksemaks (−)'
                }
                aria-label={
                  uiLang === 'en' ? 'Make text smaller' : 'Tee tekst väiksemaks'
                }
              >
                <Minus size={13} strokeWidth={2.4} />
              </button>

              <button
                type="button"
                className={`font-size-indicator ${currentPercent !== 100 ? 'custom-size' : ''}`}
                onClick={() => onChangeFontSize?.(100)}
                title={
                  uiLang === 'en'
                    ? `Text size: ${currentPercent}%. Click to reset to 100%`
                    : `Teksti suurus: ${currentPercent}%. Klõpsa, et lähtestada 100% peale`
                }
                aria-label={`${t.nav?.textSize || 'Teksti suurus'}: ${currentPercent}%`}
              >
                <Type size={14} />
                <span className="font-size-tag">{currentPercent}%</span>
              </button>

              <button
                type="button"
                className="font-step-btn"
                onClick={handleIncreaseFontSize}
                disabled={currentStepIndex >= FONT_SIZE_STEPS.length - 1}
                title={
                  uiLang === 'en'
                    ? 'Make text larger (+)'
                    : 'Tee tekst suuremaks (+)'
                }
                aria-label={
                  uiLang === 'en' ? 'Make text larger' : 'Tee tekst suuremaks'
                }
              >
                <Plus size={13} strokeWidth={2.4} />
              </button>
            </div>

            <div className="nav-pref-divider" aria-hidden="true" />

            {/* Vaevnägijate vaade (kõrge kontrast) */}
            <button
              type="button"
              className={`a11y-action-btn ${highContrast ? 'active' : ''}`}
              onClick={onToggleHighContrast}
              title={highContrast ? t.nav.highContrastOn : t.nav.highContrast}
              aria-label={highContrast ? t.nav.highContrastOn : t.nav.highContrast}
              aria-pressed={highContrast}
            >
              <Eye size={16} />
              <span className="sr-only">
                {highContrast ? t.nav.highContrastOn : t.nav.highContrastOff}
              </span>
            </button>

            <div className="nav-pref-divider" aria-hidden="true" />

            {/* Klaviatuuri kiirklahvide nupp */}
            <button
              type="button"
              className="shortcuts-hub-btn"
              onClick={onOpenShortcutsModal}
              title={uiLang === 'en' ? 'Keyboard shortcuts (?)' : 'Klaviatuuri kiirklahvid (?)'}
              aria-label={uiLang === 'en' ? 'Keyboard shortcuts' : 'Klaviatuuri kiirklahvid'}
            >
              <Keyboard size={16} />
              <span className="shortcuts-k-badge">?</span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </header>
    </>
  );
}
