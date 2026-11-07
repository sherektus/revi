import { sampleMaterials } from '../data/sampleMaterial';

const KEYS = {
  UI_LANG: 'kordur_ui_lang',
  THEME: 'kordur_theme',
  MATERIALS: 'kordur_materials_v1',
  PROGRESS: 'kordur_progress_v1',
  LAST_SESSION: 'kordur_last_session_v1'
};

const DB_NAME = 'kordur_files_db';
const STORE_NAME = 'original_files';

function openFilesDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

export async function saveOriginalFileBlob(materialId, file) {
  try {
    const db = await openFilesDB();
    if (!db) return;
    const buffer = await file.arrayBuffer();
    const record = {
      name: file.name,
      type: file.type || 'application/octet-stream',
      buffer
    };
    await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(record, materialId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    console.warn('Could not store original file blob in IndexedDB:', e);
  }
}

export async function getOriginalFileBlob(materialId) {
  try {
    const db = await openFilesDB();
    if (!db) return null;
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(materialId);
      req.onsuccess = () => {
        if (req.result && req.result.buffer) {
          const blob = new Blob([req.result.buffer], { type: req.result.type });
          resolve({ blob, name: req.result.name, type: req.result.type });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

export async function deleteOriginalFileBlob(materialId) {
  try {
    const db = await openFilesDB();
    if (!db) return;
    await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(materialId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    // ignore
  }
}

export function loadUILang() {
  try {
    const saved = localStorage.getItem(KEYS.UI_LANG);
    return saved === 'en' || saved === 'et' ? saved : 'et';
  } catch {
    return 'et';
  }
}

export function saveUILang(lang) {
  try {
    localStorage.setItem(KEYS.UI_LANG, lang);
  } catch {
    // ignore
  }
}

export function loadTheme() {
  try {
    const saved = localStorage.getItem(KEYS.THEME);
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(KEYS.THEME, theme);
  } catch {
    // ignore
  }
}

export function loadMaterials() {
  try {
    const raw = localStorage.getItem(KEYS.MATERIALS);
    if (!raw) {
      localStorage.setItem(KEYS.MATERIALS, JSON.stringify(sampleMaterials));
      return sampleMaterials;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(KEYS.MATERIALS, JSON.stringify(sampleMaterials));
      return sampleMaterials;
    }
    // Ensure sample materials are always present unless explicitly deleted
    return parsed;
  } catch {
    return sampleMaterials;
  }
}

export function saveMaterials(materials) {
  try {
    localStorage.setItem(KEYS.MATERIALS, JSON.stringify(materials));
  } catch (e) {
    console.warn('Could not save materials to localStorage:', e);
  }
}

export function createDefaultProgressForMaterial(material) {
  return {
    activeTab: 'summary', // 'summary' | 'flashcards' | 'exercises'
    selectedTopicId: 'all',
    flashcards: {
      currentIndex: 0,
      isFlipped: false,
      // statusById: { [cardId]: 'knew' | 'review' }
      statusById: {},
      // activeDeckIds allows reviewing only 'review' cards when retry mode is triggered
      activeDeckIds: (material.flashcards || []).map((c) => c.id),
      isReviewOnlyMode: false,
      isSessionFinished: false
    },
    exercises: {
      currentIndex: 0,
      // answersById: { [exId]: { selectedIndex: number, isCorrect: boolean, checked: boolean } }
      answersById: {},
      activeExerciseIds: (material.exercises || []).map((e) => e.id),
      isRetryOnlyMode: false,
      isSessionFinished: false
    },
    updatedAt: new Date().toISOString()
  };
}

export function loadAllProgress(materials = []) {
  try {
    const raw = localStorage.getItem(KEYS.PROGRESS);
    const parsed = raw ? JSON.parse(raw) : {};
    const result = { ...parsed };
    for (const mat of materials) {
      if (!result[mat.id]) {
        result[mat.id] = createDefaultProgressForMaterial(mat);
      }
    }
    return result;
  } catch {
    const fallback = {};
    for (const mat of materials) {
      fallback[mat.id] = createDefaultProgressForMaterial(mat);
    }
    return fallback;
  }
}

export function saveAllProgress(progressMap) {
  try {
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progressMap));
  } catch (e) {
    console.warn('Could not save progress to localStorage:', e);
  }
}

export function loadLastSession() {
  try {
    const raw = localStorage.getItem(KEYS.LAST_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLastSession(sessionInfo) {
  try {
    localStorage.setItem(KEYS.LAST_SESSION, JSON.stringify(sessionInfo));
  } catch {
    // ignore
  }
}

/**
 * Calculates overall mastery & completion metrics for a material.
 */
export function calculateMaterialStats(material, matProgress) {
  const totalCards = (material.flashcards || []).length;
  const totalExercises = (material.exercises || []).length;

  const statusById = matProgress?.flashcards?.statusById || {};
  const answersById = matProgress?.exercises?.answersById || {};

  let knewCards = 0;
  let reviewCards = 0;
  let answeredCards = 0;

  for (const fc of material.flashcards || []) {
    const st = statusById[fc.id];
    if (st === 'knew') {
      knewCards++;
      answeredCards++;
    } else if (st === 'review') {
      reviewCards++;
      answeredCards++;
    }
  }

  let correctExercises = 0;
  let incorrectExercises = 0;
  let answeredExercises = 0;

  for (const ex of material.exercises || []) {
    const ans = answersById[ex.id];
    if (ans && ans.checked) {
      answeredExercises++;
      if (ans.isCorrect) {
        correctExercises++;
      } else {
        incorrectExercises++;
      }
    }
  }

  const totalItems = totalCards + totalExercises;
  // Progress accounts for activity & mastery: answered items count toward completion, mastered items give 100%
  const completedUnits = knewCards + reviewCards * 0.5 + correctExercises + incorrectExercises * 0.5;
  const progressPercent = totalItems > 0 ? Math.min(100, Math.round((completedUnits / totalItems) * 100)) : 0;
  const hasStarted = answeredCards > 0 || answeredExercises > 0 || (matProgress?.flashcards?.currentIndex || 0) > 0 || (matProgress?.exercises?.currentIndex || 0) > 0;

  return {
    totalCards,
    totalExercises,
    knewCards,
    reviewCards,
    answeredCards,
    correctExercises,
    incorrectExercises,
    answeredExercises,
    progressPercent,
    hasStarted
  };
}
