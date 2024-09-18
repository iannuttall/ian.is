import { NextApiRequest, NextApiResponse } from 'next';
import { fetchSheetData } from '../../utils/fetchSheetData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const refreshedData = await fetchSheetData(true);
    res.status(200).json({ message: 'Sheet data refreshed successfully', count: refreshedData.length });
  } catch (error) {
    console.error('Failed to refresh sheet data:', error);
    res.status(500).json({ error: 'Failed to refresh sheet data' });
  }
}