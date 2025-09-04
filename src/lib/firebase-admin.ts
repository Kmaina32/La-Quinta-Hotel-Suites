
import admin from 'firebase-admin';

// This is a singleton to ensure we only initialize the app once.
let db: admin.firestore.Firestore;

/**
 * Returns an initialized Firestore database instance.
 * It initializes the Firebase Admin SDK if it hasn't been already.
 */
export function getDb(): admin.firestore.Firestore {
  if (db) {
    return db;
  }

  // Check if the app is already initialized
  if (!admin.apps.length) {
      // Check for necessary environment variables from .env.local
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (!projectId || !clientEmail || !privateKey) {
          let missingVars = [];
          if (!projectId) missingVars.push('FIREBASE_PROJECT_ID');
          if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL');
          if (!privateKey) missingVars.push('FIREBASE_PRIVATE_KEY');
          throw new Error(`Firebase admin initialization failed. The following environment variables are missing: ${missingVars.join(', ')}. Please check your .env.local file.`);
      }

      try {
          admin.initializeApp({
              credential: admin.credential.cert({
                  projectId,
                  clientEmail,
                  // The private key needs to have newlines correctly formatted.
                  privateKey: privateKey.replace(/\\n/g, '\n'),
              }),
          });
          console.log('Firebase Admin SDK initialized successfully.');
      } catch (error: any) {
          console.error('Firebase admin initialization error:', error.stack);
          throw new Error('Firebase admin initialization failed. Check your service account credentials.');
      }
  }

  db = admin.firestore();
  return db;
}
