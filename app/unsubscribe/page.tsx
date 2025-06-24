'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const uuid = searchParams?.get('uuid') || null
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!uuid) {
      setStatus('error')
      setError('Invalid unsubscribe link')
      return
    }

    // Call the API to unsubscribe
    fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatus('error')
          setError(data.error)
        } else {
          setStatus('success')
        }
      })
      .catch(() => {
        setStatus('error')
        setError('Failed to process unsubscribe request')
      })
  }, [uuid])

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#FAFAFA]">
      <div className="w-full max-w-[550px]">
        <div className="bg-white border border-gray-200 rounded-xl p-6" style={{ fontFamily: '"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif' }}>
          <div className="text-center">
            <img 
              alt="ian's list" 
              src="https://mail.ian.is/uploads/ianslist.png"
              className="w-[170px] max-w-full mx-auto"
            />
          </div>

          <div className="text-center" style={{ fontSize: '15px', color: '#353535' }}>
            {status === 'loading' && <p>processing your request...</p>}
            {status === 'success' && <p>you&apos;ve been removed from ian&apos;s list.</p>}
            {status === 'error' && <p>Error: {error}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#FAFAFA]">
        <div className="w-full max-w-[550px]">
          <div className="bg-white border border-gray-200 rounded-xl p-6" style={{ fontFamily: '"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif' }}>
            <div className="text-center">
              <img 
                alt="ian's list" 
                src="https://mail.ian.is/uploads/ianslist.png"
                className="w-[170px] max-w-full mx-auto"
              />
            </div>
            <div className="text-center" style={{ fontSize: '15px', color: '#353535' }}>
              <p>processing your request...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}