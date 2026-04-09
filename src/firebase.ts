/*----*/

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtO9WyVf6F2jy5Tcwcjadd19tVMsQUfoM",
  authDomain: "menu-shawermitna.firebaseapp.com",
  databaseURL: "https://menu-shawermitna-default-rtdb.firebaseio.com",
  projectId: "menu-shawermitna",
  storageBucket: "menu-shawermitna.firebasestorage.app",
  messagingSenderId: "286953363847",
  appId: "1:286953363847:web:8e856a390865ef24e55b22"
};

const app = initializeApp(firebaseConfig);

// 👇 هذا هو المهم
export const db = getDatabase(app);
export const auth = getAuth(app);
