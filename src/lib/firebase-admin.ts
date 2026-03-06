
import admin from 'firebase-admin';

// This is a singleton to ensure we only initialize the app once.
let db: admin.firestore.Firestore | null = null;
let storage: admin.storage.Storage | null = null;
let auth: admin.auth.Auth | null = null;
let adminInitialized = false;

function initializeAdmin() {
  if (adminInitialized) return;
  
  // Check if any app is already initialized (singleton behavior)
  if (admin.apps.length > 0) {
    adminInitialized = true;
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  
  // Aggressively clean the private key to handle different environment variable managers
  // 1. Replace literal "\n" strings with actual newline characters
  // 2. Remove any surrounding double quotes that might have been added
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
  const privateKey = rawKey.replace(/\\n/g, '\n').replace(/"/g, '').trim();

  if (!projectId) {
    console.warn("FIREBASE_PROJECT_ID is missing from environment.");
    return;
  }
  if (!clientEmail) {
    console.warn("FIREBASE_CLIENT_EMAIL is missing from environment.");
    return;
  }
  if (!privateKey || !privateKey.includes('BEGIN PRIVATE KEY')) {
    console.warn("FIREBASE_PRIVATE_KEY is missing or malformed (missing header).");
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
    // Do not throw here, as it crashes the build/server action. 
    // Instead, we leave adminInitialized as false.
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
