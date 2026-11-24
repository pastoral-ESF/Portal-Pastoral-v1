import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Printer,
  Edit3,
  Eye,
  Lock,
  ArrowLeft,
  Clock,
  ClipboardList,
  BookMarked,
  ExternalLink,
  CheckCircle2,
  Wrench,
} from 'lucide-react';
import { PlantaFisicaModal } from './PlantaFisicaModal';
import {
  CARTA_PLANTEL_OPTIONS,
  ACTIVITY_STATUSES,
  DEFAULT_COMMISSIONS,
  PLANTEL_BADGE_STYLES,
  STATUS_STYLES,
} from '../../constants/config';
import { ESA_DIMENSIONS, getDimensionById } from '../../constants/esaCatalog';
import {
  PEPSAL_AREAS,
  PEPSAL_RETOS,
  getPepsalAreaById,
} from '../../constants/pepsalCatalog';

function createBlankCarta(defaultPepsalAreaId = 'PEPSAL-FE', defaultPlantel = 'Glandorff') {
  const defaultArea = getPepsalAreaById(defaultPepsalAreaId) || PEPSAL_AREAS[0];
  return {
    id: null,
    plantel: defaultPlantel || 'Glandorff',
    customPlantel: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '12:00',
    name: '',
    location: '',
    designer: '',
    objective: '',
    esaDimensionId: 'D3',
    esaSubdimensionId: '3.2',
    pepsalAreaId: defaultArea.id,
    pepsalIntervention: defaultArea.interventions[0] || '',
    pepsalRetoId: 'R01',
    pepsalObjective: '',
    visibility: 'publico',
    status: 'En planeación',
    schedule: [
      { id: `sch-${Date.now()}-1`, time: '09:00 - 09:30', what: '', where: '', responsible: '' },
    ],
    commissions: DEFAULT_COMMISSIONS.map((c) => ({ ...c, id: `${c.id}-${Date.now()}` })),
  };
}

function buildFormFromIntent(intent, restrictedPlantel) {
  if (!intent || intent === 'NEW') {
    return createBlankCarta('PEPSAL-FE', restrictedPlantel || 'Glandorff');
  }
  if (intent.presetPepsalAreaId) {
    return createBlankCarta(intent.presetPepsalAreaId, restrictedPlantel || 'Glandorff');
  }
  if (intent.presetFromEvent) {
    const ev = intent.presetFromEvent;
    const base = createBlankCarta(
      'PEPSAL-FE',
      restrictedPlantel || ev.plantel || 'Glandorff'
    );
    return {
      ...base,
      name: ev.title || '',
      date: ev.date || base.date,
      startTime: ev.startTime || '09:00',
      endTime: ev.endTime || '12:00',
      location: ev.location || '',
      objective: ev.description || '',
      visibility: ev.visibility || 'interno',
      category: ev.category || 'Pastoral',
      linkedQuickEventId: ev.id,
    };
  }
  const cloned = structuredClone(intent);
  return {
    ...createBlankCarta('PEPSAL-FE', restrictedPlantel || 'Glandorff'),
    ...cloned,
    schedule:
      Array.isArray(cloned.schedule) && cloned.schedule.length > 0
        ? cloned.schedule
        : [{ id: `sch-${Date.now()}-1`, time: '09:00 - 09:30', what: '', where: '', responsible: '' }],
    commissions:
      Array.isArray(cloned.commissions) && cloned.commissions.length > 0
        ? cloned.commissions
        : DEFAULT_COMMISSIONS.map((c) => ({ ...c, id: `${c.id}-${Date.now()}` })),
  };
}

export function CartaPlannerView({
  cartas,
  pepsalDoc,
  restrictedPlantel,
  initialEditingCarta,
  onClearInitialEdit,
  onSaveCarta,
  onApproveCarta,
  onSavePlantaFisica,
  onPrintPlantaFisica,
  onOpenEvaluation,
  eventEvaluationConfigs = {},
  onDeleteCarta,
  onPrintCarta,
  onOpenPepsalTab,
}) {
  const [mode, setMode] = useState(initialEditingCarta ? 'form' : 'list'); // 'list' | 'form'
  const [plantaFisicaCarta, setPlantaFisicaCarta] = useState(null);
  const [form, setForm] = useState(() =>
    buildFormFromIntent(initialEditingCarta, restrictedPlantel)
  );

  useEffect(() => {
    if (initialEditingCarta) {
      setForm(buildFormFromIntent(initialEditingCarta, restrictedPlantel));
      setMode('form');
      if (onClearInitialEdit) onClearInitialEdit();
    }
  }, [initialEditingCarta, onClearInitialEdit, restrictedPlantel]);

  const currentDimension = getDimensionById(form.esaDimensionId) || ESA_DIMENSIONS[0];
  const currentPepsalArea = getPepsalAreaById(form.pepsalAreaId) || PEPSAL_AREAS[0];

  const handleDimensionChange = (dimId) => {
    const dim = getDimensionById(dimId);
    setForm((prev) => ({
      ...prev,
      esaDimensionId: dimId,
      esaSubdimensionId: dim?.subdimensions[0]?.id || '',
    }));
  };

  const handlePepsalAreaChange = (areaId) => {
    const area = getPepsalAreaById(areaId);
    setForm((prev) => ({
      ...prev,
      pepsalAreaId: areaId,
      pepsalIntervention: area?.interventions[0] || '',
    }));
  };

  const addScheduleRow = () => {
    setForm((prev) => ({
      ...prev,
      schedule: [
        ...prev.schedule,
        { id: `sch-${Date.now()}`, time: '', what: '', where: '', responsible: '' },
      ],
    }));
  };

  const updateScheduleRow = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    }));
  };

  const removeScheduleRow = (idx) => {
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== idx),
    }));
  };

  const addCommissionRow = () => {
    setForm((prev) => ({
      ...prev,
      commissions: [
        ...prev.commissions,
        { id: `com-extra-${Date.now()}`, what: 'OTRO', who: '', how: '', material: '' },
      ],
    }));
  };

  const updateCommissionRow = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      commissions: prev.commissions.map((row, i) =>
        i === idx ? { ...row, [field]: value } : row
      ),
    }));
  };

  const removeCommissionRow = (idx) => {
    setForm((prev) => ({
      ...prev,
      commissions: prev.commissions.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSaveCarta(form);
    setMode('list');
  };

  if (mode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Planeador de Actividades (Cartas Descriptivas)
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Formato oficial del Colegio ESFER Salesianos con vinculación ESA e impresión lista
              para PDF.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setForm(createBlankCarta());
              setMode('form');
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-sm px-5 py-3 shadow-sm transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Carta Descriptiva</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cartas.map((c) => {
            const dim = getDimensionById(c.esaDimensionId);
            const pepsalArea = getPepsalAreaById(c.pepsalAreaId);
            return (
              <article
                key={c.id}
                className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                        PLANTEL_BADGE_STYLES[c.plantel] || PLANTEL_BADGE_STYLES.Otro
                      }`}
                    >
                      {c.plantel === 'Otro' && c.customPlantel ? c.customPlantel : c.plantel}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                        STATUS_STYLES[c.status] || STATUS_STYLES['En planeación']
                      }`}
                    >
                      {c.status}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        c.visibility === 'publico'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.visibility === 'publico' ? (
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

                  <h2 className="text-lg font-extrabold text-slate-900 leading-snug">{c.name}</h2>
                  <p className="text-xs text-slate-600 line-clamp-2">{c.objective}</p>

                  <div className="text-xs text-slate-500 space-y-1 pt-1">
                    <div>
                      <strong className="text-slate-700">Fecha:</strong> {c.date}{' '}
                      {c.startTime ? `(${c.startTime} - ${c.endTime || ''})` : ''}
                    </div>
                    <div>
                      <strong className="text-slate-700">Lugar:</strong> {c.location}
                    </div>
                    <div>
                      <strong className="text-slate-700">ESA:</strong>{' '}
                      {dim ? dim.shortName : 'Sin asignar'} ({c.esaSubdimensionId || '-'})
                    </div>
                    <div>
                      <strong className="text-slate-700">PEPSAL:</strong>{' '}
                      {pepsalArea ? pepsalArea.shortName : 'Sin asignar'}
                      {c.pepsalObjective ? ` · ${c.pepsalObjective}` : ''}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForm(structuredClone(c));
                        setMode('form');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 text-xs font-bold transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    {c.status === 'En planeación' && onApproveCarta && (
                      <button
                        type="button"
                        onClick={() => onApproveCarta(c.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-extrabold transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Aprobar Carta
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setPlantaFisicaCarta(c)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                        c.plantaFisica
                          ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 hover:text-pastoral'
                      }`}
                      title="Abrir formulario de Solicitud de eventos Planta Física"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      <span>{c.plantaFisica ? 'Planta Física ✓' : 'Planta Física'}</span>
                    </button>
                    {onOpenEvaluation && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenEvaluation({
                            id: c.id,
                            title: c.name,
                            date: c.date,
                            plantel: c.plantel === 'Otro' && c.customPlantel ? c.customPlantel : c.plantel,
                            esaDimensionId: c.esaDimensionId,
                            pepsalAreaId: c.pepsalAreaId,
                          })
                        }
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                          eventEvaluationConfigs[c.id]?.enabled
                            ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                            : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        }`}
                        title="Enlace y QR de evaluación para participantes"
                      >
                        <ClipboardList className="h-3.5 w-3.5 text-pastoral" />
                        <span>
                          {eventEvaluationConfigs[c.id]?.enabled ? 'Evaluación ✓' : 'Evaluación'}
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onPrintCarta(c)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral hover:bg-pastoral-deep text-white px-3 py-1.5 text-xs font-bold transition-colors"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Imprimir
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteCarta(c.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Eliminar carta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {c.approvedBy && (
                  <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Aprobada por {c.approvedBy}</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <PlantaFisicaModal
          open={Boolean(plantaFisicaCarta)}
          carta={plantaFisicaCarta}
          restrictedPlantel={restrictedPlantel}
          onClose={() => setPlantaFisicaCarta(null)}
          onSave={(cartaId, solicitud) => {
            if (onSavePlantaFisica) onSavePlantaFisica(cartaId, solicitud);
          }}
          onPrint={(solicitud) => {
            if (onPrintPlantaFisica) onPrintPlantaFisica(solicitud);
          }}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Barra superior del formulario */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMode('list')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-pastoral transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {form.id ? 'Editar Carta Descriptiva' : 'Nueva Carta Descriptiva'}
            </h1>
            <p className="text-xs text-slate-500">
              Formato oficial ESFER Salesianos · Chihuahua
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {form.id && form.status === 'En planeación' && onApproveCarta && (
            <button
              type="button"
              onClick={() => {
                onApproveCarta(form.id);
                setForm((prev) => ({ ...prev, status: 'Aprobado' }));
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 shadow-sm transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Aprobar Carta</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onPrintCarta(form)}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-white border border-slate-200 hover:border-pastoral/40 text-pastoral-deep font-bold text-xs sm:text-sm px-4 py-2.5 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Vista Previa / Imprimir</span>
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 shadow-sm transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Guardar Carta Descriptiva</span>
          </button>
        </div>
      </div>

      {/* 1. Datos Generales */}
      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="h-5 w-5 text-pastoral" />
          <h2 className="text-base font-extrabold text-slate-900">1. Datos Generales</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Nombre de la experiencia *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Retiro de Adviento para Padres de Familia"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30 focus:border-pastoral"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Plantel / Sede *
            </label>
            <select
              value={form.plantel}
              onChange={(e) =>
                setForm({
                  ...form,
                  plantel: e.target.value,
                  customPlantel: e.target.value === 'Otro' ? form.customPlantel || '' : '',
                })
              }
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30 focus:border-pastoral"
            >
              {(restrictedPlantel
                ? [restrictedPlantel, 'TSJB (Templo San Juan Bosco)', 'Otro']
                : CARTA_PLANTEL_OPTIONS
              ).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {form.plantel === 'Otro' && (
              <input
                type="text"
                required
                value={form.customPlantel || ''}
                onChange={(e) => setForm({ ...form, customPlantel: e.target.value })}
                placeholder="Especifica sede o lugar externo (ej. Casa de Retiros)"
                className="mt-2 w-full rounded-xl border border-pastoral/40 bg-pastoral/[0.03] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Fecha de la experiencia *
            </label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30 focus:border-pastoral"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Hora inicio
              </label>
              <input
                type="time"
                value={form.startTime || '09:00'}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Hora fin
              </label>
              <input
                type="time"
                value={form.endTime || '12:00'}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Estatus de la actividad
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30"
            >
              {ACTIVITY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Lugar *
            </label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Ej. Auditorio y Capilla Plantel Glandorff"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Diseña la experiencia *
            </label>
            <input
              type="text"
              required
              value={form.designer}
              onChange={(e) => setForm({ ...form, designer: e.target.value })}
              placeholder="Nombre del responsable o equipo pastoral"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Objetivo *
            </label>
            <textarea
              rows={2}
              required
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              placeholder="Describe el propósito formativo y pastoral de la experiencia..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30"
            />
          </div>
        </div>

        {/* Vinculación ESA + Visibilidad en Calendario */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Dimensión Modelo ESA
            </label>
            <select
              value={form.esaDimensionId}
              onChange={(e) => handleDimensionChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30"
            >
              {ESA_DIMENSIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Subdimensión ESA
            </label>
            <select
              value={form.esaSubdimensionId}
              onChange={(e) => setForm({ ...form, esaSubdimensionId: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30"
            >
              {currentDimension.subdimensions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Visibilidad en Calendario
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, visibility: 'publico' })}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-extrabold transition-all ${
                  form.visibility === 'publico'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Evento Público</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, visibility: 'interno' })}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-extrabold transition-all ${
                  form.visibility === 'interno'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Evento Interno</span>
              </button>
            </div>
          </div>
        </div>

        {/* Conexión con el PEPSAL */}
        <div className="rounded-2xl bg-pastoral/[0.03] border border-pastoral/15 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-pastoral" />
              <h3 className="text-xs font-extrabold text-pastoral-deep uppercase tracking-wide">
                Conexión con el PEPSAL
              </h3>
            </div>
            {pepsalDoc?.documentUrl ? (
              <a
                href={pepsalDoc.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-pastoral hover:text-pastoral-light"
              >
                <span>Consultar PDF PEPSAL</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              onOpenPepsalTab && (
                <button
                  type="button"
                  onClick={onOpenPepsalTab}
                  className="text-xs font-bold text-pastoral hover:text-pastoral-light"
                >
                  Configurar enlace del documento PEPSAL →
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Dimensión de la CEP (PEPSAL)
              </label>
              <select
                value={currentPepsalArea.id}
                onChange={(e) => handlePepsalAreaChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30"
              >
                {PEPSAL_AREAS.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Reto de la Visión Pastoral (01 - 08)
              </label>
              <select
                value={form.pepsalRetoId || 'R01'}
                onChange={(e) => setForm({ ...form, pepsalRetoId: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30"
              >
                {PEPSAL_RETOS.map((reto) => (
                  <option key={reto.id} value={reto.id}>
                    {reto.number}. {reto.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Intervención PEPSAL específica
              </label>
              <select
                value={form.pepsalIntervention || currentPepsalArea.interventions[0]}
                onChange={(e) => setForm({ ...form, pepsalIntervention: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30"
              >
                {currentPepsalArea.interventions.map((inter, idx) => (
                  <option key={idx} value={inter}>
                    {idx + 1}. {inter}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Nota o enfoque específico PEPSAL (opcional)
              </label>
              <input
                type="text"
                value={form.pepsalObjective || ''}
                onChange={(e) => setForm({ ...form, pepsalObjective: e.target.value })}
                placeholder="Ej. Acompañamiento a familias y preparación litúrgica..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. HORARIO DE LA ACTIVIDAD */}
      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-pastoral-cyan" />
            <h2 className="text-base font-extrabold text-slate-900">
              2. HORARIO DE LA ACTIVIDAD
            </h2>
          </div>
          <button
            type="button"
            onClick={addScheduleRow}
            className="inline-flex items-center gap-1 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3 py-1.5 text-xs font-bold transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Agregar fila</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-left text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200">
                <th className="py-2 pr-2 w-36">Hora</th>
                <th className="py-2 px-2">¿Qué sucede?</th>
                <th className="py-2 px-2 w-44">¿Dónde?</th>
                <th className="py-2 px-2 w-44">Responsable</th>
                <th className="py-2 pl-2 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {form.schedule.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={row.time}
                      onChange={(e) => updateScheduleRow(idx, 'time', e.target.value)}
                      placeholder="09:00 - 09:30"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.what}
                      onChange={(e) => updateScheduleRow(idx, 'what', e.target.value)}
                      placeholder="Descripción del momento"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.where}
                      onChange={(e) => updateScheduleRow(idx, 'where', e.target.value)}
                      placeholder="Espacio / Salón"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.responsible}
                      onChange={(e) => updateScheduleRow(idx, 'responsible', e.target.value)}
                      placeholder="Nombre"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 pl-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeScheduleRow(idx)}
                      disabled={form.schedule.length <= 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30"
                      aria-label="Eliminar fila"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. COMISIONES */}
      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-pastoral-gold" />
            <h2 className="text-base font-extrabold text-slate-900">3. COMISIONES</h2>
          </div>
          <button
            type="button"
            onClick={addCommissionRow}
            className="inline-flex items-center gap-1 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3 py-1.5 text-xs font-bold transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Añadir fila extra (OTRO)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200">
                <th className="py-2 pr-2 w-52">¿Qué?</th>
                <th className="py-2 px-2 w-44">Responsable (¿Quién?)</th>
                <th className="py-2 px-2">Proceso (¿Cómo?)</th>
                <th className="py-2 px-2 w-48">Material (¿Con qué?)</th>
                <th className="py-2 pl-2 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {form.commissions.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={row.what}
                      onChange={(e) => updateCommissionRow(idx, 'what', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.who}
                      onChange={(e) => updateCommissionRow(idx, 'who', e.target.value)}
                      placeholder="Responsable(s)"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.how}
                      onChange={(e) => updateCommissionRow(idx, 'how', e.target.value)}
                      placeholder="Acciones clave"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.material}
                      onChange={(e) => updateCommissionRow(idx, 'material', e.target.value)}
                      placeholder="Insumos / equipo"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 pl-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeCommissionRow(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      aria-label="Eliminar comisión"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </form>
  );
}
