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

// Default text sits 40px from the shell edge; modular sections carry their own
// 20px cell gutters, so the wrapper adds the other 20px (28px on mobile,
// where .issue-cell drops to 12px) to keep one shared content edge.
const defaultResponsiveCss = `${issueResponsiveCss}
  @media only screen and (max-width: 599px) {
    .default-wrap {
      padding-left: 28px !important;
      padding-right: 28px !important;
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
        { style: defaultEmailStyles.textWrap },
        squareHeading(
          section.attrs.title,
          resolveSectionColors(section.attrs.color).square,
        ),
      ),
      h(
        Section,
        { style: defaultEmailStyles.textWrap },
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
          { style: defaultEmailStyles.textWrap },
          squareHeading(title, resolveSectionColors(section.attrs.color).square),
        )
      : null
    const body = defaultColoredTypes.has(section.type)
      ? h(
          Section,
          { style: defaultEmailStyles.coloredWrap },
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
    { style: defaultEmailStyles.textWrap },
    mdBlock(section.body, defaultEmailMarkdownStyles, defaultEmailStyles.content),
  )
}

function defaultFooterBand() {
  return h(
    Section,
    {
      className: 'default-wrap',
      style: { ...defaultEmailStyles.modularWrap, backgroundColor: barebonesColors.bg3 },
    },
    h(
      Section,
      { style: defaultEmailStyles.footerInner },
      h(
        Row,
        null,
        h(
          Column,
          {
            className: 'issue-stack',
            style: defaultEmailStyles.footerBlurbCell,
            width: '62%',
          },
          h(
            Text,
            { style: defaultEmailStyles.footerText },
            h('strong', null, "Ian's List"),
            ' is a weekly email about building useful things with AI, written by ',
            h(
              Link,
              untrackedLinkProps({
                href: 'https://ian.is',
                style: defaultEmailStyles.footerLink,
              }),
              'Ian Nuttall',
            ),
            '.',
          ),
        ),
        h(
          Column,
          {
            className: 'issue-stack',
            style: defaultEmailStyles.footerLinksCell,
            width: '38%',
          },
          h(
            Text,
            { style: defaultEmailStyles.footerLinkLine },
            h(
              Link,
              { href: '{{unsubscribeUrl}}', style: defaultEmailStyles.footerLink },
              'Unsubscribe',
            ),
          ),
          h(
            Text,
            { style: defaultEmailStyles.footerSmall },
            '20-22 Wenlock Road, London, N1 7GU',
          ),
        ),
      ),
    ),
  )
}

function defaultHeader() {
  return h(
    Section,
    { style: defaultEmailStyles.header },
    h(
      Row,
      null,
      h(
        Column,
        { style: defaultEmailStyles.headerCell, width: '50%' },
        h(
          Link,
          untrackedLinkProps({
            href: 'https://ian.is',
            style: defaultEmailStyles.logoLink,
          }),
          h(Img, {
            src: 'https://ian.is/logo-black.png',
            alt: 'Ian Nuttall',
            width: 33,
            height: 20,
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
