// worker.js
let intervalId;
let interval = 60000 / 120; // Default to 120 BPM

self.onmessage = function(e) {
    if (e.data.command === 'start') {
        interval = e.data.interval;
        startMetronome();
    } else if (e.data.command === 'stop') {
        stopMetronome();
    } else if (e.data.command === 'update') {
        interval = e.data.interval;
    }
};

function startMetronome() {
    stopMetronome();
    intervalId = setInterval(() => {
        self.postMessage('tick');
    }, interval);
}

function stopMetronome() {
    if (intervalId) {
        clearInterval(intervalId);
    }
}
