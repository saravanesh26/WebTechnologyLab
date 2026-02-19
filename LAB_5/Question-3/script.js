document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const studentForm = document.getElementById('studentForm');
    const studentTableBody = document.getElementById('tableBody');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noDataMessage = document.getElementById('noDataMessage');
    const searchInput = document.getElementById('searchInput');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    // State
    let students = [];
    let isEditing = false;
    let editingId = null;

    // Constants
    const STORAGE_KEY = 'studentData_v1';
    const JSON_URL = 'students.json';

    // Initialize
    init();

    async function init() {
        showSpinner();
        try {
            // Strategy: Try LocalStorage first to persist changes.
            // If empty, fetch from JSON file (Bootstrap).
            const storedData = localStorage.getItem(STORAGE_KEY);

            if (storedData) {
                students = JSON.parse(storedData);
                console.log('Loaded from LocalStorage');
                // Check if array is empty but key exists
                if (students.length === 0) {
                    // Optional: Could re-fetch if we wanted to reset, but let's respect the empty state.
                }
            } else {
                console.log('Fetching from JSON file...');
                const response = await fetch(JSON_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                students = data;
                saveToStorage(); // Initial save
            }
            renderTable(students);
        } catch (error) {
            console.error('Error initializing data:', error);
            showToast('Failed to load data: ' + error.message, true);
        } finally {
            hideSpinner();
        }
    }

    // --- CRUD Operations ---

    // Create / Update
    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const name = document.getElementById('name').value.trim();
        const course = document.getElementById('course').value;
        const marks = parseInt(document.getElementById('marks').value);

        if (isEditing) {
            // Update
            const index = students.findIndex(s => s.id === editingId);
            if (index !== -1) {
                students[index] = { ...students[index], name, course, marks };
                showToast('Student updated successfully!');
                resetForm();
            } else {
                showToast('Error: Student not found', true);
            }
        } else {
            // Create
            const newStudent = {
                id: Date.now().toString(), // Simple unique ID
                name,
                course,
                marks
            };
            students.push(newStudent);
            showToast('Student added successfully!');
            resetForm(); // Only reset on add
        }

        saveToStorage();
        renderTable(students);
    });

    // Read (Search functionality)
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = students.filter(student =>
            student.name.toLowerCase().includes(term) ||
            student.course.toLowerCase().includes(term)
        );
        renderTable(filtered);
    });

    // Delete & Edit (Delegation)
    studentTableBody.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const id = target.dataset.id;

        if (target.classList.contains('delete-btn')) {
            deleteStudent(id);
        } else if (target.classList.contains('edit-btn')) {
            prepareEdit(id);
        }
    });

    function deleteStudent(id) {
        if (confirm('Are you sure you want to delete this student?')) {
            students = students.filter(s => s.id !== id);
            saveToStorage();

            // Re-render based on current search term
            const term = searchInput.value.toLowerCase();
            const filtered = students.filter(student =>
                student.name.toLowerCase().includes(term)
            );
            renderTable(filtered);

            showToast('Student deleted.');

            // If we deleted the item being edited, reset form
            if (isEditing && editingId === id) {
                resetForm();
            }
        }
    }

    function prepareEdit(id) {
        const student = students.find(s => s.id === id);
        if (!student) return;

        isEditing = true;
        editingId = id;

        // Populate form
        document.getElementById('studentId').value = student.id;
        document.getElementById('name').value = student.name;
        document.getElementById('course').value = student.course;
        document.getElementById('marks').value = student.marks;

        // UI Updates
        submitBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Update Student';
        cancelBtn.classList.remove('hidden');

        // Scroll to form
        studentForm.scrollIntoView({ behavior: 'smooth' });
    }

    // Cancel Edit
    cancelBtn.addEventListener('click', resetForm);

    // --- Helper Functions ---

    function renderTable(data) {
        studentTableBody.innerHTML = '';

        if (data.length === 0) {
            noDataMessage.classList.remove('hidden');
            return;
        } else {
            noDataMessage.classList.add('hidden');
        }

        data.forEach(student => {
            const tr = document.createElement('tr');
            const marks = parseInt(student.marks);
            const statusClass = marks >= 50 ? 'status-pass' : 'status-fail';
            const statusText = marks >= 50 ? 'Pass' : 'Fail';

            tr.innerHTML = `
                <td>#${student.id}</td>
                <td><strong>${student.name}</strong></td>
                <td><span class="badge">${student.course}</span></td>
                <td>${marks}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit edit-btn" data-id="${student.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger delete-btn" data-id="${student.id}" title="Delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;
            studentTableBody.appendChild(tr);
        });
    }

    function saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    }

    function validateForm() {
        let isValid = true;
        const nameInput = document.getElementById('name');
        const courseInput = document.getElementById('course');
        const marksInput = document.getElementById('marks');

        // Reset errors
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

        // Name
        if (nameInput.value.trim().length < 3) {
            document.getElementById('nameError').textContent = 'Name must be at least 3 characters.';
            isValid = false;
        }

        // Course
        if (courseInput.value === '') {
            document.getElementById('courseError').textContent = 'Please select a course.';
            isValid = false;
        }

        // Marks
        const marks = parseInt(marksInput.value);
        if (isNaN(marks) || marks < 0 || marks > 100) {
            document.getElementById('marksError').textContent = 'Marks must be between 0 and 100.';
            isValid = false;
        }

        return isValid;
    }

    function resetForm() {
        studentForm.reset();
        isEditing = false;
        editingId = null;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Student';
        cancelBtn.classList.add('hidden');
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    }

    function showSpinner() {
        loadingSpinner.classList.remove('hidden');
        noDataMessage.classList.add('hidden');
    }

    function hideSpinner() {
        loadingSpinner.classList.add('hidden');
    }

    function showToast(msg, isError = false) {
        toastMessage.textContent = msg;
        toast.classList.remove('hidden');
        toast.style.borderColor = isError ? 'var(--danger-color)' : 'var(--success-color)';
        toast.querySelector('i').className = isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
        toast.querySelector('i').style.color = isError ? 'var(--danger-color)' : 'var(--success-color)';

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
});
