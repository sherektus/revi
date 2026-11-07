import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Extracts structured pages/slides/sections from PDF, PPTX, or TXT files.
 * Returns { fileType: 'PDF' | 'PPTX' | 'TXT', pages: Array<{ pageNumber, unitType, title, content }> }
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

async function parsePdfFile(file, contentLang) {
  const arrayBuffer = await file.arrayBuffer();
  const pagePrefix = contentLang === 'en' ? 'Page' : 'Lk';

  try {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    const pages = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Reconstruct lines based on vertical transform coordinates
      const lines = [];
      let currentLine = [];
      let lastY = null;

      for (const item of textContent.items) {
        if (!item.str) continue;
        const y = item.transform ? Math.round(item.transform[5]) : null;
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
          if (currentLine.length > 0) {
            lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
            currentLine = [];
          }
        }
        currentLine.push(item.str);
        if (y !== null) lastY = y;
      }
      if (currentLine.length > 0) {
        lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
      }

      const content = lines.filter(Boolean).join('\n').trim();
      if (content.length > 0) {
        const firstLine = lines.find((l) => l.trim().length > 2) || `${pagePrefix} ${i}`;
        const cleanTitle = firstLine.length > 70 ? firstLine.slice(0, 67) + '...' : firstLine;
        pages.push({
          pageNumber: i,
          unitType: 'page',
          title: `${pagePrefix} ${i}: ${cleanTitle}`,
          content
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
      const slideNumber = idx + 1;
      const xmlStr = await zip.files[slidePath].async('string');
      const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');

      const paragraphs = Array.from(xmlDoc.getElementsByTagName('a:p'));
      const lines = [];

      for (const p of paragraphs) {
        const texts = Array.from(p.getElementsByTagName('a:t'))
          .map((node) => node.textContent || '')
          .join('');
        if (texts.trim()) {
          lines.push(texts.trim());
        }
      }

      const content = lines.join('\n').trim();
      if (content) {
        const firstLine = lines[0] || `${slidePrefix} ${slideNumber}`;
        const cleanTitle = firstLine.length > 70 ? firstLine.slice(0, 67) + '...' : firstLine;
        pages.push({
          pageNumber: slideNumber,
          unitType: 'slide',
          title: `${slidePrefix} ${slideNumber}: ${cleanTitle}`,
          content
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
        content: block
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
      content: chunk
    };
  });
}
