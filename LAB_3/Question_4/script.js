// 2. Store activity in an array of objects
let activityLog = [];
const logDisplay = document.getElementById('activity-list');
const warningMsg = document.getElementById('warning-msg');
const resetBtn = document.getElementById('reset-btn');
const exportBtn = document.getElementById('export-btn');

// Suspicious activity thresholds
const CLICK_THRESHOLD = 5; // Max clicks in time window
const KEY_THRESHOLD = 10; // Max key presses in time window
const TIME_WINDOW = 2000; // in milliseconds
let warningTimeout;

// Helper to update DOM
function renderLog() {
    logDisplay.innerHTML = '';
    // Show last 20 events in reverse order
    const recentLogs = activityLog.slice().reverse().slice(0, 50);

    recentLogs.forEach(log => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerText = `[${log.timestamp}] ${log.type.toUpperCase()} on <${log.target}>`;
        logDisplay.appendChild(div);
    });
}

// 5. Check for suspicious activity
function checkSuspiciousActivity() {
    const now = new Date().getTime();
    // Filter events in the last TIME_WINDOW
    const recentEvents = activityLog.filter(log => {
        const logTime = new Date(log.rawTimestamp).getTime();
        return (now - logTime) < TIME_WINDOW;
    });

    const clickCount = recentEvents.filter(e => e.type === 'click').length;
    const keyCount = recentEvents.filter(e => e.type === 'keydown').length;

    if (clickCount > CLICK_THRESHOLD || keyCount > KEY_THRESHOLD) {
        warningMsg.style.display = 'block';
        warningMsg.innerText = `⚠️ Suspicious Activity! (High event rate: ${clickCount} clicks, ${keyCount} keys)`;

        // Auto-dismiss after 3 seconds of calm
        clearTimeout(warningTimeout);
        warningTimeout = setTimeout(() => {
            warningMsg.style.display = 'none';
        }, 3000);
    }
}

// 1. & 3. Track events (using bubbling/capturing concept)
// We utilize event bubbling by attaching listeners to 'document'. 
// This captures events triggered on child elements.
function logEvent(event) {
    const entry = {
        type: event.type,
        target: event.target.tagName,
        timestamp: new Date().toLocaleTimeString(),
        rawTimestamp: new Date() // for calculation
    };

    activityLog.push(entry);
    renderLog();
    checkSuspiciousActivity();
}

// Attach listeners
document.addEventListener('click', logEvent);
document.addEventListener('keydown', (e) => {
    // We can also log usage of specific keys
    const entry = {
        type: 'keydown',
        target: `KEY: ${e.key}`,
        timestamp: new Date().toLocaleTimeString(),
        rawTimestamp: new Date()
    };
    activityLog.push(entry);
    renderLog();
    checkSuspiciousActivity();
});

// Focus/Blur do not bubble by default, so we use capture phase or specific listeners
// method 1: useCapture = true for focus/blur on document
document.addEventListener('focus', logEvent, true);
document.addEventListener('blur', logEvent, true);

// 6. Reset and Export
resetBtn.addEventListener('click', () => {
    activityLog = [];
    renderLog();
    warningMsg.style.display = 'none';
});

exportBtn.addEventListener('click', () => {
    const logsText = activityLog.map(log =>
        `[${log.timestamp}] Type: ${log.type}, Target: ${log.target}`
    ).join('\n');

    // Create a blob and download
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activity_log.txt';
    a.click();
    URL.revokeObjectURL(url);
});

// Initial render
renderLog();
