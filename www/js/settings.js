import { auth, signInWithEmailAndPassword, reauthenticateWithCredential, EmailAuthProvider, updateEmail, sendEmailVerification } from "./firebase-config.js";

function logout() {
    alert("You have been logged out.");
    localStorage.clear();
    window.location.href = "default-landing.html";
}

document.getElementById("logout").addEventListener("click",  () => {
    logout();
});

document.getElementById("deleteAccount").addEventListener("click",  (e) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete your account?")) {
        const user = auth.currentUser ;

        if (user) {


            const credential = prompt("Please enter your password to confirm account deletion:");

        
        const email = user.email;
        const password = credential; 

        
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                
                user.delete()
                    .then(() => {
                        
                        alert("Your account has been deleted successfully.");
                        
                        
                    })
                    .catch((error) => {
                        console.error("Error deleting account:", error);
                        alert("Error deleting account. Please try again.");
                    });
            })
            .catch((error) => {
                console.error("Error re-authenticating:", error);
                alert("Re-authentication failed. Please check your password and try again.");
            });
        alert("Account deleted");
        logout();
        } else {
            alert("Error deleting account. Please try again. User not authenticated.");
        }
    }
});

document.getElementById("changeEmail").addEventListener("click", async (e) => {
    e.preventDefault();
    const user = auth.currentUser ;

    if (user) {
        
        const newEmail = prompt("Please enter your new email:");
        const password = prompt("Please enter your password to confirm:");

        if (newEmail && password) {
            
            const credential = EmailAuthProvider.credential(user.email, password);

            
            try {
                await signInWithEmailAndPassword(auth, user.email, password);
                
                
                await sendEmailVerification(user);
                alert(`A verification email has been sent to ${newEmail}. Please verify your email before updating it.`);
                
                
                logout();
            } catch (error) {
                console.error("Error during re-authentication or email update:", error);

                if (error.code === "auth/wrong-password") {
                    alert("The password you entered is incorrect. Please try again.");
                } else if (error.code === "auth/invalid-email") {
                    alert("The new email address is invalid. Please check the format and try again.");
                } else if (error.code === "auth/email-already-in-use") {
                    alert("The new email address is already in use by another account.");
                } else if (error.code === "auth/requires-recent-login") {
                    alert("Your credentials are too old. Please log out and log back in to update your email.");
                } else {
                    alert("An error occurred. Please try again.");
                }
            }
        } else {
            alert("Email and password cannot be empty.");
        }
    } else {
        alert("No user is currently signed in.");
    }
});

document.getElementById("resetPassword").addEventListener("click",  () => {
    const user = auth.currentUser ;

    if (user) {
    const email = auth.currentUser.email;

    sendPasswordResetEmail(auth, email)
        .then(() => {
            
            alert(`Password reset email sent to ${email}. Please check your inbox.`);
            logout();
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error sending password reset email:", errorCode, errorMessage);
            alert("Error sending password reset email. Please try again.");
        });
    } else {
        alert("No user is currently signed in.");
    }
});