// Add accurate timer constructor function

function MetronomeTimer(callback, timeInterval, options = {}) {
    this.timeInterval = timeInterval;
    this.isRunning = false;
    this.expected = null;

    // Add method to start timer
    this.start = () => {
        if (this.isRunning) return;
        this.isRunning = true;

        // Set the expected time. The moment in time we start the timer plus whatever the time interval is.
        this.expected = performance.now() + this.timeInterval;

        if (options.immediate) {
            callback();
        }

        this.run();
    };

    // Add method to stop timer
    this.stop = () => {
        this.isRunning = false;
        // console.log('Timer Stopped');
    };

    // Method to run the timer using requestAnimationFrame
    this.run = () => {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const drift = currentTime - this.expected;

        if (drift >= 0) {
            callback();
            this.expected += this.timeInterval;
        }

        if (drift > this.timeInterval) {
            // If the drift is too high, adjust the expected time to the current time plus the interval
            this.expected = currentTime + this.timeInterval;
            if (options.errorCallback) {
                options.errorCallback();
            }
        }

        requestAnimationFrame(this.run);
    };
}

export default MetronomeTimer;
