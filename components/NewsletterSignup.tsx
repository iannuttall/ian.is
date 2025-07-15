'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import type { LinkItem } from '../utils/fetchSheetData'
import { motion, AnimatePresence } from 'framer-motion'


export default function NewsletterSignup({ item }: { item: LinkItem }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const formRef = useRef<HTMLFormElement>(null)
  const successAudioRef = useRef<HTMLAudioElement | null>(null)
  const failAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    successAudioRef.current = new Audio('/audio/success.mp3')
    failAudioRef.current = new Audio('/audio/fail.mp3')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStatus('success')
        setMessage('Successfully subscribed!')
        setEmail('')
        successAudioRef.current?.play()
      } else {
        const data = await response.json()
        setStatus('error')
        setMessage(data.error || 'Failed to subscribe. Please try again.')
        failAudioRef.current?.play()
      }
    } catch {
      setStatus('error')
      setMessage('An error occurred. Please try again.')
      failAudioRef.current?.play()
    }

    setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 3000)
  }

  return (
    <Card className="w-full border-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
      <CardContent className="p-6 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-2 text-center text-slate-800 dark:text-slate-200">
          {item.title || "Get My AI Tool Stack"}
        </h2>
        {item.description && (
          <p className="mb-4 text-sm text-center text-slate-600 dark:text-slate-400">
            {item.description}
          </p>
        )}
        <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-sm relative">
          <div className="relative">
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400"
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
              placeholder="your email → get tools that actually work"
              className="w-full pl-10 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-mono"
              disabled={status === 'loading'}
              required
            />
            <AnimatePresence>
              {status === 'loading' && (
                <motion.div
                  className="absolute right-3 top-0 bottom-0 flex items-center justify-center w-5"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.svg
                    className="h-5 w-5 text-slate-500 dark:text-slate-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </motion.svg>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {(status === 'success' || status === 'error') && (
              <motion.div
                className={`absolute inset-0 flex items-center justify-center rounded-md overflow-hidden ${
                  status === 'success' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                exit={{ width: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              >
                <p className="text-sm font-medium whitespace-nowrap">{message}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </CardContent>
    </Card>
  )
}