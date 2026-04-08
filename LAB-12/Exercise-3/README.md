# Node.js MongoDB CRUD Application

This is a Node.js application using Express and Mongoose to perform CRUD operations on a MongoDB database, as part of Exercise 3.

## Requirements Satisfied
- Create a Node.js application using the Node.js runtime environment.
- Connect to MongoDB using a Node.js driver or ODM (Mongoose).
- Define a schema using Mongoose schema definition.
- Create a model using Mongoose model creation.
- Insert data into the database using `save()`.
- Retrieve data using `find()` and `findById()`.
- Update records using `findByIdAndUpdate()`.
- Delete records using `findByIdAndDelete()`.
- Handle asynchronous database operations using async/await.
- Manage database connection using connection handling in Mongoose.
- Return database responses through API using Express response handling.

## Installation

1. Make sure Node.js and MongoDB are installed on your system.
2. Clone or download this repository.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Make sure MongoDB daemon (`mongod`) is running on your machine.
5. Create a `.env` file (if not present) with `PORT` and `MONGODB_URI` or rely on the defaults.

## Running the Application

```bash
npm start
```
The server will start on `http://localhost:3000`.

## API Endpoints

- `POST /items`: Create a new item. Send JSON payload with `name`, `description` (optional), and `price`.
- `GET /items`: Get a list of all items.
- `GET /items/:id`: Get detailed information of a specific item by ID.
- `PUT /items/:id`: Update an existing item by ID.
- `DELETE /items/:id`: Delete an item by ID.
