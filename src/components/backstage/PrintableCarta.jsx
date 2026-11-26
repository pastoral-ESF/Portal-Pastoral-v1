import React from 'react';
import { LogoImage } from '../common/LogoImage';
import { getDimensionById, getSubdimensionById } from '../../constants/esaCatalog';
import { getPepsalAreaById, getPepsalRetoById } from '../../constants/pepsalCatalog';
import { PrintablePlantaFisica } from './PrintablePlantaFisica';

/**
 * Vista de impresión dedicada para Carta Descriptiva (Hoja Carta / @media print).
 * Se muestra únicamente al imprimir o exportar a PDF desde el navegador.
 */
export function PrintableCarta({ carta }) {
  if (!carta) return null;

  const dim = getDimensionById(carta.esaDimensionId);
  const sub = getSubdimensionById(carta.esaSubdimensionId);
  const pepsalArea = getPepsalAreaById(carta.pepsalAreaId);
  const pepsalReto = getPepsalRetoById(carta.pepsalRetoId);
  const displayPlantel =
    carta.plantel === 'Otro' && carta.customPlantel ? carta.customPlantel : carta.plantel;

  return (
    <div className="print-only bg-white text-slate-900 text-[11px] leading-snug">
      {/* Encabezado oficial */}
      <div className="flex items-center justify-between border-b-2 border-[#2B3890] pb-3 mb-4">
        <div className="flex items-center gap-3">
          <LogoImage type="esfer" className="h-12 w-auto" />
          <div>
            <h1 className="text-base font-black tracking-tight text-[#1A235A] uppercase">
              ESFER SALESIANOS — Carta descriptiva
            </h1>
            <p className="text-[10px] font-semibold text-slate-600">
              Departamento de Pastoral · Chihuahua, Chih.
            </p>
          </div>
        </div>
        <div className="text-right text-[10px] font-semibold text-slate-600">
          <div>
            <span className="font-bold text-slate-800">Plantel / Sede:</span> {displayPlantel}
          </div>
          <div>
            <span className="font-bold text-slate-800">Estatus:</span> {carta.status}
          </div>
          <div>
            <span className="font-bold text-slate-800">Calendario:</span>{' '}
            {carta.visibility === 'publico' ? 'Evento Público' : 'Evento Interno'}
          </div>
        </div>
      </div>

      {/* Tabla de Datos Generales */}
      <table className="w-full border border-slate-400 mb-4 print-avoid-break">
        <tbody>
          <tr>
            <td className="border border-slate-400 bg-slate-100 font-bold px-2.5 py-1.5 w-[22%]">
              NOMBRE DE LA EXPERIENCIA
            </td>
            <td className="border border-slate-400 px-2.5 py-1.5 font-extrabold text-xs" colSpan={3}>
              {carta.name}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 bg-slate-100 font-bold px-2.5 py-1.5">
              PLANTEL / SEDE
            </td>
            <td className="border border-slate-400 px-2.5 py-1.5 w-[28%]">{displayPlantel}</td>
            <td className="border border-slate-400 bg-slate-100 font-bold px-2.5 py-1.5 w-[20%]">
              FECHA Y HORARIO
            </td>
            <td className="border border-slate-400 px-2.5 py-1.5">
              {carta.date}
              {carta.endDate && carta.endDate > carta.date ? ` al ${carta.endDate}` : ''}
              {carta.startTime ? ` (${carta.startTime} - ${carta.endTime || ''})` : ''}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 bg-slate-100 font-bold px-2.5 py-1.5">LUGAR</td>
            <td className="border border-slate-400 px-2.5 py-1.5">{carta.location}</td>
            <td className="border border-slate-400 bg-slate-100 font-bold px-2.5 py-1.5">
              DISEÑA LA EXPERIENCIA
            </td>
            <td className="border border-slate-400 px-2.5 py-1.5">{carta.designer}</td>
          </tr>
          <tr>
            <td className="border border-slate-400 bg-slate-100 font-bold px-2.5 py-1.5">
              OBJETIVO
            </td>
            <td className="border border-slate-400 px-2.5 py-1.5" colSpan={3}>
              {carta.objective}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 bg-slate-100 font-bold px-2.5 py-1.5">
              VINCULACIÓN MODELO ESA
            </td>
            <td className="border border-slate-400 px-2.5 py-1.5" colSpan={3}>
              <strong>{dim ? dim.name : 'Sin asignar'}</strong>
              {sub ? ` — ${sub.name}` : ''}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 bg-slate-100 font-bold px-2.5 py-1.5">
              CONEXIÓN CON PEPSAL (CICLO 26-27)
            </td>
            <td className="border border-slate-400 px-2.5 py-1.5" colSpan={3}>
              <div>
                <strong>Dimensión CEP:</strong> {pepsalArea ? pepsalArea.name : 'Sin asignar'}
                {pepsalReto ? ` · Reto ${pepsalReto.number}: ${pepsalReto.title}` : ''}
              </div>
              {carta.pepsalIntervention && (
                <div className="mt-0.5">
                  <strong>Intervención:</strong> {carta.pepsalIntervention}
                </div>
              )}
              {carta.pepsalObjective && (
                <div className="mt-0.5 text-slate-700">
                  <strong>Enfoque:</strong> {carta.pepsalObjective}
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* HORARIO DE LA ACTIVIDAD */}
      <div className="mb-4 print-avoid-break">
        <div className="bg-[#2B3890] text-white font-extrabold uppercase tracking-wide px-3 py-1.5 text-[11px]">
          HORARIO DE LA ACTIVIDAD
        </div>
        <table className="w-full border border-slate-400">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="border border-slate-400 px-2.5 py-1.5 w-[16%]">Hora</th>
              <th className="border border-slate-400 px-2.5 py-1.5 w-[42%]">¿Qué sucede?</th>
              <th className="border border-slate-400 px-2.5 py-1.5 w-[21%]">¿Dónde?</th>
              <th className="border border-slate-400 px-2.5 py-1.5 w-[21%]">Responsable</th>
            </tr>
          </thead>
          <tbody>
            {(carta.schedule || []).map((row, idx) => (
              <tr key={row.id || idx}>
                <td className="border border-slate-400 px-2.5 py-1.5 font-semibold">{row.time}</td>
                <td className="border border-slate-400 px-2.5 py-1.5">{row.what}</td>
                <td className="border border-slate-400 px-2.5 py-1.5">{row.where}</td>
                <td className="border border-slate-400 px-2.5 py-1.5">{row.responsible}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* COMISIONES */}
      <div className="mb-6">
        <div className="bg-[#1A235A] text-white font-extrabold uppercase tracking-wide px-3 py-1.5 text-[11px]">
          COMISIONES
        </div>
        <table className="w-full border border-slate-400">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="border border-slate-400 px-2.5 py-1.5 w-[22%]">¿Qué?</th>
              <th className="border border-slate-400 px-2.5 py-1.5 w-[20%]">
                Responsable (¿Quién?)
              </th>
              <th className="border border-slate-400 px-2.5 py-1.5 w-[34%]">Proceso (¿Cómo?)</th>
              <th className="border border-slate-400 px-2.5 py-1.5 w-[24%]">
                Material (¿Con qué?)
              </th>
            </tr>
          </thead>
          <tbody>
            {(carta.commissions || []).map((row, idx) => (
              <tr key={row.id || idx} className="print-avoid-break">
                <td className="border border-slate-400 px-2.5 py-1.5 font-bold bg-slate-50">
                  {row.what}
                </td>
                <td className="border border-slate-400 px-2.5 py-1.5">{row.who}</td>
                <td className="border border-slate-400 px-2.5 py-1.5">{row.how}</td>
                <td className="border border-slate-400 px-2.5 py-1.5">{row.material}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Firmas */}
      <div className="grid grid-cols-2 gap-12 pt-8 print-avoid-break">
        <div className="text-center">
          <div className="border-t border-slate-500 pt-1.5 font-bold">
            {carta.designer || 'Diseña la experiencia'}
          </div>
          <div className="text-[10px] text-slate-500">Responsable de Planeación</div>
        </div>
        <div className="text-center">
          <div className="border-t border-slate-500 pt-1.5 font-bold">
            Vo. Bo. Departamento de Pastoral / Dirección
          </div>
          <div className="text-[10px] text-slate-500">
            ESFER Salesianos Chihuahua
            {carta.approvedBy ? ` · Aprobada por ${carta.approvedBy}` : ''}
          </div>
        </div>
      </div>

      {/* Hoja 2 automática: Solicitud de Planta Física (si la actividad la requiere) */}
      {carta.plantaFisica && carta.plantaFisica.enabled !== false && (
        <PrintablePlantaFisica
          embedded
          solicitud={{
            plantel: carta.plantaFisica.plantel || carta.plantel,
            customPlantel: carta.plantaFisica.customPlantel || carta.customPlantel || '',
            date:
              carta.plantaFisica.date ||
              (carta.endDate && carta.endDate > carta.date
                ? `${carta.date} al ${carta.endDate}`
                : carta.date || ''),
            manager:
              carta.plantaFisica.manager || carta.responsibleName || carta.designer || '',
            location: carta.plantaFisica.location || carta.location || '',
            reason: carta.plantaFisica.reason || carta.name || '',
            time:
              carta.plantaFisica.time ||
              [carta.startTime, carta.endTime].filter(Boolean).join(' - '),
            items: carta.plantaFisica.items || [],
            notes: carta.plantaFisica.notes || '',
          }}
        />
      )}
    </div>
  );
}
