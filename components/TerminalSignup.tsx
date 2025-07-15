'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import Typed from 'typed.js'
import type { LinkItem } from '../utils/fetchSheetData'

const DEFAULT_PROMPT = "get my AI toolkit (from 100+ exits)"

export default function TerminalSignup({ item }: { item: LinkItem }) {
  const [email, setEmail] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const typedRef = useRef(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typedInstance = useRef<Typed | null>(null)
  const [minimalMode, setMinimalMode] = useState(false)

  useEffect(() => {
    setMinimalMode(process.env.NEXT_PUBLIC_MINIMAL_MODE === 'true')
  }, [])

  const prompt = DEFAULT_PROMPT

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
    
    if (!email.trim()) return
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      if (response.ok) {
        setEmail('')
        setIsTyping(true)
      } else {
        // Handle error - could add error state here
        console.error('Subscription failed')
      }
    } catch (error) {
      console.error('Error subscribing:', error)
    }
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
    <Card className={`w-full border-2 ${!minimalMode ? "bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600" : "border-slate-200 dark:border-slate-700"}`}>
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Get My AI Tool Stack
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tools that actually work (from 100+ exits)
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md p-3 font-mono text-sm">
          <span className="mr-2 text-slate-500 dark:text-slate-400">→</span>
          <div className="flex-grow">
            {isTyping ? (
              <span ref={typedRef} className="text-slate-700 dark:text-slate-300"></span>
            ) : (
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                placeholder={prompt}
                required
              />
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}