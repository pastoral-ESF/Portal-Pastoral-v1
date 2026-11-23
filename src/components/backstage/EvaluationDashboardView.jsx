import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  ClipboardCheck,
  Star,
  Layers,
  Users,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { ESA_DIMENSIONS, getDimensionById } from '../../constants/esaCatalog';
import { PLANTELES, PLANTEL_BADGE_STYLES, STATUS_STYLES } from '../../constants/config';
import { Modal } from '../common/Modal';

export function EvaluationDashboardView({ cartas, onSaveEvaluation }) {
  const [evaluatingCarta, setEvaluatingCarta] = useState(null);
  const [evalForm, setEvalForm] = useState({
    projectedAttendance: 60,
    actualAttendance: 60,
    objectiveScore: 4,
    strengths: '',
    improvements: '',
    esaDimensionId: 'D3',
    esaSubdimensionId: '3.2',
  });

  const openEvaluation = (carta) => {
    setEvaluatingCarta(carta);
    const existing = carta.evaluation;
    setEvalForm({
      projectedAttendance: existing?.projectedAttendance ?? 60,
      actualAttendance: existing?.actualAttendance ?? 60,
      objectiveScore: existing?.objectiveScore ?? 4,
      strengths: existing?.strengths ?? '',
      improvements: existing?.improvements ?? '',
      esaDimensionId: existing?.esaDimensionId || carta.esaDimensionId || 'D3',
      esaSubdimensionId: existing?.esaSubdimensionId || carta.esaSubdimensionId || '3.2',
    });
  };

  const handleDimensionChange = (dimId) => {
    const dim = getDimensionById(dimId);
    setEvalForm((prev) => ({
      ...prev,
      esaDimensionId: dimId,
      esaSubdimensionId: dim?.subdimensions[0]?.id || '',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!evaluatingCarta) return;
    onSaveEvaluation(evaluatingCarta.id, {
      ...evalForm,
      projectedAttendance: Number(evalForm.projectedAttendance) || 0,
      actualAttendance: Number(evalForm.actualAttendance) || 0,
      objectiveScore: Number(evalForm.objectiveScore) || 1,
    });
    setEvaluatingCarta(null);
  };

  // Estadísticas para el Dashboard de Indicadores
  const stats = useMemo(() => {
    const byPlantel = PLANTELES.map((p) => ({
      label: p,
      count: cartas.filter((c) => c.plantel === p).length,
    }));

    const byDimension = ESA_DIMENSIONS.map((d) => ({
      id: d.id,
      label: d.shortName,
      fullName: d.name,
      color: d.color,
      count: cartas.filter((c) => c.esaDimensionId === d.id).length,
    }));

    const evaluated = cartas.filter((c) => Boolean(c.evaluation));
    const totalProjected = evaluated.reduce(
      (acc, c) => acc + (Number(c.evaluation.projectedAttendance) || 0),
      0
    );
    const totalActual = evaluated.reduce(
      (acc, c) => acc + (Number(c.evaluation.actualAttendance) || 0),
      0
    );
    const avgProjected = evaluated.length ? Math.round(totalProjected / evaluated.length) : 0;
    const avgActual = evaluated.length ? Math.round(totalActual / evaluated.length) : 0;
    const attendanceRatio =
      totalProjected > 0 ? Math.round((totalActual / totalProjected) * 100) : 0;

    const avgScore = evaluated.length
      ? (
          evaluated.reduce((acc, c) => acc + (Number(c.evaluation.objectiveScore) || 0), 0) /
          evaluated.length
        ).toFixed(1)
      : '—';

    return {
      byPlantel,
      byDimension,
      evaluatedCount: evaluated.length,
      avgProjected,
      avgActual,
      attendanceRatio,
      avgScore,
    };
  }, [cartas]);

  const maxPlantelCount = Math.max(1, ...stats.byPlantel.map((b) => b.count));
  const maxDimCount = Math.max(1, ...stats.byDimension.map((b) => b.count));
  const currentDim = getDimensionById(evalForm.esaDimensionId) || ESA_DIMENSIONS[0];

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pastoral/10 text-pastoral px-3 py-1 text-xs font-extrabold">
          <BarChart3 className="h-3.5 w-3.5" />
          Base Configurable · Modelo ESA (4 Dimensiones / 16 Subdimensiones)
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          Evaluación Pastoral y Dashboard de Indicadores
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Registra resultados post-actividad y visualiza el avance institucional por plantel y
          dimensión ESA.
        </p>
      </div>

      {/* Gráficas del Dashboard de Indicadores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Actividades por Plantel */}
        <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">Actividades por Plantel</h2>
            <span className="text-xs font-bold text-slate-400">{cartas.length} cartas</span>
          </div>
          <div className="space-y-3">
            {stats.byPlantel.map((item) => {
              const pct = Math.round((item.count / maxPlantelCount) * 100);
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="text-pastoral">{item.count}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-pastoral to-pastoral-cyan transition-all duration-500"
                      style={{ width: `${item.count > 0 ? Math.max(10, pct) : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actividades por Dimensión ESA */}
        <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">Actividades por Dimensión ESA</h2>
            <Layers className="h-4 w-4 text-pastoral-cyan" />
          </div>
          <div className="space-y-3">
            {stats.byDimension.map((dim) => {
              const pct = Math.round((dim.count / maxDimCount) * 100);
              return (
                <div key={dim.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold gap-2">
                    <span className="text-slate-700 truncate" title={dim.fullName}>
                      {dim.id} · {dim.label}
                    </span>
                    <span className="text-slate-900">{dim.count}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${dim.count > 0 ? Math.max(10, pct) : 0}%`,
                        backgroundColor: dim.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Promedio Asistencia Real vs Proyectada */}
        <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">
              Asistencia Real vs. Proyectada
            </h2>
            <Users className="h-4 w-4 text-pastoral-gold" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-3.5 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Proyectada prom.</div>
              <div className="text-2xl font-black text-slate-800 mt-1">{stats.avgProjected}</div>
            </div>
            <div className="rounded-2xl bg-pastoral/5 border border-pastoral/20 p-3.5 text-center">
              <div className="text-[11px] font-bold text-pastoral uppercase">Real prom.</div>
              <div className="text-2xl font-black text-pastoral mt-1">{stats.avgActual}</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600">Cumplimiento de convocatoria</span>
              <span className="text-emerald-700">{stats.attendanceRatio}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-pastoral-lime transition-all"
                style={{ width: `${Math.min(100, stats.attendanceRatio)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Evaluadas: {stats.evaluatedCount}</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                <Star className="h-3.5 w-3.5 fill-current" /> Promedio objetivo: {stats.avgScore}/5
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de actividades para evaluar */}
      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900">
          Actividades y Seguimiento de Evaluación
        </h2>
        <div className="space-y-3">
          {cartas.map((c) => {
            const dim = getDimensionById(c.esaDimensionId);
            const hasEval = Boolean(c.evaluation);
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                        PLANTEL_BADGE_STYLES[c.plantel] || PLANTEL_BADGE_STYLES.General
                      }`}
                    >
                      {c.plantel}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                        STATUS_STYLES[c.status] || STATUS_STYLES['En planeación']
                      }`}
                    >
                      {c.status}
                    </span>
                    {hasEval ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[11px] font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        Evaluada ({c.evaluation.objectiveScore}/5 · {c.evaluation.actualAttendance}/
                        {c.evaluation.projectedAttendance} asistentes)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2.5 py-0.5 text-[11px] font-bold">
                        <Clock className="h-3 w-3" /> Sin evaluar aún
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">{c.name}</h3>
                  <div className="text-xs text-slate-500">
                    Fecha: {c.date} · ESA: {dim ? dim.name : 'Sin dimensión'} (
                    {c.esaSubdimensionId || '-'})
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openEvaluation(c)}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all shrink-0 ${
                    hasEval
                      ? 'bg-white border border-slate-200 text-pastoral hover:border-pastoral'
                      : 'bg-pastoral hover:bg-pastoral-deep text-white shadow-sm'
                  }`}
                >
                  <ClipboardCheck className="h-4 w-4" />
                  <span>{hasEval ? 'Ver / Editar Evaluación' : 'Evaluar actividad'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal de Evaluación Base ESA */}
      <Modal
        open={Boolean(evaluatingCarta)}
        onClose={() => setEvaluatingCarta(null)}
        title="Evaluación Pastoral (Base ESA)"
        subtitle={evaluatingCarta ? `${evaluatingCarta.name} · ${evaluatingCarta.plantel}` : ''}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Asistencia Proyectada
              </label>
              <input
                type="number"
                min="0"
                required
                value={evalForm.projectedAttendance}
                onChange={(e) =>
                  setEvalForm({ ...evalForm, projectedAttendance: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Asistencia Real
              </label>
              <input
                type="number"
                min="0"
                required
                value={evalForm.actualAttendance}
                onChange={(e) => setEvalForm({ ...evalForm, actualAttendance: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Nivel de cumplimiento del objetivo (1 a 5) */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
              Nivel de cumplimiento del objetivo (1 a 5)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setEvalForm({ ...evalForm, objectiveScore: score })}
                  className={`flex-1 flex items-center justify-center gap-1 rounded-xl border py-2.5 text-sm font-black transition-all ${
                    Number(evalForm.objectiveScore) >= score
                      ? 'bg-pastoral-gold/20 border-pastoral-gold text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <Star
                    className={`h-4 w-4 ${
                      Number(evalForm.objectiveScore) >= score
                        ? 'fill-pastoral-gold text-pastoral-gold'
                        : ''
                    }`}
                  />
                  <span>{score}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Etiquetado ESA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Dimensión ESA
              </label>
              <select
                value={evalForm.esaDimensionId}
                onChange={(e) => handleDimensionChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs sm:text-sm bg-white"
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
                value={evalForm.esaSubdimensionId}
                onChange={(e) => setEvalForm({ ...evalForm, esaSubdimensionId: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs sm:text-sm bg-white"
              >
                {currentDim.subdimensions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Aciertos y fortalezas observadas
            </label>
            <textarea
              rows={2}
              value={evalForm.strengths}
              onChange={(e) => setEvalForm({ ...evalForm, strengths: e.target.value })}
              placeholder="¿Qué funcionó especialmente bien?"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Observaciones y áreas de mejora
            </label>
            <textarea
              rows={2}
              value={evalForm.improvements}
              onChange={(e) => setEvalForm({ ...evalForm, improvements: e.target.value })}
              placeholder="Aprendizajes clave para la próxima edición..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            />
          </div>

          {/* Bloque Base Configurable para KPIs futuros */}
          <div className="rounded-2xl border-2 border-dashed border-pastoral/30 bg-pastoral/[0.03] p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-extrabold text-pastoral uppercase tracking-wide">
              <Sparkles className="h-4 w-4 text-pastoral-gold" />
              <span>Métricas KPI específicas (Pendiente de carga)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Este bloque está preparado en la arquitectura del sistema para incorporar
              indicadores específicos por actividad una vez que la Dirección Salesiana defina la
              matriz final de KPIs institucionales.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEvaluatingCarta(null)}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-pastoral hover:bg-pastoral-deep text-white px-5 py-2.5 text-xs font-extrabold shadow-sm"
            >
              Guardar Evaluación
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
