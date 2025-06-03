// openai-chat.js - Handles OpenAI API integration for the PersonaZoo chat via Cloudflare Worker

// Configuration for API requests
const WORKER_URL = 'https://your-worker-subdomain.workers.dev'; // Replace with your actual Cloudflare Worker URL

// Function to initialize the OpenAI chat
function initOpenAIChat() {
    // Chat container should be visible by default
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
        chatContainer.classList.remove('hidden');
    }
    
    // Hide API key container as it's no longer needed
    const apiKeyContainer = document.getElementById('api-key-container');
    if (apiKeyContainer) {
        apiKeyContainer.classList.add('hidden');
    }
    
    // Log initialization for debugging
    console.log('PersonaZoo chat initialized, using worker URL:', WORKER_URL);
}

// Function to sanitize username for OpenAI API
function sanitizeUsername(username) {
    // Remove any characters that don't match the pattern ^[a-zA-Z0-9_-]+$
    let sanitized = username.replace(/[^a-zA-Z0-9_-]/g, '');
    
    // If sanitized is empty, use a fallback
    if (!sanitized) {
        sanitized = 'user_' + Math.floor(Math.random() * 1000);
    }
    
    return sanitized;
}

// Function to send message to OpenAI API via Cloudflare Worker
async function sendMessageToOpenAI(message, personaKey) {
    try {
        console.log('Preparing to send message to worker at:', WORKER_URL);
        
        // Get the selected persona
        const persona = window.personas[personaKey] || window.personas[window.defaultPersona];
        console.log('Using persona:', personaKey);
        
        // Get conversation history
        const chatMessages = document.querySelectorAll('.chat-message');
        let conversationHistory = [];
        
        // Add system message with persona's system prompt
        conversationHistory.push({
            role: "system",
            content: persona.system_prompt
        });
        
        // Add previous messages (up to 10 most recent)
        const maxPreviousMessages = 10;
        const startIdx = Math.max(0, chatMessages.length - maxPreviousMessages);
        
        for (let i = startIdx; i < chatMessages.length; i++) {
            const msgElement = chatMessages[i];
            const isUser = msgElement.classList.contains('user-message');
            const textElement = msgElement.querySelector('p');
            
            if (textElement) {
                conversationHistory.push({
                    role: isUser ? "user" : "assistant",
                    content: textElement.textContent
                });
            }
        }
        
        // Add current user message
        conversationHistory.push({
            role: "user",
            content: message
        });
        
        console.log('Sending request to worker with conversation history length:', conversationHistory.length);
        
        // Make API request to Cloudflare Worker
        const requestBody = {
            model: "gpt-3.5-turbo",
            messages: conversationHistory,
            max_tokens: 150,
            temperature: 0.7
        };
        
        console.log('Request payload prepared, attempting fetch...');
        
        // Add a timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId); // Clear the timeout
        
        console.log('Response received from worker:', response.status, response.statusText);
        
        if (!response.ok) {
            let errorMessage = 'Failed to get response from API';
            try {
                const errorData = await response.json();
                console.error('Error data from worker:', errorData);
                errorMessage = errorData.error?.message || errorMessage;
            } catch (e) {
                // If we can't parse the error as JSON, use the status text
                console.error('Could not parse error response as JSON:', e);
                errorMessage = `Error: ${response.status} ${response.statusText}`;
            }
            
            console.error('API Error:', errorMessage);
            return {
                success: false,
                message: `Error: ${errorMessage}`
            };
        }
        
        console.log('Parsing successful response...');
        const data = await response.json();
        console.log('Response parsed successfully');
        
        return {
            success: true,
            message: data.choices[0].message.content
        };
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Provide more detailed error information
        let errorMessage = error.message;
        
        // Check for specific error types
        if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. The worker may be taking too long to respond.';
        } else if (error.name === 'TypeError' && errorMessage.includes('Failed to fetch')) {
            errorMessage = 'Network error. Please check that the worker URL is correct and the worker is deployed.';
        }
        
        return {
            success: false,
            message: `Network Error: ${errorMessage}. Please check your connection and try again.`
        };
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initOpenAIChat);
