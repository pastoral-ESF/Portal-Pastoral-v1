import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Users,
  BookOpen,
  PlayCircle,
  Sun,
  Save,
  Plus,
  Trash2,
  Phone,
} from 'lucide-react';

const SUBTABS = [
  { id: 'mjs', label: 'Grupos MJS & WhatsApp', icon: Users },
  { id: 'sacramentos', label: 'Sacramentos', icon: BookOpen },
  { id: 'multimedia', label: 'Multimedia', icon: PlayCircle },
  { id: 'general', label: 'General & VAFEJE', icon: Sun },
];

export function PortalContentEditorView({
  portalSettings,
  mjsGroups,
  sacraments,
  multimedia,
  onSavePortalSettings,
  onSaveMjsGroups,
  onSaveSacraments,
  onSaveMultimedia,
}) {
  const [subTab, setSubTab] = useState('mjs');

  // Local editable drafts synced with props
  const [settingsDraft, setSettingsDraft] = useState(portalSettings);
  const [groupsDraft, setGroupsDraft] = useState(mjsGroups);
  const [sacramentsDraft, setSacramentsDraft] = useState(sacraments);
  const [selectedSacId, setSelectedSacId] = useState(sacraments[0]?.id || 'primera-comunion');
  const [multimediaDraft, setMultimediaDraft] = useState(multimedia);

  useEffect(() => setSettingsDraft(portalSettings), [portalSettings]);
  useEffect(() => setGroupsDraft(mjsGroups), [mjsGroups]);
  useEffect(() => setSacramentsDraft(sacraments), [sacraments]);
  useEffect(() => setMultimediaDraft(multimedia), [multimedia]);

  // --- Handlers Grupos MJS ---
  const updateGroup = (idx, field, value) => {
    setGroupsDraft((prev) => prev.map((g, i) => (i === idx ? { ...g, [field]: value } : g)));
  };

  const addGroup = () => {
    setGroupsDraft((prev) => [
      ...prev,
      {
        id: `mjs-custom-${Date.now()}`,
        plantel: 'Glandorff',
        name: 'Nuevo Grupo MJS',
        audience: 'Primaria / Secundaria',
        schedule: 'Viernes de 3:00 a 4:30 pm',
        extraNote: '',
        coordinatorName: 'Nombre del coordinador(a)',
        whatsappPhone: settingsDraft.whatsappPhone || '526140000000',
        animators: 'Equipo de Pastoral',
        description: 'Descripción breve del grupo salesiano.',
        accent: 'from-pastoral to-pastoral-cyan',
        badgeColor: 'bg-pastoral/10 text-pastoral',
      },
    ]);
  };

  const removeGroup = (idx) => {
    setGroupsDraft((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveMjsAll = () => {
    onSavePortalSettings(settingsDraft);
    onSaveMjsGroups(groupsDraft);
  };

  // --- Handlers Sacramentos ---
  const activeSacIndex = Math.max(
    0,
    sacramentsDraft.findIndex((s) => s.id === selectedSacId)
  );
  const activeSac = sacramentsDraft[activeSacIndex];

  const updateActiveSac = (updater) => {
    setSacramentsDraft((prev) =>
      prev.map((s, idx) => (idx === activeSacIndex ? updater(s) : s))
    );
  };

  // --- Handlers Multimedia ---
  const updateMediaItem = (kind, idx, field, value) => {
    setMultimediaDraft((prev) => ({
      ...prev,
      [kind]: prev[kind].map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));
  };

  const addMediaItem = (kind) => {
    const isVideo = kind === 'videos';
    const newItem = {
      id: `${kind}-${Date.now()}`,
      title: isVideo ? 'Nueva Cápsula Salesiana' : 'Nuevo Episodio de Podcast',
      duration: isVideo ? '05:00' : '15:00',
      topic: 'Carisma Salesiano',
      speaker: 'Equipo Pastoral ESFER',
      summary: 'Descripción breve del contenido formativo.',
      gradient: isVideo
        ? 'from-pastoral-deep via-pastoral to-pastoral-cyan'
        : 'from-emerald-600 to-teal-800',
    };
    setMultimediaDraft((prev) => ({ ...prev, [kind]: [newItem, ...prev[kind]] }));
  };

  const removeMediaItem = (kind, idx) => {
    setMultimediaDraft((prev) => ({
      ...prev,
      [kind]: prev[kind].filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pastoral/10 text-pastoral px-3 py-1 text-xs font-extrabold">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Gestor de Contenidos (CMS)
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          Editor del Portal Público
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Actualiza en tiempo real horarios MJS, números de WhatsApp, requisitos y fechas de
          Sacramentos, multimedia y textos de VAFEJE.
        </p>
      </div>

      {/* Subpestañas */}
      <div className="flex flex-wrap gap-2">
        {SUBTABS.map((t) => {
          const Icon = t.icon;
          const isActive = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold border transition-all ${
                isActive
                  ? 'bg-pastoral text-white border-pastoral shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-pastoral/40'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. GRUPOS MJS & WHATSAPP */}
      {subTab === 'mjs' && (
        <div className="space-y-5">
          {/* WhatsApp General */}
          <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    WhatsApp de Respaldo (General)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Cada grupo abajo tiene su propio coordinador y número de WhatsApp. Este número
                    solo se usa como respaldo si algún grupo queda vacío.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveMjsAll}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 shadow-sm shrink-0"
              >
                <Save className="h-4 w-4" />
                <span>Guardar Cambios MJS</span>
              </button>
            </div>

            <div className="max-w-md">
              <input
                type="text"
                value={settingsDraft.whatsappPhone || ''}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, whatsappPhone: e.target.value })
                }
                placeholder="526140000000"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-pastoral"
              />
            </div>
          </section>

          {/* Lista editable de grupos */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">
              Grupos y Horarios ({groupsDraft.length})
            </h2>
            <button
              type="button"
              onClick={addGroup}
              className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3.5 py-2 text-xs font-extrabold transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Grupo</span>
            </button>
          </div>

          <div className="space-y-4">
            {groupsDraft.map((g, idx) => (
              <div
                key={g.id}
                className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card space-y-3"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-pastoral">
                    Grupo #{idx + 1} · {g.plantel}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeGroup(idx)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                      Nombre del grupo
                    </label>
                    <input
                      type="text"
                      value={g.name}
                      onChange={(e) => updateGroup(idx, 'name', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                      Plantel
                    </label>
                    <select
                      value={g.plantel}
                      onChange={(e) => updateGroup(idx, 'plantel', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                      <option value="Glandorff">Glandorff</option>
                      <option value="Kennedy">Kennedy</option>
                      <option value="Cordilleras">Cordilleras</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                      Grados / Público
                    </label>
                    <input
                      type="text"
                      value={g.audience}
                      onChange={(e) => updateGroup(idx, 'audience', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  {/* Bloque destacado: Coordinador y WhatsApp propio del grupo */}
                  <div className="md:col-span-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-emerald-900 uppercase mb-1">
                        Coordinador(a) del grupo
                      </label>
                      <input
                        type="text"
                        value={g.coordinatorName || ''}
                        onChange={(e) => updateGroup(idx, 'coordinatorName', e.target.value)}
                        placeholder="Ej. Prof. Diego Armendáriz"
                        className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-emerald-900 uppercase mb-1">
                        Teléfono WhatsApp del coordinador (sin + ni espacios)
                      </label>
                      <input
                        type="text"
                        value={g.whatsappPhone || ''}
                        onChange={(e) => updateGroup(idx, 'whatsappPhone', e.target.value)}
                        placeholder="Ej. 526141234567"
                        className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                      Horario
                    </label>
                    <input
                      type="text"
                      value={g.schedule}
                      onChange={(e) => updateGroup(idx, 'schedule', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                      Nota adicional de horario
                    </label>
                    <input
                      type="text"
                      value={g.extraNote || ''}
                      onChange={(e) => updateGroup(idx, 'extraNote', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                      Animadores / Asesores
                    </label>
                    <input
                      type="text"
                      value={g.animators || ''}
                      onChange={(e) => updateGroup(idx, 'animators', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={g.description || ''}
                      onChange={(e) => updateGroup(idx, 'description', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SACRAMENTOS */}
      {subTab === 'sacramentos' && activeSac && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {sacramentsDraft.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSacId(s.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-extrabold border transition-all ${
                    s.id === activeSac.id
                      ? 'bg-pastoral-deep text-white border-pastoral-deep'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-pastoral/40'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onSaveSacraments(sacramentsDraft)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span>Guardar Cambios en Sacramentos</span>
            </button>
          </div>

          {/* Datos generales del sacramento */}
          <section className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                Título
              </label>
              <input
                type="text"
                value={activeSac.title}
                onChange={(e) => updateActiveSac((s) => ({ ...s, title: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                Subtítulo
              </label>
              <input
                type="text"
                value={activeSac.subtitle}
                onChange={(e) => updateActiveSac((s) => ({ ...s, subtitle: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                Dirigido a
              </label>
              <input
                type="text"
                value={activeSac.target}
                onChange={(e) => updateActiveSac((s) => ({ ...s, target: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </section>

          {/* Requisitos */}
          <section className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                Requisitos ({activeSac.requirements.length})
              </h3>
              <button
                type="button"
                onClick={() =>
                  updateActiveSac((s) => ({
                    ...s,
                    requirements: [...s.requirements, 'Nuevo requisito...'],
                  }))
                }
                className="inline-flex items-center gap-1 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3 py-1.5 text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar requisito
              </button>
            </div>
            <div className="space-y-2">
              {activeSac.requirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-400 w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    value={req}
                    onChange={(e) =>
                      updateActiveSac((s) => ({
                        ...s,
                        requirements: s.requirements.map((r, i) =>
                          i === idx ? e.target.value : r
                        ),
                      }))
                    }
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateActiveSac((s) => ({
                        ...s,
                        requirements: s.requirements.filter((_, i) => i !== idx),
                      }))
                    }
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Fechas Importantes */}
          <section className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                Fechas Importantes ({activeSac.dates.length})
              </h3>
              <button
                type="button"
                onClick={() =>
                  updateActiveSac((s) => ({
                    ...s,
                    dates: [
                      ...s.dates,
                      { label: 'Nueva fecha', date: 'Por definir', detail: '' },
                    ],
                  }))
                }
                className="inline-flex items-center gap-1 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3 py-1.5 text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar fecha
              </button>
            </div>
            <div className="space-y-3">
              {activeSac.dates.map((d, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-50 border border-slate-200 p-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
                >
                  <input
                    type="text"
                    value={d.label}
                    onChange={(e) =>
                      updateActiveSac((s) => ({
                        ...s,
                        dates: s.dates.map((item, i) =>
                          i === idx ? { ...item, label: e.target.value } : item
                        ),
                      }))
                    }
                    placeholder="Actividad / Etapa"
                    className="md:col-span-3 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={d.date}
                    onChange={(e) =>
                      updateActiveSac((s) => ({
                        ...s,
                        dates: s.dates.map((item, i) =>
                          i === idx ? { ...item, date: e.target.value } : item
                        ),
                      }))
                    }
                    placeholder="Fecha y hora"
                    className="md:col-span-4 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    value={d.detail}
                    onChange={(e) =>
                      updateActiveSac((s) => ({
                        ...s,
                        dates: s.dates.map((item, i) =>
                          i === idx ? { ...item, detail: e.target.value } : item
                        ),
                      }))
                    }
                    placeholder="Detalle / Lugar"
                    className="md:col-span-4 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                  <div className="md:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        updateActiveSac((s) => ({
                          ...s,
                          dates: s.dates.filter((_, i) => i !== idx),
                        }))
                      }
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Preguntas Frecuentes */}
          <section className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                Preguntas Frecuentes ({activeSac.faqs.length})
              </h3>
              <button
                type="button"
                onClick={() =>
                  updateActiveSac((s) => ({
                    ...s,
                    faqs: [...s.faqs, { q: 'Nueva pregunta', a: 'Respuesta...' }],
                  }))
                }
                className="inline-flex items-center gap-1 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3 py-1.5 text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar FAQ
              </button>
            </div>
            <div className="space-y-3">
              {activeSac.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-50 border border-slate-200 p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={faq.q}
                      onChange={(e) =>
                        updateActiveSac((s) => ({
                          ...s,
                          faqs: s.faqs.map((f, i) =>
                            i === idx ? { ...f, q: e.target.value } : f
                          ),
                        }))
                      }
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateActiveSac((s) => ({
                          ...s,
                          faqs: s.faqs.filter((_, i) => i !== idx),
                        }))
                      }
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={faq.a}
                    onChange={(e) =>
                      updateActiveSac((s) => ({
                        ...s,
                        faqs: s.faqs.map((f, i) =>
                          i === idx ? { ...f, a: e.target.value } : f
                        ),
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 3. MULTIMEDIA */}
      {subTab === 'multimedia' && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onSaveMultimedia(multimediaDraft)}
              className="inline-flex items-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span>Guardar Multimedia</span>
            </button>
          </div>

          {(['videos', 'podcasts']).map((kind) => (
            <section
              key={kind}
              className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900">
                  {kind === 'videos' ? 'Cápsulas de Salesianidad (Videos)' : 'Podcasts'} (
                  {(multimediaDraft[kind] || []).length})
                </h3>
                <button
                  type="button"
                  onClick={() => addMediaItem(kind)}
                  className="inline-flex items-center gap-1 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3 py-1.5 text-xs font-bold"
                >
                  <Plus className="h-3.5 w-3.5" /> Agregar
                </button>
              </div>
              <div className="space-y-3">
                {(multimediaDraft[kind] || []).map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 grid grid-cols-1 md:grid-cols-12 gap-2.5"
                  >
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateMediaItem(kind, idx, 'title', e.target.value)}
                      placeholder="Título"
                      className="md:col-span-5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={item.topic}
                      onChange={(e) => updateMediaItem(kind, idx, 'topic', e.target.value)}
                      placeholder="Tema"
                      className="md:col-span-3 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => updateMediaItem(kind, idx, 'duration', e.target.value)}
                      placeholder="06:30"
                      className="md:col-span-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                    />
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeMediaItem(kind, idx)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.speaker || ''}
                      onChange={(e) => updateMediaItem(kind, idx, 'speaker', e.target.value)}
                      placeholder="Ponente / Responsable"
                      className="md:col-span-4 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={item.summary || ''}
                      onChange={(e) => updateMediaItem(kind, idx, 'summary', e.target.value)}
                      placeholder="Sinopsis breve"
                      className="md:col-span-8 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* 4. GENERAL & VAFEJE */}
      {subTab === 'general' && (
        <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-card space-y-4 max-w-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900">
              Enlaces Institucionales y Sección VAFEJE
            </h2>
            <button
              type="button"
              onClick={() => onSavePortalSettings(settingsDraft)}
              className="inline-flex items-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-xs px-4 py-2.5 shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Enlace externo · Concurso Don Bosco 2027
              </label>
              <input
                type="url"
                value={settingsDraft.donBoscoContestUrl || ''}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, donBoscoContestUrl: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                VAFEJE · Etiqueta superior (ej. Próximamente / Inscripciones Abiertas)
              </label>
              <input
                type="text"
                value={settingsDraft.vafejeBadge || ''}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, vafejeBadge: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                VAFEJE · Subtítulo
              </label>
              <input
                type="text"
                value={settingsDraft.vafejeSubtitle || ''}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, vafejeSubtitle: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                VAFEJE · Descripción
              </label>
              <textarea
                rows={3}
                value={settingsDraft.vafejeDescription || ''}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, vafejeDescription: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                VAFEJE · Aviso de estado / Fechas
              </label>
              <input
                type="text"
                value={settingsDraft.vafejeStatusNote || ''}
                onChange={(e) =>
                  setSettingsDraft({ ...settingsDraft, vafejeStatusNote: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
