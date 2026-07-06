import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYiE0EuO-qqMXqZTlBMFkHGTKHNeIxeWw",
  authDomain: "gen-lang-client-0374978140.firebaseapp.com",
  projectId: "gen-lang-client-0374978140",
  storageBucket: "gen-lang-client-0374978140.firebasestorage.app",
  messagingSenderId: "606579783030",
  appId: "1:606579783030:web:6f32708f3c95b9bfed3657"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-talkingrabbittai-b0327b1a-ebc9-4fed-aac6-5c5477cb9065");
