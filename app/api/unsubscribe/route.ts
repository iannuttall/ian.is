import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { uuid } = await req.json()

  if (!uuid || typeof uuid !== 'string') {
    return NextResponse.json({ error: 'Subscriber UUID is required' }, { status: 400 })
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    return NextResponse.json({ error: 'Invalid UUID format' }, { status: 400 })
  }

  try {
    const listmonkUrl = process.env.LISTMONK_API_URL
    const apiUsername = process.env.LISTMONK_API_USERNAME
    const apiToken = process.env.LISTMONK_API_TOKEN

    if (!listmonkUrl || !apiUsername || !apiToken) {
      console.error('Missing Listmonk configuration')
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
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
      return NextResponse.json({ error: 'Failed to process unsubscribe request' }, { status: 500 })
    }

    const queryData = await queryResponse.json()
    const subscriber = queryData.data?.results?.[0]

    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
    }

    // Get all list IDs the subscriber is subscribed to
    const subscribedListIds = subscriber.lists
      ?.filter((list: { subscription_status: string }) => list.subscription_status === 'confirmed')
      ?.map((list: { id: number }) => list.id) || []

    if (subscribedListIds.length === 0) {
      return NextResponse.json({ message: 'Already unsubscribed' })
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
      return NextResponse.json({ error: 'Failed to process unsubscribe request' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Successfully unsubscribed from all lists',
      email: subscriber.email
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json({ error: 'Failed to process unsubscribe request' }, { status: 500 })
  }
}