import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Placeholder config. Replace with environment-specific values at deploy time.
const firebaseConfig = {
  apiKey: "AIzaSyB-iT2ti3hk9sHAjdF19DkYFvHiLEnBNcw",
  authDomain: "orbit-65e7a.firebaseapp.com",
  projectId: "orbit-65e7a",
  storageBucket: "orbit-65e7a.firebasestorage.app",
  messagingSenderId: "669266611289",
  appId: "1:669266611289:web:6766e429d4013afb70b548",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };