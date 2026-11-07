import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  FileText,
  ExternalLink,
  Calculator
} from 'lucide-react';
import MathFormula from './MathFormula';
import { DEFAULT_ENABLED_FEATURES } from '../data/sampleMaterial';
import {
  cleanPunctuationAndNoise,
  enrichFormulaMetadata,
  isGenuineFormulaExpression
} from '../utils/contentGenerator';

export default function FormulasView({
  t,
  materials,
  fixedMaterial = null,
  onOpenSourceViewer
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    fixedMaterial ? fixedMaterial.id : 'ALL'
  );

  const sourceMaterials = useMemo(() => {
    if (fixedMaterial) return [fixedMaterial];
    return materials.filter((m) => {
      const f = { ...DEFAULT_ENABLED_FEATURES, ...(m.enabledFeatures || {}) };
      return f.formulaSheet !== false;
    });
  }, [materials, fixedMaterial]);

  const allFormulaEntries = useMemo(() => {
    const list = [];
    for (const mat of sourceMaterials) {
      if (selectedMaterialId !== 'ALL' && mat.id !== selectedMaterialId) {
        continue;
      }
      const isEN = mat.contentLang === 'en';
      for (const tp of mat.topics || []) {
        const cleanTopicTitle = cleanPunctuationAndNoise(tp.title);
        for (const f of tp.formulas || []) {
          const rawExpr = typeof f === 'string' ? f : f.expression || '';
          const rawLabel = typeof f === 'object' ? f.label || '' : '';
          if (!isGenuineFormulaExpression(rawExpr)) continue;
          if (/&[a-z0-9_]+=|\bwatch\?|\bindex=|\blist=|\bv=[A-Za-z0-9_-]{5,}/i.test(rawExpr)) continue;
          if (/&[a-z0-9_]+=|\bwatch\?|\bindex=|\blist=/i.test(rawLabel)) continue;

          const sourceRef = (typeof f === 'object' && f.sourceRef) || tp.sourceRef;
          const enriched = enrichFormulaMetadata({
            rawLabel: typeof f === 'object' ? f.label : '',
            rawExpression: rawExpr,
            topicHeading: cleanTopicTitle,
            sentences: tp.bulletPoints || [tp.summary].filter(Boolean),
            refLabel: sourceRef?.label || '',
            isEN
          });

          const isPlaceholder = (val) =>
            !val || val === '—' || val === '-' || val === 'undefined' || val.trim() === '';

          list.push({
            ...(typeof f === 'object' ? f : {}),
            label:
              typeof f === 'object' &&
              f.label &&
              !/^(?:valem\s*(?:\/|või)\s*seos|põhiseos|formula\s*\/\s*relation|core\s*relation)/i.test(
                f.label
              )
                ? cleanPunctuationAndNoise(f.label)
                : enriched.label,
            expression: enriched.expression,
            symbols:
              typeof f === 'object' && !isPlaceholder(f.symbols)
                ? f.symbols
                : enriched.symbols,
            units:
              typeof f === 'object' && !isPlaceholder(f.units)
                ? f.units
                : enriched.units,
            example:
              typeof f === 'object' && !isPlaceholder(f.example)
                ? f.example
                : enriched.example,
            topicTitle: cleanTopicTitle,
            materialId: mat.id,
            materialTitle: mat.title,
            subject: mat.subject,
            materialObj: mat,
            sourceRef
          });
        }
      }
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (item) =>
        (item.label || '').toLowerCase().includes(q) ||
        (item.expression || '').toLowerCase().includes(q) ||
        (item.symbols || '').toLowerCase().includes(q) ||
        (item.topicTitle || '').toLowerCase().includes(q)
    );
  }, [sourceMaterials, selectedMaterialId, searchQuery]);

  return (
    <div className={fixedMaterial ? 'formulas-embedded' : 'formulas-view container'}>
      {!fixedMaterial && (
        <div className="library-header">
          <div>
            <h1 className="page-title">{t.formulasView.title}</h1>
            <p className="page-subtitle">{t.formulasView.subtitle}</p>
          </div>
        </div>
      )}

      <div className="library-toolbar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="search"
            className="form-input search-input"
            placeholder={t.formulasView.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {!fixedMaterial && (
          <div className="filter-select-wrap">
            <Filter size={16} className="filter-icon" />
            <select
              className="form-select"
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
            >
              <option value="ALL">{t.formulasView.filterByMaterial}</option>
              {sourceMaterials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {allFormulaEntries.length === 0 ? (
        <div className="empty-state-card">
          <Calculator size={32} className="empty-icon" />
          <p>{t.formulasView.emptyFormulas}</p>
        </div>
      ) : (
        <div className="formulas-sheet-grid">
          {allFormulaEntries.map((item, idx) => (
            <article key={`${item.materialId}-${idx}`} className="formula-sheet-card">
              <div className="formula-sheet-top">
                <div className="material-badges" style={{ marginBottom: 0 }}>
                  <span className="badge badge-violet">{item.subject}</span>
                  <span className="badge badge-neutral">{item.topicTitle}</span>
                </div>

                {item.sourceRef && (
                  <button
                    type="button"
                    className="source-ref-btn"
                    onClick={() =>
                      onOpenSourceViewer(
                        item.materialObj,
                        item.sourceRef.number || 1
                      )
                    }
                  >
                    <FileText size={13} />
                    <span>{item.sourceRef.label}</span>
                    <ExternalLink size={12} />
                  </button>
                )}
              </div>

              <h3 className="formula-sheet-title">{item.label}</h3>

              <div className="formula-sheet-expression-box">
                <MathFormula expression={item.expression} />
              </div>

              <div className="formula-sheet-details">
                <div className="formula-detail-row">
                  <span className="formula-detail-key">
                    {t.formulasView.symbolsLabel}:
                  </span>
                  <span className="formula-detail-val">
                    {item.symbols || '—'}
                  </span>
                </div>

                <div className="formula-detail-row">
                  <span className="formula-detail-key">
                    {t.formulasView.unitsLabel}:
                  </span>
                  <span className="formula-detail-val">
                    {item.units || '—'}
                  </span>
                </div>

                <div className="formula-detail-row formula-example-row">
                  <span className="formula-detail-key">
                    {t.formulasView.exampleLabel}:
                  </span>
                  <span className="formula-detail-val">
                    {item.example || '—'}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
