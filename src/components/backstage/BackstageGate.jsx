import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  Users,
  Eye,
  Mail,
  KeyRound,
  AlertCircle,
  Flame,
  Sparkles,
} from 'lucide-react';
import { LogoImage } from '../common/LogoImage';
import { ROLES } from '../../constants/config';
import { authService, DEMO_USERS } from '../../services/authService';

export function BackstageGate({ onAuthenticated, onCancel }) {
  const [selectedRole, setSelectedRole] = useState('pastoral'); // 'pastoral' | ROLES.ANIMADOR
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFirebase = authService.isFirebaseMode();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await authService.login({
        email,
        password,
        expectedRole: selectedRole,
      });
      onAuthenticated(user);
    } catch (err) {
      setError(err?.message || 'No se pudo iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const quickFillDemo = (demoUser) => {
    setSelectedRole(demoUser.role === ROLES.ANIMADOR ? ROLES.ANIMADOR : 'pastoral');
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A235A] via-[#2B3890] to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        {/* Tarjeta principal de Login */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 text-white shadow-2xl space-y-5">
          {/* Logos en píldora blanca */}
          <div className="flex flex-col items-center text-center space-y-3.5">
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-5 py-2.5 shadow-lg">
              <LogoImage type="esfer" className="h-8 w-auto" />
              <span className="h-5 w-px bg-slate-200" />
              <LogoImage type="pastoral" className="h-8 w-auto" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-pastoral-gold/20 border border-pastoral-gold/30 px-3 py-0.5 text-[11px] font-extrabold text-pastoral-gold uppercase tracking-wider">
                <Lock className="h-3 w-3" />
                <span>Departamento de Pastoral</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
                Administración Pastoral
              </h1>
              <p className="text-xs text-blue-200 mt-1">
                ESFER Salesianos Chihuahua · Acceso individual por usuario
              </p>
            </div>
          </div>

          {/* Indicador de estado Firebase */}
          <div
            className={`rounded-2xl border px-3.5 py-2 text-[11px] font-semibold flex items-center justify-center gap-2 ${
              isFirebase
                ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-100'
                : 'bg-white/10 border-white/15 text-blue-100'
            }`}
          >
            {isFirebase ? (
              <>
                <Flame className="h-3.5 w-3.5 text-pastoral-gold shrink-0" />
                <span>Conectado a Firebase Auth y Firestore en tiempo real</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-pastoral-cyan shrink-0" />
                <span>Listo para Firebase (.env pendiente) · Modo prueba local activo</span>
              </>
            )}
          </div>

          {/* Selector de perfil */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('pastoral');
                setError('');
              }}
              className={`rounded-2xl p-3.5 text-left border transition-all ${
                selectedRole === 'pastoral'
                  ? 'bg-white text-pastoral-deep border-white shadow-md'
                  : 'bg-white/5 text-blue-100 border-white/15 hover:bg-white/10'
              }`}
            >
              <ShieldCheck
                className={`h-5 w-5 mb-1.5 ${
                  selectedRole === 'pastoral' ? 'text-pastoral' : 'text-pastoral-gold'
                }`}
              />
              <div className="text-xs font-extrabold leading-tight">Equipo de Pastoral</div>
              <div
                className={`text-[10px] mt-0.5 ${
                  selectedRole === 'pastoral' ? 'text-slate-500' : 'text-blue-200/80'
                }`}
              >
                SDB · Coordinador · Auxiliares
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole(ROLES.ANIMADOR);
                setError('');
              }}
              className={`rounded-2xl p-3.5 text-left border transition-all ${
                selectedRole === ROLES.ANIMADOR
                  ? 'bg-white text-pastoral-deep border-white shadow-md'
                  : 'bg-white/5 text-blue-100 border-white/15 hover:bg-white/10'
              }`}
            >
              <Users
                className={`h-5 w-5 mb-1.5 ${
                  selectedRole === ROLES.ANIMADOR ? 'text-pastoral' : 'text-pastoral-cyan'
                }`}
              />
              <div className="text-xs font-extrabold leading-tight">Animador MJS</div>
              <div
                className={`text-[10px] mt-0.5 ${
                  selectedRole === ROLES.ANIMADOR ? 'text-slate-500' : 'text-blue-200/80'
                }`}
              >
                Repositorio MJS
              </div>
            </button>
          </div>

          {/* Formulario Correo y Contraseña */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-blue-100 mb-1">
                Correo institucional
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-blue-200 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="usuario@esfer.edu.mx"
                  className="w-full rounded-2xl bg-white/10 border border-white/25 pl-10 pr-4 py-2.5 text-sm font-semibold text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-pastoral-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-100 mb-1">Contraseña</label>
              <div className="relative">
                <KeyRound className="h-4 w-4 text-blue-200 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full rounded-2xl bg-white/10 border border-white/25 pl-10 pr-4 py-2.5 text-sm font-semibold text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-pastoral-gold"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-500/20 border border-rose-400/40 px-3.5 py-2.5 text-xs text-rose-100">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-pastoral-gold hover:bg-amber-400 disabled:opacity-60 text-pastoral-deep font-black text-sm py-3.5 shadow-lg transition-all"
            >
              {loading ? 'Verificando acceso...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Accesos rápidos de prueba (solo visibles cuando .env de Firebase no está configurado) */}
          {!isFirebase && (
            <div className="rounded-2xl bg-black/25 border border-white/10 p-3 space-y-2">
              <div className="text-[11px] font-bold text-white/90 text-center">
                Accesos de prueba locales (clic para rellenar)
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.uid}
                    type="button"
                    onClick={() => quickFillDemo(u)}
                    className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-1 text-[10px] font-bold text-blue-100 transition-colors"
                    title={`${u.email} / ${u.password}`}
                  >
                    {u.plantel === 'General'
                      ? 'Coord. General'
                      : u.role === ROLES.ANIMADOR
                      ? 'Animador MJS'
                      : `Agente ${u.plantel}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Acceso secundario al Visor Público */}
        <div className="text-center">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 px-5 py-2.5 text-xs font-bold text-blue-100 hover:text-white transition-all"
          >
            <Eye className="h-4 w-4 text-pastoral-cyan" />
            <span>Abrir Visor Público (Comunidad y Familias)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
