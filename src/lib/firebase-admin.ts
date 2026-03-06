import admin from 'firebase-admin';

// This is a singleton to ensure we only initialize the app once.
let db: admin.firestore.Firestore | null = null;
let storage: admin.storage.Storage | null = null;
let auth: admin.auth.Auth | null = null;
let adminInitialized = false;

function initializeAdmin() {
  if (adminInitialized) return;
  
  // Check if any app is already initialized
  if (admin.apps.length > 0) {
    adminInitialized = true;
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';

  // Aggressively clean the private key to handle Vercel/Firebase env formatting
  const privateKey = rawKey
    .replace(/\\n/g, '\n') // Convert escaped newlines back to real newlines
    .replace(/^['"]|['"]$/g, '') // Remove surrounding single/double quotes
    .trim();

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("CRITICAL: Firebase Admin credentials missing from environment.");
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
    console.error('CRITICAL: Firebase Admin initialization failed:', error.message);
    // We don't throw here to avoid crashing the whole process, 
    // but adminInitialized remains false.
  }
}

/**
 * Returns an initialized Firestore database instance.
 */
export function getDb(): admin.firestore.Firestore | null {
  initializeAdmin();
  if (!adminInitialized) return null;
  if (!db) db = admin.firestore();
  return db;
}

/**
 * Returns an initialized Storage instance.
 */
export function getStorage(): admin.storage.Storage | null {
  initializeAdmin();
  if (!adminInitialized) return null;
  if (!storage) storage = admin.storage();
  return storage;
}

/**
 * Returns an initialized Auth instance.
 */
export function getAuthAdmin(): admin.auth.Auth | null {
  initializeAdmin();
  if (!adminInitialized) return null;
  if (!auth) auth = admin.auth();
  return auth;
}

/**
 * Helper to check if admin was successfully set up
 */
export function isAdminReady(): boolean {
    initializeAdmin();
    return adminInitialized;
}
