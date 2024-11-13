// Function to inject a script into the page
function injectScript(filePath) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(filePath);
    script.onload = function() {
      console.log(`${filePath} loaded`);
      resolve();
    };
    script.onerror = function() {
      console.error(`Failed to load ${filePath}`);
      reject(new Error(`Failed to load ${filePath}`));
    };
    (document.head || document.documentElement).appendChild(script);
  });
}

// Function to get page source
function getPageSource() {
  return document.documentElement.outerHTML;
}

// Inject scripts sequentially
injectScript('axe.min.js').then(() => {
  return injectScript('page_script.js');
}).then(() => {
  console.log('All scripts injected');
}).catch(err => {
  console.error('Error injecting scripts:', err);
});

// Function to run analysis
function runAnalysis() {
  // Get page source
  const pageSource = getPageSource();

  // Listen for the result
  window.addEventListener('message', function(event) {
    if (event.source !== window) return;
    if (event.data.type === 'axeResults') {
      // Send results to background script
      chrome.runtime.sendMessage({ type: 'axeResults', results: event.data.results, pageSource: pageSource });
    } else if (event.data.type === 'axeError') {
      console.error('Error from axe:', event.data.error);
      chrome.runtime.sendMessage({ type: 'axeError', error: event.data.error });
    }
  }, { once: true }); // Remove listener after receiving the message

  // Dispatch event to run the analysis
  window.dispatchEvent(new CustomEvent('runAxeAnalysis'));
}

// Listen for startAnalysis message
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'startAnalysis') {
    console.log('Running axe analysis...');
    runAnalysis();
  }
});

console.log('Content script injected.');
