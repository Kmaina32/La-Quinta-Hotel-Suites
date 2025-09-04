
import admin from 'firebase-admin';

let db: admin.firestore.Firestore | null = null;

async function initializeAdmin(): Promise<admin.firestore.Firestore> {
  if (db) {
    return db;
  }

  // Correctly format the private key by replacing escaped newlines.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  };

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.error('Firebase service account credentials are not set in .env.local');
    throw new Error('Firebase service account credentials are not set in .env.local');
  }

  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin app initialized successfully.');
    }
    db = admin.firestore();
    console.log('Firestore instance obtained.');
    return db;
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
    throw new Error('Firebase admin initialization failed.');
  }
}

let dbPromise: Promise<admin.firestore.Firestore> | null = null;

export function getDb(): Promise<admin.firestore.Firestore> {
  if (!dbPromise) {
    dbPromise = initializeAdmin();
  }
  return dbPromise;
}
