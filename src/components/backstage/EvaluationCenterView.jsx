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
  Printer,
  CheckCircle2,
  Lock,
  AlertTriangle,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { evaluationService } from '../../services/evaluationService';
import { authService } from '../../services/authService';
import { Modal } from '../common/Modal';
import { PLANTELES, PLANTEL_BADGE_STYLES } from '../../constants/config';

function computeQuestionStats(responsesList = [], templates = []) {
  // Mapa auxiliar para recuperar el criterio ESA/PEPSAL en respuestas previas a la v3
  const criteriaByText = new Map();
  templates.forEach((tpl) => {
    (tpl.questions || []).forEach((q) => {
      if (q.text && q.criteria) {
        criteriaByText.set(String(q.text).trim(), q.criteria);
      }
    });
  });

  const map = new Map();

  responsesList.forEach((r) => {
    (r.answers || []).forEach((a) => {
      if (a.type !== 'rating' && a.type !== 'yesno') return;
      const text = String(a.questionText || '').trim();
      if (!text) return;
      const key = `${a.type}::${text}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          text,
          criteria: a.criteria || criteriaByText.get(text) || '',
          type: a.type,
          total: 0,
          sum: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          yesCount: 0,
          noCount: 0,
        });
      }
      const entry = map.get(key);
      if (!entry.criteria && a.criteria) {
        entry.criteria = a.criteria;
      }
      if (a.type === 'rating') {
        const val = Math.round(Number(a.value));
        if (val >= 1 && val <= 5) {
          entry.total += 1;
          entry.sum += val;
          entry.distribution[val] = (entry.distribution[val] || 0) + 1;
        }
      } else if (a.type === 'yesno') {
        const normalized = String(a.value || '').trim().toLowerCase();
        if (normalized === 'sí' || normalized === 'si') {
          entry.total += 1;
          entry.yesCount += 1;
        } else if (normalized === 'no') {
          entry.total += 1;
          entry.noCount += 1;
        }
      }
    });
  });

  return Array.from(map.values())
    .filter((q) => q.total > 0)
    .map((q) => {
      if (q.type === 'rating') {
        return {
          ...q,
          avg: (q.sum / q.total).toFixed(1),
        };
      }
      const yesPct = Math.round((q.yesCount / q.total) * 100);
      return {
        ...q,
        yesPct,
        noPct: 100 - yesPct,
      };
    });
}

export function EvaluationCenterView({
  templates = [],
  customEvaluations = [],
  eventEvaluationConfigs = {},
  canEditTemplates = false,
  restrictedPlantel = null,
  onSaveTemplates,
  onCreateCustomEvaluation,
  onDeleteCustomEvaluation,
  onOpenEvaluation,
  onPrintReport,
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

  // Estado del modal protegido con contraseña para eliminar respuestas de un evento
  const [deleteTargetEvent, setDeleteTargetEvent] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Estado del modal para crear Evaluación Institucional / Libre (sin calendario)
  const [newInstOpen, setNewInstOpen] = useState(false);
  const [instForm, setInstForm] = useState({
    title: '',
    plantel: 'General',
    date: new Date().toISOString().slice(0, 10),
    description: '',
  });

  const handleCreateInstitutional = (e) => {
    e.preventDefault();
    if (!instForm.title.trim() || !onCreateCustomEvaluation) return;
    const created = onCreateCustomEvaluation({
      title: instForm.title.trim(),
      plantel: instForm.plantel || 'General',
      date: instForm.date || '',
      description: instForm.description.trim(),
    });
    setNewInstOpen(false);
    setInstForm({
      title: '',
      plantel: 'General',
      date: new Date().toISOString().slice(0, 10),
      description: '',
    });
    if (created && onOpenEvaluation) {
      onOpenEvaluation(created);
    }
  };

  useEffect(() => {
    setDraftTemplates(templates);
    setSelectedTplId((prev) => prev || templates[0]?.id || '');
  }, [templates]);

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
    return responses.filter(
      (r) => r.respondentPlantel === restrictedPlantel || r.plantel === restrictedPlantel
    );
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
      if (plantelFilter !== 'Todos') {
        const respPlantel = r.respondentPlantel || r.plantel;
        if (respPlantel !== plantelFilter && r.plantel !== plantelFilter) return false;
      }
      if (eventFilter !== 'Todos' && r.eventId !== eventFilter) return false;
      if (audienceFilter !== 'Todos' && r.audienceLabel !== audienceFilter) return false;
      return true;
    });
  }, [scopedResponses, plantelFilter, eventFilter, audienceFilter]);

  // Métricas resumidas por Evento (con desglose por Destinatario y por Plantel)
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
          byPlantel: new Map(),
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

      const respPlantel = r.respondentPlantel || r.plantel || 'General';
      if (!entry.byPlantel.has(respPlantel)) {
        entry.byPlantel.set(respPlantel, { label: respPlantel, count: 0, ratings: [] });
      }
      const pEntry = entry.byPlantel.get(respPlantel);
      pEntry.count += 1;
      if (Number(r.averageRating) > 0) pEntry.ratings.push(Number(r.averageRating));
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
      planteles: Array.from(e.byPlantel.values()).map((p) => ({
        ...p,
        avg: p.ratings.length
          ? (p.ratings.reduce((s, n) => s + n, 0) / p.ratings.length).toFixed(1)
          : '—',
      })),
    }));
  }, [filteredResponses]);

  const globalAvg = useMemo(() => {
    const valid = filteredResponses.map((r) => Number(r.averageRating)).filter((n) => n > 0);
    if (!valid.length) return '—';
    return (valid.reduce((s, n) => s + n, 0) / valid.length).toFixed(1);
  }, [filteredResponses]);

  const questionStats = useMemo(
    () => computeQuestionStats(filteredResponses, templates),
    [filteredResponses, templates]
  );

  const handlePrintEventReport = (evEntry) => {
    if (!onPrintReport) return;
    const evResponses = filteredResponses.filter(
      (r) => (r.eventId || 'sin-evento') === evEntry.eventId
    );
    const evComments = [];
    evResponses.forEach((r) => {
      (r.answers || []).forEach((a) => {
        if (a.type === 'text' && String(a.value || '').trim()) {
          evComments.push({
            id: `${r.id}-${a.questionId}`,
            audience: r.audienceLabel || r.templateName || 'Participante',
            question: a.questionText,
            comment: a.value,
          });
        }
      });
    });

    onPrintReport({
      title: evEntry.title,
      date: evEntry.date,
      plantel: evEntry.plantel,
      count: evEntry.count,
      avg: evEntry.avg,
      audiences: evEntry.audiences,
      planteles: evEntry.planteles || [],
      questionStats: computeQuestionStats(evResponses, templates),
      comments: evComments,
      filterNote: audienceFilter !== 'Todos' ? `Destinatario: ${audienceFilter}` : '',
    });
  };

  const handlePrintFilteredReport = () => {
    if (!onPrintReport || filteredResponses.length === 0) return;
    if (eventBreakdown.length === 1) {
      handlePrintEventReport(eventBreakdown[0]);
      return;
    }

    const audMap = new Map();
    filteredResponses.forEach((r) => {
      const label = r.audienceLabel || r.templateName || 'General';
      if (!audMap.has(label)) audMap.set(label, { label, count: 0, ratings: [] });
      const entry = audMap.get(label);
      entry.count += 1;
      if (Number(r.averageRating) > 0) entry.ratings.push(Number(r.averageRating));
    });
    const audiences = Array.from(audMap.values()).map((a) => ({
      label: a.label,
      count: a.count,
      avg: a.ratings.length
        ? (a.ratings.reduce((s, n) => s + n, 0) / a.ratings.length).toFixed(1)
        : '—',
    }));

    onPrintReport({
      title:
        eventFilter !== 'Todos'
          ? distinctEvents.find((e) => e.id === eventFilter)?.title || 'Reporte de Evaluación'
          : 'Reporte Consolidado de Evaluaciones Pastorales',
      date: '',
      plantel: plantelFilter === 'Todos' ? 'Todos los planteles' : plantelFilter,
      count: filteredResponses.length,
      avg: globalAvg,
      audiences,
      questionStats,
      comments: openComments,
      filterNote: audienceFilter !== 'Todos' ? `Destinatario: ${audienceFilter}` : '',
    });
  };

  const handleConfirmDeleteEventResponses = async (e) => {
    e.preventDefault();
    if (!deleteTargetEvent) return;
    setDeleteError('');
    setDeleting(true);
    try {
      await authService.verifyCurrentPassword(confirmPassword);

      const toDelete = responses.filter(
        (r) => (r.eventId || 'sin-evento') === deleteTargetEvent.eventId
      );
      for (const item of toDelete) {
        await evaluationService.deleteResponse(item.id);
      }

      const deletedCount = toDelete.length;
      setResponses((prev) =>
        prev.filter((r) => (r.eventId || 'sin-evento') !== deleteTargetEvent.eventId)
      );
      setDeleteTargetEvent(null);
      setConfirmPassword('');
      if (onToast) {
        onToast(
          `Se eliminaron ${deletedCount} respuesta(s) de "${deleteTargetEvent.title}"`,
          'info'
        );
      }
    } catch (err) {
      setDeleteError(err?.message || 'No se pudieron eliminar las respuestas.');
    } finally {
      setDeleting(false);
    }
  };

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
      'Plantel del evento',
      'Plantel del participante',
      'Destinatario',
      'Promedio (1-5)',
      'Respuestas',
    ];
    const rows = filteredResponses.map((r) => {
      const summary = (r.answers || [])
        .map((a) =>
          `${a.criteria ? `[${a.criteria}] ` : ''}${a.questionText}: ${a.value}`
        )
        .join(' | ');
      return [
        r.submittedAt || '',
        r.eventTitle || '',
        r.eventDate || '',
        r.plantel || '',
        r.respondentPlantel || r.plantel || '',
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
    setDraftTemplates((prev) => [newTpl, ...prev]);
    setSelectedTplId(newTpl.id);
    if (onToast) {
      onToast('Nueva plantilla lista para editar (recuerda pulsar "Guardar Plantillas")', 'info');
    }
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

        <div className="flex flex-wrap items-center gap-2 self-start">
          {canEditTemplates && onCreateCustomEvaluation && (
            <button
              type="button"
              onClick={() => setNewInstOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-pastoral-gold hover:bg-amber-400 text-pastoral-deep px-4 py-2.5 text-xs font-black shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Evaluación Institucional</span>
            </button>
          )}
          <div className="inline-flex bg-white border border-slate-200 rounded-2xl p-1 shadow-card">
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
      </div>

      {/* SUBPESTAÑA 1: RESULTADOS */}
      {subTab === 'resultados' && (
        <div className="space-y-6">
          {/* Evaluaciones Institucionales / Libres (sin calendario, ej. PEPSAL) */}
          {customEvaluations.length > 0 && (
            <section className="rounded-3xl bg-white border border-pastoral/20 p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-pastoral" />
                  <h2 className="text-sm font-black text-pastoral-deep">
                    Evaluaciones Institucionales / Libres (Sin calendario)
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {customEvaluations.length} creada(s)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customEvaluations.map((ev) => {
                  const cfg = eventEvaluationConfigs[ev.id];
                  const isOpen = cfg?.enabled;
                  return (
                    <div
                      key={ev.id}
                      className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                              PLANTEL_BADGE_STYLES[ev.plantel] || PLANTEL_BADGE_STYLES.General
                            }`}
                          >
                            {ev.plantel || 'General'}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isOpen
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isOpen ? 'Abierta' : 'Sin configurar'}
                          </span>
                          {ev.date && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              {ev.date}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-extrabold text-slate-900 truncate mt-1">
                          {ev.title}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {onOpenEvaluation && (
                          <button
                            type="button"
                            onClick={() => onOpenEvaluation(ev)}
                            className="inline-flex items-center gap-1 rounded-xl bg-pastoral hover:bg-pastoral-deep text-white px-3 py-1.5 text-xs font-extrabold"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            <span>QR / Enlace</span>
                          </button>
                        )}
                        {canEditTemplates && onDeleteCustomEvaluation && (
                          <button
                            type="button"
                            onClick={() => onDeleteCustomEvaluation(ev.id)}
                            className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Quitar de la lista de evaluaciones institucionales"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

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
              {onPrintReport && (
                <button
                  type="button"
                  onClick={handlePrintFilteredReport}
                  disabled={filteredResponses.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white disabled:opacity-40 px-3.5 py-2 text-xs font-extrabold transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Imprimir reporte</span>
                </button>
              )}
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

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-xl bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-extrabold">
                        {ev.count} resp.
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100 text-amber-900 px-3 py-1.5 text-sm font-black">
                        <Star className="h-4 w-4 fill-pastoral-gold text-pastoral-gold" />
                        {ev.avg}/5
                      </span>
                      {onPrintReport && (
                        <button
                          type="button"
                          onClick={() => handlePrintEventReport(ev)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3 py-1.5 text-xs font-extrabold transition-colors"
                          title="Imprimir o guardar en PDF el reporte de este evento"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Imprimir reporte</span>
                        </button>
                      )}
                      {canEditTemplates && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTargetEvent(ev);
                            setConfirmPassword('');
                            setDeleteError('');
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white px-2.5 py-1.5 text-xs font-bold transition-colors"
                          title="Eliminar respuestas de este evento (requiere contraseña)"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Eliminar</span>
                        </button>
                      )}
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

                  {/* Desglose por Plantel del participante (eventos inter-planteles) */}
                  {ev.planteles &&
                    (ev.planteles.length > 1 ||
                      (ev.plantel === 'General' && ev.planteles.some((p) => p.label !== 'General'))) && (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          Participación por Plantel
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ev.planteles.map((pl) => (
                            <span
                              key={pl.label}
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${
                                PLANTEL_BADGE_STYLES[pl.label] || PLANTEL_BADGE_STYLES.General
                              }`}
                            >
                              <span>{pl.label}</span>
                              <span className="font-black">
                                {pl.count} resp. · {pl.avg}/5
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </article>
              ))}
            </div>
          )}

          {/* Gráficas por Pregunta */}
          {questionStats.length > 0 && (
            <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-pastoral" />
                  <h2 className="text-base font-extrabold text-slate-900">
                    Gráficas por Pregunta ({questionStats.length})
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  Se actualiza automáticamente con los filtros de Plantel, Evento y Destinatario
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {questionStats.map((q, idx) => (
                  <div
                    key={q.key}
                    className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug">
                          {idx + 1}. {q.text}
                        </h3>
                        {q.criteria && (
                          <span className="inline-flex items-center rounded-full bg-pastoral/10 text-pastoral px-2.5 py-0.5 text-[10px] font-bold">
                            {q.criteria}
                          </span>
                        )}
                      </div>
                      {q.type === 'rating' ? (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100 text-amber-900 px-2.5 py-1 text-xs font-black shrink-0">
                          <Star className="h-3.5 w-3.5 fill-pastoral-gold text-pastoral-gold" />
                          {q.avg}/5
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-black shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Sí {q.yesPct}%
                        </span>
                      )}
                    </div>

                    {q.type === 'rating' && (
                      <div className="space-y-2">
                        {/* Barra principal de promedio */}
                        <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              Number(q.avg) >= 4
                                ? 'bg-emerald-500'
                                : Number(q.avg) >= 3
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.round((Number(q.avg) / 5) * 100))}%`,
                            }}
                          />
                        </div>

                        {/* Distribución detallada 5★ a 1★ */}
                        <div className="space-y-1 pt-1">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const starCount = q.distribution[star] || 0;
                            const pct = q.total ? Math.round((starCount / q.total) * 100) : 0;
                            return (
                              <div key={star} className="flex items-center gap-2 text-[11px]">
                                <span className="w-7 font-bold text-slate-600 shrink-0">
                                  {star}★
                                </span>
                                <div className="flex-1 h-2 rounded-full bg-slate-200/80 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-pastoral"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="w-16 text-right font-semibold text-slate-500 shrink-0">
                                  {starCount} ({pct}%)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {q.type === 'yesno' && (
                      <div className="space-y-2 pt-1">
                        <div className="w-full h-4 rounded-full bg-slate-200 overflow-hidden flex">
                          {q.yesPct > 0 && (
                            <div
                              className="h-full bg-emerald-500 transition-all"
                              style={{ width: `${q.yesPct}%` }}
                            />
                          )}
                          {q.noPct > 0 && (
                            <div
                              className="h-full bg-rose-500 transition-all"
                              style={{ width: `${q.noPct}%` }}
                            />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-emerald-700">
                            Sí: {q.yesCount} ({q.yesPct}%)
                          </span>
                          <span className="text-rose-600">
                            No: {q.noCount} ({q.noPct}%)
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] font-semibold text-slate-400">
                      Basado en {q.total} respuesta(s)
                    </div>
                  </div>
                ))}
              </div>
            </section>
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
                          criteria: 'ESA · PEPSAL',
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
                    <div className="pl-7">
                      <input
                        type="text"
                        value={q.criteria || ''}
                        onChange={(e) =>
                          updateActiveTpl((t) => ({
                            ...t,
                            questions: t.questions.map((item, i) =>
                              i === idx ? { ...item, criteria: e.target.value } : item
                            ),
                          }))
                        }
                        placeholder="Criterio ESA / PEPSAL (visible solo para Pastoral en reportes y gráficas)..."
                        className="w-full rounded-lg border border-pastoral/20 bg-pastoral/5 px-2.5 py-1 text-[11px] font-semibold text-pastoral-deep placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-pastoral"
                      />
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

      {/* Modal para crear Evaluación Institucional / Libre (sin evento de calendario) */}
      <Modal
        open={newInstOpen}
        onClose={() => setNewInstOpen(false)}
        title="Nueva Evaluación Institucional (Sin calendario)"
        subtitle="Ideal para evaluar el PEPSAL, revisiones del Núcleo CEP o diagnósticos semestrales"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateInstitutional} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Nombre de la evaluación *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={instForm.title}
              onChange={(e) => setInstForm({ ...instForm, title: e.target.value })}
              placeholder="Ej. Evaluación Semestral PEPSAL Ciclo 26–27"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-pastoral"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Alcance / Plantel
              </label>
              <select
                value={instForm.plantel}
                onChange={(e) => setInstForm({ ...instForm, plantel: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold"
              >
                <option value="General">General (Inter-planteles)</option>
                {PLANTELES.filter((p) => p !== 'General').map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Fecha de referencia
              </label>
              <input
                type="date"
                value={instForm.date}
                onChange={(e) => setInstForm({ ...instForm, date: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Descripción breve (opcional)
            </label>
            <textarea
              rows={2}
              value={instForm.description}
              onChange={(e) => setInstForm({ ...instForm, description: e.target.value })}
              placeholder="Ej. Seguimiento del Núcleo de la CEP y agentes de Pastoral de los 3 planteles..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setNewInstOpen(false)}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral hover:bg-pastoral-deep text-white px-4 py-2 text-xs font-extrabold shadow-sm"
            >
              <QrCode className="h-4 w-4" />
              <span>Crear y configurar QR / Destinatarios</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal protegido con contraseña para eliminar respuestas de un evento */}
      <Modal
        open={Boolean(deleteTargetEvent)}
        onClose={() => {
          if (deleting) return;
          setDeleteTargetEvent(null);
          setConfirmPassword('');
          setDeleteError('');
        }}
        title="Eliminar respuestas de evaluación"
        subtitle="Acción protegida · Requiere tu contraseña de acceso"
        maxWidth="max-w-md"
      >
        {deleteTargetEvent && (
          <form onSubmit={handleConfirmDeleteEventResponses} className="space-y-4">
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3 text-xs text-rose-900">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-extrabold">
                  Se borrarán permanentemente {deleteTargetEvent.count} respuesta(s) de:
                </div>
                <div className="font-bold text-rose-800">“{deleteTargetEvent.title}”</div>
                <div className="text-[11px] text-rose-700">
                  Esta acción no se puede deshacer. Úsala solo para limpiar pruebas o datos
                  duplicados.
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-pastoral" />
                  Confirma con tu contraseña de inicio de sesión *
                </span>
              </label>
              <input
                type="password"
                required
                autoFocus
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Escribe tu contraseña actual..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500"
              />
            </div>

            {deleteError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeleteTargetEvent(null);
                  setConfirmPassword('');
                  setDeleteError('');
                }}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={deleting || !confirmPassword.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-4 py-2 text-xs font-extrabold shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{deleting ? 'Verificando y borrando...' : 'Confirmar eliminación'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
