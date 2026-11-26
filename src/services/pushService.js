// Servicio de Notificaciones Push Reales vía OneSignal Web SDK v16
// Permite recibir avisos push incluso con la app cerrada y segmentar por Plantel y Rol.

export const ONESIGNAL_APP_ID = 'cf9df7d0-f428-4618-b0e8-0d78cb4f3196';

let initialized = false;
let initPromise = null;

function withOneSignal(callback) {
  if (typeof window === 'undefined') return Promise.resolve(null);
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  return new Promise((resolve) => {
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        const res = await callback(OneSignal);
        resolve(res);
      } catch (err) {
        console.warn('OneSignal warning:', err);
        resolve(null);
      }
    });
  });
}

export const pushService = {
  init() {
    if (typeof window === 'undefined') return Promise.resolve(false);
    if (initialized) return Promise.resolve(true);
    if (initPromise) return initPromise;

    initPromise = withOneSignal(async (OneSignal) => {
      if (initialized) return true;
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        serviceWorkerPath: 'OneSignalSDKWorker.js',
        serviceWorkerParam: { scope: '/' },
        allowLocalhostAsSecureOrigin: true,
        notifyButton: { enable: false },
      });
      initialized = true;
      return true;
    });

    return initPromise;
  },

  async syncUserTags(user) {
    if (!user) return;
    await this.init();
    await withOneSignal(async (OneSignal) => {
      if (user.uid) {
        try {
          await OneSignal.login(String(user.uid));
        } catch {
          // ignore if already logged in
        }
      }
      OneSignal.User.addTags({
        plantel: String(user.plantel || 'General'),
        rol: String(user.role || 'auxiliar'),
        nombre: String(user.name || ''),
      });
    });
  },

  async getStatus() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { supported: false, permission: 'unsupported', optedIn: false };
    }
    await this.init();
    const res = await withOneSignal(async (OneSignal) => {
      const optedIn = Boolean(OneSignal.User?.PushSubscription?.optedIn);
      const permission = window.Notification.permission;
      return { supported: true, permission, optedIn };
    });
    return res || { supported: true, permission: window.Notification.permission, optedIn: false };
  },

  async subscribe(user = null) {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      throw new Error('Tu navegador no soporta notificaciones push.');
    }
    await this.init();
    const result = await withOneSignal(async (OneSignal) => {
      if (window.Notification.permission !== 'granted') {
        await OneSignal.Notifications.requestPermission();
      }
      if (window.Notification.permission !== 'granted') {
        return { ok: false, reason: 'denied' };
      }
      await OneSignal.User.PushSubscription.optIn();
      if (user) {
        OneSignal.User.addTags({
          plantel: String(user.plantel || 'General'),
          rol: String(user.role || 'auxiliar'),
          nombre: String(user.name || ''),
        });
      }
      return { ok: true, optedIn: Boolean(OneSignal.User?.PushSubscription?.optedIn) };
    });
    return result || { ok: false, reason: 'unavailable' };
  },

  async unsubscribe() {
    await this.init();
    await withOneSignal(async (OneSignal) => {
      await OneSignal.User.PushSubscription.optOut();
    });
    return { ok: true, optedIn: false };
  },
};
