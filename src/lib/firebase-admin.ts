import admin from 'firebase-admin';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

let adminDb: admin.firestore.Firestore | null = null;

if (!admin.apps.length) {
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      adminDb = admin.firestore();
    } catch (error: any) {
      console.error('Firebase admin initialization error', error.stack);
    }
  } else {
    console.log('Firebase service account credentials are not set in .env.local. Skipping initialization.');
  }
} else {
    adminDb = admin.firestore();
}


export { adminDb };
