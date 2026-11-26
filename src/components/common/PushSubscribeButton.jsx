import React, { useEffect, useState } from 'react';
import { Bell, BellRing, BellOff } from 'lucide-react';
import { pushService } from '../../services/pushService';

export function PushSubscribeButton({ currentUser, onToast }) {
  const [status, setStatus] = useState({ supported: true, permission: 'default', optedIn: false });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    pushService.getStatus().then((st) => {
      if (mounted && st) setStatus(st);
    });
    return () => {
      mounted = false;
    };
  }, [currentUser]);

  if (!status.supported) return null;

  const isSubscribed = status.optedIn && status.permission === 'granted';

  const handleToggle = async () => {
    setBusy(true);
    try {
      if (isSubscribed) {
        await pushService.unsubscribe();
        setStatus((prev) => ({ ...prev, optedIn: false }));
        if (onToast) onToast('Avisos Push desactivados en este dispositivo', 'info');
      } else {
        const res = await pushService.subscribe(currentUser);
        if (res.ok) {
          setStatus({ supported: true, permission: 'granted', optedIn: true });
          if (onToast) onToast('¡Avisos Push activados! Recibirás notificaciones incluso con la app cerrada');
        } else if (res.reason === 'denied') {
          setStatus((prev) => ({ ...prev, permission: 'denied', optedIn: false }));
          if (onToast) {
            onToast(
              'Permiso de notificaciones bloqueado en tu navegador. Habilítalo en el candado junto a la URL.',
              'error'
            );
          }
        } else {
          if (onToast) {
            onToast('No se pudo conectar con el servicio Push (revisa si la red bloquea OneSignal).', 'info');
          }
        }
      }
    } catch (err) {
      if (onToast) onToast(err?.message || 'Error al configurar avisos Push', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={busy}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-colors shrink-0 ${
        isSubscribed
          ? 'bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-300/40 text-emerald-100'
          : 'bg-white/15 hover:bg-white/25 text-white'
      }`}
      title={
        isSubscribed
          ? 'Avisos Push activos (clic para desactivar en este dispositivo)'
          : 'Activar notificaciones Push en este dispositivo'
      }
    >
      {isSubscribed ? (
        <BellRing className="h-3.5 w-3.5 text-pastoral-gold shrink-0" />
      ) : status.permission === 'denied' ? (
        <BellOff className="h-3.5 w-3.5 text-rose-200 shrink-0" />
      ) : (
        <Bell className="h-3.5 w-3.5 text-pastoral-gold shrink-0" />
      )}
      <span className="hidden lg:inline">
        {busy ? 'Conectando...' : isSubscribed ? 'Push Activo' : 'Activar Push'}
      </span>
    </button>
  );
}
