import { type ComponentProps, Fragment, createElement as h, type ReactNode } from 'react'
import {
  Body,
  Column,
  Container,
  Font,
  Head,
  Html,
  Img,
  Link,
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
  defaultEmailMarkdownStyles,
  defaultEmailStyles,
  fontFallback,
  interFonts,
} from './react-email-styles.js'
import type { DraftInput } from './types.js'

type TrackedLinkProps = ComponentProps<typeof Link> & {
  'data-track'?: 'false'
}

// Issue building blocks that can be dropped into the default shell. Chrome types
// (hero/header/footer) stay owned by each template's own shell.
const defaultModularTypes = new Set([
  'links',
  'sponsor',
  'box',
  'classifieds',
  'quote',
  'poll',
])

// Default text sits 40px from the shell edge on desktop. On mobile the default
// shell owns one explicit 16px content edge; modular section cells inherit that
// same edge so body text, headings, link blocks, classifieds, and footer copy
// line up top-to-bottom.
const defaultResponsiveCss = `${issueResponsiveCss}
  .default-footer .issue-footer-blurb {
    padding-left: 40px !important;
    padding-right: 10px !important;
  }
  .default-footer .issue-footer-links {
    padding-left: 10px !important;
    padding-right: 40px !important;
  }
  @media only screen and (max-width: 599px) {
    .default-header,
    .default-text-wrap,
    .default-colored-wrap {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    .default-wrap {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    .default-wrap .issue-cell,
    .default-footer .issue-footer-blurb,
    .default-footer .issue-footer-links {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
  }
`

export function DefaultEmail(draft: DraftInput) {
  const parsed = parseIssueSections(draft.bodyMarkdown)
  const sections = parsed.filter(
    (section) => !['hero', 'header', 'footer'].includes(section.type),
  )
  const blocks: ReactNode[] = []
  sections.forEach((section, index) => {
    if (index > 0) blocks.push(issueSpacer(`default-spacer-${index}`))
    blocks.push(h(Fragment, { key: index }, defaultBlock(section)))
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
        dangerouslySetInnerHTML: { __html: defaultResponsiveCss },
      }),
    ),
    draft.preview ? h(Preview, null, draft.preview) : null,
    h(
      Body,
      { style: defaultEmailStyles.body },
      h(
        Container,
        { style: defaultEmailStyles.frame },
        h(
          Section,
          { style: defaultEmailStyles.shell },
          defaultHeader(),
          h(Section, { style: defaultEmailStyles.contentArea }, ...blocks),
          defaultFooterBand(),
        ),
      ),
    ),
  )
}

// Colored surfaces sit their box edge on the 40px text gutter; sections
// without a surface use the 20px wrapper so their copy (with its own 20px
// cells) lands on that same gutter.
const defaultColoredTypes = new Set(['sponsor', 'box', 'poll'])

const defaultSectionTitles: Record<string, string> = {
  sponsor: 'Sponsor',
  links: 'Links',
  classifieds: 'Classifieds',
  poll: 'Poll',
}

function defaultBlock(section: IssueSection) {
  if (section.type === 'text' && section.attrs.title) {
    return h(
      Fragment,
      null,
      h(
        Section,
        { className: 'default-text-wrap', style: defaultEmailStyles.textWrap },
        squareHeading(
          section.attrs.title,
          resolveSectionColors(section.attrs.color).square,
        ),
      ),
      h(
        Section,
        { className: 'default-text-wrap', style: defaultEmailStyles.textWrap },
        mdBlock(section.body, defaultEmailMarkdownStyles, defaultEmailStyles.content),
      ),
    )
  }

  if (defaultModularTypes.has(section.type)) {
    // The heading renders on the default text grid so every square sits
    // exactly on the 40px gutter, regardless of the body wrapper below.
    const title = section.attrs.title ?? defaultSectionTitles[section.type]
    const heading = title
      ? h(
          Section,
          { className: 'default-text-wrap', style: defaultEmailStyles.textWrap },
          squareHeading(title, resolveSectionColors(section.attrs.color).square),
        )
      : null
    const body = defaultColoredTypes.has(section.type)
      ? h(
          Section,
          { className: 'default-colored-wrap', style: defaultEmailStyles.coloredWrap },
          renderIssueSection(section, false),
        )
      : h(
          Section,
          { className: 'default-wrap', style: defaultEmailStyles.modularWrap },
          renderIssueSection(section, false),
        )
    return h(Fragment, null, heading, body)
  }
  return h(
    Section,
    { className: 'default-text-wrap', style: defaultEmailStyles.textWrap },
    mdBlock(section.body, defaultEmailMarkdownStyles, defaultEmailStyles.content),
  )
}

function defaultFooterBand() {
  return issueFooter(undefined, undefined, barebonesColors.bg3, 'default-footer')
}

function defaultHeader() {
  return h(
    Section,
    { className: 'default-header', style: defaultEmailStyles.header },
    h(
      Row,
      null,
      h(
        Column,
        {
          style: { ...defaultEmailStyles.headerCell, textAlign: 'left' as const },
          width: '50%',
        },
        h(
          Link,
          untrackedLinkProps({
            href: 'https://ian.is',
            style: defaultEmailStyles.logoLink,
          }),
          h(Img, {
            src: 'https://list.ian.is/favicon-light.png',
            alt: 'Ian Nuttall',
            width: 32,
            height: 32,
            style: defaultEmailStyles.logo,
          }),
        ),
      ),
      h(
        Column,
        { align: 'right', style: defaultEmailStyles.headerCell, width: '50%' },
        h(Text, { style: defaultEmailStyles.company }, "Ian's List"),
      ),
    ),
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

function untrackedLinkProps(props: ComponentProps<typeof Link>): TrackedLinkProps {
  return { ...props, 'data-track': 'false' }
}
