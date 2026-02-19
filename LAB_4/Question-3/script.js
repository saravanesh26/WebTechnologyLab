const API_URL = '/students'; // Relative path since we are serving from the same origin

// DOM Elements
const studentForm = document.getElementById('studentForm');
const studentTableBody = document.getElementById('tableBody');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const toastContainer = document.getElementById('toast-container');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const studentIdInput = document.getElementById('studentId');
const studentIdDbInput = document.getElementById('studentIdDb');

// State
let isEditing = false;

// Initialize
document.addEventListener('DOMContentLoaded', fetchStudents);

// Event Listeners
studentForm.addEventListener('submit', handleFormSubmit);
cancelBtn.addEventListener('click', resetForm);

// Check if student ID exists in table (for client-side duplicate check before server)
function isIdTaken(id) {
    const rows = document.querySelectorAll('tr[data-id]');
    for (let row of rows) {
        if (row.dataset.id === id) return true;
    }
    return false;
}

// --- CRUD Operations ---

// 1. READ: Fetch all students
async function fetchStudents() {
    showLoading(true);
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const text = await response.text();
        let students = [];
        try {
            students = text ? JSON.parse(text) : [];
        } catch (e) {
            console.error('JSON Parse Error:', e, 'Response Text:', text);
            throw new Error('Invalid server response: ' + text.substring(0, 50));
        }

        renderTable(students);
    } catch (error) {
        showToast(error.message, 'error');
        console.error(error);
    } finally {
        showLoading(false);
    }
}

// 2. CREATE / UPDATE: Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const student = {
        id: studentIdInput.value.trim(),
        name: document.getElementById('name').value.trim(),
        department: document.getElementById('department').value.trim(),
        marks: parseInt(document.getElementById('marks').value, 10)
    };

    if (isEditing) {
        // Update existing student
        const originalId = studentIdDbInput.value;
        await updateStudent(originalId, student);
    } else {
        // Create new student
        await createStudent(student);
    }
}

async function createStudent(student) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });

        if (response.ok) {
            showToast('Student added successfully!', 'success');
            resetForm();
            fetchStudents(); // Refresh list
        } else {
            const data = await response.json();
            throw new Error(data.error || 'Failed to add student');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function updateStudent(id, studentData) {
    try {
        // Note: For simplicity, we are sending the ID in body as well, 
        // but the URL determines which resource to update.
        // If ID is changed in form, we might strictly need to check if new ID conflicts, 
        // but typical REST doesn't allow changing ID easily without re-creating.
        // We will assume ID is immutable or handled by server. 
        // My server implementation uses the ID in the URL to find the record.

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });

        if (response.ok) {
            showToast('Student updated successfully!', 'success');
            resetForm();
            fetchStudents();
        } else {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update student');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// 3. DELETE: Remove student
async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student record?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Student deleted successfully', 'success');
            // Optimistic UI update or fetch again
            fetchStudents();
        } else {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete student');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// --- UI Helper Functions ---

function renderTable(students) {
    studentTableBody.innerHTML = '';

    if (!students || students.length === 0) {
        emptyState.classList.add('visible');
        return;
    }

    emptyState.classList.remove('visible');

    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.dataset.id = student.id;

        // ID Cell
        const idTd = document.createElement('td');
        idTd.textContent = `#${student.id}`;
        tr.appendChild(idTd);

        // Name Cell
        const nameTd = document.createElement('td');
        const nameStrong = document.createElement('strong');
        nameStrong.textContent = student.name;
        nameTd.appendChild(nameStrong);
        tr.appendChild(nameTd);

        // Department Cell
        const deptTd = document.createElement('td');
        const deptSpan = document.createElement('span');
        deptSpan.className = 'badge';
        deptSpan.textContent = student.department;
        deptTd.appendChild(deptSpan);
        tr.appendChild(deptTd);

        // Marks Cell
        const marksTd = document.createElement('td');
        marksTd.textContent = student.marks;
        tr.appendChild(marksTd);

        // Actions Cell
        const actionsTd = document.createElement('td');
        actionsTd.className = 'actions-cell';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.textContent = 'Edit';
        editBtn.onclick = function () {
            startEdit(student.id, student.name, student.department, student.marks);
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = function () {
            deleteStudent(student.id);
        };

        actionsTd.appendChild(editBtn);
        actionsTd.appendChild(deleteBtn);
        tr.appendChild(actionsTd);

        studentTableBody.appendChild(tr);
    });
}

function startEdit(id, name, department, marks) {
    isEditing = true;

    // Populate form
    studentIdInput.value = id;
    studentIdInput.disabled = true; // Prevent changing ID during edit (simpler consistency)
    studentIdDbInput.value = id;
    document.getElementById('name').value = name;
    document.getElementById('department').value = department;
    document.getElementById('marks').value = marks;

    // Update UI
    saveBtn.textContent = 'Update Student';
    saveBtn.classList.remove('btn-primary');
    saveBtn.classList.add('btn-warning'); // You might need to add this class or just style it
    saveBtn.style.backgroundColor = '#d29922'; // specific override
    cancelBtn.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    isEditing = false;
    studentForm.reset();
    studentIdInput.disabled = false;
    studentIdDbInput.value = '';

    saveBtn.textContent = 'Add Student';
    saveBtn.classList.add('btn-primary');
    saveBtn.classList.remove('btn-warning');
    saveBtn.style.backgroundColor = '';
    cancelBtn.style.display = 'none';
}

function showLoading(show) {
    if (show) {
        loadingState.style.display = 'block';
        studentTableBody.style.opacity = '0.5';
    } else {
        loadingState.style.display = 'none';
        studentTableBody.style.opacity = '1';
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <span onclick="this.parentElement.remove()" style="cursor:pointer; margin-left: 10px;">&times;</span>
    `;

    toastContainer.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Make functions valid for global scope usage in onclick attributes
window.deleteStudent = deleteStudent;
window.startEdit = startEdit;
