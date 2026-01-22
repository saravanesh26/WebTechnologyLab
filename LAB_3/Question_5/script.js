// 6. Store user input temporarily
let formData = {
    fname: '',
    lname: '',
    email: '',
    phone: '',
    username: '',
    password: ''
};

let currentStage = 1;
const totalStages = 4;

// DOM Elements
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const progressBar = document.getElementById('progress-bar');
const errorMsg = document.getElementById('error-msg');
const reviewContent = document.getElementById('review-content');

// 2. Control navigation
nextBtn.addEventListener('click', () => {
    if (validateStage(currentStage)) {
        saveData(currentStage);
        currentStage++;
        updateUI();
    }
});

prevBtn.addEventListener('click', () => {
    currentStage--;
    updateUI();
});

submitBtn.addEventListener('click', () => {
    alert("Form Submitted Successfully!\nData: " + JSON.stringify(formData, null, 2));
    // Location to redirect or reset
    location.reload();
});

// 4. Show/Hide stages based on user navigation
function updateUI() {
    // Hide all stages
    for (let i = 1; i <= totalStages; i++) {
        document.getElementById(`stage-${i}`).style.display = 'none';
    }

    // Show current stage
    document.getElementById(`stage-${currentStage}`).style.display = 'block';

    // Update buttons
    prevBtn.disabled = currentStage === 1;

    if (currentStage === totalStages) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
        renderReview();
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }

    // 3. Update Progress Bar
    const progress = (currentStage / totalStages) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.innerText = `${progress}%`;

    // Clear error
    errorMsg.innerText = '';
}

// 6. Save inputs to variable
function saveData(stage) {
    if (stage === 1) {
        formData.fname = document.getElementById('fname').value;
        formData.lname = document.getElementById('lname').value;
    } else if (stage === 2) {
        formData.email = document.getElementById('email').value;
        formData.phone = document.getElementById('phone').value;
    } else if (stage === 3) {
        formData.username = document.getElementById('username').value;
        formData.password = document.getElementById('password').value;
    }
}

// 1. & 5. Validation logic
function validateStage(stage) {
    let isValid = true;
    let msg = "";

    if (stage === 1) {
        const f = document.getElementById('fname').value.trim();
        const l = document.getElementById('lname').value.trim();
        if (!f || !l) {
            isValid = false; msg = "All fields are required.";
        }
    } else if (stage === 2) {
        const e = document.getElementById('email').value.trim();
        const p = document.getElementById('phone').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;

        if (!e || !p) {
            isValid = false; msg = "All fields are required.";
        } else if (!emailRegex.test(e)) {
            isValid = false; msg = "Invalid email format.";
        } else if (!phoneRegex.test(p)) {
            isValid = false; msg = "Phone must be exactly 10 digits.";
        }
    } else if (stage === 3) {
        const u = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value;
        if (!u || !pass) {
            isValid = false; msg = "All fields are required.";
        } else if (pass.length < 6) {
            isValid = false; msg = "Password must be at least 6 characters.";
        }
    }

    if (!isValid) {
        errorMsg.innerText = msg;
    }
    return isValid;
}

function renderReview() {
    reviewContent.innerHTML = `
        <p><strong>Name:</strong> ${formData.fname} ${formData.lname}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone}</p>
        <p><strong>Username:</strong> ${formData.username}</p>
    `;
}

// Initial UI
updateUI();
