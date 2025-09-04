
import admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;

function initializeAdmin() {
  if (admin.apps.length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        adminDb = admin.firestore();
        console.log('Firestore initialized successfully.');
      } catch (error: any) {
        console.error('Firebase admin initialization error', error.stack);
      }
    } else {
      console.log('Firebase service account credentials are not set. Skipping initialization.');
    }
  } else if (!adminDb) {
    adminDb = admin.firestore();
  }
}

initializeAdmin();

export { adminDb };
