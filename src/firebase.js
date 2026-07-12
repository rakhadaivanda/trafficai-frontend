// Firebase configuration for TrafficAI
// Dokumentasi: https://firebase.google.com/docs/web/setup
//
// INSTRUKSI:
// 1. Buat project di https://console.firebase.google.com
// 2. Aktifkan Authentication > Sign-in method > Google dan Phone
// 3. Aktifkan Cloud Firestore
// 4. Copy konfigurasi Firebase ke variabel firebaseConfig di bawah ini
// 5. Atau atur melalui environment variables VITE_FIREBASE_*

import { initializeApp } from "firebase/app";
import { 
  getAuth, GoogleAuthProvider, RecaptchaVerifier, 
  signInWithPhoneNumber, signInWithPopup, signOut,
  signInWithEmailAndPassword, createUserWithEmailAndPassword
} from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// -- Auth helpers --

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export function setupRecaptcha(elementId) {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      size: "invisible",
      callback: () => {},
    });
  }
  return window.recaptchaVerifier;
}

export async function sendPhoneOTP(phoneNumber, recaptchaVerifier) {
  const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  return confirmation;
}

export async function loginWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function registerWithEmail(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logoutUser() {
  await signOut(auth);
}

// -- Firestore history helpers --

export async function saveHistoryToFirestore(uid, historyItem) {
  try {
    await addDoc(collection(db, "users", uid, "history"), {
      ...historyItem,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Gagal menyimpan riwayat:", e);
  }
}

export async function getHistoryFromFirestore(uid) {
  try {
    const q = query(
      collection(db, "users", uid, "history"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ firestoreId: d.id, ...d.data() }));
  } catch (e) {
    console.error("Gagal memuat riwayat:", e);
    return [];
  }
}

export async function clearHistoryFromFirestore(uid) {
  try {
    const snapshot = await getDocs(collection(db, "users", uid, "history"));
    const deletePromises = snapshot.docs.map((d) => deleteDoc(doc(db, "users", uid, "history", d.id)));
    await Promise.all(deletePromises);
  } catch (e) {
    console.error("Gagal menghapus riwayat:", e);
  }
}

export { auth, db };
