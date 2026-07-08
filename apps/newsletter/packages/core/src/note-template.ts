import { type CSSProperties, Fragment, createElement as h, type ReactNode } from 'react'
import {
  Body,
  Column,
  Container,
  Font,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from 'react-email'
import { issueFooter } from './issue-footer.js'
import { type IssueSection, parseIssueSections } from './issue-parser.js'
import { issueSpacer, mdBlock, squareHeading } from './issue-sections.js'
import { issueResponsiveCss, resolveSectionColors } from './issue-styles.js'
import { renderIssueSection } from './issue-template.js'
import {
  barebonesColors,
  fontFallback,
  interFonts,
  noteMarkdownStyles,
  noteStyles,
} from './react-email-styles.js'
import type { DraftInput } from './types.js'

// Issue building blocks that can be dropped into a note. Chrome types
// (hero/header/footer) stay owned by each template's own shell.
const noteModularTypes = new Set([
  'links',
  'sponsor',
  'box',
  'classifieds',
  'quote',
  'poll',
])

// Note text sits 40px from the shell edge; modular sections carry their own
// 20px cell gutters, so the wrapper adds the other 20px (28px on mobile,
// where .issue-cell drops to 12px) to keep one shared content edge.
const noteResponsiveCss = `${issueResponsiveCss}
  @media only screen and (max-width: 599px) {
    .note-wrap {
      padding-left: 28px !important;
      padding-right: 28px !important;
    }
  }
`

export function NoteEmail(draft: DraftInput) {
  const parsed = parseIssueSections(draft.bodyMarkdown)
  const footer = parsed.find((section) => section.type === 'footer')
  const sections = parsed.filter(
    (section) => !['hero', 'header', 'footer'].includes(section.type),
  )
  const blocks: ReactNode[] = []
  sections.forEach((section, index) => {
    if (index > 0) blocks.push(issueSpacer(`note-spacer-${index}`))
    blocks.push(h(Fragment, { key: index }, noteBlock(section)))
  })

  return h(
    Html,
    { lang: 'en' },
    h(
      Head,
      null,
      fontFaces(),
      h('style', {
        // biome-ignore lint/security/noDangerouslySetInnerHtml: React Email requires raw CSS in Head.
        dangerouslySetInnerHTML: { __html: noteResponsiveCss },
      }),
    ),
    draft.preview ? h(Preview, null, draft.preview) : null,
    h(
      Body,
      { style: noteStyles.body },
      h(
        Container,
        { style: noteStyles.frame },
        h(
          Section,
          { style: noteStyles.shell },
          noteHeader(),
          h(Section, { style: noteStyles.contentArea }, ...blocks),
          noteFooterBand(footer),
        ),
      ),
    ),
  )
}

// Colored surfaces sit their box edge on the 40px text gutter; sections
// without a surface use the 20px wrapper so their copy (with its own 20px
// cells) lands on that same gutter.
const noteColoredTypes = new Set(['sponsor', 'box', 'poll'])

const noteDefaultTitles: Record<string, string> = {
  sponsor: 'Sponsor',
  links: 'Links',
  classifieds: 'Classifieds',
  poll: 'Poll',
}

function noteBlock(section: IssueSection) {
  if (noteModularTypes.has(section.type)) {
    // The heading renders on the note's own text grid so every square sits
    // exactly on the 40px gutter, regardless of the body wrapper below.
    const title = section.attrs.title ?? noteDefaultTitles[section.type]
    const heading = title
      ? h(
          Section,
          { style: noteStyles.textWrap },
          squareHeading(title, resolveSectionColors(section.attrs.color).square),
        )
      : null
    const body = noteColoredTypes.has(section.type)
      ? h(Section, { style: noteStyles.coloredWrap }, renderIssueSection(section, false))
      : h(
          Section,
          { className: 'note-wrap', style: noteStyles.modularWrap },
          renderIssueSection(section, false),
        )
    return h(Fragment, null, heading, body)
  }
  return h(
    Section,
    { style: noteStyles.textWrap },
    mdBlock(section.body, noteMarkdownStyles, noteStyles.content),
  )
}

function noteFooterBand(footer: IssueSection | undefined) {
  return h(
    Section,
    {
      className: 'note-wrap',
      style: { ...noteStyles.modularWrap, backgroundColor: barebonesColors.bg3 },
    },
    issueFooter(footer, undefined, barebonesColors.bg3),
  )
}

function noteHeader() {
  return h(
    Section,
    { style: noteStyles.header },
    h(
      Row,
      null,
      h(
        Column,
        { style: noteStyles.headerCell, width: '50%' },
        monogram(noteStyles.mark),
      ),
      h(
        Column,
        { align: 'right', style: noteStyles.headerCell, width: '50%' },
        h(Text, { style: noteStyles.company }, "Ian's List"),
      ),
    ),
  )
}

// Monogram paths from ian.is logo-black.svg; tight glyph box is
// x 114-486, y 187.5-412 in the 600 viewBox (372x224.7, ~1.65:1).
const monogramPaths = [
  'M198.2,213.9l-84.2,198.6h65c8.3,0,17.5-5.5,20.4-12.5l39.9-93.8l0.1-0.9L198.2,213.9z',
  'M421.1,187.5c-8.3,0-17.4,5.6-20.4,12.5l-35.6,83.9l41.4,90.9l79.5-187.3H421.1z',
  'M297.9,191.9c-1.7-2.9-5.3-4.5-9.7-4.5h-76.8l25.4,56.7h84.8L297.9,191.9z',
  'M332.2,267.2h-85.2l63.6,140.8l0.1,0.1c1.6,2.8,5.2,4.4,9.7,4.4h55c5.7,0,12-2.7,16.2-6.7c1.6-1.5,2-3.9,1.1-6 L332.2,267.2z',
]

function monogram(style: CSSProperties) {
  return h(
    'svg',
    {
      width: '33',
      height: '20',
      viewBox: '114 187.5 372 224.7',
      style,
      'aria-hidden': 'true',
    },
    ...monogramPaths.map((d, index) => h('path', { key: index, d, fill: '#0A0A0A' })),
  )
}

function fontFaces() {
  return interFonts.map((font) =>
    h(Font, {
      key: font.weight,
      fontFamily: 'Inter',
      fallbackFontFamily: fontFallback,
      webFont: {
        url: font.url,
        format: 'truetype',
      },
      fontWeight: font.weight,
      fontStyle: 'normal',
    }),
  )
}
