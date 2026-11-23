import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  User,
  Building2,
  Globe2,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Bell,
  BellRing,
  BellOff,
  AlertTriangle,
  UserCheck,
  Edit3,
  X,
} from 'lucide-react';
import {
  PLANTELES,
  PLANTEL_BADGE_STYLES,
  ROLES,
  isFullAdminRole,
} from '../../constants/config';
import { CalendarExportMenu } from '../common/CalendarExportMenu';
import { authService } from '../../services/authService';

const SCOPE_OPTIONS = [
  {
    id: 'personal',
    label: 'Personal',
    desc: 'Solo visible para mí',
    icon: User,
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'plantel',
    label: 'Solo mi Plantel',
    desc: 'Visible para el equipo de mi plantel',
    icon: Building2,
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  {
    id: 'general',
    label: 'Pastoral General',
    desc: 'Visible para todo el Departamento',
    icon: Globe2,
    badge: 'bg-amber-100 text-amber-900 border-amber-200',
  },
];

const PRIORITY_STYLES = {
  Alta: 'bg-rose-100 text-rose-800',
  Media: 'bg-amber-100 text-amber-800',
  Baja: 'bg-slate-100 text-slate-600',
};

export function TasksView({
  tasks = [],
  currentUser,
  unifiedEvents = [],
  preselectedEvent,
  onClearPreselectedEvent,
  onAddTask,
  onUpdateTask,
  onToggleTaskDone,
  onDeleteTask,
  onToast,
}) {
  const userPlantel = currentUser?.plantel || 'General';
  const isFullAdmin = isFullAdminRole(currentUser?.role);
  const [notifPermission, setNotifPermission] = useState(() =>
    typeof window !== 'undefined' && 'Notification' in window
      ? window.Notification.permission
      : 'unsupported'
  );
  const [notifEnabled, setNotifEnabled] = useState(() => {
    try {
      const saved = window.localStorage.getItem('portal_pastoral_notif_enabled');
      if (saved === 'false') return false;
      return typeof window !== 'undefined' && 'Notification' in window
        ? window.Notification.permission === 'granted'
        : false;
    } catch {
      return false;
    }
  });

  const [scopeFilter, setScopeFilter] = useState('todos'); // 'todos' | 'personal' | 'plantel' | 'general' | 'asignados'
  const [adminPlantelFilter, setAdminPlantelFilter] = useState('Todos');
  const [showCompleted, setShowCompleted] = useState(true);
  const [teamUsers, setTeamUsers] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    notes: '',
    scope: isFullAdmin ? 'plantel' : 'personal',
    plantel: userPlantel === 'General' ? 'Glandorff' : userPlantel,
    priority: 'Media',
    dueDate: '',
    linkedEventId: '',
    assignedToUid: '',
  });

  // Cargar lista de usuarios del equipo para que SDB / Coordinador puedan asignar pendientes
  useEffect(() => {
    if (!isFullAdmin) return;
    authService
      .listUsers()
      .then((list) => setTeamUsers(list || []))
      .catch(() => setTeamUsers([]));
  }, [isFullAdmin]);

  // Si venimos de "Derivar pendiente" desde un evento del calendario
  useEffect(() => {
    if (preselectedEvent) {
      setForm((prev) => ({
        ...prev,
        title: `Seguimiento: ${preselectedEvent.title}`,
        scope: preselectedEvent.plantel === 'General' ? 'general' : 'plantel',
        plantel:
          preselectedEvent.plantel && preselectedEvent.plantel !== 'General'
            ? preselectedEvent.plantel
            : prev.plantel,
        dueDate: preselectedEvent.date || '',
        linkedEventId: preselectedEvent.id,
      }));
      if (onClearPreselectedEvent) onClearPreselectedEvent();
    }
  }, [preselectedEvent, onClearPreselectedEvent]);

  // Visibilidad por rol y usuario:
  // - SDB / Coordinador: ven TODOS los pendientes (incluyendo los creados por agentes de pastoral)
  //   divididos por plantel; solo respetan la privacidad de pendientes personales de otro SDB/Coordinador.
  // - Auxiliar / Agente de Pastoral: espacio limpio con sus propios pendientes, los asignados a él/ella,
  //   los de su plantel y los de Pastoral General.
  const visibleTasks = useMemo(() => {
    return tasks.filter((t) => {
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
    });
  }, [tasks, currentUser, userPlantel, isFullAdmin]);

  const filteredTasks = useMemo(() => {
    return visibleTasks
      .filter((t) => {
        if (scopeFilter === 'asignados') {
          return Boolean(t.assignedToUid || t.assignedToEmail);
        }
        return scopeFilter === 'todos' ? true : t.scope === scopeFilter;
      })
      .filter((t) => {
        if (!isFullAdmin || adminPlantelFilter === 'Todos') return true;
        return (t.plantel || 'General') === adminPlantelFilter;
      })
      .filter((t) => (showCompleted ? true : !t.done));
  }, [visibleTasks, scopeFilter, adminPlantelFilter, isFullAdmin, showCompleted]);

  // Agrupación por plantel (solo para SDB / Coordinador)
  const adminGroupedByPlantel = useMemo(() => {
    if (!isFullAdmin) return [];
    const order = ['Glandorff', 'Kennedy', 'Cordilleras', 'General'];
    const map = new Map();
    order.forEach((p) => map.set(p, []));
    filteredTasks.forEach((t) => {
      const key = order.includes(t.plantel) ? t.plantel : 'General';
      map.get(key).push(t);
    });
    return order
      .map((p) => ({ plantel: p, items: map.get(p) }))
      .filter((g) => g.items.length > 0);
  }, [filteredTasks, isFullAdmin]);

  const startEditingTask = (task) => {
    setEditingTaskId(task.id);
    setForm({
      title: task.title || '',
      notes: task.notes || '',
      scope: task.scope || 'personal',
      plantel:
        task.plantel && task.plantel !== 'General'
          ? task.plantel
          : userPlantel === 'General'
          ? 'Glandorff'
          : userPlantel,
      priority: task.priority || 'Media',
      dueDate: task.dueDate || '',
      linkedEventId: task.linkedEventId || '',
      assignedToUid: task.assignedToUid || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setForm({
      title: '',
      notes: '',
      scope: isFullAdmin ? 'plantel' : 'personal',
      plantel: userPlantel === 'General' ? 'Glandorff' : userPlantel,
      priority: 'Media',
      dueDate: '',
      linkedEventId: '',
      assignedToUid: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const linkedEvent = unifiedEvents.find((ev) => ev.id === form.linkedEventId);
    const assignedUser = teamUsers.find((u) => u.uid === form.assignedToUid);
    const effectivePlantel =
      form.scope === 'general'
        ? 'General'
        : form.scope === 'plantel'
        ? isFullAdmin || userPlantel === 'General'
          ? assignedUser?.plantel && assignedUser.plantel !== 'General'
            ? assignedUser.plantel
            : form.plantel
          : userPlantel
        : assignedUser?.plantel || userPlantel;

    const payload = {
      title: form.title.trim(),
      notes: form.notes.trim(),
      scope: form.scope,
      plantel: effectivePlantel,
      priority: form.priority,
      dueDate: form.dueDate,
      assignedToUid: assignedUser?.uid || '',
      assignedToEmail: assignedUser?.email || '',
      assignedToName: assignedUser?.name || '',
      linkedEventId: linkedEvent?.id || '',
      linkedEventTitle: linkedEvent?.title || '',
      linkedEventDate: linkedEvent?.date || '',
    };

    if (editingTaskId && onUpdateTask) {
      onUpdateTask(editingTaskId, payload);
      setEditingTaskId(null);
    } else {
      onAddTask({
        ...payload,
        ownerUid: currentUser?.uid || 'local-user',
        ownerEmail: currentUser?.email || '',
        ownerName: currentUser?.name || 'Usuario Pastoral',
        ownerRole: currentUser?.role || ROLES.AUXILIAR,
      });
    }

    setForm({
      title: '',
      notes: '',
      scope: form.scope,
      plantel: userPlantel === 'General' ? 'Glandorff' : userPlantel,
      priority: 'Media',
      dueDate: '',
      linkedEventId: '',
      assignedToUid: '',
    });
  };

  const pendingCount = visibleTasks.filter((t) => !t.done).length;

  const todayIso = new Date().toISOString().slice(0, 10);
  const inTwoDaysIso = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);

  const urgentSummary = useMemo(() => {
    const activeWithDate = visibleTasks.filter((t) => !t.done && t.dueDate);
    const overdue = activeWithDate.filter((t) => t.dueDate < todayIso);
    const dueSoon = activeWithDate.filter((t) => t.dueDate >= todayIso && t.dueDate <= inTwoDaysIso);
    return { overdue, dueSoon };
  }, [visibleTasks, todayIso, inTwoDaysIso]);

  const sendBrowserReminder = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      if (onToast) onToast('Tu navegador no soporta notificaciones nativas', 'info');
      return;
    }

    let perm = window.Notification.permission;
    if (perm === 'default') {
      perm = await window.Notification.requestPermission();
      setNotifPermission(perm);
    }

    if (perm !== 'granted') {
      if (onToast) {
        onToast('Permiso de notificaciones bloqueado en el navegador. Actívalo en el candado de la URL.', 'error');
      }
      return;
    }

    setNotifEnabled(true);
    try {
      window.localStorage.setItem('portal_pastoral_notif_enabled', 'true');
    } catch {
      // ignore
    }

    const urgentTotal = urgentSummary.overdue.length + urgentSummary.dueSoon.length;
    const body =
      urgentTotal > 0
        ? `Tienes ${urgentSummary.overdue.length} vencido(s) y ${urgentSummary.dueSoon.length} por vencer pronto (${pendingCount} activos en total).`
        : `Tienes ${pendingCount} pendiente(s) activos en el Departamento de Pastoral.`;

    new window.Notification('Recordatorio · Pendientes Pastoral ESFER', {
      body,
      icon: './assets/logo-pastoral.png',
    });

    if (onToast) onToast('Recordatorio enviado a tus notificaciones del sistema', 'success');
  };

  const disableNotifications = () => {
    setNotifEnabled(false);
    try {
      window.localStorage.setItem('portal_pastoral_notif_enabled', 'false');
    } catch {
      // ignore
    }
    if (onToast) onToast('Notificaciones de recordatorio desactivadas', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pastoral/10 text-pastoral px-3 py-1 text-xs font-extrabold">
            <CheckSquare className="h-3.5 w-3.5" />
            Gestión de Tareas Operativas · No altera el Calendario Institucional
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Pendientes del Departamento de Pastoral
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organiza tus pendientes personales, de tu plantel (<strong>{userPlantel}</strong>) o de
            Pastoral General. Puedes enviar cualquiera a tu <strong>calendario personal</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          {notifPermission !== 'unsupported' &&
            (notifPermission === 'granted' && notifEnabled ? (
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={sendBrowserReminder}
                  className="inline-flex items-center gap-1.5 rounded-2xl border bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800 px-3.5 py-2.5 text-xs font-extrabold shadow-card transition-all"
                  title="Enviar recordatorio a tus notificaciones del dispositivo"
                >
                  <BellRing className="h-4 w-4" />
                  <span>Enviar recordatorio</span>
                </button>
                <button
                  type="button"
                  onClick={disableNotifications}
                  className="inline-flex items-center gap-1.5 rounded-2xl border bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 px-3 py-2.5 text-xs font-bold shadow-card transition-all"
                  title="Desactivar notificaciones de pendientes"
                >
                  <BellOff className="h-4 w-4" />
                  <span>Desactivar</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={sendBrowserReminder}
                className="inline-flex items-center gap-2 rounded-2xl border bg-white hover:bg-pastoral hover:text-white border-slate-200 text-pastoral px-4 py-2.5 text-xs font-extrabold shadow-card transition-all"
                title="Activar notificaciones de pendientes en este dispositivo"
              >
                <Bell className="h-4 w-4" />
                <span>Activar notificaciones</span>
              </button>
            ))}

          <div className="rounded-2xl bg-white border border-slate-200 px-4 py-2 shadow-card text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Activos</div>
            <div className="text-xl font-black text-pastoral leading-none mt-0.5">
              {pendingCount}
            </div>
          </div>
        </div>
      </div>

      {/* Banner de Recordatorios Urgentes (Vencidos o próximos 2 días) */}
      {(urgentSummary.overdue.length > 0 || urgentSummary.dueSoon.length > 0) && (
        <div
          className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            urgentSummary.overdue.length > 0
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={`h-5 w-5 shrink-0 mt-0.5 ${
                urgentSummary.overdue.length > 0 ? 'text-rose-600' : 'text-amber-600'
              }`}
            />
            <div className="text-xs sm:text-sm">
              <strong className="font-extrabold">Recordatorio de pendientes próximos: </strong>
              {urgentSummary.overdue.length > 0 && (
                <span>
                  {urgentSummary.overdue.length} vencido(s)
                  {urgentSummary.dueSoon.length > 0 ? ' · ' : ''}
                </span>
              )}
              {urgentSummary.dueSoon.length > 0 && (
                <span>{urgentSummary.dueSoon.length} por vencer en los próximos 2 días.</span>
              )}{' '}
              Puedes agregarlos a tu calendario personal (Google / Apple / Outlook) con un clic.
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Formulario Nuevo / Editar Pendiente */}
        <form
          onSubmit={handleSubmit}
          className={`lg:col-span-5 rounded-3xl bg-white border p-5 sm:p-6 shadow-card space-y-4 h-fit transition-all ${
            editingTaskId ? 'border-pastoral ring-2 ring-pastoral/15' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              {editingTaskId ? (
                <Edit3 className="h-5 w-5 text-pastoral" />
              ) : (
                <Plus className="h-5 w-5 text-pastoral" />
              )}
              <h2 className="text-base font-extrabold text-slate-900">
                {editingTaskId ? 'Editar Pendiente' : 'Agregar Pendiente'}
              </h2>
            </div>
            {editingTaskId && (
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              ¿Qué hay que hacer? *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej. Confirmar flores y manteles para la misa"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-pastoral"
            />
          </div>

          {/* Selector de Alcance */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
              Alcance del pendiente
            </label>
            <div className="grid grid-cols-1 gap-2">
              {SCOPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = form.scope === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setForm({ ...form, scope: opt.id })}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                      isActive
                        ? 'bg-pastoral/5 border-pastoral ring-1 ring-pastoral/20'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-pastoral' : 'text-slate-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-extrabold text-slate-900">{opt.label}</div>
                      <div className="text-[11px] text-slate-500">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Asignar a un usuario específico (solo SDB y Coordinador) */}
          {isFullAdmin && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Asignar a usuario del equipo (opcional)
              </label>
              <select
                value={form.assignedToUid}
                onChange={(e) => {
                  const uid = e.target.value;
                  const target = teamUsers.find((u) => u.uid === uid);
                  setForm((prev) => ({
                    ...prev,
                    assignedToUid: uid,
                    plantel:
                      target?.plantel && target.plantel !== 'General'
                        ? target.plantel
                        : prev.plantel,
                  }));
                }}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-pastoral"
              >
                <option value="">— Sin asignar a una persona específica —</option>
                {teamUsers.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.name || u.email} ({u.plantel || 'General'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Si es alcance Plantel y es SDB / Coordinador (o General), elegir a qué plantel va */}
          {form.scope === 'plantel' && (isFullAdmin || userPlantel === 'General') && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Plantel destino
              </label>
              <select
                value={form.plantel}
                onChange={(e) => setForm({ ...form, plantel: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
              >
                <option value="Glandorff">Glandorff</option>
                <option value="Kennedy">Kennedy</option>
                <option value="Cordilleras">Cordilleras</option>
              </select>
            </div>
          )}

          {/* Derivado de un evento del calendario (opcional) */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Derivar de un evento del calendario (opcional)
            </label>
            <select
              value={form.linkedEventId}
              onChange={(e) => setForm({ ...form, linkedEventId: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs sm:text-sm bg-white"
            >
              <option value="">— Ninguno (pendiente independiente) —</option>
              {unifiedEvents.map((ev) => (
                <option key={`${ev.source}-${ev.id}`} value={ev.id}>
                  {ev.date} · {ev.title} ({ev.plantel})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Prioridad
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Fecha límite (opcional)
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Notas (opcional)
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Detalles, contactos o recordatorios..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            />
          </div>

          <div className="flex gap-2">
            {editingTaskId && (
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm px-4 py-3 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-sm py-3 shadow-sm transition-colors"
            >
              {editingTaskId ? 'Guardar Cambios' : 'Guardar Pendiente'}
            </button>
          </div>
        </form>

        {/* Lista de Pendientes */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filtro por Plantel (exclusivo para SDB / Coordinador) */}
          {isFullAdmin && (
            <div className="rounded-2xl bg-white border border-slate-200 p-3 shadow-card flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
                Supervisión por Plantel:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Todos', ...PLANTELES].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAdminPlantelFilter(p)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                      adminPlantelFilter === p
                        ? 'bg-pastoral-deep text-white border-pastoral-deep'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-pastoral/40'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'asignados', label: 'Asignados' },
                { id: 'personal', label: 'Personales' },
                { id: 'plantel', label: isFullAdmin ? 'Por Plantel' : 'Mi Plantel' },
                { id: 'general', label: 'Pastoral General' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setScopeFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    scopeFilter === f.id
                      ? 'bg-pastoral text-white border-pastoral'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-pastoral/40'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded border-slate-300 text-pastoral focus:ring-pastoral"
              />
              <span>Mostrar completados</span>
            </label>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center text-sm text-slate-500">
              No hay pendientes en esta vista. ¡Todo al día!
            </div>
          ) : isFullAdmin ? (
            /* Vista de SDB / Coordinador: dividida limpiamente por Plantel */
            <div className="space-y-6">
              {adminGroupedByPlantel.map((group) => (
                <section key={group.plantel} className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-pastoral" />
                      <h2 className="text-base font-black text-pastoral-deep">
                        {group.plantel === 'General'
                          ? 'Pastoral General'
                          : `Plantel ${group.plantel}`}
                      </h2>
                    </div>
                    <span className="rounded-full bg-pastoral/10 text-pastoral px-2.5 py-0.5 text-[11px] font-extrabold">
                      {group.items.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {group.items.map((task) => {
                      const scopeMeta =
                        SCOPE_OPTIONS.find((s) => s.id === task.scope) || SCOPE_OPTIONS[0];
                      return (
                        <article
                          key={task.id}
                          className={`rounded-3xl bg-white border p-4 sm:p-5 shadow-card transition-all flex items-start gap-3.5 ${
                            task.done ? 'border-slate-200 opacity-65' : 'border-slate-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => onToggleTaskDone(task.id)}
                            className="mt-0.5 text-pastoral hover:scale-110 transition-transform shrink-0"
                            aria-label={task.done ? 'Marcar como pendiente' : 'Marcar como completado'}
                          >
                            {task.done ? (
                              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            ) : (
                              <Circle className="h-6 w-6 text-slate-300 hover:text-pastoral" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${scopeMeta.badge}`}
                              >
                                {scopeMeta.label}
                              </span>
                              {task.assignedToName && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold">
                                  <UserCheck className="h-3 w-3" />
                                  Asignado a: {task.assignedToName}
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Media
                                }`}
                              >
                                {task.priority}
                              </span>
                              {task.dueDate && (
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                    !task.done && task.dueDate < todayIso
                                      ? 'bg-rose-100 text-rose-800'
                                      : !task.done && task.dueDate <= inTwoDaysIso
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  <Clock className="h-3 w-3" />
                                  {task.dueDate}
                                  {!task.done && task.dueDate < todayIso ? ' · Vencido' : ''}
                                </span>
                              )}
                            </div>

                            <h3
                              className={`text-sm sm:text-base font-extrabold ${
                                task.done ? 'line-through text-slate-500' : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </h3>

                            {task.notes && (
                              <p className="text-xs text-slate-600 leading-relaxed">{task.notes}</p>
                            )}

                            {task.linkedEventTitle && (
                              <div className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral/5 border border-pastoral/15 px-2.5 py-1 text-[11px] font-bold text-pastoral">
                                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                <span>
                                  Derivado de: {task.linkedEventTitle} ({task.linkedEventDate})
                                </span>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5">
                              <div className="text-[11px] text-slate-400">
                                Creado por{' '}
                                <strong className="text-slate-600">{task.ownerName}</strong>
                              </div>
                              {!task.done && (
                                <CalendarExportMenu
                                  event={{
                                    id: task.id,
                                    title: `Pendiente: ${task.title}`,
                                    date: task.dueDate || todayIso,
                                    startTime: '09:00',
                                    endTime: '10:00',
                                    plantel: task.plantel || 'General',
                                    location: `ESFER Salesianos (${task.plantel || 'General'})`,
                                    category: `Pendiente (${scopeMeta.label})`,
                                    description: [
                                      task.notes || '',
                                      task.linkedEventTitle
                                        ? `Derivado del evento: ${task.linkedEventTitle} (${task.linkedEventDate})`
                                        : '',
                                    ]
                                      .filter(Boolean)
                                      .join('\n'),
                                  }}
                                  compact
                                  onToast={onToast}
                                />
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEditingTask(task)}
                              className="p-2 rounded-xl text-slate-400 hover:text-pastoral hover:bg-pastoral/10"
                              title="Editar pendiente"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (editingTaskId === task.id) cancelEditing();
                                onDeleteTask(task.id);
                              }}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Eliminar pendiente"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            /* Vista limpia para cada Auxiliar / Agente de Pastoral */
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const scopeMeta =
                  SCOPE_OPTIONS.find((s) => s.id === task.scope) || SCOPE_OPTIONS[0];
                return (
                  <article
                    key={task.id}
                    className={`rounded-3xl bg-white border p-4 sm:p-5 shadow-card transition-all flex items-start gap-3.5 ${
                      task.done ? 'border-slate-200 opacity-65' : 'border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTaskDone(task.id)}
                      className="mt-0.5 text-pastoral hover:scale-110 transition-transform shrink-0"
                      aria-label={task.done ? 'Marcar como pendiente' : 'Marcar como completado'}
                    >
                      {task.done ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-slate-300 hover:text-pastoral" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${scopeMeta.badge}`}
                        >
                          {scopeMeta.label}
                        </span>
                        {task.assignedToName && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold">
                            <UserCheck className="h-3 w-3" />
                            Asignado a: {task.assignedToName}
                          </span>
                        )}
                        {task.scope === 'plantel' && (
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                              PLANTEL_BADGE_STYLES[task.plantel] || PLANTEL_BADGE_STYLES.General
                            }`}
                          >
                            {task.plantel}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Media
                          }`}
                        >
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              !task.done && task.dueDate < todayIso
                                ? 'bg-rose-100 text-rose-800'
                                : !task.done && task.dueDate <= inTwoDaysIso
                                ? 'bg-amber-100 text-amber-900'
                                : 'text-slate-500'
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            {task.dueDate}
                            {!task.done && task.dueDate < todayIso ? ' · Vencido' : ''}
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-extrabold ${
                          task.done ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.notes && (
                        <p className="text-xs text-slate-600 leading-relaxed">{task.notes}</p>
                      )}

                      {task.linkedEventTitle && (
                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral/5 border border-pastoral/15 px-2.5 py-1 text-[11px] font-bold text-pastoral">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            Derivado de: {task.linkedEventTitle} ({task.linkedEventDate})
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5">
                        <div className="text-[11px] text-slate-400">
                          Creado por <strong className="text-slate-600">{task.ownerName}</strong>
                        </div>
                        {!task.done && (
                          <CalendarExportMenu
                            event={{
                              id: task.id,
                              title: `Pendiente: ${task.title}`,
                              date: task.dueDate || todayIso,
                              startTime: '09:00',
                              endTime: '10:00',
                              plantel: task.plantel || 'General',
                              location: `ESFER Salesianos (${task.plantel || 'General'})`,
                              category: `Pendiente (${scopeMeta.label})`,
                              description: [
                                task.notes || '',
                                task.linkedEventTitle
                                  ? `Derivado del evento: ${task.linkedEventTitle} (${task.linkedEventDate})`
                                  : '',
                              ]
                                .filter(Boolean)
                                .join('\n'),
                            }}
                            compact
                            onToast={onToast}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditingTask(task)}
                        className="p-2 rounded-xl text-slate-400 hover:text-pastoral hover:bg-pastoral/10"
                        title="Editar pendiente"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (editingTaskId === task.id) cancelEditing();
                          onDeleteTask(task.id);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Eliminar pendiente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
