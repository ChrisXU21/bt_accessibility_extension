document.getElementById('save').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    chrome.storage.sync.set({ apiKey }, () => {
      alert('API Key saved.');
    });
  });
  
  document.addEventListener('DOMContentLoaded', async () => {
    await chrome.storage.sync.get(['apiKey'], (result) => {
      if (result.apiKey) {
        document.getElementById('apiKey').value = result.apiKey;
      }
    });
  });
  