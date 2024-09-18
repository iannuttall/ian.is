'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { LinkItem } from '../utils/fetchSheetData'

export default function NewsletterSignup({ item }: { item: LinkItem }) {
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter signup logic
    console.log('Signing up:', email)
    // Reset form after submission
    setEmail('')
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4 flex flex-col items-center">
        <h2 className="text-lg font-medium mb-1 text-center">{item.title}</h2>
        {item.description && (
          <p className="mb-3 text-xs text-muted-foreground text-center">
            {item.description}
          </p>
        )}
        <form onSubmit={handleSubmit} className="w-11/12 max-w-sm">
          <div className="relative">
            <svg
              className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
              <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
            </svg>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="type your email and hit enter to join"
              className="w-full pl-10"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}