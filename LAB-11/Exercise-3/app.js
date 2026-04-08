// Import the events module using the require() function
const EventEmitter = require('events');

// Create an event emitter object using EventEmitter instance
const myEmitter = new EventEmitter();

// Register event listeners using the on() method and execute callback functions

// 1. Simple event listener
myEmitter.on('userLogin', () => {
    // Display event responses in the console using console logging
    console.log('Event [userLogin]: A user has successfully logged in.');
});

// 2. Pass data through events using arguments in emit()
myEmitter.on('userPurchase', (user, item) => {
    console.log(`Event [userPurchase]: User '${user}' has purchased a '${item}'.`);
});

// 3. Handle multiple listeners for a single event using multiple event subscriptions
myEmitter.on('systemAlert', (message) => {
    console.log(`Event [systemAlert] - Listener 1: Logging alert to database -> ${message}`);
});

myEmitter.on('systemAlert', (message) => {
    console.log(`Event [systemAlert] - Listener 2: Sending email notification -> ${message}`);
});

// 4. Demonstrate asynchronous behavior using event-driven architecture
myEmitter.on('asyncTask', (taskName) => {
    console.log(`Event [asyncTask]: Starting background task '${taskName}'...`);
    // Simulating asynchronous operation
    setTimeout(() => {
        console.log(`Event [asyncTask] (Async): Completed background task '${taskName}'.`);
    }, 2000);
});

console.log('--- Triggering Events ---');

// Define custom events using the emit() method
myEmitter.emit('userLogin');
myEmitter.emit('userPurchase', 'Alice', 'MacBook Pro');
myEmitter.emit('systemAlert', 'High CPU Usage Detected!');

console.log('\n--- Triggering Asynchronous Event ---');
myEmitter.emit('asyncTask', 'Data Backup');

console.log('This message is logged immediately after emitting the async event. It demonstrates that Node.js continues execution without waiting for the async callback to finish.');
