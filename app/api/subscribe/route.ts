import { NextRequest, NextResponse } from 'next/server'

interface ListmonkSubscriber {
  email: string
  name?: string
  status: 'enabled' | 'disabled' | 'blocklisted'
  lists: number[]
  attribs?: Record<string, unknown>
  preconfirm_subscriptions?: boolean
}

export async function POST(req: NextRequest) {
  // Check for API key in Authorization header
  const authHeader = req.headers.get('authorization')
  const apiKey = process.env.API_KEY
  
  // Allow requests without API key for web form submissions
  // But require API key for external API calls
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const providedKey = authHeader.substring(7)
    if (apiKey && providedKey !== apiKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }
  }

  const { email, name, list_ids, send_welcome = true } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  try {
    const listmonkUrl = process.env.LISTMONK_API_URL
    const apiUsername = process.env.LISTMONK_API_USERNAME
    const apiToken = process.env.LISTMONK_API_TOKEN
    const defaultListIds = process.env.LISTMONK_LIST_IDS

    if (!listmonkUrl || !apiUsername || !apiToken) {
      console.error('Missing Listmonk configuration')
      return NextResponse.json({ error: 'Newsletter service not configured' }, { status: 500 })
    }

    // Use provided list_ids or fall back to env variable
    const listIdsSource = list_ids || defaultListIds
    if (!listIdsSource) {
      return NextResponse.json({ error: 'No list IDs provided' }, { status: 400 })
    }

    // Parse list IDs (handle both array and comma-separated string)
    const lists = Array.isArray(listIdsSource) 
      ? listIdsSource.filter((id: unknown) => !isNaN(Number(id))).map(Number)
      : listIdsSource.split(',').map((id: string) => parseInt(id.trim(), 10)).filter((id: number) => !isNaN(id))
    
    if (lists.length === 0) {
      console.error('No valid list IDs configured')
      return NextResponse.json({ error: 'Newsletter service not configured' }, { status: 500 })
    }

    // Create subscriber object
    const subscriber: ListmonkSubscriber = {
      email,
      name: name || email.split('@')[0], // Use email prefix as name if not provided
      status: 'enabled',
      lists,
      preconfirm_subscriptions: true // Skip double opt-in if you want
    }

    // Make request to Listmonk API
    const response = await fetch(`${listmonkUrl}/api/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${apiUsername}:${apiToken}`
      },
      body: JSON.stringify(subscriber)
    })

    const data = await response.json()
    let isNewSubscriber = false
    let subscriberUuid = ''

    if (!response.ok) {
      // Handle specific Listmonk errors
      if (response.status === 409 || data.message?.includes('already exists')) {
        // Subscriber already exists - get their details first
        // Query by email - need to escape single quotes in the email for SQL
        const escapedEmail = email.replace(/'/g, "''")
        const query = `subscribers.email = '${escapedEmail}'`
        
        const queryResponse = await fetch(
          `${listmonkUrl}/api/subscribers?query=${encodeURIComponent(query)}`,
          {
            headers: {
              'Authorization': `token ${apiUsername}:${apiToken}`
            }
          }
        )
        
        let subscriberId: number | null = null
        
        if (queryResponse.ok) {
          const queryData = await queryResponse.json()
          
          if (queryData.data?.results?.length > 0) {
            const subscriber = queryData.data.results[0]
            subscriberUuid = subscriber.uuid
            subscriberId = subscriber.id
            
            // Check if they're currently unsubscribed from all lists
            const wasUnsubscribed = subscriber.lists?.every((list: { subscription_status: string }) => 
              list.subscription_status === 'unsubscribed'
            ) || subscriber.lists?.length === 0
            
            // If they were fully unsubscribed and are resubscribing, this is like a new subscriber
            if (wasUnsubscribed) {
              isNewSubscriber = true
            }
          }
        }

        if (!subscriberId) {
          console.error('Could not find subscriber ID for email:', email)
          return NextResponse.json({ error: 'Failed to process subscription' }, { status: 500 })
        }

        // Update their lists using the subscriber ID
        const updateResponse = await fetch(`${listmonkUrl}/api/subscribers/lists`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${apiUsername}:${apiToken}`
          },
          body: JSON.stringify({
            ids: [subscriberId],
            action: 'add',
            target_list_ids: lists,
            status: 'confirmed'
          })
        })

        if (updateResponse.ok) {
          return NextResponse.json({ 
            message: 'Successfully subscribed to newsletter',
            status: 'updated',
            uuid: subscriberUuid,
            is_new: isNewSubscriber
          })
        }
      }
      
      console.error('Listmonk API error:', data)
      return NextResponse.json({ 
        error: data.message || 'Failed to subscribe' 
      }, { status: response.status })
    }

    // New subscriber created successfully
    isNewSubscriber = true
    subscriberUuid = data.data?.uuid || ''

    // Send welcome email if enabled and subscriber is new
    if (send_welcome && isNewSubscriber && subscriberUuid) {
      const welcomeTemplateId = process.env.LISTMONK_WELCOME_TEMPLATE_ID
      
      if (welcomeTemplateId) {
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_URL || req.headers.get('origin')}/unsubscribe?uuid=${subscriberUuid}`
        
        try {
          const txResponse = await fetch(`${listmonkUrl}/api/tx`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `token ${apiUsername}:${apiToken}`
            },
            body: JSON.stringify({
              subscriber_email: email,
              template_id: parseInt(welcomeTemplateId, 10),
              data: {
                unsubscribe_url: unsubscribeUrl,
                name: name || email.split('@')[0]
              },
              content_type: 'html'
            })
          })
          
          const txData = await txResponse.json()
          
          if (!txResponse.ok) {
            console.error('Welcome email API error:', txResponse.status, txData)
          }
        } catch (err) {
          console.error('Failed to send welcome email:', err)
        }
      }
    }

    return NextResponse.json({ 
      message: 'Successfully subscribed to newsletter',
      status: 'created',
      uuid: subscriberUuid
    })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ error: 'Failed to process subscription' }, { status: 500 })
  }
}