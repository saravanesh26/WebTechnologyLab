// API Base URL
const API_URL = 'http://localhost:3000';

// DOM Elements
const noteForm = document.getElementById('noteForm');
const editForm = document.getElementById('editForm');
const notesContainer = document.getElementById('notesContainer');
const refreshBtn = document.getElementById('refreshBtn');
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const toast = document.getElementById('toast');

// State
let noteToDelete = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Add note form submission
    noteForm.addEventListener('submit', handleAddNote);
    
    // Edit note form submission
    editForm.addEventListener('submit', handleUpdateNote);
    
    // Refresh button
    refreshBtn.addEventListener('click', loadNotes);
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModals);
    });
    
    // Cancel buttons
    document.querySelectorAll('.cancel-btn').forEach(cancelBtn => {
        cancelBtn.addEventListener('click', closeModals);
    });
    
    // Delete confirmation
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteNote);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });
}

// 1. Add Note (CREATE)
async function handleAddNote(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('title').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        description: document.getElementById('description').value.trim()
    };
    
    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Note added successfully! ✅', 'success');
            noteForm.reset();
            loadNotes(); // Reload notes
        } else {
            showToast(data.error || 'Failed to add note', 'error');
        }
    } catch (error) {
        console.error('Error adding note:', error);
        showToast('Network error. Please check if the server is running.', 'error');
    }
}

// 2. View Notes (READ)
async function loadNotes() {
    try {
        notesContainer.innerHTML = '<p class="loading">Loading notes...</p>';
        
        const response = await fetch(`${API_URL}/notes`);
        const notes = await response.json();
        
        if (response.ok) {
            displayNotes(notes);
        } else {
            showToast('Failed to load notes', 'error');
            notesContainer.innerHTML = '<p class="error">Failed to load notes</p>';
        }
    } catch (error) {
        console.error('Error loading notes:', error);
        notesContainer.innerHTML = '<p class="error">Network error. Please check if the server is running.</p>';
    }
}

function displayNotes(notes) {
    if (notes.length === 0) {
        notesContainer.innerHTML = '<p class="no-notes">No notes found. Add your first note above! 📝</p>';
        return;
    }
    
    notesContainer.innerHTML = notes.map(note => `
        <div class="note-card" data-id="${note._id}">
            <div class="note-header">
                <h3>${escapeHtml(note.title)}</h3>
                <span class="note-subject">${escapeHtml(note.subject)}</span>
            </div>
            <div class="note-body">
                <p>${escapeHtml(note.description)}</p>
            </div>
            <div class="note-footer">
                <span class="note-date">📅 ${note.created_date}</span>
                <div class="note-actions">
                    <button class="btn btn-edit" onclick="openEditModal('${note._id}')">✏️ Edit</button>
                    <button class="btn btn-delete" onclick="openDeleteModal('${note._id}', '${escapeHtml(note.title)}')">🗑️ Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 3. Update Note (UPDATE)
function openEditModal(noteId) {
    // Fetch note details
    fetch(`${API_URL}/notes/${noteId}`)
        .then(response => response.json())
        .then(note => {
            document.getElementById('editNoteId').value = note._id;
            document.getElementById('editTitle').value = note.title;
            document.getElementById('editSubject').value = note.subject;
            document.getElementById('editDescription').value = note.description;
            editModal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching note:', error);
            showToast('Failed to load note details', 'error');
        });
}

async function handleUpdateNote(e) {
    e.preventDefault();
    
    const noteId = document.getElementById('editNoteId').value;
    const formData = {
        title: document.getElementById('editTitle').value.trim(),
        subject: document.getElementById('editSubject').value.trim(),
        description: document.getElementById('editDescription').value.trim()
    };
    
    try {
        const response = await fetch(`${API_URL}/notes/${noteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Note updated successfully! ✅', 'success');
            closeModals();
            loadNotes(); // Reload notes
        } else {
            showToast(data.error || 'Failed to update note', 'error');
        }
    } catch (error) {
        console.error('Error updating note:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

// 4. Delete Note (DELETE)
function openDeleteModal(noteId, noteTitle) {
    noteToDelete = noteId;
    document.querySelector('.delete-note-title').textContent = `"${noteTitle}"`;
    deleteModal.style.display = 'block';
}

async function handleDeleteNote() {
    if (!noteToDelete) return;
    
    try {
        const response = await fetch(`${API_URL}/notes/${noteToDelete}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Note deleted successfully! ✅', 'success');
            closeModals();
            loadNotes(); // Reload notes
            noteToDelete = null;
        } else {
            showToast(data.error || 'Failed to delete note', 'error');
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        showToast('Network error. Please try again.', 'error');
    }
}

// Helper Functions
function closeModals() {
    editModal.style.display = 'none';
    deleteModal.style.display = 'none';
    noteToDelete = null;
}

function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
