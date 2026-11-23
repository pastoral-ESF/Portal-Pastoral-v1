import React from 'react';
import { PUBLIC_TABS } from './PublicHeader';

export function PublicMobileNav({ activeTab, onSelectTab }) {
  return (
    <nav
      aria-label="Navegación móvil"
      className="no-print lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_-4px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-center overflow-x-auto no-scrollbar px-2 py-1.5 gap-1">
        {PUBLIC_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[68px] flex-1 py-1.5 px-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-pastoral/10 text-pastoral font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-pastoral' : 'text-slate-400'}`} />
              <span className="text-[10px] mt-0.5 whitespace-nowrap">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
