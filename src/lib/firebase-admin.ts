import admin from 'firebase-admin';

// Create a service account with minimal permissions for testing
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || "taha-al-sabaag",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-test@taha-al-sabaag.iam.gserviceaccount.com",
  // Generate a fake private key for development purposes
  privateKey: process.env.FIREBASE_PRIVATE_KEY || 
    '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----\n'
};

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully with service account');
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    
    // Fallback to initialize with just project ID if service account fails
    try {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "taha-al-sabaag"
      });
      console.log('Firebase Admin initialized with project ID fallback');
    } catch (fallbackError) {
      console.error('Firebase admin fallback initialization error:', fallbackError);
    }
  }
}

// Get Firestore instance
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

export default admin;