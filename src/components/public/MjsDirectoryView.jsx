import React, { useState } from 'react';
import { Users, Clock, GraduationCap, Sparkles, MessageCircle, Info, UserCheck } from 'lucide-react';
import { WHATSAPP_CONFIG, PLANTEL_BADGE_STYLES } from '../../constants/config';

const PLANTEL_FILTERS = ['Todos', 'Glandorff', 'Kennedy', 'Cordilleras'];

function buildWhatsappLink(phone, groupName, plantel, coordinatorName) {
  const cleanedPhone = String(phone || WHATSAPP_CONFIG.phone).replace(/[^\d]/g, '');
  const greeting = coordinatorName ? `¡Hola ${coordinatorName}!` : '¡Hola!';
  const message = `${greeting} Quisiera pedir informes sobre el grupo *${groupName}* del Movimiento Juvenil Salesiano (MJS) en el plantel *${plantel}* de ESFER Salesianos Chihuahua. ¡Gracias!`;
  return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
}

export function MjsDirectoryView({ groups = [], defaultWhatsappPhone }) {
  const [selectedPlantel, setSelectedPlantel] = useState('Todos');

  const filtered = groups.filter((g) =>
    selectedPlantel === 'Todos' ? true : g.plantel === selectedPlantel
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-pastoral-deep via-pastoral to-pastoral-cyan p-6 sm:p-8 text-white shadow-soft">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-pastoral-gold">
          <Users className="h-3.5 w-3.5" />
          <span>Movimiento Juvenil Salesiano (MJS)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black mt-3">
          Directorio de Grupos Juveniles y de Infancia
        </h1>
        <p className="text-sm sm:text-base text-blue-100 mt-1.5 max-w-2xl">
          Encuentra el grupo ideal según tu plantel y grado escolar. Vive tardes de patio,
          amistad, servicio y fe al estilo de Don Bosco.
        </p>
      </div>

      {/* Pestañas de plantel */}
      <div className="flex flex-wrap items-center gap-2">
        {PLANTEL_FILTERS.map((plantel) => (
          <button
            key={plantel}
            type="button"
            onClick={() => setSelectedPlantel(plantel)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold border transition-all ${
              selectedPlantel === plantel
                ? 'bg-pastoral text-white border-pastoral shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-pastoral/40 hover:text-pastoral'
            }`}
          >
            {plantel === 'Todos' ? 'Todos los Planteles' : `Plantel ${plantel}`}
          </button>
        ))}
      </div>

      {/* Tarjetas de grupos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((group) => (
          <article
            key={group.id}
            className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-card hover:shadow-soft transition-all flex flex-col"
          >
            <div className={`h-2.5 bg-gradient-to-r ${group.accent}`} />
            <div className="p-6 flex-1 flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${
                      PLANTEL_BADGE_STYLES[group.plantel]
                    }`}
                  >
                    Plantel {group.plantel}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${group.badgeColor}`}
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    {group.audience}
                  </span>
                </div>

                <h2 className="text-xl font-black text-slate-900">{group.name}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{group.description}</p>

                <div className="space-y-2 pt-2">
                  <div className="flex items-start gap-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 p-3">
                    <Clock className="h-4 w-4 text-pastoral shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <span className="font-extrabold text-slate-900 block">{group.schedule}</span>
                      {group.extraNote && (
                        <span className="text-slate-600 text-xs">{group.extraNote}</span>
                      )}
                    </div>
                  </div>
                  {group.coordinatorName && (
                    <div className="flex items-start gap-2.5 text-xs text-slate-700 px-1">
                      <UserCheck className="h-4 w-4 text-pastoral shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900">Coordinador(a):</strong>{' '}
                        {group.coordinatorName}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-2.5 text-xs text-slate-600 px-1">
                    <Sparkles className="h-4 w-4 text-pastoral-gold shrink-0 mt-0.5" />
                    <span>{group.animators}</span>
                  </div>
                </div>
              </div>

              <a
                href={buildWhatsappLink(
                  group.whatsappPhone || defaultWhatsappPhone,
                  group.name,
                  group.plantel,
                  group.coordinatorName
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-extrabold text-sm px-4 py-3 shadow-sm transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Pedir Informes por WhatsApp</span>
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* Nota informativa */}
      <div className="rounded-2xl bg-pastoral/5 border border-pastoral/15 p-4 flex items-start gap-3 text-xs sm:text-sm text-slate-700">
        <Info className="h-5 w-5 text-pastoral shrink-0 mt-0.5" />
        <p>
          La participación en los grupos del MJS es voluntaria y busca complementar la formación
          integral del estudiante. Para inscripciones o permisos de permanencia escolar, acércate
          a la oficina de Pastoral de tu plantel o escríbenos por WhatsApp.
        </p>
      </div>
    </div>
  );
}
