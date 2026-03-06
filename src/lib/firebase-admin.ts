
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

  if (!projectId || !clientEmail || !rawKey) {
    console.warn("CRITICAL: Firebase Admin credentials missing from environment variables.");
    return;
  }

  // Aggressive PEM cleaning logic
  let privateKey = rawKey.trim();
  
  // Remove wrapping quotes if they exist
  if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
    privateKey = privateKey.slice(1, -1);
  }

  // Standardize newlines (handle both literal newlines and escaped '\n' strings)
  privateKey = privateKey.replace(/\\n/g, '\n');

  // Ensure headers exist
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
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
    console.error('CRITICAL: Firebase Admin initialization failed:', error.message);
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
