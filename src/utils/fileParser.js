import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Extracts structured pages/slides/sections and embedded slide figures/diagrams from PDF, PPTX, or TXT files.
 * Returns { fileType: 'PDF' | 'PPTX' | 'TXT', pages: Array<{ pageNumber, unitType, title, content, extractedFigures }> }
 */
export async function parseUploadedFile(file, contentLang = 'et') {
  const name = file.name || '';
  const ext = name.split('.').pop().toLowerCase();

  if (ext === 'pdf' || file.type === 'application/pdf') {
    const pages = await parsePdfFile(file, contentLang);
    return { fileType: 'PDF', pages };
  }

  if (
    ext === 'pptx' ||
    file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ) {
    const pages = await parsePptxFile(file, contentLang);
    return { fileType: 'PPTX', pages };
  }

  if (ext === 'txt' || file.type === 'text/plain') {
    const pages = await parseTxtFile(file, contentLang);
    return { fileType: 'TXT', pages };
  }

  throw new Error('UNSUPPORTED_FORMAT');
}

function getMimeFromExt(path) {
  const ext = (path || '').split('.').pop().toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'svg') return 'image/svg+xml';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'webp') return 'image/webp';
  return null;
}

function toSuperscriptText(str) {
  const map = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    '+': '⁺',
    '-': '⁻',
    '=': '⁼',
    '(': '⁽',
    ')': '⁾',
    n: 'ⁿ'
  };
  return String(str)
    .split('')
    .map((ch) => map[ch] || ch)
    .join('');
}

function toSubscriptText(str) {
  const map = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
    '+': '₊',
    '-': '₋',
    '=': '₌',
    '(': '₍',
    ')': '₎',
    a: 'ₐ',
    e: 'ₑ',
    i: 'ᵢ',
    o: 'ₒ',
    u: 'ᵤ',
    x: 'ₓ',
    n: 'ₙ',
    m: 'ₘ',
    k: 'ₖ',
    p: 'ₚ',
    s: 'ₛ',
    t: 'ₜ'
  };
  const converted = String(str)
    .split('')
    .map((ch) => map[ch] || null);
  if (converted.every(Boolean)) {
    return converted.join('');
  }
  return `_${str}`;
}

function extractOmathText(mathNode) {
  if (!mathNode) return '';
  const localName = (mathNode.localName || mathNode.nodeName || '').replace(/^.*:/, '');

  if (localName === 't') {
    return mathNode.textContent || '';
  }

  if (localName === 'f') {
    const num = Array.from(mathNode.childNodes).find(
      (n) => (n.localName || n.nodeName || '').replace(/^.*:/, '') === 'num'
    );
    const den = Array.from(mathNode.childNodes).find(
      (n) => (n.localName || n.nodeName || '').replace(/^.*:/, '') === 'den'
    );
    const numTxt = num ? extractOmathText(num).trim() : '';
    const denTxt = den ? extractOmathText(den).trim() : '';
    if (numTxt && denTxt) {
      const safeNum = numTxt.length > 2 && /[+\-−]/.test(numTxt) ? `(${numTxt})` : numTxt;
      const safeDen = denTxt.length > 2 && /[+\-−·*]/.test(denTxt) ? `(${denTxt})` : denTxt;
      return `${safeNum} / ${safeDen}`;
    }
  }

  if (localName === 'sSup') {
    const children = Array.from(mathNode.childNodes);
    const baseNode = children.find((n) => (n.localName || n.nodeName || '').replace(/^.*:/, '') === 'e');
    const supNode = children.find((n) => (n.localName || n.nodeName || '').replace(/^.*:/, '') === 'sup');
    const baseTxt = baseNode ? extractOmathText(baseNode).trim() : '';
    const supTxt = supNode ? extractOmathText(supNode).trim() : '';
    return `${baseTxt}${toSuperscriptText(supTxt)}`;
  }

  if (localName === 'sSub') {
    const children = Array.from(mathNode.childNodes);
    const baseNode = children.find((n) => (n.localName || n.nodeName || '').replace(/^.*:/, '') === 'e');
    const subNode = children.find((n) => (n.localName || n.nodeName || '').replace(/^.*:/, '') === 'sub');
    const baseTxt = baseNode ? extractOmathText(baseNode).trim() : '';
    const subTxt = subNode ? extractOmathText(subNode).trim() : '';
    return `${baseTxt}${toSubscriptText(subTxt)}`;
  }

  if (localName === 'rad') {
    const children = Array.from(mathNode.childNodes);
    const baseNode = children.find((n) => (n.localName || n.nodeName || '').replace(/^.*:/, '') === 'e');
    const baseTxt = baseNode ? extractOmathText(baseNode).trim() : '';
    return `√(${baseTxt})`;
  }

  return Array.from(mathNode.childNodes || [])
    .map((child) => extractOmathText(child))
    .join('');
}

async function parsePdfFile(file, contentLang) {
  const arrayBuffer = await file.arrayBuffer();
  const pagePrefix = contentLang === 'en' ? 'Page' : 'Lk';
  const isEN = contentLang === 'en';

  try {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    const pages = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Reconstruct lines based on vertical transform coordinates, keeping formula subscripts/superscripts together
      const lines = [];
      let currentLine = [];
      let lastY = null;
      let lastStr = '';

      for (const item of textContent.items) {
        if (!item.str) continue;
        const str = item.str;
        const y = item.transform ? Math.round(item.transform[5]) : null;
        const dy = lastY !== null && y !== null ? Math.abs(y - lastY) : 0;

        // Keep subscript/superscript math tokens on the same line when vertical offset is small (<= 8pt)
        const isSubOrSupToken =
          dy > 4 &&
          dy <= 9 &&
          (str.trim().length <= 4 || /^[0-9+\-=()xyzabtnk₀₁₂₃₄²³]+$/i.test(str.trim())) &&
          lastStr.trim().length <= 18;

        if (lastY !== null && y !== null && dy > 5 && !isSubOrSupToken) {
          if (currentLine.length > 0) {
            lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
            currentLine = [];
          }
        }
        currentLine.push(str);
        lastStr = str;
        if (y !== null && !isSubOrSupToken) lastY = y;
      }
      if (currentLine.length > 0) {
        lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
      }

      const content = lines.filter(Boolean).join('\n').trim();
      const extractedFigures = [];

      // Check if page mentions a figure/graph/diagram OR is a visual diagram slide with brief caption text
      const figureCaptionLine = lines.find((l) =>
        /\b(?:joonis|skeem|graafik|diagramm|epüür|lõige|vaade|fig(?:ure)?\.?)\s*\d*/i.test(l)
      );
      const nonHeaderLines = lines.filter(
        (l) =>
          l.trim().length > 2 &&
          !/\b(?:capt\.|prof\.|mni\s*\d+|teema\s*\d+)\b/i.test(l) &&
          !/^\d+$/.test(l.trim())
      );
      const isDiagramSlide =
        i > 1 && nonHeaderLines.length >= 1 && nonHeaderLines.length <= 3 && content.length < 180;

      if ((figureCaptionLine || isDiagramSlide) && typeof document !== 'undefined') {
        try {
          const viewport = page.getViewport({ scale: 1.15 });
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(900, Math.round(viewport.width));
          canvas.height = Math.min(650, Math.round(viewport.height));
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            const dataUrl = canvas.toDataURL('image/png');
            if (dataUrl && dataUrl.startsWith('data:image/')) {
              const rawCap =
                figureCaptionLine ||
                nonHeaderLines[0] ||
                `${pagePrefix} ${i}`;
              const cleanCap = rawCap.replace(/^[•●▪\-*]+\s*/, '').replace(/[,:;]+$/, '').trim();
              extractedFigures.push({
                title: cleanCap.slice(0, 90),
                description:
                  nonHeaderLines.find((l) => l !== rawCap && l.length > 15) ||
                  (isEN
                    ? `Visual figure extracted from ${pagePrefix} ${i}.`
                    : `Slaidilt / leheküljelt (${pagePrefix} ${i}) eraldatud joonis: ${cleanCap}.`),
                imageUrl: dataUrl
              });
            }
          }
        } catch {
          // Canvas snapshot is optional; contentGenerator will still generate an SVG figure card
        }
      }

      if (content.length > 0) {
        const firstLine =
          nonHeaderLines[0] || lines.find((l) => l.trim().length > 2) || `${pagePrefix} ${i}`;
        const cleanTitle = firstLine
          .replace(/^[•●▪\-*]+\s*/, '')
          .replace(/[,:;]+$/, '')
          .trim()
          .slice(0, 70);
        pages.push({
          pageNumber: i,
          unitType: 'page',
          title: `${pagePrefix} ${i}: ${cleanTitle}`,
          content,
          extractedFigures
        });
      }
    }

    if (pages.length > 0) {
      return pages;
    }
  } catch (err) {
    console.warn('PDF.js fallback triggered:', err);
  }

  // Fallback for synthetic/plain-stream PDFs
  const rawText = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
  const tjMatches = [];
  const tjRegex = /\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*Tj/g;
  let match;
  while ((match = tjRegex.exec(rawText)) !== null) {
    tjMatches.push(match[1].replace(/\\([()\\])/g, '$1'));
  }

  if (tjMatches.length > 0) {
    const joined = tjMatches.join('\n');
    return splitTextIntoSections(joined, 'page', contentLang);
  }

  // Last resort if a plain text buffer had a .pdf extension
  const printable = rawText.replace(/[^\x20-\x7E\xA0-\uFFFF\n\r\t]/g, ' ').trim();
  if (printable.length > 10) {
    return splitTextIntoSections(printable, 'page', contentLang);
  }

  throw new Error('EMPTY_FILE');
}

async function parsePptxFile(file, contentLang) {
  const arrayBuffer = await file.arrayBuffer();
  const slidePrefix = contentLang === 'en' ? 'Slide' : 'Slaid';
  const isEN = contentLang === 'en';

  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const slideFiles = Object.keys(zip.files)
      .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
      .sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/i)[1], 10);
        const numB = parseInt(b.match(/slide(\d+)\.xml/i)[1], 10);
        return numA - numB;
      });

    const pages = [];
    const parser = new DOMParser();

    for (let idx = 0; idx < slideFiles.length; idx++) {
      const slidePath = slideFiles[idx];
      const slideFileName = slidePath.split('/').pop();
      const slideNumber = idx + 1;
      const xmlStr = await zip.files[slidePath].async('string');
      const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');

      const paragraphs = Array.from(xmlDoc.getElementsByTagName('a:p'));
      const lines = [];

      for (const p of paragraphs) {
        let paraStr = '';
        for (const child of Array.from(p.childNodes || [])) {
          const local = (child.localName || child.nodeName || '').replace(/^.*:/, '');
          if (local === 'r') {
            const rPr = child.getElementsByTagName('a:rPr')[0];
            const baseline = rPr ? parseInt(rPr.getAttribute('baseline') || '0', 10) : 0;
            const rawRun = Array.from(child.getElementsByTagName('a:t'))
              .map((n) => n.textContent || '')
              .join('');
            if (baseline > 15000 && rawRun.trim().length <= 5) {
              paraStr += toSuperscriptText(rawRun.trim());
            } else if (baseline < -10000 && rawRun.trim().length <= 5) {
              paraStr += toSubscriptText(rawRun.trim());
            } else {
              paraStr += rawRun;
            }
          } else if (local === 'm' || local === 'oMathPara' || local === 'oMath') {
            const mathTxt = extractOmathText(child).trim();
            if (mathTxt) {
              paraStr += (paraStr && !paraStr.endsWith(' ') ? ' ' : '') + mathTxt + ' ';
            }
          } else if (child.getElementsByTagName) {
            const nestedMath = Array.from(child.getElementsByTagName('m:oMath'));
            if (nestedMath.length > 0) {
              const mathTxt = nestedMath.map((m) => extractOmathText(m)).join(' ').trim();
              if (mathTxt) {
                paraStr += (paraStr && !paraStr.endsWith(' ') ? ' ' : '') + mathTxt + ' ';
              }
            } else {
              const tNodes = Array.from(child.getElementsByTagName('a:t'));
              if (tNodes.length > 0) {
                paraStr += tNodes.map((n) => n.textContent || '').join('');
              }
            }
          }
        }

        if (!paraStr.trim()) {
          paraStr = Array.from(p.getElementsByTagName('a:t'))
            .map((node) => node.textContent || '')
            .join('');
        }

        if (paraStr.trim()) {
          lines.push(paraStr.replace(/\s+/g, ' ').trim());
        }
      }

      // Extract embedded images & diagrams from slide relationships (ppt/slides/_rels/slideN.xml.rels)
      const extractedFigures = [];
      const relsPath = `ppt/slides/_rels/${slideFileName}.rels`;
      const relMap = {};

      if (zip.files[relsPath]) {
        try {
          const relsStr = await zip.files[relsPath].async('string');
          const relsDoc = parser.parseFromString(relsStr, 'application/xml');
          const relNodes = Array.from(relsDoc.getElementsByTagName('Relationship'));
          for (const rNode of relNodes) {
            const id = rNode.getAttribute('Id');
            const target = rNode.getAttribute('Target') || '';
            if (id && target) {
              relMap[id] = target.replace(/^\.\.\//, 'ppt/');
            }
          }
        } catch {
          // ignore malformed rels
        }
      }

      // Find <p:pic> elements on the slide
      const picElements = Array.from(xmlDoc.getElementsByTagName('p:pic'));
      for (let pIdx = 0; pIdx < picElements.length; pIdx++) {
        const pic = picElements[pIdx];
        const cNvPr = pic.getElementsByTagName('p:cNvPr')[0];
        const picName = cNvPr?.getAttribute('name') || '';
        const picDescr = cNvPr?.getAttribute('descr') || cNvPr?.getAttribute('title') || '';
        const blip = pic.getElementsByTagName('a:blip')[0];
        const embedId = blip?.getAttribute('r:embed');
        const mediaPath = embedId ? relMap[embedId] : null;

        if (mediaPath && zip.files[mediaPath]) {
          const mime = getMimeFromExt(mediaPath);
          if (mime) {
            try {
              const base64 = await zip.files[mediaPath].async('base64');
              const firstLineTitle = lines[0] || `${slidePrefix} ${slideNumber}`;
              const captionCandidate =
                picDescr ||
                lines.find((l) => /\b(?:joonis|skeem|graafik|fig|diagram)/i.test(l)) ||
                (picName && !/^picture\s*\d+$/i.test(picName) ? picName : '') ||
                firstLineTitle;

              extractedFigures.push({
                title: captionCandidate,
                description:
                  lines.slice(1, 3).join(' ') ||
                  (isEN
                    ? `Visual figure from ${slidePrefix} ${slideNumber} (${firstLineTitle}).`
                    : `Slaidil ${slideNumber} („${firstLineTitle}“) esinenud joonis.`),
                imageUrl: `data:${mime};base64,${base64}`
              });
            } catch {
              // ignore unreadable media item
            }
          }
        }
      }

      const content = lines.join('\n').trim();
      if (content || extractedFigures.length > 0) {
        const firstLine = lines[0] || `${slidePrefix} ${slideNumber}`;
        const cleanTitle = firstLine.length > 70 ? firstLine.slice(0, 67) + '...' : firstLine;
        pages.push({
          pageNumber: slideNumber,
          unitType: 'slide',
          title: `${slidePrefix} ${slideNumber}: ${cleanTitle}`,
          content: content || cleanTitle,
          extractedFigures
        });
      }
    }

    if (pages.length > 0) {
      return pages;
    }
  } catch (err) {
    console.warn('PPTX zip fallback triggered:', err);
  }

  // Fallback if a plain text file was given a .pptx extension
  const rawText = await file.text();
  if (rawText && rawText.trim().length > 0) {
    return splitTextIntoSections(rawText, 'slide', contentLang);
  }

  throw new Error('EMPTY_FILE');
}

async function parseTxtFile(file, contentLang) {
  const text = await file.text();
  if (!text || !text.trim()) {
    throw new Error('EMPTY_FILE');
  }
  return splitTextIntoSections(text, 'page', contentLang);
}

function splitTextIntoSections(rawText, defaultUnitType, contentLang) {
  const normalized = rawText.replace(/\r\n/g, '\n').trim();
  const unitPrefix =
    defaultUnitType === 'slide'
      ? contentLang === 'en'
        ? 'Slide'
        : 'Slaid'
      : contentLang === 'en'
      ? 'Page'
      : 'Lk';

  // Check if the text has explicit slide/page/section dividers or numbered headings
  const blocks = normalized
    .split(/\n(?=(?:Slaid|Slide|Lk|Page|Osa|Section|Peatükk|Chapter)\s*\d+|\n#{1,3}\s+|\n\d+\.\s+[A-ZÕÄÖÜŠŽ])/i)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length >= 2) {
    return blocks.map((block, idx) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      const firstLine = (lines[0] || `${unitPrefix} ${idx + 1}`).replace(/^#+\s*/, '');
      const cleanTitle = firstLine.length > 70 ? firstLine.slice(0, 67) + '...' : firstLine;
      return {
        pageNumber: idx + 1,
        unitType: defaultUnitType,
        title: `${unitPrefix} ${idx + 1}: ${cleanTitle}`,
        content: block,
        extractedFigures: []
      };
    });
  }

  // Otherwise split by double newlines and group into logical pages (~600-900 chars each)
  const paragraphs = normalized
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const grouped = [];
  let currentChunk = [];
  let currentLen = 0;

  for (const para of paragraphs) {
    currentChunk.push(para);
    currentLen += para.length;
    if (currentLen >= 550) {
      grouped.push(currentChunk.join('\n\n'));
      currentChunk = [];
      currentLen = 0;
    }
  }
  if (currentChunk.length > 0) {
    grouped.push(currentChunk.join('\n\n'));
  }

  if (grouped.length === 0) {
    grouped.push(normalized);
  }

  return grouped.map((chunk, idx) => {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    const firstLine = (lines[0] || `${unitPrefix} ${idx + 1}`).replace(/^#+\s*/, '');
    const cleanTitle = firstLine.length > 70 ? firstLine.slice(0, 67) + '...' : firstLine;
    return {
      pageNumber: idx + 1,
      unitType: defaultUnitType,
      title: `${unitPrefix} ${idx + 1}: ${cleanTitle}`,
      content: chunk,
      extractedFigures: []
    };
  });
}
