const express = require('express');
const app = express();
const port = 3000;

// 1. Global Logging Middleware
// This middleware executes for EVERY incoming request
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[GLOBAL LOG] Timestamp: ${timestamp}`);
  console.log(`[GLOBAL LOG] Method: ${req.method} | URL: ${req.url}`);
  
  // Pass control to the next middleware or route handler 
  // ensuring proper execution flow
  next(); 
});

// 2. Global Preprocessing Middleware
// Simulates adding data to the request object that downstream routes can use
app.use((req, res, next) => {
  console.log(`[GLOBAL PREPROCESS] Handling request preprocessing... Adding customData property.`);
  req.customData = "This custom data was initialized by the preprocessing middleware.";
  next();
});

// 3. Route-level Middleware Functions
// These are not applied globally, but added to specific routes

const requireAuth = (req, res, next) => {
  console.log(`[ROUTE MIDDLEWARE - Auth] Simulating authentication check for route: ${req.url}`);
  // Simulate setting user object after successful authentication
  req.user = { id: 101, username: 'NodeDev' };
  next(); // Authentication successful, proceed
};

const validateData = (req, res, next) => {
  console.log(`[ROUTE MIDDLEWARE - Validate] Validating incoming data parameters for route: ${req.url}`);
  next(); // Validation successful, proceed
};

// 4. Routes Defined

// Route 1: Root route utilizing only global middlewares
app.get('/', (req, res) => {
  console.log('-> Executing Handler for GET /');
  res.send(`
    <h1>Middleware App Home</h1>
    <p>Check the console terminal to see the middleware logs!</p>
    <p>Data from global middleware: <strong>${req.customData}</strong></p>
    <hr />
    <ul>
      <li><a href="/secure">Test Route-level Auth Middleware</a></li>
      <li><a href="/chained">Test Middleware Chaining</a></li>
    </ul>
  `);
});

// Route 2: Demonstrating simple route-level middleware
app.get('/secure', requireAuth, (req, res) => {
    console.log('-> Executing Handler for GET /secure');
    res.send(`
      <h1>Secure Page</h1>
      <p>Welcome back, ${req.user.username}. You passed the auth middleware!</p>
      <p>Global data is also accessible: ${req.customData}</p>
      <a href="/">Go Back</a>
    `);
});

// Route 3: Demonstrating middleware chaining
app.get('/chained', requireAuth, validateData, (req, res) => {
    console.log('-> Executing Handler for GET /chained');
    res.send(`
      <h1>Chained Middleware Executed</h1>
      <p>This route passed through BOTH <em>requireAuth</em> and <em>validateData</em> middlewares successfully.</p>
      <a href="/">Go Back</a>
    `);
});

// Start the Express server
app.listen(port, () => {
  console.log(`Express server is listening on http://localhost:${port}`);
  console.log('Navigate to the following URLs to test:');
  console.log(' - http://localhost:3000/');
  console.log(' - http://localhost:3000/secure');
  console.log(' - http://localhost:3000/chained');
});
