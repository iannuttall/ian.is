import { NextResponse } from 'next/server';
import { fetchSheetData } from '../../../utils/fetchSheetData';

export async function POST() {
  try {
    const refreshedData = await fetchSheetData(true);
    return NextResponse.json({ message: 'Sheet data refreshed successfully', count: refreshedData.length });
  } catch (error) {
    console.error('Failed to refresh sheet data:', error);
    return NextResponse.json({ error: 'Failed to refresh sheet data' }, { status: 500 });
  }
}