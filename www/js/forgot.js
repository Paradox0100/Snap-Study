import { auth, sendPasswordResetEmail } from "./firebase-config.js";

document.getElementById("reset-password-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("reset-email").value;

    sendPasswordResetEmail(auth, email)
        .then(() => {
            
            alert(`Password reset email sent to ${email}. Please check your inbox.`);
            window.location.href = "login.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error sending password reset email:", errorCode, errorMessage);
            alert("Error sending password reset email. Please check the email address and try again.");
        });
});