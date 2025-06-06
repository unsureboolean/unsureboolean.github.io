// openai-chat-debug-fixed.js - Enhanced debug version with user's credentials and fixes for non-responsive chat

// User's encrypted API key (pre-filled)
const ENCRYPTED_API_KEY = "AAJAAB4KWx91IBsDPikqU11rLF4gGy1XAUp4Ml0uXQsQWgR+EiEjMSQsQQVlJSUqBQEmfGFfKzpaQy1Va2dqPQICQQI/emAFJ14eQVsOCAYKLD1eMgAHWnR5ETkMRghIeH9kBBgsNhxTZnMEAgIrNVlUWwtKEDlYAEEIWnxREjsoQyYkfkJFF1orP10rYgYeBicARTsORARfHRBANR8mQGFdACg";

// The password used for decryption (pre-filled)
const AUTO_UNLOCK_PASSWORD = "simple123";

// Customizable OpenAI settings
const OPENAI_SETTINGS = {
  model: "gpt-4o", // User's preferred model
  temperature: 1.2, // Increased for more creative/less filtered responses
  max_tokens: 300, // Increased for longer responses
  presence_penalty: 0.8, // Increased to encourage novel content
  frequency_penalty: 0.5, // Added to reduce repetition
  timeout_ms: 60000 // 60 second timeout (increased from default)
};

// Debug flags
const DEBUG = {
  logApiCalls: true,
  logResponses: true,
  showDetailedErrors: true,
  trackTiming: true
};

// Function to decrypt the API key using a password
function decryptApiKey(password) {
    try {
        console.log("DEBUG: Starting decryption process");
        // Simple XOR encryption/decryption
        const encryptedBytes = atob(ENCRYPTED_API_KEY).split('').map(char => char.charCodeAt(0));
        const passwordBytes = Array.from(password).map(char => char.charCodeAt(0));
        
        let decrypted = "";
        for (let i = 0; i < encryptedBytes.length; i++) {
            const passwordChar = passwordBytes[i % passwordBytes.length];
            decrypted += String.fromCharCode(encryptedBytes[i] ^ passwordChar);
        }
        
        // Validate format without logging the full key
        const isValid = decrypted.startsWith('sk-');
        console.log(`DEBUG: Decryption ${isValid ? 'successful' : 'failed'}, key starts with: ${decrypted.substring(0, 5)}...`);
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

// Store the decrypted API key in memory (not localStorage for slightly better security)
let openaiApiKey = null;

// Function to initialize the OpenAI chat
function initOpenAIChat() {
    console.log("DEBUG: Initializing PersonaZoo chat");
    
    // Auto-unlock the chat using the predefined password
    const unlockResult = autoUnlockChat();
    console.log(`DEBUG: Auto-unlock result: ${unlockResult ? 'Success' : 'Failed'}`);
    
    // Hide the password container completely since we're auto-unlocking
    const apiKeyContainer = document.getElementById('api-key-container');
    if (apiKeyContainer) {
        apiKeyContainer.style.display = 'none'; // Hide completely instead of using the 'hidden' class
        console.log("DEBUG: API key container hidden");
    }
    
    // Show chat container
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
        chatContainer.classList.remove('hidden');
        console.log("DEBUG: Chat container revealed");
    }
    
    // Add event listeners for chat functionality
    setupChatEventListeners();
    
    console.log('DEBUG: PersonaZoo chat initialized with auto-unlock');
}

// Function to automatically unlock the chat
function autoUnlockChat() {
    console.log("DEBUG: Attempting auto-unlock with password");
    
    // Decrypt the API key using the predefined password
    const decrypted = decryptApiKey(AUTO_UNLOCK_PASSWORD);
    
    // Validate the decrypted key format
    if (decrypted && decrypted.startsWith('sk-')) {
        openaiApiKey = decrypted;
        console.log('DEBUG: Chat automatically unlocked, API key stored in memory');
        return true;
    } else {
        console.error('DEBUG: Auto-unlock failed: Invalid decryption result');
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

// Function to set up chat event listeners
function setupChatEventListeners() {
    console.log("DEBUG: Setting up chat event listeners");
    
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const personaSelect = document.getElementById('persona-select');
    const clearButton = document.getElementById('clear-button');
    
    if (sendButton) {
        sendButton.addEventListener('click', handleSendMessage);
        console.log("DEBUG: Send button event listener added");
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
        console.log("DEBUG: Message input event listener added");
    }
    
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                chatMessages.innerHTML = '';
                console.log("DEBUG: Chat messages cleared");
            }
        });
        console.log("DEBUG: Clear button event listener added");
    }
}

// Function to handle sending a message
async function handleSendMessage() {
    console.log("DEBUG: handleSendMessage called");
    
    const messageInput = document.getElementById('message-input');
    const personaSelect = document.getElementById('persona-select');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!messageInput || !personaSelect || !chatMessages) {
        console.error("DEBUG: Required DOM elements not found");
        return;
    }
    
    const message = messageInput.value.trim();
    if (!message) {
        console.log("DEBUG: Empty message, not sending");
        return;
    }
    
    const personaKey = personaSelect.value;
    console.log(`DEBUG: Sending message to persona: ${personaKey}`);
    
    // Add user message to chat
    const userMessageElement = document.createElement('div');
    userMessageElement.className = 'chat-message user-message bg-blue-100 p-3 rounded-lg mb-2 max-w-3/4 ml-auto';
    userMessageElement.innerHTML = `<p>${escapeHtml(message)}</p>`;
    chatMessages.appendChild(userMessageElement);
    
    // Clear input
    messageInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Create typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-message ai-message bg-gray-100 p-3 rounded-lg mb-2 max-w-3/4';
    typingIndicator.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessages.appendChild(typingIndicator);
    
    // Scroll to bottom again
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        console.log("DEBUG: Calling sendMessageToOpenAI");
        const startTime = DEBUG.trackTiming ? performance.now() : 0;
        
        // Send message to OpenAI with timeout handling
        const responsePromise = sendMessageToOpenAI(message, personaKey);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Request timed out")), OPENAI_SETTINGS.timeout_ms);
        });
        
        // Race between the API call and the timeout
        const response = await Promise.race([responsePromise, timeoutPromise]);
        
        if (DEBUG.trackTiming) {
            const endTime = performance.now();
            console.log(`DEBUG: API call completed in ${(endTime - startTime).toFixed(2)}ms`);
        }
        
        // Remove typing indicator
        chatMessages.removeChild(typingIndicator);
        
        if (response.success) {
            // Add AI response to chat
            const persona = window.personas[personaKey] || window.personas[window.defaultPersona];
            const aiMessageElement = document.createElement('div');
            aiMessageElement.className = `chat-message ai-message bg-${persona.color}-100 p-3 rounded-lg mb-2 max-w-3/4`;
            aiMessageElement.innerHTML = `
                <div class="flex items-center mb-1">
                    <i class="${persona.avatar} text-${persona.color}-500 mr-2"></i>
                    <span class="font-bold">${persona.nickname}</span>
                </div>
                <p>${escapeHtml(response.message).replace(/\n/g, '<br>')}</p>
            `;
            chatMessages.appendChild(aiMessageElement);
        } else {
            // Add error message
            const errorMessageElement = document.createElement('div');
            errorMessageElement.className = 'chat-message error-message bg-red-100 p-3 rounded-lg mb-2 max-w-3/4';
            errorMessageElement.innerHTML = `
                <div class="flex items-center mb-1">
                    <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <span class="font-bold">Error</span>
                </div>
                <p>${escapeHtml(response.message)}</p>
            `;
            chatMessages.appendChild(errorMessageElement);
        }
    } catch (error) {
        console.error("DEBUG: Error in handleSendMessage:", error);
        
        // Remove typing indicator
        chatMessages.removeChild(typingIndicator);
        
        // Add error message
        const errorMessageElement = document.createElement('div');
        errorMessageElement.className = 'chat-message error-message bg-red-100 p-3 rounded-lg mb-2 max-w-3/4';
        errorMessageElement.innerHTML = `
            <div class="flex items-center mb-1">
                <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                <span class="font-bold">Error</span>
            </div>
            <p>An error occurred: ${escapeHtml(error.message)}</p>
        `;
        chatMessages.appendChild(errorMessageElement);
    }
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
    if (DEBUG.logApiCalls) {
        console.log(`DEBUG: sendMessageToOpenAI called with persona: ${personaKey}`);
        console.log(`DEBUG: Using model: ${OPENAI_SETTINGS.model}`);
    }
    
    try {
        // Check if API key is available
        if (!openaiApiKey) {
            console.error("DEBUG: API key not available");
            // Try to auto-unlock again if the key is missing
            if (!autoUnlockChat()) {
                return {
                    success: false,
                    message: "Unable to access the chat. Please refresh the page or contact the site administrator."
                };
            }
        }
        
        // Get the selected persona
        const persona = window.personas[personaKey] || window.personas[window.defaultPersona];
        if (DEBUG.logApiCalls) {
            console.log(`DEBUG: Using persona: ${personaKey} (${persona.name})`);
        }
        
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
        
        if (DEBUG.logApiCalls) {
            console.log(`DEBUG: Conversation history length: ${conversationHistory.length}`);
            console.log("DEBUG: Last few messages:", conversationHistory.slice(-3));
        }
        
        // Make API request directly to OpenAI with customizable settings
        const requestBody = {
            model: OPENAI_SETTINGS.model,
            messages: conversationHistory,
            max_tokens: OPENAI_SETTINGS.max_tokens,
            temperature: OPENAI_SETTINGS.temperature,
            presence_penalty: OPENAI_SETTINGS.presence_penalty,
            frequency_penalty: OPENAI_SETTINGS.frequency_penalty
        };
        
        if (DEBUG.logApiCalls) {
            console.log("DEBUG: Request payload:", JSON.stringify(requestBody, null, 2));
            console.log("DEBUG: Attempting fetch to OpenAI API...");
        }
        
        const startTime = DEBUG.trackTiming ? performance.now() : 0;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (DEBUG.trackTiming) {
            const endTime = performance.now();
            console.log(`DEBUG: Fetch completed in ${(endTime - startTime).toFixed(2)}ms with status: ${response.status}`);
        }
        
        if (DEBUG.logResponses) {
            console.log(`DEBUG: Response status: ${response.status} ${response.statusText}`);
        }
        
        if (!response.ok) {
            let errorMessage = 'Failed to get response from API';
            try {
                const errorData = await response.json();
                if (DEBUG.showDetailedErrors) {
                    console.error('DEBUG: Error data from API:', errorData);
                }
                errorMessage = errorData.error?.message || errorMessage;
            } catch (e) {
                // If we can't parse the error as JSON, use the status text
                console.error('DEBUG: Could not parse error response as JSON:', e);
                errorMessage = `Error: ${response.status} ${response.statusText}`;
            }
            
            console.error('DEBUG: API Error:', errorMessage);
            return {
                success: false,
                message: `Error: ${errorMessage}`
            };
        }
        
        console.log('DEBUG: Parsing successful response...');
        const data = await response.json();
        
        if (DEBUG.logResponses) {
            console.log('DEBUG: Response parsed successfully:', data);
        }
        
        return {
            success: true,
            message: data.choices[0].message.content
        };
    } catch (error) {
        console.error('DEBUG: Error sending message:', error);
        
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

// Helper function to escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initOpenAIChat);

// Expose debug functions
window.debugOpenAI = {
    testConnection: async function() {
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`
                }
            });
            const data = await response.json();
            console.log('DEBUG: API connection test result:', data);
            return data;
        } catch (error) {
            console.error('DEBUG: API connection test error:', error);
            return { error: error.message };
        }
    },
    checkApiKey: function() {
        const key = openaiApiKey || null;
        if (key) {
            console.log(`DEBUG: API key is set and starts with: ${key.substring(0, 5)}...`);
            return true;
        } else {
            console.log('DEBUG: API key is not set');
            return false;
        }
    },
    reloadPersonas: function() {
        console.log('DEBUG: Current personas:', window.personas);
    }
};
