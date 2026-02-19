/**
 * Employee Management System Logic
 * Handles client-side XML manipulation and UI updates.
 */

// Global state to hold the XML document
let xmlDoc = null;
let isEditing = false;
let editingId = null;

// DOM Elements
const form = document.getElementById('employee-form');
const tableBody = document.getElementById('employee-table-body');
const submitBtn = document.getElementById('submit-btn');
const updateBtn = document.getElementById('update-btn');
const cancelBtn = document.getElementById('cancel-btn');
const loadDataBtn = document.getElementById('load-data-btn');
const statusMsg = document.getElementById('status-msg');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();

    // Event Listeners
    form.addEventListener('submit', handleFormSubmit);
    updateBtn.addEventListener('click', handleUpdate);
    cancelBtn.addEventListener('click', resetForm);
    loadDataBtn.addEventListener('click', loadEmployees);
});

/**
 * Validates and sanitizes input to prevent XSS
 */
function sanitize(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * 1. AJAX: Fetch and Display
 * Uses XMLHttpRequest and responseXML as per requirements.
 */
function loadEmployees() {
    showLoadingState();

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'employees.xml', true);

    // Prevent caching
    xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const parser = new DOMParser();
                // Check if responseXML is valid
                if (xhr.responseXML && xhr.responseXML.documentElement.nodeName !== "parsererror") {
                    xmlDoc = xhr.responseXML;
                    renderTable();
                    showToast('Data loaded successfully', 'success');
                } else {
                    // Try manual parsing if server didn't set content-type header correctly
                    try {
                        xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
                        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                            throw new Error("Malformed XML");
                        }
                        renderTable();
                        showToast('Data parsed successfully', 'success');
                    } catch (e) {
                        handleError("Failed to parse XML data. The file might be malformed or empty.");
                    }
                }
            } else {
                handleError(`Error fetching data: ${xhr.status} ${xhr.statusText}`);
            }
        }
    };

    xhr.onerror = function () {
        handleError("Network Error. Please check your connection.");
    };

    xhr.send();
}

/**
 * Renders the XML data into the HTML table
 */
function renderTable() {
    tableBody.innerHTML = '';

    if (!xmlDoc) return;

    const employees = xmlDoc.getElementsByTagName('employee');

    if (employees.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 2rem;">
                    No employees found. Add one to get started!
                </td>
            </tr>`;
        return;
    }

    // Loop through XML nodes
    for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];

        // Safe extraction of values
        const id = getNodeValue(emp, 'id');
        const name = getNodeValue(emp, 'name');
        const dept = getNodeValue(emp, 'department');
        const salary = getNodeValue(emp, 'salary');

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${id}</strong></td>
            <td>${name}</td>
            <td><span class="badge badge-${dept.toLowerCase()}">${dept}</span></td>
            <td>$${parseInt(salary).toLocaleString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-ghost" onclick="startEdit('${id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    }

    updateStatus(`Showing ${employees.length} entries`);
}

/**
 * Helper to safely get node text content
 */
function getNodeValue(parent, tagName) {
    const element = parent.getElementsByTagName(tagName)[0];
    return element ? sanitize(element.textContent) : '';
}

/**
 * 2. CRUD: Create Operation
 */
function handleFormSubmit(e) {
    e.preventDefault();

    if (!xmlDoc) {
        showToast("XML Data not loaded properly.", 'error');
        return;
    }

    const id = document.getElementById('emp-id').value.trim();
    const name = document.getElementById('emp-name').value.trim();
    const dept = document.getElementById('emp-dept').value;
    const salary = document.getElementById('emp-salary').value.trim();

    // Check for duplicate ID
    if (findEmployeeNode(id)) {
        showToast("Employee ID already exists!", 'error');
        return;
    }

    // Create new XML Node structure
    const newEmployee = xmlDoc.createElement("employee");

    createAndAppendNode(newEmployee, "id", id);
    createAndAppendNode(newEmployee, "name", name);
    createAndAppendNode(newEmployee, "department", dept);
    createAndAppendNode(newEmployee, "salary", salary);

    // Append to root
    xmlDoc.documentElement.appendChild(newEmployee);

    renderTable();
    showToast("Employee added successfully!", 'success');
    form.reset();
}

function createAndAppendNode(parent, tagName, value) {
    const node = xmlDoc.createElement(tagName);
    const textNode = xmlDoc.createTextNode(value);
    node.appendChild(textNode);
    parent.appendChild(node);
}

/**
 * 3. CRUD: Update Operation (Setup)
 */
window.startEdit = function (id) {
    const empNode = findEmployeeNode(id);
    if (!empNode) return;

    // Populate form
    document.getElementById('emp-id').value = getNodeValue(empNode, 'id');
    document.getElementById('emp-name').value = getNodeValue(empNode, 'name');
    document.getElementById('emp-dept').value = getNodeValue(empNode, 'department');
    document.getElementById('emp-salary').value = getNodeValue(empNode, 'salary');

    // Lock ID field
    document.getElementById('emp-id').disabled = true;

    // Switch buttons
    submitBtn.classList.add('hidden');
    updateBtn.classList.remove('hidden');
    cancelBtn.classList.remove('hidden');

    isEditing = true;
    editingId = id;

    // Scroll to form
    const formCard = document.querySelector('.form-card');
    formCard.scrollIntoView({ behavior: 'smooth' });

    // Highlight card
    formCard.style.borderColor = 'var(--primary-color)';
};

/**
 * 3. CRUD: Update Operation (Execution)
 */
function handleUpdate() {
    if (!isEditing || !editingId) return;

    const empNode = findEmployeeNode(editingId);
    if (empNode) {
        // Update values in XML DOM
        const name = document.getElementById('emp-name').value;
        const dept = document.getElementById('emp-dept').value;
        const salary = document.getElementById('emp-salary').value;

        updateNodeValue(empNode, 'name', name);
        updateNodeValue(empNode, 'department', dept);
        updateNodeValue(empNode, 'salary', salary);

        renderTable();
        showToast("Employee details updated!", 'success');
        resetForm();
    }
}

function updateNodeValue(parent, tagName, newValue) {
    const node = parent.getElementsByTagName(tagName)[0];
    if (node) {
        node.textContent = newValue;
    }
}

/**
 * 4. CRUD: Delete Operation
 */
window.deleteEmployee = function (id) {
    if (confirm(`Are you sure you want to delete Employee ${id}?`)) {
        const empNode = findEmployeeNode(id);
        if (empNode) {
            // Remove from XML DOM
            empNode.parentNode.removeChild(empNode);
            renderTable();
            showToast("Employee deleted.", 'success');

            // If we were editing this one, reset form
            if (isEditing && editingId === id) {
                resetForm();
            }
        }
    }
};

/**
 * Utility: Find Node by ID
 */
function findEmployeeNode(id) {
    if (!xmlDoc) return null;
    const employees = xmlDoc.getElementsByTagName('employee');
    for (let i = 0; i < employees.length; i++) {
        const empId = employees[i].getElementsByTagName('id')[0].textContent;
        if (empId === id) return employees[i];
    }
    return null;
}

/**
 * UI Utilities
 */
function resetForm() {
    form.reset();
    isEditing = false;
    editingId = null;
    document.getElementById('emp-id').disabled = false;

    submitBtn.classList.remove('hidden');
    updateBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');

    document.querySelector('.form-card').style.borderColor = 'var(--border-color)';
}

function showLoadingState() {
    tableBody.innerHTML = `
        <tr>
            <td colspan="5">
                <div class="loader-container">
                    <div class="spinner"></div>
                    <p>Fetching records...</p>
                </div>
            </td>
        </tr>`;
}

function handleError(msg) {
    tableBody.innerHTML = `
        <tr>
            <td colspan="5" style="color: #ef4444; text-align: center; padding: 2rem;">
                <i class="fa-solid fa-triangle-exclamation"></i> ${msg}
            </td>
        </tr>`;
    showToast(msg, 'error');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';

    toast.innerHTML = `
        <i class="fa-solid fa-${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateStatus(msg) {
    if (statusMsg) statusMsg.textContent = msg;
}
