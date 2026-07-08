import { IssueEmail } from '@email/core'

const bodyMarkdown = `::: header color="#E999BE" title="Welcome to Issue 1!" online-url="https://ian.is" logo-base="/static"
:::

::: lead
Welcome to the first issue of the new-look list. I have been quietly rebuilding the whole email stack – my own sending pipeline, my own tracking, my own templates – so this newsletter can live on [ian.is](https://ian.is) and land in your inbox looking exactly how I want it to.
:::

This issue is a demo of every section type the template supports: sponsor boxes, link roundups, colored callouts, classifieds, and big highlighted quotes. Mix and match one, five, or a dozen of them per issue.

::: sponsor image="/static/demo-sponsor.png" image-alt="Acme logo"
Created by a team of experienced finance professionals and career journalists, [**Acme Brief**](https://ian.is) is your direct line to no-nonsense, unbiased coverage. ==Readers of Ian's List get 20% off== their first year. [Join thousands of daily readers](https://ian.is) and stay ahead of the market.

This sponsor slot was paid for by a reader.
:::

::: links title="Apps & Sites" color="teal"
[Passport Index](https://www.passportindex.org)
Explore the power of passports

The Passport Index ranks each passport by a 'mobility score', i.e. how much it allows holders to travel the world. For example, [compare two passports](https://www.passportindex.org) and see the different levels of freedom of movement each affords.
---
[Reproof](https://reproof.app)
Collaborative writing app

Based on the feature list on their current website, it looks like a great app to work collaboratively on long text. I like that it uses an AI helper not as a full ghost writer, but as a smart assistant that proofreads text or creates an outline to work from.
---
[Paku](https://paku.app)
Air quality monitor

As our planet warms, understanding and responding to the air quality index (AQI) will become more important. Paku (for iOS and macOS) lets you configure alerts for specific sensors nearby and get real-time push notifications when the air quality exceeds your threshold.
---
[The Open Brain Project](https://openbrainproject.org)
Explore the human brain

If you're curious about the different parts of the human brain, this 3D visualisation is a fun, interactive way to learn more. The project is designed "to serve as a hub to facilitate research into brain injury".
:::

::: box title="Worthy Five: Jane Maker" color="pink" image="/static/demo-portrait.png" image-alt="Portrait of Jane Maker" caption="Five recommendations by builder and writer [Jane Maker](https://ian.is)"
**A phrase worth knowing:**

'We all have a story to tell – the denial of that story can cause despair.' The more I write and build, the more clarity it gives me on my own history and understanding of what people actually need.

**An activity worth doing:**

Publishing something small every single week. It can undermine the perfectionism that seeks to stop you, and when it works, it is a very special kind of alchemy.

**A book worth reading:**

*Our Souls at Night* by Kent Haruf speaks eloquently and succinctly about the need for human connection at any age. (Don't watch the movie!)
:::

::: text title="Food for Thought" color="orange"
Dutch people cycle an average of [2.6 km each per day](https://ian.is). If this pattern was replicated worldwide, annual global carbon emissions would drop by 686 million tonnes – more than the entire footprint of most countries.

> Diets have become globally less diverse, but locally more diverse. There is a lot more to choose from in your local supermarket, but it's the same range of choices as in the local supermarket 5000 miles away.
:::

::: quote
"Diets have become globally less diverse, but locally more diverse. There is a lot more to choose from in your local supermarket, but it's the same range of choices as in the local supermarket 5000 miles away."
:::

::: poll question="What's your primary search engine?" color="yellow" results-url="https://ian.is"
[Google](https://ian.is)
---
[DuckDuckGo](https://ian.is)
---
[Kagi](https://ian.is)
---
[An AI tool](https://ian.is)
---
[Other](https://ian.is)
:::

::: box title="The Week in a GIF" color="green" image="/static/demo-hero.png" image-alt="A fun gif" image-side="right"
Reply or [tweet at me](https://ian.is) if you have a GIF that sums up your week. The best one gets featured here, with credit, forever.
:::

::: classifieds title="Classifieds" note="Classifieds are paid ads that support this newsletter and are seen by every subscriber each week." button="Book yours →" button-url="https://ian.is"
A newsletter full of hope, action and uniquely human insights – [**Humankind Works**](https://ian.is)' mission is to redefine work and the way we connect to our purpose and to each other.
---
[**Creative Wayfinding**](https://ian.is) is a weekly newsletter exploring how to find your way to your creative potential in a world filled with noise, distractions, and shiny objects.
---
[**Freelancer Magazine**](https://ian.is) is an independent print magazine read by thousands of B2B and creative freelancers around the world.
---
[**Mave**](https://ian.is) is an EU-hosted, privacy friendly alternative to Vimeo, YouTube and Wistia.
:::

::: footer archive-url="https://ian.is"
**Ian's List** is a weekly-ish email about building useful things on the internet, written by [Ian Nuttall](https://ian.is). Thanks for reading all the way to the end.

If someone forwarded this to you, you can [subscribe here](https://ian.is).
:::`

export default function IssuePreview() {
  return (
    <IssueEmail
      subject="Issue 1: The new-look list"
      preview="A full demo of the modular issue template."
      bodyMarkdown={bodyMarkdown}
      template="react-issue"
    />
  )
}
