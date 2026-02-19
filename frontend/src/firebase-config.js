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

export const requestForToken = async (userId, apiBase) => {
  try {
    // 1. Manually ask for permission first
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission denied.');
      return;
    }

    // 2. Get the FCM token
    const currentToken = await getToken(messaging, { 
      vapidKey: 'BB05dCotgSpcZaHjFM6T-E-Cc3fPkWyyb1LOcVf706todBf1tHywwADqrV2aEgxWtKEbOhhbv_R_NtVBRIHaStE' 
    });

    if (currentToken) {
      console.log('FCM Token generated successfully');
      
      // 3. Send to your server
      await axios.post(`${apiBase}/save-token`, { userId, token: currentToken });
      console.log('Token saved to database');
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  } catch (err) {
    console.error('An error occurred while retrieving token:', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });