importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyBDbGrKGfvmerDd5VOBKtcLMp3MqlvJFXI",
  authDomain: "calcchat-c107e.firebaseapp.com",
  projectId: "calcchat-c107e",
  storageBucket: "calcchat-c107e.firebasestorage.app",
  messagingSenderId: "164921905642",
  appId: "1:164921905642:web:dac7cb73dad7bba1ee6293"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background notification handler
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png' 
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});