
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
  let rawKey = process.env.FIREBASE_PRIVATE_KEY || '';

  if (!projectId || !clientEmail || !rawKey) {
    console.warn("Firebase Admin credentials missing. Administrative features (User management) will be disabled.");
    return;
  }

  try {
    // 1. Clean the key: remove literal quotes if present
    let privateKey = rawKey.trim();
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
      privateKey = privateKey.slice(1, -1);
    }

    // 2. CRITICAL: Replace literal \n strings with actual newline characters
    // This is the most common cause of "Invalid PEM formatted message" in .env files
    privateKey = privateKey.replace(/\\n/g, '\n');

    // 3. Ensure the key has the correct RSA headers
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
    }

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
    // Do not re-throw to allow standard site features to continue via Client SDK
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
