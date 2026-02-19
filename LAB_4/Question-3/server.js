const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'students.json');

// Helper to read request body
const getRequestBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
};

// Helper to read data file
const readData = () => {
    try {
        let data = { students: [] };
        if (fs.existsSync(DATA_FILE)) {
            const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
            if (fileContent.trim()) {
                const parsed = JSON.parse(fileContent);
                // Normalize structure
                if (parsed.students && Array.isArray(parsed.students)) {
                    data = parsed;
                } else if (Array.isArray(parsed)) {
                    data = { students: parsed };
                }
            }
        } else {
            fs.writeFileSync(DATA_FILE, JSON.stringify(data));
        }
        return data;
    } catch (err) {
        console.error('Error reading data:', err);
        return { students: [] };
    }
};

// Helper to write data file
const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));
        return true;
    } catch (err) {
        console.error('Error writing data:', err);
        return false;
    }
};

const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    console.log(`${req.method} ${pathname}`);

    // Serve Static Files
    if (pathname === '/' || pathname === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
        return;
    }

    if (pathname === '/style.css') {
        fs.readFile(path.join(__dirname, 'style.css'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading style.css');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(content);
            }
        });
        return;
    }

    if (pathname === '/script.js') {
        fs.readFile(path.join(__dirname, 'script.js'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading script.js');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(content);
            }
        });
        return;
    }

    // API Routes
    if (pathname === '/students' && req.method === 'GET') {
        const data = readData();
        const students = data.students || [];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(students));
        return;
    }

    if (pathname === '/students' && req.method === 'POST') {
        try {
            const body = await getRequestBody(req);
            const student = JSON.parse(body);

            // Validate input
            if (!student.id || !student.name || !student.department || !student.marks) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing required fields' }));
                return;
            }

            const data = readData();

            // Check for duplicate ID
            if (data.students.some(s => s.id === student.id)) {
                res.writeHead(409, { 'Content-Type': 'application/json' }); // Conflict
                res.end(JSON.stringify({ error: 'Student ID already exists' }));
                return;
            }

            data.students.push(student);

            if (writeData(data)) {
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(student));
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to save data' }));
            }
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
        return;
    }

    // Identify update/delete by ID
    // Route pattern: /students/:id
    const idMatch = pathname.match(/^\/students\/([a-zA-Z0-9-_]+)$/);

    if (idMatch && req.method === 'PUT') {
        const id = idMatch[1];
        try {
            const body = await getRequestBody(req);
            const updates = JSON.parse(body);
            const data = readData();

            const index = data.students.findIndex(s => s.id === id);

            if (index !== -1) {
                // Update fields
                data.students[index] = { ...data.students[index], ...updates };

                if (writeData(data)) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data.students[index]));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to update data' }));
                }
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Student not found' }));
            }
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
        return;
    }

    if (idMatch && req.method === 'DELETE') {
        const id = idMatch[1];
        const data = readData();
        const initialLength = data.students.length;

        data.students = data.students.filter(s => s.id !== id);

        if (data.students.length < initialLength) {
            if (writeData(data)) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Student deleted successfully' }));
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to delete data' }));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Student not found' }));
        }
        return;
    }

    // 404 Fallback
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Use Ctrl+C to stop');
});
