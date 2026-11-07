import React from 'react';
import { X, Keyboard, Compass, Layers, Sliders } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose, t, uiLang }) {
  if (!isOpen) return null;

  const isEN = uiLang === 'en';

  const shortcutGroups = [
    {
      id: 'navigation',
      title: isEN ? 'Navigation & Views' : 'Liikumine ja vaated',
      icon: <Compass size={14} />,
      items: [
        { keys: ['H'], label: isEN ? 'Home' : 'Avaleht', desc: isEN ? 'Jump to home dashboard & overview' : 'Liigu kohe avalehele ja ülevaatesse' },
        { keys: ['L'], label: isEN ? 'Library' : 'Minu teek', desc: isEN ? 'Open study materials & folders' : 'Ava õppematerjalide kogumik ja kaustad' },
        { keys: ['C'], label: isEN ? 'Calendar' : 'Kalender', desc: isEN ? 'Open review calendar & study plans' : 'Ava kordamiskalender ja õpiplaanid' },
        { keys: ['M'], label: isEN ? 'Mock Exam' : 'Proovitöö', desc: isEN ? 'Open exam simulator & timed tests' : 'Ava eksamite ja proovitööde keskkond' },
        { keys: ['F'], label: isEN ? 'Formulas' : 'Valemileht', desc: isEN ? 'Open scientific formulas & theorems' : 'Ava teaduslik valemikogu ja reeglid' },
        { keys: ['T'], label: isEN ? 'Theme Toggle' : 'Hele / tume režiim', desc: isEN ? 'Switch between light and dark themes' : 'Vaheta silmasõbraliku teema vahel' }
      ]
    },
    {
      id: 'study',
      title: isEN ? 'Flashcards & Practice' : 'Mälukaardid ja harjutused',
      icon: <Layers size={14} />,
      items: [
        { keys: ['Space'], label: isEN ? 'Flip flashcard' : 'Pööra mälukaart', desc: isEN ? 'Flip active card between question and answer' : 'Pööra aktiivne kaart küsimuse ja vastuse vahel' },
        { keys: ['K', '2'], label: isEN ? 'Knew it' : 'Tean vastust', desc: isEN ? 'Mark card mastered (+1 point)' : 'Märgi mälukaart selgeks (+1 punkt)' },
        { keys: ['R', '1'], label: isEN ? 'Need review' : 'Vajab kordamist', desc: isEN ? 'Flag card for another review' : 'Märgi mälukaart uuesti kordamisele' },
        { keys: ['←', '→'], label: isEN ? 'Prev / Next' : 'Eelmine / järgmine', desc: isEN ? 'Navigate cards with arrow keys' : 'Liigu kaartide vahel nooleklahvidega' },
        { keys: ['1', '2', '3', '4'], label: isEN ? 'Choose option' : 'Vali vastusevariant', desc: isEN ? 'Pick option A, B, C, or D in exercises' : 'Vali harjutuses variant A, B, C või D' },
        { keys: ['Enter'], label: isEN ? 'Confirm & next' : 'Kinnita vastus', desc: isEN ? 'Check exercise answer and advance' : 'Kontrolli harjutuse vastust ja liigu edasi' }
      ]
    },
    {
      id: 'general',
      title: isEN ? 'General Shortcuts' : 'Üldised kiirklahvid',
      icon: <Sliders size={14} />,
      items: [
        { keys: ['?'], label: isEN ? 'Shortcuts help' : 'Kiirklahvid', desc: isEN ? 'Toggle this keyboard shortcut helper' : 'Ava või sulge see abistav otseteede aken' },
        { keys: ['Esc'], label: isEN ? 'Close modal' : 'Sulge aken', desc: isEN ? 'Close any open dialog or popup' : 'Sulge mistahes aktiivne dialoogiaken või hüpik' }
      ]
    }
  ];

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div
        className="modal-card shortcuts-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-circle shortcuts-icon-circle">
              <Keyboard size={20} />
            </div>
            <div>
              <h2 id="shortcuts-modal-title" className="modal-title">
                {isEN ? 'Keyboard Shortcuts' : 'Klaviatuuri kiirklahvid'}
              </h2>
              <p className="modal-subtitle">
                {isEN
                  ? 'Study and review faster without touching the mouse'
                  : 'Õpi ja korda kiiremini ilma hiirt kasutamata'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label={isEN ? 'Close' : 'Sulge'}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body shortcuts-body">
          {shortcutGroups.map((group) => (
            <section key={group.id} className="shortcuts-group">
              <div className="shortcuts-group-header">
                <span className="shortcuts-group-icon">{group.icon}</span>
                <span className="shortcuts-group-title">{group.title}</span>
              </div>
              <div className="shortcuts-group-items">
                {group.items.map((item, idx) => (
                  <div key={idx} className="shortcut-row">
                    <div className="shortcut-info">
                      <strong className="shortcut-label">{item.label}</strong>
                      <span className="shortcut-desc">{item.desc}</span>
                    </div>
                    <div className="shortcut-key-badge">
                      {item.keys.map((k, ki) => (
                        <React.Fragment key={ki}>
                          {ki > 0 && <span className="shortcut-key-sep">/</span>}
                          <kbd>{k}</kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="modal-footer shortcuts-footer">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onClose}
          >
            <span>{isEN ? 'Got it' : 'Selge, sain aru'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
