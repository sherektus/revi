import React, { useState, useEffect } from 'react';
import { X, FileText, ExternalLink, Download, BookOpen, CheckCircle2 } from 'lucide-react';
import { getOriginalFileBlob } from '../utils/storage';

export default function SourceFileModal({
  isOpen,
  material,
  initialPageNumber = 1,
  t,
  onClose
}) {
  const [selectedPageNum, setSelectedPageNum] = useState(initialPageNumber || 1);
  const [blobUrl, setBlobUrl] = useState(null);
  const [blobMime, setBlobMime] = useState(null);

  useEffect(() => {
    if (isOpen && initialPageNumber) {
      setSelectedPageNum(initialPageNumber);
    }
  }, [isOpen, initialPageNumber]);

  useEffect(() => {
    let activeUrl = null;
    if (isOpen && material) {
      getOriginalFileBlob(material.id).then((res) => {
        if (res && res.blob) {
          activeUrl = URL.createObjectURL(res.blob);
          setBlobUrl(activeUrl);
          setBlobMime(res.type);
        } else {
          // Synthesize a clean downloadable text representation for sample or text materials
          const fullText = [
            `${material.title} (${material.subject})`,
            `File: ${material.fileName}`,
            '====================================================',
            ...(material.pages || []).map(
              (p) => `\n--- ${p.title} ---\n\n${p.content}`
            )
          ].join('\n');
          const synthBlob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
          activeUrl = URL.createObjectURL(synthBlob);
          setBlobUrl(activeUrl);
          setBlobMime('text/plain');
        }
      });
    }

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
      setBlobUrl(null);
      setBlobMime(null);
    };
  }, [isOpen, material]);

  if (!isOpen || !material) return null;

  const pages = material.pages || [];
  const activePage =
    pages.find((p) => p.pageNumber === selectedPageNum) || pages[0];

  const unitPrefix =
    material.fileType === 'PPTX'
      ? t.sourceViewer.slidePrefix
      : t.sourceViewer.pagePrefix;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card source-viewer-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-viewer-title"
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge">
              <FileText size={18} />
            </span>
            <div>
              <h2 id="source-viewer-title">{t.sourceViewer.title}</h2>
              <p className="modal-subtitle-caption">
                {material.fileName} • {material.subject}
              </p>
            </div>
          </div>

          <div className="modal-header-actions">
            {blobUrl && (
              <a
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={blobMime === 'text/plain' ? `${material.title}.txt` : undefined}
                className="btn btn-secondary btn-sm"
              >
                {blobMime === 'application/pdf' ? (
                  <ExternalLink size={15} />
                ) : (
                  <Download size={15} />
                )}
                <span>{t.sourceViewer.downloadRaw}</span>
              </a>
            )}
            <button
              type="button"
              className="icon-btn"
              onClick={onClose}
              aria-label={t.sourceViewer.closeBtn}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="source-viewer-layout">
          {/* Sidebar list of slides / pages */}
          <aside className="source-pages-sidebar">
            <div className="sidebar-section-label">
              {t.sourceViewer.pagesList} ({pages.length})
            </div>
            <div className="source-pages-list">
              {pages.map((p) => {
                const isSelected = p.pageNumber === activePage?.pageNumber;
                return (
                  <button
                    key={p.pageNumber}
                    type="button"
                    className={`source-page-item ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedPageNum(p.pageNumber)}
                  >
                    <span className="page-num-pill">
                      {unitPrefix} {p.pageNumber}
                    </span>
                    <span className="page-item-title">{p.title}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main page/slide content view */}
          <div className="source-page-content-area">
            {activePage && (
              <div className="source-page-sheet">
                <div className="source-sheet-header">
                  <span className="badge badge-violet">
                    <CheckCircle2 size={13} />
                    <span>
                      {t.sourceViewer.highlightedRef}: {unitPrefix}{' '}
                      {activePage.pageNumber}
                    </span>
                  </span>
                  <h3 className="source-sheet-title">{activePage.title}</h3>
                </div>

                <div className="source-sheet-body">
                  {activePage.content.split('\n').map((line, i) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <div key={i} className="line-spacer" />;
                    const isFormulaLine = /[=≈≠≤≥±→∑∫√Δ]/.test(trimmed);
                    return (
                      <p
                        key={i}
                        className={`source-line ${
                          isFormulaLine ? 'source-line-formula' : ''
                        }`}
                      >
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            {blobUrl && blobMime === 'application/pdf' && (
              <div className="pdf-embed-section">
                <div className="sidebar-section-label mb-2">
                  <BookOpen size={15} />
                  <span>{t.sourceViewer.rawPdfPreview}</span>
                </div>
                <iframe
                  src={`${blobUrl}#page=${selectedPageNum}`}
                  title={material.fileName}
                  className="pdf-iframe"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
