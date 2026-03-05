// API Base URL
const API_URL = 'http://localhost:3001';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');
const minPriceInput = document.getElementById('minPrice');
const maxPriceInput = document.getElementById('maxPrice');
const minRatingSelect = document.getElementById('minRating');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const topRatedBtn = document.getElementById('topRatedBtn');
const allBooksBtn = document.getElementById('allBooksBtn');
const resetBtn = document.getElementById('resetBtn');
const booksContainer = document.getElementById('booksContainer');
const resultsCount = document.getElementById('resultsCount');
const currentQuery = document.getElementById('currentQuery');
const paginationContainer = document.getElementById('paginationContainer');
const toast = document.getElementById('toast');

// State
let currentPage = 1;
let currentFilters = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadAllBooks();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    applyFiltersBtn.addEventListener('click', applyAdvancedFilters);
    topRatedBtn.addEventListener('click', loadTopRatedBooks);
    allBooksBtn.addEventListener('click', loadAllBooks);
    resetBtn.addEventListener('click', resetAllFilters);
    
    // Category quick filter
    categorySelect.addEventListener('change', (e) => {
        if (e.target.value) {
            loadBooksByCategory(e.target.value);
        }
    });
    
    // Sort quick change
    sortSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            const [field, order] = e.target.value.split('-');
            sortBooks(field, order);
        }
    });
}

// Load Categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/books/categories`);
        const categories = await response.json();
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// 1. Search Books by Title
async function handleSearch() {
    const title = searchInput.value.trim();
    
    if (!title) {
        showToast('Please enter a book title to search', 'warning');
        return;
    }
    
    try {
        booksContainer.innerHTML = '<p class="loading">Searching...</p>';
        
        const response = await fetch(`${API_URL}/books/search?title=${encodeURIComponent(title)}`);
        const data = await response.json();
        
        if (response.ok) {
            displayBooks(data.books);
            updateResultsInfo(data.count, `Search results for "${title}"`);
            paginationContainer.innerHTML = '';
        } else {
            showToast(data.error || 'Search failed', 'error');
        }
    } catch (error) {
        console.error('Error searching books:', error);
        showToast('Network error. Please check if the server is running.', 'error');
        booksContainer.innerHTML = '<p class="error">Failed to search books</p>';
    }
}

function clearSearch() {
    searchInput.value = '';
    loadAllBooks();
}

// 2. Filter Books by Category
async function loadBooksByCategory(category) {
    try {
        booksContainer.innerHTML = '<p class="loading">Loading...</p>';
        
        const response = await fetch(`${API_URL}/books/category/${encodeURIComponent(category)}`);
        const data = await response.json();
        
        if (response.ok) {
            displayBooks(data.books);
            updateResultsInfo(data.count, `Category: ${category}`);
            paginationContainer.innerHTML = '';
        } else {
            showToast(data.error || 'Failed to filter books', 'error');
        }
    } catch (error) {
        console.error('Error filtering books:', error);
        showToast('Network error occurred', 'error');
    }
}

// 3. Sort Books
async function sortBooks(field, order) {
    try {
        booksContainer.innerHTML = '<p class="loading">Sorting...</p>';
        
        const response = await fetch(`${API_URL}/books/sort/${field}?order=${order}`);
        const data = await response.json();
        
        if (response.ok) {
            displayBooks(data.books);
            updateResultsInfo(data.count, `Sorted by ${field} (${order}ending)`);
            paginationContainer.innerHTML = '';
        } else {
            showToast(data.error || 'Failed to sort books', 'error');
        }
    } catch (error) {
        console.error('Error sorting books:', error);
        showToast('Network error occurred', 'error');
    }
}

// 4. Top Rated Books
async function loadTopRatedBooks() {
    try {
        booksContainer.innerHTML = '<p class="loading">Loading top rated books...</p>';
        
        const response = await fetch(`${API_URL}/books/top?limit=5&minRating=4`);
        const data = await response.json();
        
        if (response.ok) {
            displayBooks(data.books);
            updateResultsInfo(data.count, `Top ${data.limit} Rated Books (Rating ≥ ${data.minRating})`);
            paginationContainer.innerHTML = '';
        } else {
            showToast(data.error || 'Failed to load top rated books', 'error');
        }
    } catch (error) {
        console.error('Error loading top rated books:', error);
        showToast('Network error occurred', 'error');
    }
}

// 5. Pagination - Load All Books
async function loadAllBooks(page = 1) {
    try {
        booksContainer.innerHTML = '<p class="loading">Loading books...</p>';
        
        const response = await fetch(`${API_URL}/books?page=${page}&limit=6`);
        const data = await response.json();
        
        if (response.ok) {
            displayBooks(data.books);
            updateResultsInfo(data.totalBooks, `All Books (Page ${data.page} of ${data.totalPages})`);
            displayPagination(data);
            currentPage = page;
        } else {
            showToast(data.error || 'Failed to load books', 'error');
        }
    } catch (error) {
        console.error('Error loading books:', error);
        booksContainer.innerHTML = '<p class="error">Network error. Please check if the server is running.</p>';
    }
}

// Advanced Search with Multiple Filters
async function applyAdvancedFilters(page = 1) {
    const category = categorySelect.value;
    const minPrice = minPriceInput.value;
    const maxPrice = maxPriceInput.value;
    const minRating = minRatingSelect.value;
    const sortValue = sortSelect.value;
    
    // Build query string
    let queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (minPrice) queryParams.append('minPrice', minPrice);
    if (maxPrice) queryParams.append('maxPrice', maxPrice);
    if (minRating) queryParams.append('minRating', minRating);
    
    if (sortValue) {
        const [field, order] = sortValue.split('-');
        queryParams.append('sortBy', field);
        queryParams.append('order', order);
    }
    
    queryParams.append('page', page);
    queryParams.append('limit', 6);
    
    try {
        booksContainer.innerHTML = '<p class="loading">Applying filters...</p>';
        
        const response = await fetch(`${API_URL}/books/advanced?${queryParams.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
            displayBooks(data.books);
            
            // Build filter description
            let filterDesc = [];
            if (category) filterDesc.push(`Category: ${category}`);
            if (minPrice || maxPrice) {
                filterDesc.push(`Price: ₹${minPrice || '0'} - ₹${maxPrice || '∞'}`);
            }
            if (minRating) filterDesc.push(`Rating ≥ ${minRating}`);
            
            updateResultsInfo(data.totalResults, 
                filterDesc.length > 0 ? filterDesc.join(', ') : 'All Books'
            );
            
            // Display pagination for advanced search
            displayAdvancedPagination(data);
            currentFilters = { category, minPrice, maxPrice, minRating, sortValue };
        } else {
            showToast(data.error || 'Failed to apply filters', 'error');
        }
    } catch (error) {
        console.error('Error applying filters:', error);
        showToast('Network error occurred', 'error');
    }
}

// Display Books
function displayBooks(books) {
    if (books.length === 0) {
        booksContainer.innerHTML = '<p class="no-results">No books found matching your criteria. Try different filters! 📚</p>';
        return;
    }
    
    booksContainer.innerHTML = books.map(book => `
        <div class="book-card">
            <div class="book-header">
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <span class="book-rating">⭐ ${book.rating}</span>
            </div>
            <div class="book-body">
                <p class="book-author">✍️ ${escapeHtml(book.author)}</p>
                <p class="book-category">📂 ${escapeHtml(book.category)}</p>
                <p class="book-year">📅 ${book.year}</p>
            </div>
            <div class="book-footer">
                <span class="book-price">₹${book.price}</span>
                <div class="rating-badge ${getRatingClass(book.rating)}">
                    ${book.rating >= 4.5 ? '🏆 Bestseller' : 
                      book.rating >= 4 ? '⭐ Popular' : 
                      '📖 Good'}
                </div>
            </div>
        </div>
    `).join('');
}

// Display Pagination
function displayPagination(data) {
    if (data.totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="pagination">';
    
    // Previous button
    if (data.hasPrevPage) {
        paginationHTML += `<button class="page-btn" onclick="loadAllBooks(${data.page - 1})">← Previous</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= data.totalPages; i++) {
        if (i === data.page) {
            paginationHTML += `<button class="page-btn active">${i}</button>`;
        } else if (i === 1 || i === data.totalPages || (i >= data.page - 1 && i <= data.page + 1)) {
            paginationHTML += `<button class="page-btn" onclick="loadAllBooks(${i})">${i}</button>`;
        } else if (i === data.page - 2 || i === data.page + 2) {
            paginationHTML += `<span class="page-dots">...</span>`;
        }
    }
    
    // Next button
    if (data.hasNextPage) {
        paginationHTML += `<button class="page-btn" onclick="loadAllBooks(${data.page + 1})">Next →</button>`;
    }
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

// Display Advanced Pagination
function displayAdvancedPagination(data) {
    if (data.totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="pagination">';
    
    // Previous button
    if (data.page > 1) {
        paginationHTML += `<button class="page-btn" onclick="applyAdvancedFilters(${data.page - 1})">← Previous</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= data.totalPages; i++) {
        if (i === data.page) {
            paginationHTML += `<button class="page-btn active">${i}</button>`;
        } else if (i === 1 || i === data.totalPages || (i >= data.page - 1 && i <= data.page + 1)) {
            paginationHTML += `<button class="page-btn" onclick="applyAdvancedFilters(${i})">${i}</button>`;
        } else if (i === data.page - 2 || i === data.page + 2) {
            paginationHTML += `<span class="page-dots">...</span>`;
        }
    }
    
    // Next button
    if (data.page < data.totalPages) {
        paginationHTML += `<button class="page-btn" onclick="applyAdvancedFilters(${data.page + 1})">Next →</button>`;
    }
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

// Reset All Filters
function resetAllFilters() {
    searchInput.value = '';
    categorySelect.value = '';
    sortSelect.value = '';
    minPriceInput.value = '';
    maxPriceInput.value = '';
    minRatingSelect.value = '';
    currentFilters = {};
    loadAllBooks();
    showToast('Filters reset', 'success');
}

// Update Results Info
function updateResultsInfo(count, query) {
    resultsCount.textContent = `${count} book${count !== 1 ? 's' : ''} found`;
    currentQuery.textContent = query ? ` - ${query}` : '';
}

// Helper Functions
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

function getRatingClass(rating) {
    if (rating >= 4.5) return 'rating-excellent';
    if (rating >= 4.0) return 'rating-good';
    return 'rating-average';
}
