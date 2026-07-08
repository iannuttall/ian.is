import { type CSSProperties, createElement as h } from 'react'
import {
  Body,
  Container,
  Font,
  Head,
  Html,
  Link,
  Markdown,
  Preview,
  render,
  Section,
  Text,
  toPlainText,
} from 'react-email'
import { issueMsoHeadHtml } from './issue-styles.js'
import { IssueEmail } from './issue-template.js'
import { NoteEmail } from './note-template.js'
import {
  fontFallback,
  interFonts,
  markdownStyles,
  minimalStyles,
  newsletterLinkHoverCss,
  newsletterStyles,
} from './react-email-styles.js'
import type { DraftInput, RenderedEmail } from './types.js'

const markCells: [number, number, string][] = [
  [0, 350.67, '#969696'],
  [175.33, 350.67, '#737373'],
  [175.33, 175.33, '#505050'],
  [350.67, 350.67, '#505050'],
  [350.67, 175.33, '#2d2d2d'],
  [350.67, 0, '#0a0a0a'],
]

export const emailTemplateDefinitions = [
  {
    key: 'default',
    name: 'Default Markdown',
    description: 'Small backwards-compatible Markdown shell.',
    engine: 'markdown',
  },
  {
    key: 'react-newsletter',
    name: 'React Newsletter',
    description: 'React Email shell for regular newsletter broadcasts.',
    engine: 'react-email',
  },
  {
    key: 'react-minimal',
    name: 'React Minimal',
    description: 'React Email shell for short plain-feeling emails.',
    engine: 'react-email',
  },
  {
    key: 'react-note',
    name: 'React Note',
    description: 'Barebones-inspired text-only React Email shell.',
    engine: 'react-email',
  },
  {
    key: 'react-issue',
    name: 'React Issue',
    description: 'Dense Discovery-inspired modular magazine issue shell.',
    engine: 'react-email',
  },
] as const

const reactTemplateKeys = new Set([
  'react-newsletter',
  'react-minimal',
  'react-note',
  'react-issue',
])

export { NoteEmail } from './note-template.js'

export function isReactEmailTemplate(template?: string): boolean {
  return reactTemplateKeys.has(template ?? '')
}

export async function renderReactEmailTemplate(input: {
  draft: DraftInput
  fallbackText: string
}): Promise<RenderedEmail> {
  const component = reactTemplate(input.draft)
  let html = await render(component)
  if (input.draft.template === 'react-issue' || input.draft.template === 'react-note') {
    // React cannot emit conditional comments; inject the Outlook font
    // fallback into the head after rendering.
    html = html.replace('</head>', `${issueMsoHeadHtml}</head>`)
  }
  const text = toPlainText(html).trim() || input.fallbackText
  return {
    subject: input.draft.subject,
    html,
    text,
    ...(input.draft.preview ? { preview: input.draft.preview } : {}),
  }
}

function reactTemplate(draft: DraftInput) {
  if (draft.template === 'react-minimal') return MinimalEmail(draft)
  if (draft.template === 'react-note') return NoteEmail(draft)
  if (draft.template === 'react-issue') return IssueEmail(draft)
  return NewsletterEmail(draft)
}

export function NewsletterEmail(draft: DraftInput) {
  return h(
    Html,
    { lang: 'en' },
    h(Head, null, fontFaces(), linkHoverStyles()),
    draft.preview ? h(Preview, null, draft.preview) : null,
    h(
      Body,
      { style: newsletterStyles.body },
      h(
        Container,
        { style: newsletterStyles.frame },
        h(
          Section,
          { style: newsletterStyles.contentWrap },
          h(
            Section,
            { style: newsletterStyles.header },
            mark(),
            h(Text, { style: newsletterStyles.headerText }, "Ian's List"),
          ),
          markdownContent(draft.bodyMarkdown, newsletterStyles.content),
          newsletterFooter(),
        ),
      ),
    ),
  )
}

export function MinimalEmail(draft: DraftInput) {
  return h(
    Html,
    { lang: 'en' },
    h(Head, null, fontFaces()),
    draft.preview ? h(Preview, null, draft.preview) : null,
    h(
      Body,
      { style: minimalStyles.body },
      h(
        Container,
        { style: minimalStyles.container },
        markdownContent(draft.bodyMarkdown, minimalStyles.content),
        footer(minimalStyles.footer, minimalStyles.footerLink),
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

function linkHoverStyles() {
  return h('style', {
    // biome-ignore lint/security/noDangerouslySetInnerHtml: React Email requires raw CSS in Head.
    dangerouslySetInnerHTML: { __html: newsletterLinkHoverCss },
  })
}

function mark(style: CSSProperties = newsletterStyles.mark) {
  return h(
    'svg',
    {
      width: '20',
      height: '20',
      viewBox: '0 0 512 512',
      style,
      'aria-hidden': 'true',
    },
    ...markCells.map(([x, y, fill]) =>
      h('rect', {
        key: `${x}-${y}`,
        x,
        y,
        width: 161.33,
        height: 161.33,
        fill,
      }),
    ),
  )
}

function markdownContent(
  markdown: string,
  style: CSSProperties,
  customStyles: Record<string, CSSProperties> = markdownStyles,
) {
  return h(Markdown, {
    markdownContainerStyles: style,
    markdownCustomStyles: customStyles,
    // biome-ignore lint/correctness/noChildrenProp: React Email Markdown types require this prop.
    children: markdown,
  })
}

function footer(style: CSSProperties, linkStyle: CSSProperties) {
  return h(
    Text,
    { style },
    h(Link, { href: '{{unsubscribeUrl}}', style: linkStyle }, 'Unsubscribe'),
  )
}

function newsletterFooter() {
  return h(
    Section,
    { style: newsletterStyles.footer },
    h(
      Text,
      { style: newsletterStyles.footerText },
      "Don't want these emails any more? No worries. Here's a slightly greyed out, 13 pixel unsubscribe link for you.",
    ),
    h(
      Text,
      { style: newsletterStyles.footerText },
      h(
        Link,
        { href: '{{unsubscribeUrl}}', style: newsletterStyles.footerLink },
        'Unsubscribe',
      ),
      ' | 20-22 Wenlock Road, N1 7GU',
    ),
  )
}
