
import admin from 'firebase-admin';

// This is a singleton to ensure we only initialize the app once.
let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;

function initializeAdmin() {
  if (!admin.apps.length) {
    try {
      const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;

      if (!encoded) {
        throw new Error(
          'FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 environment variable not found.'
        );
      }

      // Decode Base64
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');

      // IMPORTANT: do NOT modify JSON before parsing
      const serviceAccount = JSON.parse(decoded);

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          // Only fix newlines on the private key property
          privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
        }),
        storageBucket:
          process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
          'la-quinta-reservations.appspot.com',
      });

      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('Firebase admin initialization error:', error);
      // Log the decoded string to see if it's valid JSON
      if (error instanceof SyntaxError) {
          const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64!, 'base64').toString('utf-8');
          console.error('Problematic decoded JSON string:' + decoded);
      }
      throw new Error(
        'Firebase admin initialization failed. Check your environment variables.'
      );
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
