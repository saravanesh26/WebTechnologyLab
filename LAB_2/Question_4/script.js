const form = document.getElementById('registrationForm');
const userTableBody = document.getElementById('userTableBody');
const emptyState = document.getElementById('emptyState');
const clearAllBtn = document.getElementById('clearAllBtn');
const toast = document.getElementById('toast');

// Load users from LocalStorage on startup
let users = JSON.parse(localStorage.getItem('registeredUsers')) || [];

// Initial Render
renderUsers();

// --- Event Listeners ---

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const mobileInput = document.getElementById('mobile');
    const passwordInput = document.getElementById('password');

    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim()) {
        setError(nameInput, 'Name is required');
        isValid = false;
    } else {
        clearError(nameInput);
    }

    // Validate Email
    if (!validateEmail(emailInput.value)) {
        setError(emailInput, 'Enter a valid email');
        isValid = false;
    } else if (isEmailDuplicate(emailInput.value)) {
        setError(emailInput, 'Email already exists');
        isValid = false;
    } else {
        clearError(emailInput);
    }

    // Validate Mobile
    if (!validateMobile(mobileInput.value)) {
        setError(mobileInput, 'Enter a valid 10-digit mobile number');
        isValid = false;
    } else {
        clearError(mobileInput);
    }

    // Validate Password
    if (passwordInput.value.length < 6) {
        setError(passwordInput, 'Password must be at least 6 characters');
        isValid = false;
    } else {
        clearError(passwordInput);
    }

    if (isValid) {
        addUser({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            mobile: mobileInput.value.trim(),
            password: passwordInput.value // In a real app, hash this!
        });
        form.reset();
        showToast('User registered successfully!', 'success');
    }
});

clearAllBtn.addEventListener('click', () => {
    if (users.length === 0) return;

    if (confirm('Are you sure you want to delete all users?')) {
        users = [];
        saveUsers();
        renderUsers();
        showToast('All users deleted', 'success');
    }
});

// --- Core Functions ---

function addUser(user) {
    users.push(user);
    saveUsers();
    renderUsers();
}

function deleteUser(email) {
    if (confirm(`Delete user ${email}?`)) {
        users = users.filter(user => user.email !== email);
        saveUsers();
        renderUsers();
        showToast('User deleted', 'success');
    }
}

function saveUsers() {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
}

function renderUsers() {
    userTableBody.innerHTML = '';

    if (users.length === 0) {
        emptyState.style.display = 'block';
        clearAllBtn.style.opacity = '0.5';
        clearAllBtn.style.pointerEvents = 'none';
        return;
    }

    emptyState.style.display = 'none';
    clearAllBtn.style.opacity = '1';
    clearAllBtn.style.pointerEvents = 'auto';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = 'animate-entry';

        tr.innerHTML = `
            <td>
                <div style="font-weight: 500;">${escapeHtml(user.name)}</div>
            </td>
            <td>${escapeHtml(user.email)}</td>
            <td>${escapeHtml(user.mobile)}</td>
            <td>
                <button class="btn btn-danger btn-icon delete-btn" data-email="${escapeHtml(user.email)}" title="Delete User">
                    <ion-icon name="trash-bin-outline"></ion-icon>
                </button>
            </td>
        `;
        userTableBody.appendChild(tr);
    });
}

// --- Event Delegation for Delete ---
userTableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-btn');
    if (btn) {
        const email = btn.dataset.email;
        deleteUser(email);
    }
});

// --- Validation Helpers ---

function setError(input, message) {
    const group = input.parentElement;
    const msgEl = group.querySelector('.error-message');
    group.classList.add('error');
    msgEl.innerText = message;
}

function clearError(input) {
    const group = input.parentElement;
    group.classList.remove('error');
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateMobile(mobile) {
    const re = /^\d{10}$/;
    return re.test(mobile);
}

function isEmailDuplicate(email) {
    return users.some(user => user.email === email);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

// --- UI Helpers ---

function showToast(message, type) {
    const icon = type === 'success' ? '<ion-icon name="checkmark-circle"></ion-icon>' : '<ion-icon name="alert-circle"></ion-icon>';

    toast.className = `toast ${type} show`;
    document.getElementById('toastMessage').innerText = message;
    document.getElementById('toastIcon').innerHTML = icon;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
