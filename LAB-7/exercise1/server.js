const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// MongoDB configuration
const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'student_notes_db';
const COLLECTION_NAME = 'notes';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from current directory

let db;
let notesCollection;

// Connect to MongoDB
async function connectDB() {
    try {
        const client = await MongoClient.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB successfully');
        db = client.db(DB_NAME);
        notesCollection = db.collection(COLLECTION_NAME);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// Routes

// 1. Add Note - POST /notes
app.post('/notes', async (req, res) => {
    try {
        const { title, subject, description } = req.body;
        
        // Validation
        if (!title || !subject || !description) {
            return res.status(400).json({ 
                error: 'Title, subject, and description are required' 
            });
        }

        // Create note document
        const note = {
            title,
            subject,
            description,
            created_date: new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
        };

        const result = await notesCollection.insertOne(note);
        
        res.status(201).json({
            message: 'Note added successfully',
            noteId: result.insertedId,
            note: { ...note, _id: result.insertedId }
        });
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ error: 'Failed to add note' });
    }
});

// 2. View All Notes - GET /notes
app.get('/notes', async (req, res) => {
    try {
        const notes = await notesCollection.find({}).toArray();
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// 3. Get Single Note - GET /notes/:id
app.get('/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }

        const note = await notesCollection.findOne({ _id: new ObjectId(id) });
        
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json(note);
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: 'Failed to fetch note' });
    }
});

// 4. Update Note - PUT /notes/:id
app.put('/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subject, description } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }

        // Build update object
        const updateFields = {};
        if (title) updateFields.title = title;
        if (subject) updateFields.subject = subject;
        if (description) updateFields.description = description;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ 
                error: 'At least one field (title, subject, or description) is required' 
            });
        }

        const result = await notesCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ 
            message: 'Note updated successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

// 5. Delete Note - DELETE /notes/:id
app.delete('/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }

        const result = await notesCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ 
            message: 'Note deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// Start server
async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Database: ${DB_NAME}`);
        console.log(`Collection: ${COLLECTION_NAME}`);
    });
}

startServer();
