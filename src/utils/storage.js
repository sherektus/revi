import { sampleMaterials, DEFAULT_ENABLED_FEATURES } from '../data/sampleMaterial';

const KEYS = {
  UI_LANG: 'kordur_ui_lang',
  THEME: 'kordur_theme',
  MATERIALS: 'kordur_materials_v1',
  PROGRESS: 'kordur_progress_v1',
  LAST_SESSION: 'kordur_last_session_v1',
  NAV_STATE: 'kordur_nav_state_v1',
  CALENDAR_EVENTS: 'kordur_calendar_events_v1',
  STUDY_PLANS: 'kordur_study_plans_v1',
  SPACED_REP: 'kordur_spaced_rep_v1'
};

const DB_NAME = 'kordur_files_db';
const STORE_NAME = 'original_files';

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
      tx.objectStore(STORE_NAME).delete(materialId);
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

export function loadNavState() {
  try {
    const raw = localStorage.getItem(KEYS.NAV_STATE);
    if (!raw) return { currentView: 'home', activeMaterialId: null };
    const parsed = JSON.parse(raw);
    return {
      currentView: parsed.currentView || 'home',
      activeMaterialId: parsed.activeMaterialId || null
    };
  } catch {
    return { currentView: 'home', activeMaterialId: null };
  }
}

export function saveNavState(navState) {
  try {
    localStorage.setItem(KEYS.NAV_STATE, JSON.stringify(navState));
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

      return {
        ...mat,
        figures: mat.figures || [],
        enabledFeatures: mergedFeatures
      };
    });

    localStorage.setItem(KEYS.MATERIALS, JSON.stringify(upgraded));
    return upgraded;
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
  const visibleCards = (material.flashcards || []).filter((c) => !c.hidden);
  const visibleExercises = (material.exercises || []).filter((e) => !e.hidden);
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
  try {
    const raw = localStorage.getItem(KEYS.PROGRESS);
    const parsed = raw ? JSON.parse(raw) : {};
    const result = { ...parsed };

    for (const mat of materials) {
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
 * SPACED REPETITION ENGINE ("Täna korrata")
 * Stores item-level scheduling: { [itemKey]: { intervalDays, ease, repetitions, nextReviewAt, lastOutcome, wrongCount } }
 */
export function loadSpacedRepetition() {
  try {
    const raw = localStorage.getItem(KEYS.SPACED_REP);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSpacedRepetition(srMap) {
  try {
    localStorage.setItem(KEYS.SPACED_REP, JSON.stringify(srMap));
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
    date: '2026-11-13',
    time: '10:15',
    notes: 'Slaidid 1–5: tuletise definitsioon, puutuja võrrand, korrutise ja jagatise reegel, ahelreegel ning ekstreemumid.',
    completed: false,
    linkedMaterialIds: ['sample-tuletised-et'],
    dailyMinutes: 25
  }
];

export function loadCalendarEvents() {
  try {
    const raw = localStorage.getItem(KEYS.CALENDAR_EVENTS);
    if (!raw) {
      localStorage.setItem(KEYS.CALENDAR_EVENTS, JSON.stringify(DEFAULT_SAMPLE_EVENTS));
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
    localStorage.setItem(KEYS.CALENDAR_EVENTS, JSON.stringify(events));
  } catch {
    // ignore
  }
}

export function loadStudyPlans() {
  try {
    const raw = localStorage.getItem(KEYS.STUDY_PLANS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStudyPlans(plans) {
  try {
    localStorage.setItem(KEYS.STUDY_PLANS, JSON.stringify(plans));
  } catch {
    // ignore
  }
}

/**
 * Generates or regenerates a multi-day Study Plan ("Koosta kordamisplaan") for a calendar event
 * based on linked materials, deadline date, and available daily minutes!
 */
export function generateStudyPlanForEvent(event, materials, startDateStr = null) {
  const baseDate = startDateStr ? new Date(startDateStr) : new Date();
  const startDay = new Date(
    Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate())
  );

  const [y, m, d] = (event.date || '').split('-').map(Number);
  const targetDay = y && m && d ? new Date(Date.UTC(y, m - 1, d)) : new Date(startDay.getTime() + 5 * 86400000);

  const diffDays = Math.max(
    1,
    Math.min(30, Math.ceil((targetDay.getTime() - startDay.getTime()) / 86400000))
  );

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
  const sessions = [];

  for (let dayIdx = 0; dayIdx < diffDays; dayIdx++) {
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
        date: sessionDate,
        dayNumber: dayIdx + 1,
        totalDays: diffDays,
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
    targetDate: event.date,
    dailyMinutes,
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
