import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Printer, Wrench } from 'lucide-react';
import { Modal } from '../common/Modal';
import { CARTA_PLANTEL_OPTIONS } from '../../constants/config';

const DEFAULT_MOBILIARIO = [
  { id: 'pf-1', material: 'Sillas', quantity: '', observations: '' },
  { id: 'pf-2', material: 'Mesas', quantity: '', observations: '' },
  { id: 'pf-3', material: 'Bocinas', quantity: '', observations: '' },
  { id: 'pf-4', material: 'Mantelería', quantity: 'NO', observations: 'NO' },
  { id: 'pf-5', material: 'Micrófonos', quantity: '', observations: '' },
  { id: 'pf-6', material: 'Templete', quantity: 'NO', observations: 'NO' },
];

function buildInitialSolicitud(carta) {
  if (!carta) return null;
  if (carta.plantaFisica) {
    return structuredClone(carta.plantaFisica);
  }
  const timeRange = [carta.startTime, carta.endTime].filter(Boolean).join(' - ');
  return {
    plantel: carta.plantel || 'Cordilleras',
    customPlantel: carta.customPlantel || '',
    date: carta.date || '',
    manager: carta.designer || '',
    location: carta.location || '',
    reason: carta.name || '',
    time: timeRange,
    items: DEFAULT_MOBILIARIO.map((item) => ({ ...item, id: `${item.id}-${Date.now()}` })),
    notes: '',
  };
}

export function PlantaFisicaModal({
  open,
  carta,
  restrictedPlantel,
  onClose,
  onSave,
  onPrint,
}) {
  const [form, setForm] = useState(() => buildInitialSolicitud(carta));

  useEffect(() => {
    if (open && carta) {
      setForm(buildInitialSolicitud(carta));
    }
  }, [open, carta]);

  if (!open || !carta || !form) return null;

  const updateItem = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: `pf-extra-${Date.now()}`, material: '', quantity: '', observations: '' },
      ],
    }));
  };

  const removeItem = (idx) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(carta.id, form);
    onClose();
  };

  const handlePrintNow = () => {
    onSave(carta.id, form);
    onPrint(form);
  };

  const plantelChoices = restrictedPlantel
    ? [restrictedPlantel, 'TSJB (Templo San Juan Bosco)', 'Otro']
    : CARTA_PLANTEL_OPTIONS;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Solicitud de eventos Planta Física"
      subtitle={`Vinculada a la Carta Descriptiva: ${carta.name || 'Sin título'}`}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Plantel desplegable + Datos del encabezado */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-pastoral uppercase tracking-wide">
            <Wrench className="h-4 w-4" />
            <span>Datos Generales del Evento</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                Plantel *
              </label>
              <select
                value={form.plantel}
                onChange={(e) =>
                  setForm({
                    ...form,
                    plantel: e.target.value,
                    customPlantel: e.target.value === 'Otro' ? form.customPlantel || '' : '',
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:border-pastoral"
              >
                {plantelChoices.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {form.plantel === 'Otro' && (
                <input
                  type="text"
                  required
                  value={form.customPlantel || ''}
                  onChange={(e) => setForm({ ...form, customPlantel: e.target.value })}
                  placeholder="Especifica sede o lugar externo"
                  className="mt-2 w-full rounded-xl border border-pastoral/40 bg-white px-3 py-2 text-sm"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                Fecha
              </label>
              <input
                type="text"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="Ej. 30 de septiembre / 2026-09-30"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                Encargado
              </label>
              <input
                type="text"
                value={form.manager}
                onChange={(e) => setForm({ ...form, manager: e.target.value })}
                placeholder="Nombre del encargado"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                Hora
              </label>
              <input
                type="text"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                placeholder="Ej. 11:00am - 12:00pm"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                Lugar
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ej. ESFER Salesianos Cordilleras Gimnasio"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                Motivo
              </label>
              <input
                type="text"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Nombre o motivo del evento"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Tabla de Mobiliario */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Mobiliario y Requerimientos
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3 py-1.5 text-xs font-bold transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Agregar material</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[540px]">
              <thead>
                <tr className="text-left text-[11px] font-extrabold text-slate-500 uppercase border-b border-slate-200">
                  <th className="py-2 pr-2 w-36">Material</th>
                  <th className="py-2 px-2 w-24">Cantidad</th>
                  <th className="py-2 px-2">Observaciones</th>
                  <th className="py-2 pl-2 w-9" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {form.items.map((row, idx) => (
                  <tr key={row.id || idx}>
                    <td className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={row.material}
                        onChange={(e) => updateItem(idx, 'material', e.target.value)}
                        placeholder="Ej. Sillas"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 focus:bg-white px-2.5 py-1.5 text-xs font-bold"
                      />
                    </td>
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        value={row.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        placeholder="Ej. 100 / NO"
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-center"
                      />
                    </td>
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        value={row.observations}
                        onChange={(e) => updateItem(idx, 'observations', e.target.value)}
                        placeholder="Indicaciones de acomodo o equipo"
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                      />
                    </td>
                    <td className="py-1.5 pl-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        aria-label="Eliminar material"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
            Notas adicionales para Planta Física
          </label>
          <textarea
            rows={2}
            value={form.notes || ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Horarios de montaje, acceso, extensiones eléctricas u otras indicaciones..."
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:border-pastoral"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handlePrintNow}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 text-xs font-extrabold shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Guardar e Imprimir</span>
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral hover:bg-pastoral-deep text-white px-5 py-2.5 text-xs font-extrabold shadow-sm"
          >
            <Save className="h-4 w-4" />
            <span>Guardar Solicitud</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
