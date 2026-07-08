import { Fragment, createElement as h, type ReactNode } from 'react'
import { Column, Link, Row, Section, Text } from 'react-email'
import { fullBleed, issueSiteUrl } from './issue-chrome.js'
import { issueInlineMarkdownStyles } from './issue-markdown-styles.js'
import type { IssueSection } from './issue-parser.js'
import { issueSpacer, mdBlock } from './issue-sections.js'
import { issueColors, issueLayout, issueStyles } from './issue-styles.js'

const defaultBlurb = `**Ian's List** is a weekly-ish email about building useful things on the internet, written by [Ian Nuttall](${issueSiteUrl}). Thanks for reading all the way to the end.

If someone forwarded this to you, you can [subscribe here](${issueSiteUrl}).`

const defaultShareText = "Really enjoying Ian's List. Check out this issue:"

// Dense Discovery-style mega footer: a full-width grey band holding a
// centered share box plus a blurb/links two-column block.
export function issueFooter(
  footer: IssueSection | undefined,
  shareUrl?: string,
  background?: string,
) {
  const attrs = footer?.attrs ?? {}
  const url = attrs['share-url'] ?? shareUrl
  return fullBleed(
    background ?? issueColors.highlight,
    issueSpacer('footer-top'),
    url ? shareBlock(url, attrs['share-text'] ?? defaultShareText) : null,
    h(
      Section,
      null,
      h(
        Row,
        null,
        h(
          Column,
          {
            className: 'issue-stack issue-cell',
            style: issueStyles.wideLeftCell,
            width: issueLayout.wideCol,
          },
          blurb(footer),
        ),
        h(
          Column,
          {
            className: 'issue-stack issue-cell',
            style: issueStyles.narrowRightCell,
            width: issueLayout.narrowCol,
          },
          footerLinks(attrs),
        ),
      ),
    ),
    issueSpacer('footer-bottom'),
  )
}

function shareBlock(url: string, shareText: string) {
  const display = url.replace(/^https?:\/\//, '')
  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${url}`)}`
  const mail = `mailto:?subject=${encodeURIComponent('Newsletter recommendation')}&body=${encodeURIComponent(`${shareText} ${url}`)}`
  return h(
    Section,
    null,
    h(
      Row,
      null,
      h(
        Column,
        { className: 'issue-cell', style: issueStyles.footerCenterCell },
        h(Text, { style: issueStyles.shareHeading }, 'Enjoyed this issue? Share it:'),
        h(
          Text,
          { style: issueStyles.shareBox },
          h(Link, { href: url, style: issueStyles.shareLink }, display),
        ),
        h(
          Text,
          { style: issueStyles.shareVia },
          'Share via: ',
          h(Link, { href: tweet, style: issueStyles.shareLink }, 'X'),
          ' / ',
          h(Link, { href: mail, style: issueStyles.shareLink }, 'Email'),
        ),
      ),
    ),
  )
}

function blurb(footer: IssueSection | undefined) {
  const body = footer?.body?.trim() ? footer.body : defaultBlurb
  return mdBlock(body, {
    ...issueInlineMarkdownStyles,
    p: issueStyles.footerText,
    link: issueStyles.footerLink,
  })
}

function footerLinks(attrs: Record<string, string>) {
  const archiveUrl = attrs['archive-url'] ?? issueSiteUrl
  // Default is on; pass advertise-url="" to hide it.
  const advertiseUrl = attrs['advertise-url'] ?? `${issueSiteUrl}/advertise`
  const line = { ...issueStyles.footerText, marginBottom: 0 }
  const groupEnd = issueStyles.footerText
  const extras: ReactNode[] = []
  if (advertiseUrl) {
    extras.push(
      h(
        Text,
        { key: 'advertise', style: groupEnd },
        h(
          Link,
          { href: advertiseUrl, style: issueStyles.footerLink },
          "Advertise on Ian's List",
        ),
      ),
    )
  }
  return h(
    Fragment,
    null,
    h(
      Text,
      { style: line },
      h(
        Link,
        { href: '{{unsubscribeUrl}}', style: issueStyles.footerLink },
        'Unsubscribe',
      ),
    ),
    h(
      Text,
      { style: groupEnd },
      h(Link, { href: archiveUrl, style: issueStyles.footerLink }, 'Browse older issues'),
    ),
    ...extras,
    h(Text, { style: issueStyles.footerSmall }, '20-22 Wenlock Road, London, N1 7GU'),
  )
}
