import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Importar Firestore
import { getMessaging, getToken, onMessage } from 'firebase/messaging'; // Importar Firebase Messaging

const firebaseConfig = {
    apiKey: "AIzaSyCfmRRTzHnX8GUJfvTWJ2mGqOYLQsY3fK4",
    authDomain: "sistema-requisiciones-ead59.firebaseapp.com",
    projectId: "sistema-requisiciones-ead59",
    storageBucket: "sistema-requisiciones-ead59.appspot.com",
    messagingSenderId: "539118408128",
    appId: "1:539118408128:web:3ca80b4a4b765b3dab7825"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Inicializar Firebase Cloud Messaging
const messaging = getMessaging(app);

// Función para solicitar el token del dispositivo para notificaciones push
export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { vapidKey: 'MhJ0YV7xMz0yWSjPowVlF04EfywoJ052uEVpqu93GaU' }); // Reemplaza con tu propia VAPID_KEY
    if (currentToken) {
      console.log('Token obtenido:', currentToken);
      return currentToken;
    } else {
      console.log('No se encontró token de notificación.');
    }
  } catch (error) {
    console.error('Error al obtener el token de notificación:', error);
  }
};

// Función para escuchar mensajes cuando la app está en primer plano
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Mensaje recibido en primer plano:', payload);
      resolve(payload);
    });
  });

export { messaging };
