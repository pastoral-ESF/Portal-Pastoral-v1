import React from 'react';
import { LogoImage } from '../common/LogoImage';
import { AGUINALDO_ACTUAL } from '../../constants/config';

/**
 * Reporte imprimible / PDF (tamaño Carta) de Evaluación Pastoral por Evento.
 * Visible únicamente durante @media print (clase "print-only").
 */
export function PrintableEvaluationReport({ report }) {
  if (!report) return null;

  const {
    title,
    date,
    plantel,
    count,
    avg,
    audiences = [],
    questionStats = [],
    comments = [],
    filterNote = '',
  } = report;

  const issuedAt = new Date().toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="print-only bg-white text-slate-900 p-6 max-w-[820px] mx-auto"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
    >
      {/* Encabezado institucional */}
      <div className="flex items-center justify-between border-b-2 border-[#2B3890] pb-3 mb-4">
        <LogoImage type="esfer" className="h-12 w-auto object-contain" />
        <div className="text-center px-3">
          <div className="text-sm font-black uppercase tracking-wider text-[#1A235A]">
            ESFER SALESIANOS — Reporte de Evaluación
          </div>
          <div className="text-xs font-bold text-[#2B3890]">
            Departamento de Pastoral · Chihuahua
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Emitido el {issuedAt}</div>
        </div>
        <LogoImage type="pastoral" className="h-12 w-auto object-contain" />
      </div>

      {/* Datos del Evento y Resumen Ejecutivo */}
      <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#2B3890]">
              Actividad Evaluada
            </div>
            <h1 className="text-lg font-black text-slate-900 leading-tight mt-0.5">{title}</h1>
            <div className="text-xs text-slate-600 mt-1">
              <strong>Plantel:</strong> {plantel || 'General'}
              {date ? (
                <>
                  {' '}
                  · <strong>Fecha:</strong> {date}
                </>
              ) : null}
              {filterNote ? (
                <>
                  {' '}
                  · <strong>Filtro:</strong> {filterNote}
                </>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center rounded-lg border border-slate-300 bg-white px-3 py-1.5">
              <div className="text-[9px] font-bold uppercase text-slate-500">Respuestas</div>
              <div className="text-lg font-black text-[#1A235A]">{count}</div>
            </div>
            <div className="text-center rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5">
              <div className="text-[9px] font-bold uppercase text-amber-800">Promedio</div>
              <div className="text-lg font-black text-amber-900">{avg} / 5</div>
            </div>
          </div>
        </div>
      </div>

      {/* Desglose por Destinatario */}
      {audiences.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#1A235A] mb-2">
            1. Participación por Destinatario
          </h2>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#2B3890] text-white">
                <th className="border border-slate-300 px-3 py-1.5 text-left font-bold">
                  Destinatario / Perfil
                </th>
                <th className="border border-slate-300 px-3 py-1.5 text-center font-bold w-28">
                  Respuestas
                </th>
                <th className="border border-slate-300 px-3 py-1.5 text-center font-bold w-28">
                  Promedio (1–5)
                </th>
              </tr>
            </thead>
            <tbody>
              {audiences.map((aud) => (
                <tr key={aud.label} className="even:bg-slate-50">
                  <td className="border border-slate-300 px-3 py-1.5 font-semibold text-slate-800">
                    {aud.label}
                  </td>
                  <td className="border border-slate-300 px-3 py-1.5 text-center font-bold">
                    {aud.count}
                  </td>
                  <td className="border border-slate-300 px-3 py-1.5 text-center font-black text-[#2B3890]">
                    {aud.avg} / 5
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Gráficas por Pregunta */}
      {questionStats.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#1A235A] mb-2.5">
            2. Resultados y Gráficas por Pregunta
          </h2>
          <div className="space-y-3">
            {questionStats.map((q, idx) => (
              <div
                key={q.key}
                className="rounded-lg border border-slate-300 p-3 break-inside-avoid"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {idx + 1}. {q.text}
                    </div>
                    {q.criteria && (
                      <div className="text-[9.5px] font-bold text-[#2B3890] mt-0.5">
                        Criterio: {q.criteria}
                      </div>
                    )}
                  </div>
                  {q.type === 'rating' && (
                    <span className="text-xs font-black text-[#2B3890] shrink-0">
                      {q.avg} / 5 ({q.total})
                    </span>
                  )}
                  {q.type === 'yesno' && (
                    <span className="text-xs font-black text-emerald-700 shrink-0">
                      Sí {q.yesPct}% · No {q.noPct}%
                    </span>
                  )}
                </div>

                {q.type === 'rating' && (
                  <div className="space-y-1.5">
                    <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-[#2B3890] rounded-full"
                        style={{ width: `${Math.min(100, Math.round((Number(q.avg) / 5) * 100))}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3 text-[10px] text-slate-600">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <span key={star}>
                          <strong>{star}★:</strong> {q.distribution[star] || 0} (
                          {q.total ? Math.round(((q.distribution[star] || 0) / q.total) * 100) : 0}
                          %)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {q.type === 'yesno' && (
                  <div className="space-y-1">
                    <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-600"
                        style={{ width: `${q.yesPct}%` }}
                      />
                      <div
                        className="h-full bg-rose-500"
                        style={{ width: `${q.noPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                      <span>
                        Sí: {q.yesCount} ({q.yesPct}%)
                      </span>
                      <span>
                        No: {q.noCount} ({q.noPct}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comentarios y Sugerencias */}
      {comments.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#1A235A] mb-2">
            3. Comentarios y Sugerencias ({comments.length})
          </h2>
          <div className="space-y-2">
            {comments.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs break-inside-avoid"
              >
                <div className="text-[10px] font-bold text-[#2B3890]">
                  {c.audience} · {c.question}
                </div>
                <p className="text-slate-800 mt-0.5">“{c.comment}”</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pie institucional */}
      <div className="border-t border-slate-300 pt-2.5 mt-6 flex items-center justify-between text-[10px] text-slate-500">
        <span>ESFER Salesianos Chihuahua · Departamento de Pastoral</span>
        <span className="italic">
          Aguinaldo {AGUINALDO_ACTUAL.year}: «{AGUINALDO_ACTUAL.title}»
        </span>
      </div>
    </div>
  );
}
