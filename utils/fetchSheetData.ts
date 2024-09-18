export interface LinkItem {
  type: string;
  title: string;
  description: string;
  logo: string;
  url: string;
  order: number;
}

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

export async function fetchSheetData(): Promise<LinkItem[]> {
  const SHEET_ID = '1EsAlWXoij5LMFDC56mi-rmCAkotzTjEUXv52DNAyCzI'
  const GID = '0'
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?gid=${GID}&format=csv&_cb=${Date.now()}`

  const response = await fetch(url)
  const csvData = await response.text()

  const rows = csvData.split('\n').slice(1) // Remove header row
  const links = rows.map(row => {
    const [type, title, description, logo, url, order] = parseCSVRow(row);
    return { type, title, description, logo, url, order: parseInt(order, 10) }
  }).sort((a, b) => a.order - b.order)

  return links
}