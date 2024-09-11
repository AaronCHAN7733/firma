// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Importar Firestore

const firebaseConfig = {
    apiKey: "AIzaSyCfmRRTzHnX8GUJfvTWJ2mGqOYLQsY3fK4",
    authDomain: "sistema-requisiciones-ead59.firebaseapp.com",
    projectId: "sistema-requisiciones-ead59",
    storageBucket: "sistema-requisiciones-ead59.appspot.com",
    messagingSenderId: "539118408128",
    appId: "1:539118408128:web:3ca80b4a4b765b3dab7825"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


