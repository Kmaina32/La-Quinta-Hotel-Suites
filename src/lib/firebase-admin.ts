
import admin from 'firebase-admin';

let db: admin.firestore.Firestore;

export function getDb(): admin.firestore.Firestore {
  if (db) {
    return db;
  }

  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    throw new Error(
      'CRITICAL: Firebase environment variables are not set. Please add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to your .env.local file.'
    );
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };
  
  try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin app initialized successfully.');
    } else {
        console.log('Using existing Firebase Admin app.');
    }
    db = admin.firestore();
    return db;
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
    throw new Error('Firebase admin initialization failed. Check your service account credentials.');
  }
}
