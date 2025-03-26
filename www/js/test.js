let terms = [];
let definitions = [];
var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];
modal.style.display = "none";
let answerTypes = [];
let correct = [];
let incorrect = [];
const urlParams = new URLSearchParams(window.location.search);
const setName = urlParams.get('name'); 

function makeTestElement(innerHTML) {
    let testAnswer = document.createElement("div");
    testAnswer.classList.add("answer-container");
    testAnswer.innerHTML = innerHTML;
    return testAnswer;``
}

function threeRandomAnswers(array) {
    // Check if the array has at least 3 elements
    if (array.length < 3) {
        throw new Error("Array must contain at least 3 elements.");
    }

    // Shuffle the array using Fisher-Yates algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }

    // Return the first 3 elements from the shuffled array
    return array.slice(0, 3);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements at indices i and j
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array; // Return the shuffled array
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function randomTF(answer, list) {
    let random = getRandomInt(2);
    if (random === 0) {
        return answer
    } else {
        return list[getRandomInt(list.length)];
    }
  }

function addQuestionType(answerType, answer, index, answerPosibility) {
    let answerContainer = document.getElementsByClassName("answer-giga-container")[index];
    if (!answerContainer) {
        console.error("Answer container not found");
        return;
    }

    if (answerType === "multipleChoice") {
        let answers = threeRandomAnswers(answerPosibility);
        answers.push(answer);
        answers = shuffleArray(answers);

        let answerHTML = answers.map((ans, i) => `
            <label class="bubble">
                <input type="radio" name="answer${index}" value="${ans}">
                <span>${ans}</span>
            </label>
        `).join('');

        let temp = makeTestElement(answerHTML);
        answerContainer.appendChild(temp);
    } else if (answerType === "trueFalse") {
        let answers = threeRandomAnswers(answerPosibility);

        let answerHTML = `
        <h3 class="answer">${randomTF(answer, answers)}</h3>
            <label class="bubble">
                <input type="radio" name="answer${index}" value="True">
                <span>True</span>
            </label>
            <label class="bubble">
                <input type="radio" name="answer${index}" value="False">
                <span>False</span>
            </label>
        `;

        let temp = makeTestElement(answerHTML);
        answerContainer.appendChild(temp);
    } else if (answerType === "written") {
        let answerHTML = `
                <textarea class="def" placeholder="Answer..." rows="3"></textarea>
        `;

        let temp = makeTestElement(answerHTML);
        answerContainer.appendChild(temp);
    }
}

span.onclick = function() {
    storeInputsAsJSON();
    modal.style.display = "none";
  }

  window.onclick = function(event) {
    if(document.getElementById("myModal").style.display === "block"){
    storeInputsAsJSON();
    }
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

if (!localStorage.getItem('testSettings')) {
    localStorage.setItem('testSettings', JSON.stringify({
        multipleChoice: true,
        trueFalse: true,
        written: true,
        randomOrder: true,
        answerWith: 'term'
    }));
}

if (localStorage.set) {
    set = JSON.parse(localStorage.set);
    terms = set.terms;
    definitions = set.definitions;
    name = set.name;
} else {
    alert("No set found");
}

function removeItem(array, itemToRemove) {
    let index = array.indexOf(itemToRemove);

    if (index !== -1) {
        array.splice(index, 1);
    }

	return array;
}

function startTest() {
    let questionOptionType = [];
    if (localStorage.getItem('testSettings')) {
        let settings = JSON.parse(localStorage.getItem('testSettings'));
        if (settings.multipleChoice) {
            questionOptionType.push("multipleChoice");
        }
        if (settings.trueFalse) {
            questionOptionType.push("trueFalse");
        }
        if (settings.written) {
            questionOptionType.push("written");
        }
    }
    let settings = JSON.parse(localStorage.getItem('testSettings'));
    if (localStorage.getItem('testSettings')) {
        if (settings.randomOrder) {
            terms, deffinitions = shuffleTwoLists(terms, definitions);
        }
    }
    if (settings.answerWith === "def") {
        for (let i = 0; i < terms.length; i++) {
            let testContainer = document.createElement("div");
            testContainer.classList.add("testCard");
            testContainer.innerHTML = 
            `
            <div class="question-container">
                <h3 class="question" id="question">
                    ${terms[i]}
                </h3>
            </div>
            <div class="split">and</div>
            <div class="answer-giga-container">

            </div>
            `
            document.getElementById("test-container").appendChild(testContainer);
            let awnserType = questionOptionType[Math.floor(Math.random() * questionOptionType.length)];

            let inputArray = definitions;
            console.log(definitions);
            console.log(inputArray);
            inputArray = inputArray.filter(item => item !== definitions[i]);
            console.log(definitions);
            console.log(inputArray);
            answerTypes.push(awnserType);
            addQuestionType(awnserType, definitions[i], i, inputArray);
        }
    } else {
        console.log("def");
        for (let i = 0; i < terms.length; i++) {
            let testContainer = document.createElement("div");
            testContainer.classList.add("testCard");
            testContainer.innerHTML = 
            `
            <div class="question-container">
                <h3 class="question" id="question">
                    ${definitions[i]}
                </h3>
            </div>
            <div class="split">and</div>
            <div class="answer-giga-container">

            </div>
            `
            document.getElementById("test-container").appendChild(testContainer);
            let awnserType = questionOptionType[Math.floor(Math.random() * questionOptionType.length)];

            let inputArray = terms;
            console.log(terms);
            console.log(inputArray);
            inputArray = inputArray.filter(item => item !== terms[i]);
            console.log(terms);
            console.log(inputArray);
            answerTypes.push(awnserType);
            addQuestionType(awnserType, terms[i], i, inputArray);
        }
    }

}

function settingsPop() {
    // Retrieve settings from localStorage
    const settings = JSON.parse(localStorage.getItem('testSettings'));

    if (settings) {
        // Set the checkboxes
        document.getElementById('mc').checked = settings.multipleChoice;
        document.getElementById('tf').checked = settings.trueFalse;
        document.getElementById('w').checked = settings.written;
        document.getElementById('r').checked = settings.randomOrder;

        // Set the radio buttons
        if (settings.answerWith === 'term') {
            document.getElementById('term-radio').checked = true;
        } else if (settings.answerWith === 'def') {
            document.getElementById('def-radio').checked = true;
        }
    }

    // Display the modal
    modal.style.display = "block";
}

function storeInputsAsJSON() {
    if (confirm("Changing the settings will reset the test. Are you sure you want to continue?")) {
    // Get the values from the checkboxes
    const multipleChoice = document.getElementById("mc").checked;
    const trueFalse = document.getElementById("tf").checked;
    const written = document.getElementById("w").checked;
    const randomOrder = document.getElementById("r").checked;

    // Get the value from the radio buttons
    const answerWith = document.querySelector('input[name="a"]:checked').value;

    // Create a JSON object
    const settings = {
        multipleChoice: multipleChoice,
        trueFalse: trueFalse,
        written: written,
        randomOrder: randomOrder,
        answerWith: answerWith
    };

    // Store the JSON object in localStorage
    localStorage.setItem('testSettings', JSON.stringify(settings));

    // Optionally, you can log the JSON object to the console
    console.log("Settings stored:", settings);
} else {
    console.log("Settings not saved");
}
}

function shuffleTwoLists(list1, list2) {
    if (list1.length !== list2.length) {
        throw new Error("Lists must be of the same length");
    }

    for (let i = list1.length - 1; i > 0; i--) {
        // Generate a random index
        const j = Math.floor(Math.random() * (i + 1));

        // Swap elements in both lists
        [list1[i], list1[j]] = [list1[j], list1[i]];
        [list2[i], list2[j]] = [list2[j], list2[i]];
    }

    return [list1, list2];
}

// Add event listener to store settings when the modal is closed
document.querySelector('.close').addEventListener('click', storeInputsAsJSON);

document.getElementById("submit").onclick = function() {
    gradeTest();
}

let settings = JSON.parse(localStorage.getItem('testSettings'));
function safeCompare(a, i) {
    if (settings.answerWith === "def") {
        console.log(`comparing ${a} to ${definitions[i]}`);
        return a === definitions[i];
    } else {
        console.log(`comparing ${a} to ${terms[i]}`);
        return a === terms[i];
    }
}

function gradeTest() {
    console.log(terms);
    console.log(definitions);
    console.log(answerTypes);

    let answersAreas = document.getElementsByClassName("answer-giga-container");
    for (let i = 0; i < answersAreas.length; i++) {
        if (answerTypes[i] === "multipleChoice") {
            let selected = document.querySelector(`input[name="answer${i}"]:checked`);
            if (selected && safeCompare(selected.value, i)) {
                console.log("Correct");
                correct.push(terms[i]);
            } else {
                console.log("Incorrect");
                incorrect.push(terms[i]);
            }
        } else if (answerTypes[i] === "trueFalse") {
            let selected
            try {
            selected = document.querySelector(`input[name="answer${i}"]:checked`).value;
            } catch (e) {
                selected = null;
            }
            let prompted;
            try {
                prompted = answersAreas[i].querySelector(".question").value;
            } catch (e) {
                prompted = null;
            }
            if ((safeCompare(prompted, i) && selected === "True") || (!safeCompare(prompted, i) && selected === "False")) {
                console.log("Correct");
                correct.push(terms[i]);
            } else {
                console.log("Incorrect");
                incorrect.push(terms[i]);
            }
        } else if (answerTypes[i] === "written") {
            let selected;
            try {
                selected = answersAreas[i].querySelector("textarea").value;
            } catch (e) {
                selected = null;
            }
            if (safeCompare(selected, i)) {
                console.log("Correct");
                correct.push(terms[i]);
            } else {
                console.log("Incorrect");
                incorrect.push(terms[i]);
            }
        }
    }
    let accuracy = Math.round((correct.length / (correct.length + incorrect.length)) * 100);
    console.log(`accuracy: ${accuracy}%`);
    document.getElementById("giga-test-container").style.display = "none";
    document.getElementById("result").style.display = "flex";
    
    const circle = document.querySelector('.circle');
    circle.style.background = `conic-gradient(
        #69E161 0% ${accuracy}%,
        #FF6961 ${accuracy}% 100%
    )`;

    
    const percentageText = document.querySelector('.percentage');
    percentageText.textContent = `${accuracy}%`;

    console.log(`accuracy: ${accuracy}%`);
}

function retry() {
    window.location.reload();
}

startTest();

function back() {
    window.location.href = `set.html?name=${JSON.parse(localStorage.getItem('set')).name}`;
}