import type { CSSProperties } from 'react'

export const fontFamily = 'Inter, Helvetica, Arial, sans-serif'

export const fontFallback: ['Helvetica', 'Arial', 'sans-serif'] = [
  'Helvetica',
  'Arial',
  'sans-serif',
]

export const siteColors = {
  backgroundSubtle: '#f9fafb',
  card: '#fffffe',
  foreground: '#222222',
  foregroundSoft: '#808080',
  border: '#e4e4e4',
  primary: '#0092b8',
  primaryForeground: '#fafafa',
} as const

export const barebonesColors = {
  bg: '#FFFFFF',
  bg2: '#F3F4F6',
  // Footer band: off-white, a hair off the card so it reads as part of the
  // card rather than blending into the grey page background.
  bg3: '#F9F9F9',
  fg: '#14171E',
  fg2: '#43454B',
  fg3: '#7B7D81',
  stroke: '#F0F0F0',
  strokeStrong: '#E4E4E7',
  brand: '#614500',
} as const

export const newsletterLinkHoverCss = `
  a:hover {
    text-decoration-style: dotted !important;
    text-underline-offset: 2px !important;
  }
`

export const interFonts = [
  {
    weight: 400,
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf',
  },
  {
    weight: 500,
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf',
  },
  {
    weight: 600,
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf',
  },
] as const

export const newsletterStyles = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: siteColors.backgroundSubtle,
    color: siteColors.foreground,
    fontFamily,
  },
  frame: {
    maxWidth: '620px',
    margin: '0 auto',
    backgroundColor: siteColors.card,
  },
  contentWrap: {
    backgroundColor: siteColors.card,
    padding: '42px 32px 40px',
  },
  header: {
    margin: '0 0 24px',
  },
  mark: {
    display: 'inline-block',
    margin: '0 8px 0 0',
    verticalAlign: 'middle',
  },
  headerText: {
    display: 'inline-block',
    margin: 0,
    color: siteColors.foreground,
    fontSize: '16px',
    lineHeight: '1.25',
    fontWeight: 600,
    verticalAlign: 'middle',
  },
  content: {
    color: siteColors.foreground,
    fontSize: '16px',
    lineHeight: '1.65',
  },
  footer: {
    margin: '44px 0 0',
    padding: '26px 0 0',
    borderTop: `1px solid ${siteColors.border}`,
  },
  footerText: {
    margin: '0 0 8px',
    color: siteColors.foregroundSoft,
    fontSize: '14px',
    lineHeight: '1.55',
    fontFamily,
  },
  footerLink: {
    color: siteColors.foregroundSoft,
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  },
  button: {
    backgroundColor: siteColors.primary,
    borderRadius: '8px',
    color: siteColors.primaryForeground,
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '1',
    padding: '16px 20px',
    textDecoration: 'none',
  },
} satisfies Record<string, CSSProperties>

export const minimalStyles = {
  body: {
    margin: 0,
    padding: '20px',
    backgroundColor: '#ffffff',
    color: siteColors.foreground,
    fontFamily,
  },
  container: {
    maxWidth: '620px',
    margin: '0 auto',
  },
  content: {
    color: siteColors.foreground,
    fontSize: '16px',
    lineHeight: '1.65',
  },
  footer: {
    margin: '28px 0 0',
    color: '#71717a',
    fontSize: '13px',
    lineHeight: '1.5',
  },
  footerLink: {
    color: '#71717a',
    textDecoration: 'underline',
  },
} satisfies Record<string, CSSProperties>

export const noteStyles = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: barebonesColors.bg2,
    color: barebonesColors.fg,
    fontFamily,
    textAlign: 'center',
  },
  frame: {
    maxWidth: '640px',
    width: '100%',
    margin: '32px auto 0',
    backgroundColor: barebonesColors.bg,
  },
  shell: {
    backgroundColor: barebonesColors.bg,
    // No side padding: full-bleed sections (sponsor boxes, footer band) paint
    // to the card edges; text blocks carry their own 40px gutters.
    padding: '16px 0 0',
  },
  header: {
    margin: '0 0 12px',
    // Match the 40px horizontal inset of text blocks so the mark and the
    // body copy share the same left edge.
    padding: '0 40px',
  },
  headerCell: {
    padding: '7px 0',
    verticalAlign: 'middle',
  },
  markCell: {
    width: '32px',
    verticalAlign: 'middle',
  },
  mark: {
    display: 'block',
  },
  company: {
    margin: 0,
    color: barebonesColors.fg3,
    fontSize: '13px',
    fontWeight: 400,
    letterSpacing: '-0.039px',
    lineHeight: '1.5',
    textAlign: 'right',
    fontFamily,
  },
  contentArea: {
    backgroundColor: barebonesColors.bg,
    padding: '64px 0 40px',
    textAlign: 'left',
  },
  textWrap: {
    padding: '0 40px',
    textAlign: 'left',
  },
  // Modular issue sections carry their own 20px cell gutters; this wrapper
  // adds the remaining 20px so they share the text's 40px content edge.
  modularWrap: {
    padding: '0 20px',
    textAlign: 'left',
  },
  // Colored surfaces put their box edge directly on the 40px text gutter.
  coloredWrap: {
    padding: '0 40px',
    textAlign: 'left',
  },
  content: {
    color: barebonesColors.fg,
    fontSize: '18px',
    fontWeight: 400,
    letterSpacing: '-0.048px',
    lineHeight: '27px',
    textAlign: 'left',
  },
} satisfies Record<string, CSSProperties>

export const noteMarkdownStyles = {
  h1: {
    margin: '0 0 24px',
    color: barebonesColors.fg,
    fontSize: '28px',
    fontWeight: 600,
    letterSpacing: '-0.084px',
    lineHeight: '1.3',
  },
  h2: {
    margin: '0 0 16px',
    color: barebonesColors.fg,
    fontSize: '24px',
    fontWeight: 600,
    letterSpacing: '-0.084px',
    lineHeight: '1',
  },
  p: {
    margin: '0 0 24px',
    color: barebonesColors.fg,
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: '27px',
  },
  link: {
    color: barebonesColors.fg,
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
    backgroundColor: 'transparent',
  },
  ul: { margin: '0 0 24px', paddingLeft: '22px' },
  ol: { margin: '0 0 24px', paddingLeft: '22px' },
  li: {
    margin: '0 0 8px',
    color: barebonesColors.fg,
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: '27px',
  },
  blockquote: {
    margin: '0 0 24px',
    paddingLeft: '16px',
    borderLeft: `3px solid ${barebonesColors.strokeStrong}`,
    color: barebonesColors.fg2,
  },
  code: {
    fontFamily: 'Menlo,Consolas,monospace',
    fontSize: '14px',
    backgroundColor: barebonesColors.bg2,
    padding: '2px 4px',
    borderRadius: '4px',
  },
} satisfies Record<string, CSSProperties>

export const markdownStyles = {
  h1: { fontSize: '24px', lineHeight: '1.3', fontWeight: 500 },
  h2: { fontSize: '20px', lineHeight: '1.35', fontWeight: 500 },
  p: { margin: '0 0 16px' },
  link: {
    color: siteColors.foreground,
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
    backgroundColor: 'transparent',
  },
  ul: { margin: '0 0 16px', paddingLeft: '22px' },
  ol: { margin: '0 0 16px', paddingLeft: '22px' },
  li: { margin: '0 0 8px' },
  blockquote: {
    margin: '0 0 16px',
    paddingLeft: '16px',
    borderLeft: '3px solid #d4d4d8',
    color: '#3f3f46',
  },
  code: {
    fontFamily: 'Menlo,Consolas,monospace',
    fontSize: '14px',
    backgroundColor: '#f4f4f5',
    padding: '2px 4px',
    borderRadius: '4px',
  },
} satisfies Record<string, CSSProperties>
