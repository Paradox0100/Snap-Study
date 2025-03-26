document.addEventListener("DOMContentLoaded", function() {
    init();
});

var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];
modal.style.display = "none";

if (localStorage.getItem('flashcardSettings') === null) {
    localStorage.setItem('flashcardSettings', JSON.stringify({ shuffle: true, first: "term" }));
}



let currentIndex = 0;

let set, termsLocal, definitionsLocal, known = [], unknown = [];
let name;

span.onclick = function() {
    storeFlashCardSettings();
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        storeFlashCardSettings();
        modal.style.display = "none";
    }
}

function storeFlashCardSettings() {
    if (confirm("Changing the settings will reset the flashcards. Are you sure you want to continue?")) {
    let shuffle = document.getElementById("shuffle").checked;
    let first;
    if (document.getElementById("term-radio").checked) {
        first = "term";
    } else {
        first = "definition";
    }
    localStorage.setItem('flashcardSettings', JSON.stringify({ shuffle, first }));
    init();
} else {
    console.log("Settings not saved");
}
}

function init(setCards) {
    set = JSON.parse(localStorage.getItem('set'));
    if (setCards !== undefined) {
        termsLocal = setCards.terms;
        definitionsLocal = setCards.definitions;
    } else {
    termsLocal = set.terms;
    definitionsLocal = set.definitions;
    }

    document.getElementById("flashcard-container").style.display = "flex";
    document.getElementById("result").style.display = "none";

    if (JSON.parse(localStorage.getItem('flashcardSettings')).shuffle) {
        [termsLocal, definitionsLocal] = shuffleTwoLists(termsLocal, definitionsLocal);
    } else if (setCards == undefined) {
        termsLocal = set.terms;
        definitionsLocal = set.definitions;
    }

    if (JSON.parse(localStorage.getItem('flashcardSettings')).first === "term") {
        document.getElementById("term").innerText = termsLocal[0];
        document.getElementById("def").innerText = definitionsLocal[0];
    } else {
        document.getElementById("term").innerText = definitionsLocal[0];
        document.getElementById("def").innerText = termsLocal[0];
    }

    document.getElementById("counter").innerText = "1/" + termsLocal.length;
}

function nextCard() {
    console.log(known);
    console.log(unknown);
    if (currentIndex < termsLocal.length - 1) {
        currentIndex++;
        document.getElementById("counter").innerText = (currentIndex + 1) + "/" + termsLocal.length;
        if (JSON.parse(localStorage.flashcardSettings).first === "term") {
            document.getElementById("term").innerText = termsLocal[currentIndex];
            document.getElementById("def").innerText = definitionsLocal[currentIndex];
        } else {
            document.getElementById("term").innerText = definitionsLocal[currentIndex];
            document.getElementById("def").innerText = termsLocal[currentIndex];
        }
    } else {
        let accuracy = Math.round((known.length / (known.length + unknown.length))*100);
        document.getElementById("flashcard-container").style.display = "none";
        document.getElementById("result").style.display = "flex";
        if (unknown.length === 0) {
            document.getElementById("SUT").style.display = "none";
        }
        const circle = document.querySelector('.circle');
    circle.style.background = `conic-gradient(
        #69E161 0% ${accuracy}%,
        #FF6961 ${accuracy}% 100%
    )`;

    
    const percentageText = document.querySelector('.percentage');
    percentageText.textContent = `${accuracy}%`;

    }
}

document.getElementById("idk").addEventListener("click", () => {
    unknown.push(termsLocal[currentIndex], definitionsLocal[currentIndex]);
    nextCard();
});

document.getElementById("ik").addEventListener("click", () => {
    known.push(termsLocal[currentIndex], definitionsLocal[currentIndex]);
    nextCard();
});

function settingsPop() {
    document.getElementById("myModal").style.display = "block";
    document.getElementById("shuffle").checked = JSON.parse(localStorage.flashcardSettings).shuffle;
    if (JSON.parse(localStorage.flashcardSettings).first === "term") {
        document.getElementById("term-radio").checked = true;
    } else {
        document.getElementById("def-radio").checked = true;
    }
}

function startOver() {
    currentIndex = 0;
    known = [];
    unknown = [];
    document.getElementById("flashcard-container").style.display = "flex";
    document.getElementById("result").style.display = "none";
    init();
}

function studyUnknown() {
    currentIndex = 0;
    termsLocal = unknown.filter((_, index) => index % 2 === 0);
    definitionsLocal = unknown.filter((_, index) => index % 2 !== 0);
    known = [];
    unknown = [];
    init({ terms: termsLocal, definitions: definitionsLocal });
}

function shuffleTwoLists(list1, list2) {
    if (list1.length !== list2.length) {
        throw new Error("Lists must be of the same length");
    }

    for (let i = list1.length - 1; i > 0; i--) {
        
        const j = Math.floor(Math.random() * (i + 1));

        
        [list1[i], list1[j]] = [list1[j], list1[i]];
        [list2[i], list2[j]] = [list2[j], list2[i]];
    }

    return [list1, list2];
}

document.getElementById("back-arrow").addEventListener("click", () => {
    window.location.href = `set.html?name=${JSON.parse(localStorage.getItem('set')).name}`;
});