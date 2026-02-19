document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const feedbackDiv = document.getElementById('feedback');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const submitBtn = document.getElementById('submitBtn');

    let debounceTimer;

    usernameInput.addEventListener('input', () => {
        const username = usernameInput.value.trim();

        // Clear previous timer
        clearTimeout(debounceTimer);

        // Reset UI state
        feedbackDiv.textContent = '';
        feedbackDiv.className = 'feedback'; // Reset classes
        usernameInput.classList.remove('valid', 'invalid');
        submitBtn.disabled = true;

        if (username.length === 0) {
            loadingIndicator.style.display = 'none';
            return;
        }

        // Show loading indicator
        loadingIndicator.style.display = 'block';

        // Set a debounce to simulate realistic typing delay and avoid too many requests
        debounceTimer = setTimeout(() => {
            checkUsernameAvailability(username);
        }, 500);
    });

    function checkUsernameAvailability(username) {
        // Simulate AJAX request
        fetch('users.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(users => {
                // Simulate server-side processing delay for effect (optional but good for 'loading' visibility)
                setTimeout(() => {
                    // Check if the input has changed since the request was made
                    if (usernameInput.value.trim() !== username) {
                        return;
                    }

                    const isTaken = users.some(u => u.toLowerCase() === username.toLowerCase());

                    loadingIndicator.style.display = 'none';

                    if (isTaken) {
                        feedbackDiv.textContent = 'Username already taken';
                        feedbackDiv.classList.add('error');
                        usernameInput.classList.add('invalid');
                        usernameInput.classList.remove('valid');
                        submitBtn.disabled = true;
                    } else {
                        feedbackDiv.textContent = 'Username available';
                        feedbackDiv.classList.add('success');
                        usernameInput.classList.add('valid');
                        usernameInput.classList.remove('invalid');
                        submitBtn.disabled = false;
                    }
                }, 500); // Artificial delay to show loading state clearly
            })
            .catch(error => {
                console.error('Error checking username:', error);
                loadingIndicator.style.display = 'none';
                feedbackDiv.textContent = 'Error checking availability. Please try again.';
                feedbackDiv.classList.add('error');
            });
    }

    // Handle form submission
    document.getElementById('registrationForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Registration successful for username: ' + usernameInput.value);
        // Here you would typically send the data to the server
    });
});
