import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from 'axios';

const firebaseConfig = {
  apiKey: "AIzaSyBDbGrKGfvmerDd5VOBKtcLMp3MqlvJFXI",
  authDomain: "calcchat-c107e.firebaseapp.com",
  projectId: "calcchat-c107e",
  storageBucket: "calcchat-c107e.firebasestorage.app",
  messagingSenderId: "164921905642",
  appId: "1:164921905642:web:dac7cb73dad7bba1ee6293"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = (userId, apiBase) => {
  // Replace 'YOUR_PUBLIC_VAPID_KEY' with the key from Firebase Console -> Cloud Messaging tab
  return getToken(messaging, { vapidKey: 'BB05dCotgSpcZaHjFM6T-E-Cc3fPkWyyb1LOcVf706todBf1tHywwADqrV2aEgxWtKEbOhhbv_R_NtVBRIHaStE' })
    .then((currentToken) => {
      if (currentToken) {
        console.log('FCM Token generated');
        axios.post(`${apiBase}/save-token`, { userId, token: currentToken });
      }
    })
    .catch((err) => console.log('Notification permission denied or error:', err));
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });