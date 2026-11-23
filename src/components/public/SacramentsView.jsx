import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  CalendarDays,
  HelpCircle,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export function SacramentsView({ sacraments = [] }) {
  const [selectedId, setSelectedId] = useState(sacraments[0]?.id || '');
  const [openFaqKey, setOpenFaqKey] = useState(sacraments[0] ? `${sacraments[0].id}-0` : null);

  const activeSacrament =
    sacraments.find((s) => s.id === selectedId) || sacraments[0];

  if (!activeSacrament) return null;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pastoral-gold/20 text-amber-900 px-3 py-1 text-xs font-extrabold">
          <BookOpen className="h-3.5 w-3.5" />
          Guía Pastoral · Estilo Wiki
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          Sacramentos y Avisos Catequéticos
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Consulta requisitos, fechas importantes y preguntas frecuentes para acompañar a tus hijos
          en su camino de fe.
        </p>
      </div>

      {/* Selector de Sacramento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sacraments.map((sac) => {
          const isActive = sac.id === activeSacrament.id;
          return (
            <button
              key={sac.id}
              type="button"
              onClick={() => {
                setSelectedId(sac.id);
                setOpenFaqKey(`${sac.id}-0`);
              }}
              className={`text-left rounded-3xl p-5 border transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-pastoral-deep to-pastoral text-white border-pastoral shadow-soft'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-pastoral/40 shadow-card'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/15 text-pastoral-gold'
                      : 'bg-pastoral/10 text-pastoral'
                  }`}
                >
                  Sacramento de Iniciación
                </span>
                <Sparkles
                  className={`h-4 w-4 ${isActive ? 'text-pastoral-gold' : 'text-slate-300'}`}
                />
              </div>
              <h2 className="text-xl font-black mt-2">{sac.title}</h2>
              <p className={`text-xs sm:text-sm mt-1 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                {sac.subtitle}
              </p>
              <div
                className={`text-xs font-semibold mt-3 pt-3 border-t ${
                  isActive
                    ? 'border-white/15 text-cyan-200'
                    : 'border-slate-100 text-slate-600'
                }`}
              >
                Dirigido a: {sac.target}
              </div>
            </button>
          );
        })}
      </div>

      {/* Contenido Wiki en Bloques */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Bloque Requisitos */}
        <section className="lg:col-span-6 rounded-3xl bg-white border border-slate-200 p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-pastoral-lime/20 text-lime-800 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Requisitos</h3>
              <p className="text-xs text-slate-500">Documentación y compromisos de preparación</p>
            </div>
          </div>
          {activeSacrament.requirements.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-6 text-center text-xs sm:text-sm text-slate-500">
              Los requisitos oficiales para este ciclo se publicarán próximamente por el
              Departamento de Pastoral.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {activeSacrament.requirements.map((req, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-200/70 p-3.5 text-sm text-slate-700"
                >
                  <span className="h-5 w-5 rounded-full bg-pastoral text-white text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Bloque Fechas importantes */}
        <section className="lg:col-span-6 rounded-3xl bg-white border border-slate-200 p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-pastoral-cyan/15 text-sky-700 flex items-center justify-center">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Fechas Importantes</h3>
              <p className="text-xs text-slate-500">Pláticas, entregas, retiros y celebraciones</p>
            </div>
          </div>
          {activeSacrament.dates.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-6 text-center text-xs sm:text-sm text-slate-500">
              Las fechas de entrega de papelería, pláticas, retiros y celebraciones se publicarán
              próximamente.
            </div>
          ) : (
            <div className="space-y-3">
              {activeSacrament.dates.map((item, idx) => (
                <div
                  key={idx}
                  className="relative pl-4 border-l-4 border-pastoral-cyan rounded-r-2xl bg-slate-50/80 p-4"
                >
                  <div className="text-xs font-extrabold text-pastoral uppercase tracking-wide">
                    {item.date}
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                    {item.label}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">{item.detail}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Acordeón de Preguntas Frecuentes (FAQ) */}
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-pastoral/10 text-pastoral flex items-center justify-center">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Preguntas Frecuentes — {activeSacrament.title}
            </h3>
            <p className="text-xs text-slate-500">Dudas comunes de familias y padrinos</p>
          </div>
        </div>

        {activeSacrament.faqs.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-6 text-center text-xs sm:text-sm text-slate-500">
            Próximamente agregaremos las preguntas frecuentes de {activeSacrament.title}.
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeSacrament.faqs.map((faq, idx) => {
              const key = `${activeSacrament.id}-${idx}`;
              const isOpen = openFaqKey === key;
              return (
                <div
                  key={key}
                  className={`rounded-2xl border transition-all ${
                    isOpen ? 'border-pastoral/30 bg-pastoral/[0.02]' : 'border-slate-200 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqKey(isOpen ? null : key)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-bold text-sm sm:text-base text-slate-900">{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-pastoral shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
