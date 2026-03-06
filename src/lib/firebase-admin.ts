
import admin from 'firebase-admin';

let db: admin.firestore.Firestore | null = null;
let storage: admin.storage.Storage | null = null;
let auth: admin.auth.Auth | null = null;
let adminInitialized = false;

function initializeAdmin() {
  if (adminInitialized) return;
  
  if (admin.apps.length > 0) {
    adminInitialized = true;
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';

  // Handle common ENV formatting issues (quotes, escaped newlines)
  const privateKey = rawKey
    .replace(/\\n/g, '\n')
    .replace(/^['"]|['"]$/g, '')
    .trim();

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("CRITICAL: Firebase Admin credentials missing from environment variables.");
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
    });
    adminInitialized = true;
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.message);
    // We do not throw here to avoid crashing the Next.js server process (prevents 500 errors)
  }
}

export function getDb(): admin.firestore.Firestore | null {
  initializeAdmin();
  if (!adminInitialized) return null;
  if (!db) db = admin.firestore();
  return db;
}

export function getStorage(): admin.storage.Storage | null {
  initializeAdmin();
  if (!adminInitialized) return null;
  if (!storage) storage = admin.storage();
  return storage;
}

export function getAuthAdmin(): admin.auth.Auth | null {
  initializeAdmin();
  if (!adminInitialized) return null;
  if (!auth) auth = admin.auth();
  return auth;
}

export function isAdminReady(): boolean {
    initializeAdmin();
    return adminInitialized;
}
