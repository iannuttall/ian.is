import { NoteEmail } from '@email/core'

const bodyMarkdown = `This is the text-only layout: no hero image and no primary call-to-action. Use it for concise product notes, receipts, account updates, and other plain-language emails where the message should stay front and center.

It can still render links like [this example](https://ian.is), and now it can also mix in any of the modular issue sections when a campaign needs them.

::: sponsor title="A Word From a Sponsor" image="/static/demo-sponsor.png" image-alt="Acme logo"
[**Acme Brief**](https://ian.is) is your direct line to no-nonsense, unbiased coverage. With clarity over clickbait, it helps you stay informed in under 5 minutes.
:::

::: links title="Worth a Click"
[Passport Index](https://www.passportindex.org)
Explore the power of passports

Ranks each passport by a 'mobility score', i.e. how much it allows holders to travel the world.
---
[Paku](https://paku.app)
Air quality monitor

Configure alerts for nearby sensors and get push notifications when air quality exceeds your threshold.
:::

Sections are optional. Skip them all and a note stays exactly as minimal as before.

::: classifieds title="Classifieds" note="Small ads that keep this list running." button="Book yours →" button-url="https://ian.is"
[**Humankind Works**](https://ian.is) is redefining work and the way we connect to our purpose.
---
[**Mave**](https://ian.is) is an EU-hosted, privacy friendly alternative to Vimeo and YouTube.
:::`

export default function NotePreview() {
  return (
    <NoteEmail
      subject="A quick note"
      preview="A note from Ian's List"
      bodyMarkdown={bodyMarkdown}
      template="react-note"
    />
  )
}
