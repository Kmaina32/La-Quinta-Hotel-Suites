
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This is a singleton to ensure we only initialize the app once.
let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;
let auth: admin.auth.Auth;

// A flag to track if initialization was successful
let isAdminInitialized = false;

function initializeAdmin() {
  // Only try to initialize once
  if (admin.apps.length > 0) {
    isAdminInitialized = true; // Already initialized
    return;
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = process.env;

  // Check if all required environment variables are present
  if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
    console.warn(
      'Firebase Admin SDK environment variables not set. ' +
      'Admin features will be disabled. This is expected in client-side rendering but is an error in a server environment.'
    );
    isAdminInitialized = false;
    return;
  }

  try {
    const serviceAccount: ServiceAccount = {
      projectId: FIREBASE_PROJECT_ID,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: FIREBASE_CLIENT_EMAIL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'la-quinta-reservations.appspot.com',
    });
    
    isAdminInitialized = true;
    console.log('Firebase Admin SDK initialized successfully.');

  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
    // Do not throw an error, just log it and set the flag to false
    // This prevents the entire build from crashing
    isAdminInitialized = false;
  }
}

/**
 * Returns an initialized Firestore database instance.
 * Returns null if the admin SDK is not initialized.
 */
export function getDb(): admin.firestore.Firestore | null {
  if (!isAdminInitialized && admin.apps.length === 0) {
    initializeAdmin();
  }
  if (!isAdminInitialized) return null;

  if (!db) {
    db = admin.firestore();
  }
  return db;
}

/**
 * Returns an initialized Storage instance.
 * Returns null if the admin SDK is not initialized.
 */
export function getStorage(): admin.storage.Storage | null {
  if (!isAdminInitialized && admin.apps.length === 0) {
    initializeAdmin();
  }
  if (!isAdminInitialized) return null;

  if (!storage) {
    storage = admin.storage();
  }
  return storage;
}

/**
 * Returns an initialized Auth instance.
 * Returns null if the admin SDK is not initialized.
 */
export function getAuthAdmin(): admin.auth.Auth | null {
  if (!isAdminInitialized && admin.apps.length === 0) {
    initializeAdmin();
  }
  if (!isAdminInitialized) return null;

  if (!auth) {
    auth = admin.auth();
  }
  return auth;
}
