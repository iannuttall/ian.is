import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { uuid } = req.body

  if (!uuid || typeof uuid !== 'string') {
    return res.status(400).json({ error: 'Subscriber UUID is required' })
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    return res.status(400).json({ error: 'Invalid UUID format' })
  }

  try {
    const listmonkUrl = process.env.LISTMONK_API_URL
    const apiUsername = process.env.LISTMONK_API_USERNAME
    const apiToken = process.env.LISTMONK_API_TOKEN

    if (!listmonkUrl || !apiUsername || !apiToken) {
      console.error('Missing Listmonk configuration')
      return res.status(500).json({ error: 'Service not configured' })
    }

    // Get subscriber details by UUID
    const queryResponse = await fetch(
      `${listmonkUrl}/api/subscribers?query=subscribers.uuid = '${uuid}'`,
      {
        headers: {
          'Authorization': `token ${apiUsername}:${apiToken}`
        }
      }
    )

    if (!queryResponse.ok) {
      console.error('Failed to query subscriber')
      return res.status(500).json({ error: 'Failed to process unsubscribe request' })
    }

    const queryData = await queryResponse.json()
    const subscriber = queryData.data?.results?.[0]

    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' })
    }

    // Get all list IDs the subscriber is subscribed to
    const subscribedListIds = subscriber.lists
      ?.filter((list: any) => list.subscription_status === 'confirmed')
      ?.map((list: any) => list.id) || []

    if (subscribedListIds.length === 0) {
      return res.status(200).json({ message: 'Already unsubscribed' })
    }

    // Unsubscribe from all lists
    const unsubscribeResponse = await fetch(`${listmonkUrl}/api/subscribers/lists`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${apiUsername}:${apiToken}`
      },
      body: JSON.stringify({
        ids: [subscriber.id],
        action: 'unsubscribe',
        target_list_ids: subscribedListIds
      })
    })

    if (!unsubscribeResponse.ok) {
      console.error('Failed to unsubscribe')
      return res.status(500).json({ error: 'Failed to process unsubscribe request' })
    }

    res.status(200).json({ 
      message: 'Successfully unsubscribed from all lists',
      email: subscriber.email
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    res.status(500).json({ error: 'Failed to process unsubscribe request' })
  }
}