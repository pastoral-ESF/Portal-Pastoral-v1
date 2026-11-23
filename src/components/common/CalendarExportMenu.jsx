import React, { useState, useRef, useEffect } from 'react';
import { CalendarPlus, ExternalLink, Download, ChevronDown } from 'lucide-react';
import { buildGoogleCalendarUrl, downloadIcsFile } from '../../utils/calendarExport';

export function CalendarExportMenu({ event, compact = false, onToast }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const googleUrl = buildGoogleCalendarUrl(event);

  const handleDownloadIcs = () => {
    downloadIcsFile(event);
    setOpen(false);
    if (onToast) {
      onToast('Archivo .ics descargado para Apple Calendar / Outlook', 'success');
    }
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all border ${
          compact
            ? 'px-3 py-1.5 text-xs bg-slate-50 hover:bg-pastoral hover:text-white text-pastoral border-slate-200 hover:border-pastoral'
            : 'px-3.5 py-2 text-xs sm:text-sm bg-pastoral/5 hover:bg-pastoral text-pastoral hover:text-white border-pastoral/20'
        }`}
      >
        <CalendarPlus className="h-4 w-4 shrink-0" />
        <span>Agregar a mi Calendario</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-30">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-pastoral/5 hover:text-pastoral transition-colors"
          >
            <ExternalLink className="h-4 w-4 text-pastoral-cyan shrink-0" />
            <div>
              <div>Google Calendar</div>
              <div className="text-[11px] font-normal text-slate-500">Abrir en nueva pestaña</div>
            </div>
          </a>
          <button
            type="button"
            onClick={handleDownloadIcs}
            className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-pastoral/5 hover:text-pastoral transition-colors"
          >
            <Download className="h-4 w-4 text-pastoral shrink-0" />
            <div>
              <div>Descargar archivo .ics</div>
              <div className="text-[11px] font-normal text-slate-500">Apple Calendar y Outlook</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
