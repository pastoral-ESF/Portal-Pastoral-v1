// Servicio independiente para respuestas de evaluación (colección Firestore "evaluations")
// Permite que participantes envíen respuestas sin iniciar sesión y que Pastoral consulte/exporte los resultados.

import {
  collection,
  addDoc,
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
