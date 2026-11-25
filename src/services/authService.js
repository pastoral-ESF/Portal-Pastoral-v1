// Servicio de Autenticación Híbrido: Firebase Authentication + Respaldo Local Demo
// Cuando .env contiene las llaves de Firebase, usa Firebase Auth + perfiles en Firestore (colección "users").
// Mientras no haya .env configurado, permite iniciar sesión con los usuarios locales de demostración.

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { auth, firestoreDb, isFirebaseConfigured } from './firebase';
import { ROLES, isPastoralTeamRole } from '../constants/config';

const LOCAL_SESSION_KEY = 'portal_pastoral_local_user_v1';

export const DEMO_USERS = [
  {
    uid: 'demo-sdb',
    email: 'sdb@esfer.edu.mx',
    password: '1859',
    name: 'P. Francisco Origel, SDB',
    role: ROLES.SDB,
    plantel: 'General',
  },
  {
    uid: 'demo-general',
    email: 'coordinacion@esfer.edu.mx',
    password: '1859',
    name: 'Coordinador de Pastoral',
    role: ROLES.COORDINADOR,
    plantel: 'General',
  },
  {
    uid: 'demo-glandorff',
    email: 'glandorff@esfer.edu.mx',
    password: '1859',
    name: 'Mariana Chávez (Glandorff)',
    role: ROLES.AUXILIAR,
    plantel: 'Glandorff',
  },
  {
    uid: 'demo-kennedy',
    email: 'kennedy@esfer.edu.mx',
    password: '1859',
    name: 'Diego Armendáriz (Kennedy)',
    role: ROLES.AUXILIAR,
    plantel: 'Kennedy',
  },
  {
    uid: 'demo-cordilleras',
    email: 'cordilleras@esfer.edu.mx',
    password: '1859',
    name: 'Sofía Trevizo (Cordilleras)',
    role: ROLES.AUXILIAR,
    plantel: 'Cordilleras',
  },
  {
    uid: 'demo-animador',
    email: 'animador@esfer.edu.mx',
    password: '2026',
    name: 'Animador MJS',
    role: ROLES.ANIMADOR,
    plantel: 'Kennedy',
  },
];

async function fetchOrCreateFirebaseProfile(firebaseUser, fallbackRole = ROLES.COORDINADOR) {
  const userRef = doc(firestoreDb, 'users', firebaseUser.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: data.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
      role: data.role || fallbackRole,
      plantel: data.plantel || 'General',
      authSource: 'firebase',
    };
  }

  const profile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
    role: fallbackRole,
    plantel: 'General',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(userRef, profile);
  } catch (err) {
    console.warn('No se pudo crear perfil en Firestore (revisa reglas de seguridad):', err);
  }

  return { ...profile, authSource: 'firebase' };
}

export const authService = {
  isFirebaseMode() {
    return isFirebaseConfigured;
  },

  async login({ email, password, expectedRole }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const profile = await fetchOrCreateFirebaseProfile(
        cred.user,
        expectedRole === ROLES.ANIMADOR ? ROLES.ANIMADOR : ROLES.COORDINADOR
      );

      if (expectedRole === 'pastoral' && !isPastoralTeamRole(profile.role)) {
        await signOut(auth);
        throw new Error(
          'Tu cuenta está registrada como Animador MJS. Selecciona el perfil "Animador MJS" para ingresar.'
        );
      }

      return profile;
    }

    // Modo demostración local (sin .env de Firebase todavía)
    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword
    );

    if (!found) {
      throw new Error(
        'Correo o contraseña incorrectos. En modo demo puedes usar los accesos de prueba listados abajo.'
      );
    }

    if (expectedRole === 'pastoral' && !isPastoralTeamRole(found.role)) {
      throw new Error(
        'Esta cuenta es de Animador MJS. Selecciona el perfil "Animador MJS" para iniciar sesión.'
      );
    }

    const sessionUser = {
      uid: found.uid,
      email: found.email,
      name: found.name,
      role: expectedRole === ROLES.ANIMADOR ? ROLES.ANIMADOR : found.role,
      plantel: found.plantel,
      authSource: 'demo',
    };

    try {
      window.localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionUser));
    } catch {
      // ignore storage errors
    }

    return sessionUser;
  },

  async verifyCurrentPassword(password) {
    const cleanPassword = (password || '').trim();
    if (!cleanPassword) {
      throw new Error('Ingresa tu contraseña para confirmar.');
    }

    if (isFirebaseConfigured && auth) {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No hay una sesión activa válida. Vuelve a iniciar sesión.');
      }
      try {
        const credential = EmailAuthProvider.credential(user.email, cleanPassword);
        await reauthenticateWithCredential(user, credential);
        return true;
      } catch {
        throw new Error('Contraseña incorrecta. No se eliminó ninguna respuesta.');
      }
    }

    // Respaldo modo demo local
    try {
      const raw = window.localStorage.getItem(LOCAL_SESSION_KEY);
      const localUser = raw ? JSON.parse(raw) : null;
      const found = DEMO_USERS.find((u) => u.email === localUser?.email);
      if (found && found.password === cleanPassword) return true;
    } catch {
      // ignore
    }
    throw new Error('Contraseña incorrecta. No se eliminó ninguna respuesta.');
  },

  async logout() {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    try {
      window.localStorage.removeItem(LOCAL_SESSION_KEY);
    } catch {
      // ignore
    }
  },

  getLocalSession() {
    try {
      const raw = window.localStorage.getItem(LOCAL_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async listUsers() {
    if (isFirebaseConfigured && firestoreDb) {
      const snap = await getDocs(collection(firestoreDb, 'users'));
      return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    }
    return DEMO_USERS.map(({ password, ...rest }) => rest);
  },

  async saveUserProfile(uid, updates) {
    const cleanUpdates = {
      name: (updates.name || '').trim(),
      plantel: updates.plantel || 'General',
      ...(updates.role ? { role: updates.role } : {}),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && firestoreDb) {
      const userRef = doc(firestoreDb, 'users', uid);
      await setDoc(userRef, cleanUpdates, { merge: true });
      return cleanUpdates;
    }

    const current = this.getLocalSession();
    if (current && current.uid === uid) {
      const merged = { ...current, ...cleanUpdates };
      try {
        window.localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(merged));
      } catch {
        // ignore
      }
    }
    return cleanUpdates;
  },

  subscribe(callback) {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, async (fbUser) => {
        if (!fbUser) {
          callback(null);
          return;
        }
        try {
          const profile = await fetchOrCreateFirebaseProfile(fbUser);
          callback(profile);
        } catch {
          callback({
            uid: fbUser.uid,
            email: fbUser.email,
            name: fbUser.email?.split('@')[0] || 'Usuario Pastoral',
            role: ROLES.COORDINADOR,
            plantel: 'General',
            authSource: 'firebase',
          });
        }
      });
    }

    // En modo local, restaurar sesión si existe
    callback(this.getLocalSession());
    return () => {};
  },
};
