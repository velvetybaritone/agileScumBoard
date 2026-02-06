import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AGILE SCRUM Dashboard',
  description: 'Multi-Tenant AGILE SCRUM Training Dashboard for educational purposes',
  keywords: ['AGILE', 'SCRUM', 'Kanban', 'Project Management', 'Training'],
  authors: [{ name: 'AGILE Training Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
