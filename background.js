// Store the latest analysis result
let lastAnalysisResult = null;

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'axeResults') {
    chrome.storage.sync.get(['apiKey'], async (result) => {
      console.log(result);
      if (!result.apiKey) {
        console.error('OpenAI API key not set.');
        return;
      }

      const apiKey = result.apiKey;
      const accessibilityIssues = message.results;
      const pageSource = message.pageSource;

      // Format Axe analysis results
      let formattedIssues = "";
      accessibilityIssues.forEach((violation, index) => {
        formattedIssues += `${index + 1}. Issue: ${violation.description}\n`;
        formattedIssues += `Impact: ${violation.impact}\n`;
        formattedIssues += `Help: ${violation.help}\n`;
        formattedIssues += `WCAG Tags: ${violation.tags.join(', ')}\n`;
    
        if (violation.nodes && violation.nodes.length > 0) {
          formattedIssues += `Affected elements:\n`;
          violation.nodes.forEach((node) => {
            formattedIssues += ` - Selector: ${node.target.join(', ')}\n`;
          });
        }
        formattedIssues += '\n';
      });

      // Generate prompt for OpenAI
      const prompt = generatePrompt(formattedIssues, pageSource);

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
              { role: 'system', content: 'You are an expert on web accessibility and WCAG 2.2 standards specifically for e-learning platforms and learning management systems.' },
              { role: 'user', content: prompt }
            ]
          })
        });

        const data = await response.json();
        if (data.error) {
          console.error('OpenAI API error:', data.error);
          return;
        }

        let assistantMessage = "Immediate issues found by Axe:\n";

        assistantMessage += formattedIssues;

        assistantMessage += "OpenAI evaluation:\n";

        assistantMessage += data.choices[0].message.content;

        console.log('Text:', assistantMessage);

        // Send result to popup
        chrome.runtime.sendMessage({ type: 'openaiResponse', content: assistantMessage });
      } catch (error) {
        console.error('Error calling OpenAI API:', error);
      }
    });

    return true; // Keep the message channel open for async response
  }
});



// Function to generate prompt for OpenAI
function generatePrompt(formattedIssues, pageSource) {
  const violations = formattedIssues;
  let prompt = 'Analyze the following e-learning web page for accessibility issues, using the provided Axe analysis results and the page source code.\n\n';

  prompt += 'Axe Analysis Results:\n';
  prompt += violations;

  prompt += 'Page Source Code (truncated if necessary):\n';
  prompt += '```\n';
  prompt += truncateText(pageSource, 5000);
  prompt += '\n```\n';

  prompt += 'Instructions:\n';
  prompt += '- Identify any additional context-specific accessibility issues that exist on the e-learning page, using the source code.\n';
  prompt += '- Accessibility issues found by Axe shouldn\'t be mentioned again, but play into the later rating.\n';
  prompt += '- If Axe has not found accessibility issues with easy-to-find criteria (like color contrast or missing alt text for images), it\'s safe to say that there are no such issues.\n';
  prompt += '- Provide a concise analysis according to WCAG 2.2 standards.\n';
  prompt += '- Suggest improvements without recommending specific technologies or direct solutions.\n';
  prompt += '- Focus on areas that automated tools like Axe might miss, such as content clarity, user experience, and context.\n';
  prompt += '- Mention any accessibility violations you find in the context precisely.\n';
  prompt += '- Lastly, finish your response by giving the website a rating for each WCAG 2.2 POUR criteria, and the corresponding overall accessibility score ("A", "AA", "AAA").\n';
  prompt += '- Don\'t write a summary at the end. The less you have to write, the better.\n';

  return prompt;
}

// Helper function to truncate text to avoid exceeding token limits
function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '\n[Content truncated due to length]';
  }
  return text;
}


console.log('Background script loaded.');