'use client'

import { useState, useEffect } from 'react'
import { fetchSheetData } from '../utils/fetchSheetData'
import LinkItem from '../components/LinkItem'
import TerminalSignup from '../components/TerminalSignup'
import NewsletterSignup from '../components/NewsletterSignup'
import type { LinkItem as LinkItemType } from '../utils/fetchSheetData'
import { motion } from "framer-motion"

export default function Home() {
  const [links, setLinks] = useState<LinkItemType[]>([])
  const [projects, setProjects] = useState<LinkItemType[]>([])
  const [newsletterItem, setNewsletterItem] = useState<LinkItemType | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const fetchLinks = async () => {
      const fetchedLinks = await fetchSheetData()
      const newsletter = fetchedLinks.find(link => link.type.toLowerCase() === 'newsletter' || link.type.toLowerCase() === 'terminal')
      const projectLinks = fetchedLinks.filter(link => link.type.toLowerCase() === 'project')
      const otherLinks = fetchedLinks.filter(link => 
        link.type.toLowerCase() !== 'newsletter' && 
        link.type.toLowerCase() !== 'terminal' &&
        link.type.toLowerCase() !== 'project' &&
        link.title // Ensure there's a title (username for social media)
      )
      setNewsletterItem(newsletter || null)
      setLinks(otherLinks)
      setProjects(projectLinks)
      setIsLoaded(true)
    }

    fetchLinks()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-white dark:bg-gradient-to-tl dark:from-[#152331] dark:to-black text-black dark:text-white">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-4xl font-bold text-center">ian nuttall</h1>
        <p className="text-sm text-muted-foreground text-center">
        tldr; serial internet biz builder, 100+ exits. always learning. usually from my mistakes.
        </p>
        <div className="space-y-4 mt-8">
          {isLoaded && newsletterItem && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {newsletterItem.type.toLowerCase() === 'terminal' ? (
                <TerminalSignup item={newsletterItem} />
              ) : (
                <NewsletterSignup item={newsletterItem} />
              )}
            </motion.div>
          )}
          {links.map((link, index) => (
            <LinkItem key={index} item={link} index={index} />
          ))}
          {projects.length > 0 && (
            <>
            <div className="inline-flex items-center justify-center w-full">
                <hr className="w-full h-px my-4 bg-zinc-200 border-0 dark:bg-zinc-700" />
                <span className="absolute px-3 font-medium text-xs text-muted-foreground -translate-x-1/2 bg-white dark:bg-black left-1/2 ">
                projects
                </span>
            </div>
              {projects.map((project, index) => (
                <LinkItem key={`project-${index}`} item={project} index={index} />
              ))}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
