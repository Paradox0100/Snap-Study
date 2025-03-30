import { sleep } from "./global.js";
import { auth, db, doc, onAuthStateChanged, collection, getDocs } from "./firebase-config.js";

function showLoading() {
  document.getElementById('loadingOverlay').style.display = 'flex';
}
showLoading();


function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

function dispSet(input) {
  const sharedContainer = document.getElementById("shared");
  sharedContainer.innerHTML = ""; // Clear existing content

  if (Array.isArray(input) && input.length > 0) {
    input.forEach(item => {
      const studySet = document.createElement("div");
      studySet.className = "study-set";
      studySet.innerHTML = `
        <div class="card-container">
          <h3>${item.name}</h3>
          <p>Author: ${item.maker}</p>
        </div>
      `;
      studySet.addEventListener("click", function () {
        window.location.href = `set.html?name=${encodeURIComponent(item.id)}&shared=true`;
      });
      sharedContainer.appendChild(studySet);
    });
  } else {
    sharedContainer.innerHTML = "<h4>No shared sets available.</h4>";
  }
}

function getCachedData(key) {
  const cachedData = localStorage.getItem(key);
  return cachedData ? JSON.parse(cachedData) : null;
}

async function fetchShareDisp() {
  try {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User:", user);
        console.log("Server fetch");
        const sharedCollection = collection(db, "flashcards", "shared", "sets");
        const snapShot = await getDocs(sharedCollection);
        const sharedData = await processSnapshot(snapShot, "shared", user);
        dispSet(sharedData);
        localStorage.setItem('shared', JSON.stringify(sharedData)); 
      }
    });
  } catch (e) {
    console.error(e);
  }
}

async function fetchLibDisp() {
  try {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const mySetsCollection = collection(db, "flashcards", user.uid, "sets");
        const snapShot = await getDocs(mySetsCollection);
        const mySetsData = await processSnapshot(snapShot, "mySets", user);
        displayLibrary(mySetsData);
        localStorage.setItem('mySets', JSON.stringify(mySetsData));
      }
    });
  } catch (e) {
    console.error(e);
  }
}

function mainLoadsHandler() {
  let mainLoads = JSON.parse(localStorage.getItem('mainLoads'));
  if (typeof mainLoads !== 'number') {
    mainLoads = 0;
  }

  if (mainLoads < 3) {
    mainLoads += 1;
    localStorage.setItem('mainLoads', JSON.stringify(mainLoads));
    return false;
  } else {
    localStorage.setItem('mainLoads', JSON.stringify(0));
    return true;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById("user-email").innerText = localStorage.getItem('email');

  const urlParams = new URLSearchParams(window.location.search);
  const msg = urlParams.get('afterMsg');
  if (msg) {
    alert(msg);
  }

  try {
    if (mainLoadsHandler()) {
      fetchShareDisp();
      fetchLibDisp();
    } else {
      dispSet(getCachedData('shared'));
      displayLibrary(getCachedData('mySets'));
    }
  } catch (e) {
    localStorage.setItem('mainLoads', JSON.stringify(0));
    console.error(e);
  }

  try {
    let recent = JSON.parse(localStorage.getItem('recent'));
    if (!Array.isArray(recent)) {
      recent = [];
      localStorage.setItem('recent', JSON.stringify(recent));
    }

    
    const recentContainer = document.getElementById("recent");
    recentContainer.innerHTML = ""; // Clear existing content

    for (let i = 0; i < recent.length; i++) {
      const studySet = document.createElement("div");
      studySet.className = "study-set";
      studySet.innerHTML = `
      <div class="card-container">
        <h3>${recent[i].name}</h3>
        <p>Author: ${recent[i].maker}</p>
      </div>
      `;
      if (recent[i].shared) {
        studySet.addEventListener("click", function() {
          window.location.href = `set.html?name=${encodeURIComponent(recent[i].id)}&shared=${true}`;
        });
      } else {
        studySet.addEventListener("click", function() {
          window.location.href = `set.html?name=${encodeURIComponent(recent[i].name)}`;
        });
      }
      recentContainer.appendChild(studySet);
    }
  } catch (e) {
    localStorage.setItem('recent', JSON.stringify([]));
  }

  await sleep(1000);
  hideLoading();
});

function displayLibrary(input) {
  const sharedContainer = document.getElementById("library");
  sharedContainer.innerHTML = ""; // Clear existing content

  if (Array.isArray(input) && input.length > 0) {
    input.forEach(item => {
      const studySet = document.createElement("div");
      studySet.className = "study-set";
      studySet.innerHTML = `
        <div class="card-container">
          <h3>${item.name}</h3>
          <p>Author: ${item.maker}</p>
        </div>
      `;
      studySet.addEventListener("click", function () {
        window.location.href = `set.html?set=${encodeURIComponent(item.name)}`;
      });
      sharedContainer.appendChild(studySet);
    });
  } else {
    sharedContainer.innerHTML = "<h4>no sets in library</h4>";
  }
}

function processSnapshot(snapshot, type, user) {
  const data = [];
  if (type === "shared") {
    snapshot.forEach(doc => {
      const docData = doc.data();
      data.push({
        id: doc.id, 
        name: docData.name, 
        maker: docData.maker 
      });
    });
  } else {
    snapshot.forEach(doc => {
      const docData = doc.data();
      if (user.email === docData.maker || docData.viewers.includes(user.email)) {
        data.push({
          id: doc.id, 
          name: docData.name, 
          maker: docData.maker 
        });
      }
    });
  }
  return data;
}


var modal = document.getElementById("myModal");

document.getElementById("refresh").addEventListener("click", function() {
  localStorage.setItem('mainLoads', JSON.stringify(4));
  window.location.reload();
});


var span = document.getElementsByClassName("close")[0];




span.onclick = function() {
  modal.style.display = "none";
}


window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

const currentUrl = window.location.href;
document.getElementById("url").innerText = `${window.location.href} port: ${window.location.port}`;


document.getElementById("userprofile").addEventListener("click", function() {
  window.location.href = `settings.html`;
});
