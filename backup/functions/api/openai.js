// Cloudflare Pages Function for proxying OpenAI API requests
// This allows us to keep the API key secure in environment variables

export async function onRequest(context) {
  // Get the request object
  const request = context.request;
  
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleCORS();
  }

  try {
    // Get the OpenAI API key from environment variables
    // Replace this with your actual API key in Cloudflare Pages environment variables
    const openaiApiKey = context.env.OPENAI_API_KEY || 'sk-FAKE1234567890EXAMPLEAPIKEY';
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Parse the request body
    const requestData = await request.json();

    // Forward the request to OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify(requestData)
    });

    // Get the response from OpenAI
    const openaiData = await openaiResponse.json();

    // Return the response to the client
    return new Response(
      JSON.stringify(openaiData),
      {
        status: openaiResponse.status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
}

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Handle CORS preflight requests
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
