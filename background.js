// Store the latest analysis result
let lastAnalysisResult = null;

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender) => {
  /* if (message.type === 'axeResults') {
    chrome.storage.sync.get(['apiKey'], async (result) => {
      if (!result.apiKey) {
        console.error('OpenAI API key not set.');
        return;
      }

      const apiKey = result.apiKey;
      const accessibilityIssues = message.results;

      // Generate prompt for OpenAI
      const prompt = generatePrompt(accessibilityIssues);

      // Call OpenAI API
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are an expert on web accessibility and WCAG 2.2 standards.' },
              { role: 'user', content: prompt }
            ]
          })
        });

        const data = await response.json();
        if (data.error) {
          console.error('OpenAI API error:', data.error);
          return;
        }

        const assistantMessage = data.choices[0].message.content;

        // Send result to popup
        chrome.runtime.sendMessage({ type: 'openaiResponse', content: assistantMessage });
      } catch (error) {
        console.error('Error calling OpenAI API:', error);
      }
    });

    return true; // Keep the message channel open for async response
  } */
});

// Function to generate prompt for OpenAI
function generatePrompt(accessibilityIssues) {
  const violations = accessibilityIssues.violations;
  let prompt = 'Analyze the following accessibility issues found on a web page according to WCAG 2.2 standards, and provide recommendations:\n\n';

  violations.forEach((violation, index) => {
    prompt += `${index + 1}. Issue: ${violation.description}\n`;
    prompt += `Impact: ${violation.impact}\n`;
    prompt += `Help: ${violation.help}\n`;
    prompt += `WCAG Tags: ${violation.tags.join(', ')}\n`;

    if (violation.nodes && violation.nodes.length > 0) {
      prompt += `Affected elements:\n`;
      violation.nodes.forEach((node) => {
        prompt += ` - Selector: ${node.target.join(', ')}\n`;
      });
    }
    prompt += '\n';
  });

  prompt += 'Based on the above, what additional context-specific accessibility issues might exist on the page? Provide analysis according to WCAG 2.2 standards and suggest improvements.\n';

  return prompt;
}

console.log('Background script loaded.');