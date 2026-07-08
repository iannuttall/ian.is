# Alpine patterns

This site uses Alpine for small bits of interaction that should not become
React islands.

## Current rule

Use named Alpine controllers registered in `apps/site/src/scripts/alpine.ts`.
Keep controller implementations in `apps/site/src/scripts/alpine/`.

Good:

```html
<section x-data="newsletterShell">
```

```ts
Alpine.data("newsletterShell", () => ({
  subscribed: false,
  init() {
    this.subscribed = hasSubscribed();
  },
}));
```

Avoid putting meaningful state in inline object expressions:

```html
<section x-data="{ subscribed: false }">
```

That shape looked fine in markup but did not initialize reliably in this app
setup. The result was subtle: the newsletter component hid itself correctly, but
the parent homepage shell kept the wrong border and spacing classes.

## Why this matters

The site will probably use Alpine for more small interactions:

- Newsletter state.
- Menu state.
- Filters and URL state on static pages.
- Tiny progressive-enhancement controls.
- Future support/member UI that should not require a React island.

Those interactions need one predictable pattern so agents do not keep inventing
new Alpine shapes.

## Preferred shape

- Keep `apps/site/src/scripts/alpine.ts` as the small entrypoint.
- Put reusable state in focused files under `apps/site/src/scripts/alpine/`.
- Keep storage keys in one place.
- Use `Alpine.store(...)` for state shared across components.
- Use `Alpine.data(...)` for component-local behavior.
- Keep Astro markup mostly declarative.
- Keep inline expressions to simple reads, class bindings, and event calls.

Example:

```html
<button x-data="menuToggle" x-on:click="toggle" x-bind:aria-expanded="open">
```

## Newsletter state

Newsletter files currently split like this:

```txt
apps/site/src/scripts/alpine.ts              Alpine entrypoint
apps/site/src/scripts/alpine/newsletter.ts   Newsletter controllers
apps/site/src/scripts/alpine/menu.ts         Menu controllers
apps/site/src/scripts/alpine/storage.ts      localStorage helpers
apps/site/src/scripts/alpine/confetti.ts     Confetti effect
apps/site/src/scripts/alpine/types.ts        Shared Alpine type
```

The newsletter currently stores a successful signup in:

```txt
ian.newsletter.subscribed
```

That value is read by:

- `newsletterSignup`, to hide future newsletter cards.
- `newsletterShell`, to keep the homepage layout balanced when the card is
  hidden.

If this grows, move newsletter state to an `Alpine.store("newsletter", ...)`
object so every component reads the same source.

## Things to improve later

- Add a small helper for localStorage reads and writes.
- Add a documented URL-state helper for filters.
- Decide whether Alpine should own all static-page interactivity.
- Keep Alpine for tiny enhancements and use islands only when the UI becomes a
  real app surface.
