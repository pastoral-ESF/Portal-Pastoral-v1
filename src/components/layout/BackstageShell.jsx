import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Settings2,
} from 'lucide-react';
import { LogoImage } from '../common/LogoImage';
import { InstallPwaButton } from '../common/InstallPwaButton';
import { PushSubscribeButton } from '../common/PushSubscribeButton';
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
  {
    id: 'evaluacion',
    label: 'Evaluación',
    icon: BarChart3,
    roles: PASTORAL_TEAM,
  },
  {
    id: 'repositorio',
    label: 'Recursos Pastoral',
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
  onToast,
  children,
}) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const GROUPED_IDS = new Set(['pepsal', 'admin', 'editor', 'perfil']);
  const visibleTabs = BACKSTAGE_TABS.filter((t) => t.roles.includes(role));
  const primaryTabs =
    role === ROLES.ANIMADOR
      ? visibleTabs
      : visibleTabs.filter((t) => !GROUPED_IDS.has(t.id));
  const groupedTabs =
    role === ROLES.ANIMADOR
      ? []
      : visibleTabs.filter((t) => GROUPED_IDS.has(t.id));
  const activeGroupedTab = groupedTabs.find((t) => t.id === activeTab) || null;
  const roleLabel = ROLE_LABELS[role] || 'Equipo de Pastoral';

  return (
    <div className="min-h-screen bg-slate-100/80 pb-20 lg:pb-10">
      {/* Header Backstage */}
      <header className="no-print sticky top-0 z-40 bg-gradient-to-r from-[#1A235A] via-[#2B3890] to-[#1A235A] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 min-h-[64px] sm:h-20 py-2 sm:py-0 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-sm shrink-0">
              <LogoImage type="esfer" className="h-5 sm:h-7 w-auto" />
              <span className="h-3.5 sm:h-4 w-px bg-slate-200" />
              <LogoImage type="pastoral" className="h-5 sm:h-7 w-auto" />
            </div>
            <div className="leading-tight min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-base font-extrabold tracking-tight truncate">
                  <span className="sm:hidden">Admin. Pastoral</span>
                  <span className="hidden sm:inline">Administración Pastoral</span>
                </span>
                <span className="hidden md:inline-flex items-center rounded-full bg-pastoral-gold/20 border border-pastoral-gold/40 px-2.5 py-0.5 text-[10px] font-bold text-pastoral-gold uppercase tracking-wider shrink-0">
                  {roleLabel}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-blue-200 truncate">
                {currentUser ? (
                  <>
                    <span className="sm:hidden">
                      {currentUser.plantel} · {roleLabel.split(' ')[0]}
                    </span>
                    <span className="hidden sm:inline">
                      {currentUser.name} · Plantel {currentUser.plantel} (
                      {currentUser.authSource === 'firebase' ? 'Firebase' : 'Local'})
                    </span>
                  </>
                ) : (
                  'Departamento de Pastoral · ESFER Salesianos Chihuahua'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <PushSubscribeButton currentUser={currentUser} onToast={onToast} />
            <div className="hidden md:block">
              <InstallPwaButton variant="dark" />
            </div>
            <button
              type="button"
              onClick={onExitToPublic}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white transition-colors"
              title="Abrir el visor público que ven familias y estudiantes"
            >
              <Eye className="h-3.5 w-3.5 text-pastoral-cyan shrink-0" />
              <span className="hidden sm:inline">Visor Público</span>
              <span className="sm:hidden">Visor</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/35 border border-rose-300/30 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-rose-100 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Navegación interna del Backstage */}
        <div className="border-t border-white/10 bg-black/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 py-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar min-w-0 flex-1">
              {primaryTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      onSelectTab(tab.id);
                    }}
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
                  </button>
                );
              })}
            </div>

            {/* Menú desplegable: PEPSAL, Avisos y Buzón, Editor Portal y Usuarios */}
            {groupedTabs.length > 0 && (
              <div className="relative shrink-0" ref={moreMenuRef}>
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeGroupedTab
                      ? 'bg-white text-pastoral-deep shadow-sm'
                      : 'bg-white/10 text-blue-100 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <Settings2 className="h-4 w-4" />
                  <span>{activeGroupedTab ? activeGroupedTab.label : 'Gestión'}</span>
                  {unreadInboxCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-pastoral-red text-white text-[10px] font-extrabold">
                      {unreadInboxCount}
                    </span>
                  )}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      moreMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {moreMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-50">
                    {groupedTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setMoreMenuOpen(false);
                            onSelectTab(tab.id);
                          }}
                          className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left text-xs font-bold transition-colors ${
                            isActive
                              ? 'bg-pastoral/10 text-pastoral-deep'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-pastoral'
                          }`}
                        >
                          <span className="inline-flex items-center gap-2.5">
                            <Icon className="h-4 w-4 text-pastoral" />
                            <span>{tab.label}</span>
                          </span>
                          {tab.id === 'admin' && unreadInboxCount > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-pastoral-red text-white text-[10px] font-extrabold">
                              {unreadInboxCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </div>
  );
}
