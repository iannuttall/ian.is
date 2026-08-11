import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DefaultEmail } from '@email/core'
import { parseWelcomeEmailContent } from '@email/core/welcome-content'

const contentPath = join(process.cwd(), 'emails', 'welcome.md')
export const welcomeEmail = parseWelcomeEmailContent(readFileSync(contentPath, 'utf8'))

export default function WelcomeEmailPreview() {
  return (
    <DefaultEmail
      subject={welcomeEmail.subject}
      preview={welcomeEmail.preview}
      template={welcomeEmail.template}
      bodyMarkdown={welcomeEmail.bodyMarkdown}
    />
  )
}
