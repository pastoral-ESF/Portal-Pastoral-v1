import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ROLES, isFullAdminRole, isPastoralTeamRole } from './constants/config';
import { storageService, buildUnifiedCalendarEvents } from './services/storageService';
import { authService } from './services/authService';
import { NOTION_CALENDAR_2026_2027 } from './data/notionCalendar2026';
import { ToastContainer } from './components/common/ToastContainer';
import { PublicHeader } from './components/layout/PublicHeader';
import { PublicMobileNav } from './components/layout/PublicMobileNav';
import { BackstageShell } from './components/layout/BackstageShell';

// Vistas Públicas
import { HomeView } from './components/public/HomeView';
import { PublicCalendarView } from './components/public/PublicCalendarView';
import { MjsDirectoryView } from './components/public/MjsDirectoryView';
import { SacramentsView } from './components/public/SacramentsView';
import { MultimediaView } from './components/public/MultimediaView';
import { AccompanimentBoxView } from './components/public/AccompanimentBoxView';
import { VafejeView } from './components/public/VafejeView';

// Vistas Backstage
import { BackstageGate } from './components/backstage/BackstageGate';
import { DashboardView } from './components/backstage/DashboardView';
import { TasksView } from './components/backstage/TasksView';
import { CartaPlannerView } from './components/backstage/CartaPlannerView';
import { PepsalView } from './components/backstage/PepsalView';
import { PrintableCarta } from './components/backstage/PrintableCarta';
import { PrintablePlantaFisica } from './components/backstage/PrintablePlantaFisica';
import { CalendarManagerView } from './components/backstage/CalendarManagerView';
import { EvaluationDashboardView } from './components/backstage/EvaluationDashboardView';
import { MjsRepositoryView } from './components/backstage/MjsRepositoryView';
import { AdminPanelView } from './components/backstage/AdminPanelView';
import { PortalContentEditorView } from './components/backstage/PortalContentEditorView';
import { UsersProfileView } from './components/backstage/UsersProfileView';

export default function App() {
  const [db, setDb] = useState(() => storageService.getAllData());
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash === '#visor' || params.get('visor') === '1') {
        return 'public';
      }
    }
    return 'gate'; // Página principal: Login del Departamento de Pastoral
  }); // 'gate' | 'backstage' | 'public'
  const [publicTab, setPublicTab] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [backstageTab, setBackstageTab] = useState('dashboard');
  const [editingCartaIntent, setEditingCartaIntent] = useState(null);
  const [taskEventIntent, setTaskEventIntent] = useState(null);
  const [printJob, setPrintJob] = useState(null); // { type: 'carta' | 'plantaFisica', data }
  const [toasts, setToasts] = useState([]);

  const backstageRole = currentUser?.role || null;
  const isFullAdmin = isFullAdminRole(backstageRole);
  const isPastoralTeam = isPastoralTeamRole(backstageRole);
  // Si es Auxiliar/Agente de Pastoral con plantel asignado, su alcance se enfoca en su propio plantel
  const auxPlantel =
    backstageRole === ROLES.AUXILIAR &&
    currentUser?.plantel &&
    currentUser.plantel !== 'General'
      ? currentUser.plantel
      : null;

  // Suscripción a Firebase Auth (o sesión local) y sincronización con Firestore
  useEffect(() => {
    const unsubAuth = authService.subscribe((user) => {
      if (user) {
        setCurrentUser(user);
        setBackstageTab((prev) =>
          user.role === ROLES.ANIMADOR ? 'repositorio' : prev || 'dashboard'
        );
        setMode((prev) => (prev === 'gate' ? 'backstage' : prev));
      } else {
        setCurrentUser(null);
      }
    });

    const unsubRemote = storageService.subscribeRemote((remoteDb) => {
      setDb(remoteDb);
    });

    return () => {
      unsubAuth();
      unsubRemote();
    };
  }, []);

  const addToast = useCallback((message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const publicEvents = useMemo(
    () => buildUnifiedCalendarEvents(db, { onlyPublic: true }),
    [db]
  );

  const allUnifiedEvents = useMemo(
    () => buildUnifiedCalendarEvents(db, { onlyPublic: false }),
    [db]
  );

  // Colecciones filtradas por plantel cuando el usuario es Auxiliar / Agente de Pastoral
  const scopedCartas = useMemo(() => {
    if (!auxPlantel) return db.cartasDescriptivas || [];
    return (db.cartasDescriptivas || []).filter((c) => c.plantel === auxPlantel);
  }, [db.cartasDescriptivas, auxPlantel]);

  const scopedUnifiedEvents = useMemo(() => {
    if (!auxPlantel) return allUnifiedEvents;
    return allUnifiedEvents.filter((e) => e.plantel === auxPlantel || e.plantel === 'General');
  }, [allUnifiedEvents, auxPlantel]);

  const scopedQuickEvents = useMemo(() => {
    if (!auxPlantel) return db.quickEvents || [];
    return (db.quickEvents || []).filter((e) => e.plantel === auxPlantel);
  }, [db.quickEvents, auxPlantel]);

  const scopedNotices = useMemo(() => {
    if (!auxPlantel) return db.notices || [];
    return (db.notices || []).filter((n) => n.plantel === auxPlantel || n.plantel === 'General');
  }, [db.notices, auxPlantel]);

  const scopedMessages = useMemo(() => {
    if (!auxPlantel) return db.accompanimentMessages || [];
    return (db.accompanimentMessages || []).filter((m) => m.plantel === auxPlantel);
  }, [db.accompanimentMessages, auxPlantel]);

  const unreadInboxCount = useMemo(
    () => scopedMessages.filter((m) => m.status === 'Nuevo').length,
    [scopedMessages]
  );

  const pendingTasksCount = useMemo(() => {
    const userPlantel = currentUser?.plantel || 'General';
    return (db.tasks || []).filter((t) => {
      if (t.done) return false;
      const isMine =
        t.ownerUid === currentUser?.uid ||
        (t.ownerEmail && t.ownerEmail === currentUser?.email);
      const isAssignedToMe =
        (t.assignedToUid && t.assignedToUid === currentUser?.uid) ||
        (t.assignedToEmail && t.assignedToEmail === currentUser?.email);

      if (isFullAdmin) {
        if (
          t.scope === 'personal' &&
          !isMine &&
          !isAssignedToMe &&
          (t.ownerRole === ROLES.SDB || t.ownerRole === ROLES.COORDINADOR)
        ) {
          return false;
        }
        return true;
      }

      if (isMine || isAssignedToMe) return true;
      if (t.scope === 'plantel') return t.plantel === userPlantel;
      if (t.scope === 'general') return true;
      return false;
    }).length;
  }, [db.tasks, currentUser, isFullAdmin]);

  // --- Navegación y Autenticación Backstage ---
  const handleOpenBackstage = () => {
    if (backstageRole) {
      setMode('backstage');
    } else {
      setMode('gate');
    }
  };

  const handleAuthenticated = (user) => {
    setCurrentUser(user);
    setBackstageTab(user.role === ROLES.ANIMADOR ? 'repositorio' : 'dashboard');
    setMode('backstage');
    addToast(
      `Bienvenido, ${user.name} (${user.plantel})`,
      'info'
    );
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setMode('gate');
    addToast('Sesión cerrada correctamente', 'info');
  };

  // --- Impresión (Carta Descriptiva o Solicitud de Planta Física) ---
  const handlePrintCarta = (carta) => {
    setPrintJob({ type: 'carta', data: carta });
    setTimeout(() => {
      window.print();
    }, 120);
  };

  const handlePrintPlantaFisica = (solicitud) => {
    setPrintJob({ type: 'plantaFisica', data: solicitud });
    setTimeout(() => {
      window.print();
    }, 120);
  };

  // --- Handlers de Persistencia ---
  const handleSaveCarta = (carta) => {
    const updated = storageService.saveCarta(carta);
    setDb(updated);
    addToast(
      carta.visibility === 'publico'
        ? 'Carta Descriptiva guardada y publicada en el Calendario Público'
        : 'Carta Descriptiva guardada en el Calendario Interno'
    );
  };

  const handleSavePepsalDoc = (pepsalDoc) => {
    const updated = storageService.savePepsalDoc(pepsalDoc);
    setDb(updated);
    addToast('Configuración del documento PEPSAL guardada');
  };

  const handleSavePortalSettings = (settings) => {
    const updated = storageService.savePortalSettings(settings);
    setDb(updated);
    addToast('Configuración general del Portal Público actualizada');
  };

  const handleSaveMjsGroups = (groups) => {
    const updated = storageService.saveMjsGroups(groups);
    setDb(updated);
    addToast('Grupos MJS y WhatsApp actualizados en el Portal Público');
  };

  const handleSaveSacraments = (sacraments) => {
    const updated = storageService.saveSacraments(sacraments);
    setDb(updated);
    addToast('Información de Sacramentos actualizada en el Portal Público');
  };

  const handleSaveMultimedia = (multimedia) => {
    const updated = storageService.saveMultimedia(multimedia);
    setDb(updated);
    addToast('Catálogo Multimedia actualizado en el Portal Público');
  };

  const handleDeleteCarta = (id) => {
    const updated = storageService.deleteCarta(id);
    setDb(updated);
    addToast('Carta Descriptiva eliminada', 'info');
  };

  const handleApproveCarta = (id) => {
    const approver = currentUser?.name || 'Departamento de Pastoral';
    const updated = storageService.approveCarta(id, approver);
    setDb(updated);
    addToast(`Carta Descriptiva aprobada por ${approver}`);
  };

  const handleSavePlantaFisica = (cartaId, plantaFisica) => {
    const updated = storageService.saveCartaPlantaFisica(cartaId, plantaFisica);
    setDb(updated);
    addToast('Solicitud de Planta Física guardada correctamente');
  };

  const handleAddTask = (task) => {
    const updated = storageService.addTask(task);
    setDb(updated);
    addToast('Pendiente guardado correctamente');
  };

  const handleUpdateTask = (id, updates) => {
    const updated = storageService.updateTask(id, updates);
    setDb(updated);
    addToast('Pendiente actualizado correctamente');
  };

  const handleToggleTaskDone = (id) => {
    const updated = storageService.toggleTaskDone(id);
    setDb(updated);
  };

  const handleDeleteTask = (id) => {
    const updated = storageService.deleteTask(id);
    setDb(updated);
    addToast('Pendiente eliminado', 'info');
  };

  const handleSaveEvaluation = (cartaId, evaluation) => {
    const updated = storageService.saveCartaEvaluation(cartaId, evaluation);
    setDb(updated);
    addToast('Evaluación ESA registrada correctamente');
  };

  const handleSaveQuickEvent = (event) => {
    const updated = storageService.saveQuickEvent(event);
    setDb(updated);
    addToast('Evento de calendario guardado');
  };

  const handleDeleteQuickEvent = (id) => {
    const updated = storageService.deleteQuickEvent(id);
    setDb(updated);
    addToast('Evento eliminado del calendario', 'info');
  };

  const handleToggleQuickVisibility = (id) => {
    const updated = storageService.toggleQuickEventVisibility(id);
    setDb(updated);
    addToast('Visibilidad del evento actualizada', 'info');
  };

  const handleImportNotionCalendar = () => {
    const { db: updated, addedCount } = storageService.importNotionEvents(
      NOTION_CALENDAR_2026_2027
    );
    setDb(updated);
    addToast(
      addedCount > 0
        ? `¡Se cargaron ${addedCount} eventos del Calendario ESFER 2026-2027 a Firestore!`
        : 'Los 401 eventos de Notion ya estaban cargados',
      'success'
    );
  };

  const hasPendingNotionImport = useMemo(() => {
    const quick = db.quickEvents || [];
    const loadedNotionCount = quick.filter((e) =>
      String(e.id || '').startsWith('notion-2627-')
    ).length;
    // Solo ofrecer la carga inicial si aún no existe ningún evento de Notion en Firestore
    return loadedNotionCount === 0;
  }, [db.quickEvents]);

  const handleAddNotice = (notice) => {
    const updated = storageService.addNotice(notice);
    setDb(updated);
    addToast('Aviso oficial publicado en el Portal Público');
  };

  const handleDeleteNotice = (id) => {
    const updated = storageService.deleteNotice(id);
    setDb(updated);
    addToast('Aviso eliminado', 'info');
  };

  const handleToggleNoticePin = (id) => {
    const updated = storageService.toggleNoticePin(id);
    setDb(updated);
  };

  const handleAddMjsResource = (resource) => {
    const updated = storageService.addMjsResource(resource);
    setDb(updated);
    addToast('Recurso agregado al Repositorio MJS');
  };

  const handleDeleteMjsResource = (id) => {
    const updated = storageService.deleteMjsResource(id);
    setDb(updated);
    addToast('Recurso eliminado', 'info');
  };

  const handleSubmitAccompaniment = (msg) => {
    const updated = storageService.addAccompanimentMessage(msg);
    setDb(updated);
    addToast('Tu mensaje confidencial fue enviado a Pastoral');
  };

  const handleToggleMessageStatus = (id) => {
    const updated = storageService.toggleMessageStatus(id);
    setDb(updated);
    addToast('Estatus de solicitud actualizado', 'info');
  };

  const handleDeleteMessage = (id) => {
    const updated = storageService.deleteAccompanimentMessage(id);
    setDb(updated);
    addToast('Solicitud eliminada del buzón', 'info');
  };

  const handlePublicNavigate = (tabId) => {
    setPublicTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Documento limpio solo visible al imprimir (Carta Descriptiva o Planta Física) */}
      {printJob?.type === 'carta' && <PrintableCarta carta={printJob.data} />}
      {printJob?.type === 'plantaFisica' && <PrintablePlantaFisica solicitud={printJob.data} />}

      {/* Interfaz principal oculta durante @media print */}
      <div className="no-print min-h-screen">
        {mode === 'gate' && (
          <BackstageGate
            onAuthenticated={handleAuthenticated}
            onCancel={() => setMode('public')}
          />
        )}

        {mode === 'backstage' && backstageRole && (
          <BackstageShell
            role={backstageRole}
            currentUser={currentUser}
            activeTab={backstageTab}
            onSelectTab={setBackstageTab}
            onExitToPublic={() => setMode('public')}
            onLogout={handleLogout}
            unreadInboxCount={unreadInboxCount}
            pendingTasksCount={pendingTasksCount}
          >
            {backstageTab === 'dashboard' && isPastoralTeam && (
              <DashboardView
                cartas={scopedCartas}
                unifiedEvents={scopedUnifiedEvents}
                messages={scopedMessages}
                onNewCarta={() => {
                  setEditingCartaIntent('NEW');
                  setBackstageTab('planeador');
                }}
                onEditCarta={(carta) => {
                  setEditingCartaIntent(carta);
                  setBackstageTab('planeador');
                }}
                onPrintCarta={handlePrintCarta}
                onQuickEventClick={() => setBackstageTab('calendario')}
                onGoToEvaluation={() => setBackstageTab('evaluacion')}
                onGoToInbox={() => setBackstageTab('admin')}
              />
            )}

            {backstageTab === 'pendientes' && isPastoralTeam && (
              <TasksView
                tasks={db.tasks || []}
                currentUser={currentUser}
                unifiedEvents={scopedUnifiedEvents}
                preselectedEvent={taskEventIntent}
                onClearPreselectedEvent={() => setTaskEventIntent(null)}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onToggleTaskDone={handleToggleTaskDone}
                onDeleteTask={handleDeleteTask}
                onToast={addToast}
              />
            )}

            {backstageTab === 'planeador' && isPastoralTeam && (
              <CartaPlannerView
                cartas={scopedCartas}
                pepsalDoc={db.pepsalDoc}
                restrictedPlantel={auxPlantel}
                initialEditingCarta={editingCartaIntent}
                onClearInitialEdit={() => setEditingCartaIntent(null)}
                onSaveCarta={handleSaveCarta}
                onApproveCarta={isFullAdmin ? handleApproveCarta : null}
                onSavePlantaFisica={handleSavePlantaFisica}
                onPrintPlantaFisica={handlePrintPlantaFisica}
                onDeleteCarta={handleDeleteCarta}
                onPrintCarta={handlePrintCarta}
                onOpenPepsalTab={() => setBackstageTab('pepsal')}
              />
            )}

            {backstageTab === 'pepsal' && isPastoralTeam && (
              <PepsalView
                pepsalDoc={db.pepsalDoc}
                cartas={scopedCartas}
                onSavePepsalDoc={handleSavePepsalDoc}
                onCreateCartaWithPepsal={(areaId) => {
                  setEditingCartaIntent({ presetPepsalAreaId: areaId });
                  setBackstageTab('planeador');
                }}
              />
            )}

            {backstageTab === 'calendario' && isPastoralTeam && (
              <CalendarManagerView
                unifiedEvents={scopedUnifiedEvents}
                quickEvents={scopedQuickEvents}
                restrictedPlantel={auxPlantel}
                canImportNotion={isFullAdmin}
                hasPendingNotionImport={hasPendingNotionImport}
                onImportNotion={handleImportNotionCalendar}
                onToggleQuickVisibility={handleToggleQuickVisibility}
                onSaveQuickEvent={handleSaveQuickEvent}
                onDeleteQuickEvent={handleDeleteQuickEvent}
                onCreateCartaFromEvent={(ev) => {
                  setEditingCartaIntent({ presetFromEvent: ev });
                  setBackstageTab('planeador');
                }}
                onOpenLinkedCarta={(cartaId) => {
                  const found = (db.cartasDescriptivas || []).find((c) => c.id === cartaId);
                  if (found) {
                    setEditingCartaIntent(found);
                    setBackstageTab('planeador');
                  }
                }}
                onDeriveTask={(ev) => {
                  setTaskEventIntent(ev);
                  setBackstageTab('pendientes');
                }}
                onToast={addToast}
              />
            )}

            {backstageTab === 'evaluacion' && isPastoralTeam && (
              <EvaluationDashboardView
                cartas={scopedCartas}
                onSaveEvaluation={handleSaveEvaluation}
              />
            )}

            {backstageTab === 'repositorio' && (
              <MjsRepositoryView
                resources={db.mjsResources}
                role={backstageRole}
                onAddResource={handleAddMjsResource}
                onDeleteResource={handleDeleteMjsResource}
              />
            )}

            {backstageTab === 'admin' && isPastoralTeam && (
              <AdminPanelView
                notices={scopedNotices}
                messages={scopedMessages}
                restrictedPlantel={auxPlantel}
                onAddNotice={handleAddNotice}
                onDeleteNotice={handleDeleteNotice}
                onToggleNoticePin={handleToggleNoticePin}
                onToggleMessageStatus={handleToggleMessageStatus}
                onDeleteMessage={handleDeleteMessage}
              />
            )}

            {backstageTab === 'editor' && isFullAdmin && (
              <PortalContentEditorView
                portalSettings={db.portalSettings}
                mjsGroups={db.mjsGroups}
                sacraments={db.sacraments}
                multimedia={db.multimedia}
                onSavePortalSettings={handleSavePortalSettings}
                onSaveMjsGroups={handleSaveMjsGroups}
                onSaveSacraments={handleSaveSacraments}
                onSaveMultimedia={handleSaveMultimedia}
              />
            )}

            {backstageTab === 'perfil' && (
              <UsersProfileView
                currentUser={currentUser}
                onCurrentUserUpdated={(updatedUser) => setCurrentUser(updatedUser)}
                onToast={addToast}
              />
            )}
          </BackstageShell>
        )}

        {mode === 'public' && (
          <div className="min-h-screen flex flex-col bg-slate-50 pb-20 lg:pb-0">
            <PublicHeader
              activeTab={publicTab}
              onSelectTab={handlePublicNavigate}
              onOpenBackstage={handleOpenBackstage}
              backstageRole={backstageRole}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
              {publicTab === 'home' && (
                <HomeView
                  notices={db.notices}
                  upcomingPublicEvents={publicEvents}
                  portalSettings={db.portalSettings}
                  onNavigate={handlePublicNavigate}
                />
              )}
              {publicTab === 'calendario' && (
                <PublicCalendarView events={publicEvents} onToast={addToast} />
              )}
              {publicTab === 'mjs' && (
                <MjsDirectoryView
                  groups={db.mjsGroups}
                  defaultWhatsappPhone={db.portalSettings?.whatsappPhone}
                />
              )}
              {publicTab === 'sacramentos' && (
                <SacramentsView sacraments={db.sacraments} />
              )}
              {publicTab === 'multimedia' && (
                <MultimediaView multimedia={db.multimedia} />
              )}
              {publicTab === 'buzon' && (
                <AccompanimentBoxView onSubmitMessage={handleSubmitAccompaniment} />
              )}
              {publicTab === 'vafeje' && (
                <VafejeView
                  portalSettings={db.portalSettings}
                  onNavigate={handlePublicNavigate}
                />
              )}
            </main>

            <footer className="border-t border-slate-200 bg-white mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div className="font-semibold text-slate-700">
                  Portal Pastoral · Colegio ESFER Salesianos Chihuahua (Glandorff · Kennedy ·
                  Cordilleras)
                </div>
                <div>«Buenos cristianos y honestos ciudadanos» · San Juan Bosco</div>
              </div>
            </footer>

            <PublicMobileNav activeTab={publicTab} onSelectTab={handlePublicNavigate} />
          </div>
        )}

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </>
  );
}
