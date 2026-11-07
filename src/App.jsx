import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import LibraryView from './components/LibraryView';
import MaterialStudyView from './components/MaterialStudyView';
import UploadModal from './components/UploadModal';
import SourceFileModal from './components/SourceFileModal';
import { translations } from './i18n/translations';
import {
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
  saveOriginalFileBlob,
  deleteOriginalFileBlob
} from './utils/storage';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [uiLang, setUiLang] = useState(() => loadUILang());
  const [theme, setTheme] = useState(() => loadTheme());
  const [materials, setMaterials] = useState(() => loadMaterials());
  const [progressMap, setProgressMap] = useState(() =>
    loadAllProgress(loadMaterials())
  );
  const [lastSession, setLastSession] = useState(() => loadLastSession());

  // Navigation state: 'home' | 'library' | 'study'
  const [currentView, setCurrentView] = useState('home');
  const [activeMaterialId, setActiveMaterialId] = useState(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadInitialFile, setUploadInitialFile] = useState(null);

  // Original file viewer modal state
  const [sourceModalState, setSourceModalState] = useState({
    isOpen: false,
    material: null,
    pageNumber: 1
  });

  // Notification toast key (so switching language translates active toast too)
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
    // Switching language updates UI strings without interrupting active study session
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

  function handleOpenSourceViewer(material, pageNumber = 1) {
    setSourceModalState({
      isOpen: true,
      material,
      pageNumber
    });
  }

  const activeMaterial = materials.find((m) => m.id === activeMaterialId);
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
            onOpenUploadModal={handleOpenUploadModal}
            onOpenMaterial={handleOpenMaterial}
            onNavigateLibrary={() => setCurrentView('library')}
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
            onResetProgress={handleResetProgress}
            onBackToLibrary={() => setCurrentView('library')}
            onOpenSourceViewer={handleOpenSourceViewer}
            onSwitchPairedSample={(pairedId) => handleOpenMaterial(pairedId)}
          />
        )}
      </main>

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
    </div>
  );
}
