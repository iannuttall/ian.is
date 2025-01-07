import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    // The actual subscription will be handled client-side by Bento
    res.status(200).json({ message: 'Subscribed successfully' })
  } catch (error) {
    console.error('Subscription error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}