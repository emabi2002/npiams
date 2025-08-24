import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/navigation'
import { Toaster } from "sonner"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NPI PNG - Student Registration System',
  description: 'Online Student Registration System for National Polytechnic Institute of Papua New Guinea',
  keywords: 'NPI PNG, Student Registration, TVET, Technical Education, Papua New Guinea',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="pt-16">
            {children}
          </main>
          <Toaster position="top-right" />
        </div>
      </body>
    </html>
  )
}
