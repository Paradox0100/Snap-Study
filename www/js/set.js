
import { auth, db, onAuthStateChanged, doc, getDoc, deleteDoc, updateDoc } from "./firebase-config.js";
import { addSharedSet } from "./shareMod.js";



function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}
showLoading();


function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    let recent = JSON.parse(localStorage.getItem('recent')) || [];
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    if (name != undefined) {
    const inSetName = JSON.parse(localStorage.getItem("set")).name;
    console.log(JSON.parse(localStorage.getItem("set")).inId)
    if (name && name.length > 0) {
        let tempName;
        if (JSON.parse(localStorage.getItem("set")).draft) {
            tempName = `(draft) ${inSetName}`;
        } else {
            tempName = inSetName;
        }
        let temp;
        if (urlParams.get('shared')) {
            temp = { "name": inSetName, "maker": JSON.parse(localStorage.getItem("set")).maker, "shared": urlParams.get('shared'), "id": JSON.parse(localStorage.getItem("set")).inId };
        } else {
            temp = { "name": inSetName, "maker": JSON.parse(localStorage.getItem("set")).maker, "shared": urlParams.get('shared') };
        }
        console.log("Recent item:", temp);
        
        if (recent.length === 10) {
            recent.pop();
        }


        recent.unshift(temp);

        
        localStorage.setItem('recent', JSON.stringify(recent));
    }
}
});


document.addEventListener("DOMContentLoaded", function() {
    
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("User is authenticated:", user.uid);

            
            const urlParams = new URLSearchParams(window.location.search);
            const setName = urlParams.get('name'); 

            if (setName) {
                
                const storedSet = JSON.parse(localStorage.getItem('set'));
                if (storedSet && ((storedSet.name === setName) || (storedSet.inId === setName))) {
                    
                    const flashcardSet = storedSet;
                    console.log("Using cached flashcard set:", JSON.stringify(flashcardSet, null, 2));
                    main(flashcardSet);
                } else {
                    
                    const flashcardSet = await getFlashcardSetByName(setName);
                    if (flashcardSet) {
                        
                        localStorage.setItem('set', JSON.stringify(flashcardSet));
                        
                        console.log("Fetched flashcard set:", JSON.stringify(flashcardSet, null, 2));
                        main(flashcardSet);
                    } else {
                        console.error("Flashcard set not found.");
                        alert("Flashcard set not found.");
                        window.location.href = "main.html";
                    }
                }
            } else {
                console.error("No set name provided.");
                alert("No set name provided.");
                window.location.href = "main.html";
            }
        } else {
            console.log("No user is signed in.");
        
        }
    });
});

function main(flashcardSet) {
    console.log("Displaying flashcard set:", flashcardSet.maker);
    if (flashcardSet.draft) {
        document.getElementById("set-name").innerText = `(draft) ${flashcardSet.name}`;   
    } else {
        document.getElementById("set-name").innerText = flashcardSet.name;
    }
    if (flashcardSet.maker === localStorage.getItem("email")) {
        try {
            document.getElementById("options-container").style.display = "flex";
        } catch (error) {
            console.error("Error displaying buttons: ", error);
        }
        document.getElementById("user-email").innerText = `by: you`;
    } else {
        document.getElementById("user-email").innerText = `by: ${flashcardSet.maker}`;
    }
    
    let terms = flashcardSet.terms;
    let definitions = flashcardSet.definitions;

    for (let i = 0; i < terms.length; i++) {
        let setElement = document.createElement("div");

        setElement.classList.add("set-box");
        let htmlData = `
            <span class="term">${terms[i]}</span>
            <div class="divider"></div>
            <span class="definition">${definitions[i]}</span>
            <div class="icons">
                <i class="audio-icon">🔊</i>
            </div>
        `;

        setElement.innerHTML = htmlData;
        setElement.addEventListener("click", function() {
            let term = setElement.querySelector(".term").innerText;
            let definition = setElement.querySelector(".definition").innerText;
            let tempText = `term ${term} definition ${definition}`;
            handleCardText(tempText);
        });
        document.getElementById("terms").appendChild(setElement);
    }
    hideLoading();
}


async function getFlashcardSetByName(setName) {
    const user = auth.currentUser ; 
    if (!user) {
        console.error("User  is not authenticated.");
        return null;
    }

    let urlParams = new URLSearchParams(window.location.search);
    let shared = urlParams.get('shared');

    console.log(shared);
    let setRef; 

    if (!shared) {
        console.log("not shared");
        const uid = user.uid; 
        setRef = doc(db, "flashcards", uid, "sets", setName); 
    } else {
        console.log("shared");
        setRef = doc(db, "flashcards", "shared", "sets", setName); 
    }

    try {
        showLoading(); 
        const docSnap = await getDoc(setRef); 
        hideLoading(); 

        if (docSnap.exists()) {
            console.log("Flashcard set data:", docSnap.data());
            localStorage.setItem("set", JSON.stringify(docSnap.data()));
            return docSnap.data(); 
        } else {
            console.log("No such flashcard set!");
            return null; 
        }
    } catch (error) {
        hideLoading(); 
        console.error("Error retrieving flashcard set: ", error);
    }
}
document.getElementById("edit-btn").addEventListener('click', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const shared = urlParams.get('shared');
    if (shared) {
        window.location.href = `edit.html?name=${encodeURIComponent(JSON.parse(localStorage.getItem("set")).inId)}&shared=${true}`;
    } else {
        window.location.href = "edit.html?name=" + encodeURIComponent(JSON.parse(localStorage.getItem("set")).name);
    }
});

document.getElementById("delete-btn").addEventListener('click', function() {
    if (confirm("Are you sure you want to delete this set?")) {
        const urlParams = new URLSearchParams(window.location.search);
            const setName = urlParams.get('name');
            const shared = urlParams.get('shared');
            if (shared) {
                deleteSet(true);
            } else {
                deleteSet(false);
            }
    }
});
async function deleteSet(shared) {
    const user = auth.currentUser; 
    if (!user) {
        console.error("User is not authenticated.");
        return;
    }


    const uid = user.uid; 

    let setRef; 
    if (!shared) {
        let setName = JSON.parse(localStorage.getItem("set")).name;
        setRef = doc(db, "flashcards", uid, "sets", setName); 
    } else {
        let setName = JSON.parse(localStorage.getItem("set")).inId;
        setRef = doc(db, "flashcards", "shared", "sets", setName); 
    }

    try {
        await deleteDoc(setRef);
        console.log("Flashcard set deleted successfully.");
        
        localStorage.removeItem("set");
        
        window.location.href = "main.html?afterMsg=Set%20has%20been%20deleted%21"; 
    } catch (error) {
        console.error("Error deleting flashcard set: ", error);
    }
}

const modal = document.getElementById("emailModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const emailForm = document.getElementById("emailForm");
const emailInputsContainer = document.getElementById("emailInputs");
const addEmailBtn = document.getElementById("addEmailBtn");

function populateEmails(existingEmails) {
    
    console.log("Existing emails:", existingEmails);
    emailInputsContainer.innerHTML = "";

    // Load existing emails into the modal
    existingEmails.forEach(email => {
        const newEmailInput = document.createElement("div");
        newEmailInput.classList.add("email-input");
        newEmailInput.innerHTML = `
            <input type="email" class="email" required placeholder="Enter email address" value="${email}">
            <button type="button" class="remove-btn">Remove</button>
        `;
        emailInputsContainer.appendChild(newEmailInput);

        
        newEmailInput.querySelector(".remove-btn").onclick = function() {
            emailInputsContainer.removeChild(newEmailInput);
        }
    });
}

function openModalAndWait() {
    return new Promise((resolve) => {
        modal.style.display = "block";
        
        addEmailBtn.onclick = function() {
            const newEmailInput = document.createElement("div");
            newEmailInput.classList.add("email-input");
            newEmailInput.innerHTML = `
                <input type="email" class="email" required placeholder="Enter email address">
                <button type="button" class="remove-btn">Remove</button>
            `;
            emailInputsContainer.appendChild(newEmailInput);
        
            
            newEmailInput.querySelector(".remove-btn").onclick = function() {
                emailInputsContainer.removeChild(newEmailInput);
            }
        }

        closeModalBtn.onclick = function() {
            modal.style.display = "none";
            resolve(false)
        }
        
        
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
                resolve(false);
            }
        }

        emailForm.onsubmit = function(event) {
            event.preventDefault(); 
            const emailInputs = document.querySelectorAll(".email");
            const emails = Array.from(emailInputs).map(input => input.value);
            console.log("Emails submitted:", emails); 
            modal.style.display = "none"; 
            alert("Emails submitted: " + emails.join(", ")); 
            resolve(emails);
        }
    });
}

function deleteSetAfterShare(oldName) {
    const user = auth.currentUser; 
    if (!user) {
        console.error("User is not authenticated.");
        return;
    }

    const uid = user.uid; 
    let setRef = doc(db, "flashcards", uid, "sets", oldName); 

    try {
        deleteDoc(setRef);
        console.log("Flashcard set deleted successfully.");
        
        localStorage.removeItem("set");
        
        
    } catch (error) {
        console.error("Error deleting flashcard set: ", error);
    }
}

function updateViewersInLocalStorage(emails) {
    const set = JSON.parse(localStorage.getItem("set"));
    set.viewers = emails;
    localStorage.setItem("set", JSON.stringify(set));
}

document.getElementById("share-btn").addEventListener('click', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const setName = urlParams.get('name');

            const shared = urlParams.get('shared');
    if (JSON.parse(localStorage.getItem("set")).draft) {
        alert("You cannot share a draft set.");
        return;
    } else if (JSON.parse(localStorage.getItem("set")).maker !== localStorage.getItem("email")) {
        alert("You cannot share a set that you did not create.");
        return;
    } else if (JSON.parse(localStorage.getItem("set")).inId === setName || JSON.parse(localStorage.getItem("set")).name === setName) {
        document.getElementById("emailModal").style.display = "block";
        await populateEmails(JSON.parse(localStorage.getItem("set")).viewers || []);
        let emails = await openModalAndWait();
        console.log(`emails ${emails}`);
        if (emails) {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    console.log("User  is authenticated:", user.email); 
                        
            if (shared) {
                let setRef = doc(db, "flashcards", "shared", "sets", setName);
                await updateDoc(setRef, { "emails": emails });
                await updateViewersInLocalStorage(emails);
                        window.location.href = "main.html";
            } else {
                if (await addSharedSet(
                    JSON.parse(localStorage.getItem("set")).name,
                    JSON.parse(localStorage.getItem("set")).terms,
                    JSON.parse(localStorage.getItem("set")).definitions,
                    JSON.parse(localStorage.getItem("set")).maker,
                    emails
                )) {
                    alert("Set shared successfully!");
                    await updateViewersInLocalStorage(emails);
                }
                await deleteSetAfterShare(JSON.parse(localStorage.getItem("set")).name);
                window.location.href = "main.html";

            }
            
                } else {
                    console.log("No user is signed in.");
                }
            });
    } else {
        alert("Insufficent emails provided.");
    }
    }
});

document.getElementById("refresh-btn").addEventListener('click', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const setName = urlParams.get('name');

            const shared = urlParams.get('shared');
    await getFlashcardSetByName(setName);
    console.log("Refreshing data...");
    window.location.reload();
});


function handleCardText(text) {
    
    const utterance = new SpeechSynthesisUtterance(` ${text}`);
    speechSynthesis.speak(utterance);
}