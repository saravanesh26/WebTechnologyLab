// 1. Structure to store questions
// defining questions with their types and validation rules
const questions = [
    {
        id: 'q1',
        label: 'Full Name',
        type: 'text',
        required: true,
        maxLength: 50
    },
    {
        id: 'q2',
        label: 'Age',
        type: 'text', // treating input as text to manually validate number
        required: true,
        isNumber: true
    },
    {
        id: 'q3',
        label: 'Gender',
        type: 'radio',
        options: ['Male', 'Female', 'Other'],
        required: true
    },
    {
        id: 'q4',
        label: 'Preferred Programming Languages (Select up to 2)',
        type: 'checkbox',
        options: ['JavaScript', 'Python', 'Java', 'C++'],
        required: true,
        maxSelection: 2
    },
    {
        id: 'q5',
        label: 'Comments',
        type: 'text',
        required: false,
        maxLength: 200
    }
];

const formContainer = document.getElementById('survey-form-container');
const submitBtn = document.getElementById('submit-btn');
const successMsg = document.getElementById('success-message');

// 2. Dynamically generate form fields
function renderForm() {
    formContainer.innerHTML = ''; // Clear existing content

    questions.forEach(q => {
        // Create wrapper div for each question
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        wrapper.id = `group-${q.id}`;

        // Label
        const label = document.createElement('label');
        label.innerText = q.label + (q.required ? ' *' : '');
        wrapper.appendChild(label);

        // Input based on type
        if (q.type === 'text') {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = q.id;
            input.name = q.id;
            // Real-time validation
            input.addEventListener('input', () => validateField(q));
            wrapper.appendChild(input);
        } else if (q.type === 'radio') {
            q.options.forEach(opt => {
                const div = document.createElement('div');
                const rb = document.createElement('input');
                rb.type = 'radio';
                rb.name = q.id; // Same name for radio group
                rb.value = opt;
                // Real-time validation
                rb.addEventListener('change', () => validateField(q));

                const rbLabel = document.createElement('span');
                rbLabel.innerText = " " + opt;

                div.appendChild(rb);
                div.appendChild(rbLabel);
                wrapper.appendChild(div);
            });
        } else if (q.type === 'checkbox') {
            q.options.forEach(opt => {
                const div = document.createElement('div');
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.name = q.id; // Same name key for group
                cb.value = opt;
                // Real-time validation
                cb.addEventListener('change', () => validateField(q));

                const cbLabel = document.createElement('span');
                cbLabel.innerText = " " + opt;

                div.appendChild(cb);
                div.appendChild(cbLabel);
                wrapper.appendChild(div);
            });
        }

        // DOM for error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.id = `error-${q.id}`;
        wrapper.appendChild(errorMsg);

        formContainer.appendChild(wrapper);
    });
}

// 3. Client-side validation
function validateField(question) {
    const group = document.getElementById(`group-${question.id}`);
    const errorMsg = document.getElementById(`error-${question.id}`);
    let isValid = true;
    let message = '';

    // Reset styles
    errorMsg.style.display = 'none';
    group.classList.remove('error');

    if (question.type === 'text') {
        const input = document.getElementById(question.id);
        const val = input.value.trim();

        if (question.required && val === '') {
            isValid = false;
            message = 'This field is required.';
        } else if (question.maxLength && val.length > question.maxLength) {
            isValid = false;
            message = `Max ${question.maxLength} characters allowed.`;
        } else if (question.isNumber) {
            if (isNaN(val) || val === '') {
                isValid = false;
                message = 'Please enter a valid number.';
            }
        }

    } else if (question.type === 'radio') {
        // Check if any radio with name=question.id is checked
        const radios = document.querySelectorAll(`input[name="${question.id}"]:checked`);
        if (question.required && radios.length === 0) {
            isValid = false;
            message = 'Please make a selection.';
        }

    } else if (question.type === 'checkbox') {
        const checkboxes = document.querySelectorAll(`input[name="${question.id}"]:checked`);
        if (question.required && checkboxes.length === 0) {
            isValid = false;
            message = 'Please select at least one option.';
        } else if (question.maxSelection && checkboxes.length > question.maxSelection) {
            isValid = false;
            message = `You can select maximum ${question.maxSelection} options.`;
        }
    }

    if (!isValid) {
        errorMsg.innerText = message;
        errorMsg.style.display = 'block';
        // group.classList.add('error'); // optional CSS class
    }

    return isValid;
}

// 4. Validate on submission
submitBtn.addEventListener('click', () => {
    let allValid = true;

    questions.forEach(q => {
        const valid = validateField(q);
        if (!valid) allValid = false;
    });

    if (allValid) {
        // 6. Prevent form submission until all fields pass (only show success here)
        successMsg.style.display = 'block';
        console.log("Form Submitted Successfully!");
        // Here you would normally send data to a server
    } else {
        successMsg.style.display = 'none';
    }
});

// Initial render
renderForm();
