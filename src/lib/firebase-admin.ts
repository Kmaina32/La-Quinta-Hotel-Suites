
import admin from 'firebase-admin';

/**
 * Aggressively cleans the Firebase Private Key from environment variables.
 * Handles literal newlines, escaped newlines (\n), and extra quotes.
 */
function formatPrivateKey(key: string | undefined) {
  if (!key) return undefined;
  return key.replace(/\\n/g, '\n').replace(/"/g, '');
}

function initializeAdmin() {
  if (!admin.apps.length) {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID || "la-quinta-reservations";
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

      if (!clientEmail || !privateKey) {
        console.warn('CRITICAL: Firebase Admin credentials missing from environment. Certain admin features will be offline.');
        return;
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('Firebase Admin initialization failed:', error.message);
    }
  }
}

export function getDb(): admin.firestore.Firestore {
  initializeAdmin();
  if (!admin.apps.length) throw new Error("Firebase Admin not initialized");
  return admin.firestore();
}

export function getStorage(): admin.storage.Storage {
  initializeAdmin();
  if (!admin.apps.length) throw new Error("Firebase Admin not initialized");
  return admin.storage();
}

export function getAuthAdmin(): admin.auth.Auth {
  initializeAdmin();
  if (!admin.apps.length) throw new Error("Firebase Admin not initialized");
  return admin.auth();
}
