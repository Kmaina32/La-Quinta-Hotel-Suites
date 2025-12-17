
import admin from 'firebase-admin';
import 'dotenv/config';

// This is a singleton to ensure we only initialize the app once.
let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;

function initializeAdmin() {
  if (!admin.apps.length) {
    try {
      if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 environment variable not found.');
      }

      const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf-8');
      const serviceAccount = JSON.parse(serviceAccountJson);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'la-quinta-reservations.appspot.com',
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('Firebase admin initialization error:', error.stack);
      throw new Error('Firebase admin initialization failed. Check your environment variables.');
    }
  }
}

/**
 * Returns an initialized Firestore database instance.
 */
export function getDb(): admin.firestore.Firestore {
  if (db) {
    return db;
  }
  initializeAdmin();
  db = admin.firestore();
  return db;
}

/**
 * Returns an initialized Storage instance.
 */
export function getStorage(): admin.storage.Storage {
    if (storage) {
        return storage;
    }
    initializeAdmin();
    storage = admin.storage();
    return storage;
}
