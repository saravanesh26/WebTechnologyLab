# Express Middleware Application

This Node.js application demonstrates the usage and execution flow of global and route-level middleware using the Express.js framework.

## Features
- **Application Level Middleware**: Global logging and request preprocessing (like adding custom data).
- **Route Level Middleware**: Specific middleware functions like simulated authentication (`requireAuth`) and validation (`validateData`).
- **Middleware Chaining**: Running multiple middleware functions linearly before returning a response.

## Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   node server.js
   ```

3. **Explore Endpoints:**
   - `http://localhost:3000/`: Basic route utilizing global middleware.
   - `http://localhost:3000/secure`: Tests a secure route with an auth middleware.
   - `http://localhost:3000/chained`: Demonstrates chaining multiple middlewawres (`requireAuth` -> `validateData`).

*Make sure to check your terminal window after making requests to observe the explicit execution order of the middleware functions logged via `console.log()`.*
