// Cloudflare Worker script for proxying OpenAI API requests
// This allows us to keep the API key secure in environment variables

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Log request details for debugging
  console.log('Worker received request:', request.method, request.url)
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleCORS()
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    // Get the OpenAI API key from environment variables
    const openaiApiKey = OPENAI_API_KEY // This is set in the Cloudflare Worker environment variables
    
    if (!openaiApiKey) {
      console.error('API key not configured in environment variables')
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
    let requestData
    try {
      requestData = await request.json()
      console.log('Request data parsed successfully')
    } catch (parseError) {
      console.error('Error parsing request JSON:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      )
    }

    // Forward the request to OpenAI API
    console.log('Forwarding request to OpenAI API')
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
    console.log('Received response from OpenAI API:', openaiResponse.status)

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
    console.error('Worker error:', error)
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
// Allow requests from jefftuel.com specifically
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Change to 'https://jefftuel.com' for production
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
}

// Handle CORS preflight requests
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  })
}
