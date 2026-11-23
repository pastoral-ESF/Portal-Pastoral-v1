import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  LayoutGrid,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PLANTELES, PLANTEL_BADGE_STYLES } from '../../constants/config';
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

export function PublicCalendarView({ events, onToast }) {
  const [selectedPlantel, setSelectedPlantel] = useState('Todos');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'calendar'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [monthCursor, setMonthCursor] = useState(() => {
    const first = events[0]?.date;
    if (first) {
      const [y, m] = first.split('-').map(Number);
      return { year: y, month: m - 1 };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const todayIso = new Date().toISOString().slice(0, 10);
  const todayFormatted = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const filteredEvents = useMemo(() => {
    return events.filter((e) =>
      selectedPlantel === 'Todos' ? true : e.plantel === selectedPlantel
    );
  }, [events, selectedPlantel]);

  const groupedByMonth = useMemo(() => {
    const groups = [];
    const map = new Map();
    filteredEvents.forEach((ev) => {
      const key = ev.date && ev.date.length >= 7 ? ev.date.slice(0, 7) : 'sin-fecha';
      if (!map.has(key)) {
        let label = 'Por confirmar';
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
  }, [filteredEvents]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(monthCursor.year, monthCursor.month, 1).getDay();
    const totalDays = new Date(monthCursor.year, monthCursor.month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let d = 1; d <= totalDays; d += 1) {
      const iso = `${monthCursor.year}-${String(monthCursor.month + 1).padStart(2, '0')}-${String(
        d
      ).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter((e) => e.date === iso);
      cells.push({ day: d, iso, events: dayEvents });
    }
    return cells;
  }, [monthCursor, filteredEvents]);

  const monthEvents = useMemo(() => {
    return filteredEvents.filter((ev) => {
      const [y, m] = (ev.date || '').split('-').map(Number);
      return y === monthCursor.year && m - 1 === monthCursor.month;
    });
  }, [filteredEvents, monthCursor]);

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
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pastoral/10 text-pastoral px-3 py-1 text-xs font-extrabold">
              <CalendarIcon className="h-3.5 w-3.5" />
              Agenda Comunitaria Abierta
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pastoral-gold/20 border border-pastoral-gold/50 text-amber-950 px-3 py-1 text-xs font-extrabold capitalize">
              <CalendarDays className="h-3.5 w-3.5 text-amber-700" />
              <span>Hoy: {todayFormatted}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Calendario Pastoral Público
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Retiros para papás, celebraciones eucarísticas y encuentros del Movimiento Juvenil
            Salesiano.
          </p>
        </div>

        {/* Selector claro de vista: Tarjetas (predeterminada) vs Calendario */}
        <div className="inline-flex items-center bg-white border border-slate-200 rounded-2xl p-1 self-start shadow-card">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
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
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              viewMode === 'calendar'
                ? 'bg-pastoral text-white shadow-sm'
                : 'text-slate-600 hover:text-pastoral'
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            <span>Vista Calendario</span>
          </button>
        </div>
      </div>

      {/* Filtros por plantel */}
      <div className="flex flex-wrap items-center gap-2">
        {['Todos', ...PLANTELES].map((plantel) => (
          <button
            key={plantel}
            type="button"
            onClick={() => setSelectedPlantel(plantel)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
              selectedPlantel === plantel
                ? 'bg-pastoral text-white border-pastoral shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-pastoral/40 hover:text-pastoral'
            }`}
          >
            {plantel !== 'Todos' && (
              <span
                className={`h-2 w-2 rounded-full ${
                  selectedPlantel === plantel
                    ? 'bg-white'
                    : PLANTEL_DOT_COLORS[plantel] || 'bg-pastoral'
                }`}
              />
            )}
            <span>{plantel}</span>
          </button>
        ))}
      </div>

      {/* Vista Tarjetas */}
      {viewMode === 'cards' ? (
        filteredEvents.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center">
            <CalendarIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800">Sin eventos públicos en este filtro</h3>
            <p className="text-sm text-slate-500 mt-1">
              Prueba seleccionando otro plantel o vuelve pronto para nuevas fechas.
            </p>
          </div>
        ) : (
          <div className="space-y-7">
            {groupedByMonth.map((group) => (
              <section key={group.key} className="space-y-3.5">
                <div className="flex items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-pastoral text-white flex items-center justify-center shadow-sm">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-pastoral-deep tracking-tight">
                      {group.label}
                    </h2>
                  </div>
                  <span className="rounded-full bg-pastoral/10 text-pastoral px-3 py-1 text-xs font-extrabold">
                    {group.events.length} {group.events.length === 1 ? 'evento' : 'eventos'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.events.map((ev) => {
                    const [, m, d] = (ev.date || '2026-01-01').split('-').map(Number);
                    return (
                      <article
                        key={ev.id}
                        className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card hover:shadow-soft transition-all flex flex-col justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-16 shrink-0 rounded-2xl bg-gradient-to-b from-pastoral to-pastoral-deep text-white text-center py-2.5 px-2 shadow-sm">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-pastoral-gold">
                              {MONTH_NAMES[(m || 1) - 1]?.slice(0, 3)}
                            </div>
                            <div className="text-2xl font-black leading-none mt-0.5">{d || '--'}</div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                                  PLANTEL_BADGE_STYLES[ev.plantel] || PLANTEL_BADGE_STYLES.General
                                }`}
                              >
                                {ev.plantel}
                              </span>
                              {ev.category && (
                                <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[11px] font-semibold">
                                  {ev.category}
                                </span>
                              )}
                            </div>
                            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                              {ev.title}
                            </h3>
                            {ev.description && (
                              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                                {ev.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-500">
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
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-slate-400">
                            {formatHumanDate(ev.date)}
                          </span>
                          <CalendarExportMenu event={ev} compact onToast={onToast} />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )
      ) : (
        /* Vista Calendario Mensual Interactiva */
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
                Haz clic en un evento para ver detalles
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

          {/* Encabezados de semana */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            {WEEKDAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Cuadrícula de días */}
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
                    {cell.events.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setSelectedEvent(ev)}
                        title={`${ev.title} (${ev.plantel})`}
                        className={`w-full text-left rounded-lg px-1.5 py-1 text-[10px] sm:text-[11px] font-bold truncate transition-all shadow-sm ${
                          PLANTEL_CHIP_STYLES[ev.plantel] || PLANTEL_CHIP_STYLES.General
                        }`}
                      >
                        <span className="hidden sm:inline opacity-80 mr-1">
                          {ev.startTime || ''}
                        </span>
                        {ev.title}
                      </button>
                    ))}
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
                No hay eventos públicos programados para este mes con el filtro actual. Usa las
                flechas para navegar a otros meses.
              </p>
            ) : (
              monthEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-slate-50 border border-slate-200/70 p-3.5 hover:border-pastoral/30 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(ev)}
                    className="text-left flex-1"
                  >
                    <div className="text-xs font-bold text-pastoral">
                      {formatHumanDate(ev.date)} · {ev.startTime || '09:00'} · {ev.plantel}
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">{ev.title}</div>
                  </button>
                  <CalendarExportMenu event={ev} compact onToast={onToast} />
                </div>
              ))
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
              {selectedEvent.category && (
                <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-semibold">
                  {selectedEvent.category}
                </span>
              )}
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

            <div className="pt-2 flex justify-end">
              <CalendarExportMenu event={selectedEvent} onToast={onToast} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
