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
  Sliders,
  Plus,
  Trash2,
  Layers
} from 'lucide-react';
import { parseUploadedFile } from '../utils/fileParser';
import { generateStudyContent } from '../utils/contentGenerator';
import { combineMaterialsIntoCollection } from '../utils/storage';
import { DEFAULT_ENABLED_FEATURES } from '../data/sampleMaterial';
import { analyzeDocumentWithTextbooks } from '../utils/academicClassifier';

export default function UploadModal({
  isOpen,
  initialFile,
  uiLang,
  t,
  existingSubjects,
  onClose,
  onMaterialCreated
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
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
  const addMoreFileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setContentLang(uiLang);
      setErrorMsg('');
      setIsProcessing(false);
      setEnabledFeatures({ ...DEFAULT_ENABLED_FEATURES });
      if (initialFile) {
        const initialList = Array.isArray(initialFile)
          ? initialFile
          : [initialFile];
        handleFilesAddition(initialList, true);
      } else {
        setSelectedFiles([]);
        setTitle('');
      }
    }
  }, [isOpen, initialFile, uiLang]);

  if (!isOpen) return null;

  const subjectOptions = Array.from(
    new Set([...(t.subjects || []), ...(existingSubjects || [])])
  );

  function handleFilesAddition(incomingFiles, replaceExisting = false) {
    const fileList = Array.from(incomingFiles || []).filter(Boolean);
    if (fileList.length === 0) return;
    setErrorMsg('');

    const validFiles = [];
    for (const file of fileList) {
      const ext = (file.name || '').split('.').pop().toLowerCase();
      if (!['pdf', 'pptx', 'txt'].includes(ext)) {
        setErrorMsg(t.upload.errorUnsupported);
        return;
      }
      validFiles.push(file);
    }

    setSelectedFiles((prev) => {
      const base = replaceExisting ? [] : prev;
      const existingNames = new Set(base.map((f) => `${f.name}-${f.size}`));
      const deduplicated = validFiles.filter(
        (f) => !existingNames.has(`${f.name}-${f.size}`)
      );
      const next = [...base, ...deduplicated];

      if (replaceExisting || !title.trim()) {
        if (next.length === 1) {
          const baseName = next[0].name
            .replace(/\.[^/.]+$/, '')
            .replace(/[_-]+/g, ' ');
          setTitle(baseName);
        } else if (next.length > 1) {
          const names = next
            .slice(0, 3)
            .map((f) => f.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' '));
          setTitle(
            names.join(' + ') + (next.length > 3 ? ` (+${next.length - 3})` : '')
          );
        }
      } else if (prev.length === 1 && next.length > 1) {
        const prevDefault = prev[0].name
          .replace(/\.[^/.]+$/, '')
          .replace(/[_-]+/g, ' ');
        if (title.trim() === prevDefault) {
          const names = next
            .slice(0, 3)
            .map((f) => f.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' '));
          setTitle(
            names.join(' + ') + (next.length > 3 ? ` (+${next.length - 3})` : '')
          );
        }
      }

      return next;
    });
  }

  function handleRemoveFile(indexToRemove) {
    setSelectedFiles((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (next.length === 0) {
        setTitle('');
      } else if (next.length === 1) {
        const baseName = next[0].name
          .replace(/\.[^/.]+$/, '')
          .replace(/[_-]+/g, ' ');
        setTitle(baseName);
      }
      return next;
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) {
      handleFilesAddition(files, false);
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
    if (selectedFiles.length === 0) return;

    setErrorMsg('');
    setIsProcessing(true);
    setProcessingStep('reading');

    try {
      const finalTitle =
        title.trim() ||
        selectedFiles
          .map((f) => f.name.replace(/\.[^/.]+$/, ''))
          .join(' + ');
      const isCustom =
        subject === 'Muu õppeaine' ||
        subject === 'Other subject' ||
        subject === '__custom__';
      const finalSubject =
        isCustom && customSubject.trim()
          ? customSubject.trim()
          : subject || 'Matemaatiline analüüs';

      if (selectedFiles.length === 1) {
        const singleFile = selectedFiles[0];
        const { fileType, pages } = await parseUploadedFile(
          singleFile,
          contentLang
        );

        if (!pages || pages.length === 0) {
          setErrorMsg(t.upload.errorEmpty);
          setIsProcessing(false);
          return;
        }

        setProcessingStep('segmenting');
        await new Promise((r) => setTimeout(r, 200));

        setProcessingStep('generating');
        await new Promise((r) => setTimeout(r, 200));

        const analysis = analyzeDocumentWithTextbooks(
          pages,
          finalTitle,
          contentLang
        );
        let resolvedSubject = finalSubject;
        if (
          (!isCustom && subject === 'Matemaatiline analüüs' && analysis.hasMatch) ||
          !resolvedSubject
        ) {
          resolvedSubject = analysis.recommendedSubject;
        }

        const generated = generateStudyContent({
          pages,
          fileType,
          contentLang,
          title: finalTitle
        });

        const now = new Date().toISOString();
        const newMaterial = {
          id: `mat-${Date.now()}`,
          contentSchemaVersion: 3,
          isSample: false,
          isCollection: false,
          title: finalTitle,
          subject: resolvedSubject,
          matchedTextbooks: analysis.matchedTextbooks || [],
          fileName: singleFile.name,
          fileType,
          contentLang,
          createdAt: now,
          lastOpenedAt: now,
          enabledFeatures,
          pages,
          figures: generated.figures || [],
          topics: generated.topics,
          flashcards: generated.flashcards,
          exercises: generated.exercises
        };

        await onMaterialCreated(newMaterial, selectedFiles);
        return;
      }

      // Multi-file unified study collection!
      const parsedSingleMaterials = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const { fileType, pages } = await parseUploadedFile(file, contentLang);
        if (!pages || pages.length === 0) continue;

        const fileBaseTitle = file.name.replace(/\.[^/.]+$/, '');
        const generated = generateStudyContent({
          pages,
          fileType,
          contentLang,
          title: fileBaseTitle
        });

        parsedSingleMaterials.push({
          id: `temp-${i}`,
          title: fileBaseTitle,
          fileName: file.name,
          fileType,
          pages,
          figures: generated.figures || [],
          topics: generated.topics,
          flashcards: generated.flashcards,
          exercises: generated.exercises
        });
      }

      if (parsedSingleMaterials.length === 0) {
        setErrorMsg(t.upload.errorEmpty);
        setIsProcessing(false);
        return;
      }

      setProcessingStep('segmenting');
      await new Promise((r) => setTimeout(r, 200));

      setProcessingStep('generating');
      await new Promise((r) => setTimeout(r, 200));

      const allPages = parsedSingleMaterials.flatMap((m) => m.pages || []);
      const multiAnalysis = analyzeDocumentWithTextbooks(
        allPages,
        finalTitle,
        contentLang
      );
      let resolvedSubject = finalSubject;
      if (
        (!isCustom && subject === 'Matemaatiline analüüs' && multiAnalysis.hasMatch) ||
        !resolvedSubject
      ) {
        resolvedSubject = multiAnalysis.recommendedSubject;
      }

      const unifiedCollection = combineMaterialsIntoCollection({
        materialsToCombine: parsedSingleMaterials,
        title: finalTitle,
        subject: resolvedSubject,
        contentLang,
        enabledFeatures
      });
      unifiedCollection.matchedTextbooks = multiAnalysis.matchedTextbooks || [];

      await onMaterialCreated(unifiedCollection, selectedFiles);
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
    'figures',
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

          {selectedFiles.length === 0 ? (
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
                multiple
                accept=".pdf,.pptx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                className="sr-only"
                onChange={(e) => {
                  handleFilesAddition(e.target.files, true);
                  e.target.value = '';
                }}
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
            <div className="selected-files-container">
              <div className="selected-files-header">
                <span className="file-label-caption">
                  {t.upload.selectedFile} ({selectedFiles.length}{' '}
                  {selectedFiles.length === 1
                    ? t.upload.fileSingular || 'fail'
                    : t.upload.filesCountSuffix})
                </span>
                {selectedFiles.length > 1 && (
                  <span className="badge badge-violet">
                    <Layers size={12} />
                    <span>{t.upload.multiFileBadge}</span>
                  </span>
                )}
              </div>

              <div className="selected-files-list">
                {selectedFiles.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="selected-file-banner">
                    <div className="file-info-left">
                      <div className="file-type-avatar">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="file-name-strong">{file.name}</p>
                      </div>
                    </div>
                    {!isProcessing && (
                      <button
                        type="button"
                        className="icon-btn danger-btn"
                        onClick={() => handleRemoveFile(idx)}
                        title={t.upload.removeFileBtn}
                        aria-label={t.upload.removeFileBtn}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {!isProcessing && (
                <div className="selected-files-actions mt-2">
                  <input
                    ref={addMoreFileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.pptx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    className="sr-only"
                    onChange={(e) => {
                      handleFilesAddition(e.target.files, false);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => addMoreFileInputRef.current?.click()}
                  >
                    <Plus size={15} />
                    <span>{t.upload.addMoreFilesBtn}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setSelectedFiles([]);
                      setTitle('');
                      setErrorMsg('');
                    }}
                  >
                    {t.upload.changeFile}
                  </button>
                </div>
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
              disabled={selectedFiles.length === 0 || isProcessing}
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
