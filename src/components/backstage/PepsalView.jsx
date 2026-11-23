import React, { useState } from 'react';
import {
  BookMarked,
  ExternalLink,
  Link2,
  Save,
  Layers,
  Quote,
  Compass,
  CheckCircle2,
  FilePlus2,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import {
  PEPSAL_META,
  PEPSAL_RETOS,
  PEPSAL_AREAS,
} from '../../constants/pepsalCatalog';

export function PepsalView({
  pepsalDoc,
  cartas,
  onSavePepsalDoc,
  onCreateCartaWithPepsal,
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(pepsalDoc);
  const [showRetos, setShowRetos] = useState(true);
  const [selectedDimId, setSelectedDimId] = useState(PEPSAL_AREAS[0].id);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSavePepsalDoc({
      ...form,
      title: form.title.trim() || pepsalDoc.title,
      version: form.version.trim() || PEPSAL_META.cycle,
      documentUrl: form.documentUrl.trim(),
      notes: form.notes.trim(),
    });
    setEditing(false);
  };

  const activeDim =
    PEPSAL_AREAS.find((d) => d.id === selectedDimId) || PEPSAL_AREAS[0];

  return (
    <div className="space-y-6">
      {/* Hero PEPSAL Ciclo 26-27 */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A235A] via-[#2B3890] to-[#3F4DAE] text-white p-6 sm:p-8 shadow-soft">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-pastoral-gold/20 blur-3xl"
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1 text-xs font-extrabold text-pastoral-gold uppercase tracking-wider">
              <BookMarked className="h-3.5 w-3.5" />
              ESFER Salesianos · {PEPSAL_META.cycle}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              PEPSAL
            </h1>
            <p className="text-sm sm:text-base font-bold text-cyan-100">
              Proyecto Educativo Pastoral Salesiano Local
            </p>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              {PEPSAL_META.definition}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            {pepsalDoc.documentUrl && (
              <a
                href={pepsalDoc.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-pastoral-gold hover:bg-amber-400 text-pastoral-deep font-black text-xs sm:text-sm px-5 py-3 shadow-md transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Abrir PDF Completo</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                setForm(pepsalDoc);
                setEditing((prev) => !prev);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs sm:text-sm px-4 py-3 transition-all"
            >
              <Link2 className="h-4 w-4" />
              <span>
                {pepsalDoc.documentUrl ? 'Editar enlace PDF' : 'Vincular PDF original (Drive/OneDrive)'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Editor opcional de enlace al PDF completo (>10 MB) */}
      {editing && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white border border-pastoral/30 p-6 shadow-card space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Link2 className="h-5 w-5 text-pastoral" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Enlace al PDF original del PEPSAL (opcional)
              </h2>
              <p className="text-xs text-slate-500">
                Todo el contenido del PEPSAL Ciclo 26-27 ya está integrado aquí; si además deseas
                enlazar el PDF original (&gt;10 MB) desde Google Drive o OneDrive, pégalo abajo.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                URL del PDF (Google Drive / OneDrive / SharePoint)
              </label>
              <input
                type="text"
                value={form.documentUrl}
                onChange={(e) => setForm({ ...form, documentUrl: e.target.value })}
                placeholder="https://drive.google.com/file/d/.../view"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-pastoral"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral hover:bg-pastoral-deep text-white px-5 py-2 text-xs font-extrabold shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span>Guardar enlace</span>
            </button>
          </div>
        </form>
      )}

      {/* ¿Qué es el PEPSAL? + Mensaje del Director */}
      <div className="grid lg:grid-cols-12 gap-5">
        <section className="lg:col-span-6 rounded-3xl bg-white border border-slate-200 p-6 shadow-card space-y-4">
          <h2 className="text-lg font-black text-slate-900">Objetivos del PEPSAL</h2>
          <div className="space-y-3">
            {PEPSAL_META.objectives.map((obj) => (
              <div
                key={obj.title}
                className="rounded-2xl bg-slate-50 border border-slate-200/70 p-3.5 flex items-start gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-pastoral shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-extrabold text-slate-900">{obj.title}</div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{obj.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-6 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-blue-50 border border-amber-200/80 p-6 shadow-card flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-700">
              <Quote className="h-4 w-4 text-pastoral-gold" />
              <span>{PEPSAL_META.directorMessage.role}</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed italic">
              “{PEPSAL_META.directorMessage.body}”
            </p>
          </div>
          <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between">
            <span className="text-sm font-black text-pastoral-deep">
              {PEPSAL_META.directorMessage.author}
            </span>
            <span className="text-xs font-semibold text-slate-500">ESFER Salesianos Chihuahua</span>
          </div>
        </section>
      </div>

      {/* Dimensiones de la CEP (Las 4 oficiales) */}
      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-pastoral uppercase tracking-wide">
              <Layers className="h-4 w-4" />
              <span>Dimensiones de la CEP (Comunidad Educativa - Pastoral)</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Objetivos, Estrategias e Intervenciones Oficiales
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {cartas.filter((c) => c.pepsalAreaId).length} de {cartas.length} cartas vinculadas
          </span>
        </div>

        {/* Selector de las 4 Dimensiones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PEPSAL_AREAS.map((dim) => {
            const count = cartas.filter((c) => c.pepsalAreaId === dim.id).length;
            const isActive = dim.id === activeDim.id;
            return (
              <button
                key={dim.id}
                type="button"
                onClick={() => setSelectedDimId(dim.id)}
                className={`text-left rounded-2xl p-4 border transition-all ${
                  isActive
                    ? 'bg-pastoral-deep text-white border-pastoral-deep shadow-md'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-pastoral/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: dim.color }}
                  />
                  <span
                    className={`text-[11px] font-bold ${
                      isActive ? 'text-pastoral-gold' : 'text-slate-500'
                    }`}
                  >
                    {count} {count === 1 ? 'carta' : 'cartas'}
                  </span>
                </div>
                <div className="text-sm font-black mt-2">{dim.name}</div>
                <div
                  className={`text-[11px] mt-1 ${
                    isActive ? 'text-blue-200' : 'text-slate-500'
                  }`}
                >
                  {dim.interventions.length} intervenciones
                </div>
              </button>
            );
          })}
        </div>

        {/* Detalle de la Dimensión seleccionada */}
        <div className="rounded-3xl bg-slate-50 border border-slate-200/80 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span
                className="inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-extrabold text-white"
                style={{ backgroundColor: activeDim.color }}
              >
                Dimensión CEP
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1.5">{activeDim.name}</h3>
            </div>
            <button
              type="button"
              onClick={() => onCreateCartaWithPepsal(activeDim.id)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 shadow-sm transition-all shrink-0"
            >
              <FilePlus2 className="h-4 w-4" />
              <span>Planear Carta en esta dimensión</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
              Objetivo
            </div>
            <p className="text-sm text-slate-800 font-medium leading-relaxed">
              {activeDim.objective}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-rose-600">
                Estrategias - Procesos
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {activeDim.strategies.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-pastoral">
                Intervenciones ({activeDim.interventions.length})
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {activeDim.interventions.map((inter, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-pastoral/10 text-pastoral text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{inter}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Visión Pastoral: Los 8 Retos que nos plantea la realidad */}
      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
        <button
          type="button"
          onClick={() => setShowRetos((prev) => !prev)}
          className="w-full flex items-center justify-between gap-4 text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-pastoral-gold/20 text-amber-800 flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Visión Pastoral: Los 8 Retos que nos plantea la realidad
              </h2>
              <p className="text-xs text-slate-500">
                Referentes del PEPSAL Ciclo 26-27 vinculables desde cada Carta Descriptiva
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-slate-500 transition-transform ${
              showRetos ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showRetos && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            {PEPSAL_RETOS.map((reto) => (
              <div
                key={reto.id}
                className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-2"
              >
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-black ${reto.accent}`}
                >
                  Reto {reto.number}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {reto.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{reto.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Propósito de cierre */}
      <div className="rounded-3xl bg-pastoral-deep text-white p-6 flex items-start gap-3 shadow-card">
        <Sparkles className="h-5 w-5 text-pastoral-gold shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
          {PEPSAL_META.closingPurpose}
        </p>
      </div>
    </div>
  );
}
