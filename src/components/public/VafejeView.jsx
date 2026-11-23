import React from 'react';
import { Sun, Sparkles, Compass, Music, Palette, Flame, CalendarClock } from 'lucide-react';

export function VafejeView({ portalSettings, onNavigate }) {
  const pillars = [
    {
      title: 'Juegos y Patio Salesiano',
      desc: 'Dinámicas por equipos, rallys, deporte y alegría al estilo del Oratorio de Don Bosco.',
      icon: Flame,
      color: 'bg-pastoral-red/10 text-pastoral-red',
    },
    {
      title: 'Talleres Creativos',
      desc: 'Arte, música, manualidades, expresión escénica y retos en equipo.',
      icon: Palette,
      color: 'bg-pastoral-cyan/15 text-sky-700',
    },
    {
      title: 'Amistad y Valores',
      desc: 'Acompañamiento cercano de nuestros jóvenes animadores MJS y equipo de Pastoral.',
      icon: Music,
      color: 'bg-pastoral-lime/20 text-lime-800',
    },
    {
      title: 'Verano Inolvidable',
      desc: 'Semanas temáticas llenas de sorpresas, excursiones y cierre familiar.',
      icon: Compass,
      color: 'bg-pastoral-gold/25 text-amber-800',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero vibrante Teaser */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pastoral-gold via-orange-500 to-pastoral-red text-white p-8 sm:p-12 shadow-soft">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-16 h-72 w-72 rounded-full bg-yellow-200/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-pastoral-deep/30 blur-3xl"
        />

        <div className="relative max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white text-pastoral-red px-4 py-1.5 text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>{portalSettings?.vafejeBadge || 'Próximamente · Edición Verano'}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
              <Sun className="h-8 w-8 text-yellow-200" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">VAFEJE</h1>
              <p className="text-sm sm:text-base font-bold text-amber-100">
                {portalSettings?.vafejeSubtitle ||
                  'Vacaciones Felices con Jesús · Curso de Verano Salesiano ESFER'}
              </p>
            </div>
          </div>

          <p className="text-sm sm:text-lg text-white/95 leading-relaxed">
            {portalSettings?.vafejeDescription ||
              '¡Estamos preparando un verano lleno de color, amistad, juegos gigantes y espíritu salesiano en Chihuahua! Muy pronto publicaremos fechas oficiales, sedes, edades e inscripciones.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/25 px-4 py-2.5 text-xs sm:text-sm font-bold">
              <CalendarClock className="h-4 w-4 text-yellow-200" />
              <span>
                {portalSettings?.vafejeStatusNote || 'Apertura de inscripciones próximamente'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 rounded-2xl bg-white text-pastoral-deep hover:bg-amber-50 font-extrabold text-xs sm:text-sm px-5 py-2.5 shadow-sm transition-all"
            >
              Ver avisos oficiales
            </button>
          </div>
        </div>
      </section>

      {/* Bloques informativos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card space-y-3"
            >
              <div
                className={`h-11 w-11 rounded-2xl flex items-center justify-center ${item.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-extrabold text-slate-900">{item.title}</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
