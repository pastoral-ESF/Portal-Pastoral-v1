import React, { useState, useEffect } from 'react';
import {
  UserCog,
  User,
  Users,
  Save,
  RefreshCw,
  ShieldCheck,
  Info,
} from 'lucide-react';
import {
  PLANTELES,
  ROLES,
  ROLE_LABELS,
  PLANTEL_BADGE_STYLES,
  isFullAdminRole,
} from '../../constants/config';
import { authService } from '../../services/authService';

export function UsersProfileView({ currentUser, onCurrentUserUpdated, onToast }) {
  const [myForm, setMyForm] = useState({
    name: currentUser?.name || '',
    plantel: currentUser?.plantel || 'General',
  });
  const [savingMe, setSavingMe] = useState(false);

  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingUid, setSavingUid] = useState(null);

  const canManageTeam = isFullAdminRole(currentUser?.role);

  useEffect(() => {
    setMyForm({
      name: currentUser?.name || '',
      plantel: currentUser?.plantel || 'General',
    });
  }, [currentUser]);

  const fetchUsers = async () => {
    if (!canManageTeam) return;
    setLoadingUsers(true);
    try {
      const list = await authService.listUsers();
      setUsersList(list);
    } catch (err) {
      console.warn('No se pudo cargar la lista de usuarios:', err);
      if (onToast) {
        onToast('No se pudieron cargar los usuarios. Revisa las reglas de Firestore.', 'error');
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageTeam]);

  const handleSaveMyProfile = async (e) => {
    e.preventDefault();
    if (!currentUser?.uid || !myForm.name.trim()) return;
    setSavingMe(true);
    try {
      await authService.saveUserProfile(currentUser.uid, {
        name: myForm.name.trim(),
        plantel: myForm.plantel,
      });
      onCurrentUserUpdated({
        ...currentUser,
        name: myForm.name.trim(),
        plantel: myForm.plantel,
      });
      if (onToast) onToast('Tu perfil fue actualizado correctamente');
      fetchUsers();
    } catch (err) {
      console.error(err);
      if (onToast) onToast('Error al guardar tu perfil en Firestore', 'error');
    } finally {
      setSavingMe(false);
    }
  };

  const updateRowField = (uid, field, value) => {
    setUsersList((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, [field]: value } : u))
    );
  };

  const handleSaveOtherUser = async (userRow) => {
    setSavingUid(userRow.uid);
    try {
      await authService.saveUserProfile(userRow.uid, {
        name: userRow.name,
        plantel: userRow.plantel,
        role: userRow.role,
      });
      if (userRow.uid === currentUser?.uid) {
        onCurrentUserUpdated({
          ...currentUser,
          name: userRow.name,
          plantel: userRow.plantel,
          role: userRow.role,
        });
      }
      if (onToast) onToast(`Perfil de ${userRow.name || userRow.email} actualizado`);
    } catch (err) {
      console.error(err);
      if (onToast) {
        onToast(
          'Permiso denegado en Firestore para editar otros usuarios. Ajusta la regla de /users si deseas administrarlos aquí.',
          'error'
        );
      }
    } finally {
      setSavingUid(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pastoral/10 text-pastoral px-3 py-1 text-xs font-extrabold">
          <UserCog className="h-3.5 w-3.5" />
          Cuentas del Departamento de Pastoral
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          Mi Perfil y Usuarios
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configura tu nombre y plantel de trabajo (usado para tus Pendientes y firmas de Cartas
          Descriptivas).
        </p>
      </div>

      {/* Mi Perfil */}
      <form
        onSubmit={handleSaveMyProfile}
        className="rounded-3xl bg-white border border-slate-200 p-6 shadow-card space-y-4 max-w-2xl"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="h-9 w-9 rounded-xl bg-pastoral/10 text-pastoral flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Mi Perfil</h2>
            <p className="text-xs text-slate-500">{currentUser?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              required
              value={myForm.name}
              onChange={(e) => setMyForm({ ...myForm, name: e.target.value })}
              placeholder="Ej. P. Francisco / Lic. Mariana Chávez"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-pastoral"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Plantel donde laboro
            </label>
            {canManageTeam ? (
              <select
                value={myForm.plantel}
                onChange={(e) => setMyForm({ ...myForm, plantel: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-pastoral"
              >
                {PLANTELES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-bold text-slate-700">
                {myForm.plantel}{' '}
                <span className="text-[11px] font-normal text-slate-500">
                  (asignado por SDB / Coordinación)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingMe}
            className="inline-flex items-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep disabled:opacity-60 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 shadow-sm transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{savingMe ? 'Guardando...' : 'Guardar mi perfil'}</span>
          </button>
        </div>
      </form>

      {/* Directorio de usuarios (solo SDB y Coordinador de Pastoral) */}
      {canManageTeam && (
        <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-pastoral-cyan/15 text-sky-700 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Equipo de Pastoral registrado ({usersList.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Asigna el nivel (SDB, Coordinador, Auxiliar por plantel o Animador MJS) y el
                  plantel de cada usuario.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 text-xs font-bold transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>

          <div className="rounded-2xl bg-pastoral/5 border border-pastoral/15 p-3.5 flex items-start gap-2.5 text-xs text-slate-700">
            <Info className="h-4 w-4 text-pastoral shrink-0 mt-0.5" />
            <span>
              Para dar de alta un nuevo correo y contraseña, créalo en{' '}
              <strong>Firebase Console → Authentication → Users</strong>. En cuanto esa persona
              inicie sesión por primera vez aparecerá aquí automáticamente.
            </span>
          </div>

          <div className="space-y-3">
            {usersList.map((u) => (
              <div
                key={u.uid}
                className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
              >
                <div className="md:col-span-3 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-pastoral shrink-0" />
                    <span className="text-xs font-bold text-slate-700 truncate">{u.email}</span>
                  </div>
                  <span
                    className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                      PLANTEL_BADGE_STYLES[u.plantel] || PLANTEL_BADGE_STYLES.General
                    }`}
                  >
                    {u.plantel || 'General'}
                  </span>
                </div>

                <input
                  type="text"
                  value={u.name || ''}
                  onChange={(e) => updateRowField(u.uid, 'name', e.target.value)}
                  placeholder="Nombre"
                  className="md:col-span-3 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
                />

                <select
                  value={u.plantel || 'General'}
                  onChange={(e) => updateRowField(u.uid, 'plantel', e.target.value)}
                  className="md:col-span-2 rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold"
                >
                  {PLANTELES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                <select
                  value={u.role || ROLES.AUXILIAR}
                  onChange={(e) => updateRowField(u.uid, 'role', e.target.value)}
                  className="md:col-span-2 rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold"
                >
                  <option value={ROLES.SDB}>{ROLE_LABELS.sdb}</option>
                  <option value={ROLES.COORDINADOR}>{ROLE_LABELS.coordinador}</option>
                  <option value={ROLES.AUXILIAR}>{ROLE_LABELS.auxiliar}</option>
                  <option value={ROLES.ANIMADOR}>{ROLE_LABELS.animador}</option>
                </select>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="button"
                    disabled={savingUid === u.uid}
                    onClick={() => handleSaveOtherUser(u)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral hover:bg-pastoral-deep disabled:opacity-50 text-white px-3.5 py-2 text-xs font-extrabold transition-colors"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{savingUid === u.uid ? '...' : 'Guardar'}</span>
                  </button>
                </div>
              </div>
            ))}

            {!loadingUsers && usersList.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">
                Aún no hay perfiles guardados en Firestore. Guarda tu perfil arriba para crear el
                primero.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
