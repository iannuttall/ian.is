---
name: "Ian.is"
description: "A quiet, direct home for useful work, current data, and first-hand findings."
colors:
  primary: "light-dark(#0066db, #ff6b01)"
  primary-hover: "light-dark(#005bc4, #f05f00)"
  primary-active: "light-dark(#004da8, #d95500)"
  primary-foreground: "light-dark(#ffffff, #1a0b00)"
  canvas: "light-dark(oklch(98.5% 0 0), oklch(20.5% 0 0))"
  raised: "light-dark(oklch(100% 0 0), oklch(24% 0 0))"
  recessed: "light-dark(oklch(96% 0 0), oklch(17% 0 0))"
  ink: "light-dark(oklch(27% 0 0), oklch(90% 0 0))"
  ink-muted: "light-dark(oklch(45% 0 0), oklch(72% 0 0))"
  ink-soft: "light-dark(oklch(60% 0 0), oklch(55% 0 0))"
  hairline: "light-dark(oklch(92% 0 0), oklch(28% 0 0))"
  hairline-strong: "light-dark(oklch(85% 0 0), oklch(38% 0 0))"
  secondary: "light-dark(oklch(96% 0 0), oklch(28% 0 0))"
  secondary-hover: "light-dark(oklch(92% 0 0), oklch(34% 0 0))"
  destructive: "light-dark(oklch(57% 0.22 27), oklch(65% 0.22 27))"
  success: "light-dark(oklch(60% 0.16 145), oklch(70% 0.16 145))"
typography:
  display:
    fontFamily: "Sans, Sans Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 3vw, 2.25rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.7px"
  headline:
    fontFamily: "Sans, Sans Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.4px"
  title:
    fontFamily: "Sans, Sans Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Sans, Sans Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Sans, Sans Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  data:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  xs: "0.25rem"
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.75rem"
  2xl: "0.875rem"
  pill: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  2xl: "2rem"
  3xl: "3rem"
  4xl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-outline:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  input:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.25rem 0.75rem"
    height: "2.25rem"
  select:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0.5rem 2rem 0.5rem 0.75rem"
    height: "2.25rem"
  filter-selected:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.375rem 0.75rem"
  newsletter-card:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "1rem"
---

# Design System: Ian.is

## Overview

**Creative North Star: "The Working Register"**

Ian.is looks like a clear record of real work. It uses quiet neutral surfaces, direct type, small controls, and visible evidence. The result is useful before it is decorative. The design supports focused pages, posts, tools, and dated data without making them look like one generic product dashboard.

The system is compact but not cramped. It uses one centered reading frame, clear type levels, and thin dividers. Light and dark modes follow the operating system. Cards are for contained actions or distinct objects. Long reference data stays in lists or tables.

**Key Characteristics:**

- Neutral light and dark surfaces with one adaptive accent.
- Static Sans for clear reading and JetBrains Mono for data.
- A narrow centered frame with generous outer space.
- Thin borders, compact controls, and restrained depth.
- Direct proof, dates, and source details near the result.

## Colors

The palette is almost neutral. The adaptive accent is blue in light mode and orange in dark mode.

### Primary

- **Signal Accent:** Use for links, main actions, selection, and keyboard focus. Use the hover and active steps only for their named states.
- **Accent Contrast:** Use only for text and icons on the Signal Accent.

### Secondary

- **Quiet Control:** Use for secondary buttons, filter rails, and full-row hover states.
- **Quiet Control Hover:** Use when a secondary control needs a stronger state.

### Neutral

- **Soft Canvas:** The main page background.
- **Raised Paper:** Cards, menus, inputs, selected filters, and other contained surfaces.
- **Recessed Field:** Low-priority backing surfaces and dark-mode depth.
- **Main Ink:** Headings, main labels, and important values.
- **Muted Ink:** Supporting copy, table metadata, and standard labels.
- **Soft Ink:** Placeholders, field labels, small notes, and quiet icons.
- **Hairline:** Default borders, row dividers, and control outlines.
- **Strong Hairline:** Stronger separators when the default line is too quiet.
- **Destructive:** Invalid fields and destructive actions only.
- **Success:** Confirmed success messages only.

### Named Rules

**The One Signal Rule.** Use the adaptive accent for action, focus, or status. Do not use it as broad decoration.

**The System Mode Rule.** Light and dark colors follow the operating system. Do not add a local mode that breaks the shared tokens.

## Typography

**Display Font:** Sans (with a metric-matched Sans Fallback and system sans-serif)

**Body Font:** Sans (with a metric-matched Sans Fallback and system sans-serif)

**Label/Mono Font:** JetBrains Mono (with system monospace fallbacks)

**Character:** Static Sans gives the site a calm and direct voice. JetBrains Mono marks data, code, domains, and exact values without taking over the page.

### Hierarchy

- **Display:** Medium weight with tight tracking. Use for one page heading.
- **Headline:** Medium weight with tight tracking. Use for the main result or proof line below the page heading.
- **Title:** Medium weight. Use for section headings and card headings.
- **Body:** Regular weight with open line spacing. Keep reading text within the shared frame and use narrower measures for long copy.
- **Label:** Medium weight. Use for controls, table headings, and compact metadata. Keep normal case by default.
- **Data:** Medium mono. Use for domains, prices, code, and values that benefit from fixed character widths. Use tabular numbers for aligned numeric columns.

### Named Rules

**The Data Has a Voice Rule.** Use mono type only when the text is data or code. Keep prose and interface labels in Sans.

## Layout

The main content frame is centered and has a maximum width of 48rem. It uses 1.5rem side gutters by default and 2.5rem gutters from 64rem. Most pages use one column. A 40rem breakpoint changes compact mobile structures into wider desktop structures.

Use a 0.25rem base rhythm. Common gaps are 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem, 3rem, and 4rem. Keep the first useful result close to its heading. On data pages, place filters before the table and let the table use the full frame width.

Desktop tables show separate data columns. Mobile tables can hide a secondary column and move its value below the main label. Controls can change from fixed small widths on desktop to equal grid columns on mobile.

**The One Frame Rule.** Align the header, page content, tables, and footer to the same 48rem frame.

## Elevation & Depth

The system is flat by default. It uses surface tone and hairline borders before shadows. Use a low shadow for standard cards and controls. Use the deeper newsletter shadow only for a contained signup action or a similar high-value object. Stacked preview sheets can use stronger shadows to show physical order.

### Shadow Vocabulary

- **Control Lift** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): Selected filters and small controls.
- **Card Lift** (`0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): Standard cards and small product objects.
- **Newsletter Lift** (`0 8px 44px -12px rgba(0, 0, 0, 0.12)`): The standalone newsletter card.

### Named Rules

**The Flat First Rule.** Use a border or a surface change before you add a shadow.

## Shapes

Controls use gently rounded corners, usually 0.5rem or 0.625rem. Small selected filter buttons use 0.375rem. Cards use 0.75rem or 0.875rem. Email fields and their submit buttons can use a full pill shape. Tables do not use an outer card shape; thin horizontal rules define their structure.

**The Shape Follows Containment Rule.** Use larger corners for contained cards and smaller corners for controls. Keep long data structures square and divided.

## Components

### Buttons

- **Shape:** Gently rounded, with a 2.25rem standard height.
- **Primary:** Signal Accent background and Accent Contrast text. Use for the main action in a contained form.
- **Hover / Focus:** Move to the named hover color. Use a 3px translucent focus ring and a Signal Accent border. Keep disabled controls quiet and clearly inactive.
- **Secondary / Ghost:** Use Quiet Control or a transparent surface. Change tone and text color on hover.
- **Outline:** Use Raised Paper with a Hairline border for reset and utility actions. Disable a reset action when all controls have their default values.

### Chips

- **Style:** Put segmented filters on a Quiet Control rail with a thin Hairline ring and 0.25rem padding.
- **State:** The selected item uses Raised Paper, Main Ink, and Control Lift. Unselected items use Muted Ink. Every item keeps a visible keyboard outline.

### Cards / Containers

- **Corner Style:** Use 0.75rem for standard cards and 0.875rem for the standalone newsletter card.
- **Background:** Raised Paper.
- **Shadow Strategy:** Use Card Lift for standard cards and Newsletter Lift for the standalone signup card.
- **Border:** Use a very thin neutral ring. In dark mode, use a quiet white ring.
- **Internal Padding:** Use 1rem in compact cards and 1.5rem to 2rem in standard cards.
- **Visibility:** Keep newsletter cards visible across visits. A stored subscription state must not remove the card from later pages.

### Inputs / Fields

- **Style:** Use Raised Paper, a Hairline border, 0.5rem corners, and a 2.25rem standard height. A newsletter email input can use a 2.75rem pill shape.
- **Focus:** Change the border to Signal Accent and add a 3px translucent ring.
- **Error / Disabled:** Use Destructive for invalid borders and rings. Reduce opacity and block pointer input when disabled.

### Selects

- **Style:** Match standard inputs. Use a native select with a small muted chevron, 0.5rem corners, and a 2.25rem height.
- **Layout:** Use a short label above each select. On mobile, place related selects in equal grid columns. On wider screens, use compact fixed widths.
- **Focus:** Use the same Signal Accent border and 3px ring as inputs.

### Navigation

- **Style:** Use Main Ink, medium Sans, and the shared frame. The menu button is a quiet icon control with no filled rest state.
- **States:** Show a clear Signal Accent focus ring. Use short color and transform transitions. Honor reduced motion.
- **Mobile:** Keep the same header pattern. The full menu opens as a page-height Canvas surface.

### Reference Tables

Use dense, full-width tables with hairline row dividers. Keep headings and metadata in Sans. Use mono for the main data value and numeric values. Make each result row one full-row link when one destination applies to the complete record. Use a Quiet Control fill for hover and focus. Put the keyboard outline inside the row. Keep the result count live when filters change. Put an outline Reset button before a related filter group and disable it at the defaults. Use a distinct `Any` value when no maximum applies; do not use the largest explicit price as a hidden alias for no limit. Sticky headers can use a nearly opaque Canvas with light backdrop blur. On mobile, hide low-priority columns and show a short dated warning near the data.

## Do's and Don'ts

### Do:

- **Do** use the shared light and dark tokens on every new site surface.
- **Do** align primary content to the 48rem frame.
- **Do** show dates, sources, and limits close to time-sensitive results.
- **Do** keep complete reference data visible and easy to scan.
- **Do** use full-row links when one action applies to the complete row.
- **Do** use the same focus treatment for buttons, inputs, selects, filters, and linked rows.
- **Do** keep newsletter signup visible across visits.
- **Do** give multi-control filter bars one clear reset action.

### Don't:

- **Don't** turn a long data set into a card grid.
- **Don't** use cards for ordinary page sections or table rows.
- **Don't** use the accent as broad decoration.
- **Don't** use mono type for normal prose or interface labels.
- **Don't** hide useful data behind newsletter signup.
- **Don't** hide a newsletter card because a visitor subscribed before.
- **Don't** use the largest explicit filter value to mean no limit.
- **Don't** state that dated data is current without a check date and warning.
