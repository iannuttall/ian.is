import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import type { LinkItem as LinkItemType } from '../utils/fetchSheetData'

export default function LinkItem({ item }: { item: LinkItemType }) {
  const IconComponent = getIconComponent(item.type, item.logo)
  const title = getFormattedTitle(item.type, item.title)
  const { bgColorClass, borderColorClass, hoverBorderClass, textColorClass } = getColorClasses(item.type)

  return (
    <Link href={getFormattedUrl(item.type, item.url)} className="block" target="_blank" rel="noopener noreferrer">
      <Card className={`transition-colors ${bgColorClass} ${borderColorClass} ${hoverBorderClass}`}>
        <CardContent className="flex items-center p-4">
          <div className="flex-shrink-0 mr-4">
            <IconComponent />
          </div>
          <div className="flex-grow min-w-0">
            <h2 className={`text-lg font-medium truncate lowercase ${textColorClass}`}>{title}</h2>
            {item.description && <p className={`text-xs truncate ${textColorClass} opacity-80`}>{item.description}</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function getFormattedTitle(type: string, title: string) {
  switch (type.toLowerCase()) {
    case 'x':
      return `Follow @${title}`
    case 'youtube':
      return `Subscribe to my YouTube`
    case 'linkedin':
      return `Connect on LinkedIn`
    default:
      return title
  }
}

function getFormattedUrl(type: string, url: string) {
  switch (type.toLowerCase()) {
    case 'youtube':
      return 'https://www.youtube.com/@ianslist' // Replace with your actual YouTube channel URL
    default:
      return url
  }
}

function getColorClasses(type: string): { bgColorClass: string; borderColorClass: string; hoverBorderClass: string; textColorClass: string } {
  switch (type.toLowerCase()) {
    case 'youtube':
      return {
        bgColorClass: 'bg-red-50 dark:bg-red-900/50',
        borderColorClass: 'border-red-200 dark:border-red-800',
        hoverBorderClass: 'hover:border-red-400 dark:hover:border-red-600',
        textColorClass: 'text-red-900 dark:text-red-100'
      }
    case 'x':
      return {
        bgColorClass: 'bg-zinc-50 dark:bg-zinc-900',
        borderColorClass: 'border-zinc-200 dark:border-zinc-700',
        hoverBorderClass: 'hover:border-zinc-500 dark:hover:border-zinc-400',
        textColorClass: 'text-zinc-900 dark:text-zinc-100'
      }
    case 'linkedin':
      return {
        bgColorClass: 'bg-blue-50 dark:bg-blue-900/50',
        borderColorClass: 'border-blue-200 dark:border-blue-800',
        hoverBorderClass: 'hover:border-blue-400 dark:hover:border-blue-600',
        textColorClass: 'text-blue-900 dark:text-blue-100'
      }
    default:
      return {
        bgColorClass: 'bg-white dark:bg-gray-800',
        borderColorClass: 'border-gray-200 dark:border-gray-700',
        hoverBorderClass: 'hover:border-gray-400 dark:hover:border-gray-600',
        textColorClass: 'text-gray-900 dark:text-gray-100'
      }
  }
}

function getIconComponent(type: string, logo?: string) {
  if (logo) {
    return function CustomIcon() {
      return <div dangerouslySetInnerHTML={{ __html: logo }} className="w-5 h-5" />
    }
  }

  switch (type.toLowerCase()) {
    case 'x':
      return XIcon
    case 'youtube':
      return YouTubeIcon
    case 'linkedin':
      return LinkedInIcon
    default:
      return GenericIcon
  }
}

function XIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg
      className="w-5 h-5 text-red-600 dark:text-red-400"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg
      className="w-5 h-5 text-blue-600 dark:text-blue-400"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function GenericIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}