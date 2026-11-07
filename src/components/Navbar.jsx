import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Library,
  Calendar,
  ClipboardCheck,
  Sigma,
  Plus,
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
  SlidersHorizontal
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
  onOpenPrivacyModal
}) {
  const [timerSettings, setTimerSettings] = useState(() => loadTimerSettings());
  const [isTimerSettingsOpen, setIsTimerSettingsOpen] = useState(false);
  const timerSettingsRef = useRef(null);

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

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  function cycleFontSize() {
    if (fontSize === 'normal') onChangeFontSize?.('large');
    else if (fontSize === 'large') onChangeFontSize?.('xlarge');
    else onChangeFontSize?.('normal');
  }

  const fontSizeLabel =
    fontSize === 'xlarge'
      ? t.nav.textSizeXLarge
      : fontSize === 'large'
      ? t.nav.textSizeLarge
      : t.nav.textSizeNormal;

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
                <Layers size={19} strokeWidth={2.2} />
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
                type="button"
                className="timer-clock-btn"
                onClick={() => setIsTimerSettingsOpen((prev) => !prev)}
                title={t.nav.timerSettingsTitle || 'Muuda õppimise ja pausi kestvust'}
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
                title={t.nav.timerSettingsTitle || 'Kestvuse seaded'}
                aria-label={t.nav.timerSettingsTitle}
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

            {/* Custom duration popover */}
            {isTimerSettingsOpen && (
              <div
                className="timer-settings-popover"
                role="dialog"
                aria-label={t.nav.timerSettingsTitle}
              >
                <div className="timer-settings-header">
                  <span className="timer-settings-title">
                    {t.nav.timerSettingsTitle}
                  </span>
                  <button
                    type="button"
                    className="icon-btn-xs"
                    onClick={() => setIsTimerSettingsOpen(false)}
                    aria-label="Sulge"
                  >
                    ✕
                  </button>
                </div>

                {/* Õppimise kestvus */}
                <div className="timer-duration-section">
                  <div className="timer-duration-label-row">
                    <span>{t.nav.timerFocusDuration}</span>
                    <strong className="timer-active-val">
                      {timerSettings.focusMinutes} min
                    </strong>
                  </div>
                  <div className="timer-presets-row">
                    {[15, 20, 25, 30, 45, 60].map((mVal) => (
                      <button
                        key={mVal}
                        type="button"
                        className={`timer-preset-btn ${
                          timerSettings.focusMinutes === mVal ? 'active' : ''
                        }`}
                        onClick={() =>
                          updateDurations(mVal, timerSettings.breakMinutes)
                        }
                      >
                        {mVal}m
                      </button>
                    ))}
                  </div>
                  <div className="timer-custom-input-row">
                    <label htmlFor="custom-focus-input">
                      {t.nav.timerCustom || 'Määra ise'}:
                    </label>
                    <input
                      id="custom-focus-input"
                      type="number"
                      min="1"
                      max="180"
                      value={timerSettings.focusMinutes}
                      onChange={(e) =>
                        updateDurations(
                          e.target.value,
                          timerSettings.breakMinutes
                        )
                      }
                      className="timer-number-input"
                    />
                    <span>min</span>
                  </div>
                </div>

                {/* Pausi kestvus */}
                <div className="timer-duration-section mt-2">
                  <div className="timer-duration-label-row">
                    <span>{t.nav.timerBreakDuration}</span>
                    <strong className="timer-active-val">
                      {timerSettings.breakMinutes} min
                    </strong>
                  </div>
                  <div className="timer-presets-row">
                    {[3, 5, 10, 15, 20].map((bVal) => (
                      <button
                        key={bVal}
                        type="button"
                        className={`timer-preset-btn ${
                          timerSettings.breakMinutes === bVal ? 'active' : ''
                        }`}
                        onClick={() =>
                          updateDurations(timerSettings.focusMinutes, bVal)
                        }
                      >
                        {bVal}m
                      </button>
                    ))}
                  </div>
                  <div className="timer-custom-input-row">
                    <label htmlFor="custom-break-input">
                      {t.nav.timerCustom || 'Määra ise'}:
                    </label>
                    <input
                      id="custom-break-input"
                      type="number"
                      min="1"
                      max="60"
                      value={timerSettings.breakMinutes}
                      onChange={(e) =>
                        updateDurations(
                          timerSettings.focusMinutes,
                          e.target.value
                        )
                      }
                      className="timer-number-input"
                    />
                    <span>min</span>
                  </div>
                </div>
              </div>
            )}
          </div>

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

          <button
            type="button"
            className="btn btn-primary btn-sm nav-add-btn"
            onClick={() => onOpenUploadModal()}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="nav-add-label">{t.nav.addMaterial}</span>
          </button>

          <div className="nav-controls-group">
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

            {/* Teksti suurendamise nupp vaevnägijatele ja mugavaks lugemiseks */}
            <button
              type="button"
              className={`a11y-action-btn ${fontSize !== 'normal' ? 'active' : ''}`}
              onClick={cycleFontSize}
              title={`${t.nav.textSize}: ${fontSizeLabel}`}
              aria-label={`${t.nav.textSize}: ${fontSizeLabel}`}
            >
              <Type size={14} />
              <span className="font-size-tag">
                {fontSize === 'xlarge' ? '130%' : fontSize === 'large' ? '115%' : '100%'}
              </span>
            </button>

            {/* Vaevnägijate vaade (kõrge kontrast) */}
            <button
              type="button"
              className={`a11y-action-btn ${highContrast ? 'active' : ''}`}
              onClick={onToggleHighContrast}
              title={highContrast ? t.nav.highContrastOn : t.nav.highContrast}
              aria-label={highContrast ? t.nav.highContrastOn : t.nav.highContrast}
              aria-pressed={highContrast}
            >
              <Eye size={15} />
              <span className="sr-only">
                {highContrast ? t.nav.highContrastOn : t.nav.highContrastOff}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
