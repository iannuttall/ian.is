import { type CSSProperties, Fragment, createElement as h, type ReactNode } from 'react'
import { Column, Hr, Img, Link, Markdown, Row, Section, Text } from 'react-email'
import {
  issueInlineMarkdownStyles,
  issueLeadMarkdownStyles,
  issueMarkdownStyles,
} from './issue-markdown-styles.js'
import { type IssueSection, parseLinkItem } from './issue-parser.js'
import {
  issueColors,
  issueLayout,
  issueStyles,
  resolveSectionColors,
} from './issue-styles.js'

const defaultClassifiedsButton = "Advertise on Ian's List"
const defaultClassifiedsButtonUrl = 'https://ian.is/advertise'

export function issueSpacer(key?: string) {
  // Non-breaking space keeps clients that collapse empty cells honest.
  return h(
    Section,
    { key },
    h(Text, { className: 'issue-spacer', style: issueStyles.spacer }, ' '),
  )
}

// ==text== renders as DD's yellow inline highlight. The Markdown component
// passes inline HTML through untouched, so this stays a plain styled span.
function withHighlights(markdown: string): string {
  return markdown.replace(
    /==([^=\n][^=\n]*)==/g,
    `<span style="background-color:${issueColors.textHighlight};padding:2px 0">$1</span>`,
  )
}

export function mdBlock(
  markdown: string,
  customStyles: Record<string, CSSProperties> = issueMarkdownStyles,
  containerStyle?: CSSProperties,
) {
  return h(Markdown, {
    markdownContainerStyles: containerStyle ?? {},
    markdownCustomStyles: customStyles,
    // biome-ignore lint/correctness/noChildrenProp: React Email Markdown types require this prop.
    children: withHighlights(markdown),
  })
}

export function squareHeading(title: string, square: string) {
  return h(
    Section,
    null,
    h(
      Row,
      null,
      h(
        Column,
        { style: issueStyles.headingSquareCell, width: 26 },
        h(Text, {
          className: 'issue-heading-square',
          style: { ...issueStyles.headingSquare, backgroundColor: square },
        }),
      ),
      h(
        Column,
        { style: issueStyles.headingCell },
        h(Text, { style: issueStyles.headingText }, title),
      ),
    ),
  )
}

function stackedColumns(
  left: ReactNode,
  right: ReactNode,
  widths: [number, number],
  styles: [CSSProperties, CSSProperties],
  background?: string,
) {
  const bg = background ? { backgroundColor: background } : {}
  return h(
    Row,
    null,
    h(
      Column,
      {
        className: 'issue-stack issue-cell',
        style: { ...styles[0], ...bg },
        width: widths[0],
      },
      left,
    ),
    h(
      Column,
      {
        className: 'issue-stack issue-cell',
        style: { ...styles[1], ...bg },
        width: widths[1],
      },
      right,
    ),
  )
}

export function textSection(section: IssueSection, withHeading = true) {
  const styles = section.type === 'lead' ? issueLeadMarkdownStyles : issueMarkdownStyles
  return h(
    Fragment,
    null,
    withHeading && section.attrs.title
      ? squareHeading(
          section.attrs.title,
          resolveSectionColors(section.attrs.color).square,
        )
      : null,
    h(
      Section,
      null,
      h(
        Row,
        null,
        h(
          Column,
          { className: 'issue-cell', style: issueStyles.fullCell },
          mdBlock(section.body, styles),
        ),
      ),
    ),
  )
}

export function linksSection(section: IssueSection, withHeading = true) {
  const colors = resolveSectionColors(section.attrs.color)
  const rows = section.items.map((item, index) => {
    const parsed = parseLinkItem(item)
    const title = h(
      Text,
      { style: issueStyles.linkTitle },
      parsed.url
        ? h(Link, { href: parsed.url, style: issueStyles.linkTitleAnchor }, parsed.title)
        : parsed.title,
      ' →',
    )
    const tagline = parsed.tagline
      ? h(Text, { style: issueStyles.linkTagline }, parsed.tagline)
      : null
    return h(
      Fragment,
      { key: `${parsed.title}-${index}` },
      stackedColumns(
        h(Fragment, null, title, tagline),
        mdBlock(parsed.description),
        [issueLayout.narrowCol, issueLayout.wideCol],
        [issueStyles.narrowLeftCell, issueStyles.wideRightCell],
      ),
    )
  })
  return h(
    Fragment,
    null,
    withHeading ? squareHeading(section.attrs.title ?? 'Links', colors.square) : null,
    h(Section, null, ...rows),
  )
}

export function boxSection(section: IssueSection, withHeading = true) {
  const colors = resolveSectionColors(section.attrs.color)
  const heading =
    withHeading && section.attrs.title
      ? squareHeading(section.attrs.title, colors.square)
      : null
  const background = colors.tint
  const content = mdBlock(section.body)
  let body: ReactNode
  if (section.attrs.image) {
    const image = h(
      Fragment,
      null,
      h(Img, {
        src: section.attrs.image,
        alt: section.attrs['image-alt'] ?? '',
        width: issueLayout.narrowImageWidth,
        style: issueStyles.boxImage,
      }),
      section.attrs.caption
        ? mdBlock(section.attrs.caption, {
            ...issueInlineMarkdownStyles,
            p: issueStyles.boxCaption,
            link: issueStyles.footerMutedLink,
          })
        : null,
    )
    const imageRight = section.attrs['image-side'] === 'right'
    body = imageRight
      ? stackedColumns(
          content,
          image,
          [issueLayout.wideCol, issueLayout.narrowCol],
          [issueStyles.wideLeftCell, issueStyles.narrowRightCell],
          background,
        )
      : stackedColumns(
          image,
          content,
          [issueLayout.narrowCol, issueLayout.wideCol],
          [issueStyles.narrowLeftCell, issueStyles.wideRightCell],
          background,
        )
  } else {
    body = h(
      Row,
      null,
      h(
        Column,
        {
          className: 'issue-cell',
          style: { ...issueStyles.fullCell, backgroundColor: background },
        },
        content,
      ),
    )
  }
  return h(Fragment, null, heading, h(Section, null, body))
}

export function sponsorSection(section: IssueSection, withHeading = true) {
  // DD 396 sponsor: dark square, light grey box (the default pair).
  const withTitle: IssueSection = {
    ...section,
    attrs: { title: 'Sponsor', ...section.attrs },
  }
  return boxSection(withTitle, withHeading)
}

export function classifiedsSection(section: IssueSection, withHeading = true) {
  const colors = resolveSectionColors(section.attrs.color)
  const entries = section.items.flatMap((item, index) => {
    const entry = mdBlock(item)
    if (index === section.items.length - 1) return [entry]
    return [entry, h(Hr, { key: `divider-${index}`, style: issueStyles.divider })]
  })
  const note = section.attrs.note
    ? mdBlock(section.attrs.note, {
        ...issueInlineMarkdownStyles,
        p: issueStyles.classifiedNote,
      })
    : null
  const buttonLabel = section.attrs.button ?? defaultClassifiedsButton
  const buttonUrl = section.attrs['button-url'] ?? defaultClassifiedsButtonUrl
  const button =
    buttonLabel && buttonUrl
      ? h(
          Text,
          { style: { margin: '0 0 15px', padding: 0 } },
          h(Link, { href: buttonUrl, style: issueStyles.button }, buttonLabel),
        )
      : null
  return h(
    Fragment,
    null,
    withHeading
      ? squareHeading(section.attrs.title ?? 'Classifieds', colors.square)
      : null,
    h(
      Section,
      null,
      stackedColumns(
        h(Fragment, null, ...entries),
        h(Fragment, null, note, button),
        [issueLayout.wideCol, issueLayout.narrowCol],
        [issueStyles.wideLeftCell, issueStyles.narrowRightCell],
      ),
    ),
  )
}

export function quoteSection(section: IssueSection, withHeading = true) {
  const paragraphs = section.body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) =>
      h(
        Text,
        { key: index, style: { ...issueStyles.quoteText, margin: '0 0 15px' } },
        paragraph,
      ),
    )
  return h(
    Fragment,
    null,
    withHeading && section.attrs.title
      ? squareHeading(
          section.attrs.title,
          resolveSectionColors(section.attrs.color).square,
        )
      : null,
    h(
      Section,
      null,
      h(
        Row,
        null,
        h(
          Column,
          { className: 'issue-cell', style: issueStyles.fullCell },
          ...paragraphs,
        ),
      ),
    ),
  )
}
