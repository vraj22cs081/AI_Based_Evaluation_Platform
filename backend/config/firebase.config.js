const admin = require('firebase-admin');
const serviceAccount = require('/etc/secrets/serviceAccountKey.json');

if (!process.env.FIREBASE_STORAGE_BUCKET) {
    throw new Error('FIREBASE_STORAGE_BUCKET environment variable is not set');
}

// Initialize Firebase Admin
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const storage = admin.storage();

// Get bucket with explicit name
const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

// Verify bucket exists
async function verifyBucket() {
    try {
        const [exists] = await bucket.exists();
        if (!exists) {
            throw new Error('Bucket does not exist');
        }
        console.log('Successfully connected to Firebase Storage bucket:', bucket.name);
    } catch (error) {
        console.error('Firebase Storage bucket error:', error);
        throw error;
    }
}

// Verify bucket on startup
verifyBucket().catch(console.error);

module.exports = { storage, bucket }; 
