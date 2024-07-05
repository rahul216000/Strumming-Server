// Add accurate timer constructor function
var StoreTime = 0

function MetronomeTimer(callback, timeInterval, options) {
    this.timeInterval = timeInterval;
    
    // Add method to start timer
    this.start = () => {
      // Set the expected time. The moment in time we start the timer plus whatever the time interval is. 
      this.expected = performance.now() + this.timeInterval;
      console.log(this.expected);
      // Start the timeout and save the id in a property, so we can cancel it later
      this.theTimeout = null;
      
      if (options.immediate) {
        callback();
      } 

      
      // this.timeout = setTimeout(this.round, this.timeInterval);
      this.timeout = setTimeout(this.round, this.expected - performance.now());
    }
    // Add method to stop timer
    this.stop = () => {
  
      clearTimeout(this.timeout);
      // console.log('Timer Stopped');
    }
    // Round method that takes care of running the callback and adjusting the time
    this.round = () => {

      console.log(performance.now());
      // console.log(performance.now() - StoreTime);
      StoreTime = performance.now();
      // console.log('timeout', this.timeout);
      // The drift will be the current moment in time for this round minus the expected time..
      let drift = performance.now() - this.expected;
      // let drift = performance.now() - this.expected;
      // Run error callback if drift is greater than time interval, and if the callback is provided
      if (drift > this.timeInterval) {
        // If error callback is provided
        if (options.errorCallback) {
          options.errorCallback();
        }
      }

      // this.timeInterval = this.timeInterval - StoreTime
      // console.log(performance.now());

      callback();
      // Increment expected time by time interval for every round after running the callback function.
      drift = performance.now() - this.expected;
      this.expected += this.timeInterval;
      // StoreTime = performance.now() - StoreTime;
      // console.log(StoreTime);

      // console.log(this.expected);
      // console.log('Drift:', drift);
      // console.log('Next round time interval:', this.expected - performance.now() );
      console.log(performance.now());

      // Run timeout again and set the timeInterval of the next iteration to the original time interval minus the drift.
      // this.timeout = setTimeout(this.round, this.timeInterval);
      this.timeout = setTimeout(this.round, this.expected - performance.now());
      // this.timeout = setTimeout(this.round, this.timeInterval - drift);

    }
  }

export default MetronomeTimer;