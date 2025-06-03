// openai-chat-encrypted-debug.js - Enhanced debugging version for troubleshooting password issues

// Encrypted API key (will be replaced with your encrypted key)
const ENCRYPTED_API_KEY = "AAJAAB4KWx9KFw8uEilSe2BxXgAsBlwQRVRUHiwOBQ4TVnADJg1VB1hcAAJVIDwnKQAUX0d1NDwyNTw/W11QNwILMzpWQ2MAHj0hNTgrVX9EKT1eMgAHWnR5FVpYNic3ewZQBx4bXTQmUHF9BBMHMRoxaEADRgcjSQgQaW1SOx88ESk6d0ZYITgIAAkoBlhbCjE9BDYVcGdAXgssRy5UeXN1HCg=";

// Function to decrypt the API key using a password with detailed logging
function decryptApiKey(password) {
    try {
        console.log("Starting decryption process...");
        console.log("Password length:", password.length);
        console.log("Encrypted key:", ENCRYPTED_API_KEY);
        
        // Check if encrypted key has been replaced
        if (ENCRYPTED_API_KEY === "REPLACE_WITH_YOUR_ENCRYPTED_API_KEY") {
            console.error("ERROR: You need to replace the placeholder with your actual encrypted API key");
            return null;
        }
        
        // Simple XOR encryption/decryption with logging
        try {
            const encryptedBytes = atob(ENCRYPTED_API_KEY).split('').map(char => char.charCodeAt(0));
            console.log("Successfully decoded Base64 encrypted key");
            console.log("Decoded length:", encryptedBytes.length);
            
            const passwordBytes = Array.from(password).map(char => char.charCodeAt(0));
            console.log("Password bytes length:", passwordBytes.length);
            
            let decrypted = "";
            for (let i = 0; i < encryptedBytes.length; i++) {
                const passwordChar = passwordBytes[i % passwordBytes.length];
                decrypted += String.fromCharCode(encryptedBytes[i] ^ passwordChar);
            }
            
            console.log("Decryption completed");
            console.log("Decrypted key starts with:", decrypted.substring(0, 5) + "...");
            
            // Validate the key format (should start with "sk-")
            if (decrypted.startsWith("sk-")) {
                console.log("Decryption SUCCESSFUL - key has correct format");
                return decrypted;
            } else {
                console.error("Decryption produced invalid key format (doesn't start with 'sk-')");
                console.log("This usually means the password is incorrect");
                return null;
            }
        } catch (base64Error) {
            console.error("Base64 decoding error:", base64Error);
            console.log("This usually means the encrypted key is malformed");
            return null;
        }
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

// Function to encrypt an API key (for setup purposes) with detailed logging
function encryptApiKey(apiKey, password) {
    try {
        console.log("Starting encryption process...");
        console.log("API key length:", apiKey.length);
        console.log("Password length:", password.length);
        
        // Validate API key format
        if (!apiKey.startsWith("sk-")) {
            console.warn("Warning: API key doesn't start with 'sk-', which is unusual for OpenAI keys");
        }
        
        const apiKeyBytes = Array.from(apiKey).map(char => char.charCodeAt(0));
        const passwordBytes = Array.from(password).map(char => char.charCodeAt(0));
        
        let encrypted = [];
        for (let i = 0; i < apiKeyBytes.length; i++) {
            const passwordChar = passwordBytes[i % passwordBytes.length];
            encrypted.push(apiKeyBytes[i] ^ passwordChar);
        }
        
        const result = btoa(String.fromCharCode(...encrypted));
        console.log("Encryption completed");
        console.log("Encrypted key:", result);
        
        // Test decryption to verify
        console.log("Verifying encryption with test decryption...");
        const testDecrypt = decryptApiKey(password);
        if (testDecrypt === apiKey) {
            console.log("Verification SUCCESSFUL - encryption/decryption works correctly");
        } else {
            console.error("Verification FAILED - decrypted key doesn't match original");
        }
        
        return result;
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
}

// Store the decrypted API key in memory (not localStorage for slightly better security)
let openaiApiKey = null;

// Function to initialize the OpenAI chat
function initOpenAIChat() {
    console.log("Initializing PersonaZoo chat with encrypted API key");
    
    // Set up the password input UI
    const apiKeyContainer = document.getElementById('api-key-container');
    const chatContainer = document.getElementById('chat-container');
    const passwordInput = document.getElementById('password-input');
    const unlockButton = document.getElementById('unlock-button');
    const passwordStatus = document.getElementById('password-status');
    
    if (apiKeyContainer && chatContainer) {
        console.log("Found UI containers, setting up password entry");
        
        // Show password input, hide chat initially
        apiKeyContainer.classList.remove('hidden');
        chatContainer.classList.add('hidden');
        
        // Set up unlock button
        if (unlockButton && passwordInput) {
            unlockButton.addEventListener('click', function() {
                const password = passwordInput.value.trim();
                console.log("Unlock button clicked, password length:", password.length);
                
                if (password) {
                    // Try to decrypt the API key
                    const decrypted = decryptApiKey(password);
                    
                    // Validate the decrypted key format
                    if (decrypted && decrypted.startsWith('sk-')) {
                        console.log("Password accepted, chat unlocked");
                        openaiApiKey = decrypted;
                        passwordStatus.textContent = 'Unlocked successfully!';
                        passwordStatus.className = 'text-green-600 text-sm mt-1';
                        
                        // Show chat interface
                        apiKeyContainer.classList.add('hidden');
                        chatContainer.classList.remove('hidden');
                    } else {
                        console.log("Password rejected, decryption failed");
                        passwordStatus.textContent = 'Incorrect password';
                        passwordStatus.className = 'text-red-600 text-sm mt-1';
                    }
                } else {
                    console.log("Empty password entered");
                    passwordStatus.textContent = 'Please enter a password';
                    passwordStatus.className = 'text-red-600 text-sm mt-1';
                }
            });
            
            // Allow Enter key to submit
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    console.log("Enter key pressed in password field");
                    unlockButton.click();
                }
            });
            
            console.log("Password entry UI setup complete");
        } else {
            console.error("Could not find password input or unlock button");
        }
    } else {
        console.error("Could not find required UI containers");
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
            console.error("API key not unlocked");
            return {
                success: false,
                message: "API key not unlocked. Please enter the password to unlock."
            };
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
        
        // Make API request directly to OpenAI
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

// Add a test function to help with debugging
window.testEncryption = function(apiKey, password) {
    console.log("=== ENCRYPTION TEST ===");
    const encrypted = encryptApiKey(apiKey, password);
    console.log("Original API key:", apiKey);
    console.log("Password:", password);
    console.log("Encrypted result:", encrypted);
    console.log("=== TEST COMPLETE ===");
    return encrypted;
};

// Add a helper function to check if the current encrypted key works with a given password
window.testCurrentKey = function(password) {
    console.log("=== TESTING CURRENT KEY ===");
    console.log("Current encrypted key:", ENCRYPTED_API_KEY);
    console.log("Testing with password:", password);
    const decrypted = decryptApiKey(password);
    if (decrypted && decrypted.startsWith('sk-')) {
        console.log("SUCCESS: Password works with current encrypted key");
        console.log("Decrypted key:", decrypted);
    } else {
        console.log("FAILURE: Password does not work with current encrypted key");
    }
    console.log("=== TEST COMPLETE ===");
    return decrypted;
};
