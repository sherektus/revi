import React from 'react';
import { X, Keyboard } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose, t }) {
  if (!isOpen) return null;

  const shortcutsList = [
    { key: 'H', label: 'Avaleht', desc: 'Liigu kohe avalehele' },
    { key: 'L', label: 'Minu teek', desc: 'Ava õppematerjalide teek' },
    { key: 'C', label: 'Kalender', desc: 'Ava kordamiskalender ja õpiplaanid' },
    { key: 'M', label: 'Proovitöö', desc: 'Ava eksami ja proovitööde keskkond' },
    { key: 'F', label: 'Valemileht', desc: 'Ava teaduslik valemikogu ja reeglid' },
    { key: 'T', label: 'Hele / tume režiim', desc: 'Vaheta silmasõbraliku teema vahel' },
    { key: 'Space', label: 'Pööra mälukaart', desc: 'Pööra aktiivne kaart küsimuse ja vastuse vahel' },
    { key: 'K või 2', label: 'Tean vastust', desc: 'Märgi mälukaart selgeks (+1 punkt)' },
    { key: 'R või 1', label: 'Vajab kordamist', desc: 'Märgi mälukaart uuesti kordamisele' },
    { key: '← / →', label: 'Eelmine / järgmine', desc: 'Liigu eelmise või järgmise mälukaardi juurde' },
    { key: '1, 2, 3, 4', label: 'Vali vastusevariant', desc: 'Vali harjutuses variant A, B, C või D' },
    { key: 'Enter', label: 'Kinnita / Järgmine', desc: 'Liigu harjutustes järgmise küsimuse juurde' },
    { key: '?', label: 'Kiirklahvid', desc: 'Ava või sulge see otseteede aken' },
    { key: 'Esc', label: 'Sulge aken', desc: 'Sulge mistahes aktiivne dialoogiaken' }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="shortcuts-modal-title">
      <div className="modal-content shortcuts-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <div className="shortcuts-header-icon">
              <Keyboard size={20} />
            </div>
            <div>
              <h2 id="shortcuts-modal-title" className="modal-title">Klaviatuuri kiirklahvid</h2>
              <p className="modal-subtitle">Õpi ja korda kiiremini ilma hiirt kasutamata</p>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Sulge">
            <X size={18} />
          </button>
        </div>

        <div className="shortcuts-table-container">
          <div className="shortcuts-grid">
            {shortcutsList.map((item, idx) => (
              <div key={idx} className="shortcut-row">
                <div className="shortcut-key-badge">
                  <kbd>{item.key}</kbd>
                </div>
                <div className="shortcut-info">
                  <strong className="shortcut-label">{item.label}</strong>
                  <span className="shortcut-desc">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            <span>Selge, sain aru</span>
          </button>
        </div>
      </div>
    </div>
  );
}
