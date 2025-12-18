
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;
let auth: admin.auth.Auth;
let adminInitialized = false;

function initializeAdmin() {
  if (admin.apps.length > 0) {
    adminInitialized = true;
    return;
  }

  try {
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    };
    
    // Check if all required service account properties are present
    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
        throw new Error("Firebase service account is not configured correctly. Check your environment variables.");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'la-quinta-reservations.appspot.com',
    });
    
    adminInitialized = true;
    console.log('Firebase Admin SDK initialized successfully.');

  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.message);
    adminInitialized = false;
  }
}

// Initialize on module load
initializeAdmin();


export function getDb(): admin.firestore.Firestore | null {
  if (!adminInitialized) {
    console.warn("Firebase Admin not initialized. Cannot get Firestore instance.");
    return null;
  }
  if (!db) {
    db = admin.firestore();
  }
  return db;
}


export function getStorage(): admin.storage.Storage | null {
  if (!adminInitialized) {
    console.warn("Firebase Admin not initialized. Cannot get Storage instance.");
    return null;
  }
  if (!storage) {
    storage = admin.storage();
  }
  return storage;
}


export function getAuthAdmin(): admin.auth.Auth | null {
  if (!adminInitialized) {
    console.warn("Firebase Admin not initialized. Cannot get Auth instance.");
    return null;
  }
  if (!auth) {
    auth = admin.auth();
  }
  return auth;
}
