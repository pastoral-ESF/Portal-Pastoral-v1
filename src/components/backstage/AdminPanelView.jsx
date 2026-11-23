import React, { useState } from 'react';
import {
  Megaphone,
  Inbox,
  Plus,
  Trash2,
  Pin,
  CheckCircle2,
  Clock,
  Lock,
} from 'lucide-react';
import { PLANTELES, PLANTEL_BADGE_STYLES } from '../../constants/config';

const BLANK_NOTICE = {
  title: '',
  body: '',
  plantel: 'General',
  tag: 'Aviso',
  pinned: false,
};

export function AdminPanelView({
  notices,
  messages,
  restrictedPlantel,
  onAddNotice,
  onDeleteNotice,
  onToggleNoticePin,
  onToggleMessageStatus,
  onDeleteMessage,
}) {
  const [noticeForm, setNoticeForm] = useState({
    ...BLANK_NOTICE,
    plantel: restrictedPlantel || 'General',
  });
  const [activeSubTab, setActiveSubTab] = useState('avisos'); // 'avisos' | 'buzon'

  const handleNoticeSubmit = (e) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.body.trim()) return;
    onAddNotice({
      ...noticeForm,
      plantel: restrictedPlantel || noticeForm.plantel,
    });
    setNoticeForm({ ...BLANK_NOTICE, plantel: restrictedPlantel || 'General' });
  };

  const unreadCount = messages.filter((m) => m.status === 'Nuevo').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Administración: Avisos Oficiales y Buzón Privado
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Publica comunicados al Home público y atiende solicitudes confidenciales del Buzón de
            Acompañamiento.
          </p>
        </div>

        <div className="inline-flex bg-white border border-slate-200 rounded-2xl p-1 self-start">
          <button
            type="button"
            onClick={() => setActiveSubTab('avisos')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === 'avisos'
                ? 'bg-pastoral text-white shadow-sm'
                : 'text-slate-600 hover:text-pastoral'
            }`}
          >
            <Megaphone className="h-4 w-4" />
            <span>Avisos Oficiales ({notices.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('buzon')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === 'buzon'
                ? 'bg-pastoral text-white shadow-sm'
                : 'text-slate-600 hover:text-pastoral'
            }`}
          >
            <Inbox className="h-4 w-4" />
            <span>Buzón Privado</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-pastoral-red text-white px-1.5 py-0.5 text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeSubTab === 'avisos' ? (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Crear aviso */}
          <form
            onSubmit={handleNoticeSubmit}
            className="lg:col-span-5 rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4 h-fit"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-pastoral" />
              <h2 className="text-base font-extrabold text-slate-900">Publicar Aviso Oficial</h2>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Título del aviso *
              </label>
              <input
                type="text"
                required
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                placeholder="Ej. Horario especial de Misa del 24 de mayo"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                  Plantel
                </label>
                <select
                  value={restrictedPlantel || noticeForm.plantel}
                  disabled={Boolean(restrictedPlantel)}
                  onChange={(e) => setNoticeForm({ ...noticeForm, plantel: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white disabled:bg-slate-100"
                >
                  {PLANTELES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                  Etiqueta
                </label>
                <input
                  type="text"
                  value={noticeForm.tag}
                  onChange={(e) => setNoticeForm({ ...noticeForm, tag: e.target.value })}
                  placeholder="MJS, Familias, Sacramentos"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Mensaje *
              </label>
              <textarea
                rows={4}
                required
                value={noticeForm.body}
                onChange={(e) => setNoticeForm({ ...noticeForm, body: e.target.value })}
                placeholder="Redacta el comunicado que aparecerá en el Home público..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={noticeForm.pinned}
                onChange={(e) => setNoticeForm({ ...noticeForm, pinned: e.target.checked })}
                className="rounded border-slate-300 text-pastoral focus:ring-pastoral"
              />
              <span>Fijar como aviso destacado en la parte superior</span>
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-sm py-3 shadow-sm transition-colors"
            >
              Publicar en el Portal Público
            </button>
          </form>

          {/* Lista de avisos */}
          <div className="lg:col-span-7 space-y-3">
            {notices.map((n) => (
              <div
                key={n.id}
                className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {n.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-pastoral text-white px-2.5 py-0.5 text-[10px] font-bold">
                        <Pin className="h-3 w-3" /> Destacado
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                        PLANTEL_BADGE_STYLES[n.plantel] || PLANTEL_BADGE_STYLES.General
                      }`}
                    >
                      {n.plantel}
                    </span>
                    <span className="text-xs text-slate-400">{n.date}</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900">{n.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{n.body}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleNoticePin(n.id)}
                    className={`p-2 rounded-xl border transition-colors ${
                      n.pinned
                        ? 'bg-pastoral text-white border-pastoral'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-pastoral'
                    }`}
                    title={n.pinned ? 'Quitar destacado' : 'Fijar como destacado'}
                  >
                    <Pin className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteNotice(n.id)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Eliminar aviso"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Bandeja Privada del Buzón de Acompañamiento */
        <div className="space-y-4">
          <div className="rounded-2xl bg-pastoral/5 border border-pastoral/15 p-4 flex items-center gap-3 text-xs sm:text-sm text-slate-700">
            <Lock className="h-5 w-5 text-pastoral shrink-0" />
            <span>
              <strong>Área confidencial:</strong> Las solicitudes enviadas desde el Buzón de
              Acompañamiento son visibles únicamente para la Coordinación de Pastoral.
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center text-sm text-slate-500">
              No hay solicitudes en el buzón por el momento.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isAttended = msg.status === 'Atendida';
                return (
                  <article
                    key={msg.id}
                    className={`rounded-3xl bg-white border p-5 shadow-card space-y-3 ${
                      isAttended ? 'border-slate-200 opacity-85' : 'border-pastoral/35 ring-1 ring-pastoral/10'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                            isAttended
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isAttended ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Atendida
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" /> Nueva solicitud
                            </>
                          )}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                            PLANTEL_BADGE_STYLES[msg.plantel] || PLANTEL_BADGE_STYLES.General
                          }`}
                        >
                          {msg.plantel}
                        </span>
                        <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[11px] font-semibold">
                          {msg.level}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('es-MX') : ''}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-extrabold text-slate-900">{msg.senderName}</div>
                      <div className="text-xs font-semibold text-pastoral mt-0.5">
                        Contacto: {msg.contactMethod}
                      </div>
                    </div>

                    <p className="rounded-2xl bg-slate-50 border border-slate-200/70 p-3.5 text-sm text-slate-700 leading-relaxed">
                      {msg.message}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onToggleMessageStatus(msg.id)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-colors ${
                          isAttended
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{isAttended ? 'Marcar como Nueva' : 'Marcar como Atendida'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteMessage(msg.id)}
                        className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Eliminar solicitud"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
