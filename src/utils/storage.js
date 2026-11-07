import { sampleMaterials, DEFAULT_ENABLED_FEATURES } from '../data/sampleMaterial';
import { generateStudyContent, isGenuineFormulaExpression } from './contentGenerator';

const KEYS = {
  UI_LANG: 'kordur_ui_lang',
  THEME: 'kordur_theme',
  DEVICE_ID: 'revi_device_id_v1',
  PROFILES: 'revi_profiles_v1',
  ACTIVE_PROFILE: 'revi_active_profile_v1',
  MATERIALS: 'kordur_materials_v1',
  PROGRESS: 'kordur_progress_v1',
  LAST_SESSION: 'kordur_last_session_v1',
  NAV_STATE: 'kordur_nav_state_v1',
  CALENDAR_EVENTS: 'kordur_calendar_events_v1',
  STUDY_PLANS: 'kordur_study_plans_v1',
  SPACED_REP: 'kordur_spaced_rep_v1',
  FONT_SIZE: 'revi_font_size_v1',
  HIGH_CONTRAST: 'revi_high_contrast_v1',
  TIMER_SETTINGS: 'revi_timer_settings_v1',
  ERROR_NOTEBOOK: 'revi_error_notebook_v1',
  DASHBOARD_CONFIG: 'revi_dashboard_config_v1',
  ACCENT_PALETTE: 'revi_accent_palette_v1'
};

const DB_NAME = 'kordur_files_db';
const STORE_NAME = 'original_files';

/**
 * Generates or retrieves a unique Device Workspace ID for this specific visiting computer/browser.
 * Ensures every computer visiting the web app has its own private local workspace.
 */
export function getOrCreateDeviceId() {
  try {
    let devId = localStorage.getItem(KEYS.DEVICE_ID);
    if (!devId) {
      const rand =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID().slice(0, 8).toUpperCase()
          : Math.random().toString(36).slice(2, 10).toUpperCase();
      devId = `REVI-${rand}`;
      localStorage.setItem(KEYS.DEVICE_ID, devId);
    }
    return devId;
  } catch {
    return 'REVI-LOCAL';
  }
}

export function loadPersonalProfiles() {
  try {
    const raw = localStorage.getItem(KEYS.PROFILES);
    if (!raw) {
      const def = [{ id: 'default', name: 'Minu isiklik töölaud', isDefault: true }];
      localStorage.setItem(KEYS.PROFILES, JSON.stringify(def));
      return def;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const def = [{ id: 'default', name: 'Minu isiklik töölaud', isDefault: true }];
      localStorage.setItem(KEYS.PROFILES, JSON.stringify(def));
      return def;
    }
    return parsed;
  } catch {
    return [{ id: 'default', name: 'Minu isiklik töölaud', isDefault: true }];
  }
}

export function savePersonalProfiles(profiles) {
  try {
    localStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
  } catch {
    // ignore
  }
}

export function getActiveProfileId() {
  try {
    const saved = localStorage.getItem(KEYS.ACTIVE_PROFILE);
    return saved || 'default';
  } catch {
    return 'default';
  }
}

export function setActiveProfileId(profileId) {
  try {
    localStorage.setItem(KEYS.ACTIVE_PROFILE, profileId || 'default');
  } catch {
    // ignore
  }
}

function getScopedKey(baseKey) {
  const activeProfile = getActiveProfileId();
  if (!activeProfile || activeProfile === 'default') {
    return baseKey;
  }
  return `${baseKey}__${activeProfile}`;
}

function getScopedDbKey(materialId) {
  const activeProfile = getActiveProfileId();
  if (!activeProfile || activeProfile === 'default') {
    return materialId;
  }
  return `${activeProfile}::${materialId}`;
}

function openFilesDB() {
  return new Promise((resolve) => {
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

export async function saveOriginalFileBlob(materialId, fileOrFiles) {
  try {
    const db = await openFilesDB();
    if (!db || !fileOrFiles) return;
    const filesArray = Array.isArray(fileOrFiles)
      ? fileOrFiles.filter(Boolean)
      : [fileOrFiles];
    if (filesArray.length === 0) return;

    const firstFile = filesArray[0];
    const buffer = await firstFile.arrayBuffer();
    const filesMeta = await Promise.all(
      filesArray.map(async (f) => ({
        name: f.name,
        type: f.type || 'application/octet-stream',
        buffer: await f.arrayBuffer()
      }))
    );

    const record = {
      name: filesArray.map((f) => f.name).join(', '),
      type: firstFile.type || 'application/octet-stream',
      buffer,
      files: filesMeta
    };
    await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(record, getScopedDbKey(materialId));
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
      const req = tx.objectStore(STORE_NAME).get(getScopedDbKey(materialId));
      req.onsuccess = () => {
        if (req.result && req.result.buffer) {
          const blob = new Blob([req.result.buffer], { type: req.result.type });
          const files = Array.isArray(req.result.files)
            ? req.result.files.map((f) => ({
                name: f.name,
                type: f.type,
                blob: new Blob([f.buffer], { type: f.type })
              }))
            : [{ name: req.result.name, type: req.result.type, blob }];
          resolve({ blob, name: req.result.name, type: req.result.type, files });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deleteOriginalFileBlob(materialId) {
  try {
    const db = await openFilesDB();
    if (!db) return;
    await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(getScopedDbKey(materialId));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
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

export function loadFontSize() {
  try {
    const saved = localStorage.getItem(KEYS.FONT_SIZE);
    if (!saved) return 100;
    if (saved === 'normal') return 100;
    if (saved === 'large') return 115;
    if (saved === 'xlarge') return 130;
    if (saved === 'small') return 90;
    if (saved === 'xsmall') return 80;
    const num = Number(saved);
    if (!isNaN(num) && num >= 70 && num <= 160) return num;
    return 100;
  } catch {
    return 100;
  }
}

export function saveFontSize(size) {
  try {
    localStorage.setItem(KEYS.FONT_SIZE, String(size));
  } catch {
    // ignore
  }
}

export function loadHighContrast() {
  try {
    return localStorage.getItem(KEYS.HIGH_CONTRAST) === 'true';
  } catch {
    return false;
  }
}

export function saveHighContrast(enabled) {
  try {
    localStorage.setItem(KEYS.HIGH_CONTRAST, String(enabled));
  } catch {
    // ignore
  }
}

export function loadTimerSettings() {
  try {
    const raw = localStorage.getItem(KEYS.TIMER_SETTINGS);
    if (!raw) return { focusMinutes: 25, breakMinutes: 5 };
    const parsed = JSON.parse(raw);
    const focusMinutes = Number(parsed.focusMinutes) || 25;
    const breakMinutes = Number(parsed.breakMinutes) || 5;
    return {
      focusMinutes: Math.min(180, Math.max(1, focusMinutes)),
      breakMinutes: Math.min(60, Math.max(1, breakMinutes))
    };
  } catch {
    return { focusMinutes: 25, breakMinutes: 5 };
  }
}

export function saveTimerSettings(settings) {
  try {
    localStorage.setItem(KEYS.TIMER_SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadNavState() {
  try {
    const raw = localStorage.getItem(getScopedKey(KEYS.NAV_STATE));
    if (!raw) return { currentView: 'home', activeMaterialId: null };
    const parsed = JSON.parse(raw);
    const validViews = ['home', 'library', 'calendar', 'mockExam', 'formulas', 'study'];
    const currentView = validViews.includes(parsed?.currentView) ? parsed.currentView : 'home';
    return {
      currentView,
      activeMaterialId: parsed?.activeMaterialId || null
    };
  } catch {
    return { currentView: 'home', activeMaterialId: null };
  }
}

export function saveNavState(navState) {
  try {
    localStorage.setItem(getScopedKey(KEYS.NAV_STATE), JSON.stringify(navState));
  } catch {
    // ignore
  }
}

/**
 * Loads materials and non-destructively merges new schema fields (e.g. enabledFeatures,
 * steps, formulas metadata, topicId) so app updates never wipe user data.
 */
export function loadMaterials() {
  try {
    const matKey = getScopedKey(KEYS.MATERIALS);
    const raw = localStorage.getItem(matKey);
    if (!raw) {
      localStorage.setItem(matKey, JSON.stringify(sampleMaterials));
      return sampleMaterials;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(matKey, JSON.stringify(sampleMaterials));
      return sampleMaterials;
    }

    const upgraded = parsed.map((mat) => {
      const sampleMatch = sampleMaterials.find((s) => s.id === mat.id);
      const mergedFeatures = {
        ...DEFAULT_ENABLED_FEATURES,
        ...(mat.enabledFeatures || {})
      };

      if (sampleMatch) {
        // Preserve any user-edited or newly added cards/exercises, while upgrading base sample items
        const mergedTopics = (sampleMatch.topics || mat.topics).map((sTopic, idx) => {
          const tp = (mat.topics || [])[idx] || {};
          return {
            ...tp,
            ...sTopic,
            formulas: (sTopic.formulas || tp.formulas || []).map((f, fIdx) => ({
              ...(tp.formulas?.[fIdx] || {}),
              ...f
            }))
          };
        });

        const mergedFlashcards = (mat.flashcards || sampleMatch.flashcards).map((fc) => {
          const sCard = sampleMatch.flashcards.find((sc) => sc.id === fc.id);
          if (sCard && !fc.isUserEdited) {
            return { ...fc, ...sCard };
          }
          return { ...(sCard || {}), ...fc };
        });

        const mergedExercises = (sampleMatch.exercises || []).map((sEx) => {
          const existing = (mat.exercises || []).find((e) => e.id === sEx.id);
          // Upgrade sample exercises with short_answer/calculation types & steps unless user custom-edited the question text
          if (existing && existing.isUserEdited) {
            return { ...sEx, ...existing };
          }
          return { ...(existing || {}), ...sEx };
        });

        // Keep any extra custom exercises added by user
        const extraUserExercises = (mat.exercises || []).filter(
          (e) => !sampleMatch.exercises.some((sEx) => sEx.id === e.id)
        );

        return {
          ...sampleMatch,
          ...mat,
          title: sampleMatch.title,
          pages: sampleMatch.pages,
          figures: sampleMatch.figures || mat.figures || [],
          enabledFeatures: mergedFeatures,
          topics: mergedTopics,
          flashcards: mergedFlashcards,
          exercises: [...mergedExercises, ...extraUserExercises]
        };
      }

      // Automatically upgrade already-uploaded user materials to the clean summarized schema (v7)
      if (!mat.isSample && Array.isArray(mat.pages) && mat.pages.length > 0 && (mat.contentSchemaVersion || 0) < 7) {
        try {
          const regenerated = generateStudyContent({
            pages: mat.pages,
            fileType: mat.fileType || 'PDF',
            contentLang: mat.contentLang || 'et',
            title: mat.title || ''
          });
          const userEditedCards = (mat.flashcards || []).filter((fc) => fc.isUserEdited);
          const userEditedExercises = (mat.exercises || []).filter((ex) => ex.isUserEdited);

          return {
            ...mat,
            contentSchemaVersion: 7,
            enabledFeatures: mergedFeatures,
            topics: regenerated.topics,
            figures: regenerated.figures?.length ? regenerated.figures : mat.figures || [],
            flashcards: [...userEditedCards, ...regenerated.flashcards],
            exercises: [...userEditedExercises, ...regenerated.exercises]
          };
        } catch (err) {
          console.warn('Could not regenerate study content for material:', mat.id, err);
        }
      }

      return {
        ...mat,
        contentSchemaVersion: mat.contentSchemaVersion || 7,
        figures: mat.figures || [],
        enabledFeatures: mergedFeatures
      };
    });

    // Deep sanitizer: Purges any stray URL parameters, video IDs, or malformed formulas from previously cached materials
    const isBadUrlText = (str) => {
      if (!str || typeof str !== 'string') return false;
      return (
        /https?:\/\/|www\.|youtube\.com|youtu\.be|\bwatch\?|\bindex=|\blist=|\bchannel=|\bv=[A-Za-z0-9_-]{5,}|&[a-z0-9_]+=|_NN_g/i.test(
          str
        ) ||
        /mõiste\s*[„"'](?:https?|www|url)[”"']/i.test(str)
      );
    };

    const fullySanitized = upgraded.map((mat) => {
      const cleanFlashcards = (mat.flashcards || []).filter(
        (fc) =>
          !isBadUrlText(fc.question) &&
          !isBadUrlText(fc.answer) &&
          !isBadUrlText(fc.term) &&
          !/^(?:https?|www|url)$/i.test(fc.term?.trim() || '')
      );

      const cleanExercises = (mat.exercises || []).filter(
        (ex) => !isBadUrlText(ex.question) && !isBadUrlText(ex.solution)
      );

      const cleanTopics = (mat.topics || []).map((tp) => {
        let cleanTitle = tp.title;
        if (isBadUrlText(cleanTitle)) {
          cleanTitle = `Teema ${tp.id ? tp.id.replace(/\D/g, '') || '1' : '1'}`;
        }
        const cleanFormulas = (tp.formulas || []).filter((f) => {
          const expr = typeof f === 'string' ? f : f?.expression || '';
          const lbl = typeof f === 'object' ? f?.label || '' : '';
          if (isBadUrlText(expr) || isBadUrlText(lbl)) return false;
          return isGenuineFormulaExpression(expr);
        });
        return {
          ...tp,
          title: cleanTitle,
          formulas: cleanFormulas
        };
      });

      return {
        ...mat,
        topics: cleanTopics,
        flashcards: cleanFlashcards,
        exercises: cleanExercises
      };
    });

    localStorage.setItem(matKey, JSON.stringify(fullySanitized));
    return fullySanitized;
  } catch {
    return sampleMaterials;
  }
}

export function saveMaterials(materials) {
  try {
    localStorage.setItem(getScopedKey(KEYS.MATERIALS), JSON.stringify(materials));
  } catch (e) {
    console.warn('Could not save materials to localStorage:', e);
  }
}

export function createDefaultProgressForMaterial(material) {
  if (!material || typeof material !== 'object') {
    return {
      activeTab: 'summary',
      selectedTopicId: 'all',
      flashcards: {
        currentIndex: 0,
        isFlipped: false,
        statusById: {},
        historyById: {},
        activeDeckIds: [],
        isReviewOnlyMode: false,
        isSessionFinished: false
      },
      exercises: {
        currentIndex: 0,
        answersById: {},
        historyById: {},
        activeExerciseIds: [],
        isRetryOnlyMode: false,
        isSessionFinished: false
      },
      quickTest: {
        hasCompleted: false,
        lastScore: null,
        recommendedTopicId: null,
        topicResults: {}
      },
      updatedAt: new Date().toISOString()
    };
  }
  const visibleCards = (material.flashcards || []).filter((c) => c && !c.hidden);
  const visibleExercises = (material.exercises || []).filter((e) => e && !e.hidden);
  return {
    activeTab: 'summary', // 'summary' | 'flashcards' | 'exercises' | 'quickTest' | 'formulas'
    selectedTopicId: 'all',
    flashcards: {
      currentIndex: 0,
      isFlipped: false,
      statusById: {},
      historyById: {}, // tracks array of past statuses e.g. ['review', 'knew']
      activeDeckIds: visibleCards.map((c) => c.id),
      isReviewOnlyMode: false,
      isSessionFinished: false
    },
    exercises: {
      currentIndex: 0,
      answersById: {},
      historyById: {}, // tracks array of booleans e.g. [false, true] for 'mastered_later' detection
      activeExerciseIds: visibleExercises.map((e) => e.id),
      isRetryOnlyMode: false,
      isSessionFinished: false
    },
    quickTest: {
      hasCompleted: false,
      lastScore: null,
      recommendedTopicId: null,
      topicResults: {} // { [topicId]: 'needs_review' | 'mastered' | 'mastered_later' }
    },
    updatedAt: new Date().toISOString()
  };
}

export function loadAllProgress(materials = []) {
  const safeMaterials = Array.isArray(materials) ? materials.filter((m) => m && m.id) : [];
  try {
    const raw = localStorage.getItem(getScopedKey(KEYS.PROGRESS));
    const parsed = raw ? JSON.parse(raw) : {};
    const result = (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? { ...parsed } : {};

    for (const mat of safeMaterials) {
      const def = createDefaultProgressForMaterial(mat);
      if (!result[mat.id]) {
        result[mat.id] = def;
      } else {
        // Non-destructively merge any missing nested keys from newer versions
        result[mat.id] = {
          ...def,
          ...result[mat.id],
          flashcards: {
            ...def.flashcards,
            ...(result[mat.id].flashcards || {}),
            historyById: result[mat.id].flashcards?.historyById || {}
          },
          exercises: {
            ...def.exercises,
            ...(result[mat.id].exercises || {}),
            historyById: result[mat.id].exercises?.historyById || {}
          },
          quickTest: {
            ...def.quickTest,
            ...(result[mat.id].quickTest || {})
          }
        };
      }
    }
    return result;
  } catch {
    const fallback = {};
    for (const mat of safeMaterials) {
      fallback[mat.id] = createDefaultProgressForMaterial(mat);
    }
    return fallback;
  }
}

export function saveAllProgress(progressMap) {
  try {
    localStorage.setItem(getScopedKey(KEYS.PROGRESS), JSON.stringify(progressMap));
  } catch (e) {
    console.warn('Could not save progress to localStorage:', e);
  }
}

export function loadLastSession() {
  try {
    const raw = localStorage.getItem(getScopedKey(KEYS.LAST_SESSION));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLastSession(sessionInfo) {
  try {
    localStorage.setItem(getScopedKey(KEYS.LAST_SESSION), JSON.stringify(sessionInfo));
  } catch {
    // ignore
  }
}

/**
 * SPACED REPETITION ENGINE ("Täna korrata")
 * Stores item-level scheduling: { [itemKey]: { intervalDays, ease, repetitions, nextReviewAt, lastOutcome, wrongCount } }
 */
export function loadSpacedRepetition() {
  try {
    const raw = localStorage.getItem(getScopedKey(KEYS.SPACED_REP));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveSpacedRepetition(srMap) {
  try {
    localStorage.setItem(getScopedKey(KEYS.SPACED_REP), JSON.stringify(srMap));
  } catch {
    // ignore
  }
}

export function recordSpacedRepetitionReview(srMap, itemKey, isSuccess) {
  const now = new Date();
  const prev = srMap[itemKey] || {
    intervalDays: 0,
    ease: 2.3,
    repetitions: 0,
    wrongCount: 0
  };

  let nextIntervalDays;
  let nextRepetitions;
  let nextEase = prev.ease;
  let nextWrongCount = prev.wrongCount || 0;

  if (!isSuccess) {
    // Harder / missed items come back immediately in earlier sessions
    nextIntervalDays = 0;
    nextRepetitions = 0;
    nextEase = Math.max(1.3, prev.ease - 0.25);
    nextWrongCount += 1;
  } else {
    // Confidently answered items get a longer pause between reviews
    nextRepetitions = (prev.repetitions || 0) + 1;
    if (nextRepetitions === 1) {
      nextIntervalDays = 2;
    } else if (nextRepetitions === 2) {
      nextIntervalDays = 5;
    } else {
      nextIntervalDays = Math.round((prev.intervalDays || 4) * nextEase);
    }
    nextEase = Math.min(3.0, prev.ease + 0.1);
  }

  const nextDate = new Date(now.getTime() + nextIntervalDays * 24 * 60 * 60 * 1000);

  const updated = {
    ...srMap,
    [itemKey]: {
      intervalDays: nextIntervalDays,
      ease: nextEase,
      repetitions: nextRepetitions,
      wrongCount: nextWrongCount,
      lastReviewedAt: now.toISOString(),
      nextReviewAt: nextDate.toISOString(),
      lastOutcome: isSuccess ? 'knew' : 'review'
    }
  };

  saveSpacedRepetition(updated);
  return updated;
}

/**
 * Builds the "Täna korrata" (Due Today) queue across all materials that have spacedRepetition enabled,
 * plus any items scheduled for today in active Study Plans!
 * Harder questions come first; confidently answered ones with future nextReviewAt wait until their pause expires.
 */
export function buildDueTodayQueue(materials, progressMap, srMap, studyPlans = []) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const dueItems = [];
  const addedKeys = new Set();

  // Check if any study plan has topics/materials scheduled for today
  const plannedMaterialIdsToday = new Set();
  const plannedTopicIdsToday = new Set();

  for (const plan of studyPlans) {
    for (const session of plan.sessions || []) {
      if (session.date === todayStr && !session.completed) {
        if (session.materialId) plannedMaterialIdsToday.add(session.materialId);
        if (session.topicId) plannedTopicIdsToday.add(session.topicId);
      }
    }
  }

  for (const mat of materials) {
    const features = { ...DEFAULT_ENABLED_FEATURES, ...(mat.enabledFeatures || {}) };
    if (!features.spacedRepetition) continue;

    const matProg = progressMap[mat.id];
    const fcStatus = matProg?.flashcards?.statusById || {};
    const exAnswers = matProg?.exercises?.answersById || {};

    // 1. Check flashcards
    if (features.flashcards) {
      for (const fc of mat.flashcards || []) {
        if (fc.hidden) continue;
        const itemKey = `fc:${mat.id}:${fc.id}`;
        const sr = srMap[itemKey];
        const status = fcStatus[fc.id];
        const isPlannedToday =
          plannedTopicIdsToday.has(fc.topicId) || plannedMaterialIdsToday.has(mat.id);

        const isMarkedReview = status === 'review';
        const isMarkedKnew = status === 'knew';
        const isSrDue = sr ? new Date(sr.nextReviewAt) <= now : false;

        // If confidently answered ('knew') and SR interval is in the future, skip until pause expires
        if (isMarkedKnew && sr && new Date(sr.nextReviewAt) > now) {
          continue;
        }

        // Priority: 1) Marked 'review' or failed SR, 2) Scheduled for today in study plan, 3) Unseen core cards (up to 3 per material)
        let priority = 0;
        if (isMarkedReview || (sr && sr.lastOutcome === 'review')) {
          priority = 100 + (sr?.wrongCount || 1) * 15;
        } else if (isSrDue) {
          priority = 80;
        } else if (isPlannedToday && !isMarkedKnew) {
          priority = 70;
        } else if (!status && !sr) {
          priority = 40;
        }

        if (priority > 0 && !addedKeys.has(itemKey)) {
          addedKeys.add(itemKey);
          dueItems.push({
            itemKey,
            itemType: 'flashcard',
            materialId: mat.id,
            materialTitle: mat.title,
            subject: mat.subject,
            card: fc,
            priority,
            difficultyTag: priority >= 100 ? 'hard' : priority >= 70 ? 'planned' : 'due'
          });
        }
      }
    }

    // 2. Check exercises
    if (features.exercises) {
      for (const ex of mat.exercises || []) {
        if (ex.hidden) continue;
        const itemKey = `ex:${mat.id}:${ex.id}`;
        const sr = srMap[itemKey];
        const ans = exAnswers[ex.id];
        const isPlannedToday =
          plannedTopicIdsToday.has(ex.topicId) || plannedMaterialIdsToday.has(mat.id);

        const isWrong = ans?.checked && !ans.isCorrect;
        const isCorrect = ans?.checked && ans.isCorrect;
        const isSrDue = sr ? new Date(sr.nextReviewAt) <= now : false;

        if (isCorrect && sr && new Date(sr.nextReviewAt) > now) {
          continue;
        }

        let priority = 0;
        if (isWrong || (sr && sr.lastOutcome === 'review')) {
          priority = 110 + (sr?.wrongCount || 1) * 15;
        } else if (isSrDue) {
          priority = 85;
        } else if (isPlannedToday && !isCorrect) {
          priority = 75;
        } else if (!ans && !sr) {
          priority = 35;
        }

        if (priority > 0 && !addedKeys.has(itemKey)) {
          addedKeys.add(itemKey);
          dueItems.push({
            itemKey,
            itemType: 'exercise',
            materialId: mat.id,
            materialTitle: mat.title,
            subject: mat.subject,
            exercise: ex,
            priority,
            difficultyTag: priority >= 100 ? 'hard' : priority >= 70 ? 'planned' : 'due'
          });
        }
      }
    }
  }

  // Sort by priority descending (hardest/wrong items first, then planned, then new/due)
  dueItems.sort((a, b) => b.priority - a.priority);

  // Return top manageable daily batch (up to 10 items, with all high-priority items included)
  const highPriority = dueItems.filter((i) => i.priority >= 70);
  if (highPriority.length >= 6) {
    return highPriority.slice(0, 12);
  }
  return dueItems.slice(0, 8);
}

/**
 * Computes Topic-by-Topic Mastery Breakdown for a material:
 * - 'untested': Pole veel proovinud (Not tried yet)
 * - 'needs_review': Vajab kordamist (Needs review)
 * - 'mastered_later': Tuli hiljem iseseisvalt välja (Previously struggled, later solved independently!)
 * - 'mastered': Kohe selge / Selge (Mastered)
 */
export function getTopicMasteryBreakdown(material, matProgress) {
  const topics = material.topics || [];
  const fcStatus = matProgress?.flashcards?.statusById || {};
  const fcHistory = matProgress?.flashcards?.historyById || {};
  const exAnswers = matProgress?.exercises?.answersById || {};
  const exHistory = matProgress?.exercises?.historyById || {};
  const qtTopicResults = matProgress?.quickTest?.topicResults || {};

  return topics.map((tp, idx) => {
    const topicCards = (material.flashcards || []).filter(
      (c) => !c.hidden && (c.topicId === tp.id || (!c.topicId && idx === 0))
    );
    const topicExercises = (material.exercises || []).filter(
      (e) => !e.hidden && (e.topicId === tp.id || (!e.topicId && idx === 0))
    );

    let attemptedCount = 0;
    let needsReviewCount = 0;
    let masteredLaterCount = 0;
    let masteredCount = 0;

    for (const c of topicCards) {
      const st = fcStatus[c.id];
      const hist = fcHistory[c.id] || [];
      if (st) {
        attemptedCount++;
        if (st === 'review') {
          needsReviewCount++;
        } else if (st === 'knew') {
          if (hist.includes('review')) {
            masteredLaterCount++;
          } else {
            masteredCount++;
          }
        }
      }
    }

    for (const ex of topicExercises) {
      const ans = exAnswers[ex.id];
      const hist = exHistory[ex.id] || [];
      if (ans && ans.checked) {
        attemptedCount++;
        if (!ans.isCorrect) {
          needsReviewCount++;
        } else {
          if (hist.includes(false)) {
            masteredLaterCount++;
          } else {
            masteredCount++;
          }
        }
      }
    }

    const qtStatus = qtTopicResults[tp.id];
    let overallStatus = 'untested';

    if (attemptedCount === 0 && !qtStatus) {
      overallStatus = 'untested';
    } else if (needsReviewCount > 0 || qtStatus === 'needs_review') {
      // If user later solved everything in this topic, upgrade to mastered_later
      if (needsReviewCount === 0 && (masteredCount > 0 || masteredLaterCount > 0)) {
        overallStatus = 'mastered_later';
      } else {
        overallStatus = 'needs_review';
      }
    } else if (masteredLaterCount > 0 || qtStatus === 'mastered_later') {
      overallStatus = 'mastered_later';
    } else {
      overallStatus = 'mastered';
    }

    return {
      topic: tp,
      index: idx,
      totalItems: topicCards.length + topicExercises.length,
      attemptedCount,
      needsReviewCount,
      masteredLaterCount,
      masteredCount,
      status: overallStatus
    };
  });
}

/**
 * CALENDAR EVENTS & STUDY PLANS PERSISTENCE
 */
const DEFAULT_SAMPLE_EVENTS = [
  {
    id: 'evt-sample-1',
    title: 'Matemaatilise analüüsi kontrolltöö: tuletised',
    type: 'test', // 'test' | 'exam' | 'homework' | 'project' | 'other'
    subject: 'Matemaatiline analüüs',
    color: '#8c4a27', // warm terracotta / teak
    date: '2026-11-13',
    time: '10:15',
    notes: 'Slaidid 1–5: tuletise definitsioon, puutuja võrrand, korrutise ja jagatise reegel, ahelreegel ning ekstreemumid.',
    completed: false,
    linkedMaterialIds: ['sample-tuletised-et'],
    dailyMinutes: 25,
    planDays: 5
  }
];

export function loadCalendarEvents() {
  try {
    const evKey = getScopedKey(KEYS.CALENDAR_EVENTS);
    const raw = localStorage.getItem(evKey);
    if (!raw) {
      localStorage.setItem(evKey, JSON.stringify(DEFAULT_SAMPLE_EVENTS));
      return DEFAULT_SAMPLE_EVENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SAMPLE_EVENTS;
  } catch {
    return DEFAULT_SAMPLE_EVENTS;
  }
}

export function saveCalendarEvents(events) {
  try {
    localStorage.setItem(getScopedKey(KEYS.CALENDAR_EVENTS), JSON.stringify(events));
  } catch {
    // ignore
  }
}

export function loadStudyPlans() {
  try {
    const raw = localStorage.getItem(getScopedKey(KEYS.STUDY_PLANS));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function saveStudyPlans(plans) {
  try {
    localStorage.setItem(getScopedKey(KEYS.STUDY_PLANS), JSON.stringify(plans));
  } catch {
    // ignore
  }
}

/**
 * Generates or regenerates a multi-day Study Plan ("Koosta kordamisplaan") for a calendar event
 * based on linked materials, deadline date, and available daily minutes!
 */
export function generateStudyPlanForEvent(
  event,
  materials,
  startDateStr = null,
  customDays = null
) {
  const baseDate = startDateStr ? new Date(startDateStr) : new Date();
  const startDay = new Date(
    Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate())
  );

  const [y, m, d] = (event.date || '').split('-').map(Number);
  const targetDay =
    y && m && d
      ? new Date(Date.UTC(y, m - 1, d))
      : new Date(startDay.getTime() + 5 * 86400000);

  const naturalDiffDays = Math.max(
    1,
    Math.ceil((targetDay.getTime() - startDay.getTime()) / 86400000)
  );

  // If user explicitly chose how many days (mitme päeva peale), honor that; else default to days until deadline
  const chosenDays = customDays !== null && customDays !== undefined
    ? Number(customDays)
    : event.planDays !== null && event.planDays !== undefined
    ? Number(event.planDays)
    : naturalDiffDays;

  const totalDays = Math.max(1, Math.min(60, chosenDays || 5));

  const linkedMaterials = materials.filter((mat) =>
    (event.linkedMaterialIds || []).includes(mat.id)
  );

  // Collect all topics from linked materials
  const units = [];
  for (const mat of linkedMaterials) {
    for (const tp of mat.topics || []) {
      const cardCount = (mat.flashcards || []).filter(
        (c) => !c.hidden && c.topicId === tp.id
      ).length;
      const exCount = (mat.exercises || []).filter(
        (e) => !e.hidden && e.topicId === tp.id
      ).length;
      units.push({
        materialId: mat.id,
        materialTitle: mat.title,
        topicId: tp.id,
        topicTitle: tp.title,
        itemCount: Math.max(2, cardCount + exCount)
      });
    }
  }

  if (units.length === 0 && linkedMaterials.length > 0) {
    for (const mat of linkedMaterials) {
      units.push({
        materialId: mat.id,
        materialTitle: mat.title,
        topicId: 'all',
        topicTitle: mat.title,
        itemCount: (mat.flashcards?.length || 0) + (mat.exercises?.length || 0)
      });
    }
  }

  const dailyMinutes = Math.max(5, Number(event.dailyMinutes) || 20);
  const eventColor = event.color || '#8c4a27';
  const sessions = [];

  for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
    const sessionDate = new Date(startDay.getTime() + dayIdx * 86400000)
      .toISOString()
      .slice(0, 10);

    // Distribute topics evenly across the available days; if more days than topics, add final review / mock test days
    const assignedUnit = units[dayIdx % Math.max(1, units.length)];
    const isFinalReview = dayIdx >= units.length;

    if (assignedUnit) {
      sessions.push({
        id: `sess-${event.id}-${dayIdx + 1}`,
        eventId: event.id,
        eventTitle: event.title,
        eventColor,
        date: sessionDate,
        dayNumber: dayIdx + 1,
        totalDays,
        minutes: dailyMinutes,
        materialId: assignedUnit.materialId,
        materialTitle: assignedUnit.materialTitle,
        topicId: assignedUnit.topicId,
        topicTitle: isFinalReview
          ? `${assignedUnit.topicTitle} (kinnistamine ja üldkordamine)`
          : assignedUnit.topicTitle,
        questionCount: Math.max(3, Math.min(10, Math.round(dailyMinutes / 3))),
        completed: false
      });
    }
  }

  return {
    id: `plan-${event.id}`,
    eventId: event.id,
    eventTitle: event.title,
    eventColor,
    targetDate: event.date,
    dailyMinutes,
    planDays: totalDays,
    linkedMaterialIds: event.linkedMaterialIds || [],
    createdAt: new Date().toISOString(),
    sessions
  };
}

export function calculateMaterialStats(material, matProgress) {
  const features = { ...DEFAULT_ENABLED_FEATURES, ...(material.enabledFeatures || {}) };
  const visibleCards = features.flashcards
    ? (material.flashcards || []).filter((c) => !c.hidden)
    : [];
  const visibleExercises = features.exercises
    ? (material.exercises || []).filter((e) => !e.hidden)
    : [];

  const totalCards = visibleCards.length;
  const totalExercises = visibleExercises.length;

  const statusById = matProgress?.flashcards?.statusById || {};
  const answersById = matProgress?.exercises?.answersById || {};

  let knewCards = 0;
  let reviewCards = 0;
  let answeredCards = 0;

  for (const fc of visibleCards) {
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

  for (const ex of visibleExercises) {
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
  const completedUnits =
    knewCards + reviewCards * 0.5 + correctExercises + incorrectExercises * 0.5;
  const progressPercent =
    totalItems > 0 ? Math.min(100, Math.round((completedUnits / totalItems) * 100)) : 0;
  const hasStarted =
    answeredCards > 0 ||
    answeredExercises > 0 ||
    (matProgress?.flashcards?.currentIndex || 0) > 0 ||
    (matProgress?.exercises?.currentIndex || 0) > 0 ||
    Boolean(matProgress?.quickTest?.hasCompleted);

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

/**
 * Combines 2 or more materials (or parsed file results) into a single unified study collection
 * with sequential page numbering and clear per-file sourceRef labels.
 */
export function combineMaterialsIntoCollection({
  materialsToCombine,
  title,
  subject,
  contentLang = 'et',
  enabledFeatures = DEFAULT_ENABLED_FEATURES
}) {
  const now = new Date().toISOString();
  const colId = `col-${Date.now()}`;

  const combinedPages = [];
  const combinedFigures = [];
  const combinedTopics = [];
  const combinedFlashcards = [];
  const combinedExercises = [];
  const sourceFileNames = [];

  let pageOffset = 0;

  materialsToCombine.forEach((mat, matIdx) => {
    const shortSource =
      mat.fileName || mat.title || `Materjal ${matIdx + 1}`;
    sourceFileNames.push(shortSource);

    const matPages = mat.pages || [];
    const pageNumMap = {};

    matPages.forEach((p, pIdx) => {
      const newPageNum = pageOffset + pIdx + 1;
      pageNumMap[p.pageNumber] = newPageNum;
      combinedPages.push({
        ...p,
        pageNumber: newPageNum,
        sourceFileName: shortSource,
        originalPageNumber: p.pageNumber,
        title: `${shortSource} • ${p.title || `Lk ${p.pageNumber}`}`
      });
    });

    const topicIdMap = {};
    (mat.topics || []).forEach((tp, tIdx) => {
      const newTopicId = `${colId}-tp-${matIdx + 1}-${tIdx + 1}`;
      topicIdMap[tp.id] = newTopicId;

      const origNum = tp.sourceRef?.number || 1;
      const mappedNum = pageNumMap[origNum] || pageOffset + 1;
      const origLabel = tp.sourceRef?.label || `Slaid ${origNum}`;
      const newLabel = origLabel.includes(shortSource)
        ? origLabel
        : `${shortSource} • ${origLabel}`;

      const updatedFormulas = (tp.formulas || []).map((f) => {
        if (typeof f === 'string') return f;
        return {
          ...f,
          sourceRef: {
            ...(f.sourceRef || {}),
            number: pageNumMap[f.sourceRef?.number] || mappedNum,
            label: f.sourceRef?.label?.includes(shortSource)
              ? f.sourceRef.label
              : `${shortSource} • ${f.sourceRef?.label || origLabel}`
          }
        };
      });

      combinedTopics.push({
        ...tp,
        id: newTopicId,
        title:
          materialsToCombine.length > 1
            ? `${tp.title} (${shortSource.replace(/\.[^/.]+$/, '')})`
            : tp.title,
        sourceRef: {
          ...(tp.sourceRef || { type: 'slide' }),
          number: mappedNum,
          label: newLabel
        },
        formulas: updatedFormulas
      });
    });

    (mat.flashcards || []).forEach((fc, fcIdx) => {
      if (fc.hidden) return;
      const origNum = fc.sourceRef?.number || 1;
      const mappedNum = pageNumMap[origNum] || pageOffset + 1;
      const origLabel = fc.sourceRef?.label || `Slaid ${origNum}`;
      const newLabel = origLabel.includes(shortSource)
        ? origLabel
        : `${shortSource} • ${origLabel}`;

      combinedFlashcards.push({
        ...fc,
        id: `${colId}-fc-${matIdx + 1}-${fcIdx + 1}`,
        topicId: topicIdMap[fc.topicId] || combinedTopics[combinedTopics.length - 1]?.id,
        sourceRef: {
          ...(fc.sourceRef || { type: 'slide' }),
          number: mappedNum,
          label: newLabel
        }
      });
    });

    (mat.exercises || []).forEach((ex, exIdx) => {
      if (ex.hidden) return;
      const origNum = ex.sourceRef?.number || 1;
      const mappedNum = pageNumMap[origNum] || pageOffset + 1;
      const origLabel = ex.sourceRef?.label || `Slaid ${origNum}`;
      const newLabel = origLabel.includes(shortSource)
        ? origLabel
        : `${shortSource} • ${origLabel}`;

      combinedExercises.push({
        ...ex,
        id: `${colId}-ex-${matIdx + 1}-${exIdx + 1}`,
        topicId: topicIdMap[ex.topicId] || combinedTopics[combinedTopics.length - 1]?.id,
        sourceRef: {
          ...(ex.sourceRef || { type: 'slide' }),
          number: mappedNum,
          label: newLabel
        }
      });
    });

    (mat.figures || []).forEach((fig) => {
      const origNum = fig.sourceRef?.number || 1;
      const mappedNum = pageNumMap[origNum] || pageOffset + 1;
      const origLabel = fig.sourceRef?.label || `Slaid ${origNum}`;
      const newLabel = origLabel.includes(shortSource)
        ? origLabel
        : `${shortSource} • ${origLabel}`;
      const nextFigNum = combinedFigures.length + 1;

      combinedFigures.push({
        ...fig,
        id: `${colId}-fig-${nextFigNum}`,
        figureNumber: nextFigNum,
        topicId:
          topicIdMap[fig.topicId] ||
          combinedTopics[combinedTopics.length - 1]?.id,
        sourceRef: {
          ...(fig.sourceRef || { type: 'slide' }),
          number: mappedNum,
          label: newLabel
        }
      });
    });

    pageOffset += Math.max(1, matPages.length);
  });

  return {
    id: colId,
    contentSchemaVersion: 3,
    isSample: false,
    isCollection: materialsToCombine.length > 1,
    sourceFileNames,
    title: title || sourceFileNames.join(' + '),
    subject: subject || materialsToCombine[0]?.subject || 'Matemaatiline analüüs',
    fileName: sourceFileNames.join(', '),
    fileType:
      materialsToCombine.length > 1
        ? 'KOGUM'
        : materialsToCombine[0]?.fileType || 'DOC',
    contentLang,
    createdAt: now,
    lastOpenedAt: now,
    enabledFeatures: {
      ...DEFAULT_ENABLED_FEATURES,
      ...(enabledFeatures || {})
    },
    pages: combinedPages,
    figures: combinedFigures,
    topics: combinedTopics,
    flashcards: combinedFlashcards,
    exercises: combinedExercises
  };
}

/**
 * Exports all data for the active personal profile on this computer as a JSON object.
 */
export function exportPersonalWorkspace() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    deviceId: getOrCreateDeviceId(),
    profileId: getActiveProfileId(),
    materials: loadMaterials(),
    progress: loadAllProgress(loadMaterials()),
    calendarEvents: loadCalendarEvents(),
    studyPlans: loadStudyPlans(),
    spacedRepetition: loadSpacedRepetition()
  };
}

/**
 * Imports a backup JSON object into the active personal profile on this computer.
 */
export function importPersonalWorkspace(payload) {
  if (!payload || !Array.isArray(payload.materials)) {
    throw new Error('INVALID_BACKUP');
  }
  saveMaterials(payload.materials);
  if (payload.progress && typeof payload.progress === 'object') {
    saveAllProgress(payload.progress);
  }
  if (Array.isArray(payload.calendarEvents)) {
    saveCalendarEvents(payload.calendarEvents);
  }
  if (Array.isArray(payload.studyPlans)) {
    saveStudyPlans(payload.studyPlans);
  }
  if (payload.spacedRepetition && typeof payload.spacedRepetition === 'object') {
    saveSpacedRepetition(payload.spacedRepetition);
  }
}

/**
 * Clears all user-uploaded materials in the active personal profile on this device,
 * restoring only the built-in sample materials.
 */
export async function clearActiveProfileMaterials() {
  const currentMats = loadMaterials();
  for (const mat of currentMats) {
    if (!mat.isSample) {
      await deleteOriginalFileBlob(mat.id);
    }
  }
  saveMaterials(sampleMaterials);
  const freshProg = loadAllProgress(sampleMaterials);
  saveAllProgress(freshProg);
  saveLastSession(null);
}

/* =========================================================================
   6. OMA TÖÖLAUD: AKTSENTVÄRVID JA KOHANDATAV PAIGUTUS
   ========================================================================= */

export const ACCENT_PALETTES = [
  {
    id: 'sapphire',
    nameET: 'Kuninglik safiir',
    nameEN: 'Royal Sapphire',
    hex: '#3B5BF6',
    hover: '#2643D8',
    soft: 'rgba(59, 91, 246, 0.09)',
    border: 'rgba(59, 91, 246, 0.28)',
    text: '#1E40AF',
    darkText: '#60A5FA',
    darkSoft: 'rgba(59, 91, 246, 0.16)',
    darkBorder: 'rgba(96, 165, 250, 0.35)'
  },
  {
    id: 'emerald',
    nameET: 'Akadeemiline smaragd',
    nameEN: 'Academic Emerald',
    hex: '#059669',
    hover: '#047857',
    soft: 'rgba(5, 150, 105, 0.09)',
    border: 'rgba(5, 150, 105, 0.28)',
    text: '#065F46',
    darkText: '#34D399',
    darkSoft: 'rgba(16, 185, 129, 0.16)',
    darkBorder: 'rgba(52, 211, 153, 0.35)'
  },
  {
    id: 'terracotta',
    nameET: 'Soe terrakota',
    nameEN: 'Warm Terracotta',
    hex: '#C2410C',
    hover: '#9A3412',
    soft: 'rgba(194, 65, 12, 0.09)',
    border: 'rgba(194, 65, 12, 0.28)',
    text: '#9A3412',
    darkText: '#FB923C',
    darkSoft: 'rgba(249, 115, 22, 0.16)',
    darkBorder: 'rgba(251, 146, 60, 0.35)'
  },
  {
    id: 'amethyst',
    nameET: 'Sügav ametüst',
    nameEN: 'Deep Amethyst',
    hex: '#7C3AED',
    hover: '#6D28D9',
    soft: 'rgba(124, 58, 237, 0.09)',
    border: 'rgba(124, 58, 237, 0.28)',
    text: '#5B21B6',
    darkText: '#C084FC',
    darkSoft: 'rgba(168, 85, 247, 0.16)',
    darkBorder: 'rgba(192, 132, 252, 0.35)'
  },
  {
    id: 'teal',
    nameET: 'Meresinine teal',
    nameEN: 'Marine Teal',
    hex: '#0D9488',
    hover: '#0F766E',
    soft: 'rgba(13, 148, 136, 0.09)',
    border: 'rgba(13, 148, 136, 0.28)',
    text: '#115E59',
    darkText: '#2DD4BF',
    darkSoft: 'rgba(20, 184, 166, 0.16)',
    darkBorder: 'rgba(45, 212, 191, 0.35)'
  },
  {
    id: 'ochre',
    nameET: 'Merevaik & ooker',
    nameEN: 'Amber & Ochre',
    hex: '#B45309',
    hover: '#92400E',
    soft: 'rgba(180, 83, 9, 0.09)',
    border: 'rgba(180, 83, 9, 0.28)',
    text: '#78350F',
    darkText: '#FBBF24',
    darkSoft: 'rgba(245, 158, 11, 0.16)',
    darkBorder: 'rgba(251, 191, 36, 0.35)'
  }
];

export function loadAccentTheme() {
  try {
    const saved = localStorage.getItem(KEYS.ACCENT_PALETTE);
    if (saved && ACCENT_PALETTES.some((p) => p.id === saved)) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'sapphire';
}

export function saveAccentTheme(paletteId) {
  try {
    localStorage.setItem(KEYS.ACCENT_PALETTE, paletteId);
    applyAccentTheme(paletteId);
  } catch {
    // ignore
  }
}

export function applyAccentTheme(paletteId) {
  const palette =
    ACCENT_PALETTES.find((p) => p.id === paletteId) || ACCENT_PALETTES[0];
  if (typeof document !== 'undefined' && document.documentElement) {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.style.setProperty('--accent', isDark ? (palette.darkText || palette.hex) : palette.hex);
    root.style.setProperty('--accent-hover', palette.hover);
    root.style.setProperty('--accent-soft', isDark ? (palette.darkSoft || 'rgba(255,255,255,0.08)') : palette.soft);
    root.style.setProperty('--accent-border', isDark ? (palette.darkBorder || 'rgba(255,255,255,0.16)') : palette.border);
    root.style.setProperty('--accent-text', isDark ? (palette.darkText || palette.hex) : palette.text);
  }
}

export const DEFAULT_DASHBOARD_WIDGETS = [
  { id: 'deadlines', visible: true, labelET: 'Tähtajad ja kontrolltööd', labelEN: 'Upcoming Deadlines' },
  { id: 'quickStudy', visible: true, labelET: 'Konkreetne õppimine', labelEN: 'Targeted Study' },
  { id: 'continueStudy', visible: true, labelET: 'Pooleliolev õppimine', labelEN: 'Continue Study' },
  { id: 'errorNotebook', visible: true, labelET: 'Vigade märkmik', labelEN: 'Mistake Journal' },
  { id: 'dueToday', visible: true, labelET: 'Igapäevane kordamine', labelEN: 'Daily Review' },
  { id: 'subjectsOverview', visible: true, labelET: 'Õppeainete ja teemade ülevaade', labelEN: 'Subjects Overview' }
];

export function loadDashboardConfig() {
  try {
    const raw = localStorage.getItem(getScopedKey(KEYS.DASHBOARD_CONFIG));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validParsed = parsed.filter((item) => item && typeof item === 'object' && item.id);
        if (validParsed.length > 0) {
          // Merge with defaults in case new widgets are added
          const merged = validParsed.map((item) => {
            const def = DEFAULT_DASHBOARD_WIDGETS.find((w) => w.id === item.id);
            return { ...(def || {}), ...item };
          });
          DEFAULT_DASHBOARD_WIDGETS.forEach((def) => {
            if (!merged.some((m) => m.id === def.id)) {
              merged.push(def);
            }
          });
          return merged;
        }
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_DASHBOARD_WIDGETS;
}

export function saveDashboardConfig(config) {
  try {
    localStorage.setItem(getScopedKey(KEYS.DASHBOARD_CONFIG), JSON.stringify(config));
  } catch {
    // ignore
  }
}

/* =========================================================================
   2. VIGADE MÄRKMIK: DIAGNOOS, VALE VASTUSE PÕHJENDUS JA SARNASED ÜLESANDED
   ========================================================================= */

export const INITIAL_SAMPLE_MISTAKE = {
  id: 'err-sample-1',
  materialId: 'mat-derivatives',
  materialTitle: 'Tuletised – funktsiooni muutumiskiirus ja diferentseerimine',
  subject: 'Matemaatiline analüüs',
  question: "Arvutusülesanne: leia funktsiooni f(x) = 3x⁴ - 5x² + 7x - 12 tuletis f'(x) ja arvuta selle täpne väärtus kohal x = 1.",
  userAnswer: "f'(x) = 12x³ - 5x + 7  ning  f'(1) = 14",
  correctAnswer: "f'(x) = 12x³ - 10x + 7  ning  f'(1) = 9",
  errorType: 'calculation', // 'formula_selection' | 'calculation' | 'conceptual' | 'condition_missed'
  errorTypeLabelET: 'Arvutus- või kordajaviga',
  errorTypeLabelEN: 'Calculation / coefficient error',
  diagnosis: 'Liikme (-5x²) tuletise võtmisel unustati kordaja 5 korrutada astmenäitajaga 2: (5x²)\' = 10x, mitte 5x.',
  howToThink: 'Rakenda astmefunktsiooni reeglit järjekindlalt: d/dx [c · xⁿ] = c · n · xⁿ⁻¹. Seega (-5) · 2 · x¹ = -10x. Seejärel asenda x = 1: 12(1) - 10(1) + 7 = 9.',
  similarTask: {
    question: "Arvutusülesanne kordamiseks: leia funktsiooni g(x) = 2x³ - 4x² + 3x - 5 tuletis g'(x) ja arvuta g'(1).",
    solution: "1. Tuletis g'(x) = 6x² - 8x + 3.  2. Kohal x = 1: g'(1) = 6(1) - 8(1) + 3 = 1."
  },
  resolved: false,
  createdAt: new Date().toISOString()
};

export function diagnoseMistake({
  question = '',
  userAnswer = '',
  correctAnswer = '',
  hint = '',
  isEN = false
}) {
  const u = String(userAnswer).toLowerCase();
  const c = String(correctAnswer).toLowerCase();
  const q = String(question).toLowerCase();

  // 1. Formula selection error
  const isFormulaMismatch =
    (u.includes('korrutis') && c.includes('jagatis')) ||
    (u.includes('puutuja') && c.includes('funktsiooni väärtus')) ||
    (u.includes('integr') && c.includes('tuletis')) ||
    /[+*]/.test(u) !== /[+*]/.test(c);

  if (isFormulaMismatch) {
    return {
      errorType: 'formula_selection',
      errorTypeLabelET: 'Valemi või meetodi valimise viga',
      errorTypeLabelEN: 'Formula or method selection error',
      diagnosis: isEN
        ? 'An incorrect formula or calculus rule was applied to this problem structure.'
        : 'Ülesandele rakendati valet reeglit või seost, mis ei vasta antud matemaatilisele konstruktsioonile.',
      howToThink: isEN
        ? 'First analyze the main operation of the expression (product, quotient, or power) before applying derivative rules.'
        : 'Tuvasta esmalt avaldise põhitehe (kas tegemist on korrutise, liitfunktsiooni või astmega) ning vali reegel vastavalt sellele.'
    };
  }

  // 2. Calculation / arithmetic / sign error
  const hasNumbers = /\d/.test(u) && /\d/.test(c);
  if (hasNumbers) {
    const isSignDiff = (u.includes('-') && !c.includes('-')) || (!u.includes('-') && c.includes('-'));
    return {
      errorType: 'calculation',
      errorTypeLabelET: isSignDiff ? 'Märgierinevus (pluss/miinus)' : 'Arvutus- või kordajaviga',
      errorTypeLabelEN: isSignDiff ? 'Sign difference (+/-)' : 'Calculation or coefficient error',
      diagnosis: isEN
        ? 'The algebraic structure was recognized, but an arithmetic or sign discrepancy occurred during evaluation.'
        : (isSignDiff
            ? 'Arutluse põhimõte oli õige, kuid tekkis märgikonflikt (negatiivne/positiivne märk).'
            : 'Tuletise kuju oli üldjoontes õige, kuid koefitsientide korrutamisel või lõppväärtuse arvutamisel tekkis viga.'),
      howToThink: isEN
        ? 'Double check intermediate signs and substitute values term-by-term.'
        : 'Kontrolli eraldi iga liikme märki ja kordajat ning soorita asendamine samm-sammult.'
    };
  }

  // 3. Condition or edge case missed
  if (q.includes('miinimum') || q.includes('maksimum') || q.includes('kasvab') || q.includes('kahaneb')) {
    return {
      errorType: 'condition_missed',
      errorTypeLabelET: 'Tingimuse või tunnuse märkamata jätmine',
      errorTypeLabelEN: 'Condition or criterion missed',
      diagnosis: isEN
        ? 'A necessary stationary or boundary condition was missed.'
        : 'Tähelepanuta jäi oluline ekstreemumi või monotoonsuse lisatingimus (nt f\'(x) = 0).',
      howToThink: isEN
        ? 'Remember that local extrema occur where the derivative equals zero or does not exist.'
        : 'Meenuta, et lokaalsed ekstreemumid saavad tekkida vaid seal, kus tuletis võrdub nulliga.'
    };
  }

  // 4. Conceptual misunderstanding (default)
  return {
    errorType: 'conceptual',
    errorTypeLabelET: 'Mõiste või tähenduse vääritimõistmine',
    errorTypeLabelEN: 'Conceptual misunderstanding',
    diagnosis: isEN
      ? 'The chosen answer reflects a confusion between distinct theoretical concepts.'
      : 'Valitud vastus viitab kahe erineva mõiste või füüsikalise/geomeetrilise tähenduse segi ajamisele.',
    howToThink: isEN
      ? 'Contrast the definition with similar concepts and verify what the question specifically asks for.'
      : 'Võrdle mõiste definitsiooni lähedaste terminitega ning pööra tähelepanu küsimuse täpsele fookusele.'
  };
}

export function generateSimilarTask({ question, correctAnswer, isEN = false }) {
  if (question.includes('3x⁴ - 5x²') || question.includes('f(x) =')) {
    return {
      question: isEN
        ? "Follow-up problem: Find the derivative of f(x) = 2x³ - 6x² + 4x - 1 and evaluate f'(1)."
        : "Järgmine proovikivi: leia funktsiooni f(x) = 2x³ - 6x² + 4x - 1 tuletis f'(x) ja arvuta f'(1).",
      solution: isEN
        ? "1. f'(x) = 6x² - 12x + 4.  2. f'(1) = 6(1) - 12(1) + 4 = -2."
        : "1. f'(x) = 6x² - 12x + 4.  2. f'(1) = 6(1) - 12(1) + 4 = -2."
    };
  }
  if (question.includes('puutuja') || question.includes('tangent') || question.includes('tõus')) {
    return {
      question: isEN
        ? "Follow-up problem: Find the tangent slope k of y = x² + 2x at x₀ = 3."
        : "Järgmine proovikivi: leia funktsiooni y = x² + 2x graafiku puutuja tõus k kohal x₀ = 3.",
      solution: isEN
        ? "1. y' = 2x + 2.  2. k = y'(3) = 2(3) + 2 = 8."
        : "1. y' = 2x + 2.  2. k = y'(3) = 2(3) + 2 = 8."
    };
  }
  if (question.includes('kiirus') || question.includes('s(t)')) {
    return {
      question: isEN
        ? "Follow-up problem: A particle moves with s(t) = 2t² + 5t. Find the instantaneous velocity v(4)."
        : "Järgmine proovikivi: punktmass liigub seaduse s(t) = 2t² + 5t järgi. Leia hetkkiirus v(4).",
      solution: isEN
        ? "1. v(t) = s'(t) = 4t + 5.  2. v(4) = 4(4) + 5 = 21 m/s."
        : "1. v(t) = s'(t) = 4t + 5.  2. v(4) = 4(4) + 5 = 21 m/s."
    };
  }

  return {
    question: isEN
      ? `Targeted follow-up: Explain the fundamental rule needed to solve: "${question.slice(0, 70)}..."`
      : `Suunatud kordamisülesanne: milline reegel või valem võimaldab lahendada ülesannet: „${question.slice(0, 70)}...“?`,
    solution: isEN
      ? `Correct answer to remember: ${correctAnswer}`
      : `Meelde jäetav õige seos: ${correctAnswer}`
  };
}

export function loadErrorNotebook() {
  try {
    const raw = localStorage.getItem(getScopedKey(KEYS.ERROR_NOTEBOOK));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((e) => e && typeof e === 'object' && e.id);
      }
    }
  } catch {
    // fallback
  }
  // Return sample mistake initially so users can see the notebook immediately
  return [INITIAL_SAMPLE_MISTAKE];
}

export function saveErrorNotebook(errors) {
  try {
    localStorage.setItem(getScopedKey(KEYS.ERROR_NOTEBOOK), JSON.stringify(errors));
  } catch {
    // ignore
  }
}

export function recordMistake({
  materialId = '',
  materialTitle = '',
  subject = '',
  question = '',
  userAnswer = '',
  correctAnswer = '',
  sourceRef = null,
  isEN = false
}) {
  try {
    const current = loadErrorNotebook();
    // Avoid exact duplicate unresolved entries for the same question within a short period
    const existingIdx = current.findIndex(
      (e) => !e.resolved && e.question.trim() === question.trim()
    );

    const diagnosisInfo = diagnoseMistake({
      question,
      userAnswer,
      correctAnswer,
      isEN
    });

    const similarTask = generateSimilarTask({
      question,
      correctAnswer,
      isEN
    });

    const newMistake = {
      id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      materialId,
      materialTitle,
      subject,
      question,
      userAnswer,
      correctAnswer,
      errorType: diagnosisInfo.errorType,
      errorTypeLabelET: diagnosisInfo.errorTypeLabelET,
      errorTypeLabelEN: diagnosisInfo.errorTypeLabelEN,
      diagnosis: diagnosisInfo.diagnosis,
      howToThink: diagnosisInfo.howToThink,
      similarTask,
      sourceRef,
      resolved: false,
      createdAt: new Date().toISOString()
    };

    let updated;
    if (existingIdx !== -1) {
      updated = [...current];
      updated[existingIdx] = { ...updated[existingIdx], ...newMistake, id: updated[existingIdx].id };
    } else {
      updated = [newMistake, ...current].slice(0, 50); // keep up to 50 entries
    }

    saveErrorNotebook(updated);
    return newMistake;
  } catch (err) {
    console.warn('Could not record mistake in notebook:', err);
    return null;
  }
}

export function resolveMistake(errorId, isResolved = true) {
  try {
    const current = loadErrorNotebook();
    const updated = current.map((e) =>
      e.id === errorId ? { ...e, resolved: isResolved, resolvedAt: isResolved ? new Date().toISOString() : null } : e
    );
    saveErrorNotebook(updated);
    return updated;
  } catch {
    return [];
  }
}

export function deleteMistake(errorId) {
  try {
    const current = loadErrorNotebook();
    const updated = current.filter((e) => e.id !== errorId);
    saveErrorNotebook(updated);
    return updated;
  } catch {
    return [];
  }
}

