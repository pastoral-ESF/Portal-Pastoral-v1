import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck,
  Copy,
  ExternalLink,
  QrCode,
  Star,
  CheckCircle2,
  Power,
  MessageCircle,
  Printer,
  Users,
  Plus,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { EVALUATION_AUDIENCE_OPTIONS } from '../../constants/config';
import {
  buildEvaluationLink,
  buildQrImageUrl,
  evaluationService,
} from '../../services/evaluationService';

const DEFAULT_EVENT_AUDIENCES = [
  'Alumno / Participante',
  'Padre / Madre de Familia',
  'Docente / Colaborador',
  'Equipo Organizador',
];

function getSuggestedTemplateId(audience, templates = [], eventTitle = '') {
  const findById = (id) => templates.find((t) => t.id === id)?.id;
  const lower = String(audience || '').toLowerCase();
  const titleLower = String(eventTitle || '').toLowerCase();
  if (
    titleLower.includes('pepsal') ||
    lower.includes('cep') ||
    lower.includes('agente')
  ) {
    return findById('tpl-pepsal') || templates[0]?.id || '';
  }
  if (lower.includes('padre') || lower.includes('madre') || lower.includes('familia')) {
    return findById('tpl-familias') || templates[0]?.id || '';
  }
  if (lower.includes('docente') || lower.includes('colaborador') || lower.includes('maestro')) {
    return findById('tpl-docentes') || templates[0]?.id || '';
  }
  if (lower.includes('organizador') || lower.includes('logística') || lower.includes('logistica')) {
    return findById('tpl-logistica') || templates[0]?.id || '';
  }
  if (lower.includes('animador') || lower.includes('mjs')) {
    return findById('tpl-mjs') || templates[0]?.id || '';
  }
  if (lower.includes('padrino') || lower.includes('sacramento')) {
    return findById('tpl-sacramentos') || templates[0]?.id || '';
  }
  return findById('tpl-fe') || templates[0]?.id || '';
}

function isInterPlantelEvent(event) {
  const p = String(event?.plantel || 'General').trim();
  return !['Glandorff', 'Kennedy', 'Cordilleras'].includes(p);
}

export function EventEvaluationModal({
  open,
  event,
  config,
  templates = [],
  onClose,
  onSaveConfig,
  onPrintQrPoster,
  onToast,
}) {
  const [enabled, setEnabled] = useState(true);
  const [askPlantel, setAskPlantel] = useState(false);
  const [selectedAudiences, setSelectedAudiences] = useState(DEFAULT_EVENT_AUDIENCES);
  const [audienceTemplateMap, setAudienceTemplateMap] = useState({});
  const [customAudience, setCustomAudience] = useState('');
  const [responses, setResponses] = useState([]);
  const [loadingResp, setLoadingResp] = useState(false);

  useEffect(() => {
    if (!open || !event) return;
    setEnabled(config?.enabled ?? true);
    setAskPlantel(
      typeof config?.askPlantel === 'boolean' ? config.askPlantel : isInterPlantelEvent(event)
    );
    const isPepsalOrCustom =
      event.source === 'custom-eval' || /pepsal|cep/i.test(event.title || '');
    const initialAudiences =
      Array.isArray(config?.audiences) && config.audiences.length > 0
        ? config.audiences
        : isPepsalOrCustom
        ? ['Núcleo de la CEP', 'Agente de Pastoral', 'Docente / Colaborador']
        : DEFAULT_EVENT_AUDIENCES;
    setSelectedAudiences(initialAudiences);

    const nextMap = { ...(config?.audienceTemplateMap || {}) };
    initialAudiences.forEach((aud) => {
      if (!nextMap[aud] || !templates.some((t) => t.id === nextMap[aud])) {
        nextMap[aud] = getSuggestedTemplateId(aud, templates, event.title);
      }
    });
    setAudienceTemplateMap(nextMap);
    setCustomAudience('');

    setLoadingResp(true);
    evaluationService
      .listAllResponses()
      .then((all) => setResponses(all.filter((r) => r.eventId === event.id)))
      .catch(() => setResponses([]))
      .finally(() => setLoadingResp(false));
  }, [open, event, config, templates]);

  const universalUrl = useMemo(
    () => (event ? buildEvaluationLink(event.id) : ''),
    [event]
  );

  const avgRating = useMemo(() => {
    const valid = responses.map((r) => Number(r.averageRating)).filter((n) => n > 0);
    if (!valid.length) return '—';
    return (valid.reduce((s, n) => s + n, 0) / valid.length).toFixed(1);
  }, [responses]);

  if (!open || !event) return null;

  const toggleAudience = (aud) => {
    setSelectedAudiences((prev) => {
      if (prev.includes(aud)) {
        return prev.filter((item) => item !== aud);
      }
      setAudienceTemplateMap((prevMap) => ({
        ...prevMap,
        [aud]: prevMap[aud] || getSuggestedTemplateId(aud, templates),
      }));
      return [...prev, aud];
    });
  };

  const handleTemplateForAudienceChange = (aud, tplId) => {
    setAudienceTemplateMap((prev) => ({ ...prev, [aud]: tplId }));
  };

  const handleAddCustomAudience = () => {
    const clean = customAudience.trim();
    if (!clean) return;
    if (!selectedAudiences.includes(clean)) {
      setSelectedAudiences((prev) => [...prev, clean]);
      setAudienceTemplateMap((prev) => ({
        ...prev,
        [clean]: prev[clean] || getSuggestedTemplateId(clean, templates),
      }));
    }
    setCustomAudience('');
  };

  const allAudienceChoices = Array.from(
    new Set([...EVALUATION_AUDIENCE_OPTIONS, ...selectedAudiences])
  );

  const handleSave = () => {
    const finalAudiences = selectedAudiences.length
      ? selectedAudiences
      : ['Alumno / Participante'];
    const finalMap = {};
    finalAudiences.forEach((aud) => {
      finalMap[aud] =
        audienceTemplateMap[aud] || getSuggestedTemplateId(aud, templates) || templates[0]?.id || '';
    });
    const uniqueTemplateIds = Array.from(new Set(Object.values(finalMap).filter(Boolean)));

    onSaveConfig(event.id, {
      enabled,
      askPlantel,
      audiences: finalAudiences,
      audienceTemplateMap: finalMap,
      templateIds: uniqueTemplateIds.length
        ? uniqueTemplateIds
        : [templates[0]?.id].filter(Boolean),
    });
    if (onToast) {
      onToast(
        enabled
          ? 'Evaluación guardada: cada destinatario abrirá su plantilla asignada'
          : 'Evaluación cerrada para este evento'
      );
    }
  };

  const copyText = async (text, label = 'Enlace copiado al portapapeles') => {
    try {
      await navigator.clipboard.writeText(text);
      if (onToast) onToast(label, 'success');
    } catch {
      if (onToast) onToast('No se pudo copiar automáticamente; cópialo manualmente.', 'info');
    }
  };

  const buildWhatsappShareUrl = (url, audience = '') => {
    const msg = `¡Hola! Te compartimos la breve evaluación de *${event.title}*${
      audience ? ` (${audience})` : ''
    } — Pastoral ESFER Salesianos:\n${url}`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Evaluación del Evento (Enlace y QR)"
      subtitle={`${event.title} · ${event.date || ''} · Plantel ${event.plantel || 'General'}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Estado Abierto / Cerrado */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}
            >
              <Power className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">
                {enabled ? 'Formulario Abierto para Participantes' : 'Formulario Cerrado'}
              </div>
              <p className="text-xs text-slate-500">
                {enabled
                  ? 'Cualquier persona con el enlace o QR puede contestar sin iniciar sesión.'
                  : 'Nadie puede enviar nuevas respuestas mientras esté cerrado.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEnabled((prev) => !prev)}
            className={`rounded-xl px-4 py-2 text-xs font-extrabold transition-colors ${
              enabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-700 hover:bg-slate-800 text-white'
            }`}
          >
            {enabled ? 'Abierto (Clic para cerrar)' : 'Cerrado (Clic para abrir)'}
          </button>
        </div>

        {/* 1. Destinatarios habilitados para este evento */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-pastoral" />
              <span>1. Elige los destinatarios que evaluarán este evento</span>
            </h3>
            <span className="text-xs font-bold text-pastoral">
              {selectedAudiences.length} activo(s)
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {allAudienceChoices.map((aud) => {
              const active = selectedAudiences.includes(aud);
              return (
                <button
                  key={aud}
                  type="button"
                  onClick={() => toggleAudience(aud)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                    active
                      ? 'bg-pastoral text-white border-pastoral shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-pastoral/40'
                  }`}
                >
                  <span>{active ? '✓' : '+'}</span>
                  <span>{aud}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customAudience}
              onChange={(e) => setCustomAudience(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomAudience();
                }
              }}
              placeholder="Agregar otro destinatario (ej. Exalumnos, Directivos)..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-pastoral"
            />
            <button
              type="button"
              onClick={handleAddCustomAudience}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-bold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Agregar</span>
            </button>
          </div>
        </div>

        {/* 2. Plantilla de preguntas asignada a cada destinatario */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              2. Preguntas (plantilla) que responderá cada destinatario
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Cada perfil recibe preguntas adaptadas a su propia experiencia en este evento.
            </p>
          </div>

          <div className="space-y-2">
            {selectedAudiences.map((aud) => (
              <div
                key={aud}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-slate-50 border border-slate-200 px-3.5 py-2.5"
              >
                <span className="text-xs font-extrabold text-pastoral-deep flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-pastoral shrink-0" />
                  <span>{aud}</span>
                  {/organizador|logística|logistica/i.test(aud) && (
                    <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold">
                      🔒 Requiere sesión
                    </span>
                  )}
                </span>
                <select
                  value={audienceTemplateMap[aud] || getSuggestedTemplateId(aud, templates)}
                  onChange={(e) => handleTemplateForAudienceChange(aud, e.target.value)}
                  className="sm:w-80 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-pastoral"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.questions?.length || 0} preg.)
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <label className="flex items-start gap-2.5 rounded-2xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={askPlantel}
              onChange={(e) => setAskPlantel(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-pastoral focus:ring-pastoral"
            />
            <div className="text-xs">
              <div className="font-extrabold text-slate-800">
                Preguntar plantel del participante (Glandorff · Kennedy · Cordilleras · Otro)
              </div>
              <div className="text-[11px] text-slate-500">
                Ideal para eventos inter-planteles o generales; permite ver cuántas respuestas y
                qué promedio obtuvo cada plantel.
              </div>
            </div>
          </label>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral hover:bg-pastoral-deep text-white px-4 py-2 text-xs font-extrabold shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Guardar configuración de evaluación</span>
            </button>
          </div>
        </div>

        {/* QR y Enlaces para compartir */}
        <div className="rounded-3xl bg-gradient-to-br from-pastoral-deep to-pastoral text-white p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="bg-white p-2.5 rounded-2xl shadow-lg shrink-0">
              <img
                src={buildQrImageUrl(universalUrl, 200)}
                alt="Código QR de evaluación"
                className="h-36 w-36 object-contain"
              />
            </div>
            <div className="flex-1 space-y-2.5 text-center sm:text-left min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-[11px] font-bold text-pastoral-gold">
                <QrCode className="h-3.5 w-3.5" />
                <span>Enlace y QR Universal del Evento</span>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                {selectedAudiences.length > 1
                  ? 'Al escanear este QR, el participante elegirá primero su destinatario (ej. Alumno, Docente o Equipo Organizador) y contestará las preguntas.'
                  : 'Al escanear este QR, el participante entra directo a las preguntas sin iniciar sesión.'}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => copyText(universalUrl)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral-gold hover:bg-amber-400 text-pastoral-deep font-extrabold text-xs px-3.5 py-2"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar enlace</span>
                </button>
                <a
                  href={buildWhatsappShareUrl(universalUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-extrabold text-xs px-3.5 py-2"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={universalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-3.5 py-2"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Probar</span>
                </a>
                {onPrintQrPoster && (
                  <button
                    type="button"
                    onClick={() => {
                      const publicAudiences = selectedAudiences.filter(
                        (a) => !/organizador|logística|logistica/i.test(a)
                      );
                      onPrintQrPoster({
                        eventTitle: event.title,
                        eventDate: event.date || '',
                        plantel: event.plantel || 'General',
                        url: universalUrl,
                        audienceLabel:
                          publicAudiences.length === 1 ? publicAudiences[0] : '',
                        audiences: publicAudiences,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white text-pastoral-deep hover:bg-amber-50 font-extrabold text-xs px-3.5 py-2 shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Imprimir cartel QR</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Enlaces y carteles directos por destinatario (cuando hay 2+ destinatarios) */}
          {selectedAudiences.length > 1 && (
            <div className="pt-3 border-t border-white/15 space-y-2">
              <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
                Enlaces y carteles directos por destinatario (sin pantalla de selección)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedAudiences.map((aud) => {
                  const mappedTplId =
                    audienceTemplateMap[aud] || getSuggestedTemplateId(aud, templates);
                  const directUrl = buildEvaluationLink(event.id, {
                    audience: aud,
                    templateId: mappedTplId,
                  });
                  return (
                    <div
                      key={aud}
                      className="flex items-center justify-between gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs"
                    >
                      <span className="font-bold truncate">
                        {/organizador|logística|logistica/i.test(aud) ? '🔒 ' : ''}
                        {aud}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyText(directUrl, `Enlace para ${aud} copiado`)}
                          className="rounded-lg bg-white/15 hover:bg-white/25 px-2 py-1 text-[11px] font-bold"
                        >
                          Copiar
                        </button>
                        <a
                          href={buildWhatsappShareUrl(directUrl, aud)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-[#25D366] px-2 py-1 text-[11px] font-bold"
                        >
                          WA
                        </a>
                        {onPrintQrPoster && (
                          <button
                            type="button"
                            onClick={() =>
                              onPrintQrPoster({
                                eventTitle: event.title,
                                eventDate: event.date || '',
                                plantel: event.plantel || 'General',
                                url: directUrl,
                                audienceLabel: aud,
                                audiences: [aud],
                              })
                            }
                            className="rounded-lg bg-white text-pastoral-deep hover:bg-amber-50 p-1"
                            title={`Imprimir cartel QR exclusivo para ${aud}`}
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Resumen rápido de respuestas de este evento */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-pastoral" />
            <div>
              <div className="text-sm font-extrabold text-slate-900">
                {loadingResp
                  ? 'Cargando respuestas...'
                  : `${responses.length} respuesta(s) recibida(s)`}
              </div>
              <div className="text-xs text-slate-500">
                Consulta el detalle completo y comentarios en la pestaña Evaluación.
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 rounded-xl bg-amber-100 text-amber-900 px-3 py-1.5 text-sm font-black">
            <Star className="h-4 w-4 fill-pastoral-gold text-pastoral-gold" />
            <span>{avgRating}/5</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
