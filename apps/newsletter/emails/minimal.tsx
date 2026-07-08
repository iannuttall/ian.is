import { MinimalEmail } from '@email/core'

const bodyMarkdown = `Hey,

This is the minimal React Email template.

It is for short plain-feeling emails where the card treatment would feel too heavy.

[Visit ian.is](https://ian.is)`

export default function MinimalPreview() {
  return (
    <MinimalEmail
      subject="Quick note"
      preview="A short preview for the minimal email shell."
      bodyMarkdown={bodyMarkdown}
      template="react-minimal"
    />
  )
}
