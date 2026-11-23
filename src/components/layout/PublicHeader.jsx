import React from 'react';
import {
  Home,
  Calendar,
  Users,
  BookOpen,
  PlayCircle,
  HeartHandshake,
  Sun,
  Lock,
} from 'lucide-react';
import { LogoImage } from '../common/LogoImage';

export const PUBLIC_TABS = [
  { id: 'home', label: 'Inicio', shortLabel: 'Inicio', icon: Home },
  { id: 'calendario', label: 'Calendario', shortLabel: 'Calendario', icon: Calendar },
  { id: 'mjs', label: 'Directorio MJS', shortLabel: 'MJS', icon: Users },
  { id: 'sacramentos', label: 'Sacramentos', shortLabel: 'Sacramentos', icon: BookOpen },
  { id: 'multimedia', label: 'Formación', shortLabel: 'Formación', icon: PlayCircle },
  { id: 'buzon', label: 'Buzón', shortLabel: 'Buzón', icon: HeartHandshake },
  { id: 'vafeje', label: 'VAFEJE', shortLabel: 'VAFEJE', icon: Sun },
];

export function PublicHeader({ activeTab, onSelectTab, onOpenBackstage, backstageRole }) {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Logos institucionales */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 sm:gap-3 text-left group shrink-0"
        >
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-2.5 py-1.5 group-hover:border-pastoral/30 transition-colors">
            <LogoImage type="esfer" className="h-8 sm:h-9 w-auto" />
            <span className="h-5 w-px bg-slate-200" />
            <LogoImage type="pastoral" className="h-8 sm:h-9 w-auto" />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-pastoral-deep tracking-tight">
                Portal Pastoral
              </span>
              <span className="rounded-full bg-pastoral-cyan/15 text-sky-800 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                Visor Público
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500">
              ESFER Salesianos · Chihuahua
            </div>
          </div>
        </button>

        {/* Navegación estilo píldora en escritorio */}
        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/70"
        >
          {PUBLIC_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-pastoral text-white shadow-sm'
                    : 'text-slate-600 hover:text-pastoral hover:bg-white/70'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Botón de acceso a la Administración Pastoral */}
        <button
          type="button"
          onClick={onOpenBackstage}
          className="inline-flex items-center gap-1.5 rounded-full px-3 sm:px-3.5 py-2 text-xs font-bold border border-pastoral/25 bg-pastoral/5 text-pastoral-deep hover:bg-pastoral hover:text-white transition-all shrink-0"
          title="Ir a la Administración del Departamento de Pastoral"
        >
          <Lock className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {backstageRole ? 'Volver a Administración' : 'Iniciar Sesión'}
          </span>
          <span className="sm:hidden">{backstageRole ? 'Admin' : 'Entrar'}</span>
        </button>
      </div>
    </header>
  );
}
