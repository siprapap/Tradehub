import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";
 
const firebaseConfig = {
  apiKey: "AIzaSyDmlQHlcAppl00ipMLUzUb2Wf1yD24PgrI",
  authDomain: "tradehub-d7d2c.firebaseapp.com",
  projectId: "tradehub-d7d2c",
  storageBucket: "tradehub-d7d2c.firebasestorage.app",
  messagingSenderId: "877695204872",
  appId: "1:877695204872:web:33c9b3253ea80a06ec5bbd",
  measurementId: "G-0XLWGZ82C6"
};
 
// Prevent re-initializing on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
 
export const storage = getStorage(app);
 