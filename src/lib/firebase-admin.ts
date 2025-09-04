
import admin from 'firebase-admin';

let db: admin.firestore.Firestore;

export function getDb(): admin.firestore.Firestore {
  if (db) {
    return db;
  }

  // The Firebase Admin SDK is automatically initialized by App Hosting.
  // https://firebase.google.com/docs/app-hosting/automatic-initialization
  if (!admin.apps.length) {
    admin.initializeApp();
    console.log('Firebase Admin app initialized successfully.');
  } else {
    console.log('Using existing Firebase Admin app.');
  }

  db = admin.firestore();
  return db;
}
