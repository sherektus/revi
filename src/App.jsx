import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import LibraryView from './components/LibraryView';
import MaterialStudyView from './components/MaterialStudyView';
import CalendarView from './components/CalendarView';
import MockExamView from './components/MockExamView';
import FormulasView from './components/FormulasView';
import DueTodayModal from './components/DueTodayModal';
import UploadModal from './components/UploadModal';
import SourceFileModal from './components/SourceFileModal';
import PersonalWorkspaceModal from './components/PersonalWorkspaceModal';
import { translations } from './i18n/translations';
import {
  getOrCreateDeviceId,
  loadPersonalProfiles,
  savePersonalProfiles,
  getActiveProfileId,
  setActiveProfileId,
  loadUILang,
  saveUILang,
  loadTheme,
  saveTheme,
  loadMaterials,
  saveMaterials,
  loadAllProgress,
  saveAllProgress,
  createDefaultProgressForMaterial,
  loadLastSession,
  saveLastSession,
  loadNavState,
  saveNavState,
  loadCalendarEvents,
  saveCalendarEvents,
  loadStudyPlans,
  saveStudyPlans,
  generateStudyPlanForEvent,
  loadSpacedRepetition,
  recordSpacedRepetitionReview,
  buildDueTodayQueue,
  saveOriginalFileBlob,
  deleteOriginalFileBlob
} from './utils/storage';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  useState(() => getOrCreateDeviceId());
  const [profiles, setProfiles] = useState(() => loadPersonalProfiles());
  const [activeProfileId, setActiveProfileIdState] = useState(() =>
    getActiveProfileId()
  );
  const [uiLang, setUiLang] = useState(() => loadUILang());
  const [theme, setTheme] = useState(() => loadTheme());
  const [materials, setMaterials] = useState(() => loadMaterials());
  const [progressMap, setProgressMap] = useState(() =>
    loadAllProgress(loadMaterials())
  );
  const [lastSession, setLastSession] = useState(() => loadLastSession());
  const [calendarEvents, setCalendarEvents] = useState(() =>
    loadCalendarEvents()
  );
  const [studyPlans, setStudyPlans] = useState(() => loadStudyPlans());
  const [srMap, setSrMap] = useState(() => loadSpacedRepetition());

  // Restore exact view & active material on page refresh!
  const initialNav = loadNavState();
  const [currentView, setCurrentView] = useState(
    initialNav.currentView || 'home'
  );
  const [activeMaterialId, setActiveMaterialId] = useState(
    initialNav.activeMaterialId || null
  );

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadInitialFile, setUploadInitialFile] = useState(null);
  const [isDueTodayOpen, setIsDueTodayOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const [sourceModalState, setSourceModalState] = useState({
    isOpen: false,
    material: null,
    pageNumber: 1
  });

  const [toastKey, setToastKey] = useState(null);

  const t = translations[uiLang] || translations.et;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', uiLang);
    saveUILang(uiLang);
  }, [uiLang]);

  // Persist currentView and activeMaterialId so refreshing (F5) stays on exact view
  useEffect(() => {
    saveNavState({ currentView, activeMaterialId });
  }, [currentView, activeMaterialId]);

  const dueTodayQueue = useMemo(
    () => buildDueTodayQueue(materials, progressMap, srMap, studyPlans),
    [materials, progressMap, srMap, studyPlans]
  );

  function showNotification(key) {
    setToastKey(key);
    setTimeout(() => {
      setToastKey((prev) => (prev === key ? null : prev));
    }, 3500);
  }

  function handleToggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  function handleChangeLang(nextLang) {
    setUiLang(nextLang);
  }

  function handleOpenUploadModal(file = null) {
    setUploadInitialFile(file);
    setIsUploadOpen(true);
  }

  function handleOpenMaterial(materialId, preferredTab) {
    const targetMat = materials.find((m) => m.id === materialId);
    if (!targetMat) return;

    const now = new Date().toISOString();
    const updatedMaterials = materials.map((m) =>
      m.id === materialId ? { ...m, lastOpenedAt: now } : m
    );
    setMaterials(updatedMaterials);
    saveMaterials(updatedMaterials);

    const existingProg =
      progressMap[materialId] || createDefaultProgressForMaterial(targetMat);
    const nextTab = preferredTab || existingProg.activeTab || 'summary';

    const nextProgressMap = {
      ...progressMap,
      [materialId]: {
        ...existingProg,
        activeTab: nextTab,
        updatedAt: now
      }
    };
    setProgressMap(nextProgressMap);
    saveAllProgress(nextProgressMap);

    const sessionObj = { materialId, activeTab: nextTab, updatedAt: now };
    setLastSession(sessionObj);
    saveLastSession(sessionObj);

    setActiveMaterialId(materialId);
    setCurrentView('study');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleMaterialCreated(newMaterial, originalFile) {
    if (originalFile) {
      await saveOriginalFileBlob(newMaterial.id, originalFile);
    }

    const updatedMaterials = [newMaterial, ...materials];
    setMaterials(updatedMaterials);
    saveMaterials(updatedMaterials);

    const initialProg = createDefaultProgressForMaterial(newMaterial);
    const nextProgressMap = {
      ...progressMap,
      [newMaterial.id]: initialProg
    };
    setProgressMap(nextProgressMap);
    saveAllProgress(nextProgressMap);

    const sessionObj = {
      materialId: newMaterial.id,
      activeTab: 'summary',
      updatedAt: newMaterial.createdAt
    };
    setLastSession(sessionObj);
    saveLastSession(sessionObj);

    setIsUploadOpen(false);
    setUploadInitialFile(null);
    setActiveMaterialId(newMaterial.id);
    setCurrentView('study');
    showNotification('uploadSuccess');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleUpdateMaterial(updatedMat) {
    const updatedList = materials.map((m) =>
      m.id === updatedMat.id ? updatedMat : m
    );
    setMaterials(updatedList);
    saveMaterials(updatedList);
  }

  function handleUpdateProgress(materialId, nextMatProgress) {
    const now = new Date().toISOString();
    const updated = {
      ...nextMatProgress,
      updatedAt: now
    };
    const nextProgressMap = {
      ...progressMap,
      [materialId]: updated
    };
    setProgressMap(nextProgressMap);
    saveAllProgress(nextProgressMap);

    const sessionObj = {
      materialId,
      activeTab: updated.activeTab || 'summary',
      updatedAt: now
    };
    setLastSession(sessionObj);
    saveLastSession(sessionObj);
  }

  function handleRecordSpacedRep(itemKey, isSuccess) {
    const updatedSr = recordSpacedRepetitionReview(srMap, itemKey, isSuccess);
    setSrMap(updatedSr);
  }

  function handleRecordDueTodayReview(dueItem, isSuccess) {
    handleRecordSpacedRep(dueItem.itemKey, isSuccess);

    // Also update the material's own progress map so library stats & topic mastery stay in sync
    const matId = dueItem.materialId;
    const mat = materials.find((m) => m.id === matId);
    if (!mat) return;

    const existingProg =
      progressMap[matId] || createDefaultProgressForMaterial(mat);

    if (dueItem.itemType === 'flashcard') {
      const cardId = dueItem.card.id;
      const status = isSuccess ? 'knew' : 'review';
      const prevHist = existingProg.flashcards?.historyById?.[cardId] || [];
      handleUpdateProgress(matId, {
        ...existingProg,
        flashcards: {
          ...existingProg.flashcards,
          statusById: {
            ...(existingProg.flashcards?.statusById || {}),
            [cardId]: status
          },
          historyById: {
            ...(existingProg.flashcards?.historyById || {}),
            [cardId]: [...prevHist, status]
          }
        }
      });
    } else if (dueItem.itemType === 'exercise') {
      const exId = dueItem.exercise.id;
      const prevHist = existingProg.exercises?.historyById?.[exId] || [];
      handleUpdateProgress(matId, {
        ...existingProg,
        exercises: {
          ...existingProg.exercises,
          answersById: {
            ...(existingProg.exercises?.answersById || {}),
            [exId]: {
              selectedIndex: isSuccess ? dueItem.exercise.correctIndex : 0,
              isCorrect: isSuccess,
              checked: true
            }
          },
          historyById: {
            ...(existingProg.exercises?.historyById || {}),
            [exId]: [...prevHist, isSuccess]
          }
        }
      });
    }
  }

  function handleResetProgress(materialId) {
    const targetMat = materials.find((m) => m.id === materialId);
    if (!targetMat) return;
    const fresh = createDefaultProgressForMaterial(targetMat);
    fresh.activeTab = progressMap[materialId]?.activeTab || 'summary';
    const nextProgressMap = {
      ...progressMap,
      [materialId]: fresh
    };
    setProgressMap(nextProgressMap);
    saveAllProgress(nextProgressMap);
    showNotification('resetSuccess');
  }

  async function handleDeleteMaterial(materialId) {
    await deleteOriginalFileBlob(materialId);
    const updatedMaterials = materials.filter((m) => m.id !== materialId);
    setMaterials(updatedMaterials);
    saveMaterials(updatedMaterials);

    const nextProgressMap = { ...progressMap };
    delete nextProgressMap[materialId];
    setProgressMap(nextProgressMap);
    saveAllProgress(nextProgressMap);

    if (lastSession?.materialId === materialId) {
      const nextSession = updatedMaterials[0]
        ? { materialId: updatedMaterials[0].id, activeTab: 'summary' }
        : null;
      setLastSession(nextSession);
      saveLastSession(nextSession);
    }

    if (activeMaterialId === materialId) {
      setActiveMaterialId(null);
      setCurrentView('library');
    }

    showNotification('deleted');
  }

  // --- CALENDAR & STUDY PLANS HANDLERS ---
  function handleSaveCalendarEvent(savedEvent) {
    const exists = calendarEvents.some((e) => e.id === savedEvent.id);
    const nextEvents = exists
      ? calendarEvents.map((e) => (e.id === savedEvent.id ? savedEvent : e))
      : [...calendarEvents, savedEvent];
    setCalendarEvents(nextEvents);
    saveCalendarEvents(nextEvents);
  }

  function handleDeleteCalendarEvent(eventId) {
    const nextEvents = calendarEvents.filter((e) => e.id !== eventId);
    setCalendarEvents(nextEvents);
    saveCalendarEvents(nextEvents);

    const nextPlans = studyPlans.filter((p) => p.eventId !== eventId);
    setStudyPlans(nextPlans);
    saveStudyPlans(nextPlans);
  }

  function handleToggleEventCompleted(eventId) {
    const nextEvents = calendarEvents.map((e) =>
      e.id === eventId ? { ...e, completed: !e.completed } : e
    );
    setCalendarEvents(nextEvents);
    saveCalendarEvents(nextEvents);
  }

  function handleCreateOrUpdateStudyPlan(event, dailyMinutes) {
    const updatedEvent = { ...event, dailyMinutes };
    handleSaveCalendarEvent(updatedEvent);

    const generatedPlan = generateStudyPlanForEvent(updatedEvent, materials);
    const otherPlans = studyPlans.filter((p) => p.eventId !== event.id);
    const nextPlans = [...otherPlans, generatedPlan];
    setStudyPlans(nextPlans);
    saveStudyPlans(nextPlans);
  }

  function handleToggleSessionCompleted(planId, sessionId) {
    const nextPlans = studyPlans.map((p) => {
      if (p.id !== planId) return p;
      return {
        ...p,
        sessions: (p.sessions || []).map((s) =>
          s.id === sessionId ? { ...s, completed: !s.completed } : s
        )
      };
    });
    setStudyPlans(nextPlans);
    saveStudyPlans(nextPlans);
  }

  function reloadActiveWorkspaceState() {
    const nextMats = loadMaterials();
    setMaterials(nextMats);
    setProgressMap(loadAllProgress(nextMats));
    setLastSession(loadLastSession());
    setCalendarEvents(loadCalendarEvents());
    setStudyPlans(loadStudyPlans());
    setSrMap(loadSpacedRepetition());
    const nav = loadNavState();
    setCurrentView(nav.currentView || 'home');
    setActiveMaterialId(nav.activeMaterialId || null);
  }

  function handleSwitchProfile(profileId) {
    setActiveProfileId(profileId);
    setActiveProfileIdState(profileId);
    reloadActiveWorkspaceState();
  }

  function handleCreateProfile(name) {
    const newProf = {
      id: `prof-${Date.now()}`,
      name,
      isDefault: false,
      createdAt: new Date().toISOString()
    };
    const nextProfiles = [...profiles, newProf];
    setProfiles(nextProfiles);
    savePersonalProfiles(nextProfiles);
    handleSwitchProfile(newProf.id);
  }

  function handleDeleteProfile(profileId) {
    if (profileId === 'default') return;
    const nextProfiles = profiles.filter((p) => p.id !== profileId);
    setProfiles(nextProfiles);
    savePersonalProfiles(nextProfiles);
    if (activeProfileId === profileId) {
      handleSwitchProfile('default');
    }
  }

  function handleWorkspaceDataChanged(toastType) {
    reloadActiveWorkspaceState();
    if (toastType) {
      showNotification(toastType);
    }
  }

  function handleOpenSourceViewer(material, pageNumber = 1) {
    setSourceModalState({
      isOpen: true,
      material,
      pageNumber
    });
  }

  const activeProfileObj =
    profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const activeProfileLabel =
    activeProfileObj?.id === 'default'
      ? t.privacy?.navBadge || 'Privaatne'
      : activeProfileObj?.name;

  const activeMaterial =
    materials.find((m) => m.id === activeMaterialId) || materials[0];
  const existingSubjects = Array.from(
    new Set(materials.map((m) => m.subject).filter(Boolean))
  );

  const toastMessage =
    toastKey === 'uploadSuccess'
      ? t.upload.successNotification
      : toastKey === 'resetSuccess'
      ? t.material.resetNotification
      : toastKey === 'deleted'
      ? t.library.deletedNotification
      : toastKey === 'importSuccess'
      ? t.privacy?.importSuccessToast
      : toastKey === 'cleared'
      ? t.privacy?.clearedToast
      : null;

  return (
    <div className="app-shell">
      <Navbar
        t={t}
        uiLang={uiLang}
        onChangeLang={handleChangeLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenUploadModal={() => handleOpenUploadModal(null)}
        activeProfileName={activeProfileLabel}
        onOpenPrivacyModal={() => setIsPrivacyOpen(true)}
      />

      {toastMessage && (
        <div className="toast-notification" role="status" aria-live="polite">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="main-content">
        {currentView === 'home' && (
          <HomeView
            t={t}
            uiLang={uiLang}
            materials={materials}
            progressMap={progressMap}
            lastSession={lastSession}
            dueTodayQueue={dueTodayQueue}
            calendarEvents={calendarEvents}
            onStartDueToday={() => setIsDueTodayOpen(true)}
            onOpenUploadModal={handleOpenUploadModal}
            onOpenMaterial={handleOpenMaterial}
            onNavigateLibrary={() => setCurrentView('library')}
            onNavigateCalendar={() => setCurrentView('calendar')}
          />
        )}

        {currentView === 'library' && (
          <LibraryView
            t={t}
            materials={materials}
            progressMap={progressMap}
            onOpenMaterial={handleOpenMaterial}
            onOpenSourceViewer={handleOpenSourceViewer}
            onDeleteMaterial={handleDeleteMaterial}
            onOpenUploadModal={() => handleOpenUploadModal(null)}
            onCombineMaterials={(newCol) => handleMaterialCreated(newCol, null)}
          />
        )}

        {currentView === 'calendar' && (
          <CalendarView
            t={t}
            materials={materials}
            calendarEvents={calendarEvents}
            studyPlans={studyPlans}
            onSaveEvent={handleSaveCalendarEvent}
            onDeleteEvent={handleDeleteCalendarEvent}
            onToggleEventCompleted={handleToggleEventCompleted}
            onCreateOrUpdateStudyPlan={handleCreateOrUpdateStudyPlan}
            onToggleSessionCompleted={handleToggleSessionCompleted}
            onOpenMaterial={handleOpenMaterial}
          />
        )}

        {currentView === 'mockExam' && (
          <MockExamView
            t={t}
            materials={materials}
            onOpenSourceViewer={handleOpenSourceViewer}
          />
        )}

        {currentView === 'formulas' && (
          <FormulasView
            t={t}
            materials={materials}
            onOpenSourceViewer={handleOpenSourceViewer}
          />
        )}

        {currentView === 'study' && activeMaterial && (
          <MaterialStudyView
            t={t}
            material={activeMaterial}
            matProgress={
              progressMap[activeMaterial.id] ||
              createDefaultProgressForMaterial(activeMaterial)
            }
            onUpdateProgress={handleUpdateProgress}
            onUpdateMaterial={handleUpdateMaterial}
            onRecordSpacedRep={handleRecordSpacedRep}
            onResetProgress={handleResetProgress}
            onBackToLibrary={() => setCurrentView('library')}
            onOpenSourceViewer={handleOpenSourceViewer}
            onSwitchPairedSample={(pairedId) => handleOpenMaterial(pairedId)}
          />
        )}
      </main>

      <DueTodayModal
        isOpen={isDueTodayOpen}
        t={t}
        queue={dueTodayQueue}
        onClose={() => setIsDueTodayOpen(false)}
        onRecordReview={handleRecordDueTodayReview}
      />

      <UploadModal
        isOpen={isUploadOpen}
        initialFile={uploadInitialFile}
        uiLang={uiLang}
        t={t}
        existingSubjects={existingSubjects}
        onClose={() => {
          setIsUploadOpen(false);
          setUploadInitialFile(null);
        }}
        onMaterialCreated={handleMaterialCreated}
      />

      <SourceFileModal
        isOpen={sourceModalState.isOpen}
        material={sourceModalState.material}
        initialPageNumber={sourceModalState.pageNumber}
        t={t}
        onClose={() =>
          setSourceModalState((prev) => ({ ...prev, isOpen: false }))
        }
      />

      <PersonalWorkspaceModal
        isOpen={isPrivacyOpen}
        t={t}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSwitchProfile={handleSwitchProfile}
        onCreateProfile={handleCreateProfile}
        onDeleteProfile={handleDeleteProfile}
        onWorkspaceDataChanged={handleWorkspaceDataChanged}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
