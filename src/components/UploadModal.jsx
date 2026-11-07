import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Globe,
  BookOpen,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { parseUploadedFile } from '../utils/fileParser';
import { generateStudyContent } from '../utils/contentGenerator';
import { DEFAULT_ENABLED_FEATURES } from '../data/sampleMaterial';

export default function UploadModal({
  isOpen,
  initialFile,
  uiLang,
  t,
  existingSubjects,
  onClose,
  onMaterialCreated
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Matemaatiline analüüs');
  const [customSubject, setCustomSubject] = useState('');
  const [contentLang, setContentLang] = useState(uiLang);
  const [enabledFeatures, setEnabledFeatures] = useState({
    ...DEFAULT_ENABLED_FEATURES
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('reading');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setContentLang(uiLang);
      setErrorMsg('');
      setIsProcessing(false);
      setEnabledFeatures({ ...DEFAULT_ENABLED_FEATURES });
      if (initialFile) {
        handleFileSelection(initialFile);
      } else {
        setSelectedFile(null);
        setTitle('');
      }
    }
  }, [isOpen, initialFile, uiLang]);

  if (!isOpen) return null;

  const subjectOptions = Array.from(
    new Set([...(t.subjects || []), ...(existingSubjects || [])])
  );

  function handleFileSelection(file) {
    if (!file) return;
    setErrorMsg('');
    const ext = (file.name || '').split('.').pop().toLowerCase();
    if (!['pdf', 'pptx', 'txt'].includes(ext)) {
      setErrorMsg(t.upload.errorUnsupported);
      return;
    }
    setSelectedFile(file);
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
    setTitle(baseName);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  }

  function toggleFeature(key) {
    setEnabledFeatures((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedFile) return;

    setErrorMsg('');
    setIsProcessing(true);
    setProcessingStep('reading');

    try {
      const { fileType, pages } = await parseUploadedFile(selectedFile, contentLang);

      if (!pages || pages.length === 0) {
        setErrorMsg(t.upload.errorEmpty);
        setIsProcessing(false);
        return;
      }

      setProcessingStep('segmenting');
      await new Promise((r) => setTimeout(r, 200));

      const finalTitle =
        title.trim() || selectedFile.name.replace(/\.[^/.]+$/, '');
      const isCustom =
        subject === 'Muu õppeaine' || subject === 'Other subject' || subject === '__custom__';
      const finalSubject =
        isCustom && customSubject.trim()
          ? customSubject.trim()
          : subject || 'Matemaatiline analüüs';

      setProcessingStep('generating');
      await new Promise((r) => setTimeout(r, 200));

      const generated = generateStudyContent({
        pages,
        fileType,
        contentLang,
        title: finalTitle
      });

      const now = new Date().toISOString();
      const newMaterial = {
        id: `mat-${Date.now()}`,
        isSample: false,
        title: finalTitle,
        subject: finalSubject,
        fileName: selectedFile.name,
        fileType,
        contentLang,
        createdAt: now,
        lastOpenedAt: now,
        enabledFeatures,
        pages,
        topics: generated.topics,
        flashcards: generated.flashcards,
        exercises: generated.exercises
      };

      await onMaterialCreated(newMaterial, selectedFile);
    } catch (err) {
      console.error('Upload processing error:', err);
      if (err.message === 'UNSUPPORTED_FORMAT') {
        setErrorMsg(t.upload.errorUnsupported);
      } else {
        setErrorMsg(t.upload.errorEmpty);
      }
      setIsProcessing(false);
    }
  }

  const featureKeys = [
    'summary',
    'flashcards',
    'exercises',
    'quickTest',
    'shortCalc',
    'formulaSheet',
    'spacedRepetition',
    'mockExam'
  ];

  return (
    <div className="modal-backdrop" onClick={!isProcessing ? onClose : undefined}>
      <div
        className="modal-card upload-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge">
              <Sparkles size={18} />
            </span>
            <h2 id="upload-modal-title">{t.upload.modalTitle}</h2>
          </div>
          {!isProcessing && (
            <button
              type="button"
              className="icon-btn"
              onClick={onClose}
              aria-label={t.upload.cancelBtn}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {errorMsg && (
            <div className="alert-banner alert-error" role="alert">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {!selectedFile ? (
            <div
              className={`modal-dropzone ${isDragging ? 'dragging' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.pptx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                className="sr-only"
                onChange={(e) => handleFileSelection(e.target.files?.[0])}
              />
              <div className="dropzone-icon-circle">
                <UploadCloud size={28} />
              </div>
              <p className="dropzone-main-text">{t.hero.dropzoneTitle}</p>
              <p className="dropzone-sub-text">{t.hero.dropzoneSubtitle}</p>
              <div className="format-pills">
                <span className="format-pill">PDF</span>
                <span className="format-pill">PPTX</span>
                <span className="format-pill">TXT</span>
              </div>
            </div>
          ) : (
            <div className="selected-file-banner">
              <div className="file-info-left">
                <div className="file-type-avatar">
                  <FileText size={20} />
                </div>
                <div>
                  <span className="file-label-caption">{t.upload.selectedFile}</span>
                  <p className="file-name-strong">{selectedFile.name}</p>
                </div>
              </div>
              {!isProcessing && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setErrorMsg('');
                  }}
                >
                  {t.upload.changeFile}
                </button>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="material-title-input" className="form-label">
              {t.upload.titleLabel}
            </label>
            <input
              id="material-title-input"
              type="text"
              className="form-input"
              placeholder={t.upload.titlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isProcessing}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="material-subject-select" className="form-label">
              <BookOpen size={15} />
              <span>{t.upload.subjectLabel}</span>
            </label>
            <select
              id="material-subject-select"
              className="form-select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isProcessing}
            >
              {subjectOptions.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
            {(subject === 'Muu õppeaine' || subject === 'Other subject') && (
              <input
                type="text"
                className="form-input mt-2"
                placeholder={t.upload.customSubjectPlaceholder}
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                disabled={isProcessing}
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <Globe size={15} />
              <span>{t.upload.contentLangLabel}</span>
            </label>
            <div className="content-lang-selector" role="radiogroup">
              <button
                type="button"
                className={`content-lang-option ${contentLang === 'et' ? 'selected' : ''}`}
                onClick={() => setContentLang('et')}
                disabled={isProcessing}
                aria-checked={contentLang === 'et'}
                role="radio"
              >
                <span className="lang-code-badge">ET</span>
                <span>{t.upload.langET}</span>
                {contentLang === 'et' && <CheckCircle2 size={16} className="lang-check" />}
              </button>
              <button
                type="button"
                className={`content-lang-option ${contentLang === 'en' ? 'selected' : ''}`}
                onClick={() => setContentLang('en')}
                disabled={isProcessing}
                aria-checked={contentLang === 'en'}
                role="radio"
              >
                <span className="lang-code-badge">EN</span>
                <span>{t.upload.langEN}</span>
                {contentLang === 'en' && <CheckCircle2 size={16} className="lang-check" />}
              </button>
            </div>
            <p className="form-hint">{t.upload.contentLangHint}</p>
          </div>

          {/* Per-Material Feature Selection */}
          <div className="form-group">
            <label className="form-label">
              <Sliders size={15} />
              <span>{t.featuresConfig.title}</span>
            </label>
            <p className="form-hint">{t.featuresConfig.subtitle}</p>
            <div className="feature-checkbox-grid">
              {featureKeys.map((fKey) => (
                <label
                  key={fKey}
                  className={`feature-toggle-chip ${
                    enabledFeatures[fKey] ? 'active' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(enabledFeatures[fKey])}
                    onChange={() => toggleFeature(fKey)}
                    disabled={isProcessing}
                  />
                  <span>{t.featuresConfig[fKey]}</span>
                </label>
              ))}
            </div>
          </div>

          {isProcessing && (
            <div className="processing-box" aria-live="polite">
              <div className="spinner" />
              <div>
                <p className="processing-title">{t.upload.processingTitle}</p>
                <p className="processing-step">
                  {t.upload.processingSteps[processingStep]}
                </p>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isProcessing}
            >
              {t.upload.cancelBtn}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selectedFile || isProcessing}
            >
              <Sparkles size={16} />
              <span>{t.upload.createBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
