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
} from 'lucide-react';
import { Modal } from '../common/Modal';
import {
  buildEvaluationLink,
  buildQrImageUrl,
  evaluationService,
} from '../../services/evaluationService';

export function EventEvaluationModal({
  open,
  event,
  config,
  templates = [],
  onClose,
  onSaveConfig,
  onToast,
}) {
  const [enabled, setEnabled] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loadingResp, setLoadingResp] = useState(false);

  useEffect(() => {
    if (!open || !event) return;
    setEnabled(config?.enabled ?? true);
    setSelectedIds(
      config?.templateIds?.length ? config.templateIds : [templates[0]?.id].filter(Boolean)
    );

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

  if (!open || !event) return null;

  const toggleTemplate = (tplId) => {
    setSelectedIds((prev) =>
      prev.includes(tplId) ? prev.filter((id) => id !== tplId) : [...prev, tplId]
    );
  };

  const handleSave = () => {
    const finalIds = selectedIds.length ? selectedIds : [templates[0]?.id].filter(Boolean);
    onSaveConfig(event.id, {
      enabled,
      templateIds: finalIds,
    });
    if (onToast) {
      onToast(
        enabled
          ? 'Evaluación habilitada y enlace/QR listo para compartir'
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

  const avgRating = useMemo(() => {
    const valid = responses.map((r) => Number(r.averageRating)).filter((n) => n > 0);
    if (!valid.length) return '—';
    return (valid.reduce((s, n) => s + n, 0) / valid.length).toFixed(1);
  }, [responses]);

  const activeTemplates = templates.filter((t) => selectedIds.includes(t.id));

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

        {/* Selección de 1 o varias plantillas (multi-destinatario) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              1. Elige las plantillas / destinatarios para este evento (puedes marcar varias)
            </h3>
            <span className="text-xs font-bold text-pastoral">
              {selectedIds.length} seleccionada(s)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
            {templates.map((tpl) => {
              const checked = selectedIds.includes(tpl.id);
              return (
                <label
                  key={tpl.id}
                  className={`flex items-start gap-2.5 rounded-2xl border p-3 cursor-pointer transition-all ${
                    checked
                      ? 'bg-pastoral/5 border-pastoral ring-1 ring-pastoral/20'
                      : 'bg-white border-slate-200 hover:border-pastoral/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTemplate(tpl.id)}
                    className="mt-0.5 rounded border-slate-300 text-pastoral focus:ring-pastoral"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-slate-900">{tpl.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {tpl.audienceLabel} · {tpl.questions?.length || 0} preguntas
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

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
                {activeTemplates.length > 1
                  ? 'Al escanear este QR, el participante elegirá primero su perfil (ej. Alumno, Papá o Docente) y contestará sus preguntas.'
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
              </div>
            </div>
          </div>

          {/* Enlaces directos por destinatario (cuando hay 2+ plantillas) */}
          {activeTemplates.length > 1 && (
            <div className="pt-3 border-t border-white/15 space-y-2">
              <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
                Enlaces directos por destinatario (sin pantalla de selección)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeTemplates.map((tpl) => {
                  const directUrl = buildEvaluationLink(event.id, tpl.id);
                  return (
                    <div
                      key={tpl.id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs"
                    >
                      <span className="font-bold truncate">{tpl.audienceLabel}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            copyText(directUrl, `Enlace para ${tpl.audienceLabel} copiado`)
                          }
                          className="rounded-lg bg-white/15 hover:bg-white/25 px-2 py-1 text-[11px] font-bold"
                        >
                          Copiar
                        </button>
                        <a
                          href={buildWhatsappShareUrl(directUrl, tpl.audienceLabel)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-[#25D366] px-2 py-1 text-[11px] font-bold"
                        >
                          WA
                        </a>
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
