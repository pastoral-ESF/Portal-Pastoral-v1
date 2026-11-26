import React, { useState } from 'react';
import {
  FolderHeart,
  Plus,
  ExternalLink,
  BookOpen,
  Trash2,
  FileText,
  Lock,
  Sparkles,
} from 'lucide-react';
import {
  MJS_REPO_GROUPS,
  ROLES,
  isFullAdminRole,
  isPastoralTeamRole,
} from '../../constants/config';
import { Modal } from '../common/Modal';

const PASTORAL_REPO_GROUPS = [
  'Todos',
  'Subsidios Litúrgicos',
  'Retiros y Campamentos',
  'Catequesis y Sacramentos',
  'Buenos Días / Reflexiones',
  'Formación Docente',
  'Familias',
  'PEPSAL / Documentos',
];

const MJS_RESOURCE_TYPES = ['Itinerario', 'Tema', 'Dinámica', 'Oración'];
const PASTORAL_RESOURCE_TYPES = [
  'Subsidio',
  'Liturgia / Misa',
  'Guía / PDF',
  'Presentación',
  'Tema',
  'Oración',
  'Dinámica',
];

const TYPE_BADGES = {
  Itinerario: 'bg-pastoral/10 text-pastoral',
  Tema: 'bg-pastoral-cyan/15 text-sky-800',
  Dinámica: 'bg-pastoral-lime/20 text-lime-900',
  Oración: 'bg-pastoral-gold/25 text-amber-900',
  Subsidio: 'bg-pastoral/15 text-pastoral-deep',
  'Liturgia / Misa': 'bg-purple-100 text-purple-900',
  'Guía / PDF': 'bg-emerald-100 text-emerald-900',
  Presentación: 'bg-amber-100 text-amber-900',
};

function createBlankResource(area = 'mjs') {
  return {
    area,
    title: '',
    group: area === 'pastoral' ? 'Subsidios Litúrgicos' : 'Pandillas',
    type: area === 'pastoral' ? 'Subsidio' : 'Dinámica',
    description: '',
    url: '',
    content: '',
    author: '',
  };
}

export function MjsRepositoryView({ resources, role, onAddResource, onDeleteResource }) {
  const isPastoralTeam = isPastoralTeamRole(role);
  const [activeRepo, setActiveRepo] = useState(isPastoralTeam ? 'pastoral' : 'mjs'); // 'pastoral' | 'mjs'
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [addOpen, setAddOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState(() => createBlankResource(isPastoralTeam ? 'pastoral' : 'mjs'));

  // Seguridad por rol: Animadores MJS nunca ven recursos del área "pastoral"
  const effectiveRepo = isPastoralTeam ? activeRepo : 'mjs';
  const groupChoices = effectiveRepo === 'pastoral' ? PASTORAL_REPO_GROUPS : MJS_REPO_GROUPS;
  const typeChoices = effectiveRepo === 'pastoral' ? PASTORAL_RESOURCE_TYPES : MJS_RESOURCE_TYPES;

  const pastoralCount = resources.filter((r) => r.area === 'pastoral').length;
  const mjsCount = resources.filter((r) => (r.area || 'mjs') === 'mjs').length;

  const filtered = resources
    .filter((r) => {
      const area = r.area || 'mjs';
      if (!isPastoralTeam && area === 'pastoral') return false;
      return area === effectiveRepo;
    })
    .filter((r) => (selectedGroup === 'Todos' ? true : r.group === selectedGroup));

  const switchRepo = (repo) => {
    setActiveRepo(repo);
    setSelectedGroup('Todos');
  };

  const openAddModal = () => {
    setForm(createBlankResource(effectiveRepo));
    setAddOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAddResource({
      ...form,
      area: isPastoralTeam ? form.area || effectiveRepo : 'mjs',
      author:
        form.author.trim() ||
        (role === ROLES.ANIMADOR ? 'Animador MJS' : 'Equipo de Pastoral'),
    });
    setForm(createBlankResource(effectiveRepo));
    setAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
              effectiveRepo === 'pastoral'
                ? 'bg-pastoral/10 text-pastoral'
                : 'bg-pastoral-cyan/15 text-sky-800'
            }`}
          >
            {effectiveRepo === 'pastoral' ? (
              <>
                <Lock className="h-3.5 w-3.5" />
                Uso Interno · Solo Equipo de Pastoral
              </>
            ) : (
              <>
                <FolderHeart className="h-3.5 w-3.5" />
                Biblioteca de Animación Juvenil
              </>
            )}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {effectiveRepo === 'pastoral'
              ? 'Repositorio y Subsidios de Pastoral'
              : 'Repositorio MJS (Animadores y Pastoral)'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {effectiveRepo === 'pastoral'
              ? 'Subsidios litúrgicos, guías de retiros, Buenos Días y documentos internos compartidos exclusivamente para el equipo de Pastoral.'
              : 'Itinerarios, temas, dinámicas y oraciones compartidas para los grupos de Glandorff, Kennedy y Cordilleras.'}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-sm px-5 py-3 shadow-sm transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>
            {effectiveRepo === 'pastoral' ? 'Agregar Subsidio Pastoral' : 'Agregar Recurso MJS'}
          </span>
        </button>
      </div>

      {/* Selector de Repositorio (solo visible para Equipo de Pastoral; oculto para Animadores) */}
      {isPastoralTeam && (
        <div className="inline-flex flex-wrap bg-white border border-slate-200 rounded-2xl p-1 shadow-card gap-1">
          <button
            type="button"
            onClick={() => switchRepo('pastoral')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              effectiveRepo === 'pastoral'
                ? 'bg-pastoral text-white shadow-sm'
                : 'text-slate-600 hover:text-pastoral'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Subsidios de Pastoral ({pastoralCount})</span>
          </button>
          <button
            type="button"
            onClick={() => switchRepo('mjs')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              effectiveRepo === 'mjs'
                ? 'bg-pastoral text-white shadow-sm'
                : 'text-slate-600 hover:text-pastoral'
            }`}
          >
            <FolderHeart className="h-3.5 w-3.5" />
            <span>Repositorio MJS ({mjsCount})</span>
          </button>
        </div>
      )}

      {/* Filtros por categoría / grupo */}
      <div className="flex flex-wrap gap-2">
        {groupChoices.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setSelectedGroup(group)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
              selectedGroup === group
                ? 'bg-pastoral text-white border-pastoral shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-pastoral/40'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Tarjetas de recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((res) => (
          <article
            key={res.id}
            className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card flex flex-col justify-between gap-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                    TYPE_BADGES[res.type] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {res.type}
                </span>
                <span className="text-[11px] font-bold text-slate-400">{res.group}</span>
              </div>

              <h2 className="text-base font-extrabold text-slate-900 leading-snug">{res.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {res.description}
              </p>
              <div className="text-[11px] text-slate-400 pt-1">
                Compartido por <strong className="text-slate-600">{res.author}</strong> ·{' '}
                {res.createdAt}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewing(res)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3 py-1.5 text-xs font-bold transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Abrir
                </button>
                {res.url && (
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 hover:border-pastoral/40 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-pastoral"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Drive/PDF
                  </a>
                )}
              </div>

              {isFullAdminRole(role) && (
                <button
                  type="button"
                  onClick={() => onDeleteResource(res.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Eliminar recurso"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-3xl bg-white border border-slate-200 p-10 text-center text-sm text-slate-500">
            No hay recursos registrados para este grupo todavía. ¡Sé el primero en compartir uno!
          </div>
        )}
      </div>

      {/* Modal Ver Recurso */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.title || ''}
        subtitle={viewing ? `${viewing.group} · ${viewing.type} · Por ${viewing.author}` : ''}
      >
        {viewing && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">{viewing.description}</p>
            {viewing.content && (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-pastoral uppercase">
                  <FileText className="h-4 w-4" />
                  <span>Guía / Desarrollo</span>
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                  {viewing.content}
                </p>
              </div>
            )}
            {viewing.url && (
              <a
                href={viewing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-xs sm:text-sm px-5 py-3 shadow-sm"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Abrir enlace externo (Drive / PDF)</span>
              </a>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Agregar Recurso */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={
          effectiveRepo === 'pastoral'
            ? 'Agregar Subsidio al Repositorio de Pastoral'
            : 'Agregar Recurso al Repositorio MJS'
        }
        subtitle={
          effectiveRepo === 'pastoral'
            ? 'Visible únicamente para el equipo de Pastoral (SDB, Coordinación y Agentes).'
            : 'Comparte un itinerario, tema, dinámica u oración con los demás animadores.'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Título del recurso *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={
                effectiveRepo === 'pastoral'
                  ? 'Ej. Subsidio de Cuaresma y Miércoles de Ceniza'
                  : 'Ej. Dinámica de integración «Amigos de Don Bosco»'
              }
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                {effectiveRepo === 'pastoral' ? 'Categoría Pastoral' : 'Grupo MJS'}
              </label>
              <select
                value={form.group}
                onChange={(e) => setForm({ ...form, group: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white"
              >
                {groupChoices
                  .filter((g) => g !== 'Todos')
                  .map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Tipo de material
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white"
              >
                {typeChoices.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Descripción breve *
            </label>
            <input
              type="text"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Objetivo o edades sugeridas"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Enlace a Google Drive / PDF (opcional)
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Contenido / Desarrollo en texto (opcional)
            </label>
            <textarea
              rows={3}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Escribe los pasos de la dinámica, oración o puntos clave..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Autor / Plantel
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Ej. Animadores ADS Kennedy"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral hover:bg-pastoral-deep text-white px-5 py-2.5 text-xs font-extrabold shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Guardar Recurso
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
