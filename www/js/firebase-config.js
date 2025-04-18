import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, reauthenticateWithCredential, EmailAuthProvider, updateEmail } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, setDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";




  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  export { auth, db, onAuthStateChanged, createUserWithEmailAndPassword, sendEmailVerification, doc, getDoc, collection, getDocs, setDoc, deleteDoc, updateDoc, sendPasswordResetEmail, signInWithEmailAndPassword, reauthenticateWithCredential, EmailAuthProvider, updateEmail };