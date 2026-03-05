const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 3001;

// MongoDB configuration
const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'book_finder_db';
const COLLECTION_NAME = 'books';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let db;
let booksCollection;

// Connect to MongoDB
async function connectDB() {
    try {
        const client = await MongoClient.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB successfully');
        db = client.db(DB_NAME);
        booksCollection = db.collection(COLLECTION_NAME);
        
        // Insert sample data if collection is empty
        await initializeSampleData();
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// Initialize sample data
async function initializeSampleData() {
    const count = await booksCollection.countDocuments();
    if (count === 0) {
        console.log('Inserting sample book data...');
        const sampleBooks = [
            {
                title: "JavaScript Essentials",
                author: "John Smith",
                category: "Programming",
                price: 450,
                rating: 4.5,
                year: 2023
            },
            {
                title: "Python for Data Science",
                author: "Sarah Johnson",
                category: "Programming",
                price: 650,
                rating: 4.8,
                year: 2024
            },
            {
                title: "Web Development Fundamentals",
                author: "Mike Brown",
                category: "Programming",
                price: 550,
                rating: 4.2,
                year: 2023
            },
            {
                title: "Database Design Patterns",
                author: "Emily Davis",
                category: "Database",
                price: 700,
                rating: 4.6,
                year: 2024
            },
            {
                title: "MongoDB Complete Guide",
                author: "Robert Wilson",
                category: "Database",
                price: 600,
                rating: 4.7,
                year: 2023
            },
            {
                title: "React Advanced Techniques",
                author: "Lisa Anderson",
                category: "Programming",
                price: 800,
                rating: 4.9,
                year: 2025
            },
            {
                title: "Node.js Backend Development",
                author: "David Lee",
                category: "Programming",
                price: 720,
                rating: 4.4,
                year: 2024
            },
            {
                title: "SQL Mastery",
                author: "Jennifer Taylor",
                category: "Database",
                price: 480,
                rating: 4.3,
                year: 2023
            },
            {
                title: "Machine Learning Basics",
                author: "Chris Martin",
                category: "AI",
                price: 900,
                rating: 4.7,
                year: 2025
            },
            {
                title: "Deep Learning with Python",
                author: "Anna White",
                category: "AI",
                price: 950,
                rating: 4.8,
                year: 2024
            },
            {
                title: "Cloud Computing Fundamentals",
                author: "James Harris",
                category: "Cloud",
                price: 680,
                rating: 4.1,
                year: 2023
            },
            {
                title: "DevOps Engineering",
                author: "Patricia Clark",
                category: "Cloud",
                price: 750,
                rating: 4.5,
                year: 2024
            },
            {
                title: "Cybersecurity Essentials",
                author: "Michael Lewis",
                category: "Security",
                price: 820,
                rating: 4.6,
                year: 2025
            },
            {
                title: "Ethical Hacking Guide",
                author: "Karen Walker",
                category: "Security",
                price: 880,
                rating: 4.4,
                year: 2024
            },
            {
                title: "Mobile App Development",
                author: "Thomas Hall",
                category: "Programming",
                price: 620,
                rating: 4.2,
                year: 2023
            }
        ];
        
        await booksCollection.insertMany(sampleBooks);
        console.log(`Inserted ${sampleBooks.length} sample books`);
    }
}

// Routes

// 1. Search Books by Title
// GET /books/search?title=javascript
app.get('/books/search', async (req, res) => {
    try {
        const { title } = req.query;
        
        if (!title) {
            return res.status(400).json({ error: 'Title parameter is required' });
        }
        
        // Case-insensitive regex search
        const books = await booksCollection.find({
            title: { $regex: title, $options: 'i' }
        }).toArray();
        
        res.json({
            count: books.length,
            books: books
        });
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ error: 'Failed to search books' });
    }
});

// 2. Filter Books by Category
// GET /books/category/:category
app.get('/books/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        
        // Case-insensitive category search
        const books = await booksCollection.find({
            category: { $regex: `^${category}$`, $options: 'i' }
        }).toArray();
        
        res.json({
            category: category,
            count: books.length,
            books: books
        });
    } catch (error) {
        console.error('Error filtering books:', error);
        res.status(500).json({ error: 'Failed to filter books' });
    }
});

// Get all unique categories
app.get('/books/categories', async (req, res) => {
    try {
        const categories = await booksCollection.distinct('category');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// 3. Sort Books by Price or Rating
// GET /books/sort/:field?order=asc|desc
app.get('/books/sort/:field', async (req, res) => {
    try {
        const { field } = req.params;
        const { order } = req.query;
        
        if (!['price', 'rating', 'year', 'title'].includes(field)) {
            return res.status(400).json({ 
                error: 'Invalid sort field. Use: price, rating, year, or title' 
            });
        }
        
        // 1 for ascending, -1 for descending
        const sortOrder = order === 'desc' ? -1 : 1;
        
        const sortQuery = {};
        sortQuery[field] = sortOrder;
        
        const books = await booksCollection.find().sort(sortQuery).toArray();
        
        res.json({
            sortedBy: field,
            order: order === 'desc' ? 'descending' : 'ascending',
            count: books.length,
            books: books
        });
    } catch (error) {
        console.error('Error sorting books:', error);
        res.status(500).json({ error: 'Failed to sort books' });
    }
});

// 4. Top Rated Books
// GET /books/top?limit=5&minRating=4
app.get('/books/top', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const minRating = parseFloat(req.query.minRating) || 4;
        
        const books = await booksCollection.find({
            rating: { $gte: minRating }
        })
        .sort({ rating: -1 })
        .limit(limit)
        .toArray();
        
        res.json({
            minRating: minRating,
            limit: limit,
            count: books.length,
            books: books
        });
    } catch (error) {
        console.error('Error fetching top books:', error);
        res.status(500).json({ error: 'Failed to fetch top rated books' });
    }
});

// 5. Pagination
// GET /books?page=1&limit=5
app.get('/books', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        
        const totalBooks = await booksCollection.countDocuments();
        const totalPages = Math.ceil(totalBooks / limit);
        
        const books = await booksCollection.find()
            .skip(skip)
            .limit(limit)
            .toArray();
        
        res.json({
            page: page,
            limit: limit,
            totalBooks: totalBooks,
            totalPages: totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            books: books
        });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// Advanced Search with Multiple Filters
// GET /books/advanced?category=Programming&minPrice=400&maxPrice=800&minRating=4&sortBy=price&order=asc
app.get('/books/advanced', async (req, res) => {
    try {
        const { category, minPrice, maxPrice, minRating, sortBy, order, page, limit } = req.query;
        
        // Build query object
        const query = {};
        
        if (category) {
            query.category = { $regex: `^${category}$`, $options: 'i' };
        }
        
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        
        if (minRating) {
            query.rating = { $gte: parseFloat(minRating) };
        }
        
        // Build sort object
        let sortQuery = {};
        if (sortBy) {
            sortQuery[sortBy] = order === 'desc' ? -1 : 1;
        }
        
        // Pagination
        const currentPage = parseInt(page) || 1;
        const resultsPerPage = parseInt(limit) || 10;
        const skip = (currentPage - 1) * resultsPerPage;
        
        const totalResults = await booksCollection.countDocuments(query);
        const books = await booksCollection.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(resultsPerPage)
            .toArray();
        
        res.json({
            filters: { category, minPrice, maxPrice, minRating },
            sort: { field: sortBy, order },
            page: currentPage,
            limit: resultsPerPage,
            totalResults: totalResults,
            totalPages: Math.ceil(totalResults / resultsPerPage),
            count: books.length,
            books: books
        });
    } catch (error) {
        console.error('Error in advanced search:', error);
        res.status(500).json({ error: 'Failed to perform advanced search' });
    }
});

// Get single book
app.get('/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid book ID' });
        }
        
        const book = await booksCollection.findOne({ _id: new ObjectId(id) });
        
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        res.json(book);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ error: 'Failed to fetch book' });
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
