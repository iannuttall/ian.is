'use client'

import { useState, useEffect } from 'react'
import { fetchSheetData } from '../utils/fetchSheetData'
import LinkItem from '../components/LinkItem'
import TerminalSignup from '../components/TerminalSignup'
import NewsletterSignup from '../components/NewsletterSignup'
import type { LinkItem as LinkItemType } from '../utils/fetchSheetData'

export default function Home() {
  const [links, setLinks] = useState<LinkItemType[]>([])
  const [newsletterItem, setNewsletterItem] = useState<LinkItemType | null>(null)

  useEffect(() => {
    const fetchLinks = async () => {
      const fetchedLinks = await fetchSheetData()
      const newsletter = fetchedLinks.find(link => link.type.toLowerCase() === 'newsletter' || link.type.toLowerCase() === 'terminal')
      const otherLinks = fetchedLinks.filter(link => link.type.toLowerCase() !== 'newsletter' && link.type.toLowerCase() !== 'terminal')
      setNewsletterItem(newsletter || null)
      setLinks(otherLinks)
    }

    fetchLinks()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-white dark:bg-black text-black dark:text-white">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-4xl font-bold mb-8 text-center">My Link in Bio</h1>
        {newsletterItem && newsletterItem.type.toLowerCase() === 'terminal' ? (
          <TerminalSignup item={newsletterItem} />
        ) : newsletterItem ? (
          <NewsletterSignup item={newsletterItem} />
        ) : null}
        {links.map((link, index) => (
          <LinkItem key={index} item={link} />
        ))}
      </div>
    </main>
  )
}
