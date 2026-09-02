---
title: "The kind of AI tools worth building"
description: "A short note on building small, sharp AI tools that do one job well."
pubDate: 2026-06-24
tags: ["ai", "tools"]
draft: true
---

Most of the AI tools I see launched are big. A chat window, a sidebar, a pricing page with four tiers, and a promise to change how you work. Most of the ones I actually use are tiny.

Here is what I have noticed after building a few of each.

## Small tools get used

A tool that does one thing has a short path from problem to result. I open it, it does the thing, I close it. There is nothing to learn and nothing to configure.

My menu bar app that keeps the Mac awake while an agent runs is a good example. It has one button. People use it every day. I have never had a support email about it.

## The model is not the product

The interesting part of a small AI tool is rarely the model call. It is the bit around it:

1. Getting the input into a shape the model can use.
2. Checking the output before it touches anything real.
3. Making the result easy to undo.

If you get those three right, you can swap the model later and nobody notices. If you get them wrong, no model will save you.

## Agents change the shape

When an agent is the user, the tool needs a different surface. A command line flag beats a settings screen. JSON output beats a pretty table. A clear error message beats a helpful one.

```sh
caffeine for 2h
caffeine status --json
```

I now build the CLI first and the window second. The window is for me. The CLI is for the agent, and the agent runs it far more often than I do.

## What I am avoiding

- Anything that needs an account before it is useful.
- Anything that stores data I would not want to explain in a breach email.
- Anything that only works if a third party stays in business.

None of this is new advice. It is just easier to follow when the tool is small enough to hold in your head.
