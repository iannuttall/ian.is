'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import Typed from 'typed.js'
import type { LinkItem } from '../utils/fetchSheetData'

const DEFAULT_PROMPT = "type email and hit enter to join ian's list"

export default function TerminalSignup({ item }: { item: LinkItem }) {
  const [email, setEmail] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const typedRef = useRef(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typedInstance = useRef<Typed | null>(null)

  const prompt = item.title || DEFAULT_PROMPT

  useEffect(() => {
    if (isTyping && typedRef.current && !typedInstance.current) {
      typedInstance.current = new Typed(typedRef.current, {
        strings: [prompt],
        typeSpeed: 40,
        backSpeed: 20,
        loop: true,
        loopCount: Infinity,
        backDelay: 5000,
        startDelay: 1000,
      })
    }

    return () => {
      if (typedInstance.current) {
        typedInstance.current.destroy()
        typedInstance.current = null
      }
    }
  }, [isTyping, prompt])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter signup logic
    setEmail('')
    setIsTyping(true)
  }

  const handleFocus = () => {
    setIsTyping(false)
    if (typedInstance.current) {
      typedInstance.current.destroy()
      typedInstance.current = null
    }
  }

  const handleBlur = () => {
    if (email === '') {
      setIsTyping(true)
    }
  }

  return (
    <Card className="w-full bg-black text-green-500">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="mr-2">$</span>
          <div className="flex-grow">
            {isTyping ? (
              <span ref={typedRef}></span>
            ) : (
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-full bg-transparent outline-none text-green-500"
                placeholder={prompt}
              />
            )}
          </div>
        </form>
        {item.description && (
          <p className="mt-2 text-sm text-green-400 opacity-70">
            {item.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}