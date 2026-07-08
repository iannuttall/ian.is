import { NewsletterEmail } from '@email/core'

const bodyMarkdown = `Hey there,

This is a local preview for the newsletter template.

The whole point here is to test the real Markdown-to-React Email path before sending anything.

- It should keep the same card shape as the public site
- It should use Inter with Helvetica, Arial, sans-serif fallbacks
- It should still render links like [this example](https://ian.is)

You should also see an unsubscribe link in the footer.`

export default function NewsletterPreview() {
  return (
    <NewsletterEmail
      subject="I built a new thing"
      preview="What I learned this week actually using AI to run my business."
      bodyMarkdown={bodyMarkdown}
      template="react-newsletter"
    />
  )
}
