
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This is a singleton to ensure we only initialize the app once.
let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;
let auth: admin.auth.Auth;

function initializeAdmin() {
  if (admin.apps.length > 0) {
    return;
  }

  try {
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'la-quinta-reservations.appspot.com',
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
    throw new Error('Firebase admin initialization failed. Check your environment variable configuration.');
  }
}

/**
 * Returns an initialized Firestore database instance.
 */
export function getDb(): admin.firestore.Firestore {
  if (!db) {
    initializeAdmin();
    db = admin.firestore();
  }
  return db;
}

/**
 * Returns an initialized Storage instance.
 */
export function getStorage(): admin.storage.Storage {
  if (!storage) {
    initializeAdmin();
    storage = admin.storage();
  }
  return storage;
}

/**
 * Returns an initialized Auth instance.
 */
export function getAuthAdmin(): admin.auth.Auth {
  if (!auth) {
    initializeAdmin();
    auth = admin.auth();
  }
  return auth;
}
