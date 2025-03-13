document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Handle form submission
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;

        // Send a GET request to the Google Apps Script
        const url = `https://script.google.com/macros/s/AKfycbxrXJg1FdgO66k2wC6ec7ayNxDymn97LhWj9l1v6qvha2j_GzC9oN-Dj7WAkh-6USQg/exec?username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log('Response from Google Apps Script:', data);
                if (data.error) {
                    alert('Error: ' + data.error);
                } else {
                    alert('Signup successful! User ID: ' + data.userId);
                    localStorage.setItem('userId', data.userId);
                    window.location.href = 'main.html';
                }
            })
            .catch(error => {
                console.error('Error sending GET request:', error);
            });
    });
});