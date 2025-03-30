import { auth, db, doc, getDoc, updateDoc, deleteDoc, onAuthStateChanged, setDoc } from "./firebase-config.js";
import { sleep } from "./global.js";

const modal = document.getElementById("myModal");
const btn = document.getElementById("open-popup");
const span = document.getElementsByClassName("close")[0];
const option1 = document.getElementById("option1");
const option2 = document.getElementById("option2");

const cardTemplate = `
    <div class="flashcard-container" id="fc">
        <!--<a href="https://www.flaticon.com/free-icons/trash-can" title="trash can icons">Trash can icons created by kliwir art - Flaticon</a>-->
        <div class="card" id="card">
            <div class="title-stuff">
            <span>term</span>
            <img src="img/bin.png" class="bin-icon" id="bin" height="25px">
            </div>
            <br>
            <textarea class="term" placeholder="term..." rows="3"></textarea>
            <div class="split">and</div>
            <span>definition</span>
            <br>
            <textarea class="def" placeholder="definition..." rows="3"></textarea>
            <br>
        </div>
    </div>
`;

function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}
document.addEventListener("DOMContentLoaded", (event) => {
showLoading();
});


function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}


function getQueryVariable(variable) {
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        if (pair[0] === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}


const setName = getQueryVariable("name");
console.log("Set Name:", setName);

document.addEventListener("DOMContentLoaded", () => {
    
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("User is authenticated:", user.uid);
            if (setName) {
                await main(user);
            }

            
            document.getElementById("save").addEventListener("click", saveChanges);

            

            
        } else {
            console.log("No user is signed in.");
        }
    });
});

async function main(user) {
    showLoading();
    let flashcardSet;
    try {
    if (JSON.parse(localStorage.getItem('set')).name === setName) {
        flashcardSet = JSON.parse(localStorage.getItem('set'));
    } else {
    
        flashcardSet = await getFlashcardSetByName(setName, user);
        localStorage.setItem('set', JSON.stringify(flashcardSet));
    } } catch (error) {
        flashcardSet = await getFlashcardSetByName(setName, user);
        localStorage.setItem('set', JSON.stringify(flashcardSet));
    }

    if (flashcardSet) {
        document.getElementById("name").value = flashcardSet.name;
        loadFlashcards(flashcardSet.terms, flashcardSet.definitions);
    }
}

async function getFlashcardSetByName(setName, user) {
    console.log("Fetching flashcard set:", setName);
    const uid = user.uid; 

    let setRef;
    if (!getQueryVariable("shared")) {
        console.log("User is not viewing a shared set.");
        setRef = doc(db, "flashcards", uid, "sets", setName); 
    } else {
        setRef = doc(db, "flashcards", "shared", "sets", setName); 
    }

    try {
        const docSnap = await getDoc(setRef);
        if (docSnap.exists()) {
            console.log("Flashcard set data:", docSnap.data());
            localStorage.setItem("set", JSON.stringify(docSnap.data()));
            return docSnap.data(); 
        } else {
            console.log("No such flashcard set!");
            alert("No such flashcard set!");
            window.location.href = "main.html";
            return null; 
        }
    } catch (error) {
        console.error("Error retrieving flashcard set: ", error);
    }
}


function getTermsAndDefinitions() {
    const termElements = document.getElementsByClassName("term");
    const definitionElements = document.getElementsByClassName("def");

    let terms = [];
    let definitions = [];

    for (let i = 0; i < termElements.length; i++) {
        terms.push(termElements[i].value);
        definitions.push(definitionElements[i].value);
    }

    return { terms, definitions };
}


async function saveChanges() {
    const urlParams = new URLSearchParams(window.location.search);
    const shared = urlParams.get('shared');
    const user = auth.currentUser; 
    if (!user) {
        console.error("User is not authenticated.");
        return;
    }

    const uid = user.uid; 
    const setName = urlParams.get('name'); 
    let setRef;
    if (shared) {
        setRef = doc(db, "flashcards", "shared", "sets", setName); 
    } else {
        setRef = doc(db, "flashcards", uid, "sets", setName); 
    }

    const setTitle = document.getElementById("name").value;
    const { terms, definitions } = getTermsAndDefinitions();

    if (checkDuplicates(terms) || checkDuplicates(definitions)) {
        alert("There are duplicate terms or definitions. Please ensure that each term and definition is unique.");
        return;
    } else {

    try {
        await updateDoc(setRef, {
            name: setTitle,
            terms: terms,
            definitions: definitions
        });
        console.log("Flashcard set updated successfully.");
        
        if (!shared) {
            localStorage.setItem('set', JSON.stringify({ 
                name: setTitle, 
                terms: terms, 
                definitions: definitions, 
                maker: user.email 
            }));
        } else {
            const currentSet = JSON.parse(localStorage.getItem('set'));
            localStorage.setItem('set', JSON.stringify({ 
                name: currentSet.name, 
                terms: terms, 
                definitions: definitions, 
                maker: currentSet.maker,
                viewers: currentSet.viewers,
                createdAt: currentSet.createdAt,
                inId: currentSet.inId
            }));
        }
        alert("Changes saved successfully.");
        window.location.href = `set.html?name=${encodeURIComponent(setTitle)}`;
    } catch (error) {
        console.error("Error updating flashcard set: ", error);
    }
}
}




document.getElementById("add-card").addEventListener("click", function() {
    const cardContainer = document.createElement("div");
    cardContainer.classList.add("flashcard-container");
    cardContainer.innerHTML = cardTemplate
    document.getElementById("ac").appendChild(cardContainer);

    
    cardContainer.querySelector(".bin-icon").addEventListener("click", async function() {
        cardContainer.classList.add("deleted");
        await sleep(500);
        cardContainer.remove();
    });
});

function loadFlashcards(terms, definitions) {
    for (let i = 0; i < terms.length; i++) {
        const cardContainer = document.createElement("div");
        cardContainer.classList.add("flashcard-container");
        cardContainer.innerHTML = cardTemplate;
        cardContainer.querySelector(".term").value = terms[i];
        cardContainer.querySelector(".def").value = definitions[i];
        document.getElementById("ac").appendChild(cardContainer);

        
        cardContainer.querySelector(".bin-icon").addEventListener("click", function() {
            cardContainer.remove();
        });
    }
    hideLoading();
}

async function deleteSet(setName) {
    const user = auth.currentUser; 
    if (!user) {
        console.error("User is not authenticated.");
        return;
    }

    const uid = user.uid; 
    const setRef = doc(db, "flashcards", uid, "sets", setName); 

    try {
        await deleteDoc(setRef);
        console.log("Flashcard set deleted successfully.");
        
        localStorage.removeItem("set");
        
    } catch (error) {
        console.error("Error deleting flashcard set: ", error);
    }
}

function jsonPack(terms, definitions, name, draft, maker) {
    let json = {
        "name": name,
        "draft": draft,
        "maker": maker,
        "terms": terms,
        "definitions": definitions
    };
    return JSON.stringify(json);
}

function openModalAndWait() {
    return new Promise((resolve) => {
        modal.style.display = "block";

        option1.onclick = function() {
            console.log("Option 1 selected");
            modal.style.display = "none"; 
            resolve(true); 
        }

        option2.onclick = function() {
            console.log("Option 2 selected");

            modal.style.display = "none"; 
            resolve(false); 
        }

        
        span.onclick = function() {
            modal.style.display = "none";
            resolve(null); 
        }

        
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
                resolve(null); 
            }
        }
    });
}


async function saveData(uid, json) {
    try {
        const jsonData = JSON.parse(json);
        const setName = jsonData.name;

        

        
        await setDoc(doc(db, "flashcards", uid, "sets", setName), jsonData);
        console.log("Flashcard data saved successfully!");
        return true;
    } catch (error) {
        console.error("Error saving flashcard data: ", error);
    }
}

function checkDuplicates(terms) {
    return new Set(terms).size !== terms.length;
}