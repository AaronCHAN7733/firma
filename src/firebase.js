// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Importar Firestore

const firebaseConfig = {
    apiKey: "AIzaSyCTIcAxkiZgDfiEoKoWcIMx5AcSaIyJqoI",
    authDomain: "strong-box2.firebaseapp.com",
    databaseURL: "https://strong-box2-default-rtdb.firebaseio.com",
    projectId: "strong-box2",
    storageBucket: "strong-box2.appspot.com",
    messagingSenderId: "1024256847796",
    appId: "1:1024256847796:web:c2fb7ace47207dcf03cce1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

