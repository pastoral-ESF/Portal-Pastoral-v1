import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  FileText,
  ClipboardCheck,
  Inbox,
  Plus,
  CalendarPlus,
  Printer,
  Edit3,
  Eye,
  Lock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  PLANTELES,
  PLANTEL_BADGE_STYLES,
  STATUS_STYLES,
  AGUINALDO_ACTUAL,
} from '../../constants/config';
import { Modal } from '../common/Modal';

export function DashboardView({
  cartas,
  unifiedEvents,
  messages,
  onNewCarta,
  onEditCarta,
  onPrintCarta,
  onQuickEventClick,
  onGoToEvaluation,
  onGoToInbox,
}) {
  const [plantelFilter, setPlantelFilter] = useState('Todos');
  const [onlyCurrentMonth, setOnlyCurrentMonth] = useState(true);
  const [aguinaldoOpen, setAguinaldoOpen] = useState(false);

  const now = new Date();
  const currentMonthKey = now.toISOString().slice(0, 7);
  const currentMonthLabel = now.toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  });

  const kpis = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const upcomingCount = unifiedEvents.filter((e) => (e.date || '') >= today).length;
    const inPlanningCount = cartas.filter((c) => c.status === 'En planeación').length;
    const approvedCount = cartas.filter(
      (c) => c.status === 'Aprobado' || c.status === 'Realizado'
    ).length;
    const newMessagesCount = messages.filter((m) => m.status === 'Nuevo').length;

    return [
      {
        label: 'Eventos Próximos',
        value: upcomingCount,
        sub: `${unifiedEvents.length} en total`,
        icon: CalendarClock,
        color: 'bg-pastoral/10 text-pastoral',
      },
      {
        label: 'Cartas en Planeación',
        value: inPlanningCount,
        sub: `${cartas.length} cartas registradas`,
        icon: FileText,
        color: 'bg-amber-100 text-amber-800',
      },
      {
        label: 'Cartas Aprobadas',
        value: approvedCount,
        sub: 'Listas o realizadas',
        icon: ClipboardCheck,
        color: 'bg-emerald-100 text-emerald-700',
      },
      {
        label: 'Mensajes Nuevos (Buzón)',
        value: newMessagesCount,
        sub: 'Acompañamiento privado',
        icon: Inbox,
        color: 'bg-pastoral-cyan/15 text-sky-700',
        onClick: onGoToInbox,
      },
    ];
  }, [cartas, unifiedEvents, messages, onGoToEvaluation, onGoToInbox]);

  const filteredEvents = useMemo(() => {
    return unifiedEvents.filter((e) => {
      if (plantelFilter !== 'Todos' && e.plantel !== plantelFilter) return false;
      if (onlyCurrentMonth) {
        const startsInMonth = (e.date || '').startsWith(currentMonthKey);
        const endsInMonth = (e.endDate || '').startsWith(currentMonthKey);
        if (!startsInMonth && !endsInMonth) return false;
      }
      return true;
    });
  }, [unifiedEvents, plantelFilter, onlyCurrentMonth, currentMonthKey]);

  return (
    <div className="space-y-6">
      {/* Encabezado y acciones rápidas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Dashboard de Pastoral · Eventos en Puerta
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Panorama operativo de planeaciones, actividades y seguimiento por plantel.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onNewCarta}
            className="inline-flex items-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Planear actividad (Carta Descriptiva)</span>
          </button>
          <button
            type="button"
            onClick={onQuickEventClick}
            className="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-slate-50 text-pastoral-deep border border-slate-200 font-bold text-xs sm:text-sm px-4 py-2.5 shadow-sm transition-all"
          >
            <CalendarPlus className="h-4 w-4 text-pastoral-cyan" />
            <span>Añadir evento rápido al calendario</span>
          </button>
        </div>
      </div>

      {/* Banner Aguinaldo 2027 */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A235A] via-[#2B3890] to-[#3F4DAE] text-white p-5 sm:p-6 shadow-soft">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-pastoral-gold/20 blur-3xl"
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-pastoral-gold/20 border border-pastoral-gold/40 px-3 py-0.5 text-[11px] font-extrabold text-pastoral-gold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Aguinaldo {AGUINALDO_ACTUAL.year}
              </span>
              <span className="text-[11px] font-semibold text-blue-200">
                {AGUINALDO_ACTUAL.subtitle}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              {AGUINALDO_ACTUAL.title}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-pastoral-gold">
              {AGUINALDO_ACTUAL.motto}
            </p>
            <p className="text-xs text-blue-100/95 italic leading-relaxed">
              “{AGUINALDO_ACTUAL.quote}”
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAguinaldoOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-pastoral-deep hover:bg-amber-50 font-extrabold text-xs sm:text-sm px-4 py-2.5 shadow-sm transition-all shrink-0 self-start lg:self-center"
          >
            <BookOpen className="h-4 w-4 text-pastoral" />
            <span>Ver claves del Aguinaldo {AGUINALDO_ACTUAL.year}</span>
          </button>
        </div>
      </section>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const Wrapper = kpi.onClick ? 'button' : 'div';
          return (
            <Wrapper
              key={kpi.label}
              type={kpi.onClick ? 'button' : undefined}
              onClick={kpi.onClick}
              className={`text-left rounded-3xl bg-white border border-slate-200 p-5 shadow-card transition-all ${
                kpi.onClick ? 'hover:border-pastoral/40 hover:shadow-soft cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`h-10 w-10 rounded-2xl flex items-center justify-center ${kpi.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-3xl font-black text-slate-900">{kpi.value}</span>
              </div>
              <div className="mt-3">
                <div className="text-xs sm:text-sm font-extrabold text-slate-800">{kpi.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{kpi.sub}</div>
              </div>
            </Wrapper>
          );
        })}
      </div>

      {/* Lista de eventos próximos filtrable por plantel */}
      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 capitalize">
                {onlyCurrentMonth
                  ? `Agenda de ${currentMonthLabel}`
                  : 'Agenda y Cartas Descriptivas (Todo el ciclo)'}
              </h2>
              <span className="rounded-full bg-pastoral/10 text-pastoral px-2.5 py-0.5 text-xs font-extrabold">
                {filteredEvents.length}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {onlyCurrentMonth
                ? 'Mostrando únicamente los eventos del mes en curso.'
                : 'Mostrando todos los eventos registrados del ciclo.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOnlyCurrentMonth((prev) => !prev)}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                onlyCurrentMonth
                  ? 'bg-pastoral-gold/20 text-amber-950 border-pastoral-gold/60'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {onlyCurrentMonth ? 'Ver todo el ciclo' : 'Solo mes actual'}
            </button>
            {['Todos', ...PLANTELES].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlantelFilter(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  plantelFilter === p
                    ? 'bg-pastoral text-white border-pastoral'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-pastoral/30'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredEvents.map((ev) => {
            const linkedCarta =
              ev.source === 'carta' ? cartas.find((c) => c.id === ev.cartaId) : null;
            return (
              <div
                key={`${ev.source}-${ev.id}`}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white p-4 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-pastoral">{ev.date}</span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                        PLANTEL_BADGE_STYLES[ev.plantel] || PLANTEL_BADGE_STYLES.General
                      }`}
                    >
                      {ev.plantel}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                        STATUS_STYLES[ev.status] || STATUS_STYLES.Aprobado
                      }`}
                    >
                      {ev.status}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        ev.visibility === 'publico'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-200/70 text-slate-600'
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
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{ev.title}</h3>
                  <p className="text-xs text-slate-500">
                    {ev.location || 'Lugar por confirmar'} ·{' '}
                    {ev.source === 'carta' ? 'Con Carta Descriptiva' : 'Evento rápido'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {linkedCarta && (
                    <>
                      <button
                        type="button"
                        onClick={() => onEditCarta(linkedCarta)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 hover:border-pastoral/40 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-pastoral transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Editar Carta
                      </button>
                      <button
                        type="button"
                        onClick={() => onPrintCarta(linkedCarta)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3 py-1.5 text-xs font-bold transition-colors"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Imprimir
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500">
              No hay eventos registrados para este plantel.
            </div>
          )}
        </div>
      </section>

      {/* Modal Claves del Aguinaldo 2027 */}
      <Modal
        open={aguinaldoOpen}
        onClose={() => setAguinaldoOpen(false)}
        title={`Aguinaldo ${AGUINALDO_ACTUAL.year} · ${AGUINALDO_ACTUAL.title}`}
        subtitle={`${AGUINALDO_ACTUAL.motto} — ${AGUINALDO_ACTUAL.subtitle}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-5">
          <div className="rounded-2xl bg-pastoral/5 border border-pastoral/15 p-4 text-sm text-slate-700 italic leading-relaxed">
            “{AGUINALDO_ACTUAL.quote}”
            <div className="not-italic text-xs font-bold text-pastoral mt-1.5">
              — {AGUINALDO_ACTUAL.reference}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-1.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-pastoral">
              {AGUINALDO_ACTUAL.part1.title}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {AGUINALDO_ACTUAL.part1.summary}
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Parte II · El Sistema Preventivo y sus tres pilares
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {AGUINALDO_ACTUAL.pillars.map((pillar) => (
                <div
                  key={pillar.name}
                  className="rounded-2xl bg-white border border-slate-200 p-4 shadow-card space-y-1.5"
                >
                  <div className="text-sm font-black text-pastoral-deep">{pillar.name}</div>
                  <div className="text-xs font-bold text-pastoral-cyan">{pillar.subtitle}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs sm:text-sm text-amber-950 leading-relaxed">
            <strong>Conclusión:</strong> {AGUINALDO_ACTUAL.conclusion}
          </div>
        </div>
      </Modal>
    </div>
  );
}
