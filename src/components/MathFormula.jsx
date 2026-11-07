import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Converts common text math notations into authentic LaTeX expressions
 * so formulas render like true university textbook formulas with proper
 * fraction bars, Greek letters, superscripts, and mathematical typography.
 */
export function formatExpressionToLatex(expr) {
  if (!expr || typeof expr !== 'string') return '';
  let s = expr.trim();

  // If already full LaTeX with backslashes
  if (/\\(?:frac|sigma|rho|tau|Delta|cdot|sum|int|lim|sqrt)\b/.test(s)) {
    return s;
  }

  // Separate trailing text notes like "(kus W = I / z)" or "(where W = I / z)"
  let textAnnotation = '';
  const noteMatch = s.match(/\s*\((kus|where|kui|millal|ehk)\s+([^)]+)\)\s*$/i);
  if (noteMatch) {
    const keyword = noteMatch[1];
    const subNote = noteMatch[2];
    textAnnotation = `\\quad \\text{(${keyword} } ${formatExpressionToLatex(subNote)} \\text{)}`;
    s = s.slice(0, noteMatch.index).trim();
  }

  // Replace Greek letters
  s = s
    .replace(/\bσ\b|σ/g, '\\sigma ')
    .replace(/\bρ\b|ρ/g, '\\rho ')
    .replace(/\bτ\b|τ/g, '\\tau ')
    .replace(/\bΔ\b|Δ/g, '\\Delta ')
    .replace(/\bλ\b|λ/g, '\\lambda ')
    .replace(/\bθ\b|θ/g, '\\theta ')
    .replace(/\bω\b|ω/g, '\\omega ')
    .replace(/\bμ\b|μ/g, '\\mu ')
    .replace(/\bε\b|ε/g, '\\varepsilon ')
    .replace(/\bπ\b|π/g, '\\pi ');

  // Superscripts & Subscripts Unicode
  s = s
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/₀/g, '_0')
    .replace(/₁/g, '_1')
    .replace(/₂/g, '_2')
    .replace(/₃/g, '_3');

  // Math symbols
  s = s
    .replace(/·/g, ' \\cdot ')
    .replace(/\*/g, ' \\cdot ')
    .replace(/×/g, ' \\times ')
    .replace(/≈/g, ' \\approx ')
    .replace(/≠/g, ' \\neq ')
    .replace(/≤/g, ' \\le ')
    .replace(/≥/g, ' \\ge ')
    .replace(/±/g, ' \\pm ')
    .replace(/→/g, ' \\to ')
    .replace(/√\s*([A-Za-z0-9_]+)/g, '\\sqrt{$1}')
    .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}');

  // Convert simple single-slash fractions: "A / B" -> "\frac{A}{B}"
  // e.g. "σ = M / W" -> "\sigma = \frac{M}{W}"
  // e.g. "W = I / z" -> "W = \frac{I}{z}"
  // e.g. "v = s / t" -> "v = \frac{s}{t}"
  s = s.replace(
    /([A-Za-z0-9_()+\\-]+)\s*\/\s*([A-Za-z0-9_()+\\-]+)/g,
    (match, num, den) => {
      // Don't convert units like "m/s" or "km/h" if standalone
      if (/^(?:m|km|cm|mm|s|h|kg|N)$/i.test(num.trim()) && /^(?:s|h|m|kg)$/i.test(den.trim())) {
        return match;
      }
      const cleanNum = num.replace(/^\(|\)$/g, '').trim();
      const cleanDen = den.replace(/^\(|\)$/g, '').trim();
      return `\\frac{${cleanNum}}{${cleanDen}}`;
    }
  );

  // Derivative notations: f'(x) -> f'(x), dy/dx -> \frac{dy}{dx}
  s = s.replace(/\bdy\s*\/\s*dx\b/gi, '\\frac{dy}{dx}');
  s = s.replace(/\bdy\s*\/\s*dt\b/gi, '\\frac{dy}{dt}');
  s = s.replace(/\bds\s*\/\s*dt\b/gi, '\\frac{ds}{dt}');

  // Multi-term assignments with "ning" or "ja"
  s = s.replace(/\s+ning\s+/g, ' \\quad \\text{ning} \\quad ');
  s = s.replace(/\s+ja\s+/g, ' \\quad \\text{ja} \\quad ');

  if (textAnnotation) {
    s += textAnnotation;
  }

  return s;
}

/**
 * Renders mathematical expressions using KaTeX with textbook styling.
 * Replaces the programmer monospace "code ribbon" with authentic scientific textbook typography!
 */
export default function MathFormula({
  expression,
  displayMode = true,
  className = ''
}) {
  const { html, isRendered } = useMemo(() => {
    if (!expression || typeof expression !== 'string') {
      return { html: '', isRendered: false };
    }

    try {
      const tex = formatExpressionToLatex(expression);
      const rendered = katex.renderToString(tex, {
        throwOnError: false,
        displayMode,
        output: 'htmlAndMathml'
      });
      return { html: rendered, isRendered: true };
    } catch {
      return { html: '', isRendered: false };
    }
  }, [expression, displayMode]);

  if (!expression) return null;

  if (isRendered && html) {
    return (
      <div
        className={`math-formula-display ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Graceful textbook fallback if KaTeX ever fails (NOT a monospace code ribbon!)
  return (
    <div className={`math-formula-display math-fallback ${className}`}>
      <span className="math-fallback-text">{expression}</span>
    </div>
  );
}
