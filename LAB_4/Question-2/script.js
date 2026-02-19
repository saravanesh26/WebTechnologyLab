document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('resultsContainer');
    const loader = document.getElementById('loader');

    let debounceTimer;

    // Use a variable to cache the products after the first fetch if desired, 
    // but the requirement implies "Fetch matching results" on search.
    // However, usually for "AJAX Search" with a static JSON file, we might fetch once and filter, 
    // OR fetch every time. 
    // "Use AJAX to: Send search query. Fetch matching results."
    // This implies the filtering might happen on the "server" (or simulating it).
    // since we only have a static file, we must fetch the whole file and filter client-side.
    // To simulate a real search, I will re-fetch every time or just fetch once.
    // Re-fetching is more "AJAX-y" for the sake of the exercise.

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        // Clear previous timer
        clearTimeout(debounceTimer);

        // Debounce: Wait 500ms before triggering search
        debounceTimer = setTimeout(() => {
            if (query.length > 0) {
                performSearch(query);
            } else {
                resultsContainer.innerHTML = '<div class="empty-state"><p>Start typing to search for products.</p></div>';
                loader.classList.add('hidden');
            }
        }, 500);
    });

    async function performSearch(query) {
        // Show loader
        loader.classList.remove('hidden');

        try {
            // Simulate network delay to make the loader visible (optional, but good for UX demo)
            await new Promise(resolve => setTimeout(resolve, 600));

            // Fetch data
            const response = await fetch('products.json');

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const products = await response.json();

            // Prevent rendering if input was cleared during the fetch
            if (searchInput.value.trim() === '') {
                return;
            }

            // Filter products based on query (Name or Category)
            const filteredProducts = products.filter(product => {
                const lowerQuery = query.toLowerCase();
                return (
                    product.name.toLowerCase().includes(lowerQuery) ||
                    product.category.toLowerCase().includes(lowerQuery)
                );
            });

            displayResults(filteredProducts);

        } catch (error) {
            console.error('Error fetching data:', error);
            resultsContainer.innerHTML = `
                <div class="error-state">
                    <p>Failed to load products. Please try again.</p>
                </div>
            `;
        } finally {
            // Hide loader
            loader.classList.add('hidden');
        }
    }

    function displayResults(products) {
        resultsContainer.innerHTML = '';

        if (products.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <p>No results found for your search.</p>
                </div>
            `;
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');

            // Format price as currency
            const formattedPrice = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'INR'
            }).format(product.price*100);

            card.innerHTML = `
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">${formattedPrice}</div>
                </div>
            `;
            resultsContainer.appendChild(card);
        });
    }
});
