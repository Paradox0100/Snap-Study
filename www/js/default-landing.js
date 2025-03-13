/*if (localStorage.getItem('userId') !== null) {
  window.location.href = 'main.html';
} else {
    window.location.href = 'signup.html';
}*/

if (localStorage.getItem('userId') !== null) {
  window.location.href = 'main.html';
}

function signup() {
  window.location.href = 'signup.html';
}

function login() {
  window.location.href = 'login.html';
}