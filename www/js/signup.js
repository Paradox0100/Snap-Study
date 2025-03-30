import { auth, createUserWithEmailAndPassword, sendEmailVerification } from "./firebase-config.js";

document.getElementById("signup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("User  signed up as:", user);

            
            sendEmailVerification(user)
                .then(() => {
                    
                    alert(`Signed up as ${user.email}. Please check your email to verify your account.`);
                    localStorage.setItem('userId', user.uid);
                    localStorage.setItem('email', user.email);
                    
                    window.location.href = 'login.html'; 
                })
                .catch((error) => {
                    console.error("Error sending verification email:", error);
                    alert("Error sending verification email. Please try again.");
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error signing up:", errorCode, errorMessage);
            alert("Error signing up. Please check your credentials and try again.");
        });
});

 

