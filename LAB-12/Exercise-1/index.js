const express = require('express');
const itemRoutes = require('./routes/items');

// Initialize the application using express() instance creation
const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON data using express.json() middleware
app.use(express.json());

// Maintain modular structure using separation of routes and logic
app.use('/api/items', itemRoutes);

// Simple default route Send structured responses using response object (res.send)
app.get('/', (req, res) => {
    res.send('Welcome to the Express RESTful API Exercise! Visit /api/items to interact with the resources.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
