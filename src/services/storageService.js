/**
 * Capa de persistencia desacoplada (Storage Service)
 * --------------------------------------------------
 * Actualmente utiliza localStorage con datos iniciales realistas de demostración.
 * Su API está organizada por colecciones (cartasDescriptivas, quickEvents, notices,
 * mjsResources, accompanimentMessages) para poder migrar a Firebase Firestore en una
 * segunda fase sin reescribir ningún componente de React.
 */

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { firestoreDb, isFirebaseConfigured } from './firebase';
import { SEED_DATA } from '../data/seedData';
import {
  DEFAULT_EVALUATION_TEMPLATES,
  EVALUATION_TEMPLATES_VERSION,
} from '../data/evaluationTemplates';

const STORAGE_KEY = 'portal_pastoral_esfer_db_v1';
const FIRESTORE_DOC_PATH = ['portal_pastoral', 'state_v1'];

function resolveEvaluationTemplates(parsed = {}) {
  const existing = Array.isArray(parsed.evaluationTemplates) ? parsed.evaluationTemplates : [];
  if (existing.length === 0) {
    return structuredClone(DEFAULT_EVALUATION_TEMPLATES);
  }
  // Si el estado guardado viene de la versión anterior (4-5 preguntas), actualiza las 9 plantillas base a 10 preguntas
  // conservando cualquier plantilla personalizada creada por el usuario.
  if ((parsed.evaluationTemplatesVersion || 1) < EVALUATION_TEMPLATES_VERSION) {
    const defaultIds = new Set(DEFAULT_EVALUATION_TEMPLATES.map((t) => t.id));
    const customOnly = existing.filter((t) => !defaultIds.has(t.id));
    return [...structuredClone(DEFAULT_EVALUATION_TEMPLATES), ...customOnly];
  }
  return existing;
}

function normalizeDb(parsed = {}) {
  return {
    pepsalDoc: parsed.pepsalDoc ?? structuredClone(SEED_DATA.pepsalDoc),
    portalSettings: parsed.portalSettings ?? structuredClone(SEED_DATA.portalSettings),
    mjsGroups: parsed.mjsGroups ?? structuredClone(SEED_DATA.mjsGroups),
    sacraments: parsed.sacraments ?? structuredClone(SEED_DATA.sacraments),
    multimedia: parsed.multimedia ?? structuredClone(SEED_DATA.multimedia),
    cartasDescriptivas: parsed.cartasDescriptivas ?? structuredClone(SEED_DATA.cartasDescriptivas),
    quickEvents: parsed.quickEvents ?? structuredClone(SEED_DATA.quickEvents),
    notices: parsed.notices ?? structuredClone(SEED_DATA.notices),
    mjsResources: parsed.mjsResources ?? structuredClone(SEED_DATA.mjsResources),
    accompanimentMessages:
      parsed.accompanimentMessages ?? structuredClone(SEED_DATA.accompanimentMessages),
    tasks: parsed.tasks ?? structuredClone(SEED_DATA.tasks),
    evaluationTemplatesVersion: EVALUATION_TEMPLATES_VERSION,
    evaluationTemplates: resolveEvaluationTemplates(parsed),
    eventEvaluationConfigs:
      parsed.eventEvaluationConfigs ?? structuredClone(SEED_DATA.eventEvaluationConfigs),
  };
}

function readDb() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = normalizeDb(structuredClone(SEED_DATA));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return normalizeDb(JSON.parse(raw));
  } catch (error) {
    console.warn('No se pudo leer localStorage, usando datos en memoria:', error);
    return normalizeDb(structuredClone(SEED_DATA));
  }
}

function writeDb(db) {
  const normalized = normalizeDb(db);
  // Limpia cualquier campo `undefined` porque Firestore los rechaza en setDoc
  const safePayload = JSON.parse(JSON.stringify(normalized));

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safePayload));
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }

  // Sincronización automática en la nube cuando Firebase está configurado
  if (isFirebaseConfigured && firestoreDb) {
    const ref = doc(firestoreDb, ...FIRESTORE_DOC_PATH);
    setDoc(ref, { ...safePayload, _syncedAt: new Date().toISOString() }, { merge: true }).catch(
      (err) => {
        console.warn('No se pudo sincronizar con Firestore (se mantiene en local):', err);
      }
    );
  }

  return safePayload;
}

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const storageService = {
  getAllData() {
    return readDb();
  },

  subscribeRemote(onData) {
    if (!isFirebaseConfigured || !firestoreDb) {
      return () => {};
    }
    const ref = doc(firestoreDb, ...FIRESTORE_DOC_PATH);
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const remote = normalizeDb(snap.data());
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
          } catch {
            // ignore
          }
          onData(remote);
        }
      },
      (err) => {
        console.warn('Error en suscripción de Firestore:', err);
      }
    );
  },

  resetDemoData() {
    const fresh = structuredClone(SEED_DATA);
    return writeDb(fresh);
  },

  // --- DOCUMENTO PEPSAL ---
  savePepsalDoc(pepsalDoc) {
    const db = readDb();
    db.pepsalDoc = { ...db.pepsalDoc, ...pepsalDoc, updatedAt: new Date().toISOString() };
    return writeDb(db);
  },

  // --- CONTENIDO EDITABLE DEL PORTAL PÚBLICO ---
  savePortalSettings(settings) {
    const db = readDb();
    db.portalSettings = { ...db.portalSettings, ...settings };
    return writeDb(db);
  },

  saveMjsGroups(mjsGroups) {
    const db = readDb();
    db.mjsGroups = mjsGroups;
    return writeDb(db);
  },

  saveSacraments(sacraments) {
    const db = readDb();
    db.sacraments = sacraments;
    return writeDb(db);
  },

  saveMultimedia(multimedia) {
    const db = readDb();
    db.multimedia = multimedia;
    return writeDb(db);
  },

  // --- PLANTILLAS Y CONFIGURACIÓN DE EVALUACIONES POR EVENTO ---
  saveEvaluationTemplates(templates) {
    const db = readDb();
    db.evaluationTemplates = templates;
    return writeDb(db);
  },

  saveEventEvaluationConfig(eventId, config) {
    const db = readDb();
    db.eventEvaluationConfigs = {
      ...(db.eventEvaluationConfigs || {}),
      [eventId]: {
        ...config,
        updatedAt: new Date().toISOString(),
      },
    };
    return writeDb(db);
  },

  // --- CARTAS DESCRIPTIVAS ---
  saveCarta(carta) {
    const db = readDb();
    if (carta.id) {
      db.cartasDescriptivas = db.cartasDescriptivas.map((item) =>
        item.id === carta.id ? { ...item, ...carta, updatedAt: new Date().toISOString() } : item
      );
    } else {
      const newCarta = {
        ...carta,
        id: generateId('carta'),
        createdAt: new Date().toISOString(),
      };
      db.cartasDescriptivas = [newCarta, ...db.cartasDescriptivas];
    }
    return writeDb(db);
  },

  deleteCarta(cartaId) {
    const db = readDb();
    db.cartasDescriptivas = db.cartasDescriptivas.filter((c) => c.id !== cartaId);
    return writeDb(db);
  },

  approveCarta(cartaId, approverName = 'Departamento de Pastoral') {
    const db = readDb();
    db.cartasDescriptivas = db.cartasDescriptivas.map((c) =>
      c.id === cartaId
        ? {
            ...c,
            status: 'Aprobado',
            approvedBy: approverName,
            approvedAt: new Date().toISOString(),
          }
        : c
    );
    return writeDb(db);
  },

  saveCartaPlantaFisica(cartaId, plantaFisica) {
    const db = readDb();
    db.cartasDescriptivas = db.cartasDescriptivas.map((c) =>
      c.id === cartaId
        ? {
            ...c,
            plantaFisica: {
              ...plantaFisica,
              updatedAt: new Date().toISOString(),
            },
          }
        : c
    );
    return writeDb(db);
  },

  // --- PENDIENTES (TAREAS POR USUARIO / PLANTEL / PASTORAL GENERAL) ---
  addTask(task) {
    const db = readDb();
    const newTask = {
      ...task,
      id: generateId('task'),
      done: false,
      createdAt: new Date().toISOString(),
    };
    db.tasks = [newTask, ...(db.tasks || [])];
    return writeDb(db);
  },

  updateTask(taskId, updates) {
    const db = readDb();
    db.tasks = (db.tasks || []).map((t) =>
      t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    return writeDb(db);
  },

  toggleTaskDone(taskId) {
    const db = readDb();
    db.tasks = (db.tasks || []).map((t) =>
      t.id === taskId ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : null } : t
    );
    return writeDb(db);
  },

  deleteTask(taskId) {
    const db = readDb();
    db.tasks = (db.tasks || []).filter((t) => t.id !== taskId);
    return writeDb(db);
  },

  saveCartaEvaluation(cartaId, evaluation) {
    const db = readDb();
    db.cartasDescriptivas = db.cartasDescriptivas.map((c) =>
      c.id === cartaId
        ? {
            ...c,
            status: 'Realizado',
            esaDimensionId: evaluation.esaDimensionId || c.esaDimensionId,
            esaSubdimensionId: evaluation.esaSubdimensionId || c.esaSubdimensionId,
            evaluation: {
              ...evaluation,
              evaluatedAt: new Date().toISOString(),
            },
          }
        : c
    );
    return writeDb(db);
  },

  // --- EVENTOS RÁPIDOS DE CALENDARIO ---
  saveQuickEvent(event) {
    const db = readDb();
    if (event.id) {
      db.quickEvents = db.quickEvents.map((e) => (e.id === event.id ? { ...e, ...event } : e));
    } else {
      const newEvent = {
        ...event,
        id: generateId('evt'),
      };
      db.quickEvents = [newEvent, ...db.quickEvents];
    }
    return writeDb(db);
  },

  deleteQuickEvent(eventId) {
    const db = readDb();
    db.quickEvents = db.quickEvents.filter((e) => e.id !== eventId);
    return writeDb(db);
  },

  toggleQuickEventVisibility(eventId) {
    const db = readDb();
    db.quickEvents = db.quickEvents.map((e) =>
      e.id === eventId
        ? { ...e, visibility: e.visibility === 'publico' ? 'interno' : 'publico' }
        : e
    );
    return writeDb(db);
  },

  importNotionEvents(notionEvents) {
    const db = readDb();
    const existingIds = new Set((db.quickEvents || []).map((e) => e.id));
    const toAdd = notionEvents.filter((e) => !existingIds.has(e.id));
    db.quickEvents = [...(db.quickEvents || []), ...toAdd];
    return { db: writeDb(db), addedCount: toAdd.length };
  },

  // --- AVISOS OFICIALES ---
  addNotice(notice) {
    const db = readDb();
    const newNotice = {
      ...notice,
      id: generateId('notice'),
      date: notice.date || new Date().toISOString().slice(0, 10),
    };
    db.notices = [newNotice, ...db.notices];
    return writeDb(db);
  },

  deleteNotice(noticeId) {
    const db = readDb();
    db.notices = db.notices.filter((n) => n.id !== noticeId);
    return writeDb(db);
  },

  toggleNoticePin(noticeId) {
    const db = readDb();
    db.notices = db.notices.map((n) => (n.id === noticeId ? { ...n, pinned: !n.pinned } : n));
    return writeDb(db);
  },

  // --- REPOSITORIO MJS ---
  addMjsResource(resource) {
    const db = readDb();
    const newResource = {
      ...resource,
      id: generateId('res'),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    db.mjsResources = [newResource, ...db.mjsResources];
    return writeDb(db);
  },

  deleteMjsResource(resourceId) {
    const db = readDb();
    db.mjsResources = db.mjsResources.filter((r) => r.id !== resourceId);
    return writeDb(db);
  },

  // --- BUZÓN DE ACOMPAÑAMIENTO ---
  addAccompanimentMessage(msg) {
    const db = readDb();
    const newMsg = {
      ...msg,
      id: generateId('msg'),
      status: 'Nuevo',
      createdAt: new Date().toISOString(),
    };
    db.accompanimentMessages = [newMsg, ...db.accompanimentMessages];
    return writeDb(db);
  },

  toggleMessageStatus(msgId) {
    const db = readDb();
    db.accompanimentMessages = db.accompanimentMessages.map((m) =>
      m.id === msgId ? { ...m, status: m.status === 'Atendida' ? 'Nuevo' : 'Atendida' } : m
    );
    return writeDb(db);
  },

  deleteAccompanimentMessage(msgId) {
    const db = readDb();
    db.accompanimentMessages = db.accompanimentMessages.filter((m) => m.id !== msgId);
    return writeDb(db);
  },

  // --- RESPALDO / MIGRACIÓN COMPLETA ---
  importFullDb(rawDb) {
    if (!rawDb || typeof rawDb !== 'object') {
      throw new Error('El archivo de respaldo no tiene un formato válido.');
    }
    return writeDb(rawDb);
  },
};

/**
 * Helper para combinar eventos de Cartas Descriptivas + Eventos Rápidos
 * en una sola colección unificada de calendario.
 */
export function buildUnifiedCalendarEvents(db, { onlyPublic = false } = {}) {
  const cartas = db.cartasDescriptivas || [];
  const linkedQuickIds = new Set(
    cartas.map((c) => c.linkedQuickEventId).filter(Boolean)
  );

  const fromCartas = cartas.map((c) => ({
    id: c.id,
    source: 'carta',
    cartaId: c.id,
    linkedQuickEventId: c.linkedQuickEventId || '',
    title: c.name,
    date: c.date,
    startTime: c.startTime || '09:00',
    endTime: c.endTime || '12:00',
    plantel: c.plantel === 'Otro' && c.customPlantel ? c.customPlantel : c.plantel,
    location: c.location,
    category: c.category || 'Pastoral',
    visibility: c.visibility || 'interno',
    status: c.status,
    description: c.objective,
  }));

  const fromQuick = (db.quickEvents || [])
    .filter((e) => !linkedQuickIds.has(e.id))
    .map((e) => ({
      ...e,
      source: 'quick',
      status: e.status || 'Aprobado',
    }));

  return [...fromCartas, ...fromQuick]
    .filter((ev) => (onlyPublic ? ev.visibility === 'publico' : true))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}
