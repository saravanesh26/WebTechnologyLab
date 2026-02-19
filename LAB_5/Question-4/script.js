// Product Inventory System Logic

// Global inventory array to store product data
let inventory = [];

// DOM Elements
const productForm = document.getElementById('productForm');
const inventoryBody = document.getElementById('inventoryBody');
const totalValueDisplay = document.getElementById('totalValue');
const searchInput = document.getElementById('searchInput');
const formTitle = document.getElementById('formTitle');
const cancelBtn = document.getElementById('cancelBtn');

// Fetch initial data from JSON file
async function loadInventory() {
    try {
        const response = await fetch('inventory.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        inventory = data; // Store fetched data in global array
        renderTable(inventory);
        updateTotalValue(inventory);
    } catch (error) {
        console.error('Error loading inventory:', error);
        // Fallback data for demonstration if fetch fails (e.g., file:// protocol restriction)
        inventory = [
            { "id": "P001", "name": "Wireless Mouse", "category": "Electronics", "price": 25.99, "stock": 50 },
            { "id": "P002", "name": "Mechanical Keyboard", "category": "Electronics", "price": 89.99, "stock": 15 },
            { "id": "P003", "name": "USB-C Cable", "category": "Accessories", "price": 12.50, "stock": 100 },
            { "id": "P004", "name": "Monitor Stand", "category": "Furniture", "price": 45.00, "stock": 5 },
            { "id": "P005", "name": "External SSD 1TB", "category": "Storage", "price": 120.00, "stock": 8 }
        ];
        renderTable(inventory);
        updateTotalValue(inventory);
        // Optional: Show a toast/message that we are using fallback data
        const warningRow = document.createElement('tr');
        warningRow.innerHTML = '<td colspan="6" style="background-color: #fff3cd; color: #856404; text-align: center; font-size: 0.9em;">Notice: Using local fallback data (JSON fetch failed or blocked by browser security).</td>';
        inventoryBody.insertBefore(warningRow, inventoryBody.firstChild);
    }
}

// Render the inventory table
function renderTable(data) {
    inventoryBody.innerHTML = ''; // Clear existing rows

    if (data.length === 0) {
        inventoryBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No products found.</td></tr>';
        return;
    }

    data.forEach(product => {
        const row = document.createElement('tr');

        // Conditional formatting for low stock
        const isLowStock = product.stock < 10;
        if (isLowStock) {
            row.classList.add('low-stock');
        }

        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td>
                ${product.stock}
                ${isLowStock ? '<span class="low-stock-warning">⚠️ Low Stock</span>' : ''}
            </td>
            <td>
                <button class="btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                <button class="btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
            </td>
        `;
        inventoryBody.appendChild(row);
    });
}

// Calculate and display total inventory value
function updateTotalValue(data) {
    const total = data.reduce((sum, product) => sum + (product.price * product.stock), 0);
    totalValueDisplay.textContent = `Total Value: $${total.toFixed(2)}`;
}

// Add or Update Product
productForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const id = document.getElementById('productId').value.trim();
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);

    // Validation
    if (!id || !name || !category || isNaN(price) || isNaN(stock)) {
        alert('Please fill in all fields correctly.');
        return;
    }

    if (price < 0 || stock < 0) {
        alert('Price and Stock cannot be negative.');
        return;
    }

    // Check if we are editing (ID exists in dataset)
    const existingIndex = inventory.findIndex(p => p.id === id);
    const isEditing = productForm.dataset.mode === 'edit';

    if (isEditing) {
        // Update existing product
        if (existingIndex !== -1) {
            inventory[existingIndex] = { id, name, category, price, stock };
            alert('Product updated successfully!');
        } else {
            // Should not happen if logic is correct
            alert('Error: Product ID not found for update.');
        }
        resetForm();
    } else {
        // Add new product
        if (existingIndex !== -1) {
            alert('Error: Product ID already exists. Please use a unique ID.');
            return;
        }
        inventory.push({ id, name, category, price, stock });
        alert('Product added successfully!');
        resetForm();
    }

    // Re-render
    renderTable(inventory);
    updateTotalValue(inventory);
});

// Edit Product (Populate form)
window.editProduct = (id) => {
    const product = inventory.find(p => p.id === id);
    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;

        // Change form state to edit mode
        document.getElementById('productId').readOnly = true; // Cannot change ID during edit
        productForm.dataset.mode = 'edit';
        formTitle.textContent = 'Edit Product';
        cancelBtn.style.display = 'inline-block';
        document.getElementById('submitBtn').textContent = 'Update Product';

        // Scroll to form
        document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
    }
};

// Delete Product
window.deleteProduct = (id) => {
    if (confirm(`Are you sure you want to remove product ${id}?`)) {
        inventory = inventory.filter(p => p.id !== id);
        renderTable(inventory);
        updateTotalValue(inventory);
    }
};

// Search Functionality
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filteredInventory = inventory.filter(p =>
        p.category.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query)
    );
    renderTable(filteredInventory);
    // Note: We intentionally don't update total value based on search, 
    // usually inventory value is total value. If filtered value is desired, pass filteredInventory.
    // Requirement says "Display total inventory value calculated dynamically". 
    // Usually implies total of *everything* or total of *visible*. I'll keep total of everything unless user filters.
    // Let's make it total of visible items for better interactivity.
    updateTotalValue(filteredInventory);
});

// Reset Form to Default State
function resetForm() {
    productForm.reset();
    productForm.dataset.mode = 'add';
    document.getElementById('productId').readOnly = false;
    formTitle.textContent = 'Add New Product';
    cancelBtn.style.display = 'none';
    document.getElementById('submitBtn').textContent = 'Add Product';
}

cancelBtn.addEventListener('click', resetForm);

// Initial Load
document.addEventListener('DOMContentLoaded', loadInventory);
