// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "la-quinta-reservations",
  "appId": "1:255227966364:web:c9fb4b35a07e35e9380e59",
  "storageBucket": "la-quinta-reservations.firebasestorage.app",
  "apiKey": "AIzaSyCymxOo3XZxxiboayLWA5x1XNbwtbeNO7c",
  "authDomain": "la-quinta-reservations.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "255227966364"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
