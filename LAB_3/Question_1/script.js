document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const roleSelect = document.getElementById('role');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const ageInput = document.getElementById('age');
    const skillsInput = document.getElementById('skills');

    // Validation Rules Configuration
    const validationRules = {
        student: {
            passwordMinLength: 6,
            passwordPattern: /.*/, // Any character
            emailDomain: 'student.edu', // Example requirement
            ageMin: 16,
            passwordHint: "Min 6 chars"
        },
        teacher: {
            passwordMinLength: 8,
            passwordPattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, // Letters and numbers
            emailDomain: 'school.edu',
            ageMin: 22,
            passwordHint: "Min 8 chars, letters & numbers"
        },
        admin: {
            passwordMinLength: 10,
            passwordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/, // Strong password
            emailDomain: 'admin.org',
            ageMin: 18,
            passwordHint: "Min 10 chars, uppercase, lowercase, number, special char"
        }
    };

    let currentRole = 'student';

    // Event Listeners
    roleSelect.addEventListener('change', (e) => {
        currentRole = e.target.value;
        updateRoleBasedUI();
        validateAll(); // Re-validate everything when role changes
    });

    // Add input listeners for real-time validation
    [usernameInput, emailInput, passwordInput, confirmPasswordInput, ageInput, skillsInput].forEach(input => {
        input.addEventListener('input', () => validateInput(input));
        input.addEventListener('blur', () => validateInput(input));
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateAll()) {
            alert(`Registration Successful for ${currentRole.toUpperCase()}!\nName: ${usernameInput.value}`);
            form.reset();
            currentRole = 'student'; // Reset role logic
            updateRoleBasedUI();
            resetValidationStyles();
        }
    });

    function updateRoleBasedUI() {
        const rules = validationRules[currentRole];
        document.getElementById('passwordHint').textContent = `Note: ${rules.passwordHint}`;
        
        // Optional: You could add specific fields here dynamically if needed
        // For now, we update placeholders or hints
        emailInput.placeholder = `example@${rules.emailDomain}`;
    }

    function setError(input, message) {
        const errorSpan = document.getElementById(input.id + 'Error');
        input.classList.add('invalid');
        input.classList.remove('valid');
        if (errorSpan) errorSpan.textContent = message;
        return false;
    }

    function setSuccess(input) {
        const errorSpan = document.getElementById(input.id + 'Error');
        input.classList.add('valid');
        input.classList.remove('invalid');
        if (errorSpan) errorSpan.textContent = '';
        return true;
    }

    function validateInput(input) {
        const value = input.value.trim();
        const rules = validationRules[currentRole];

        switch (input.id) {
            case 'username':
                return value.length >= 3 ? setSuccess(input) : setError(input, "Name must be at least 3 characters");
            
            case 'email':
                // Check basic format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return setError(input, "Invalid email format");
                
                // Check domain validity based on role
                // For simplicity in this demo, we check if it ENDS with the require domain
                // Or simply check if it contains it to be less restrictive for demo purposes, 
                // but requirement says "check email domain validity", usually means strictly matching.
                // Let's go with includes for flexibility or endsWith for strictness. Let's do endsWith.
                if (!value.endsWith(rules.emailDomain)) {
                    return setError(input, `Email must end with @${rules.emailDomain}`);
                }
                return setSuccess(input);

            case 'password':
                if (value.length < rules.passwordMinLength) {
                    return setError(input, `Password must be at least ${rules.passwordMinLength} characters`);
                }
                if (!rules.passwordPattern.test(value)) {
                    return setError(input, rules.passwordHint);
                }
                // Trigger confirm password re-validation if it has a value
                if (confirmPasswordInput.value) validateInput(confirmPasswordInput);
                return setSuccess(input);

            case 'confirmPassword':
                if (value !== passwordInput.value) {
                    return setError(input, "Passwords do not match");
                }
                return value ? setSuccess(input) : setError(input, "Confirm Password is required");

            case 'age':
                if (!value || isNaN(value)) return setError(input, "Valid age is required");
                if (value < rules.ageMin) {
                    return setError(input, `Minimum age for ${currentRole} is ${rules.ageMin}`);
                }
                return setSuccess(input);

            case 'skills':
                return value.length > 0 ? setSuccess(input) : setError(input, "Please list at least one skill");
                
            default:
                return true;
        }
    }

    function validateAll() {
        let isValid = true;
        isValid = validateInput(usernameInput) && isValid;
        isValid = validateInput(emailInput) && isValid;
        isValid = validateInput(passwordInput) && isValid;
        isValid = validateInput(confirmPasswordInput) && isValid;
        isValid = validateInput(ageInput) && isValid;
        isValid = validateInput(skillsInput) && isValid;
        return isValid;
    }

    function resetValidationStyles() {
        document.querySelectorAll('input').forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        document.querySelectorAll('.error-msg').forEach(span => {
            span.textContent = '';
        });
    }

    // Initialize UI
    updateRoleBasedUI();
});
