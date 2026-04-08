require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Item = require('./models/Item');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(express.json());

// Manage database connection using connection handling in Mongoose
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crud_exercise')
    .then(() => console.log('Connected to MongoDB via Mongoose'))
    .catch(err => console.error('MongoDB connection error:', err));

// ==========================================
// CRUD Routes
// ==========================================

// Create (POST) - Insert data into the database using save() or create()
app.post('/items', async (req, res) => {
    try {
        // Handle asynchronous database operations using async/await
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        // Return database responses through API using Express response handling
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Read (GET) - Retrieve data using find() method
app.get('/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read (GET) single item
app.get('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update (PUT/PATCH) - Update records using updateOne() or findByIdAndUpdate()
app.put('/items/:id', async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json(updatedItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete (DELETE) - Delete records using deleteOne() or findByIdAndDelete()
app.delete('/items/:id', async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
