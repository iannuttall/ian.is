import NodeCache from 'node-cache';

export interface LinkItem {
  type: string;
  title: string;
  description: string;
  logo: string;
  url: string;
  order: number;
  bg_color?: string;
  text_color?: string;
  border_color?: string;
  hover_border_color?: string;
}

const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours
const CACHE_KEY = 'sheetData';

function parseCSVRow(row: string): string[] {
  const fields = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    if (row[i] === '"') {
      inQuotes = !inQuotes;
    } else if (row[i] === ',' && !inQuotes) {
      fields.push(field.trim());
      field = '';
    } else {
      field += row[i];
    }
  }
  fields.push(field.trim());

  return fields.map(f => f.replace(/^"|"$/g, ''));
}

export async function fetchSheetData(forceFetch: boolean = false): Promise<LinkItem[]> {
  if (!forceFetch) {
    const cachedData = cache.get<LinkItem[]>(CACHE_KEY);
    if (cachedData) {
      return cachedData;
    }
  }

  const SHEET_ID = '1EsAlWXoij5LMFDC56mi-rmCAkotzTjEUXv52DNAyCzI'
  const GID = '0'
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?gid=${GID}&format=csv&_cb=${Date.now()}`

  const response = await fetch(url)
  const csvData = await response.text()

  const rows = csvData.split('\n').slice(1) // Remove header row
  const links = rows.map(row => {
    const [type, title, description, logo, url, order, bg_color, text_color, border_color, hover_border_color] = parseCSVRow(row);
    return { 
      type, 
      title, 
      description, 
      logo, 
      url, 
      order: parseInt(order, 10),
      bg_color,
      text_color,
      border_color,
      hover_border_color
    }
  }).sort((a, b) => a.order - b.order)

  cache.set(CACHE_KEY, links);
  return links;
}