import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from "@/components/auth/UserContext";

export const metadata: Metadata = {
  title: 'Ark CRM',
  description: 'Build by Arkmedis team',
  // generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <UserProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </UserProvider>
  )
}
