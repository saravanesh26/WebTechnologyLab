// server.js

// Import required modules using the require() function in Node.js
const http = require('http');

// Define a port
const PORT = 3000;

// Define a server using the createServer() method
// Handle incoming client requests using request-response callback function
const server = http.createServer((request, response) => {
    // Log the incoming request method and URL
    console.log(`Received ${request.method} request for ${request.url}`);

    // Set appropriate response headers using response.setHeader()
    response.setHeader('Content-Type', 'text/html');
    response.setHeader('X-Powered-By', 'Node.js');

    // Send a response to the client using the response object methods (write, end)
    response.write('<!DOCTYPE html>');
    response.write('<html lang="en">');
    response.write('<head>');
    response.write('<meta charset="UTF-8">');
    response.write('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    response.write('<title>Node.js Server</title>');
    response.write('<style>');
    response.write('body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0fdf4; color: #166534; }');
    response.write('.container { text-align: center; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }');
    response.write('h1 { margin-top: 0; }');
    response.write('</style>');
    response.write('</head>');
    response.write('<body>');
    response.write('<div class="container">');
    response.write('<h1>Hello from Node.js! 🚀</h1>');
    response.write('<p>Server requested successfully.</p>');
    response.write('<p>This response demonstrates basic HTTP server handling without any external frameworks.</p>');
    response.write('</div>');
    response.write('</body>');
    response.write('</html>');
    
    response.end();
});

// Run the server on a specific port using the listen() method
server.listen(PORT, () => {
    // Display server status in the console using console logging in Node.js
    console.log(`✅ Server is running successfully`);
    console.log(`🌐 Actively listening at: http://localhost:${PORT}/`);
    console.log(`Press Ctrl+C to stop the server.`);
});
