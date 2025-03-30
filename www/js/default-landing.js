
if (localStorage.getItem('userId') !== null && localStorage.getItem('email') !== null) {
  window.location.href = 'main.html';
}

function signup() {
  window.location.href = 'signup.html';
}

function login() {
  window.location.href = 'login.html';
}