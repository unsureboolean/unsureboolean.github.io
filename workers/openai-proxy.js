// Cloudflare Worker script for proxying OpenAI API requests
// This allows us to keep the API key secure in environment variables

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleCORS(request)
  }

  try {
    // Get the OpenAI API key from environment variables
    const openaiApiKey = process.env.OPENAI_API_KEY
    
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
      )
    }

    // Parse the request body
    const requestData = await request.json()

    // Forward the request to OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify(requestData)
    })

    // Get the response from OpenAI
    const openaiData = await openaiResponse.json()

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
    )
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
    )
  }
}

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

// Handle CORS preflight requests
function handleCORS(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  })
}
