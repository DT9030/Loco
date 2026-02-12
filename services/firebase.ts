
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMRztQK6flxPRnNXVRO2R0QPKJD6Ki4Bw",
  authDomain: "locolo-82f7b.firebaseapp.com",
  projectId: "locolo-82f7b",
  storageBucket: "locolo-82f7b.firebasestorage.app",
  messagingSenderId: "678494665349",
  appId: "1:678494665349:web:e04a587cdb19158a9087ec",
  measurementId: "G-J8FXSXTX3Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
