import { Inter } from 'next/font/google'
import ClientProvider from '../components/ClientProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TidyList - Minimalist Time-Tracking To-Do',
  description: 'A minimalist time-tracking to-do web application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  )
}
