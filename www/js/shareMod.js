import { auth, db, setDoc, doc, getDoc } from './firebase-config.js';


function generateUniqueId(title) {
    return title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(); 
}


async function addSharedSet(title, termsInput, definitionsInput, authorEmail, viewers) {
    try {
        let uniqueId = generateUniqueId(title);
        const existingSetRef = doc(db, 'flashcards', 'shared', 'sets', uniqueId);
        const existingSet = await getDoc(existingSetRef);
        
        console.log("Existing set exists:", existingSet.exists()); 

        if (existingSet.exists()) {
            console.error("A set with this unique ID already exists.");
            return; 
        }

        const newSharedSet = {
            name: title,
            terms: termsInput,
            definitions: definitionsInput,
            maker: authorEmail, 
            viewers: viewers, 
            createdAt: new Date(), 
            inId: uniqueId 
        };

        console.log("Adding new shared set:", newSharedSet); 

        await setDoc(existingSetRef, newSharedSet);
        console.log("Shared set added with unique ID: ", uniqueId);
        return true;
    } catch (error) {
        console.error("Error adding shared set: ", error);
    }
}

export { addSharedSet };