// --- 1. Data Setup ---

// We define our products here. In a real app, this might come from a database.
const products = [
    { id: 1, name: 'Vintage Camera', price: 150, category: 'electronics', image: 'https://via.placeholder.com/200?text=Camera' },
    { id: 2, name: 'Cozy Sweater', price: 45, category: 'clothing', image: 'https://via.placeholder.com/200?text=Sweater' },
    { id: 3, name: 'Running Shoes', price: 80, category: 'clothing', image: 'https://via.placeholder.com/200?text=Shoes' },
    { id: 4, name: 'Smartphone', price: 699, category: 'electronics', image: 'https://via.placeholder.com/200?text=Phone' },
    { id: 5, name: 'Coffee Mug', price: 12, category: 'home', image: 'https://via.placeholder.com/200?text=Mug' },
    { id: 6, name: 'Notebook', price: 5, category: 'stationery', image: 'https://via.placeholder.com/200?text=Notebook' }
];

// The cart array will hold items that the user adds.
// It will look like: [{ id: 1, quantity: 2 }, ...]
let cart = [];

// Coupon state
let activeCoupon = null; // Stores the applied coupon code if valid

// --- 2. Render Functions ---

// This function takes the products list and puts them onto the page
function renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = ''; // Clear existing content

    products.forEach(product => {
        // Create a div for the product card
        const card = document.createElement('div');
        card.className = 'product-card';

        // Add HTML content for the card
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Category: ${product.category}</p>
            <p><strong>$${product.price}</strong></p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;

        container.appendChild(card);
    });
}

// This function updates the Cart section relative to the `cart` array
function renderCart() {
    const list = document.getElementById('cart-items');
    list.innerHTML = ''; // Clear current list

    if (cart.length === 0) {
        list.innerHTML = '<p>Your cart is empty.</p>';
        updateSummary(); // Also reset totals
        return;
    }

    cart.forEach(item => {
        // Find full product details based on ID
        const product = products.find(p => p.id === item.id);

        const row = document.createElement('div');
        row.className = 'cart-item';
        
        row.innerHTML = `
            <div>
                <h4>${product.name}</h4>
                <small>$${product.price} x ${item.quantity}</small>
            </div>
            <div>
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
                <button onclick="removeFromCart(${item.id})">X</button>
            </div>
        `;
        list.appendChild(row);
    });

    updateSummary(); // Recalculate totals whenever UI updates
}

// --- 3. Logic Functions ---

function addToCart(productId) {
    // Check if item is already in cart
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    renderCart(); // Refresh the display
}

function removeFromCart(productId) {
    // Filter out the item with the given ID
    cart = cart.filter(item => item.id !== productId);
    renderCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);

    if (item) {
        item.quantity += change;
        
        // If quantity drops to 0 or less, remove the item
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            renderCart();
        }
    }
}

function applyCoupon() {
    const input = document.getElementById('coupon-input');
    const message = document.getElementById('coupon-message');
    const code = input.value.trim().toUpperCase(); // string method parsing

    // Simple coupon validation logic
    if (code === 'SAVE10') {
        activeCoupon = 'SAVE10';
        message.style.color = 'green';
        message.textContent = 'Coupon applied! 10% off.';
    } else if (code === 'OFF20') {
        activeCoupon = 'OFF20';
        message.style.color = 'green';
        message.textContent = 'Coupon applied! 20% off.';
    } else {
        activeCoupon = null;
        message.style.color = 'red';
        message.textContent = 'Invalid code.';
    }

    renderCart(); // Re-calculate totals with new coupon
}

// --- 4. Calculation & Discount Logic (The Brains) ---

function updateSummary() {
    // A. Calculate Subtotal
    let subtotal = 0;
    let totalItems = 0; // for bulk discount
    let electronicsCount = 0; // for category discount

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        subtotal += product.price * item.quantity;
        totalItems += item.quantity;
        
        if (product.category === 'electronics') {
            electronicsCount += item.quantity;
        }
    });

    // B. Calculate Discounts
    let discounts = [];
    let discountAmount = 0;

    // Rule 1: Bulk Discount (If more than 5 items total, $10 off)
    if (totalItems > 5) {
        const amount = 10;
        discounts.push({ name: 'Bulk Discount (>5 items)', amount: amount });
        discountAmount += amount;
    }

    // Rule 2: Category Discount (If purchased electronics, add extra 5% off subtotal)
    if (electronicsCount > 0) {
        const amount = subtotal * 0.05; // 5%
        discounts.push({ name: 'Electronics Promo (5%)', amount: amount });
        discountAmount += amount;
    }

    // Rule 3: Time-of-Day logic
    const currentHour = new Date().getHours();
    // Happy Hour between 6 PM (18) and 10 PM (22)
    if (currentHour >= 18 && currentHour <= 22) {
        const amount = 5; // Flat $5 off
        discounts.push({ name: 'Evening Happy Hour', amount: amount });
        discountAmount += amount;
    }

    // Rule 4: Coupon
    if (activeCoupon === 'SAVE10') {
        const amount = subtotal * 0.10;
        discounts.push({ name: 'Coupon SAVE10', amount: amount });
        discountAmount += amount;
    } else if (activeCoupon === 'OFF20') {
        const amount = subtotal * 0.20;
        discounts.push({ name: 'Coupon OFF20', amount: amount });
        discountAmount += amount;
    }

    // C. Final Total
    let total = subtotal - discountAmount;
    if (total < 0) total = 0; // Prevent negative prices

    // D. Update UI
    document.getElementById('subtotal-price').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('total-price').textContent = '$' + total.toFixed(2);

    const discountContainer = document.getElementById('discounts-container');
    discountContainer.innerHTML = '';
    
    discounts.forEach(d => {
        const div = document.createElement('div');
        div.className = 'summary-line discount-line';
        div.innerHTML = `<span>${d.name}</span> <span>-$${d.amount.toFixed(2)}</span>`;
        discountContainer.appendChild(div);
    });
}

// Initial Render
renderProducts();
renderCart();
