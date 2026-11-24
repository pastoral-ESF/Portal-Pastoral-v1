import React, { useState, useMemo } from 'react';
import {
  Star,
  CheckCircle2,
  Send,
  Lock,
  Sparkles,
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { LogoImage } from '../common/LogoImage';
import { evaluationService } from '../../services/evaluationService';

const RATING_LABELS = {
  1: 'Muy bajo',
  2: 'Regular',
  3: 'Bueno',
  4: 'Muy bueno',
  5: 'Excelente',
};

export function PublicEvaluationView({
  event,
  config,
  templates = [],
  preselectedTemplateId = '',
  onGoToVisor,
}) {
  const activeTemplates = useMemo(() => {
    const ids = config?.templateIds || [];
    return templates.filter((t) => ids.includes(t.id));
  }, [config, templates]);

  const [selectedTemplateId, setSelectedTemplateId] = useState(() => {
    if (preselectedTemplateId && activeTemplates.some((t) => t.id === preselectedTemplateId)) {
      return preselectedTemplateId;
    }
    if (activeTemplates.length === 1) return activeTemplates[0].id;
    return '';
  });

  const [answersMap, setAnswersMap] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const selectedTemplate = useMemo(
    () => activeTemplates.find((t) => t.id === selectedTemplateId) || null,
    [activeTemplates, selectedTemplateId]
  );

  // Evento no encontrado o evaluación no habilitada
  if (!event || !config?.enabled || activeTemplates.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200 p-8 shadow-soft text-center space-y-4">
          <div className="inline-flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-full px-4 py-2">
            <LogoImage type="esfer" className="h-7 w-auto" />
            <span className="h-4 w-px bg-slate-200" />
            <LogoImage type="pastoral" className="h-7 w-auto" />
          </div>
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black text-slate-900">
            {!event ? 'Evento no encontrado' : 'Evaluación no disponible'}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {!event
              ? 'El enlace de evaluación no corresponde a un evento activo o aún se está sincronizando.'
              : `La evaluación para "${event.title}" se encuentra cerrada por el Departamento de Pastoral.`}
          </p>
          {onGoToVisor && (
            <button
              type="button"
              onClick={onGoToVisor}
              className="inline-flex items-center justify-center rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-xs px-5 py-2.5"
            >
              Ir al Visor Público
            </button>
          )}
        </div>
      </div>
    );
  }

  // Pantalla de agradecimiento tras enviar
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A235A] via-[#2B3890] to-[#3F4DAE] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 shadow-2xl text-center space-y-5">
          <div className="h-16 w-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900">¡Muchas gracias por evaluar!</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tu respuesta sobre <strong>{event.title}</strong> fue enviada de forma confidencial
              al Departamento de Pastoral ESFER Salesianos. Tu opinión nos ayuda a seguir
              mejorando juntos.
            </p>
          </div>
          <div className="rounded-2xl bg-pastoral/5 border border-pastoral/15 p-3 text-xs font-semibold text-pastoral-deep italic">
            «La caridad es paciente, la caridad es benigna» · ESFER Salesianos Chihuahua
          </div>
          {onGoToVisor && (
            <button
              type="button"
              onClick={onGoToVisor}
              className="w-full rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-sm py-3 transition-colors"
            >
              Conocer el Portal Pastoral
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    // Validar obligatorias
    for (const q of selectedTemplate.questions || []) {
      const val = answersMap[q.id];
      if (q.required && (val === undefined || val === null || String(val).trim() === '')) {
        setError(`Por favor responde: "${q.text}"`);
        return;
      }
    }

    setError('');
    setSubmitting(true);
    try {
      const answers = (selectedTemplate.questions || []).map((q) => ({
        questionId: q.id,
        questionText: q.text,
        type: q.type,
        value: answersMap[q.id] ?? '',
      }));

      const ratingValues = answers
        .filter((a) => a.type === 'rating' && Number(a.value) > 0)
        .map((a) => Number(a.value));
      const averageRating = ratingValues.length
        ? Number((ratingValues.reduce((s, n) => s + n, 0) / ratingValues.length).toFixed(2))
        : null;

      await evaluationService.submitResponse({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date || '',
        plantel: event.plantel || 'General',
        category: event.category || 'Pastoral',
        esaDimensionId: event.esaDimensionId || '',
        pepsalAreaId: event.pepsalAreaId || '',
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        audienceLabel: selectedTemplate.audienceLabel || selectedTemplate.name,
        answers,
        averageRating,
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(
        'No se pudo enviar tu evaluación. Verifica tu conexión o avisa al Departamento de Pastoral.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Encabezado institucional del evento */}
        <div className="rounded-3xl bg-gradient-to-br from-[#1A235A] via-[#2B3890] to-[#3F4DAE] text-white p-6 sm:p-8 shadow-soft space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-3.5 py-1.5 shadow-sm">
              <LogoImage type="esfer" className="h-6 w-auto" />
              <span className="h-4 w-px bg-slate-200" />
              <LogoImage type="pastoral" className="h-6 w-auto" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-pastoral-gold/20 border border-pastoral-gold/40 px-3 py-1 text-[11px] font-extrabold text-pastoral-gold uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              Evaluación Pastoral
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black leading-snug">{event.title}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-xs text-blue-100">
              {event.date && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-pastoral-gold" />
                  {event.date}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-pastoral-cyan" />
                Plantel {event.plantel || 'General'}
              </span>
            </div>
          </div>
        </div>

        {/* Paso 1: Elegir destinatario si hay varias plantillas activas */}
        {!selectedTemplate ? (
          <section className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-card space-y-5">
            <div className="text-center space-y-1">
              <div className="h-11 w-11 rounded-2xl bg-pastoral/10 text-pastoral flex items-center justify-center mx-auto">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                ¿Cómo participaste en este evento?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Elige tu perfil para mostrarte las preguntas correspondientes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId(tpl.id);
                    setAnswersMap({});
                    setError('');
                  }}
                  className="text-left rounded-2xl border border-slate-200 hover:border-pastoral bg-slate-50 hover:bg-pastoral/5 p-4 transition-all group"
                >
                  <div className="text-sm font-extrabold text-slate-900 group-hover:text-pastoral">
                    {tpl.audienceLabel || tpl.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{tpl.name}</div>
                </button>
              ))}
            </div>
          </section>
        ) : (
          /* Paso 2: Formulario de preguntas */
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-card space-y-6"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-pastoral">
                  Perfil: {selectedTemplate.audienceLabel || selectedTemplate.name}
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {selectedTemplate.name}
                </h2>
              </div>
              {activeTemplates.length > 1 && !preselectedTemplateId && (
                <button
                  type="button"
                  onClick={() => setSelectedTemplateId('')}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Cambiar perfil
                </button>
              )}
            </div>

            <div className="space-y-6">
              {(selectedTemplate.questions || []).map((q, idx) => (
                <div key={q.id} className="space-y-2.5">
                  <label className="block text-sm font-extrabold text-slate-800 leading-snug">
                    {idx + 1}. {q.text}
                    {q.required && <span className="text-rose-500 ml-1">*</span>}
                  </label>

                  {q.type === 'rating' && (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((starVal) => {
                          const current = Number(answersMap[q.id] || 0);
                          const active = current >= starVal;
                          return (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() =>
                                setAnswersMap((prev) => ({ ...prev, [q.id]: starVal }))
                              }
                              className={`flex flex-col items-center justify-center rounded-2xl border py-2.5 transition-all ${
                                active
                                  ? 'bg-pastoral-gold/20 border-pastoral-gold text-amber-950 shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-pastoral-gold/50'
                              }`}
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  active ? 'fill-pastoral-gold text-pastoral-gold' : ''
                                }`}
                              />
                              <span className="text-xs font-extrabold mt-1">{starVal}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-1">
                        <span>1 · Muy bajo</span>
                        <span>
                          {answersMap[q.id] ? RATING_LABELS[answersMap[q.id]] : ''}
                        </span>
                        <span>5 · Excelente</span>
                      </div>
                    </div>
                  )}

                  {q.type === 'yesno' && (
                    <div className="grid grid-cols-2 gap-3">
                      {['Sí', 'No'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswersMap((prev) => ({ ...prev, [q.id]: opt }))}
                          className={`rounded-2xl border py-3 text-sm font-extrabold transition-all ${
                            answersMap[q.id] === opt
                              ? 'bg-pastoral text-white border-pastoral shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-pastoral/40'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'text' && (
                    <textarea
                      rows={3}
                      value={answersMap[q.id] || ''}
                      onChange={(e) =>
                        setAnswersMap((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="Escribe tu comentario aquí (confidencial)..."
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/25 focus:border-pastoral"
                    />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-bold text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep disabled:opacity-60 text-white font-black text-sm py-3.5 shadow-md transition-all"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'Enviando evaluación...' : 'Enviar mi Evaluación'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
