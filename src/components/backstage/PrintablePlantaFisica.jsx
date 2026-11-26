import React from 'react';
import { LogoImage } from '../common/LogoImage';

/**
 * Vista de impresión dedicada para "Solicitud de eventos Planta Física" (Hoja Carta / @media print).
 * Maquetación fiel al formato oficial de ESFER Salesianos Chihuahua.
 */
export function PrintablePlantaFisica({ solicitud, embedded = false }) {
  if (!solicitud) return null;

  const displayPlantel =
    solicitud.plantel === 'Otro' && solicitud.customPlantel
      ? solicitud.customPlantel
      : solicitud.plantel;

  const items = solicitud.items || [];
  // Garantizar al menos 3 filas extra limpias si hay pocas, igual que el formato impreso
  const extraBlankRows = Math.max(0, 9 - items.length);

  return (
    <div
      className={`${embedded ? '' : 'print-only '}bg-white text-slate-900 text-[12px] leading-snug`}
      style={embedded ? { pageBreakBefore: 'always', breakBefore: 'page' } : undefined}
    >
      <table className="w-full border-collapse border border-slate-800">
        <tbody>
          {/* Encabezado de 3 columnas con ambos logos */}
          <tr>
            <td className="border border-slate-800 p-3 w-[28%] align-middle text-center">
              <div className="flex justify-center">
                <LogoImage type="esfer" className="h-14 w-auto" />
              </div>
            </td>
            <td className="border border-slate-800 p-3 w-[44%] align-middle text-center">
              <h1 className="text-[17px] font-bold text-slate-900 tracking-tight">
                Solicitud de eventos Planta Física
              </h1>
            </td>
            <td className="border border-slate-800 p-3 w-[28%] align-middle text-center">
              <div className="flex justify-center">
                <LogoImage type="pastoral" className="h-16 w-auto" />
              </div>
            </td>
          </tr>

          {/* Fila de Plantel centrada */}
          <tr>
            <td
              colSpan={3}
              className="border border-slate-800 py-2 px-3 text-center text-[15px] font-semibold text-slate-900"
            >
              {displayPlantel || 'ESFER Salesianos'}
            </td>
          </tr>

          {/* Espacio separador sutil como en el formato */}
          <tr>
            <td colSpan={3} className="border border-slate-800 h-5" />
          </tr>

          {/* Datos generales del evento */}
          <tr>
            <td className="border border-slate-800 px-3 py-1.5 font-semibold w-[22%]">Fecha</td>
            <td colSpan={2} className="border border-slate-800 px-3 py-1.5">
              {solicitud.date || ''}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-800 px-3 py-1.5 font-semibold">Encargado</td>
            <td colSpan={2} className="border border-slate-800 px-3 py-1.5">
              {solicitud.manager || ''}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-800 px-3 py-1.5 font-semibold">Lugar</td>
            <td colSpan={2} className="border border-slate-800 px-3 py-1.5">
              {solicitud.location || ''}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-800 px-3 py-1.5 font-semibold">Motivo</td>
            <td colSpan={2} className="border border-slate-800 px-3 py-1.5">
              {solicitud.reason || ''}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-800 px-3 py-1.5 font-semibold">Hora</td>
            <td colSpan={2} className="border border-slate-800 px-3 py-1.5">
              {solicitud.time || ''}
            </td>
          </tr>

          {/* Encabezado Mobiliario */}
          <tr>
            <td
              colSpan={3}
              className="border border-slate-800 py-1.5 px-3 text-center font-semibold bg-slate-50"
            >
              Mobiliario
            </td>
          </tr>

          {/* Columnas de Mobiliario */}
          <tr>
            <td className="border border-slate-800 px-3 py-1.5 font-semibold w-[22%]">Material</td>
            <td className="border border-slate-800 px-3 py-1.5 font-semibold w-[16%]">Cantidad</td>
            <td className="border border-slate-800 px-3 py-1.5 font-semibold w-[62%]">
              Observaciones
            </td>
          </tr>

          {items.map((item, idx) => (
            <tr key={item.id || idx}>
              <td className="border border-slate-800 px-3 py-1.5 font-medium">{item.material}</td>
              <td className="border border-slate-800 px-3 py-1.5 text-center">{item.quantity}</td>
              <td className="border border-slate-800 px-3 py-1.5">{item.observations}</td>
            </tr>
          ))}

          {Array.from({ length: extraBlankRows }).map((_, idx) => (
            <tr key={`blank-${idx}`}>
              <td className="border border-slate-800 px-3 py-2.5">&nbsp;</td>
              <td className="border border-slate-800 px-3 py-2.5">&nbsp;</td>
              <td className="border border-slate-800 px-3 py-2.5">&nbsp;</td>
            </tr>
          ))}

          {/* Encabezado Notas */}
          <tr>
            <td
              colSpan={3}
              className="border border-slate-800 py-1.5 px-3 text-center font-semibold bg-slate-50"
            >
              Notas
            </td>
          </tr>
          <tr>
            <td colSpan={3} className="border border-slate-800 px-3 py-3 min-h-[48px] align-top whitespace-pre-line">
              {solicitud.notes || '\u00A0'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
