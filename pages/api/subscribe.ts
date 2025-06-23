import type { NextApiRequest, NextApiResponse } from 'next'

interface ListmonkSubscriber {
  email: string
  name?: string
  status: 'enabled' | 'disabled' | 'blocklisted'
  lists: number[]
  attribs?: Record<string, any>
  preconfirm_subscriptions?: boolean
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, name, list_ids, send_welcome = true } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  try {
    const listmonkUrl = process.env.LISTMONK_API_URL
    const apiUsername = process.env.LISTMONK_API_USERNAME
    const apiToken = process.env.LISTMONK_API_TOKEN
    const defaultListIds = process.env.LISTMONK_LIST_IDS

    if (!listmonkUrl || !apiUsername || !apiToken) {
      console.error('Missing Listmonk configuration')
      return res.status(500).json({ error: 'Newsletter service not configured' })
    }

    // Use provided list_ids or fall back to env variable
    const listIdsSource = list_ids || defaultListIds
    if (!listIdsSource) {
      return res.status(400).json({ error: 'No list IDs provided' })
    }

    // Parse list IDs (handle both array and comma-separated string)
    const lists = Array.isArray(listIdsSource) 
      ? listIdsSource.filter(id => !isNaN(Number(id))).map(Number)
      : listIdsSource.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
    
    if (lists.length === 0) {
      console.error('No valid list IDs configured')
      return res.status(500).json({ error: 'Newsletter service not configured' })
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
            const wasUnsubscribed = subscriber.lists?.every((list: any) => 
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
          return res.status(500).json({ error: 'Failed to process subscription' })
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
          return res.status(200).json({ 
            message: 'Successfully subscribed to newsletter',
            status: 'updated',
            uuid: subscriberUuid,
            is_new: isNewSubscriber
          })
        }
      }
      
      console.error('Listmonk API error:', data)
      return res.status(response.status).json({ 
        error: data.message || 'Failed to subscribe' 
      })
    }

    // New subscriber created successfully
    isNewSubscriber = true
    subscriberUuid = data.data?.uuid || ''

    // Send welcome email if enabled and subscriber is new
    if (send_welcome && isNewSubscriber && subscriberUuid) {
      const welcomeTemplateId = process.env.LISTMONK_WELCOME_TEMPLATE_ID
      
      if (welcomeTemplateId) {
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_URL || req.headers.origin}/unsubscribe?uuid=${subscriberUuid}`
        
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

    res.status(200).json({ 
      message: 'Successfully subscribed to newsletter',
      status: 'created',
      uuid: subscriberUuid
    })
  } catch (error) {
    console.error('Subscription error:', error)
    res.status(500).json({ error: 'Failed to process subscription' })
  }
}