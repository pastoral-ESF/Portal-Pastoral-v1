import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Headphones,
  Film,
  Clock,
  Sparkles,
  Volume2,
  User,
} from 'lucide-react';
import { Modal } from '../common/Modal';

export function MultimediaView({ multimedia = { videos: [], podcasts: [] } }) {
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' | 'podcasts'
  const [activeItem, setActiveItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    if (!activeItem || !isPlaying) return undefined;
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1.5));
    }, 600);
    return () => clearInterval(timer);
  }, [activeItem, isPlaying]);

  const openPlayer = (item, kind) => {
    setActiveItem({ ...item, kind });
    setProgress(12);
    setIsPlaying(true);
  };

  const closePlayer = () => {
    setIsPlaying(false);
    setActiveItem(null);
  };

  const videos = multimedia.videos || [];
  const podcasts = multimedia.podcasts || [];
  const hasAnyContent = videos.length > 0 || podcasts.length > 0;
  const items = activeTab === 'videos' ? videos : podcasts;

  if (!hasAnyContent) {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-pastoral-deep to-pastoral text-white p-8 sm:p-12 shadow-soft">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-16 h-72 w-72 rounded-full bg-pastoral-cyan/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-pastoral-gold/20 blur-3xl"
          />
          <div className="relative max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-pastoral-gold text-pastoral-deep px-4 py-1.5 text-xs font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Próximamente
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Formación Multimedia · Pastoral ESFER
            </h1>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Muy pronto encontrarás aquí nuestras <strong>Cápsulas de Salesianidad (Videos)</strong>{' '}
              y <strong>Podcasts</strong> creados para jóvenes, docentes y padres de familia de
              Glandorff, Kennedy y Cordilleras.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-bold">
                <Film className="h-4 w-4 text-pastoral-cyan" />
                <span>Cápsulas de Salesianidad</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-bold">
                <Headphones className="h-4 w-4 text-pastoral-gold" />
                <span>Podcasts Salesianos</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Netflix Pastoral */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-pastoral-deep to-pastoral text-white p-6 sm:p-8 shadow-soft">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-pastoral-cyan/25 blur-3xl"
        />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-bold text-pastoral-gold">
              <Sparkles className="h-3.5 w-3.5" />
              Formación Multimedia · «Netflix Pastoral»
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-3">
              Cápsulas de Salesianidad y Podcasts
            </h1>
            <p className="text-sm text-blue-100 mt-1.5 max-w-2xl">
              Contenido breve, cercano y formativo para jóvenes, educadores y padres de familia de
              nuestra comunidad ESFER.
            </p>
          </div>

          <div className="inline-flex bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/15 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('videos')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'videos'
                  ? 'bg-white text-pastoral-deep shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Film className="h-4 w-4" />
              <span>Cápsulas (Videos)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('podcasts')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'podcasts'
                  ? 'bg-white text-pastoral-deep shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Headphones className="h-4 w-4" />
              <span>Podcasts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cuadrícula multimedia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
        {items.map((item) => {
          const isVideo = activeTab === 'videos';
          return (
            <article
              key={item.id}
              onClick={() => openPlayer(item, isVideo ? 'video' : 'podcast')}
              className="group cursor-pointer rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-card hover:shadow-soft hover:border-pastoral/30 transition-all flex flex-col"
            >
              {/* Miniatura visual */}
              <div
                className={`relative h-44 sm:h-48 bg-gradient-to-br ${item.gradient} p-5 flex flex-col justify-between text-white`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full bg-black/30 backdrop-blur-sm px-3 py-1 text-[11px] font-bold">
                    {item.topic}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/35 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold">
                    <Clock className="h-3 w-3 text-pastoral-gold" />
                    {item.duration}
                  </span>
                </div>

                {/* Botón central play */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-white/95 text-pastoral-deep flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    {isVideo ? (
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    ) : (
                      <Headphones className="h-6 w-6" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                  <User className="h-3.5 w-3.5" />
                  <span>{item.speaker}</span>
                </div>
              </div>

              {/* Cuerpo */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-pastoral transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {item.highlights && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                    {item.highlights.map((h) => (
                      <span
                        key={h}
                        className="rounded-lg bg-slate-100 text-slate-600 px-2.5 py-1 text-[11px] font-semibold"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Modal Reproductor Funcional (Placeholder interactivo) */}
      <Modal
        open={Boolean(activeItem)}
        onClose={closePlayer}
        title={activeItem?.title || ''}
        subtitle={
          activeItem
            ? `${activeItem.topic} · ${activeItem.speaker} · Duración ${activeItem.duration}`
            : ''
        }
        maxWidth="max-w-2xl"
      >
        {activeItem && (
          <div className="space-y-5">
            <div
              className={`relative rounded-2xl bg-gradient-to-br ${activeItem.gradient} text-white p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[220px]`}
            >
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-4">
                {activeItem.kind === 'video' ? (
                  <>
                    <Film className="h-3.5 w-3.5 text-pastoral-gold" />
                    <span>Reproductor de Cápsula (Vista Previa)</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-pastoral-gold" />
                    <span>Reproductor de Podcast Salesiano</span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="h-16 w-16 rounded-full bg-white text-pastoral-deep flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7 fill-current" />
                ) : (
                  <Play className="h-7 w-7 fill-current ml-0.5" />
                )}
              </button>

              <p className="text-xs text-white/85 mt-4 max-w-md">
                {isPlaying
                  ? 'Reproduciendo vista previa multimedia de Pastoral ESFER...'
                  : 'Reproducción en pausa · Presiona reproducir para continuar.'}
              </p>

              {/* Barra de progreso */}
              <div className="w-full mt-5 space-y-1.5">
                <div className="h-2 w-full rounded-full bg-white/25 overflow-hidden">
                  <div
                    className="h-full bg-pastoral-gold rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-white/80">
                  <span>{isPlaying ? 'En reproducción' : 'Pausado'}</span>
                  <span>{activeItem.duration}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed">
              <div className="text-xs font-extrabold uppercase tracking-wider text-pastoral mb-1">
                Sinopsis
              </div>
              {activeItem.summary}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
