# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Ian's readers are curious builders, marketers, founders, and developers who
follow his work through the site, social posts, and email newsletter. They come
for useful things Ian has found, tested, or built.

## Product Purpose

Ian.is is Ian Nuttall's public home on the web. It explains what he builds,
publishes useful work, and gives readers a direct way to join Ian's List.
Success means a visitor finds something worth using or sharing and trusts Ian
enough to read the next thing.

## Positioning

The site is based on Ian's real work. Pages use working tools, current data,
and first-hand findings instead of generic personal-brand claims.

## Operating Context

The site includes projects, posts, newsletter issues, tools, and focused public
resources. Some resources are dated snapshots whose value is immediate rather
than evergreen.

## Capabilities and Constraints

- The public site is an Astro 7 app on a Cloudflare Worker.
- Static pages use prerendering. Newsletter signup goes through the existing
  same-origin subscription route.
- The site must stay fast, accessible, responsive, and useful without client
  JavaScript where practical.
- Time-sensitive data must show when it was checked and must not imply that it
  remains current forever.

## Brand Commitments

Copy is clear, direct, personal, and based on real work. New pages use the
existing Ian.is type, color, spacing, dark mode, navigation, and newsletter
components unless Ian asks for a wider redesign.

## Evidence on Hand

The repo contains live project pages, posts, issue archives, a working
newsletter form, and generated Open Graph and agent-readable page output.

## Product Principles

- Publish the useful thing in full.
- Show the source, date, or method when trust depends on it.
- Make subscription a natural next step, not a gate.
- Keep one focused job on each page.
