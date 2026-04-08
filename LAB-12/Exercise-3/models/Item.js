const mongoose = require('mongoose');

// Define a schema using Mongoose schema definition
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a model using Mongoose model creation
module.exports = mongoose.model('Item', itemSchema);
