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
        // Get the selected persona
        const persona = window.personas[personaKey] || window.personas[window.defaultPersona];
        
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
        
        // Make API request to Cloudflare Worker instead of directly to OpenAI
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: conversationHistory,
                max_tokens: 150,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            return {
                success: false,
                message: `Error: ${errorData.error?.message || 'Failed to get response from API'}`
            };
        }
        
        const data = await response.json();
        return {
            success: true,
            message: data.choices[0].message.content
        };
    } catch (error) {
        console.error('Error sending message:', error);
        return {
            success: false,
            message: `Error: ${error.message}`
        };
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initOpenAIChat);
