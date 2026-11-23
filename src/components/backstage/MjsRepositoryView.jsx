import React, { useState } from 'react';
import {
  FolderHeart,
  Plus,
  ExternalLink,
  BookOpen,
  Trash2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { MJS_REPO_GROUPS, ROLES, isFullAdminRole } from '../../constants/config';
import { Modal } from '../common/Modal';

const RESOURCE_TYPES = ['Itinerario', 'Tema', 'Dinámica', 'Oración'];

const TYPE_BADGES = {
  Itinerario: 'bg-pastoral/10 text-pastoral',
  Tema: 'bg-pastoral-cyan/15 text-sky-800',
  Dinámica: 'bg-pastoral-lime/20 text-lime-900',
  Oración: 'bg-pastoral-gold/25 text-amber-900',
};

const BLANK_RESOURCE = {
  title: '',
  group: 'Pandillas',
  type: 'Dinámica',
  description: '',
  url: '',
  content: '',
  author: '',
};

export function MjsRepositoryView({ resources, role, onAddResource, onDeleteResource }) {
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [addOpen, setAddOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState(BLANK_RESOURCE);

  const filtered = resources.filter((r) =>
    selectedGroup === 'Todos' ? true : r.group === selectedGroup
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAddResource({
      ...form,
      author:
        form.author.trim() ||
        (role === ROLES.ANIMADOR ? 'Animador MJS' : 'Coordinación Pastoral'),
    });
    setForm(BLANK_RESOURCE);
    setAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pastoral-cyan/15 text-sky-800 px-3 py-1 text-xs font-extrabold">
            <FolderHeart className="h-3.5 w-3.5" />
            Biblioteca de Animación Juvenil
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Repositorio MJS (Animadores y Coordinación)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Itinerarios, temas, dinámicas y oraciones compartidas para los grupos de Glandorff,
            Kennedy y Cordilleras.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-sm px-5 py-3 shadow-sm transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Agregar Recurso</span>
        </button>
      </div>

      {/* Filtros por grupo */}
      <div className="flex flex-wrap gap-2">
        {MJS_REPO_GROUPS.map((group) => (
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
        title="Agregar Recurso al Repositorio MJS"
        subtitle="Comparte un itinerario, tema, dinámica u oración con los demás animadores."
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
              placeholder="Ej. Dinámica de integración «Amigos de Don Bosco»"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Grupo MJS
              </label>
              <select
                value={form.group}
                onChange={(e) => setForm({ ...form, group: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white"
              >
                {MJS_REPO_GROUPS.filter((g) => g !== 'Todos').map((g) => (
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
                {RESOURCE_TYPES.map((t) => (
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
