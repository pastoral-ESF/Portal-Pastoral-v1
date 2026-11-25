import React, { useState, useRef } from 'react';
import {
  Megaphone,
  Inbox,
  Plus,
  Trash2,
  Pin,
  CheckCircle2,
  Clock,
  Lock,
  Database,
  Download,
  Upload,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { PLANTELES, PLANTEL_BADGE_STYLES } from '../../constants/config';
import { evaluationService } from '../../services/evaluationService';

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
  isFullAdmin = false,
  fullDb = null,
  onAddNotice,
  onDeleteNotice,
  onToggleNoticePin,
  onToggleMessageStatus,
  onDeleteMessage,
  onImportBackupDb,
  onToast,
}) {
  const [noticeForm, setNoticeForm] = useState({
    ...BLANK_NOTICE,
    plantel: restrictedPlantel || 'General',
  });
  const [activeSubTab, setActiveSubTab] = useState('avisos'); // 'avisos' | 'buzon' | 'respaldo'
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [pendingBackup, setPendingBackup] = useState(null);
  const [backupError, setBackupError] = useState('');
  const fileInputRef = useRef(null);

  const handleExportBackup = async () => {
    if (!fullDb) return;
    setExporting(true);
    try {
      let evaluations = [];
      try {
        evaluations = await evaluationService.listAllResponses();
      } catch (err) {
        console.warn('No se pudieron incluir evaluaciones en el respaldo:', err);
      }

      const payload = {
        format: 'portal-pastoral-esfer-backup',
        version: 1,
        exportedAt: new Date().toISOString(),
        db: fullDb,
        evaluations,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `respaldo-portal-pastoral-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (onToast) {
        onToast(
          `Respaldo descargado (${(fullDb.cartasDescriptivas || []).length} cartas, ${(fullDb.quickEvents || []).length} eventos, ${evaluations.length} evaluaciones)`
        );
      }
    } catch (err) {
      console.error(err);
      if (onToast) onToast('Error al generar el archivo de respaldo', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleSelectBackupFile = async (e) => {
    setBackupError('');
    setPendingBackup(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const dbPayload =
        parsed?.format === 'portal-pastoral-esfer-backup' && parsed?.db
          ? parsed.db
          : parsed?.cartasDescriptivas || parsed?.quickEvents
          ? parsed
          : null;

      if (!dbPayload || typeof dbPayload !== 'object') {
        setBackupError(
          'El archivo seleccionado no corresponde a un respaldo válido del Portal Pastoral.'
        );
        return;
      }

      const evalList = Array.isArray(parsed?.evaluations) ? parsed.evaluations : [];
      setPendingBackup({
        fileName: file.name,
        exportedAt: parsed?.exportedAt || '',
        db: dbPayload,
        evaluations: evalList,
      });
    } catch {
      setBackupError('No se pudo leer el archivo JSON. Verifica que no esté dañado.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingBackup || !onImportBackupDb) return;
    setImporting(true);
    try {
      onImportBackupDb(pendingBackup.db);
      let importedEvals = 0;
      if (pendingBackup.evaluations.length > 0) {
        importedEvals = await evaluationService.importResponses(pendingBackup.evaluations);
      }
      setPendingBackup(null);
      if (onToast) {
        onToast(
          `Respaldo restaurado y sincronizado con Firebase (${importedEvals} evaluación(es) incluida(s))`
        );
      }
    } catch (err) {
      console.error(err);
      setBackupError(
        'Ocurrió un error al restaurar el respaldo. Verifica tu conexión y permisos en Firebase.'
      );
    } finally {
      setImporting(false);
    }
  };

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
          {isFullAdmin && (
            <button
              type="button"
              onClick={() => setActiveSubTab('respaldo')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeSubTab === 'respaldo'
                  ? 'bg-pastoral text-white shadow-sm'
                  : 'text-slate-600 hover:text-pastoral'
              }`}
            >
              <Database className="h-4 w-4" />
              <span>Respaldo</span>
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'avisos' && (
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
      )}

      {activeSubTab === 'buzon' && (
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

      {activeSubTab === 'respaldo' && isFullAdmin && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-pastoral/5 border border-pastoral/15 p-4 flex items-start gap-3 text-xs sm:text-sm text-slate-700">
            <ShieldCheck className="h-5 w-5 text-pastoral shrink-0 mt-0.5" />
            <div>
              <strong>Respaldo y Migración de Base de Datos (Solo SDB / Coordinador):</strong>{' '}
              Descarga una copia completa en formato <code>.json</code> con todas tus Cartas
              Descriptivas, eventos modificados, pendientes, avisos, grupos MJS, configuración del
              portal, plantillas y respuestas de evaluación. Ideal para respaldos periódicos o
              para migrar a una cuenta institucional de Firebase.
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Tarjeta 1: Exportar */}
            <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-card flex flex-col justify-between space-y-5">
              <div className="space-y-2">
                <div className="h-11 w-11 rounded-2xl bg-pastoral/10 text-pastoral flex items-center justify-center">
                  <Download className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  1. Descargar respaldo completo
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Genera un archivo <code>.json</code> en tu computadora con toda la información
                  actual de Firebase. Guárdalo en Google Drive o en una carpeta segura del
                  Departamento de Pastoral.
                </p>
                {fullDb && (
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2">
                      <span className="text-slate-400 font-semibold block">Cartas Descriptivas</span>
                      <span className="font-black text-slate-900">
                        {(fullDb.cartasDescriptivas || []).length}
                      </span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2">
                      <span className="text-slate-400 font-semibold block">Eventos Calendario</span>
                      <span className="font-black text-slate-900">
                        {(fullDb.quickEvents || []).length}
                      </span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2">
                      <span className="text-slate-400 font-semibold block">Pendientes</span>
                      <span className="font-black text-slate-900">
                        {(fullDb.tasks || []).length}
                      </span>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2">
                      <span className="text-slate-400 font-semibold block">Plantillas Eval.</span>
                      <span className="font-black text-slate-900">
                        {(fullDb.evaluationTemplates || []).length}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleExportBackup}
                disabled={exporting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep disabled:opacity-60 text-white font-extrabold text-sm py-3.5 shadow-sm transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>{exporting ? 'Generando respaldo...' : 'Descargar respaldo (.json)'}</span>
              </button>
            </section>

            {/* Tarjeta 2: Importar / Restaurar */}
            <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-card flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Upload className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  2. Importar / Restaurar respaldo
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Selecciona un archivo <code>respaldo-portal-pastoral-*.json</code> para cargar
                  todos tus datos en esta base de datos (por ejemplo, al estrenar el Firebase
                  institucional de la escuela).
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleSelectBackupFile}
                  className="hidden"
                />

                {backupError && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
                    {backupError}
                  </div>
                )}

                {pendingBackup && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-3">
                    <div className="flex items-start gap-2 text-amber-900">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <div className="font-extrabold">
                          Archivo listo: {pendingBackup.fileName}
                        </div>
                        {pendingBackup.exportedAt && (
                          <div className="text-amber-700">
                            Exportado el{' '}
                            {new Date(pendingBackup.exportedAt).toLocaleString('es-MX')}
                          </div>
                        )}
                      </div>
                    </div>

                    <ul className="text-xs text-amber-900 space-y-1 pl-1">
                      <li>
                        • <strong>{(pendingBackup.db.cartasDescriptivas || []).length}</strong>{' '}
                        Cartas Descriptivas
                      </li>
                      <li>
                        • <strong>{(pendingBackup.db.quickEvents || []).length}</strong> Eventos de
                        calendario
                      </li>
                      <li>
                        • <strong>{(pendingBackup.db.tasks || []).length}</strong> Pendientes ·{' '}
                        <strong>{(pendingBackup.db.notices || []).length}</strong> Avisos
                      </li>
                      <li>
                        • <strong>{pendingBackup.evaluations.length}</strong> Respuestas de
                        evaluación
                      </li>
                    </ul>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleConfirmImport}
                        disabled={importing}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-extrabold text-xs px-4 py-2.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          {importing ? 'Restaurando...' : 'Confirmar restauración'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingBackup(null)}
                        disabled={importing}
                        className="rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-xs px-3.5 py-2.5"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!pendingBackup && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-extrabold text-sm py-3.5 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Seleccionar archivo de respaldo (.json)</span>
                </button>
              )}
            </section>
          </div>

          {/* Guía breve para migrar a cuenta de la escuela */}
          <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900">
              Guía rápida para migrar a la cuenta Firebase de la escuela
            </h3>
            <ol className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-decimal pl-5">
              <li>
                Pulsa <strong>Descargar respaldo (.json)</strong> aquí antes de cambiar de cuenta.
              </li>
              <li>
                Crea el proyecto Firebase en la cuenta de la escuela (activa Authentication y
                Firestore con las mismas reglas) y actualiza las 6 llaves{' '}
                <code>VITE_FIREBASE_*</code> en <code>.env</code> y en los{' '}
                <strong>Secrets de GitHub</strong>.
              </li>
              <li>
                Inicia sesión en el Portal conectado a la nueva base de datos, entra a{' '}
                <strong>Administración → Respaldo</strong> y sube tu archivo <code>.json</code>.
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
