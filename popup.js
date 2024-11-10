document.getElementById('runAnalysis').addEventListener('click', () => {
    document.getElementById('results').textContent = 'Running analysis...';
  
    console.log('Starting analysis...');
    // Inject content script and send message to start analysis
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;
  
      // Inject the content script into the active tab
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: ['content_script.js']
        },
        () => {
          // After injection, send message to content script
          chrome.tabs.sendMessage(tabId, { type: 'startAnalysis' });
        }
      );
    });
  });
  
  // Listen for analysis results
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'openaiResponse') {
      document.getElementById('results').textContent = message.content;
    }
  });
  
  console.log('Popup script loaded.');