import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Printer,
  Edit3,
  Eye,
  Lock,
  ArrowLeft,
  Clock,
  ClipboardList,
  BookMarked,
  ExternalLink,
  CheckCircle2,
  Wrench,
  Copy,
  CheckSquare,
  Paperclip,
  UserCheck,
} from 'lucide-react';
import { PlantaFisicaModal } from './PlantaFisicaModal';
import { Modal } from '../common/Modal';
import { authService } from '../../services/authService';
import {
  CARTA_PLANTEL_OPTIONS,
  ACTIVITY_STATUSES,
  DEFAULT_COMMISSIONS,
  PLANTEL_BADGE_STYLES,
  STATUS_STYLES,
} from '../../constants/config';
import { ESA_DIMENSIONS, getDimensionById } from '../../constants/esaCatalog';
import {
  PEPSAL_AREAS,
  PEPSAL_RETOS,
  getPepsalAreaById,
} from '../../constants/pepsalCatalog';

const RESOURCE_TYPES = [
  'PDF / Documento',
  'Imagen / Póster',
  'Infografía',
  'Presentación / Carpeta',
  'Video / Multimedia',
];

const DEFAULT_MOBILIARIO = [
  { id: 'pf-1', material: 'Sillas', quantity: '', observations: '' },
  { id: 'pf-2', material: 'Mesas', quantity: '', observations: '' },
  { id: 'pf-3', material: 'Bocinas', quantity: '', observations: '' },
  { id: 'pf-4', material: 'Mantelería', quantity: 'NO', observations: 'NO' },
  { id: 'pf-5', material: 'Micrófonos', quantity: '', observations: '' },
  { id: 'pf-6', material: 'Templete', quantity: 'NO', observations: 'NO' },
];

function createDefaultPlantaFisica(cartaLike = {}) {
  const timeRange = [cartaLike.startTime, cartaLike.endTime].filter(Boolean).join(' - ');
  return {
    enabled: false,
    plantel: cartaLike.plantel || 'Glandorff',
    customPlantel: cartaLike.customPlantel || '',
    date: cartaLike.date || '',
    manager: cartaLike.responsibleName || cartaLike.designer || '',
    location: cartaLike.location || '',
    reason: cartaLike.name || '',
    time: timeRange,
    items: DEFAULT_MOBILIARIO.map((item) => ({ ...item, id: `${item.id}-${Date.now()}` })),
    notes: '',
  };
}

function createBlankCarta(defaultPepsalAreaId = 'PEPSAL-FE', defaultPlantel = 'Glandorff') {
  const defaultArea = getPepsalAreaById(defaultPepsalAreaId) || PEPSAL_AREAS[0];
  return {
    id: null,
    plantel: defaultPlantel || 'Glandorff',
    customPlantel: '',
    date: new Date().toISOString().slice(0, 10),
    endDate: '',
    startTime: '09:00',
    endTime: '12:00',
    name: '',
    location: '',
    designer: '',
    responsibleName: '',
    responsibleNames: [],
    objective: '',
    esaDimensionId: 'D3',
    esaSubdimensionId: '3.2',
    pepsalAreaId: defaultArea.id,
    pepsalIntervention: defaultArea.interventions[0] || '',
    pepsalRetoId: 'R01',
    pepsalObjective: '',
    visibility: 'publico',
    status: 'En planeación',
    schedule: [
      { id: `sch-${Date.now()}-1`, time: '09:00 - 09:30', what: '', where: '', responsible: '' },
    ],
    commissions: DEFAULT_COMMISSIONS.map((c) => ({ ...c, id: `${c.id}-${Date.now()}` })),
    plantaFisica: createDefaultPlantaFisica({ plantel: defaultPlantel || 'Glandorff' }),
    resources: [],
  };
}

function buildFormFromIntent(intent, restrictedPlantel) {
  if (!intent || intent === 'NEW') {
    return createBlankCarta('PEPSAL-FE', restrictedPlantel || 'Glandorff');
  }
  if (intent.presetPepsalAreaId) {
    return createBlankCarta(intent.presetPepsalAreaId, restrictedPlantel || 'Glandorff');
  }
  if (intent.presetFromEvent) {
    const ev = intent.presetFromEvent;
    const base = createBlankCarta(
      'PEPSAL-FE',
      restrictedPlantel || ev.plantel || 'Glandorff'
    );
    return {
      ...base,
      name: ev.title || '',
      date: ev.date || base.date,
      endDate: ev.endDate || '',
      startTime: ev.startTime || '09:00',
      endTime: ev.endTime || '12:00',
      location: ev.location || '',
      objective: ev.description || '',
      visibility: ev.visibility || 'interno',
      category: ev.category || 'Pastoral',
      linkedQuickEventId: ev.id,
    };
  }
  const cloned = structuredClone(intent);
  const existingCommissions =
    Array.isArray(cloned.commissions) && cloned.commissions.length > 0
      ? cloned.commissions
      : DEFAULT_COMMISSIONS.map((c) => ({ ...c, id: `${c.id}-${Date.now()}` }));

  // Si es una carta guardada antes de agregar "AVISO A COMUNICACIÓN", la insertamos automáticamente
  const hasAvisoCom = existingCommissions.some((row) =>
    String(row.what || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .includes('aviso a comunicacion')
  );
  const finalCommissions = hasAvisoCom
    ? existingCommissions
    : [
        ...existingCommissions.slice(0, 1),
        { id: `com-aviso-${Date.now()}`, what: 'AVISO A COMUNICACIÓN', who: '', how: '', material: '' },
        ...existingCommissions.slice(1),
      ];

  const parsedResponsibles = Array.isArray(cloned.responsibleNames) && cloned.responsibleNames.length > 0
    ? cloned.responsibleNames
    : cloned.responsibleName
    ? String(cloned.responsibleName)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    ...createBlankCarta('PEPSAL-FE', restrictedPlantel || 'Glandorff'),
    ...cloned,
    responsibleNames: parsedResponsibles,
    responsibleName: parsedResponsibles.join(', '),
    schedule:
      Array.isArray(cloned.schedule) && cloned.schedule.length > 0
        ? cloned.schedule
        : [{ id: `sch-${Date.now()}-1`, time: '09:00 - 09:30', what: '', where: '', responsible: '' }],
    commissions: finalCommissions,
    plantaFisica: cloned.plantaFisica
      ? {
          ...createDefaultPlantaFisica(cloned),
          ...cloned.plantaFisica,
          enabled: cloned.plantaFisica.enabled !== false,
          items:
            Array.isArray(cloned.plantaFisica.items) && cloned.plantaFisica.items.length > 0
              ? cloned.plantaFisica.items
              : DEFAULT_MOBILIARIO.map((item) => ({ ...item, id: `${item.id}-${Date.now()}` })),
        }
      : createDefaultPlantaFisica(cloned),
    resources: Array.isArray(cloned.resources) ? cloned.resources : [],
  };
}

export function CartaPlannerView({
  cartas,
  pepsalDoc,
  restrictedPlantel,
  initialEditingCarta,
  onClearInitialEdit,
  onSaveCarta,
  onApproveCarta,
  onSavePlantaFisica,
  onPrintPlantaFisica,
  onOpenEvaluation,
  onDeriveTask,
  eventEvaluationConfigs = {},
  onDeleteCarta,
  onPrintCarta,
  onOpenPepsalTab,
}) {
  const [mode, setMode] = useState(initialEditingCarta ? 'form' : 'list'); // 'list' | 'form'
  const [statusFilter, setStatusFilter] = useState('Todas'); // 'Todas' | 'En planeación' | 'Aprobado' | 'Realizado'
  const [plantelFilter, setPlantelFilter] = useState('Todos');
  const [plantaFisicaCarta, setPlantaFisicaCarta] = useState(null);
  const [duplicatingCarta, setDuplicatingCarta] = useState(null);
  const [targetPlanteles, setTargetPlanteles] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [form, setForm] = useState(() =>
    buildFormFromIntent(initialEditingCarta, restrictedPlantel)
  );

  useEffect(() => {
    authService
      .listUsers()
      .then((list) => setTeamUsers(list || []))
      .catch(() => setTeamUsers([]));
  }, []);

  const openDuplicateModal = (carta) => {
    const corePlanteles = ['Glandorff', 'Kennedy', 'Cordilleras'];
    const suggested = restrictedPlantel
      ? [restrictedPlantel]
      : corePlanteles.filter((p) => p !== carta.plantel);
    setTargetPlanteles(suggested.length ? suggested : ['Kennedy']);
    setDuplicatingCarta(carta);
  };

  const toggleTargetPlantel = (plantel) => {
    setTargetPlanteles((prev) =>
      prev.includes(plantel) ? prev.filter((p) => p !== plantel) : [...prev, plantel]
    );
  };

  const handleConfirmDuplicate = (e) => {
    e.preventDefault();
    if (!duplicatingCarta || targetPlanteles.length === 0) return;

    const now = Date.now();
    targetPlanteles.forEach((plantel, idx) => {
      const {
        id: _oldId,
        approvedBy: _approvedBy,
        approvedAt: _approvedAt,
        plantaFisica: _plantaFisica,
        evaluation: _evaluation,
        linkedQuickEventId: _linkedId,
        ...rest
      } = duplicatingCarta;

      onSaveCarta({
        ...rest,
        id: null,
        plantel,
        customPlantel: '',
        status: 'En planeación',
        schedule: (duplicatingCarta.schedule || []).map((row, rIdx) => ({
          ...row,
          id: `sch-${now}-${idx}-${rIdx}`,
        })),
        commissions: (duplicatingCarta.commissions || []).map((row, cIdx) => ({
          ...row,
          id: `com-${now}-${idx}-${cIdx}`,
        })),
      });
    });

    setDuplicatingCarta(null);
    setTargetPlanteles([]);
  };

  useEffect(() => {
    if (initialEditingCarta) {
      setForm(buildFormFromIntent(initialEditingCarta, restrictedPlantel));
      setMode('form');
      if (onClearInitialEdit) onClearInitialEdit();
    }
  }, [initialEditingCarta, onClearInitialEdit, restrictedPlantel]);

  const currentDimension = getDimensionById(form.esaDimensionId) || ESA_DIMENSIONS[0];
  const currentPepsalArea = getPepsalAreaById(form.pepsalAreaId) || PEPSAL_AREAS[0];

  const handleDimensionChange = (dimId) => {
    const dim = getDimensionById(dimId);
    setForm((prev) => ({
      ...prev,
      esaDimensionId: dimId,
      esaSubdimensionId: dim?.subdimensions[0]?.id || '',
    }));
  };

  const handlePepsalAreaChange = (areaId) => {
    const area = getPepsalAreaById(areaId);
    setForm((prev) => ({
      ...prev,
      pepsalAreaId: areaId,
      pepsalIntervention: area?.interventions[0] || '',
    }));
  };

  const addScheduleRow = () => {
    setForm((prev) => ({
      ...prev,
      schedule: [
        ...prev.schedule,
        { id: `sch-${Date.now()}`, time: '', what: '', where: '', responsible: '' },
      ],
    }));
  };

  const updateScheduleRow = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    }));
  };

  const removeScheduleRow = (idx) => {
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== idx),
    }));
  };

  const addCommissionRow = () => {
    setForm((prev) => ({
      ...prev,
      commissions: [
        ...prev.commissions,
        { id: `com-extra-${Date.now()}`, what: 'OTRO', who: '', how: '', material: '' },
      ],
    }));
  };

  const updateCommissionRow = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      commissions: prev.commissions.map((row, i) =>
        i === idx ? { ...row, [field]: value } : row
      ),
    }));
  };

  const removeCommissionRow = (idx) => {
    setForm((prev) => ({
      ...prev,
      commissions: prev.commissions.filter((_, i) => i !== idx),
    }));
  };

  const togglePlantaFisicaEnabled = (checked) => {
    setForm((prev) => {
      const currentPf = prev.plantaFisica || createDefaultPlantaFisica(prev);
      const timeRange = [prev.startTime, prev.endTime].filter(Boolean).join(' - ');
      return {
        ...prev,
        plantaFisica: {
          ...currentPf,
          enabled: checked,
          plantel: currentPf.plantel || prev.plantel,
          customPlantel: currentPf.customPlantel || prev.customPlantel || '',
          date:
            currentPf.date ||
            (prev.endDate && prev.endDate > prev.date
              ? `${prev.date} al ${prev.endDate}`
              : prev.date || ''),
          manager: currentPf.manager || prev.responsibleName || prev.designer || '',
          location: currentPf.location || prev.location || '',
          reason: currentPf.reason || prev.name || '',
          time: currentPf.time || timeRange,
        },
      };
    });
  };

  const updatePlantaFisicaField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      plantaFisica: {
        ...(prev.plantaFisica || createDefaultPlantaFisica(prev)),
        [field]: value,
      },
    }));
  };

  const updatePlantaFisicaItem = (index, field, value) => {
    setForm((prev) => {
      const currentPf = prev.plantaFisica || createDefaultPlantaFisica(prev);
      return {
        ...prev,
        plantaFisica: {
          ...currentPf,
          items: (currentPf.items || []).map((row, i) =>
            i === index ? { ...row, [field]: value } : row
          ),
        },
      };
    });
  };

  const addPlantaFisicaItem = () => {
    setForm((prev) => {
      const currentPf = prev.plantaFisica || createDefaultPlantaFisica(prev);
      return {
        ...prev,
        plantaFisica: {
          ...currentPf,
          items: [
            ...(currentPf.items || []),
            { id: `pf-extra-${Date.now()}`, material: '', quantity: '', observations: '' },
          ],
        },
      };
    });
  };

  const removePlantaFisicaItem = (index) => {
    setForm((prev) => {
      const currentPf = prev.plantaFisica || createDefaultPlantaFisica(prev);
      return {
        ...prev,
        plantaFisica: {
          ...currentPf,
          items: (currentPf.items || []).filter((_, i) => i !== index),
        },
      };
    });
  };

  const addResourceRow = () => {
    setForm((prev) => ({
      ...prev,
      resources: [
        ...(prev.resources || []),
        {
          id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          title: '',
          type: 'PDF / Documento',
          url: '',
        },
      ],
    }));
  };

  const updateResourceRow = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      resources: (prev.resources || []).map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      ),
    }));
  };

  const removeResourceRow = (index) => {
    setForm((prev) => ({
      ...prev,
      resources: (prev.resources || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const pf = form.plantaFisica;
    const timeRange = [form.startTime, form.endTime].filter(Boolean).join(' - ');
    const cleanedCarta = {
      ...form,
      plantaFisica: pf?.enabled
        ? {
            ...pf,
            enabled: true,
            plantel: pf.plantel || form.plantel,
            customPlantel: pf.customPlantel || form.customPlantel || '',
            date:
              pf.date ||
              (form.endDate && form.endDate > form.date
                ? `${form.date} al ${form.endDate}`
                : form.date || ''),
            manager: pf.manager || form.responsibleName || form.designer || '',
            location: pf.location || form.location || '',
            reason: pf.reason || form.name || '',
            time: pf.time || timeRange,
          }
        : null,
    };
    onSaveCarta(cleanedCarta);
    setMode('list');
  };

  if (mode === 'list') {
    const plantelScoped =
      !restrictedPlantel && plantelFilter !== 'Todos'
        ? cartas.filter((c) => {
            const p = c.plantel === 'Otro' && c.customPlantel ? c.customPlantel : c.plantel;
            return p === plantelFilter;
          })
        : cartas;

    const sortByNearestDate = (a, b) => {
      const da = a.date || '9999-12-31';
      const db = b.date || '9999-12-31';
      if (da !== db) return da.localeCompare(db);
      return (a.startTime || '').localeCompare(b.startTime || '');
    };

    const sortByMostRecentDate = (a, b) => {
      const da = a.date || '';
      const db = b.date || '';
      if (da !== db) return db.localeCompare(da);
      return (b.startTime || '').localeCompare(a.startTime || '');
    };

    const planningCartas = plantelScoped
      .filter((c) => (c.status || 'En planeación') === 'En planeación')
      .sort(sortByNearestDate);
    const approvedCartas = plantelScoped
      .filter((c) => c.status === 'Aprobado')
      .sort(sortByNearestDate);
    const doneCartas = plantelScoped
      .filter((c) => c.status === 'Realizado')
      .sort(sortByMostRecentDate);

    const statusSections = [
      {
        status: 'En planeación',
        title: 'En planeación (Pendientes de aprobación)',
        dot: 'bg-amber-400',
        badge: 'bg-amber-100 text-amber-900 border-amber-200',
        cardClass: 'bg-white border-amber-200/90 border-l-4 border-l-amber-400 shadow-card',
        items: planningCartas,
      },
      {
        status: 'Aprobado',
        title: 'Aprobadas (Listas para ejecutarse)',
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-200',
        cardClass: 'bg-white border-emerald-200/90 border-l-4 border-l-emerald-500 shadow-card',
        items: approvedCartas,
      },
      {
        status: 'Realizado',
        title: 'Realizadas (Histórico del ciclo)',
        dot: 'bg-slate-400',
        badge: 'bg-slate-200 text-slate-700 border-slate-300',
        cardClass: 'bg-slate-50/90 border-slate-200 border-l-4 border-l-slate-400 opacity-90',
        items: doneCartas,
      },
    ].filter((sec) =>
      statusFilter === 'Todas' ? sec.items.length > 0 : sec.status === statusFilter
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Planeador de Actividades (Cartas Descriptivas)
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Formato oficial ESFER Salesianos con vinculación ESA, PEPSAL e impresión lista para
              PDF.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setForm(createBlankCarta('PEPSAL-FE', restrictedPlantel || 'Glandorff'));
              setMode('form');
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-sm px-5 py-3 shadow-sm transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Carta Descriptiva</span>
          </button>
        </div>

        {/* Barra de filtros por Estatus y Plantel */}
        <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'Todas', label: `Todas (${plantelScoped.length})`, dot: 'bg-pastoral' },
              {
                id: 'En planeación',
                label: `En planeación (${planningCartas.length})`,
                dot: 'bg-amber-400',
              },
              {
                id: 'Aprobado',
                label: `Aprobadas (${approvedCartas.length})`,
                dot: 'bg-emerald-500',
              },
              {
                id: 'Realizado',
                label: `Realizadas (${doneCartas.length})`,
                dot: 'bg-slate-400',
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-extrabold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-pastoral text-white border-pastoral shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-pastoral/40'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    statusFilter === tab.id ? 'bg-white' : tab.dot
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {!restrictedPlantel && (
            <div className="flex flex-wrap items-center gap-1.5">
              {['Todos', 'Glandorff', 'Kennedy', 'Cordilleras', 'General'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlantelFilter(p)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                    plantelFilter === p
                      ? 'bg-pastoral-deep text-white border-pastoral-deep'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-pastoral/40'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {statusSections.length === 0 || statusSections.every((s) => s.items.length === 0) ? (
          <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center space-y-2">
            <FileText className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-800">
              No hay Cartas Descriptivas en esta vista
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Pulsa <strong>Nueva Carta Descriptiva</strong> o cambia el filtro de estatus/plantel.
            </p>
          </div>
        ) : (
          <div className="space-y-7">
            {statusSections.map((sec) => (
              <section key={sec.status} className="space-y-3">
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-3 w-3 rounded-full ${sec.dot}`} />
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      {sec.title}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-0.5 text-xs font-extrabold ${sec.badge}`}
                  >
                    {sec.items.length} {sec.items.length === 1 ? 'carta' : 'cartas'}
                  </span>
                </div>

                {sec.items.length === 0 ? (
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center text-xs text-slate-500">
                    No hay cartas con estatus “{sec.status}”.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sec.items.map((c) => {
            const dim = getDimensionById(c.esaDimensionId);
            const pepsalArea = getPepsalAreaById(c.pepsalAreaId);
            return (
              <article
                key={c.id}
                className={`rounded-3xl border p-5 flex flex-col justify-between gap-4 transition-all ${sec.cardClass}`}
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                        PLANTEL_BADGE_STYLES[c.plantel] || PLANTEL_BADGE_STYLES.Otro
                      }`}
                    >
                      {c.plantel === 'Otro' && c.customPlantel ? c.customPlantel : c.plantel}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                        STATUS_STYLES[c.status] || STATUS_STYLES['En planeación']
                      }`}
                    >
                      {c.status}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        c.visibility === 'publico'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.visibility === 'publico' ? (
                        <>
                          <Eye className="h-3 w-3" /> Público
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" /> Interno
                        </>
                      )}
                    </span>
                    {c.plantaFisica && c.plantaFisica.enabled !== false && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-0.5 text-[11px] font-bold">
                        <Wrench className="h-3 w-3" /> Con Planta Física
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-extrabold text-slate-900 leading-snug">{c.name}</h2>
                  <p className="text-xs text-slate-600 line-clamp-2">{c.objective}</p>

                  <div className="text-xs text-slate-500 space-y-1 pt-1">
                    <div>
                      <strong className="text-slate-700">Fecha:</strong> {c.date}
                      {c.endDate && c.endDate > c.date ? ` → ${c.endDate}` : ''}{' '}
                      {c.startTime ? `(${c.startTime} - ${c.endTime || ''})` : ''}
                    </div>
                    <div>
                      <strong className="text-slate-700">Lugar:</strong> {c.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-pastoral shrink-0" />
                      <span>
                        <strong className="text-slate-700">Responsable:</strong>{' '}
                        <span className="font-bold text-pastoral-deep">
                          {c.responsibleName || c.designer || 'Sin asignar'}
                        </span>
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-700">ESA:</strong>{' '}
                      {dim ? dim.shortName : 'Sin asignar'} ({c.esaSubdimensionId || '-'})
                    </div>
                    <div>
                      <strong className="text-slate-700">PEPSAL:</strong>{' '}
                      {pepsalArea ? pepsalArea.shortName : 'Sin asignar'}
                      {c.pepsalObjective ? ` · ${c.pepsalObjective}` : ''}
                    </div>
                  </div>

                  {/* Recursos / Anexos con acceso en 1 clic */}
                  {Array.isArray(c.resources) &&
                    c.resources.filter((r) => (r.url || '').trim()).length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        {c.resources
                          .filter((r) => (r.url || '').trim())
                          .map((r, rIdx) => (
                            <a
                              key={r.id || rIdx}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white border border-pastoral/20 px-3 py-1 text-[11px] font-bold transition-colors"
                              title={`Abrir ${r.type || 'recurso'}: ${r.url}`}
                            >
                              <Paperclip className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[200px]">
                                {r.title || r.type || 'Recurso'}
                              </span>
                              <ExternalLink className="h-3 w-3 shrink-0 opacity-75" />
                            </a>
                          ))}
                      </div>
                    )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForm(buildFormFromIntent(c, restrictedPlantel));
                        setMode('form');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 text-xs font-bold transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    {c.status === 'En planeación' && onApproveCarta && (
                      <button
                        type="button"
                        onClick={() => onApproveCarta(c.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-extrabold transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Aprobar Carta
                      </button>
                    )}
                    {c.status === 'Aprobado' && (
                      <button
                        type="button"
                        onClick={() => onSaveCarta({ ...c, status: 'Realizado' })}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-extrabold transition-colors shadow-sm"
                        title="Marcar esta actividad como ya realizada / desarrollada"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Marcar Realizada
                      </button>
                    )}
                    {onOpenEvaluation && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenEvaluation({
                            id: c.id,
                            title: c.name,
                            date: c.date,
                            plantel: c.plantel === 'Otro' && c.customPlantel ? c.customPlantel : c.plantel,
                            esaDimensionId: c.esaDimensionId,
                            pepsalAreaId: c.pepsalAreaId,
                          })
                        }
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                          eventEvaluationConfigs[c.id]?.enabled
                            ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                            : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        }`}
                        title="Enlace y QR de evaluación para participantes"
                      >
                        <ClipboardList className="h-3.5 w-3.5 text-pastoral" />
                        <span>
                          {eventEvaluationConfigs[c.id]?.enabled ? 'Evaluación ✓' : 'Evaluación'}
                        </span>
                      </button>
                    )}
                    {onDeriveTask && (
                      <button
                        type="button"
                        onClick={() =>
                          onDeriveTask({
                            id: c.id,
                            title: `Carta Descriptiva: ${c.name}`,
                            date: c.date,
                            plantel:
                              c.plantel === 'Otro' && c.customPlantel
                                ? c.customPlantel
                                : c.plantel,
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 px-3 py-1.5 text-xs font-bold transition-colors"
                        title="Asignar esta Carta Descriptiva como pendiente a un agente o a ti mismo"
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>Derivar pendiente</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openDuplicateModal(c)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-pastoral/5 border border-slate-300 hover:border-pastoral/40 text-slate-700 hover:text-pastoral px-3 py-1.5 text-xs font-bold transition-colors"
                      title="Duplicar esta Carta Descriptiva para otros planteles"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Duplicar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onPrintCarta(c)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral hover:bg-pastoral-deep text-white px-3 py-1.5 text-xs font-bold transition-colors"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Imprimir
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteCarta(c.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Eliminar carta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {c.approvedBy && (
                  <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Aprobada por {c.approvedBy}</span>
                  </div>
                )}
              </article>
            );
          })}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        <PlantaFisicaModal
          open={Boolean(plantaFisicaCarta)}
          carta={plantaFisicaCarta}
          restrictedPlantel={restrictedPlantel}
          onClose={() => setPlantaFisicaCarta(null)}
          onSave={(cartaId, solicitud) => {
            if (onSavePlantaFisica) onSavePlantaFisica(cartaId, solicitud);
          }}
          onPrint={(solicitud) => {
            if (onPrintPlantaFisica) onPrintPlantaFisica(solicitud);
          }}
        />

        {/* Modal Duplicar Carta para otro(s) plantel(es) */}
        <Modal
          open={Boolean(duplicatingCarta)}
          onClose={() => setDuplicatingCarta(null)}
          title="Duplicar Carta para otro(s) plantel(es)"
          subtitle={duplicatingCarta ? `${duplicatingCarta.name} (Origen: ${duplicatingCarta.plantel})` : ''}
          maxWidth="max-w-md"
        >
          {duplicatingCarta && (
            <form onSubmit={handleConfirmDuplicate} className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Se copiará el objetivo, horario, comisiones, ESA y PEPSAL en estado{' '}
                <strong>En planeación</strong> (sin copiar la aprobación ni la Planta Física para
                que cada plantel llene los suyos).
              </p>

              <div className="space-y-2">
                <div className="text-xs font-extrabold text-slate-700 uppercase">
                  Selecciona el/los planteles destino:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(restrictedPlantel
                    ? [restrictedPlantel, 'TSJB (Templo San Juan Bosco)']
                    : ['Glandorff', 'Kennedy', 'Cordilleras', 'General', 'TSJB (Templo San Juan Bosco)']
                  ).map((p) => {
                    const checked = targetPlanteles.includes(p);
                    return (
                      <label
                        key={p}
                        className={`flex items-center gap-2 rounded-2xl border p-3 cursor-pointer text-xs font-bold transition-all ${
                          checked
                            ? 'bg-pastoral/5 border-pastoral text-pastoral-deep ring-1 ring-pastoral/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-pastoral/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTargetPlantel(p)}
                          className="rounded border-slate-300 text-pastoral focus:ring-pastoral"
                        />
                        <span className="truncate">{p}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDuplicatingCarta(null)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={targetPlanteles.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral hover:bg-pastoral-deep disabled:opacity-40 text-white px-4 py-2 text-xs font-extrabold shadow-sm"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>
                    Crear {targetPlanteles.length}{' '}
                    {targetPlanteles.length === 1 ? 'copia' : 'copias'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Barra superior del formulario */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMode('list')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-pastoral transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {form.id ? 'Editar Carta Descriptiva' : 'Nueva Carta Descriptiva'}
            </h1>
            <p className="text-xs text-slate-500">
              Formato oficial ESFER Salesianos · Chihuahua
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {form.id && form.status === 'En planeación' && onApproveCarta && (
            <button
              type="button"
              onClick={() => {
                onApproveCarta(form.id);
                setForm((prev) => ({ ...prev, status: 'Aprobado' }));
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 shadow-sm transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Aprobar Carta</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onPrintCarta(form)}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-white border border-slate-200 hover:border-pastoral/40 text-pastoral-deep font-bold text-xs sm:text-sm px-4 py-2.5 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Vista Previa / Imprimir</span>
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-pastoral hover:bg-pastoral-deep text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 shadow-sm transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Guardar Carta Descriptiva</span>
          </button>
        </div>
      </div>

      {/* 1. Datos Generales */}
      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="h-5 w-5 text-pastoral" />
          <h2 className="text-base font-extrabold text-slate-900">1. Datos Generales</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Nombre de la experiencia *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Retiro de Adviento para Padres de Familia"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30 focus:border-pastoral"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Plantel / Sede *
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
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30 focus:border-pastoral"
            >
              {(restrictedPlantel
                ? [restrictedPlantel, 'TSJB (Templo San Juan Bosco)', 'Otro']
                : CARTA_PLANTEL_OPTIONS
              ).map((p) => (
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
                placeholder="Especifica sede o lugar externo (ej. Casa de Retiros)"
                className="mt-2 w-full rounded-xl border border-pastoral/40 bg-pastoral/[0.03] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Fecha inicio *
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    date: e.target.value,
                    endDate:
                      prev.endDate && prev.endDate < e.target.value ? e.target.value : prev.endDate,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30 focus:border-pastoral"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Fecha fin (opcional)
              </label>
              <input
                type="date"
                min={form.date || undefined}
                value={form.endDate || ''}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30 focus:border-pastoral"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Hora inicio
              </label>
              <input
                type="time"
                value={form.startTime || '09:00'}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Hora fin
              </label>
              <input
                type="time"
                value={form.endTime || '12:00'}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Estatus de la actividad
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30"
            >
              {ACTIVITY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Lugar *
            </label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Ej. Auditorio y Capilla Plantel Glandorff"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Diseña la experiencia *
            </label>
            <input
              type="text"
              required
              value={form.designer}
              onChange={(e) => setForm({ ...form, designer: e.target.value })}
              placeholder="Nombre del responsable o equipo pastoral"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
              Responsable(s) de seguimiento y edición (puedes elegir varios)
            </label>
            {teamUsers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {teamUsers.map((u) => {
                  const selectedList = Array.isArray(form.responsibleNames)
                    ? form.responsibleNames
                    : [];
                  const active = selectedList.includes(u.name);
                  return (
                    <button
                      key={u.uid || u.email}
                      type="button"
                      onClick={() => {
                        const next = active
                          ? selectedList.filter((n) => n !== u.name)
                          : [...selectedList, u.name];
                        setForm({
                          ...form,
                          responsibleNames: next,
                          responsibleName: next.join(', '),
                        });
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                        active
                          ? 'bg-pastoral text-white border-pastoral shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-pastoral/40'
                      }`}
                    >
                      <span>{active ? '✓' : '+'}</span>
                      <span>
                        {u.name} ({u.plantel || 'General'})
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <input
                type="text"
                value={form.responsibleName || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({
                    ...form,
                    responsibleName: val,
                    responsibleNames: val
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  });
                }}
                placeholder="Nombres separados por coma (ej. Mariana, Diego)"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30"
              />
            )}
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Objetivo *
            </label>
            <textarea
              rows={2}
              required
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              placeholder="Describe el propósito formativo y pastoral de la experiencia..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pastoral/30"
            />
          </div>
        </div>

        {/* Vinculación ESA + Visibilidad en Calendario */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Dimensión Modelo ESA
            </label>
            <select
              value={form.esaDimensionId}
              onChange={(e) => handleDimensionChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30"
            >
              {ESA_DIMENSIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Subdimensión ESA
            </label>
            <select
              value={form.esaSubdimensionId}
              onChange={(e) => setForm({ ...form, esaSubdimensionId: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30"
            >
              {currentDimension.subdimensions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
              Visibilidad en Calendario
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, visibility: 'publico' })}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-extrabold transition-all ${
                  form.visibility === 'publico'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Evento Público</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, visibility: 'interno' })}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-extrabold transition-all ${
                  form.visibility === 'interno'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Evento Interno</span>
              </button>
            </div>
          </div>
        </div>

        {/* Conexión con el PEPSAL */}
        <div className="rounded-2xl bg-pastoral/[0.03] border border-pastoral/15 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-pastoral" />
              <h3 className="text-xs font-extrabold text-pastoral-deep uppercase tracking-wide">
                Conexión con el PEPSAL
              </h3>
            </div>
            {pepsalDoc?.documentUrl ? (
              <a
                href={pepsalDoc.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-pastoral hover:text-pastoral-light"
              >
                <span>Consultar PDF PEPSAL</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              onOpenPepsalTab && (
                <button
                  type="button"
                  onClick={onOpenPepsalTab}
                  className="text-xs font-bold text-pastoral hover:text-pastoral-light"
                >
                  Configurar enlace del documento PEPSAL →
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Dimensión de la CEP (PEPSAL)
              </label>
              <select
                value={currentPepsalArea.id}
                onChange={(e) => handlePepsalAreaChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30"
              >
                {PEPSAL_AREAS.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Reto de la Visión Pastoral (01 - 08)
              </label>
              <select
                value={form.pepsalRetoId || 'R01'}
                onChange={(e) => setForm({ ...form, pepsalRetoId: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30"
              >
                {PEPSAL_RETOS.map((reto) => (
                  <option key={reto.id} value={reto.id}>
                    {reto.number}. {reto.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Intervención PEPSAL específica
              </label>
              <select
                value={form.pepsalIntervention || currentPepsalArea.interventions[0]}
                onChange={(e) => setForm({ ...form, pepsalIntervention: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30"
              >
                {currentPepsalArea.interventions.map((inter, idx) => (
                  <option key={idx} value={inter}>
                    {idx + 1}. {inter}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Nota o enfoque específico PEPSAL (opcional)
              </label>
              <input
                type="text"
                value={form.pepsalObjective || ''}
                onChange={(e) => setForm({ ...form, pepsalObjective: e.target.value })}
                placeholder="Ej. Acompañamiento a familias y preparación litúrgica..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pastoral/30"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. HORARIO DE LA ACTIVIDAD */}
      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-pastoral-cyan" />
            <h2 className="text-base font-extrabold text-slate-900">
              2. HORARIO DE LA ACTIVIDAD
            </h2>
          </div>
          <button
            type="button"
            onClick={addScheduleRow}
            className="inline-flex items-center gap-1 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3 py-1.5 text-xs font-bold transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Agregar fila</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-left text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200">
                <th className="py-2 pr-2 w-36">Hora</th>
                <th className="py-2 px-2">¿Qué sucede?</th>
                <th className="py-2 px-2 w-44">¿Dónde?</th>
                <th className="py-2 px-2 w-44">Responsable</th>
                <th className="py-2 pl-2 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {form.schedule.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={row.time}
                      onChange={(e) => updateScheduleRow(idx, 'time', e.target.value)}
                      placeholder="09:00 - 09:30"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.what}
                      onChange={(e) => updateScheduleRow(idx, 'what', e.target.value)}
                      placeholder="Descripción del momento"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.where}
                      onChange={(e) => updateScheduleRow(idx, 'where', e.target.value)}
                      placeholder="Espacio / Salón"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.responsible}
                      onChange={(e) => updateScheduleRow(idx, 'responsible', e.target.value)}
                      placeholder="Nombre"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 pl-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeScheduleRow(idx)}
                      disabled={form.schedule.length <= 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30"
                      aria-label="Eliminar fila"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. COMISIONES */}
      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-pastoral-gold" />
            <h2 className="text-base font-extrabold text-slate-900">3. COMISIONES</h2>
          </div>
          <button
            type="button"
            onClick={addCommissionRow}
            className="inline-flex items-center gap-1 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3 py-1.5 text-xs font-bold transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Añadir fila extra (OTRO)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200">
                <th className="py-2 pr-2 w-52">¿Qué?</th>
                <th className="py-2 px-2 w-44">Responsable (¿Quién?)</th>
                <th className="py-2 px-2">Proceso (¿Cómo?)</th>
                <th className="py-2 px-2 w-48">Material (¿Con qué?)</th>
                <th className="py-2 pl-2 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {form.commissions.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={row.what}
                      onChange={(e) => updateCommissionRow(idx, 'what', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.who}
                      onChange={(e) => updateCommissionRow(idx, 'who', e.target.value)}
                      placeholder="Responsable(s)"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.how}
                      onChange={(e) => updateCommissionRow(idx, 'how', e.target.value)}
                      placeholder="Acciones clave"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.material}
                      onChange={(e) => updateCommissionRow(idx, 'material', e.target.value)}
                      placeholder="Insumos / equipo"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:border-pastoral"
                    />
                  </td>
                  <td className="py-2 pl-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeCommissionRow(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      aria-label="Eliminar comisión"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. SOLICITUD DE PLANTA FÍSICA (Integrada en la misma Carta y en Hoja 2 al imprimir) */}
      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-600" />
              <h2 className="text-base font-extrabold text-slate-900">
                4. SOLICITUD DE PLANTA FÍSICA (Mobiliario y Sonido)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Si la activas, al pulsar <strong>Imprimir</strong> se incluirá automáticamente en la
              Hoja 2 lista para entregar a Planta Física.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs font-extrabold text-amber-950 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(form.plantaFisica?.enabled)}
              onChange={(e) => togglePlantaFisicaEnabled(e.target.checked)}
              className="rounded border-amber-400 text-pastoral focus:ring-pastoral"
            />
            <span>Requiere apoyo de Planta Física</span>
          </label>
        </div>

        {form.plantaFisica?.enabled && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 uppercase">
                Mobiliario y equipo requerido
              </span>
              <button
                type="button"
                onClick={addPlantaFisicaItem}
                className="inline-flex items-center gap-1 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3 py-1.5 text-xs font-bold transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Agregar renglón</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="text-left text-xs font-extrabold text-slate-500 uppercase border-b border-slate-200">
                    <th className="py-2 pr-2 w-44">Material</th>
                    <th className="py-2 px-2 w-28">Cantidad</th>
                    <th className="py-2 px-2">Observaciones</th>
                    <th className="py-2 pl-2 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(form.plantaFisica.items || []).map((row, idx) => (
                    <tr key={row.id || idx}>
                      <td className="py-1.5 pr-2">
                        <input
                          type="text"
                          value={row.material}
                          onChange={(e) => updatePlantaFisicaItem(idx, 'material', e.target.value)}
                          placeholder="Ej. Sillas, Extensión..."
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-pastoral"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={row.quantity}
                          onChange={(e) => updatePlantaFisicaItem(idx, 'quantity', e.target.value)}
                          placeholder="Ej. 50 / NO"
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-center focus:outline-none focus:border-pastoral"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={row.observations}
                          onChange={(e) =>
                            updatePlantaFisicaItem(idx, 'observations', e.target.value)
                          }
                          placeholder="Detalles de colocación o especificaciones"
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:border-pastoral"
                        />
                      </td>
                      <td className="py-1.5 pl-2 text-right">
                        <button
                          type="button"
                          onClick={() => removePlantaFisicaItem(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          aria-label="Eliminar renglón de mobiliario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Notas adicionales para Planta Física
              </label>
              <textarea
                rows={2}
                value={form.plantaFisica.notes || ''}
                onChange={(e) => updatePlantaFisicaField('notes', e.target.value)}
                placeholder="Ej. Favor de tener montado el sonido y las sillas 30 minutos antes del inicio..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:border-pastoral"
              />
            </div>
          </div>
        )}
      </section>

      {/* 5. RECURSOS Y ANEXOS (Google Drive, Canva, PDF, Pósters, Infografías) */}
      <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-pastoral" />
              <h2 className="text-base font-extrabold text-slate-900">
                5. RECURSOS Y ANEXOS (PDF, Pósters, Infografías)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjunta enlaces de Google Drive, Canva o OneDrive (sin límite de peso).
            </p>
          </div>
          <button
            type="button"
            onClick={addResourceRow}
            className="inline-flex items-center gap-1.5 rounded-xl bg-pastoral/10 hover:bg-pastoral text-pastoral hover:text-white px-3.5 py-2 text-xs font-extrabold transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Agregar recurso</span>
          </button>
        </div>

        {(form.resources || []).length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-5 text-center text-xs text-slate-500">
            Aún no has adjuntado recursos. Pulsa <strong>Agregar recurso</strong> para ligar un
            PDF, póster, infografía o carpeta de Drive a esta Carta Descriptiva.
          </div>
        ) : (
          <div className="space-y-2.5">
            {(form.resources || []).map((res, idx) => (
              <div
                key={res.id || idx}
                className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center rounded-2xl bg-slate-50 border border-slate-200 p-3"
              >
                <div className="md:col-span-4">
                  <input
                    type="text"
                    value={res.title}
                    onChange={(e) => updateResourceRow(idx, 'title', e.target.value)}
                    placeholder="Nombre (ej. Póster oficial / Guion PDF)"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold focus:outline-none focus:border-pastoral"
                  />
                </div>
                <div className="md:col-span-3">
                  <select
                    value={res.type || 'PDF / Documento'}
                    onChange={(e) => updateResourceRow(idx, 'type', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-pastoral"
                  >
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4">
                  <input
                    type="url"
                    value={res.url}
                    onChange={(e) => updateResourceRow(idx, 'url', e.target.value)}
                    placeholder="https://drive.google.com/... o https://canva.com/..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:border-pastoral"
                  />
                </div>
                <div className="md:col-span-1 flex items-center justify-end gap-1">
                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-pastoral hover:bg-pastoral/10"
                      title="Abrir enlace"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => removeResourceRow(idx)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    aria-label="Eliminar recurso"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </form>
  );
}
