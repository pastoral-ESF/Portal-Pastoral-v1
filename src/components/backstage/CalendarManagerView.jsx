import React, { useState, useMemo } from 'react';
import {
  CalendarPlus,
  Edit3,
  Trash2,
  Eye,
  Lock,
  MapPin,
  Clock,
  FileText,
  LayoutGrid,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  ClipboardCheck,
  Search,
  UploadCloud,
} from 'lucide-react';
import {
  PLANTELES,
  CARTA_PLANTEL_OPTIONS,
  EVENT_CATEGORIES,
  PLANTEL_BADGE_STYLES,
} from '../../constants/config';
import { CalendarExportMenu } from '../common/CalendarExportMenu';
import { Modal } from '../common/Modal';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const PLANTEL_CHIP_STYLES = {
  Glandorff: 'bg-pastoral text-white hover:bg-pastoral-deep',
  Kennedy: 'bg-pastoral-cyan text-white hover:bg-sky-600',
  Cordilleras: 'bg-lime-600 text-white hover:bg-lime-700',
  General: 'bg-amber-500 text-white hover:bg-amber-600',
};

const PLANTEL_DOT_COLORS = {
  Glandorff: 'bg-pastoral',
  Kennedy: 'bg-pastoral-cyan',
  Cordilleras: 'bg-lime-600',
  General: 'bg-amber-500',
};

function formatHumanDate(dateStr) {
  if (!dateStr) return 'Por confirmar';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return `${d} de ${MONTH_NAMES[m - 1]} de ${y}`;
}

function getLocalTodayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isPastEvent(ev, todayIso) {
  const effectiveEnd = ev?.endDate || ev?.date || '';
  if (!effectiveEnd) return false;
  return effectiveEnd < todayIso;
}

const BLANK_EVENT = {
  id: null,
  title: '',
  date: new Date().toISOString().slice(0, 10),
  startTime: '10:00',
  endTime: '11:30',
  plantel: 'Glandorff',
  location: '',
  category: 'Pastoral',
  visibility: 'publico',
  description: '',
};

export function CalendarManagerView({
  unifiedEvents,
  quickEvents,
  restrictedPlantel,
  canImportNotion = false,
  hasPendingNotionImport = false,
  onImportNotion,
  onToggleQuickVisibility,
  onSaveQuickEvent,
  onDeleteQuickEvent,
  onCreateCartaFromEvent,
  onOpenLinkedCarta,
  onOpenEvaluation,
  eventEvaluationConfigs = {},
  onDeriveTask,
  onToast,
}) {
  const [plantelFilter, setPlantelFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [visibilityFilter, setVisibilityFilter] = useState('todos'); // 'todos' | 'publico' | 'interno'
  const [onlyPastoral, setOnlyPastoral] = useState(false);
  const [monthFilter, setMonthFilter] = useState(() => getLocalTodayIso().slice(0, 7)); // Por defecto: mes en curso ('YYYY-MM')
  const [showPastEvents, setShowPastEvents] = useState(false); // Por defecto oculta eventos pasados (se pueden ver en gris)
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(60);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'calendar'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(BLANK_EVENT);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const todayIso = getLocalTodayIso();
  const todayFormatted = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const currentMonthKey = todayIso.slice(0, 7);

  const openNew = () => {
    setForm({
      ...BLANK_EVENT,
      plantel: restrictedPlantel || 'Glandorff',
      date: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(true);
  };

  const openEdit = (quickEvent) => {
    setSelectedEvent(null);
    setForm({ ...quickEvent });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSaveQuickEvent(form);
    setModalOpen(false);
  };

  const categories = useMemo(() => {
    const set = new Set();
    unifiedEvents.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return ['Todas', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))];
  }, [unifiedEvents]);

  const availableMonths = useMemo(() => {
    const map = new Map();
    unifiedEvents.forEach((e) => {
      if (!e.date || e.date.length < 7) return;
      const key = e.date.slice(0, 7);
      if (!map.has(key)) {
        const [y, m] = key.split('-').map(Number);
        map.set(key, {
          key,
          label: `${MONTH_NAMES[(m || 1) - 1]} ${y}`,
          shortLabel: `${MONTH_NAMES[(m || 1) - 1]?.slice(0, 3)} ${String(y).slice(2)}`,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [unifiedEvents]);

  const PASTORAL_CATEGORIES = new Set([
    'Pastoral',
    'Misa',
    'MJS',
    'Retiro',
    'Sacramentos',
    'Formación / Pláticas',
    'TSJB / Liturgia',
    'CEP',
    'Comunidad SDB',
    'Inspectorial',
    'Actividad Pastoral',
    'Experiencia Pastoral',
  ]);

  // Filtro base (sin filtro de mes) usado por la Vista Calendario
  const baseFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return unifiedEvents.filter((e) => {
      if (plantelFilter !== 'Todos' && e.plantel !== plantelFilter) return false;
      if (categoryFilter !== 'Todas' && (e.category || '') !== categoryFilter) return false;
      if (visibilityFilter !== 'todos' && e.visibility !== visibilityFilter) return false;
      if (onlyPastoral && e.source !== 'carta' && !PASTORAL_CATEGORIES.has(e.category || '')) {
        return false;
      }
      if (q) {
        const hay = `${e.title || ''} ${e.description || ''} ${e.location || ''} ${e.category || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [unifiedEvents, plantelFilter, categoryFilter, visibilityFilter, onlyPastoral, searchQuery]);

  // Filtro completo (incluye mes) usado por la Vista Tarjetas
  const monthScopedEvents = useMemo(() => {
    if (monthFilter === 'Todos') return baseFiltered;
    return baseFiltered.filter(
      (e) =>
        (e.date || '').startsWith(monthFilter) ||
        (e.endDate || '').startsWith(monthFilter)
    );
  }, [baseFiltered, monthFilter]);

  // Si el usuario eligió un mes completamente pasado (ej. mes anterior), mostramos sus eventos en gris automáticamente
  const isViewingPastMonth = monthFilter !== 'Todos' && monthFilter < currentMonthKey;

  const pastEventsCount = useMemo(
    () => monthScopedEvents.filter((e) => isPastEvent(e, todayIso)).length,
    [monthScopedEvents, todayIso]
  );

  const filtered = useMemo(() => {
    if (showPastEvents || isViewingPastMonth) return monthScopedEvents;
    return monthScopedEvents.filter((e) => !isPastEvent(e, todayIso));
  }, [monthScopedEvents, showPastEvents, isViewingPastMonth, todayIso]);

  const groupedByMonth = useMemo(() => {
    const slice = filtered.slice(0, visibleLimit);
    const groups = [];
    const map = new Map();
    slice.forEach((ev) => {
      const key = ev.date && ev.date.length >= 7 ? ev.date.slice(0, 7) : 'sin-fecha';
      if (!map.has(key)) {
        let label = 'Sin fecha asignada';
        if (key !== 'sin-fecha') {
          const [y, m] = key.split('-').map(Number);
          label = `${MONTH_NAMES[(m || 1) - 1]} ${y}`;
        }
        const entry = { key, label, events: [] };
        map.set(key, entry);
        groups.push(entry);
      }
      map.get(key).events.push(ev);
    });
    return groups;
  }, [filtered, visibleLimit]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(monthCursor.year, monthCursor.month, 1).getDay();
    const totalDays = new Date(monthCursor.year, monthCursor.month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let d = 1; d <= totalDays; d += 1) {
      const iso = `${monthCursor.year}-${String(monthCursor.month + 1).padStart(2, '0')}-${String(
        d
      ).padStart(2, '0')}`;
      const dayEvents = baseFiltered.filter((e) => {
        if (!e.date) return false;
        if (e.endDate && e.endDate >= e.date) {
          return iso >= e.date && iso <= e.endDate;
        }
        return e.date === iso;
      });
      cells.push({ day: d, iso, events: dayEvents });
    }
    return cells;
  }, [monthCursor, baseFiltered]);

  const monthEvents = useMemo(() => {
    const monthPrefix = `${monthCursor.year}-${String(monthCursor.month + 1).padStart(2, '0')}`;
    return baseFiltered.filter((ev) => {
      if (!ev.date) return false;
      if (ev.date.startsWith(monthPrefix)) return true;
      if (ev.endDate && ev.endDate.startsWith(monthPrefix)) return true;
      return false;
    });
  }, [baseFiltered, monthCursor]);

  const shiftMonth = (delta) => {
    setMonthCursor((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const goToToday = () => {
    const now = new Date();
    setMonthCursor({ year: now.getFullYear(), month: now.getMonth() });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pastoral-gold/20 border border-pastoral-gold/50 text-amber-950 px-3 py-1 text-xs font-extrabold capitalize">
              <CalendarDays className="h-3.5 w-3.5 text-amber-700" />
              <span>Hoy: {todayFormatted}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                goToToday();
                setMonthFilter(currentMonthKey);
              }}
              className="rounded-full bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-2.5 py-1 text-[11px] font-bold transition-colors"
            >
              Ver mes actual
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Gestión de Calendarios por Plantel
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Administra eventos rápidos (juntas, misas, recordatorios), visibilidad pública/interna y
            exportación `.ics` / Google Calendar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector Vista Tarjetas (predeterminada) vs Vista Calendario */}
          <div className="inline-flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-card">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'cards'
                  ? 'bg-pastoral text-white shadow-sm'
                  : 'text-slate-600 hover:text-pastoral'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Vista Tarjetas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-pastoral text-white shadow-sm'
                  : 'text-slate-600 hover:text-pastoral'
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              <span>Vista Calendario</span>
            </button>
          </div>

          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 shadow-sm transition-all shrink-0"
          >
            <CalendarPlus className="h-4 w-4" />
            <span>Nuevo Evento Rápido</span>
          </button>
        </div>
      </div>

      {/* Banner de importación Notion -> Firestore (solo si faltan eventos por subir) */}
      {canImportNotion && hasPendingNotionImport && onImportNotion && (
        <div className="rounded-3xl bg-gradient-to-r from-pastoral-deep to-pastoral text-white p-4 sm:p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <UploadCloud className="h-5 w-5 text-pastoral-gold" />
            </div>
            <div>
              <div className="text-sm font-extrabold">
                Calendario ESFER 2026-2027 listo para cargar (401 eventos de Notion)
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Todos se cargan inicialmente como <strong>Internos</strong> y se sincronizan directo
                a tu base de datos Firebase Firestore.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onImportNotion}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pastoral-gold hover:bg-amber-400 text-pastoral-deep font-black text-xs sm:text-sm px-5 py-2.5 shadow-sm transition-all shrink-0"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Cargar 401 eventos a Firestore</span>
          </button>
        </div>
      )}

      {/* Buscador y Filtros (Plantel, Categoría y Visibilidad) */}
      <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleLimit(40);
              }}
              placeholder="Buscar evento por nombre, lugar o descripción..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white pl-10 pr-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:border-pastoral"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setVisibleLimit(40);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-pastoral"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'Todas' ? 'Categoría: Todas' : `Categoría: ${cat}`}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={visibilityFilter}
              onChange={(e) => {
                setVisibilityFilter(e.target.value);
                setVisibleLimit(40);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-pastoral"
            >
              <option value="todos">Visibilidad: Todos ({filtered.length})</option>
              <option value="publico">Solo Públicos</option>
              <option value="interno">Solo Internos</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {['Todos', ...PLANTELES].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPlantelFilter(p);
                  setVisibleLimit(40);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  plantelFilter === p
                    ? 'bg-pastoral text-white border-pastoral shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-pastoral/40'
                }`}
              >
                {p !== 'Todos' && (
                  <span
                    className={`h-2 w-2 rounded-full ${
                      plantelFilter === p ? 'bg-white' : PLANTEL_DOT_COLORS[p] || 'bg-pastoral'
                    }`}
                  />
                )}
                <span>{p}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setOnlyPastoral((prev) => !prev);
                setVisibleLimit(60);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                onlyPastoral
                  ? 'bg-pastoral-gold text-pastoral-deep border-pastoral-gold shadow-sm'
                  : 'bg-amber-50/70 text-amber-900 border-amber-200 hover:border-pastoral-gold'
              }`}
              title="Filtrar solo actividades de Pastoral o con Carta Descriptiva"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{onlyPastoral ? 'Solo Pastoral (Activo)' : 'Solo Pastoral'}</span>
            </button>
            {viewMode === 'cards' && !isViewingPastMonth && pastEventsCount > 0 && (
              <button
                type="button"
                onClick={() => setShowPastEvents((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  showPastEvents
                    ? 'bg-slate-600 text-white border-slate-600 shadow-sm'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
                title="Mostrar u ocultar eventos que ya pasaron (en gris)"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {showPastEvents
                    ? `Ocultar pasados (${pastEventsCount})`
                    : `Ver pasados en gris (${pastEventsCount})`}
                </span>
              </button>
            )}
          </div>
          <span className="text-xs font-bold text-slate-400">
            {viewMode === 'calendar'
              ? `${monthEvents.length} en este mes · ${baseFiltered.length} totales`
              : `Mostrando ${filtered.length} de ${unifiedEvents.length} eventos`}
          </span>
        </div>

        {/* Selector rápido de mes para la Vista Tarjetas */}
        {viewMode === 'cards' && availableMonths.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setMonthFilter('Todos');
                setVisibleLimit(60);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all ${
                monthFilter === 'Todos'
                  ? 'bg-pastoral-deep text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos los meses
            </button>
            {availableMonths.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => {
                  setMonthFilter(m.key);
                  setVisibleLimit(120);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                  monthFilter === m.key
                    ? 'bg-pastoral-cyan text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m.shortLabel}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Vista Tarjetas agrupadas por mes (predeterminada) */}
      {viewMode === 'cards' ? (
        <div className="space-y-6">
          {groupedByMonth.length === 0 && (
            <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center text-sm text-slate-500">
              No hay eventos que coincidan con los filtros seleccionados.
            </div>
          )}

          {groupedByMonth.map((group) => (
            <section key={group.key} className="space-y-3">
              {/* Encabezado del Mes */}
              <div className="flex items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-pastoral text-white flex items-center justify-center shadow-sm">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-black text-pastoral-deep tracking-tight">
                    {group.label}
                  </h2>
                </div>
                <span className="rounded-full bg-pastoral/10 text-pastoral px-3 py-1 text-xs font-extrabold">
                  {group.events.length} {group.events.length === 1 ? 'evento' : 'eventos'}
                </span>
              </div>

              <div className="space-y-3">
                {group.events.map((ev) => {
            const isQuick = ev.source === 'quick';
            const rawQuick = isQuick ? quickEvents.find((q) => q.id === ev.id) : null;
            const past = isPastEvent(ev, todayIso);

            return (
              <div
                key={`${ev.source}-${ev.id}`}
                className={`rounded-3xl border p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                  past
                    ? 'bg-slate-50/90 border-slate-200/80 opacity-65 saturate-50'
                    : 'bg-white border-slate-200 shadow-card'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {past && (
                      <span className="inline-flex items-center rounded-full bg-slate-200 text-slate-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                        Pasado
                      </span>
                    )}
                    {ev.date === todayIso && (
                      <span className="inline-flex items-center rounded-full bg-pastoral-gold text-pastoral-deep px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        HOY
                      </span>
                    )}
                    <span className={`text-xs font-extrabold ${past ? 'text-slate-500' : 'text-pastoral'}`}>
                      {ev.date}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                        PLANTEL_BADGE_STYLES[ev.plantel] || PLANTEL_BADGE_STYLES.General
                      }`}
                    >
                      {ev.plantel}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        ev.visibility === 'publico'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ev.visibility === 'publico' ? (
                        <>
                          <Eye className="h-3 w-3" /> Público
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" /> Interno
                        </>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-pastoral/5 text-pastoral px-2.5 py-0.5 text-[11px] font-semibold">
                      {isQuick ? (
                        ev.category || 'Evento rápido'
                      ) : (
                        <>
                          <FileText className="h-3 w-3" /> Vinculado a Carta Descriptiva
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">{ev.title}</h3>
                  {ev.description && <p className="text-xs text-slate-600">{ev.description}</p>}

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-pastoral-cyan" />
                      {ev.startTime || '09:00'}
                      {ev.endTime ? ` - ${ev.endTime}` : ''}
                    </span>
                    {ev.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-pastoral-red" />
                        {ev.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {isQuick && onCreateCartaFromEvent && (
                    <button
                      type="button"
                      onClick={() => onCreateCartaFromEvent(ev)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white border border-pastoral/20 px-3 py-1.5 text-xs font-extrabold transition-colors"
                      title="Vincular y planear la Carta Descriptiva de este evento"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Crear Carta</span>
                    </button>
                  )}
                  {!isQuick && onOpenLinkedCarta && (
                    <button
                      type="button"
                      onClick={() => onOpenLinkedCarta(ev.cartaId)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral hover:bg-pastoral-deep text-white px-3 py-1.5 text-xs font-extrabold transition-colors"
                      title="Abrir la Carta Descriptiva vinculada"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Ver / Editar Carta</span>
                    </button>
                  )}
                  {isQuick && onToggleQuickVisibility && (
                    <button
                      type="button"
                      onClick={() => onToggleQuickVisibility(ev.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                        ev.visibility === 'publico'
                          ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                          : 'bg-slate-100 hover:bg-emerald-50 border-slate-200 text-slate-700 hover:text-emerald-800'
                      }`}
                      title="Cambiar visibilidad en el Visor Público"
                    >
                      {ev.visibility === 'publico' ? (
                        <>
                          <Eye className="h-3.5 w-3.5" /> Público
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" /> Hacer Público
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onOpenEvaluation && onOpenEvaluation(ev)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                      eventEvaluationConfigs[ev.id]?.enabled
                        ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    }`}
                    title="Configurar enlace, QR y resultados de evaluación de este evento"
                  >
                    <ClipboardCheck className="h-3.5 w-3.5 text-pastoral" />
                    <span>
                      {eventEvaluationConfigs[ev.id]?.enabled ? 'Evaluación ✓' : 'Evaluación'}
                    </span>
                  </button>
                  {onDeriveTask && (
                    <button
                      type="button"
                      onClick={() => onDeriveTask(ev)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 px-3 py-1.5 text-xs font-bold transition-colors"
                      title="Crear un pendiente derivado de este evento"
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                      <span>Derivar pendiente</span>
                    </button>
                  )}
                  <CalendarExportMenu event={ev} compact onToast={onToast} />
                  {isQuick && rawQuick && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(rawQuick)}
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-pastoral hover:bg-slate-50"
                        title="Editar evento rápido"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteQuickEvent(rawQuick.id)}
                        className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Eliminar evento rápido"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
              </div>
            </section>
          ))}

          {filtered.length > visibleLimit && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setVisibleLimit((prev) => prev + 60)}
                className="inline-flex items-center justify-center rounded-2xl bg-white hover:bg-pastoral hover:text-white border border-slate-200 hover:border-pastoral px-6 py-2.5 text-xs font-extrabold text-pastoral shadow-card transition-all"
              >
                Mostrar más eventos ({filtered.length - visibleLimit} restantes)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Vista Calendario Mensual en Backstage */
        <div className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-2xl font-black text-pastoral-deep">
                {MONTH_NAMES[monthCursor.month]} {monthCursor.year}
              </h2>
              <button
                type="button"
                onClick={goToToday}
                className="rounded-xl bg-slate-100 hover:bg-pastoral/10 text-slate-700 hover:text-pastoral px-3 py-1.5 text-xs font-bold transition-colors"
              >
                Hoy
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs font-semibold text-slate-400 mr-2">
                Incluye eventos Públicos e Internos (🔒)
              </span>
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            {WEEKDAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell, idx) =>
              !cell ? (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[84px] sm:min-h-[112px] rounded-2xl bg-slate-50/50"
                />
              ) : (
                <div
                  key={cell.iso}
                  className={`min-h-[84px] sm:min-h-[112px] rounded-2xl border p-1.5 sm:p-2 flex flex-col gap-1 transition-colors ${
                    cell.iso === todayIso
                      ? 'bg-pastoral-gold/10 border-pastoral-gold ring-1 ring-pastoral-gold/40'
                      : cell.iso < todayIso
                      ? 'bg-slate-50/80 border-slate-100'
                      : cell.events.length > 0
                      ? 'bg-pastoral/[0.03] border-pastoral/20'
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold inline-flex items-center justify-center ${
                        cell.iso === todayIso
                          ? 'h-6 w-6 rounded-full bg-pastoral text-white'
                          : cell.iso < todayIso
                          ? 'text-slate-400'
                          : cell.events.length > 0
                          ? 'text-pastoral-deep'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.day}
                    </span>
                    {cell.events.length > 0 && (
                      <span className="hidden sm:inline text-[10px] font-bold text-slate-400">
                        {cell.events.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-24 no-scrollbar">
                    {cell.events.map((ev) => {
                      const pastCell = cell.iso < todayIso;
                      return (
                        <button
                          key={`${ev.source}-${ev.id}`}
                          type="button"
                          onClick={() => setSelectedEvent(ev)}
                          title={`${ev.title} (${ev.plantel} · ${
                            ev.visibility === 'publico' ? 'Público' : 'Interno'
                          }${pastCell ? ' · Pasado' : ''})`}
                          className={`w-full text-left rounded-lg px-1.5 py-1 text-[10px] sm:text-[11px] font-bold truncate transition-all ${
                            pastCell
                              ? 'bg-slate-200/80 text-slate-500 hover:bg-slate-300/80'
                              : ev.visibility === 'interno'
                              ? 'bg-slate-700 text-white hover:bg-slate-800 shadow-sm'
                              : `${PLANTEL_CHIP_STYLES[ev.plantel] || PLANTEL_CHIP_STYLES.General} shadow-sm`
                          }`}
                        >
                          {ev.visibility === 'interno' ? '🔒 ' : ''}
                          {ev.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Resumen de eventos del mes */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <h3 className="text-sm font-extrabold text-slate-800">
              Agenda de {MONTH_NAMES[monthCursor.month]} ({monthEvents.length})
            </h3>
            {monthEvents.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                No hay eventos en este mes con el filtro actual.
              </p>
            ) : (
              monthEvents.map((ev) => {
                const past = isPastEvent(ev, todayIso);
                return (
                  <div
                    key={`${ev.source}-${ev.id}`}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3.5 ${
                      past
                        ? 'bg-slate-50/70 border-slate-200/60 opacity-60'
                        : 'bg-slate-50 border-slate-200/70'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(ev)}
                      className="text-left flex-1"
                    >
                      <div className={`text-xs font-bold ${past ? 'text-slate-400' : 'text-pastoral'}`}>
                        {past ? 'Pasado · ' : ''}
                        {formatHumanDate(ev.date)} · {ev.startTime || '09:00'} · {ev.plantel} ·{' '}
                        {ev.visibility === 'publico' ? 'Público' : 'Interno'}
                      </div>
                      <div className={`font-extrabold text-sm ${past ? 'text-slate-500' : 'text-slate-900'}`}>
                        {ev.title}
                      </div>
                    </button>
                    <CalendarExportMenu event={ev} compact onToast={onToast} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal de detalle al hacer clic en un evento del calendario */}
      <Modal
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || ''}
        subtitle={
          selectedEvent
            ? `${formatHumanDate(selectedEvent.date)} · Plantel ${selectedEvent.plantel}`
            : ''
        }
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                  PLANTEL_BADGE_STYLES[selectedEvent.plantel] || PLANTEL_BADGE_STYLES.General
                }`}
              >
                Plantel {selectedEvent.plantel}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                  selectedEvent.visibility === 'publico'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {selectedEvent.visibility === 'publico' ? (
                  <>
                    <Eye className="h-3.5 w-3.5" /> Público
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" /> Interno
                  </>
                )}
              </span>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-pastoral-cyan shrink-0" />
                <span>
                  <strong>Horario:</strong> {selectedEvent.startTime || '09:00'}
                  {selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ''}
                </span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-pastoral-red shrink-0" />
                  <span>
                    <strong>Lugar:</strong> {selectedEvent.location}
                  </span>
                </div>
              )}
            </div>

            {selectedEvent.description && (
              <p className="text-sm text-slate-600 leading-relaxed">{selectedEvent.description}</p>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {selectedEvent.source === 'quick' && onCreateCartaFromEvent && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedEvent;
                      setSelectedEvent(null);
                      onCreateCartaFromEvent(target);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral hover:bg-pastoral-deep text-white px-3.5 py-2 text-xs font-extrabold"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Crear Carta Descriptiva
                  </button>
                )}
                {selectedEvent.source === 'carta' && onOpenLinkedCarta && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = selectedEvent.cartaId;
                      setSelectedEvent(null);
                      onOpenLinkedCarta(id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral hover:bg-pastoral-deep text-white px-3.5 py-2 text-xs font-extrabold"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Ver / Editar Carta Descriptiva
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedEvent;
                    setSelectedEvent(null);
                    if (onOpenEvaluation) onOpenEvaluation(target);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-3.5 py-2 text-xs font-extrabold"
                >
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  Evaluación (QR / Enlace)
                </button>
                {onDeriveTask && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedEvent;
                      setSelectedEvent(null);
                      onDeriveTask(target);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 px-3.5 py-2 text-xs font-bold"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    Derivar pendiente
                  </button>
                )}
                {selectedEvent.source === 'quick' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const raw = quickEvents.find((q) => q.id === selectedEvent.id);
                      if (raw) openEdit(raw);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 text-xs font-bold"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Editar evento rápido
                  </button>
                ) : null}
              </div>
              <CalendarExportMenu event={selectedEvent} onToast={onToast} />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Evento Rápido */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? 'Editar Evento Rápido' : 'Nuevo Evento Rápido al Calendario'}
        subtitle="Para juntas, misas, recordatorios o actividades sin Carta Descriptiva."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Título del evento *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej. Misa de Inicio de Mes"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-pastoral"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Hora inicio
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Hora fin
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Plantel / Sede
              </label>
              <select
                value={form.plantel}
                onChange={(e) => setForm({ ...form, plantel: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
              >
                {(restrictedPlantel
                  ? [restrictedPlantel, 'TSJB (Templo San Juan Bosco)']
                  : CARTA_PLANTEL_OPTIONS.filter((p) => p !== 'Otro')
                ).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Categoría
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
              >
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Lugar
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Ej. Capilla del Plantel"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Visibilidad
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, visibility: 'publico' })}
                className={`rounded-xl border py-2.5 text-xs font-extrabold ${
                  form.visibility === 'publico'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Público (visible en Portal)
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, visibility: 'interno' })}
                className={`rounded-xl border py-2.5 text-xs font-extrabold ${
                  form.visibility === 'interno'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Interno (solo Backstage)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Descripción / Notas
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detalles útiles para la comunidad o equipo..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-pastoral hover:bg-pastoral-deep text-white px-5 py-2.5 text-xs font-extrabold shadow-sm"
            >
              Guardar Evento
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
