import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  BookMarked,
  CalendarDays,
  BarChart3,
  FolderHeart,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Eye,
  LogOut,
} from 'lucide-react';
import { LogoImage } from '../common/LogoImage';
import { ROLES, ROLE_LABELS } from '../../constants/config';

const PASTORAL_TEAM = [ROLES.SDB, ROLES.COORDINADOR, ROLES.AUXILIAR];
const FULL_ADMINS = [ROLES.SDB, ROLES.COORDINADOR];

export const BACKSTAGE_TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: PASTORAL_TEAM,
  },
  {
    id: 'pendientes',
    label: 'Pendientes',
    icon: CheckSquare,
    roles: PASTORAL_TEAM,
  },
  {
    id: 'planeador',
    label: 'Carta Descriptiva',
    icon: FileText,
    roles: PASTORAL_TEAM,
  },
  {
    id: 'pepsal',
    label: 'PEPSAL',
    icon: BookMarked,
    roles: PASTORAL_TEAM,
  },
  {
    id: 'calendario',
    label: 'Calendarios',
    icon: CalendarDays,
    roles: PASTORAL_TEAM,
  },
  // Desactivado temporalmente mientras se define el formulario de evaluación ESA para participantes
  // {
  //   id: 'evaluacion',
  //   label: 'Evaluación ESA',
  //   icon: BarChart3,
  //   roles: PASTORAL_TEAM,
  // },
  {
    id: 'repositorio',
    label: 'Repositorio MJS',
    icon: FolderHeart,
    roles: [...PASTORAL_TEAM, ROLES.ANIMADOR],
  },
  {
    id: 'admin',
    label: 'Avisos y Buzón',
    icon: ShieldCheck,
    roles: PASTORAL_TEAM,
  },
  {
    id: 'editor',
    label: 'Editor Portal',
    icon: SlidersHorizontal,
    roles: FULL_ADMINS,
  },
  {
    id: 'perfil',
    label: 'Perfil y Usuarios',
    icon: UserCog,
    roles: [...PASTORAL_TEAM, ROLES.ANIMADOR],
  },
];

export function BackstageShell({
  role,
  currentUser,
  activeTab,
  onSelectTab,
  onExitToPublic,
  onLogout,
  unreadInboxCount,
  pendingTasksCount = 0,
  children,
}) {
  const visibleTabs = BACKSTAGE_TABS.filter((t) => t.roles.includes(role));
  const roleLabel = ROLE_LABELS[role] || 'Equipo de Pastoral';

  return (
    <div className="min-h-screen bg-slate-100/80 pb-20 lg:pb-10">
      {/* Header Backstage */}
      <header className="no-print sticky top-0 z-40 bg-gradient-to-r from-[#1A235A] via-[#2B3890] to-[#1A235A] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-sm">
              <LogoImage type="esfer" className="h-6 sm:h-7 w-auto" />
              <span className="h-4 w-px bg-slate-200" />
              <LogoImage type="pastoral" className="h-6 sm:h-7 w-auto" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold tracking-tight">
                  Administración Pastoral
                </span>
                <span className="hidden md:inline-flex items-center rounded-full bg-pastoral-gold/20 border border-pastoral-gold/40 px-2.5 py-0.5 text-[10px] font-bold text-pastoral-gold uppercase tracking-wider">
                  {roleLabel}
                </span>
              </div>
              <p className="text-[11px] text-blue-200 hidden sm:block">
                {currentUser
                  ? `${currentUser.name} · Plantel ${currentUser.plantel} (${
                      currentUser.authSource === 'firebase' ? 'Firebase' : 'Local'
                    })`
                  : 'Departamento de Pastoral · ESFER Salesianos Chihuahua'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExitToPublic}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-bold text-white transition-colors"
              title="Abrir el visor público que ven familias y estudiantes"
            >
              <Eye className="h-3.5 w-3.5 text-pastoral-cyan" />
              <span className="hidden sm:inline">Visor Público</span>
              <span className="sm:hidden">Visor</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/35 border border-rose-300/30 px-3 py-1.5 text-xs font-bold text-rose-100 transition-colors"
              title="Cerrar sesión del Backstage"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Navegación interna del Backstage */}
        <div className="border-t border-white/10 bg-black/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-pastoral-deep shadow-sm'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'pendientes' && pendingTasksCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-pastoral-gold text-pastoral-deep text-[10px] font-black">
                      {pendingTasksCount}
                    </span>
                  )}
                  {tab.id === 'admin' && unreadInboxCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-pastoral-red text-white text-[10px] font-extrabold">
                      {unreadInboxCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </div>
  );
}
