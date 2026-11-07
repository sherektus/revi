import React from 'react';
import { X, Keyboard, Compass, Layers, Sparkles } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose, t }) {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      id: 'navigation',
      title: 'Liikumine ja vaated',
      icon: <Compass size={14} />,
      items: [
        { keys: ['H'], label: 'Avaleht', desc: 'Liigu kohe avalehele ja ülevaatesse' },
        { keys: ['L'], label: 'Minu teek', desc: 'Ava õppematerjalide kogumik ja kaustad' },
        { keys: ['C'], label: 'Kalender', desc: 'Ava kordamiskalender ja õpiplaanid' },
        { keys: ['M'], label: 'Proovitöö', desc: 'Ava eksamite ja proovitööde keskkond' },
        { keys: ['F'], label: 'Valemileht', desc: 'Ava teaduslik valemikogu ja reeglid' },
        { keys: ['T'], label: 'Hele / tume režiim', desc: 'Vaheta silmasõbraliku teema vahel' }
      ]
    },
    {
      id: 'study',
      title: 'Mälukaardid ja harjutused',
      icon: <Layers size={14} />,
      items: [
        { keys: ['Space'], label: 'Pööra mälukaart', desc: 'Pööra aktiivne kaart küsimuse ja vastuse vahel' },
        { keys: ['K', '2'], label: 'Tean vastust', desc: 'Märgi mälukaart selgeks (+1 punkt)' },
        { keys: ['R', '1'], label: 'Vajab kordamist', desc: 'Märgi mälukaart uuesti kordamisele' },
        { keys: ['←', '→'], label: 'Eelmine / järgmine', desc: 'Liigu kaartide vahel nooleklahvidega' },
        { keys: ['1', '2', '3', '4'], label: 'Vali vastusevariant', desc: 'Vali harjutuses variant A, B, C või D' },
        { keys: ['Enter'], label: 'Kinnita vastus', desc: 'Kontrolli harjutuse vastust ja liigu edasi' }
      ]
    },
    {
      id: 'general',
      title: 'Üldised kiirklahvid',
      icon: <Sparkles size={14} />,
      items: [
        { keys: ['?'], label: 'Kiirklahvid', desc: 'Ava või sulge see abistav otseteede aken' },
        { keys: ['Esc'], label: 'Sulge aken', desc: 'Sulge mistahes aktiivne dialoogiaken või hüpik' }
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
                Klaviatuuri kiirklahvid
              </h2>
              <p className="modal-subtitle">
                Õpi ja korda kiiremini ilma hiirt kasutamata
              </p>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Sulge"
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
            <span>Selge, sain aru</span>
          </button>
        </div>
      </div>
    </div>
  );
}
