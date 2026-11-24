import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Sliders,
  Star,
  Download,
  RefreshCw,
  Plus,
  Trash2,
  Save,
  MessageSquare,
  Users,
  Calendar,
} from 'lucide-react';
import { evaluationService } from '../../services/evaluationService';
import { PLANTELES, PLANTEL_BADGE_STYLES } from '../../constants/config';

export function EvaluationCenterView({
  templates = [],
  canEditTemplates = false,
  restrictedPlantel = null,
  onSaveTemplates,
  onToast,
}) {
  const [subTab, setSubTab] = useState('resultados'); // 'resultados' | 'plantillas'
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plantelFilter, setPlantelFilter] = useState(restrictedPlantel || 'Todos');
  const [eventFilter, setEventFilter] = useState('Todos');
  const [audienceFilter, setAudienceFilter] = useState('Todos');

  // Estado del Editor de Plantillas
  const [draftTemplates, setDraftTemplates] = useState(templates);
  const [selectedTplId, setSelectedTplId] = useState(templates[0]?.id || '');

  useEffect(() => {
    setDraftTemplates(templates);
    if (!selectedTplId && templates[0]) setSelectedTplId(templates[0].id);
  }, [templates, selectedTplId]);

  const loadResponses = async () => {
    setLoading(true);
    try {
      const list = await evaluationService.listAllResponses();
      setResponses(list);
    } catch (err) {
      console.warn('No se pudieron cargar las evaluaciones:', err);
      if (onToast) {
        onToast(
          'No se pudieron leer las evaluaciones. Revisa las reglas de Firestore para la colección "evaluations".',
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Respuestas visibles (si es Auxiliar, solo su plantel)
  const scopedResponses = useMemo(() => {
    if (!restrictedPlantel) return responses;
    return responses.filter((r) => r.plantel === restrictedPlantel);
  }, [responses, restrictedPlantel]);

  const distinctEvents = useMemo(() => {
    const map = new Map();
    scopedResponses.forEach((r) => {
      if (r.eventId && !map.has(r.eventId)) {
        map.set(r.eventId, { id: r.eventId, title: r.eventTitle || r.eventId });
      }
    });
    return Array.from(map.values());
  }, [scopedResponses]);

  const distinctAudiences = useMemo(() => {
    const set = new Set();
    scopedResponses.forEach((r) => {
      if (r.audienceLabel) set.add(r.audienceLabel);
    });
    return Array.from(set);
  }, [scopedResponses]);

  const filteredResponses = useMemo(() => {
    return scopedResponses.filter((r) => {
      if (plantelFilter !== 'Todos' && r.plantel !== plantelFilter) return false;
      if (eventFilter !== 'Todos' && r.eventId !== eventFilter) return false;
      if (audienceFilter !== 'Todos' && r.audienceLabel !== audienceFilter) return false;
      return true;
    });
  }, [scopedResponses, plantelFilter, eventFilter, audienceFilter]);

  // Métricas resumidas por Evento (con desglose por Destinatario)
  const eventBreakdown = useMemo(() => {
    const map = new Map();
    filteredResponses.forEach((r) => {
      const key = r.eventId || 'sin-evento';
      if (!map.has(key)) {
        map.set(key, {
          eventId: key,
          title: r.eventTitle || 'Evento',
          date: r.eventDate || '',
          plantel: r.plantel || 'General',
          count: 0,
          ratings: [],
          byAudience: new Map(),
        });
      }
      const entry = map.get(key);
      entry.count += 1;
      if (Number(r.averageRating) > 0) entry.ratings.push(Number(r.averageRating));

      const aud = r.audienceLabel || r.templateName || 'General';
      if (!entry.byAudience.has(aud)) {
        entry.byAudience.set(aud, { label: aud, count: 0, ratings: [] });
      }
      const audEntry = entry.byAudience.get(aud);
      audEntry.count += 1;
      if (Number(r.averageRating) > 0) audEntry.ratings.push(Number(r.averageRating));
    });

    return Array.from(map.values()).map((e) => ({
      ...e,
      avg: e.ratings.length
        ? (e.ratings.reduce((s, n) => s + n, 0) / e.ratings.length).toFixed(1)
        : '—',
      audiences: Array.from(e.byAudience.values()).map((a) => ({
        ...a,
        avg: a.ratings.length
          ? (a.ratings.reduce((s, n) => s + n, 0) / a.ratings.length).toFixed(1)
          : '—',
      })),
    }));
  }, [filteredResponses]);

  const globalAvg = useMemo(() => {
    const valid = filteredResponses.map((r) => Number(r.averageRating)).filter((n) => n > 0);
    if (!valid.length) return '—';
    return (valid.reduce((s, n) => s + n, 0) / valid.length).toFixed(1);
  }, [filteredResponses]);

  const openComments = useMemo(() => {
    const items = [];
    filteredResponses.forEach((r) => {
      (r.answers || []).forEach((a) => {
        if (a.type === 'text' && String(a.value || '').trim()) {
          items.push({
            id: `${r.id}-${a.questionId}`,
            eventTitle: r.eventTitle,
            plantel: r.plantel,
            audience: r.audienceLabel,
            question: a.questionText,
            comment: a.value,
            date: r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('es-MX') : '',
          });
        }
      });
    });
    return items;
  }, [filteredResponses]);

  const exportCsv = () => {
    const headers = [
      'Fecha envío',
      'Evento',
      'Fecha evento',
      'Plantel',
      'Destinatario',
      'Promedio (1-5)',
      'Respuestas',
    ];
    const rows = filteredResponses.map((r) => {
      const summary = (r.answers || [])
        .map((a) => `${a.questionText}: ${a.value}`)
        .join(' | ');
      return [
        r.submittedAt || '',
        r.eventTitle || '',
        r.eventDate || '',
        r.plantel || '',
        r.audienceLabel || '',
        r.averageRating ?? '',
        summary,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',');
    });
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluaciones-pastoral-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onToast) onToast('Archivo CSV descargado para Excel');
  };

  // --- Handlers del Editor de Plantillas ---
  const activeTplIndex = Math.max(
    0,
    draftTemplates.findIndex((t) => t.id === selectedTplId)
  );
  const activeTpl = draftTemplates[activeTplIndex];

  const updateActiveTpl = (updater) => {
    setDraftTemplates((prev) =>
      prev.map((t, i) => (i === activeTplIndex ? updater(t) : t))
    );
  };

  const addNewTemplate = () => {
    const newTpl = {
      id: `tpl-custom-${Date.now()}`,
      name: 'Nueva Plantilla de Evaluación',
      audienceLabel: 'Participante',
      pepsalTag: 'Pastoral',
      esaTag: 'ESA',
      questions: [
        {
          id: `q-${Date.now()}-1`,
          text: '¿Cómo calificas en general esta experiencia?',
          type: 'rating',
          required: true,
        },
        {
          id: `q-${Date.now()}-2`,
          text: 'Comentarios o sugerencias de mejora',
          type: 'text',
          required: false,
        },
      ],
    };
    setDraftTemplates((prev) => [...prev, newTpl]);
    setSelectedTplId(newTpl.id);
  };

  const deleteActiveTemplate = () => {
    if (draftTemplates.length <= 1) return;
    const next = draftTemplates.filter((_, i) => i !== activeTplIndex);
    setDraftTemplates(next);
    setSelectedTplId(next[0]?.id || '');
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pastoral/10 text-pastoral px-3 py-1 text-xs font-extrabold">
            <BarChart3 className="h-3.5 w-3.5" />
            Evaluaciones Nativas · Multi-Destinatario
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Centro de Evaluaciones Pastorales
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Consulta los resultados recibidos por QR/enlace y personaliza tus plantillas de
            preguntas.
          </p>
        </div>

        <div className="inline-flex bg-white border border-slate-200 rounded-2xl p-1 shadow-card self-start">
          <button
            type="button"
            onClick={() => setSubTab('resultados')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              subTab === 'resultados'
                ? 'bg-pastoral text-white shadow-sm'
                : 'text-slate-600 hover:text-pastoral'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Resultados ({scopedResponses.length})</span>
          </button>
          {canEditTemplates && (
            <button
              type="button"
              onClick={() => setSubTab('plantillas')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                subTab === 'plantillas'
                  ? 'bg-pastoral text-white shadow-sm'
                  : 'text-slate-600 hover:text-pastoral'
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span>Plantillas ({draftTemplates.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* SUBPESTAÑA 1: RESULTADOS */}
      {subTab === 'resultados' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card">
              <div className="text-xs font-bold text-slate-400 uppercase">Respuestas recibidas</div>
              <div className="text-3xl font-black text-pastoral mt-1">
                {filteredResponses.length}
              </div>
            </div>
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card">
              <div className="text-xs font-bold text-slate-400 uppercase">Promedio global</div>
              <div className="text-3xl font-black text-amber-600 mt-1 flex items-center gap-1.5">
                <Star className="h-6 w-6 fill-pastoral-gold text-pastoral-gold" />
                <span>{globalAvg} / 5</span>
              </div>
            </div>
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card">
              <div className="text-xs font-bold text-slate-400 uppercase">Eventos evaluados</div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {eventBreakdown.length}
              </div>
            </div>
          </div>

          {/* Filtros y acciones */}
          <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-card flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {!restrictedPlantel && (
                <select
                  value={plantelFilter}
                  onChange={(e) => setPlantelFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
                >
                  <option value="Todos">Plantel: Todos</option>
                  {PLANTELES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 max-w-xs"
              >
                <option value="Todos">Evento: Todos</option>
                {distinctEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>

              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value="Todos">Destinatario: Todos</option>
                {distinctAudiences.map((aud) => (
                  <option key={aud} value={aud}>
                    {aud}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadResponses}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 text-xs font-bold"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
              <button
                type="button"
                onClick={exportCsv}
                disabled={filteredResponses.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral hover:bg-pastoral-deep disabled:opacity-40 text-white px-3.5 py-2 text-xs font-extrabold shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          {/* Desglose por Evento y por Destinatario */}
          {eventBreakdown.length === 0 ? (
            <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center space-y-2">
              <BarChart3 className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="font-extrabold text-slate-800">Aún no hay respuestas registradas</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Ve a <strong>Calendarios</strong> o <strong>Carta Descriptiva</strong>, pulsa el
                botón <strong>Evaluación</strong> de cualquier evento, elige las plantillas y
                comparte el enlace o código QR con los participantes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {eventBreakdown.map((ev) => (
                <article
                  key={ev.eventId}
                  className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                            PLANTEL_BADGE_STYLES[ev.plantel] || PLANTEL_BADGE_STYLES.General
                          }`}
                        >
                          {ev.plantel}
                        </span>
                        {ev.date && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                            <Calendar className="h-3.5 w-3.5" /> {ev.date}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-1">{ev.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-xl bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-extrabold">
                        {ev.count} resp.
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100 text-amber-900 px-3 py-1.5 text-sm font-black">
                        <Star className="h-4 w-4 fill-pastoral-gold text-pastoral-gold" />
                        {ev.avg}/5
                      </span>
                    </div>
                  </div>

                  {/* Desglose por destinatario */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {ev.audiences.map((aud) => (
                      <div
                        key={aud.label}
                        className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-slate-800 truncate flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-pastoral shrink-0" />
                            <span>{aud.label}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {aud.count} respuesta(s)
                          </div>
                        </div>
                        <span className="text-sm font-black text-pastoral shrink-0">
                          {aud.avg}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Comentarios abiertos */}
          {openComments.length > 0 && (
            <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-pastoral" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Comentarios y Sugerencias ({openComments.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {openComments.slice(0, 20).map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-400">
                      <span className="text-pastoral truncate">
                        {c.eventTitle} · {c.audience}
                      </span>
                      <span>{c.date}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500">{c.question}</div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                      “{c.comment}”
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* SUBPESTAÑA 2: EDITOR DE PLANTILLAS (SDB / Coordinador) */}
      {subTab === 'plantillas' && canEditTemplates && activeTpl && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Lista de plantillas */}
          <div className="lg:col-span-4 space-y-3">
            <button
              type="button"
              onClick={addNewTemplate}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white border border-pastoral/20 font-extrabold text-xs py-3 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Nueva Plantilla</span>
            </button>

            <div className="space-y-2">
              {draftTemplates.map((tpl) => {
                const isSelected = tpl.id === activeTpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTplId(tpl.id)}
                    className={`w-full text-left rounded-2xl border p-3.5 transition-all ${
                      isSelected
                        ? 'bg-pastoral-deep text-white border-pastoral-deep shadow-md'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-pastoral/40'
                    }`}
                  >
                    <div className="text-xs font-extrabold leading-snug">{tpl.name}</div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        isSelected ? 'text-blue-200' : 'text-slate-500'
                      }`}
                    >
                      {tpl.audienceLabel} · {tpl.questions?.length || 0} preguntas
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor de la plantilla seleccionada */}
          <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Editar Plantilla</h2>
              <div className="flex items-center gap-2">
                {draftTemplates.length > 1 && (
                  <button
                    type="button"
                    onClick={deleteActiveTemplate}
                    className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSaveTemplates(draftTemplates)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral hover:bg-pastoral-deep text-white px-4 py-2 text-xs font-extrabold shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar Plantillas</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                  Nombre de la plantilla
                </label>
                <input
                  type="text"
                  value={activeTpl.name}
                  onChange={(e) => updateActiveTpl((t) => ({ ...t, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                  Destinatario (lo que elige el participante)
                </label>
                <input
                  type="text"
                  value={activeTpl.audienceLabel || ''}
                  onChange={(e) =>
                    updateActiveTpl((t) => ({ ...t, audienceLabel: e.target.value }))
                  }
                  placeholder="Ej. Alumno / Padre de Familia / Docente"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Preguntas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Preguntas ({activeTpl.questions?.length || 0})
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    updateActiveTpl((t) => ({
                      ...t,
                      questions: [
                        ...(t.questions || []),
                        {
                          id: `q-${Date.now()}`,
                          text: 'Nueva pregunta...',
                          type: 'rating',
                          required: true,
                        },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3 py-1.5 text-xs font-bold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar pregunta
                </button>
              </div>

              <div className="space-y-2.5">
                {(activeTpl.questions || []).map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-2xl bg-slate-50 border border-slate-200 p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-400 w-5">{idx + 1}.</span>
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) =>
                          updateActiveTpl((t) => ({
                            ...t,
                            questions: t.questions.map((item, i) =>
                              i === idx ? { ...item, text: e.target.value } : item
                            ),
                          }))
                        }
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveTpl((t) => ({
                            ...t,
                            questions: t.questions.filter((_, i) => i !== idx),
                          }))
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pl-7">
                      <select
                        value={q.type}
                        onChange={(e) =>
                          updateActiveTpl((t) => ({
                            ...t,
                            questions: t.questions.map((item, i) =>
                              i === idx ? { ...item, type: e.target.value } : item
                            ),
                          }))
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700"
                      >
                        <option value="rating">Estrellas (1 a 5)</option>
                        <option value="yesno">Sí / No</option>
                        <option value="text">Texto abierto</option>
                      </select>

                      <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(q.required)}
                          onChange={(e) =>
                            updateActiveTpl((t) => ({
                              ...t,
                              questions: t.questions.map((item, i) =>
                                i === idx ? { ...item, required: e.target.checked } : item
                              ),
                            }))
                          }
                          className="rounded border-slate-300 text-pastoral focus:ring-pastoral"
                        />
                        <span>Obligatoria</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
