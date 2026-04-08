const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'test_file.txt');

console.log('--- Starting Node.js File System Operations ---');

// 1. Create a new file using fs.writeFile()
fs.writeFile(filePath, 'Hello, this is the initial content of the file.\n', (err) => {
    // Manage errors using error-first callback handling
    if (err) {
        return console.error('Error creating file:', err);
    }
    console.log('1. File created successfully.');

    // Ensure proper execution flow by nesting callbacks (Asynchronous execution model)
    // 2. Read the contents of a file using fs.readFile()
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return console.error('Error reading file:', err);
        }
        console.log('\n2. File content after creation:\n' + data.trim());

        // 3. Append data to an existing file using fs.appendFile()
        fs.appendFile(filePath, 'This is the newly appended data.\n', (err) => {
            if (err) {
                return console.error('Error appending to file:', err);
            }
            console.log('\n3. Data appended successfully.');

            // Read the contents again to verify the appended data
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    return console.error('Error reading file after append:', err);
                }
                console.log('\n4. File content after appending:\n' + data.trim());

                // 4. Delete a file using fs.unlink()
                fs.unlink(filePath, (err) => {
                    if (err) {
                        return console.error('Error deleting file:', err);
                    }
                    console.log('\n5. File deleted successfully.');
                    console.log('\n--- Finished Node.js File System Operations ---');
                });
            });
        });
    });
});
