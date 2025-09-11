
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCymxOo3XZxxiboayLWA5x1XNbwtbeNO7c",
  authDomain: "la-quinta-reservations.firebaseapp.com",
  databaseURL: "https://la-quinta-reservations-default-rtdb.firebaseio.com",
  projectId: "la-quinta-reservations",
  storageBucket: "la-quinta-reservations.firebasestorage.app",
  messagingSenderId: "255227966364",
  appId: "1:255227966364:web:c258d7ddb330ac7f380e59"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
