import React, { useState, useEffect } from 'react';
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
  Eye
} from 'lucide-react';

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
  const [timerMode, setTimerMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const nextMode = timerMode === 'focus' ? 'break' : 'focus';
          setTimerMode(nextMode);
          setIsRunning(false);
          return nextMode === 'focus' ? 25 * 60 : 5 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, timerMode]);

  function toggleTimerMode() {
    const nextMode = timerMode === 'focus' ? 'break' : 'focus';
    setTimerMode(nextMode);
    setIsRunning(false);
    setSecondsLeft(nextMode === 'focus' ? 25 * 60 : 5 * 60);
  }

  function resetTimer() {
    setIsRunning(false);
    setSecondsLeft(timerMode === 'focus' ? 25 * 60 : 5 * 60);
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
        <div className="navbar-left">
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

          <nav className="nav-links" aria-label="Primary Navigation">
            <button
              type="button"
              className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate('home')}
            >
              <BookOpen size={16} />
              <span>{t.nav.home}</span>
            </button>
            <button
              type="button"
              className={`nav-link ${currentView === 'library' ? 'active' : ''}`}
              onClick={() => onNavigate('library')}
            >
              <Library size={16} />
              <span>{t.nav.library}</span>
            </button>
            <button
              type="button"
              className={`nav-link ${currentView === 'calendar' ? 'active' : ''}`}
              onClick={() => onNavigate('calendar')}
            >
              <Calendar size={16} />
              <span>{t.nav.calendar}</span>
            </button>
            <button
              type="button"
              className={`nav-link ${currentView === 'mockExam' ? 'active' : ''}`}
              onClick={() => onNavigate('mockExam')}
            >
              <ClipboardCheck size={16} />
              <span>{t.nav.mockExam}</span>
            </button>
            <button
              type="button"
              className={`nav-link ${currentView === 'formulas' ? 'active' : ''}`}
              onClick={() => onNavigate('formulas')}
            >
              <Sigma size={16} />
              <span>{t.nav.formulas}</span>
            </button>
          </nav>
        </div>

        <div className="navbar-right">
          {/* Cozy Focus / Break Study Timer */}
          <div className={`cozy-timer-pill ${isRunning ? 'timer-active' : ''}`}>
            <button
              type="button"
              className="timer-mode-tag"
              onClick={toggleTimerMode}
              title={
                timerMode === 'focus' ? t.nav.timerFocus : t.nav.timerBreak
              }
            >
              <Coffee size={13} />
              <span>
                {timerMode === 'focus' ? t.nav.timerFocus : t.nav.timerBreak}
              </span>
            </button>
            <span className="timer-clock">
              {mins}:{secs}
            </span>
            <button
              type="button"
              className="timer-ctrl-btn"
              onClick={() => setIsRunning((r) => !r)}
              title={isRunning ? t.nav.timerPause : t.nav.timerStart}
              aria-label={isRunning ? t.nav.timerPause : t.nav.timerStart}
            >
              {isRunning ? <Pause size={12} /> : <Play size={12} />}
            </button>
            {(isRunning ||
              secondsLeft !== (timerMode === 'focus' ? 25 * 60 : 5 * 60)) && (
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

          <button
            type="button"
            className="privacy-device-pill"
            onClick={onOpenPrivacyModal}
            title={t.privacy?.modalTitle}
          >
            <ShieldCheck size={15} className="privacy-shield-icon" />
            <span>{activeProfileName || t.privacy?.navBadge || 'Privaatne'}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm nav-add-btn"
            onClick={() => onOpenUploadModal()}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{t.nav.addMaterial}</span>
          </button>

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
              size={17}
              className={`theme-icon sun-icon ${theme === 'light' ? 'active' : ''}`}
            />
            <Moon
              size={17}
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
    </header>
    </>
  );
}
