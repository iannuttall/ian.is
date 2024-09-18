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
    <Card className="w-full" style={{ background: 'linear-gradient(to top left, #152331, #000000)' }}>
      <CardContent className="p-4 flex flex-col items-center">
        <h2 className="text-lg font-medium mb-1 text-center text-[#00ff00]">{item.title}</h2>
        {item.description && (
          <p className="mb-3 text-xs text-[#00cc00] text-center">
            {item.description}
          </p>
        )}
        <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-sm relative">
          <div className="relative">
            <svg
              className="w-5 h-5 text-[#00ff00] absolute left-3 top-1/2 transform -translate-y-1/2"
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
              className="w-full pl-10 text-sm bg-black border-[#00ff00] text-[#00ff00] placeholder:text-[#00aa00]"
              disabled={status === 'loading'}
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
                    className="h-5 w-5 text-[#00ff00]"
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
                className={`absolute inset-0 flex items-center justify-center ${
                  status === 'success' ? 'bg-[#00aa00]' : 'bg-[#aa0000]'
                } text-[#00ff00] rounded-md overflow-hidden`}
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