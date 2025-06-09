import * as admin from 'firebase-admin';

// only initialize admin one time
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK');
    console.error(error);
  }
}

export { admin };
