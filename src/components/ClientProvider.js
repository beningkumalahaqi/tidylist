'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export default function ClientProvider({ children }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        {children}
      </div>
      <Toaster position="top-right" />
    </SessionProvider>
  )
}
