import React from 'react';
import { BookOpen, Library, Plus, Sun, Moon, Layers } from 'lucide-react';

export default function Navbar({
  t,
  uiLang,
  onChangeLang,
  theme,
  onToggleTheme,
  currentView,
  onNavigate,
  onOpenUploadModal
}) {
  return (
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
              <Layers size={20} strokeWidth={2.3} />
            </span>
            <span className="brand-text">{t.appName}</span>
          </button>

          <nav className="nav-links" aria-label="Primary Navigation">
            <button
              type="button"
              className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate('home')}
            >
              <BookOpen size={17} />
              <span>{t.nav.home}</span>
            </button>
            <button
              type="button"
              className={`nav-link ${currentView === 'library' ? 'active' : ''}`}
              onClick={() => onNavigate('library')}
            >
              <Library size={17} />
              <span>{t.nav.library}</span>
            </button>
          </nav>
        </div>

        <div className="navbar-right">
          <button
            type="button"
            className="btn btn-primary btn-sm nav-add-btn"
            onClick={() => onOpenUploadModal()}
          >
            <Plus size={17} strokeWidth={2.5} />
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
              size={18}
              className={`theme-icon sun-icon ${theme === 'light' ? 'active' : ''}`}
            />
            <Moon
              size={18}
              className={`theme-icon moon-icon ${theme === 'dark' ? 'active' : ''}`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
