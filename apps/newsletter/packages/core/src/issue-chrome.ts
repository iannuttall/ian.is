import { Fragment, createElement as h, type ReactNode } from 'react'
import { Column, Container, Img, Link, Row, Section, Text } from 'react-email'
import { issueInlineMarkdownStyles } from './issue-markdown-styles.js'
import type { IssueSection } from './issue-parser.js'
import { mdBlock } from './issue-sections.js'
import {
  issueColors,
  issueLayout,
  issueStyles,
  resolveIssueColor,
} from './issue-styles.js'

export const issueSiteUrl = 'https://ian.is'
export const issueDefaultLogoBase = 'https://ian.is/email'

// Dense Discovery bands span the full viewport width while their content
// stays on the 640px grid: an outer 100% Section carries the background, an
// inner Container carries the content. The width attribute override keeps a
// fixed 640 for Outlook's Word engine, which ignores max-width.
export function fullBleed(background: string | undefined, ...children: ReactNode[]) {
  const bg = background ? { backgroundColor: background } : {}
  return h(
    Section,
    { style: bg },
    h(Container, { width: issueLayout.width, style: issueStyles.frame }, ...children),
  )
}

export function heroBand(hero: IssueSection, logoBase: string) {
  const background = resolveIssueColor(hero.attrs.color, issueColors.heroDefault)
  const quote = hero.body
    ? mdBlock(hero.body, {
        ...issueInlineMarkdownStyles,
        p: issueStyles.heroText,
        link: { color: issueColors.ink, textDecoration: 'underline' },
      })
    : null
  const image = hero.attrs.image
    ? h(
        Fragment,
        null,
        h(Img, {
          src: hero.attrs.image,
          alt: hero.attrs['image-alt'] ?? '',
          width: issueLayout.wideImageWidth,
          style: issueStyles.heroImage,
        }),
        hero.attrs.credit
          ? mdBlock(hero.attrs.credit, {
              ...issueInlineMarkdownStyles,
              p: issueStyles.heroCredit,
            })
          : null,
      )
    : null
  const content = h(
    Section,
    { style: issueStyles.hero },
    image
      ? h(
          Row,
          null,
          h(
            Column,
            {
              className: 'issue-stack issue-cell',
              style: issueStyles.heroQuoteCell,
              width: issueLayout.narrowCol,
            },
            quote,
          ),
          h(
            Column,
            {
              className: 'issue-stack issue-cell',
              style: issueStyles.heroImageCell,
              width: issueLayout.wideCol,
            },
            image,
          ),
        )
      : h(
          Row,
          null,
          h(Column, { className: 'issue-cell', style: issueStyles.heroQuoteCell }, quote),
        ),
    h(
      Row,
      null,
      h(
        Column,
        { className: 'issue-cell', style: issueStyles.heroLogoCell },
        logoImage(
          `${logoBase}/logo-top.png`,
          hero.attrs.url ?? issueSiteUrl,
          issueLayout.logoTopHeight,
        ),
      ),
    ),
  )
  return fullBleed(background, content)
}

// Note-style simple header: small mark on the left, publication name on the
// right, optionally on a full-bleed color strip. The transparent mark goes on
// colored strips (band color survives forced dark mode); the white-baked mark
// goes on white headers for the same reason.
export function simpleHeader(header: IssueSection | undefined, logoBase: string) {
  const attrs = header?.attrs ?? {}
  const background = attrs.color
    ? resolveIssueColor(attrs.color, issueColors.heroDefault)
    : undefined
  const markFile = background ? 'logo-mark.png' : 'logo-mark-white.png'
  const strip = h(
    Section,
    null,
    h(
      Row,
      null,
      h(
        Column,
        { className: 'issue-cell', style: issueStyles.headerStripCell, width: '50%' },
        h(
          Link,
          { href: attrs.url ?? issueSiteUrl },
          h(Img, {
            src: `${logoBase}/${markFile}`,
            alt: 'Ian Nuttall',
            width: issueLayout.markWidth,
            height: issueLayout.markHeight,
            style: issueStyles.logoImage,
          }),
        ),
      ),
      h(
        Column,
        { className: 'issue-cell', style: issueStyles.headerStripCell, width: '50%' },
        h(Text, { style: issueStyles.headerName }, attrs.name ?? "Ian's List"),
      ),
    ),
  )
  return fullBleed(background, strip)
}

export function headerTitleRow(header: IssueSection | undefined) {
  const attrs = header?.attrs ?? {}
  if (!attrs.title) return null
  return h(Section, null, headlineRow(attrs))
}

export function titleRow(hero: IssueSection, logoBase: string) {
  return h(
    Section,
    null,
    h(
      Row,
      null,
      h(
        Column,
        { className: 'issue-cell', style: issueStyles.bodyLogoCell },
        logoImage(
          `${logoBase}/logo-bottom.png`,
          hero.attrs.url ?? issueSiteUrl,
          issueLayout.logoBottomHeight,
        ),
      ),
    ),
    headlineRow(hero.attrs),
  )
}

function headlineRow(attrs: Record<string, string>) {
  if (!attrs.title) return null
  const online = attrs['online-url']
    ? h(
        Column,
        {
          className: 'issue-hide-mobile issue-cell',
          style: issueStyles.onlineCell,
          width: issueLayout.halfCol,
        },
        h(
          Text,
          { style: issueStyles.onlineText },
          h(
            Link,
            { href: attrs['online-url'], style: issueStyles.onlineLink },
            'View/share online',
          ),
          ' →',
        ),
      )
    : null
  return h(
    Row,
    null,
    h(
      Column,
      {
        className: 'issue-stack issue-cell',
        style: issueStyles.titleCell,
        width: online ? issueLayout.halfCol : '100%',
      },
      h(Text, { style: issueStyles.titleText }, attrs.title),
    ),
    online,
  )
}

function logoImage(src: string, href: string, height: number) {
  return h(
    Link,
    { href },
    h(Img, {
      src,
      alt: 'Ian Nuttall',
      width: issueLayout.logoWidth,
      height,
      style: issueStyles.logoImage,
    }),
  )
}
