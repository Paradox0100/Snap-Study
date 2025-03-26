
import { auth, db, doc, setDoc, getDocs, collection } from "./firebase-config.js";

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

const modal = document.getElementById("myModal");
const btn = document.getElementById("open-popup");
const span = document.getElementsByClassName("close")[0];
const option1 = document.getElementById("option1");
const option2 = document.getElementById("option2");


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

document.getElementById("add-card").addEventListener("click", function() {
    const cardContainer = document.createElement("div");
    cardContainer.classList.add("flashcard-container");
    cardContainer.innerHTML = cardTemplate
    document.getElementById("ac").appendChild(cardContainer);

    
    cardContainer.querySelector(".bin-icon").addEventListener("click", function() {
        cardContainer.remove();
    });
});

document.getElementById("save").onclick = async function() {
    const selectedOption = await openModalAndWait();
    const flashcards = document.getElementsByClassName("flashcard-container");
    let term = document.getElementsByClassName("term");
    console.log(term);
    let definition = document.getElementsByClassName("def");
    let name = document.getElementById("name").value;
    let terms = [];
    let definitions = [];
    
    for (let i = 0; i < term.length; i++) {
        terms.push(term[i].value);
        definitions.push(definition[i].value);
    }
    console.log(terms);

    if (selectedOption === false) {
        if (terms.length < 4) {
            alert("For a published set you need at least 4 cards")
            return;
        }
    }

    
    const email = localStorage.getItem("email"); 
    const user = auth.currentUser ; 

    if (user) {
        const uid = user.uid; 
        const jsonData = jsonPack(terms, definitions, name, selectedOption, email);

        
        try {
            if (await saveData(uid, jsonData) == true) {
                window.location.href = `set.html?name=${name}`;
            }
        } catch (error) {
            console.error("Error saving flashcard data: ", error);
        }
    } else {
        console.error("User  is not authenticated.");
    }
};

async function checkNameCollision(uid, setName) {
    const setsRef = collection(db, "flashcards", uid, "sets");
    const querySnapshot = await getDocs(setsRef);
    
    
    let nameExists = false;
    querySnapshot.forEach((doc) => {
        if (doc.id === setName) {
            nameExists = true;
        }
    });
    
    return nameExists;
}

async function saveData(uid, json) {
    try {
        const jsonData = JSON.parse(json);
        const setName = jsonData.name;

        
        const nameCollision = await checkNameCollision(uid, setName);
        if (nameCollision) {
            console.error("A flashcard set with this name already exists. Please choose a different name.");
            alert("A flashcard set with this name already exists. Please choose a different name.");
            return false; 
        }

        
        await setDoc(doc(db, "flashcards", uid, "sets", setName), jsonData);
        console.log("Flashcard data saved successfully!");
        return true;
    } catch (error) {
        console.error("Error saving flashcard data: ", error);
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