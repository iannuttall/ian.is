import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Check for API key in Authorization header (optional)
  // This is YOUR app's API key to protect this endpoint, not the Ianslist API key
  const authHeader = req.headers.get('authorization')
  const apiKey = process.env.API_KEY // Your Next.js app's API key
  
  // Allow requests without API key for web form submissions
  // But require API key for external API calls
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const providedKey = authHeader.substring(7)
    if (apiKey && providedKey !== apiKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }
  }

  const { email, name } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  try {
    const ianslistUrl = process.env.IANSLIST_API_URL
    const ianslistApiKey = process.env.IANSLIST_API_KEY

    if (!ianslistUrl || !ianslistApiKey) {
      console.error('Missing Ianslist configuration')
      return NextResponse.json({ error: 'Newsletter service not configured' }, { status: 500 })
    }

    // Make request to Ianslist API
    const response = await fetch(`${ianslistUrl}/api/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ianslistApiKey
      },
      body: JSON.stringify({
        email,
        name: name || undefined,
        attributes: {
          source: 'ian.is',
          subscribed_at: new Date().toISOString()
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Ianslist API error:', data)
      return NextResponse.json({ 
        error: data.error || 'Failed to subscribe' 
      }, { status: response.status })
    }

    // Ianslist handles all these cases automatically:
    // - New subscriber: Creates and sends welcome email
    // - Existing active subscriber: Returns success with "You are already subscribed!" message
    // - Disabled subscriber: Re-enables and sends welcome email with "Welcome back!" message
    // - Blacklisted: Returns error

    return NextResponse.json({ 
      message: data.message || 'Successfully subscribed to newsletter',
      subscriber: data.subscriber
    })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ error: 'Failed to process subscription' }, { status: 500 })
  }
}