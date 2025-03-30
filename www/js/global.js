if (localStorage.getItem("userId") === null || localStorage.getItem("email") === null) {
    window.location.href = "default-landing.html";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export {sleep};