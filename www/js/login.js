import { auth, signInWithEmailAndPassword } from "./firebase-config.js";


document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            
            const user = userCredential.user;
            console.log("User signed in:", user);
            
            alert(`logged in as ${user.email}`);
            localStorage.setItem('userId', user.uid);
            localStorage.setItem('email', user.email);
            window.location.href = 'main.html';
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error signing in:", errorCode, errorMessage);
            alert("Error signing in:", errorCode, errorMessage);
        });
});