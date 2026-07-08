export interface IssueSection {
  type: string
  attrs: Record<string, string>
  body: string
  items: string[]
}

export interface IssueLinkItem {
  title: string
  url: string
  tagline: string
  description: string
}

export const issueSectionTypes = [
  'hero',
  'header',
  'lead',
  'text',
  'links',
  'sponsor',
  'box',
  'classifieds',
  'quote',
  'poll',
  'footer',
] as const

const directiveStart = /^:::\s*([a-z][\w-]*)\s*(.*)$/
const directiveEnd = /^:::\s*$/
const attrPattern = /([\w-]+)="([^"]*)"/g
const itemDivider = /^---\s*$/
const codeFence = /^(```|~~~)/

export function parseIssueSections(markdown: string): IssueSection[] {
  const sections: IssueSection[] = []
  const proseLines: string[] = []
  let current: { type: string; attrs: Record<string, string>; lines: string[] } | null =
    null
  let inCodeFence = false

  const flushProse = () => {
    const body = proseLines.join('\n').trim()
    proseLines.length = 0
    if (body) sections.push(makeSection('text', {}, body))
  }

  for (const line of markdown.split(/\r?\n/)) {
    if (codeFence.test(line.trim())) inCodeFence = !inCodeFence
    if (!inCodeFence) {
      if (current && directiveEnd.test(line)) {
        sections.push(
          makeSection(current.type, current.attrs, current.lines.join('\n').trim()),
        )
        current = null
        continue
      }
      const start: RegExpMatchArray | null = current ? null : line.match(directiveStart)
      if (start && !directiveEnd.test(line)) {
        flushProse()
        current = {
          type: start[1] ?? 'text',
          attrs: parseAttrs(start[2] ?? ''),
          lines: [],
        }
        continue
      }
    }
    if (current) current.lines.push(line)
    else proseLines.push(line)
  }

  if (current) {
    // Unterminated block: keep its content rather than dropping it.
    sections.push(
      makeSection(current.type, current.attrs, current.lines.join('\n').trim()),
    )
  }
  flushProse()
  return sections
}

export function parseLinkItem(item: string): IssueLinkItem {
  const lines = item.split('\n')
  let title = ''
  let url = ''
  const taglineLines: string[] = []
  let index = 0

  while (index < lines.length && (lines[index] ?? '').trim() === '') index++
  if (index < lines.length) {
    const heading = (lines[index] ?? '').trim().replace(/^#+\s*/, '')
    const link = heading.match(/\[([^\]]+)\]\(([^)\s]+)\)/)
    if (link) {
      title = link[1] ?? ''
      url = link[2] ?? ''
    } else {
      title = heading
    }
    index++
  }
  while (index < lines.length && (lines[index] ?? '').trim() !== '') {
    taglineLines.push((lines[index] ?? '').trim())
    index++
  }
  const description = lines.slice(index).join('\n').trim()
  return { title, url, tagline: taglineLines.join(' '), description }
}

function makeSection(
  type: string,
  attrs: Record<string, string>,
  body: string,
): IssueSection {
  return { type, attrs, body, items: splitItems(body) }
}

function splitItems(body: string): string[] {
  const items: string[] = []
  let buffer: string[] = []
  for (const line of body.split('\n')) {
    if (itemDivider.test(line)) {
      items.push(buffer.join('\n').trim())
      buffer = []
    } else {
      buffer.push(line)
    }
  }
  items.push(buffer.join('\n').trim())
  return items.filter((item) => item !== '')
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const match of raw.matchAll(attrPattern)) {
    const [, key, value] = match
    if (key !== undefined && value !== undefined) attrs[key] = value
  }
  return attrs
}
