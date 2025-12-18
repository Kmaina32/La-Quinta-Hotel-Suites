
import admin from 'firebase-admin';

// This is a singleton to ensure we only initialize the app once.
let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;

function initializeAdmin() {
  // Check if the app is already initialized
  if (!admin.apps.length) {
    try {
      const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;

      if (!encoded) {
        throw new Error(
          'FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 environment variable not found.'
        );
      }

      // Decode Base64 to a string
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      
      // IMPORTANT: Parse the decoded string into a JSON object first.
      const serviceAccount = JSON.parse(decoded);

      // Now, initialize the app, but correct the private key format within the cert object.
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'la-quinta-reservations.appspot.com',
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('Firebase admin initialization error:', error.stack);
      // Throw a more specific error to help with debugging
      throw new Error('Firebase admin initialization failed. Check the hardcoded service account credentials.');
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
export default initializeAdmin;
