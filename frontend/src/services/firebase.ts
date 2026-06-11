// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8mvVRey-15qFjXLsj3D1i0EzcX78mksw",
  authDomain: "sistema-9431b.firebaseapp.com",
  projectId: "sistema-9431b",
  storageBucket: "sistema-9431b.appspot.com",
  messagingSenderId: "302905239502",
  appId: "1:302905239502:web:96e502306583aa8f3bed9f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Servicios de Firebase
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const storage = getStorage(app);

// Exportar la app como default
export default app;