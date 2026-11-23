import React, { useState } from 'react';
import { HeartHandshake, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';

const INITIAL_FORM = {
  senderName: '',
  plantel: 'Glandorff',
  level: 'Secundaria',
  contactMethod: '',
  message: '',
};

export function AccompanimentBoxView({ onSubmitMessage }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.message.trim() || !form.contactMethod.trim()) return;

    onSubmitMessage({
      senderName: form.senderName.trim() || 'Anónimo',
      plantel: form.plantel,
      level: form.level,
      contactMethod: form.contactMethod.trim(),
      message: form.message.trim(),
    });

    setForm(INITIAL_FORM);
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encabezado cálido */}
      <div className="rounded-3xl bg-gradient-to-br from-pastoral-deep via-pastoral to-pastoral-light text-white p-6 sm:p-8 shadow-soft">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-pastoral-gold">
          <HeartHandshake className="h-4 w-4" />
          <span>Escucha Confidencial</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black mt-3">Buzón de Acompañamiento</h1>
        <p className="text-sm sm:text-base text-blue-100 mt-1.5 leading-relaxed">
          ¿Necesitas platicar con un sacerdote salesiano, coordinador de pastoral o animador?
          Este espacio es seguro y confidencial para estudiantes y padres de familia.
        </p>
      </div>

      {/* Confirmación */}
      {submitted ? (
        <div className="rounded-3xl bg-white border border-emerald-200 p-8 text-center shadow-card space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Tu solicitud fue recibida con total confidencialidad
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Solo el equipo de Coordinación de Pastoral tiene acceso a este buzón. Nos pondremos en
            contacto contigo muy pronto por el medio que nos indicaste.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="inline-flex items-center justify-center rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-bold text-sm px-5 py-2.5 transition-colors"
          >
            Enviar otra solicitud
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-card space-y-5"
        >
          <div className="flex items-start gap-3 rounded-2xl bg-pastoral/5 border border-pastoral/15 p-4 text-xs sm:text-sm text-slate-700">
            <ShieldCheck className="h-5 w-5 text-pastoral shrink-0 mt-0.5" />
            <span>
              <strong>Privacidad garantizada:</strong> Tu mensaje nunca se publica. Llega
              únicamente a la bandeja privada de la Coordinación de Pastoral en el Backstage.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">
                Nombre o alias (opcional)
              </label>
              <input
                type="text"
                value={form.senderName}
                onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                placeholder="Ej. María G. o dejar en blanco"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30 focus:border-pastoral"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">
                Plantel *
              </label>
              <select
                value={form.plantel}
                onChange={(e) => setForm({ ...form, plantel: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30 focus:border-pastoral"
              >
                <option value="Glandorff">Glandorff</option>
                <option value="Kennedy">Kennedy</option>
                <option value="Cordilleras">Cordilleras</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">
                Nivel / Perfil *
              </label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30 focus:border-pastoral"
              >
                <option value="Primaria">Estudiante · Primaria</option>
                <option value="Secundaria">Estudiante · Secundaria</option>
                <option value="Preparatoria">Estudiante · Preparatoria</option>
                <option value="Padre/Madre de Familia">Padre / Madre de Familia</option>
                <option value="Docente / Colaborador">Docente / Colaborador</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">
                Medio de contacto preferido *
              </label>
              <input
                type="text"
                required
                value={form.contactMethod}
                onChange={(e) => setForm({ ...form, contactMethod: e.target.value })}
                placeholder="WhatsApp, correo o en persona en el colegio"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30 focus:border-pastoral"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-1.5">
              ¿Cómo podemos acompañarte? *
            </label>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Cuéntanos brevemente si buscas dirección espiritual, platicar con un sacerdote, coordinador o animador..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30 focus:border-pastoral"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-sm px-6 py-3 shadow-sm transition-all"
          >
            <Send className="h-4 w-4" />
            <span>Enviar solicitud confidencial</span>
          </button>
        </form>
      )}
    </div>
  );
}
