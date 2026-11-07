import React, { useState, useRef } from 'react';
import {
  X,
  ShieldCheck,
  Monitor,
  UserCheck,
  Plus,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  Lock
} from 'lucide-react';
import {
  getOrCreateDeviceId,
  exportPersonalWorkspace,
  importPersonalWorkspace,
  clearActiveProfileMaterials
} from '../utils/storage';

export default function PersonalWorkspaceModal({
  isOpen,
  t,
  profiles,
  activeProfileId,
  onSwitchProfile,
  onCreateProfile,
  onDeleteProfile,
  onWorkspaceDataChanged,
  onClose
}) {
  const [newProfileName, setNewProfileName] = useState('');
  const importFileInputRef = useRef(null);

  if (!isOpen) return null;

  const deviceId = getOrCreateDeviceId();
  const pt = t.privacy || {};

  function handleCreateProfile(e) {
    e.preventDefault();
    const trimmed = newProfileName.trim();
    if (!trimmed) return;
    onCreateProfile(trimmed);
    setNewProfileName('');
  }

  function handleExport() {
    const data = exportPersonalWorkspace();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revi-backup-${deviceId.toLowerCase()}-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      importPersonalWorkspace(parsed);
      onWorkspaceDataChanged('importSuccess');
    } catch (err) {
      console.error('Failed to import workspace backup:', err);
    } finally {
      e.target.value = '';
    }
  }

  async function handleClearDeviceMaterials() {
    if (!window.confirm(pt.clearDeviceConfirm)) return;
    await clearActiveProfileMaterials();
    onWorkspaceDataChanged('cleared');
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card upload-modal personal-workspace-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="personal-workspace-title"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge">
              <ShieldCheck size={19} />
            </span>
            <div>
              <h2 id="personal-workspace-title">{pt.modalTitle}</h2>
              <p className="modal-subtitle-caption">{pt.modalSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label={pt.closeBtn}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Privacy Guarantee Box */}
          <div className="privacy-guarantee-card">
            <div className="privacy-guarantee-header">
              <Lock size={16} />
              <strong>{pt.guaranteeTitle}</strong>
            </div>
            <ul className="privacy-guarantee-list">
              <li>{pt.guaranteePoint1}</li>
              <li>{pt.guaranteePoint2}</li>
              <li>{pt.guaranteePoint3}</li>
            </ul>
            <div className="device-id-pill-row">
              <span className="device-id-label">
                <Monitor size={14} />
                <span>{pt.deviceIdLabel}:</span>
              </span>
              <code className="device-id-code">{deviceId}</code>
            </div>
          </div>

          {/* Personal Profiles on This Computer */}
          <div className="form-group">
            <label className="form-label">
              <UserCheck size={15} />
              <span>{pt.activeProfileLabel}</span>
            </label>

            <div className="personal-profiles-list">
              {(profiles || []).map((prof) => {
                const isActive = prof.id === activeProfileId;
                const displayName =
                  prof.id === 'default' && prof.isDefault
                    ? pt.defaultProfileName || prof.name
                    : prof.name;
                return (
                  <div
                    key={prof.id}
                    className={`personal-profile-row ${
                      isActive ? 'active' : ''
                    }`}
                  >
                    <div className="profile-row-left">
                      <CheckCircle2
                        size={16}
                        className={isActive ? 'accent-text' : 'muted-icon'}
                      />
                      <strong>{displayName}</strong>
                      {isActive && (
                        <span className="badge badge-sample">
                          {pt.activeBadge}
                        </span>
                      )}
                    </div>

                    <div className="profile-row-actions">
                      {!isActive && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onSwitchProfile(prof.id)}
                        >
                          {pt.switchProfileBtn}
                        </button>
                      )}
                      {prof.id !== 'default' && !isActive && (
                        <button
                          type="button"
                          className="icon-btn danger-btn"
                          onClick={() => onDeleteProfile(prof.id)}
                          title={pt.deleteProfileBtn}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={handleCreateProfile}
              className="new-profile-form mt-2"
            >
              <input
                type="text"
                className="form-input"
                placeholder={pt.newProfilePlaceholder}
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-secondary btn-sm"
                disabled={!newProfileName.trim()}
              >
                <Plus size={15} />
                <span>{pt.createProfileBtn}</span>
              </button>
            </form>
          </div>

          {/* Backup & Clear Section */}
          <div className="form-group">
            <label className="form-label">{pt.backupSectionTitle}</label>
            <p className="form-hint">{pt.backupSectionDesc}</p>

            <div className="backup-actions-row mt-2">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleExport}
              >
                <Download size={15} />
                <span>{pt.exportBtn}</span>
              </button>

              <input
                ref={importFileInputRef}
                type="file"
                accept=".json,application/json"
                className="sr-only"
                onChange={handleImportFile}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => importFileInputRef.current?.click()}
              >
                <Upload size={15} />
                <span>{pt.importBtn}</span>
              </button>
            </div>
          </div>

          <div className="modal-footer privacy-modal-footer">
            <button
              type="button"
              className="btn btn-ghost btn-sm danger-text-btn"
              onClick={handleClearDeviceMaterials}
            >
              <Trash2 size={15} />
              <span>{pt.clearDeviceBtn}</span>
            </button>

            <button type="button" className="btn btn-primary" onClick={onClose}>
              {pt.closeBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
