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
  live: boolean;
  acquired?: boolean;
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

  const rows = csvData.split('\n')
  const headers = parseCSVRow(rows[0]).map(header => header.toLowerCase())

  const links = rows.slice(1).map(row => {
    const values = parseCSVRow(row);
    const item: Partial<LinkItem> = {};

    headers.forEach((header, index) => {
      switch (header) {
        case 'type':
        case 'title':
        case 'description':
        case 'logo':
        case 'url':
        case 'bg_color':
        case 'text_color':
        case 'border_color':
        case 'hover_border_color':
          item[header] = values[index];
          break;
        case 'order':
          item.order = parseInt(values[index], 10);
          break;
        case 'live':
          item.live = values[index].toLowerCase() === 'true' || values[index] === '1';
          break;
        case 'acquired':
          item.acquired = values[index].toLowerCase() === 'true' || values[index] === '1';
          break;
      }
    });

    return item as LinkItem;
  }).sort((a, b) => a.order - b.order);

  const isProduction = process.env.NODE_ENV === 'production';
  const filteredLinks = isProduction ? links.filter(link => link.live) : links;

  cache.set(CACHE_KEY, filteredLinks);
  return filteredLinks;
}