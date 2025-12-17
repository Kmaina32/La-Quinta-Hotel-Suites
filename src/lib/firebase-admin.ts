
import admin from 'firebase-admin';

// This is a singleton to ensure we only initialize the app once.
let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;

const serviceAccount = {
  "type": "service_account",
  "project_id": "la-quinta-reservations",
  "private_key_id": "4ddf6813049d934524e096c247fcf0215e606a29",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDEZXnhjlASZXaF\n0OiOyODg4zZbV+an4i1DUVGFmO+ybjPhzO5SN2n6amtn8WydIKmTmwizCbC63LJM\nzMyVdqlCKG0kOmPVfegMY732qBsEIOrqGe9cI0brkUsSzcD9d2iQpREmq2vk2PRu\nSY4x38IOpoJVI5zwzikKK2KEQdLPSYvGZRoJkmeLecoARyoZsyGfmsxwpD96+NcC\E88rqtBhbsgQf4U0MqVYmsuwRqxpRb3b9EbVxitzQVjv5/OcZAGCs0iFsqbvG8fg\ni4x4mCs9q0ch/2kGVSfuOG7+cfqT0/aR2LX7SwJgMon3kDo8BVbyI6RvhtNJIPdB\n13JvOMJrAgMBAAECggEAKZGu+AJmyVYHfbBnoN081+zPswrKa+twGCkMn8HsrjAs\nNBVrtiQ7fsDqpfAQRLvGmNL+RuL8sLiIr+cZ+BbWAD1hO8E9Ym2RXURHrWbLkcH\nYfCGXNKsrqysnrjFKgENtVvy4uPyrNgM+JECE2VgjjhJKtskW0XPovLm4caK58uy\nxquhAwb416cMkqGqc8fxV6IHngAG30QmzMldKvDPhNPRp4XHzgYF7IqekIYBwTQU\n8xvHZ/5EfUtHd7pFWWTVsKmd8X+OYMM/jMGoblJy2VZHTUBziS4UWUdHakT36dPD\nL4EEUqnMk/qMonBULZSUUZApvhQqqayw4XExjeAOmQKBgQDsonaqTg94s25oChZ9\nfG7CcJzVNfK+LI26U93mnBjHvpCfmz3PZVxKMXhNN+yL2RcBHf4b1WTsfZAHP8NB\njfXWWwu6j4ZhHPgPL2DbSJlfzyqLcTDWDOgpD2YtBz9jIi4Oj8419qfujke0Gt1Q\nwa1Hkoh6rqY6JNUsBSe9nGN1qQKBgQDUeAO9UJnwjtXGkPy2XmuPF3R2G4nbTnRy\n9++KOyz3EHwiUxtRSV+IqXbCEYvsVNV+qi7HW3r0R68I+Y2oU9Yrt8PHmEOe6DDp\nPPXaCclFjZQzY9EY33ducYAJX0SjJfOCf/5N79X7O4+sn9gF6OBHb/w/8PReT1FP\nmpWl1jVb8wKBgQCV4VlUCVlXVB8sGqegF753vag4i5ESz1l9mT1Fob04VwV3cna1\n9Dd+btMJ5dAXzAr8FCktK/5epDEjxklALlB10vkc02eD/ztHMvUgL12mB6uk4q7S\nBR7PUweeoaaOfcm6Q2+TUoWPXeMguptPWT0NxkxXmGOFFGtJFILVYEbG8QKBgGqQ\nPx/mmy8CFMpg0b8OIFhGZU0PhtcNxG4dWHE2ONk51WjJ0fu1F0tN45h2gH1qFyJO\nbOPkSAjZIzsXHyt70QFgS7uB7Ph4cH+q6YwQOHjAB8K2n5sgCaDFIHiS5bQGRtn/\nJCcm0WYOe4MTMJ/WKxbpXdUcHxRmJ9wLJl9kzqJtAoGBAKBUVu74DojACtOutFd4\nWMug/9ekYHfxs/HJ2A3Ek3Z3hTpYfeGrqfoWqz61yvnNAUgeWKxztLdYh6DzTjXB\nGakkCI9mjGJ4mbA8+nz/1MqFdTa3TcdfKwa6jG+Q0tNCZZGTQDychutkDcDCGUCE\ngIHlmZbfOV6C1fplJ6kb/mcC\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@la-quinta-reservations.iam.gserviceaccount.com"
};

function initializeAdmin() {
  // Check if the app is already initialized
  if (!admin.apps.length) {
    try {
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
