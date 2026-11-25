// Servicio independiente para respuestas de evaluación (colección Firestore "evaluations")
// Permite que participantes envíen respuestas sin iniciar sesión y que Pastoral consulte/exporte los resultados.

import {
  collection,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { firestoreDb, isFirebaseConfigured } from './firebase';

const LOCAL_EVALS_KEY = 'portal_pastoral_evaluations_v1';

function readLocalEvaluations() {
  try {
    const raw = window.localStorage.getItem(LOCAL_EVALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalEvaluations(list) {
  try {
    window.localStorage.setItem(LOCAL_EVALS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export const evaluationService = {
  async submitResponse(payload) {
    const clean = JSON.parse(
      JSON.stringify({
        ...payload,
        submittedAt: new Date().toISOString(),
      })
    );

    if (isFirebaseConfigured && firestoreDb) {
      const ref = await addDoc(collection(firestoreDb, 'evaluations'), clean);
      return { id: ref.id, ...clean };
    }

    const localItem = {
      id: `eval-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...clean,
    };
    const all = [localItem, ...readLocalEvaluations()];
    writeLocalEvaluations(all);
    return localItem;
  },

  async listAllResponses() {
    if (isFirebaseConfigured && firestoreDb) {
      const q = query(
        collection(firestoreDb, 'evaluations'),
        orderBy('submittedAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    return readLocalEvaluations();
  },

  async deleteResponse(evalId) {
    if (isFirebaseConfigured && firestoreDb) {
      await deleteDoc(doc(firestoreDb, 'evaluations', evalId));
      return;
    }
    const filtered = readLocalEvaluations().filter((e) => e.id !== evalId);
    writeLocalEvaluations(filtered);
  },

  async importResponses(list = []) {
    if (!Array.isArray(list) || list.length === 0) return 0;

    if (isFirebaseConfigured && firestoreDb) {
      let imported = 0;
      for (const item of list) {
        const { id, ...rest } = item || {};
        const clean = JSON.parse(JSON.stringify(rest));
        if (id) {
          await setDoc(doc(firestoreDb, 'evaluations', String(id)), clean, { merge: true });
        } else {
          await addDoc(collection(firestoreDb, 'evaluations'), clean);
        }
        imported += 1;
      }
      return imported;
    }

    const existing = readLocalEvaluations();
    const existingIds = new Set(existing.map((e) => e.id));
    const merged = [
      ...list.filter((item) => item && !existingIds.has(item.id)),
      ...existing,
    ];
    writeLocalEvaluations(merged);
    return list.length;
  },
};

export function buildEvaluationLink(eventId, templateId = '') {
  if (typeof window === 'undefined') return '';
  const base = `${window.location.origin}${window.location.pathname}`;
  const hash = templateId
    ? `#evaluar=${encodeURIComponent(eventId)}&plantilla=${encodeURIComponent(templateId)}`
    : `#evaluar=${encodeURIComponent(eventId)}`;
  return `${base}${hash}`;
}

export function buildQrImageUrl(targetUrl, size = 240) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(
    targetUrl
  )}`;
}
