import React from 'react';
import { LogoImage } from '../common/LogoImage';
import { AGUINALDO_ACTUAL } from '../../constants/config';
import { buildQrImageUrl } from '../../services/evaluationService';

/**
 * Cartel imprimible tamaño Carta (1 página) con Código QR para pegar en auditorios,
 * salones o puertas del templo y facilitar la evaluación desde el celular.
 */
export function PrintableQrPoster({ poster }) {
  if (!poster) return null;

  const {
    eventTitle,
    eventDate,
    plantel,
    url,
    audienceLabel = '',
    audiences = [],
  } = poster;

  const qrSrc = buildQrImageUrl(url, 420);

  return (
    <div
      className="print-only bg-white text-slate-900 p-6 max-w-[760px] mx-auto"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
    >
      <div className="rounded-[28px] border-4 border-[#2B3890] p-7 text-center space-y-5">
        {/* Logos institucionales */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
          <LogoImage type="esfer" className="h-14 w-auto object-contain" />
          <div className="px-3">
            <div className="text-xs font-black uppercase tracking-widest text-[#2B3890]">
              ESFER Salesianos Chihuahua
            </div>
            <div className="text-[11px] font-bold text-slate-500">
              Departamento de Pastoral
            </div>
          </div>
          <LogoImage type="pastoral" className="h-14 w-auto object-contain" />
        </div>

        {/* Título llamativo */}
        <div className="space-y-2 pt-1">
          <div className="inline-block rounded-full bg-[#FBB03B] text-[#1A235A] px-5 py-1 text-xs font-black uppercase tracking-widest">
            ¡Tu opinión es muy importante!
          </div>
          <h1 className="text-3xl font-black text-[#1A235A] leading-tight">
            EVALÚA ESTA EXPERIENCIA
          </h1>
          <div className="text-xl font-extrabold text-[#2B3890] pt-1">{eventTitle}</div>
          <div className="text-xs font-bold text-slate-600">
            Plantel {plantel || 'General'}
            {eventDate ? ` · ${eventDate}` : ''}
          </div>
          {audienceLabel ? (
            <div className="pt-1">
              <span className="inline-block rounded-full bg-[#2B3890] text-white px-4 py-1 text-xs font-extrabold">
                Perfil: {audienceLabel}
              </span>
            </div>
          ) : audiences.length > 1 ? (
            <div className="text-xs font-semibold text-slate-500 pt-1">
              Disponible para: {audiences.join(' · ')}
            </div>
          ) : null}
        </div>

        {/* Código QR grande centrado */}
        <div className="flex justify-center py-2">
          <div className="rounded-3xl border-4 border-[#1A235A] bg-white p-5 shadow-md inline-block">
            <img
              src={qrSrc}
              alt="Código QR de evaluación"
              className="h-72 w-72 object-contain mx-auto"
            />
          </div>
        </div>

        {/* Instrucciones en 3 pasos */}
        <div className="grid grid-cols-3 gap-3 pt-1 text-center">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
            <div className="text-lg font-black text-[#2B3890]">1</div>
            <div className="text-xs font-bold text-slate-800">Abre la cámara</div>
            <div className="text-[11px] text-slate-500">de tu celular</div>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
            <div className="text-lg font-black text-[#2B3890]">2</div>
            <div className="text-xs font-bold text-slate-800">Escanea el QR</div>
            <div className="text-[11px] text-slate-500">sin iniciar sesión</div>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
            <div className="text-lg font-black text-[#2B3890]">3</div>
            <div className="text-xs font-bold text-slate-800">Responde rápido</div>
            <div className="text-[11px] text-slate-500">toma menos de 2 min</div>
          </div>
        </div>

        {/* Pie */}
        <div className="border-t border-slate-200 pt-3 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 break-all">{url}</div>
          <div className="text-xs font-bold text-[#1A235A] italic">
            «{AGUINALDO_ACTUAL.title}» · {AGUINALDO_ACTUAL.motto}
          </div>
        </div>
      </div>
    </div>
  );
}
