import { type ComponentProps, Fragment, createElement as h, type ReactNode } from 'react'
import { Column, Row, Section } from 'react-email'
import { itemContents, markdownCta } from './issue-items.js'
import { type IssueSection, parseIssueItem, parseIssueItems } from './issue-parser.js'
import {
  headingMarker,
  issueSpacer,
  mdBlockWithCode,
  squareHeading,
} from './issue-sections.js'
import { renderIssueSection } from './issue-template.js'
import { defaultEmailMarkdownStyles, defaultEmailStyles } from './react-email-styles.js'

const modularTypes = new Set([
  'links',
  'sponsor',
  'box',
  'classifieds',
  'cta',
  'quote',
  'poll',
  'item',
  'reach-out',
  'disclosure',
])

const coloredTypes = new Set(['sponsor', 'box', 'poll'])

const sectionTitles: Record<string, string> = {
  sponsor: 'Sponsor',
  links: 'Links',
  classifieds: 'Classifieds',
  poll: 'Poll',
  'reach-out': 'Reach out',
}

export function defaultBlocks(
  sections: IssueSection[],
  issueName?: string,
  withSpacing = true,
): ReactNode[] {
  const items = parseIssueItems(sections)
  const units: Array<{ kind: string; node: ReactNode }> = []
  let addedContents = false
  let addedMarkdown = false
  let activeItemGroup: 'tool' | 'workflow' | undefined

  for (const section of sections) {
    if (section.type === 'item' && !addedContents) {
      units.push({
        kind: 'contents',
        node: moduleCell(itemContents(items, issueName)),
      })
      addedContents = true
    }
    if (section.type === 'item') {
      const item = parseIssueItem(section)
      if (!item.sponsor && item.kind !== activeItemGroup) {
        units.push({
          kind: 'item-group',
          node: contentCell(
            squareHeading(
              item.kind === 'workflow' ? 'Skills, loops & workflows' : 'Tools',
            ),
          ),
        })
        activeItemGroup = item.kind
      }
    }
    if (section.type === 'disclosure' && issueName && !addedMarkdown) {
      units.push({
        kind: 'markdown',
        node: moduleCell(markdownCta(issueName)),
      })
      addedMarkdown = true
    }
    units.push({ kind: section.type, node: defaultBlock(section) })
  }
  if (issueName && !addedMarkdown) {
    units.push({
      kind: 'markdown',
      node: moduleCell(markdownCta(issueName)),
    })
  }

  const blocks: ReactNode[] = []
  units.forEach((unit, index) => {
    if (withSpacing && index > 0 && needsSpacing(units, index, items.length > 0)) {
      blocks.push(issueSpacer(`default-spacer-${index}`))
    }
    blocks.push(h(Fragment, { key: `default-${unit.kind}-${index}` }, unit.node))
  })
  return blocks
}

function needsSpacing(
  units: Array<{ kind: string; node: ReactNode }>,
  index: number,
  hasItems: boolean,
): boolean {
  if (!hasItems) return true
  const previous = units[index - 1]
  const current = units[index]
  if (previous?.kind === 'contents') return true
  return (
    previous?.kind === 'item' &&
    current?.kind !== 'item' &&
    current?.kind !== 'item-group'
  )
}

function defaultBlock(section: IssueSection) {
  if (section.type === 'text' && section.attrs.title) {
    return h(
      Fragment,
      null,
      contentCell(squareHeading(section.attrs.title, headingMarker(section))),
      contentCell(
        mdBlockWithCode(
          section.body,
          defaultEmailMarkdownStyles,
          defaultEmailStyles.content,
        ),
      ),
    )
  }

  if (modularTypes.has(section.type)) {
    const title =
      section.type === 'item'
        ? undefined
        : (section.attrs.title ?? sectionTitles[section.type])
    const heading = title
      ? contentCell(squareHeading(title, headingMarker(section)))
      : null
    const body = coloredTypes.has(section.type)
      ? defaultCell(
          'default-surface-cell',
          defaultEmailStyles.coloredWrap,
          renderIssueSection(section, false),
        )
      : moduleCell(renderIssueSection(section, false))
    return h(Fragment, null, heading, body)
  }

  return contentCell(
    mdBlockWithCode(section.body, defaultEmailMarkdownStyles, defaultEmailStyles.content),
  )
}

function contentCell(...children: ReactNode[]) {
  return defaultCell('default-content-cell', defaultEmailStyles.textWrap, ...children)
}

function moduleCell(...children: ReactNode[]) {
  return defaultCell('default-module-cell', defaultEmailStyles.modularWrap, ...children)
}

function defaultCell(
  className: string,
  style: ComponentProps<typeof Column>['style'],
  ...children: ReactNode[]
) {
  return h(Section, null, h(Row, null, h(Column, { className, style }, ...children)))
}
