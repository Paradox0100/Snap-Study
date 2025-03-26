import { auth, db, onAuthStateChanged, collection, getDocs } from "./firebase-config.js";

function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}
showLoading();


function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}


async function fetchData() {
    console.log("Fetching data...");
    const user = auth.currentUser ; 
    if (!user) {
        console.error("User  is not authenticated.");
        return; 
    }

    const uid = user.uid; 
    const byMeCollection = collection(db, "flashcards", uid, "sets");
    const sharedCollection = collection(db, "flashcards", "shared", "sets"); 

    try {
        
        const byMeSnapshot = await getDocs(byMeCollection);
        
        const sharedSnapshot = await getDocs(sharedCollection);

        
        const byMeData = processSnapshot(byMeSnapshot);
        const sharedData = processSnapshot(sharedSnapshot);

        
        cacheData('mySets', byMeData);
        cacheData('sharedSets', sharedData);

        displayData(byMeData, "byme");
        displayData(sharedData, "shared");
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}


function processSnapshot(snapshot) {
    const data = [];
    snapshot.forEach(doc => {
        const docData = doc.data();
        data.push({
            id: doc.id, 
            name: docData.name, 
            maker: docData.maker 
        });
    });
    return data;
}


function cacheData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}


function getCachedData(key) {
    const cachedData = localStorage.getItem(key);
    return cachedData ? JSON.parse(cachedData) : null;
}

function displayData(data, type) {
    const container = document.getElementById(type); 
    container.innerHTML = ''; // Clear previous content

    if (data.length === 0) {
        container.innerHTML = `<p>No sets available.</p>`; // Display message if no data
        return; // Exit if no data
    }

    data.forEach(item => {
        const setElement = document.createElement('div'); 
        setElement.className = 'set-card'; 

        
        setElement.innerHTML = `
            <h3>${item.name}</h3>
            <p><strong>Maker:</strong> ${item.maker}</p>
            <hr>
        `;

        console.log("Displaying set:", item);
        
        if (type === 'byme') {
    
        setElement.addEventListener('click', () => {
            window.location.href = `set.html?name=${encodeURIComponent(item.name)}`;
        });
    } else {
        setElement.addEventListener('click', () => {
            window.location.href = `set.html?name=${encodeURIComponent(item.id)}&shared=${true}`;
        });
    }

        container.appendChild(setElement); 
    });
}



onAuthStateChanged(auth, (user) => {
    console.log("Checking authentication state...");

    
    const cachedMySets = getCachedData('mySets');
    const cachedSharedSets = getCachedData('sharedSets');

    if (cachedMySets && cachedSharedSets) {
        
        if (cachedMySets) {
            console.log("Displaying cached data...");
            displayData(cachedMySets, "byme");
        } else {
            document.getElementById("byme").innerHTML = `<p>No cached sets available.</p>`;
        }

        if (cachedSharedSets) {
            console.log("Displaying cached shared sets...");
            displayData(cachedSharedSets, "shared");
        } else {
            document.getElementById("shared").innerHTML = `<p>No cached shared sets available.</p>`;
        }
    } else {
        
        if (user) {
            console.log("User  is authenticated:", user.uid);
            fetchData(); 
        } else {
            console.log("No user is signed in.");
            document.getElementById("byme").innerHTML = `<p>No sets found.</p>`;
            document.getElementById("shared").innerHTML = `<p>No shared sets found.</p>`;
        }
    }

    hideLoading(); 
});


document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("byme").style.display = "block"; 
});


window.refresh = async function() {
    showLoading(); 
    console.log("Refreshing data...");
    await fetchData(); 
    hideLoading(); 
};