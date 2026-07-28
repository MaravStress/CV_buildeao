import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, db, ADMIN_EMAIL } from '../firebase/config';
import type { CVData } from '../types/cv';

export const DEFAULT_CV_SETTINGS = {
  fontFamily: 'Georgia, serif',
  fontSize: '11pt',
  lineSpacing: 1.25,
  margins: '0.6in',
};

export const EMPTY_CV_DATA: CVData = {
  personalInfo: {
    name: '',
    location: '',
    email: '',
    phone: '',
    website: '',
    linkedin: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  settings: DEFAULT_CV_SETTINGS,
};

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Inicia sesión con Google. Solo permite el acceso si el correo coincide con ADMIN_EMAIL.
 */
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  if (!user.email || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    await signOut(auth);
    throw new Error(
      `Acceso denegado: El correo (${user.email || 'desconocido'}) no está autorizado. Solo ${ADMIN_EMAIL} tiene permisos de administrador.`
    );
  }

  return user;
}

/**
 * Cierra la sesión activa en Firebase.
 */
export async function logoutGoogle(): Promise<void> {
  await signOut(auth);
}

/**
 * Escucha cambios en el estado de autenticación de Firebase.
 */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (user && user.email && user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      signOut(auth);
      callback(null);
    } else {
      callback(user);
    }
  });
}

/**
 * Normaliza estructuras leídas de Firebase Realtime Database para garantizar
 * que los objetos o colecciones sean arreglos válidos compatibles con CVData.
 */
export function normalizeDbToCvData(raw: any): CVData {
  if (!raw || typeof raw !== 'object') {
    return EMPTY_CV_DATA;
  }

  // Normalizar arreglos que Firebase RTDB puede guardar como objetos indexados
  const experienceArr = Array.isArray(raw.experience)
    ? raw.experience
    : raw.experience && typeof raw.experience === 'object'
    ? Object.values(raw.experience)
    : [];

  const educationArr = Array.isArray(raw.education)
    ? raw.education
    : raw.education && typeof raw.education === 'object'
    ? Object.values(raw.education)
    : [];

  const skillsArr = Array.isArray(raw.skills)
    ? raw.skills
    : raw.skills && typeof raw.skills === 'object'
    ? Object.values(raw.skills)
    : [];

  return {
    personalInfo: {
      name: raw.personalInfo?.name || '',
      location: raw.personalInfo?.location || '',
      email: raw.personalInfo?.email || '',
      phone: raw.personalInfo?.phone || '',
      website: raw.personalInfo?.website || '',
      linkedin: raw.personalInfo?.linkedin || '',
    },
    summary: typeof raw.summary === 'string' ? raw.summary : '',
    experience: experienceArr.map((exp: any, index: number) => ({
      id: exp.id || `exp-${index}`,
      company: exp.company || '',
      location: exp.location || '',
      title: exp.title || '',
      dates: exp.dates || '',
      bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
      references: exp.references || '',
    })),
    education: educationArr.map((edu: any, index: number) => ({
      id: edu.id || `edu-${index}`,
      institution: edu.institution || '',
      location: edu.location || '',
      degree: edu.degree || '',
      dates: edu.dates || '',
      thesis: edu.thesis || '',
      courses: Array.isArray(edu.courses) ? edu.courses : [],
    })),
    skills: skillsArr.map((sk: any, index: number) => ({
      id: sk.id || `skill-${index}`,
      categoryName: sk.categoryName || '',
      skills: Array.isArray(sk.skills) ? sk.skills : [],
    })),
    settings: {
      fontFamily: raw.settings?.fontFamily || DEFAULT_CV_SETTINGS.fontFamily,
      fontSize: raw.settings?.fontSize || DEFAULT_CV_SETTINGS.fontSize,
      lineSpacing: typeof raw.settings?.lineSpacing === 'number' ? raw.settings.lineSpacing : DEFAULT_CV_SETTINGS.lineSpacing,
      margins: raw.settings?.margins || DEFAULT_CV_SETTINGS.margins,
    },
  };
}

/**
 * Lee la información del CV guardada en Firebase Realtime Database (nodo portfolio/bdData).
 */
export async function fetchCvFromFirebase(): Promise<CVData> {
  if (!db) {
    throw new Error('Firebase Realtime Database no está inicializado.');
  }

  const snapshot = await get(ref(db, 'portfolio/bdData'));
  if (snapshot.exists()) {
    const rawData = snapshot.val();
    return normalizeDbToCvData(rawData);
  } else {
    return EMPTY_CV_DATA;
  }
}

/**
 * Guarda o actualiza la información del CV en el nodo `portfolio/bdData` de Realtime Database.
 */
export async function saveCvToFirebase(cvData: CVData): Promise<void> {
  if (!db) {
    throw new Error('Firebase Realtime Database no está inicializado.');
  }

  const user = auth.currentUser;
  if (!user || !user.email || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw new Error('Debes estar autenticado como administrador para actualizar la base de datos.');
  }

  await set(ref(db, 'portfolio/bdData'), {
    personalInfo: cvData.personalInfo,
    summary: cvData.summary,
    experience: cvData.experience,
    education: cvData.education,
    skills: cvData.skills,
    settings: cvData.settings,
    lastUpdated: new Date().toISOString(),
    updatedBy: user.email,
  });
}
