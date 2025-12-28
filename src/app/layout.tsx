import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Planilha ARB - Gerenciamento de Surebets',
  description: 'Gerenciamento profissional de operações de surebet e freebets. Controle total sobre sua lucratividade com interface moderna e intuitiva.',
  keywords: 'surebet, arbitragem, apostas esportivas, freebets, planilha, ROI, gestão financeira, punter',
  authors: [{ name: 'Planilha ARB' }],
  creator: 'Planilha ARB',
  publisher: 'Planilha ARB',
  applicationName: 'Planilha ARB',
  generator: 'Next.js',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#8B5CF6',
  colorScheme: 'dark',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Planilha ARB'
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Planilha ARB - Gerenciamento de Surebets',
    description: 'Gerenciamento profissional de operações de surebet e freebets',
    siteName: 'Planilha ARB',
    images: [
      {
        url: '/logo.svg',
        width: 120,
        height: 120,
        alt: 'Planilha ARB Logo'
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'Planilha ARB - Gerenciamento de Surebets',
    description: 'Gerenciamento profissional de operações de surebet e freebets',
    images: ['/logo.svg']
  },
  robots: {
    index: false,
    follow: false
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Planilha ARB" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}