(function() {
    async function runAxeAnalysis() {
      if (window.axe) {
        try {
          console.log('Starting axe.run()');
          
          // Implement a timeout for axe.run()
          const results = await Promise.race([
            window.axe.run(document, {
              // Options to limit the analysis scope
              iframes: false, // Exclude iframes
              // You can also specify rules or other options here
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('axe.run() timed out')), 15000) // 15-second timeout
            )
          ]);
  
          console.log('axe.run() completed');
          console.log('Accessibility issues:', results.violations);
          window.postMessage({ type: 'axeResults', results: results.violations }, '*');
        } catch (err) {
          console.error('axe.run error:', err);
          window.postMessage({ type: 'axeError', error: err.message }, '*');
        } finally {
          analysisRunning = false;
        }
      } else {
        console.error('axe is not defined');
        window.postMessage({ type: 'axeError', error: 'axe is not defined in page context' }, '*');
      }
    }
  
    // Wait until axe is available before adding the event listener
    function waitForAxe(callback) {
      if (window.axe) {
        callback();
      } else {
        setTimeout(() => waitForAxe(callback), 50);
      }
    }
  
    waitForAxe(() => {
      console.log('axe is available in page context');
      // Listen for a custom event to trigger the analysis
      // window.addEventListener('runAxeAnalysis', function() {
        runAxeAnalysis();
      // });
    });
  })();
  