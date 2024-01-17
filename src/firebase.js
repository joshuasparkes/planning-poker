import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyD9yQHJfCqp6CmM_VA-rhG163VlMZX5TNI",
  authDomain: "planning-po.firebaseapp.com",
  projectId: "planning-po",
  storageBucket: "planning-po.appspot.com",
  messagingSenderId: "1069403782108",
  appId: "1:1069403782108:web:c0f810a13bfdef23edad19",
  measurementId: "G-2PQLHXKH4P"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app); 
const db = getFirestore(app);

export { db, serverTimestamp, collection, addDoc, query, where, getDocs };