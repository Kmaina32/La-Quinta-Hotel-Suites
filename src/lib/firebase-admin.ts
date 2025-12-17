
import admin from 'firebase-admin';
import 'dotenv/config';

// This is a singleton to ensure we only initialize the app once.
let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;

function initializeAdmin() {
  if (!admin.apps.length) {
    try {
      const serviceAccount = {
        "type": "service_account",
        "project_id": process.env.FIREBASE_PROJECT_ID,
        "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
        "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        "client_id": process.env.FIREBASE_CLIENT_ID,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL?.replace('@', '%40')}`
      };

      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        throw new Error('Firebase Admin credentials not found in environment variables.');
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        storageBucket: 'la-quinta-reservations.appspot.com',
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
