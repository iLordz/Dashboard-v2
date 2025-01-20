// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuBs06E_uUvkvdQGLjo6NWE3ieU9Srw7U",
  authDomain: "proyecto1-c7789.firebaseapp.com",
  projectId: "proyecto1-c7789",
  storageBucket: "proyecto1-c7789.firebasestorage.app",
  messagingSenderId: "3566460377",
  appId: "1:3566460377:web:130b01d973ff91b7704dc8"
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);
export default appFirebase