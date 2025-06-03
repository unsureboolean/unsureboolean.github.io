// openai-chat-customized.js - Handles OpenAI API integration for PersonaZoo with encrypted API key, auto-unlock, and customizable model/moderation

// Encrypted API key (will be replaced with your encrypted key)
const ENCRYPTED_API_KEY = "AAJAAB4KWx91IBsDPikqU11rLF4gGy1XAUp4Ml0uXQsQWgR+EiEjMSQsQQVlJSUqBQEmfGFfKzpaQy1Va2dqPQICQQI/emAFJ14eQVsOCAYKLD1eMgAHWnR5ETkMRghIeH9kBBgsNhxTZnMEAgIrNVlUWwtKEDlYAEEIWnxREjsoQyYkfkJFF1orP10rYgYeBicARTsORARfHRBANR8mQGFdACg=";

// The password used for decryption (this should match what you used for encryption)
const AUTO_UNLOCK_PASSWORD = "simple123"; // Replace with your actual password

// Customizable OpenAI settings
const OPENAI_SETTINGS = {
  model: "gpt-4", // Options: "gpt-3.5-turbo", "gpt-4", "gpt-4-turbo", "gpt-4o"
  temperature: 1.0, // Range: 0.0 to 2.0 (higher = more creative/random)
  max_tokens: 250, // Maximum length of response
  // safe_prompt: false, // Set to false to reduce some safety measures
  presence_penalty: 0.6, // Range: -2.0 to 2.0 (positive values encourage new topics)
  frequency_penalty: 0.0 // Range: -2.0 to 2.0 (positive values discourage repetition)
};

// Function to decrypt the API key using a password
function decryptApiKey(password) {
    try {
        // Simple XOR encryption/decryption
        const encryptedBytes = atob(ENCRYPTED_API_KEY).split('').map(char => char.charCodeAt(0));
        const passwordBytes = Array.from(password).map(char => char.charCodeAt(0));
        
        let decrypted = "";
        for (let i = 0; i < encryptedBytes.length; i++) {
            const passwordChar = passwordBytes[i % passwordBytes.length];
            decrypted += String.fromCharCode(encryptedBytes[i] ^ passwordChar);
        }
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

// Function to encrypt an API key (for setup purposes)
function encryptApiKey(apiKey, password) {
    try {
        const apiKeyBytes = Array.from(apiKey).map(char => char.charCodeAt(0));
        const passwordBytes = Array.from(password).map(char => char.charCodeAt(0));
        
        let encrypted = [];
        for (let i = 0; i < apiKeyBytes.length; i++) {
            const passwordChar = passwordBytes[i % passwordBytes.length];
            encrypted.push(apiKeyBytes[i] ^ passwordChar);
        }
        
        return btoa(String.fromCharCode(...encrypted));
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
}

// Store the decrypted API key in memory (not localStorage for slightly better security)
let openaiApiKey = null;

// Function to initialize the OpenAI chat
function initOpenAIChat() {
    // Auto-unlock the chat using the predefined password
    autoUnlockChat();
    
    // Hide the password container completely since we're auto-unlocking
    const apiKeyContainer = document.getElementById('api-key-container');
    if (apiKeyContainer) {
        apiKeyContainer.style.display = 'none'; // Hide completely instead of using the 'hidden' class
    }
    
    // Show chat container
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
        chatContainer.classList.remove('hidden');
    }
    
    console.log('PersonaZoo chat initialized with auto-unlock');
}

// Function to automatically unlock the chat
function autoUnlockChat() {
    // Decrypt the API key using the predefined password
    const decrypted = decryptApiKey(AUTO_UNLOCK_PASSWORD);
    
    // Validate the decrypted key format
    if (decrypted && decrypted.startsWith('sk-')) {
        openaiApiKey = decrypted;
        console.log('Chat automatically unlocked');
        return true;
    } else {
        console.error('Auto-unlock failed: Invalid decryption result');
        // If auto-unlock fails, we could show an error message or fall back to manual password entry
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong class="font-bold">Error!</strong>
                    <span class="block sm:inline"> Unable to initialize chat. Please contact the site administrator.</span>
                </div>
            `;
        }
        return false;
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

// Function to send message to OpenAI API directly
async function sendMessageToOpenAI(message, personaKey) {
    try {
        // Check if API key is available
        if (!openaiApiKey) {
            // Try to auto-unlock again if the key is missing
            if (!autoUnlockChat()) {
                return {
                    success: false,
                    message: "Unable to access the chat. Please refresh the page or contact the site administrator."
                };
            }
        }
        
        console.log('Preparing to send message to OpenAI API');
        
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
        
        console.log('Sending request to OpenAI API with conversation history length:', conversationHistory.length);
        
        // Make API request directly to OpenAI with customizable settings
        const requestBody = {
            model: OPENAI_SETTINGS.model,
            messages: conversationHistory,
            max_tokens: OPENAI_SETTINGS.max_tokens,
            temperature: OPENAI_SETTINGS.temperature,
            presence_penalty: OPENAI_SETTINGS.presence_penalty,
            frequency_penalty: OPENAI_SETTINGS.frequency_penalty,
            // safe_prompt: OPENAI_SETTINGS.safe_prompt
        };
        
        console.log('Request payload prepared, attempting fetch...');
        
        // Add a timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId); // Clear the timeout
        
        console.log('Response received from OpenAI API:', response.status, response.statusText);
        
        if (!response.ok) {
            let errorMessage = 'Failed to get response from API';
            try {
                const errorData = await response.json();
                console.error('Error data from API:', errorData);
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
            errorMessage = 'Request timed out. The API may be taking too long to respond.';
        } else if (error.name === 'TypeError' && errorMessage.includes('Failed to fetch')) {
            errorMessage = 'Network error. Please check your internet connection.';
        }
        
        return {
            success: false,
            message: `Network Error: ${errorMessage}. Please check your connection and try again.`
        };
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initOpenAIChat);

// Expose the encryption function for setup (will be removed in production)
window.encryptApiKey = encryptApiKey;
