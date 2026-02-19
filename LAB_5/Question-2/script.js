/**
 * Library Book Tracker Logic
 * Handles XML DOM manipulation using AJAX
 */

// Global state
let xmlDoc = null;
let isEditing = false;
let editingId = null;

// DOM Elements
const form = document.getElementById('book-form');
const tableBody = document.getElementById('book-table-body');
const submitBtn = document.getElementById('submit-btn');
const updateBtn = document.getElementById('update-btn');
const cancelBtn = document.getElementById('cancel-btn');
const loadDataBtn = document.getElementById('load-data-btn');
const statusMsg = document.getElementById('status-msg');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();

    // Event Listeners
    form.addEventListener('submit', handleFormSubmit);
    updateBtn.addEventListener('click', handleUpdate);
    cancelBtn.addEventListener('click', resetForm);
    loadDataBtn.addEventListener('click', () => {
        showToast('Refreshing data...', 'info');
        loadBooks();
    });
});

/**
 * Validates and sanitizes input
 */
function sanitize(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * 1. AJAX: Fetch and Display
 */
function loadBooks() {
    showLoadingState();

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'books.xml', true);

    // Prevent caching
    xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const parser = new DOMParser();
                // Check valid XML
                if (xhr.responseXML && xhr.responseXML.documentElement.nodeName !== "parsererror") {
                    xmlDoc = xhr.responseXML;
                    renderTable();
                    showToast('Library data loaded successfully', 'success');
                } else {
                    // Fallback parsing
                    try {
                        xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
                        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                            throw new Error("Malformed XML");
                        }
                        renderTable();
                    } catch (e) {
                        handleError("Failed to parse XML data.");
                    }
                }
            } else {
                handleError(`Error fetching data: ${xhr.status}`);
            }
        }
    };

    xhr.onerror = function () {
        handleError("Network Error. Please check your connection.");
    };

    xhr.send();
}

/**
 * Render the XML data into the HTML table
 */
function renderTable() {
    tableBody.innerHTML = '';

    if (!xmlDoc) return;

    const books = xmlDoc.getElementsByTagName('book');

    if (books.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-muted);">
                    No books in the library. Add one to get started!
                </td>
            </tr>`;
        return;
    }

    for (let i = 0; i < books.length; i++) {
        const book = books[i];

        const id = getNodeValue(book, 'id');
        const title = getNodeValue(book, 'title');
        const author = getNodeValue(book, 'author');
        const status = getNodeValue(book, 'status');

        let badgeClass = 'badge-available';
        if (status === 'Checked Out') badgeClass = 'badge-checked';
        if (status === 'Reserved') badgeClass = 'badge-reserved';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${id}</strong></td>
            <td>${title}</td>
            <td>${author}</td>
            <td><span class="badge ${badgeClass}">${status}</span></td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-sm btn-secondary" onclick="startEdit('${id}')" title="Edit/Update Status">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBook('${id}')" title="Delete Book">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    }

    updateStatus(`Total Books: ${books.length}`);
}

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

    const id = document.getElementById('book-id').value.trim();
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const status = document.getElementById('book-status').value;

    if (findBookNode(id)) {
        showToast("Book ID already exists. Please use a unique ID.", 'error');
        return;
    }

    const newBook = xmlDoc.createElement("book");
    createAndAppendNode(newBook, "id", id);
    createAndAppendNode(newBook, "title", title);
    createAndAppendNode(newBook, "author", author);
    createAndAppendNode(newBook, "status", status);

    xmlDoc.documentElement.appendChild(newBook);
    renderTable();
    showToast("New book added to library!", 'success');
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
    const bookNode = findBookNode(id);
    if (!bookNode) return;

    // Populate form
    document.getElementById('book-id').value = getNodeValue(bookNode, 'id');
    document.getElementById('book-title').value = getNodeValue(bookNode, 'title');
    document.getElementById('book-author').value = getNodeValue(bookNode, 'author');
    document.getElementById('book-status').value = getNodeValue(bookNode, 'status');

    // Lock ID
    document.getElementById('book-id').disabled = true;

    // UI Updates
    submitBtn.classList.add('hidden');
    updateBtn.classList.remove('hidden');
    cancelBtn.classList.remove('hidden');

    isEditing = true;
    editingId = id;

    // Scroll to form if needed
    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
};

/**
 * 3. CRUD: Update Operation (Execution)
 */
function handleUpdate() {
    if (!isEditing || !editingId) return;

    const bookNode = findBookNode(editingId);
    if (bookNode) {
        const title = document.getElementById('book-title').value.trim();
        const author = document.getElementById('book-author').value.trim();
        const status = document.getElementById('book-status').value;

        updateNodeValue(bookNode, 'title', title);
        updateNodeValue(bookNode, 'author', author);
        updateNodeValue(bookNode, 'status', status);

        renderTable();
        showToast("Book details updated successfully!", 'success');
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
window.deleteBook = function (id) {
    if (confirm(`Are you sure you want to delete book with ID: ${id}?`)) {
        const bookNode = findBookNode(id);
        if (bookNode) {
            bookNode.parentNode.removeChild(bookNode);
            renderTable();
            showToast("Book deleted from inventory.", 'success');

            if (isEditing && editingId === id) {
                resetForm();
            }
        }
    }
};

/**
 * Utility: Find Node by ID
 */
function findBookNode(id) {
    if (!xmlDoc) return null;
    const books = xmlDoc.getElementsByTagName('book');
    for (let i = 0; i < books.length; i++) {
        const bookId = books[i].getElementsByTagName('id')[0].textContent;
        if (bookId === id) return books[i];
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
    document.getElementById('book-id').disabled = false;

    submitBtn.classList.remove('hidden');
    updateBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
}

function showLoadingState() {
    tableBody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center;">
                <div class="loader-container">
                    <div class="spinner"></div>
                    <p>Loading library data...</p>
                </div>
            </td>
        </tr>`;
}

function handleError(msg) {
    tableBody.innerHTML = `
        <tr>
            <td colspan="5" style="color: var(--danger); text-align: center; padding: 2rem;">
                <i class="fa-solid fa-triangle-exclamation"></i> ${msg}
            </td>
        </tr>`;
    showToast(msg, 'error');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';

    toast.innerHTML = `
        <i class="fa-solid fa-${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateStatus(msg) {
    if (statusMsg) statusMsg.textContent = msg;
}
