const express = require('express');
const router = express.Router();

// Simulated resource database
let items = [
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Wired Keyboard', price: 49 },
];

/**
 * Handle different HTTP methods using REST API design principles
 */

// Handle GET request to retrieve all items
router.get('/', (req, res) => {
    res.json(items); // Send structured responses using res.json
});

// Handle GET request with route parameter (dynamic routing)
router.get('/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    const item = items.find(i => i.id === itemId);

    if (item) {
        res.json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// Handle POST request to create a new item
// Accept and process request data using request object
router.post('/', (req, res) => {
    const newItem = {
        id: items.length > 0 ? items[items.length - 1].id + 1 : 1,
        name: req.body.name,
        price: req.body.price
    };
    items.push(newItem);
    res.status(201).json(newItem);
});

// Handle PUT request to update an existing item
router.put('/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    const item = items.find(i => i.id === itemId);

    if (item) {
        item.name = req.body.name || item.name;
        item.price = req.body.price || item.price;
        res.json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// Handle DELETE request to remove an item
router.delete('/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    const itemIndex = items.findIndex(i => i.id === itemId);

    if (itemIndex !== -1) {
        const deletedItem = items.splice(itemIndex, 1);
        res.json(deletedItem[0]);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

module.exports = router;
