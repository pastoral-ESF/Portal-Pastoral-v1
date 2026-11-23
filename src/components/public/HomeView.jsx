import React from 'react';
import {
  Sparkles,
  Calendar,
  Users,
  BookOpen,
  PlayCircle,
  HeartHandshake,
  Sun,
  ExternalLink,
  Megaphone,
  Pin,
  Trophy,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import {
  AGUINALDO_ACTUAL,
  DON_BOSCO_CONTEST_URL,
  PLANTEL_BADGE_STYLES,
} from '../../constants/config';

export function HomeView({ notices, upcomingPublicEvents, portalSettings, onNavigate }) {
  const contestUrl = portalSettings?.donBoscoContestUrl || DON_BOSCO_CONTEST_URL;
  const sortedNotices = [...(notices || [])].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b.date || '').localeCompare(a.date || '');
  });

  const quickLinks = [
    {
      id: 'calendario',
      title: 'Calendario Pastoral',
      desc: 'Retiros, misas y eventos públicos',
      icon: Calendar,
      color: 'bg-pastoral/10 text-pastoral',
    },
    {
      id: 'mjs',
      title: 'Directorio MJS',
      desc: 'Pandillas, ADS, Grumis y más',
      icon: Users,
      color: 'bg-pastoral-cyan/15 text-sky-700',
    },
    {
      id: 'sacramentos',
      title: 'Sacramentos',
      desc: 'Comuniones y Confirmaciones',
      icon: BookOpen,
      color: 'bg-pastoral-gold/20 text-amber-800',
    },
    {
      id: 'multimedia',
      title: 'Formación Multimedia',
      desc: 'Cápsulas y Podcasts Salesianos',
      icon: PlayCircle,
      color: 'bg-pastoral-red/10 text-pastoral-red',
    },
    {
      id: 'buzon',
      title: 'Buzón de Acompañamiento',
      desc: 'Escucha confidencial y cercanía',
      icon: HeartHandshake,
      color: 'bg-pastoral-lime/20 text-lime-800',
    },
    {
      id: 'vafeje',
      title: 'VAFEJE Verano',
      desc: 'Próximamente · Curso de Verano',
      icon: Sun,
      color: 'bg-amber-100 text-amber-700',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A235A] via-[#2B3890] to-[#3F4DAE] text-white p-6 sm:p-10 shadow-soft">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-pastoral-cyan/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-pastoral-gold/20 blur-3xl"
        />

        <div className="relative grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-3.5 py-1.5 text-xs font-bold text-pastoral-gold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Colegio ESFER Salesianos · Chihuahua</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1]">
              ¡Bienvenidos a la <span className="text-pastoral-gold">Pastoral ESFER</span>!
            </h1>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed max-w-2xl">
              Casa que acoge, parroquia que evangeliza, escuela que encamina hacia la vida y patio
              donde encontrarse como amigos. Acompañamos con alegría a estudiantes y familias de
              nuestros tres planteles: <strong className="text-white">Glandorff</strong>,{' '}
              <strong className="text-white">Kennedy</strong> y{' '}
              <strong className="text-white">Cordilleras</strong>.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('calendario')}
                className="inline-flex items-center gap-2 rounded-2xl bg-pastoral-gold hover:bg-amber-400 text-pastoral-deep font-extrabold text-sm px-5 py-3 shadow-md transition-all"
              >
                <Calendar className="h-4 w-4" />
                <span>Ver Calendario Pastoral</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('mjs')}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-sm px-5 py-3 transition-all"
              >
                <Users className="h-4 w-4" />
                <span>Conoce el MJS</span>
              </button>
            </div>
          </div>

          {/* Tarjeta destacada del Aguinaldo Salesiano */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-pastoral-cyan/25 border border-pastoral-cyan/40 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-cyan-100">
                  Aguinaldo Salesiano {AGUINALDO_ACTUAL.year}
                </span>
                <span className="text-xs font-semibold text-blue-200">Lema Anual</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                {AGUINALDO_ACTUAL.title}
              </h2>
              {AGUINALDO_ACTUAL.motto && (
                <p className="text-xs sm:text-sm font-bold text-pastoral-gold mt-1">
                  {AGUINALDO_ACTUAL.motto}
                </p>
              )}
              <p className="text-xs sm:text-sm text-blue-100/95 mt-2.5 leading-relaxed italic">
                “{AGUINALDO_ACTUAL.quote}”
              </p>
              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-semibold text-blue-200">
                <span>{AGUINALDO_ACTUAL.subtitle}</span>
                <span className="text-pastoral-gold">{AGUINALDO_ACTUAL.reference.split('·')[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Concurso Don Bosco 2027 */}
      <section className="rounded-3xl bg-gradient-to-r from-pastoral-red via-rose-600 to-amber-500 p-[2px] shadow-soft">
        <div className="rounded-[22px] bg-white px-5 py-5 sm:px-7 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pastoral-red to-pastoral-gold text-white flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-pastoral-red">
                <span>Convocatoria Especial</span>
                <span>•</span>
                <span>Rumbo a 2027</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                Concurso Don Bosco 2027
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Consulta las bases oficiales, categorías artísticas y culturales, cronograma y
                registro en el micrositio oficial del concurso.
              </p>
            </div>
          </div>
          <a
            href={contestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pastoral-red hover:bg-red-700 text-white font-extrabold text-sm px-5 py-3 shadow-sm transition-all shrink-0"
          >
            <span>Ir al Concurso Don Bosco 2027</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Explora la Pastoral ESFER
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Todo lo que necesitas para caminar en comunidad desde cualquier plantel.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className="group text-left rounded-2xl bg-white border border-slate-200/90 p-5 shadow-card hover:shadow-soft hover:border-pastoral/30 transition-all flex items-start gap-4"
              >
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-slate-900 group-hover:text-pastoral transition-colors">
                      {item.title}
                    </h3>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-pastoral group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Muro de Avisos Oficiales + Próximos eventos */}
      <section className="grid lg:grid-cols-12 gap-6">
        {/* Muro de avisos */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-pastoral text-white flex items-center justify-center">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Muro de Avisos Oficiales</h2>
                <p className="text-xs text-slate-500">
                  Comunicados vigentes de la Coordinación de Pastoral
                </p>
              </div>
            </div>
          </div>

          {sortedNotices.length === 0 ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">
              No hay avisos publicados por el momento.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedNotices.map((notice) => (
                <article
                  key={notice.id}
                  className={`rounded-2xl bg-white border p-5 shadow-card transition-all ${
                    notice.pinned
                      ? 'border-pastoral/30 ring-1 ring-pastoral/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {notice.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-pastoral text-white px-2.5 py-0.5 text-[11px] font-bold">
                        <Pin className="h-3 w-3" /> Destacado
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                        PLANTEL_BADGE_STYLES[notice.plantel] || PLANTEL_BADGE_STYLES.General
                      }`}
                    >
                      {notice.plantel}
                    </span>
                    {notice.tag && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[11px] font-semibold">
                        {notice.tag}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">{notice.date}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {notice.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{notice.body}</p>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Columna lateral: Próximos eventos públicos */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900">Próximos Eventos</h3>
              <button
                type="button"
                onClick={() => onNavigate('calendario')}
                className="text-xs font-bold text-pastoral hover:text-pastoral-light"
              >
                Ver todos
              </button>
            </div>
            <div className="space-y-3">
              {upcomingPublicEvents.slice(0, 4).map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-2xl bg-slate-50 border border-slate-200/70 p-3.5 hover:border-pastoral/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                    <span className="text-pastoral">{ev.date}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 ${
                        PLANTEL_BADGE_STYLES[ev.plantel] || PLANTEL_BADGE_STYLES.General
                      }`}
                    >
                      {ev.plantel}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-slate-900 mt-1 line-clamp-2">
                    {ev.title}
                  </div>
                  {ev.location && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  )}
                </div>
              ))}
              {upcomingPublicEvents.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">
                  Pronto publicaremos nuevas actividades.
                </p>
              )}
            </div>
          </div>

          {/* Resumen de los 3 planteles */}
          <div className="rounded-3xl bg-gradient-to-br from-pastoral-deep to-pastoral text-white p-5 shadow-card">
            <h3 className="font-extrabold text-base">Una sola familia en 3 planteles</h3>
            <p className="text-xs text-blue-100 mt-1.5 leading-relaxed">
              Compartimos un mismo corazón salesiano en Chihuahua, formando buenos cristianos y
              honestos ciudadanos.
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {['Glandorff', 'Kennedy', 'Cordilleras'].map((p) => (
                <div
                  key={p}
                  className="rounded-xl bg-white/10 border border-white/15 py-2 px-2 text-center text-xs font-bold"
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
