const admin = require('firebase-admin');

const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      if (!process.env.FB_SERVICE_ACCOUNT_BASE64) {
        throw new Error('FB_SERVICE_ACCOUNT_BASE64 is not defined in .env');
      }
      const decoded = Buffer.from(process.env.FB_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
      const serviceAccount = JSON.parse(decoded);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Firebase Admin Initialized Successfully");
    } catch (error) {
      console.error("❌ Firebase Initialization Error:", error.message);
    }
  }
  return admin;
};

module.exports = initializeFirebase;
