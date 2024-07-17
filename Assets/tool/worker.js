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
// let StartMetronomeTime
function startMetronome() {
    stopMetronome();
    let MainInterval = interval

    intervalId = setInterval(() => {
        let StartMetronomeTime = performance.now()
        self.postMessage('tick');
        let drift = performance.now() - StartMetronomeTime
        // console.log(drift);
        interval = MainInterval - drift
        // console.log(`Next Interval in ${interval}`);
    }, interval);
}

function stopMetronome() {
    if (intervalId) {
        clearInterval(intervalId);
    }
}
