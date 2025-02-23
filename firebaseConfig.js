// firebaseConfig.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyAKcjuEhj_kf9I8UxDvwkggAa48vP5XV8I",
    authDomain: "kindle-dash-5aa8c.firebaseapp.com",
    projectId: "kindle-dash-5aa8c",
    storageBucket: "kindle-dash-5aa8c.firebasestorage.app",
    messagingSenderId: "1044896662183",
    appId: "1:1044896662183:web:2f7d58650614ce68e1d182",
    measurementId: "G-L57LF1PZYC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };