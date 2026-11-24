import React, { useState, useEffect } from 'react';
import { Download, Share, X } from 'lucide-react';

export function InstallPwaButton({ variant = 'dark' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(ua) && !window.MSStream);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (isInstalled) return null;
  if (!deferredPrompt && !isIos) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      return;
    }
    if (isIos) {
      setShowIosGuide((prev) => !prev);
    }
  };

  const buttonClass =
    variant === 'dark'
      ? 'inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs font-bold text-white transition-all'
      : 'inline-flex items-center justify-center gap-1.5 rounded-full bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white border border-pastoral/20 px-3 py-1.5 text-xs font-bold transition-all';

  return (
    <div className="relative inline-block">
      <button type="button" onClick={handleInstallClick} className={buttonClass}>
        <Download className="h-3.5 w-3.5" />
        <span>Instalar App</span>
      </button>

      {showIosGuide && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-2xl p-4 text-left z-50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-pastoral-deep">
              Instalar en iPhone / iPad
            </span>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4">
            <li>
              Pulsa el botón <strong>Compartir</strong>{' '}
              <Share className="inline h-3.5 w-3.5 text-pastoral" /> en la barra de Safari.
            </li>
            <li>
              Desliza y elige <strong>“Agregar a inicio”</strong>.
            </li>
            <li>
              Pulsa <strong>Agregar</strong> y aparecerá como app en tu pantalla.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
